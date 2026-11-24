"""Save a ChatGPT campaign photo as an in-store ad.

usage: python -I scripts/ad-photo.py <photo.png> <name>

Writes public/ads/<name>.jpg at most 1536 px on the long side.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
src, name = Path(sys.argv[1]), sys.argv[2]
im = Image.open(src).convert('RGB')
k = 1536 / max(im.size)
if k < 1:
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
out = ROOT / 'public' / 'ads' / f'{name}.jpg'
im.save(out, quality=85, optimize=True, progressive=True)
print('wrote', out.name, im.size, out.stat().st_size // 1024, 'KB')
