"""Cut every product out of the rack photos so the mall can build it as a 3D pack.

usage: python -I scripts/rack-3d.py [hall/section ...] [--sheet out.png] [--dry]

For each photo registered in src/data/rackPhotos.gen.ts:
  * estimates the back panel colour of every shelf row,
  * finds each item standing in the row (columns, then stacked items within a column),
  * marks whether it is solid (box) or shaped (bottle, fruit heap: round),
  * reads racks-src/<name>.jpg and writes public/racks/<name>.webp, whose alpha is 0 on the back panel,
    128 on items built as packs and 255 on everything else (the mall draws that part flat),
  * stores the items as `packs: [row, x0, x1, y0, y1, round]` and the panel colour as `bg`.
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
GEN = ROOT / 'src' / 'data' / 'rackPhotos.gen.ts'
flags = sys.argv[1:]
sheet_path = flags[flags.index('--sheet') + 1] if '--sheet' in flags else None
args = [a for a in flags if not a.startswith('--') and a != sheet_path]

text = GEN.read_text(encoding='utf8')
entries = {m.group(1): json.loads(m.group(2)) for m in re.finditer(r"  '([^']+)': (\{.*\}),\n", text)}


def rows_of(e):
    """Shelf rows as (top, bottom) pixel spans, the same way the mall builds them."""
    fl, fr, ft = e['frame']
    out, prev = [], ft
    for a, b in e['lips']:
        out.append((prev, a))
        prev = b
    if prev < e['h'] - 2:
        out.append((prev, e['h']))
    return out


def runs(f, minlen):
    """[start, end) runs of True in a 1D boolean array."""
    f = np.concatenate([[False], np.asarray(f, bool), [False]])
    d = np.diff(f.astype(np.int8))
    starts, ends = np.where(d == 1)[0], np.where(d == -1)[0]
    return [[int(s), int(e)] for s, e in zip(starts, ends) if e - s >= minlen]


def split(px, height):
    """Packs standing shoulder to shoulder repeat at their own width: find that width, then cut on the seams."""
    W = px.shape[1]
    g = px.astype(np.float32).mean(2)
    prof = px[int(px.shape[0] * 0.2):].astype(np.float32).mean(0)  # colour down each column
    edge = np.abs(np.diff(g, axis=1)).mean(0)
    edge = np.concatenate([[0], edge])
    lo, hi = max(24, int(height * 0.25)), min(W // 2 + 1, int(height * 1.6))
    if W < 1.5 * lo or hi <= lo:
        return [(0, W)]
    best, T = 0.0, None
    p = prof - prof.mean(0)
    for lag in range(lo, hi):
        c = (p[:-lag] * p[lag:]).sum() / ((np.sqrt((p[:-lag] ** 2).sum() * (p[lag:] ** 2).sum())) + 1e-6)
        if c > best:
            best, T = c, lag
    if T is None or best < 0.35:
        return [(0, W)]
    n = max(1, round(W / T))
    cuts = [0]
    for i in range(1, n):
        guess = round(i * W / n)
        r = max(4, int(T * 0.22))
        a0, a1 = max(cuts[-1] + 8, guess - r), min(W - 8, guess + r)
        cuts.append(a0 + int(np.argmax(edge[a0:a1])) if a1 > a0 else guess)
    cuts.append(W)
    return [(cuts[i], cuts[i + 1]) for i in range(n) if cuts[i + 1] - cuts[i] >= 8]


def process(e):
    src = ROOT / 'public' / e['src'].lstrip('/')
    jpg = ROOT / 'racks-src' / src.with_suffix('.jpg').name  # the measured photo; only the webp ships
    im = Image.open(jpg).convert('RGB')
    a = np.asarray(im).astype(np.int32)
    h, w, _ = a.shape
    fl, fr, ft = e['frame']
    L, R = max(fl, 6) + 2, w - max(fr, 6) - 2
    keep = np.ones((h, w), bool)
    packs, bgs = [], []
    for k, (top, bot) in enumerate(rows_of(e)):
        if bot - top < 12:
            continue
        # back panel colour: the brighter half of the row's top band
        band = a[top + 2:min(bot, top + 14), L:R:3].reshape(-1, 3)
        bright = band[band.sum(1) >= np.median(band.sum(1))]
        bg = np.median(bright, 0)
        blk = a[top:bot]
        d = np.abs(blk - bg).sum(2)
        lum = blk.sum(2) / (bg.sum() + 1)
        hue = np.abs((blk[..., 0] - blk[..., 2]) - (bg[0] - bg[2]) * lum) + np.abs((blk[..., 1] - blk[..., 2]) - (bg[1] - bg[2]) * lum)
        item = ~((d < 46) | ((lum > 0.55) & (lum < 1.08) & (hue < 22)))
        item[:, :L] = False
        item[:, R:] = False
        H = bot - top
        lo = int(H * 0.25)
        colfill = item[lo:].mean(0)
        for x0, x1 in runs(colfill > 0.22, 10):
            rowfill = item[:, x0:x1].mean(1)
            for y0, y1 in runs(rowfill > 0.18, 14):
                cf = item[y0:y1, x0:x1].mean(0)
                xs = np.where(cf > 0.15)[0]
                if len(xs) == 0:
                    continue
                xa, xb = x0 + int(xs[0]), x0 + int(xs[-1]) + 1
                if xb - xa < 8:
                    continue
                for sa, sb in split(a[top + y0:top + y1, xa:xb], y1 - y0):
                    sub = item[y0:y1, xa + sa:xa + sb]
                    ys = np.where(sub.mean(1) > 0.2)[0]
                    if len(ys) == 0:
                        continue
                    ya, yb = y0 + int(ys[0]), y0 + int(ys[-1]) + 1
                    fill = float(item[ya:yb, xa + sa:xa + sb].mean())
                    packs.append([k, xa + sa, xa + sb, top + ya, top + yb, 0 if fill > 0.86 else 1])
        keep[top:bot] = item | ~np.pad(np.ones((H, R - L), bool), ((0, 0), (L, w - R)))
        bgs.append('#%02X%02X%02X' % tuple(int(v) for v in bg))
    # alpha: 0 back panel, 128 an item built as a pack, 255 everything else (frame, shelf edges, items not split out)
    alpha = keep.astype(np.uint8) * 255
    inpack = np.zeros((h, w), bool)
    for _, xa, xb, y0, y1, _ in packs:
        inpack[y0:y1, xa:xb] = True
    alpha[keep & inpack] = 128
    for top, bot in rows_of(e):
        alpha[top:bot][~keep[top:bot]] = 0
    mask = Image.fromarray(alpha)
    # close pinholes inside packs and soften the cut so edges do not stair-step
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    rgba = im.copy()
    rgba.putalpha(mask)
    out = src.with_suffix('.webp')
    rgba.save(out, quality=86, method=4, exact=True)  # boxes show the pixels under the cut too
    e['src'] = '/racks/' + out.name
    e['packs'] = packs
    e['bg'] = bgs[len(bgs) // 2] if bgs else '#EEE6DA'
    return rgba, packs


sheet = []
for key in args or list(entries):
    rgba, packs = process(entries[key])
    print(key, len(packs), 'items', sum(p[5] for p in packs), 'round')
    if sheet_path:
        v = Image.new('RGB', rgba.size, (255, 0, 255))
        v.paste(rgba, (0, 0), rgba)
        dr = ImageDraw.Draw(v)
        for r, xa, xb, y0, y1, rnd in packs:
            dr.rectangle([xa, y0, xb, y1], outline=(0, 160, 255) if rnd else (0, 200, 0), width=4)
        sheet.append(v.resize((v.width // 4, v.height // 4)))

if sheet:
    cols = min(6, len(sheet))
    tw, th = max(s.width for s in sheet), max(s.height for s in sheet)
    out = Image.new('RGB', (tw * cols, th * ((len(sheet) + cols - 1) // cols)), 'white')
    for i, s in enumerate(sheet):
        out.paste(s, ((i % cols) * tw, (i // cols) * th))
    out.save(sheet_path)

if '--dry' not in flags:
    lines = ''.join(f"  '{k}': {json.dumps(v)},\n" for k, v in entries.items())
    GEN.write_text(re.sub(r"(export const GEN: Record<string, RackPhoto> = \{\n)(.*?)(\}\n)", lambda m: m.group(1) + lines + m.group(3), text, flags=re.S), encoding='utf8')
