"""Measure a front-on rack photo and register it for an aisle section.

usage: python -I scripts/rack-photo.py <photo.png> <hall/section> [--shelves N] [--no-write] [--overlay out.png]

Saves public/racks/<hall>-<section>.jpg, finds the oak frame and the shelf edges,
samples the oak and shelf colours, and writes the entry into src/data/rackPhotos.gen.ts.
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
flags = sys.argv[1:]
src, key = Path(args[0]), args[1]
want = int(flags[flags.index('--shelves') + 1]) if '--shelves' in flags else None
hall, section = key.split('/')
name = f'{hall}-{section}.jpg'

im = Image.open(src).convert('RGB')
if im.width > 1024:
    im = im.resize((1024, round(im.height * 1024 / im.width)), Image.LANCZOS)
w, h = im.size
L = im.convert('L')
px = L.load()


def hexc(box):
    c = im.crop(box).resize((1, 1), Image.BOX).getpixel((0, 0))
    return '#%02X%02X%02X' % c


# frame: the oak edge is a bright, even strip at each side; it ends where the shadow inside begins
def edge(cols):
    vals = [sum(px[x, y] for y in range(h // 5, h * 4 // 5, 3)) / len(range(h // 5, h * 4 // 5, 3)) for x in cols]
    ref = sum(vals[:3]) / 3
    for i, v in enumerate(vals):
        if v < ref - 35:
            return i
    return 0


fl = min(edge(range(0, 60)), 48)
fr = min(edge(range(w - 1, w - 61, -1)), 48)

# shelf edges: rows that are bright and even across the inner width
xs = range(max(fl, 20) + 20, w - max(fr, 20) - 20, 3)
stats = []
for y in range(h):
    v = [px[x, y] for x in xs]
    m = sum(v) / len(v)
    sd = (sum((a - m) ** 2 for a in v) / len(v)) ** 0.5
    stats.append((m, sd))
def detect(mmin, sdmax):
    ok = [m > mmin and sd < sdmax for m, sd in stats]
    bands, s = [], None
    for y in range(h + 1):
        b = y < h and ok[y]
        if b and s is None:
            s = y
        if not b and s is not None:
            if y - s >= 5:
                bands.append([s, y - 1])
            s = None
    # merge bands split by a thin line (the shelf top and its front edge)
    merged = []
    for b in bands:
        if merged and b[0] - merged[-1][1] <= 8:
            merged[-1][1] = b[1]
        else:
            merged.append(b)
    return merged, [b for b in merged if 10 <= b[1] - b[0] <= 70 and b[0] > h * 0.06]


# relax the thresholds until the number of shelves asked for is found
for mmin, sdmax in [(170, 22), (165, 28), (160, 34), (150, 40), (140, 48)]:
    merged, lips = detect(mmin, sdmax)
    if want is None or len(lips) >= want:
        break
# the top rail: a bright band touching the top of the picture
ft = merged[0][1] + 1 if merged and merged[0][0] <= 4 and merged[0][1] < h * 0.06 else 0


if '--profile' in flags:  # brightness down the middle, to measure shelves by hand
    print(' '.join(f'{y}:{round(stats[y][0])}' for y in range(0, h, 4) if stats[y][0] > 185))
if want is not None and len(lips) > want:
    lips = sorted(sorted(lips, key=lambda b: b[1] - b[0], reverse=True)[:want])
# a lip at the very bottom runs to the edge of the picture
if lips and h - lips[-1][1] < 12:
    lips[-1][1] = h
else:
    lips = [[a, b + 1] for a, b in lips]
# the even band stops a few pixels short of the edge's highlight and shadow line
lips = [[max(0, a - 4), b if b == h else min(h, b + 3)] for a, b in lips]

if '--lips' in flags:  # measured by hand when the photo fools the detector
    lips = [[int(v) for v in pair.split(',')] for pair in flags[flags.index('--lips') + 1].split(';')]

oak = hexc((0, h // 4, max(fl - 2, 6), h * 3 // 4)) if fl >= 6 else '#E3C39A'
shelf = hexc((w // 4, lips[0][0] + 6, w * 3 // 4, lips[0][0] + 10)) if lips else '#EEE6DA'
print('shelves found', len(lips), 'asked', want, file=sys.stderr)
entry = {'src': f'/racks/{name}', 'w': w, 'h': h, 'frame': [fl, fr, ft], 'lips': lips, 'oak': oak, 'shelf': shelf}
print(json.dumps(entry))

if '--overlay' in flags:
    ov = im.copy()
    d = ImageDraw.Draw(ov)
    for a, b in lips:
        d.rectangle([0, a, w - 1, b], outline=(255, 0, 255), width=3)
    d.line([fl, 0, fl, h], fill=(0, 200, 255), width=3)
    d.line([w - fr, 0, w - fr, h], fill=(0, 200, 255), width=3)
    if ft:
        d.line([0, ft, w, ft], fill=(0, 200, 255), width=3)
    ov.resize((w // 2, h // 2)).save(flags[flags.index('--overlay') + 1])

if '--no-write' not in flags:
    im.save(ROOT / 'racks-src' / name, quality=86, optimize=True)  # scripts/rack-3d.py turns it into the shipped webp
    gen = ROOT / 'src' / 'data' / 'rackPhotos.gen.ts'
    t = gen.read_text(encoding='utf8')
    line = f"  '{key}': {json.dumps(entry)},\n"
    t = re.sub(rf"  '{re.escape(key)}': .*\n", '', t)
    t = t.replace('export const GEN: Record<string, RackPhoto> = {\n', 'export const GEN: Record<string, RackPhoto> = {\n' + line)
    gen.write_text(t, encoding='utf8')
    print('wrote', name)
