"""Generate favicon.png (32x32) and favicon.ico (16x16 + 32x32) for the
MBU Data Science Digital Library from the Midnight Neon Pro palette.
Run:  python tools/render_favicon.py
"""
import os
from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                       'assets', 'img')

NAVY = (8, 13, 26, 255)
CYAN = (34, 211, 238, 255)
VIOLET = (139, 92, 246, 255)
CYAN_SOFT = (103, 232, 249, 255)
WHITE = (245, 249, 255, 255)

def draw(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # rounded dark navy background
    r = max(2, size // 7)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=r, fill=NAVY)
    cx = cy = size // 2
    # orbit ring (rotated ellipse)
    rw = int(size * 0.82); rh = int(size * 0.34)
    bbox = (cx - rw // 2, cy - rh // 2, cx + rw // 2, cy + rh // 2)
    d.ellipse(bbox, outline=CYAN, width=max(1, size // 16))
    # second ring, rotated ~58 degrees, drawn as a thin arc via ellipse tilted by
    # painting a rotated copy on a temp layer
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    bbox2 = (cx - rw // 2, cy - rh // 2, cx + rw // 2, cy + rh // 2)
    ld.ellipse(bbox2, outline=VIOLET, width=max(1, size // 20))
    layer = layer.rotate(58, resample=Image.BILINEAR, center=(cx, cy))
    img = Image.alpha_composite(img, layer)
    d = ImageDraw.Draw(img)
    # core sphere
    cr = int(size * 0.34)
    d.ellipse((cx - cr, cy - cr, cx + cr, cy + cr), fill=CYAN, outline=(15, 40, 60, 255), width=1)
    # violet lower-left cap
    cap = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cd = ImageDraw.Draw(cap)
    cd.pieslice((cx - cr, cy - cr, cx + cr, cy + cr), start=130, end=310, fill=VIOLET)
    cd.ellipse((cx - cr, cy - cr, cx + cr, cy + cr), fill=None, outline=VIOLET, width=0)
    # fade the cap so it blends as a secondary highlight
    cap_arr = list(cap.getdata())
    cap_arr = [ (r, g, b, int(a * 0.55)) for (r, g, b, a) in cap_arr ]
    cap.putdata(cap_arr)
    img = Image.alpha_composite(img, cap)
    d = ImageDraw.Draw(img)
    # specular shine
    sh = int(size * 0.11)
    d.ellipse((cx - sh - 2, cy - sh - 3, cx - sh + 2 + sh, cy - sh + 2), fill=(255, 255, 255, 150))
    # nodes
    nodes = [(size - 3, size // 2), (size // 2, 3), (size // 2, size - 3)]
    node_colors = [CYAN_SOFT, CYAN, VIOLET]
    nr = max(1, size // 12)
    for (nx, ny), col in zip(nodes, node_colors):
        d.ellipse((nx - nr, ny - nr, nx + nr, ny + nr), fill=col)
    return img

# 256x256 master for crisp downscaling
master = draw(256)
master.save(os.path.join(OUT_DIR, 'favicon-256.png'), optimize=True)

# 32x32 PNG
png32 = master.resize((32, 32), Image.LANCZOS)
png32.save(os.path.join(OUT_DIR, 'favicon.png'), optimize=True)

# 16x16 PNG (for reference)
png16 = master.resize((16, 16), Image.LANCZOS)
png16.save(os.path.join(OUT_DIR, 'favicon-16.png'), optimize=True)

# Multi-size ICO (16 + 32)
ico = master.resize((32, 32), Image.LANCZOS)
ico.save(os.path.join(OUT_DIR, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32)])

print('wrote favicon.png (32x32), favicon-16.png (16x16), favicon.ico (16+32), favicon-256.png (256)')
