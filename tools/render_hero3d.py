"""
tools/render_hero3d.py
------------------------------------------------------------------
Generates the animated Home hero artwork for the MBU Data Science
Digital Library (Midnight Neon Pro theme).

It is a small offline software renderer: real 3D geometry (spheres,
boxes, capsules, discs, annuli, triangle meshes), a perspective camera,
per-layer z-buffers, Blinn-Phong lighting with three lights, fresnel
rim light, atmospheric depth fog, glass panels, emissive data charts,
bloom and vignette.

The scene is rendered in five independent depth layers so the website
can animate each object group separately (real 3D motion, not a single
flat image spinning as one rectangle):

  hero-layer-platform   holographic platform + rings + spokes
  hero-layer-book       open 3D book, cover, pages, page data lines
  hero-layer-brain      holographic AI brain + neural network orbit
  hero-layer-panels     glass dashboards, charts, metallic data cubes
  hero-layer-particles  particles, data streams, glow

Outputs (assets/img/):
  hero-layer-<name>.webp / .png   individual transparent layers
  hero-3d.webp / .png             flattened fallback image

Run:  python tools/render_hero3d.py
"""
import os
import numpy as np
from PIL import Image, ImageFilter

# ----------------------------------------------------------------- config
W, H = 1920, 1080          # render resolution (downscaled for anti-aliasing)
OUT_W, OUT_H = 1400, 788   # layer output size
FULL_W, FULL_H = 1600, 900  # flattened fallback size
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                       "assets", "img")

rng = np.random.default_rng(20261020)

# ----------------------------------------------------------------- palette
BG        = np.array([0.031, 0.051, 0.102], np.float32)   # #080D1A
NAVY      = np.array([0.051, 0.078, 0.149], np.float32)   # #0D1426
SURFACE   = np.array([0.067, 0.106, 0.188], np.float32)   # #111B30
ELEVATED  = np.array([0.090, 0.137, 0.231], np.float32)   # #17233B
CYAN      = np.array([0.133, 0.827, 0.933], np.float32)   # #22D3EE
VIOLET    = np.array([0.545, 0.361, 0.965], np.float32)   # #8B5CF6
TEXT      = np.array([0.910, 0.933, 0.973], np.float32)   # #E8EEF8
MUTED     = np.array([0.655, 0.706, 0.792], np.float32)   # #A7B4CA
WHITE     = np.array([1.0, 1.0, 1.0], np.float32)

F32 = np.float32

# ----------------------------------------------------------------- camera
CAM_POS = np.array([0.0, 2.45, 7.05], F32)
CAM_TGT = np.array([0.0, 1.38, 0.0], F32)
FOV = 36.0
ASPECT = W / H


def make_rays():
    fwd = CAM_TGT - CAM_POS
    fwd /= np.linalg.norm(fwd)
    up0 = np.array([0.0, 1.0, 0.0], F32)
    right = np.cross(fwd, up0)
    right /= np.linalg.norm(right)
    up = np.cross(right, fwd)
    ty = np.tan(np.radians(FOV) * 0.5)
    tx = ty * ASPECT
    xs = ((np.arange(W, dtype=F32) + 0.5) / W * 2.0 - 1.0) * tx
    ys = (1.0 - (np.arange(H, dtype=F32) + 0.5) / H * 2.0) * ty
    d = (fwd[None, None, :] +
         xs[None, :, None] * right[None, None, :] +
         ys[:, None, None] * up[None, None, :])
    d /= np.linalg.norm(d, axis=2, keepdims=True)
    return (np.broadcast_to(CAM_POS, d.shape).copy(), d.astype(F32))


ORIGIN, DIR = make_rays()
FLAT = ORIGIN.shape[0] * ORIGIN.shape[1]
O = ORIGIN.reshape(-1, 3).astype(F32)
D = DIR.reshape(-1, 3).astype(F32)

# ----------------------------------------------------------------- layers
LAYERS = ["platform", "book", "brain", "panels", "particles"]
BUF = {name: {
    "color": np.zeros((FLAT, 3), F32),
    "alpha": np.zeros(FLAT, F32),
    "depth": np.full(FLAT, np.inf, F32),
} for name in LAYERS}
CUR = LAYERS[0]


def set_layer(name):
    global CUR
    CUR = name


def color():
    return BUF[CUR]["color"]


def alpha():
    return BUF[CUR]["alpha"]


def depth():
    return BUF[CUR]["depth"]


# ----------------------------------------------------------------- lights
LIGHTS = [
    (np.array([-0.55, 0.62, 0.56], F32), np.array([0.55, 0.90, 1.00], F32), 1.05, 64.0),
    (np.array([0.72, 0.18, 0.60], F32), np.array([0.34, 0.46, 0.95], F32), 0.55, 32.0),
    (np.array([0.10, 0.42, -0.88], F32), np.array([0.66, 0.45, 1.00], F32), 0.80, 48.0),
]
AMBIENT_TOP = np.array([0.085, 0.115, 0.190], F32)
AMBIENT_BOT = np.array([0.022, 0.030, 0.055], F32)


def shade(norm, view, albedo, emissive, spec, shininess):
    n_px = norm.shape[0]
    alb = np.broadcast_to(np.asarray(albedo, F32).reshape(1, 3), (n_px, 3))
    out = np.empty((n_px, 3), F32)
    amb = AMBIENT_TOP * (0.5 + 0.5 * norm[:, 1:2]) + AMBIENT_BOT * (0.5 - 0.5 * norm[:, 1:2])
    out[:] = alb * amb
    for (ldir, lcol, inten, sh) in LIGHTS:
        ndl = np.clip(norm @ ldir, 0.0, 1.0)
        diff = ndl * inten
        hvec = ldir + view
        hvec /= (np.linalg.norm(hvec, axis=1, keepdims=True) + 1e-6)
        ndh = np.clip((norm * hvec).sum(1), 0.0, 1.0)
        sp = (ndh ** sh) * spec * inten
        out += (lcol[None, :] * diff[:, None]) * alb
        out += (lcol[None, :] * sp[:, None])
    if emissive is not None:
        em = np.broadcast_to(np.asarray(emissive, F32).reshape(1, 3), (n_px, 3))
        out += em
    fres = (1.0 - np.clip((norm * view).sum(1), 0.0, 1.0)) ** 3.0
    out += (CYAN[None, :] * (fres * 0.35)[:, None])
    return out


def draw_opaque(t, ok, n, albedo, emissive=None, spec=0.30, shininess=48.0):
    mask = ok & (t < depth())
    if not mask.any():
        return
    view = -D[mask]
    col = shade(n[mask], view, albedo, emissive, spec, shininess)
    fog = np.clip((t[mask] - 6.0) / 16.0, 0.0, 0.55)[:, None]
    col = col * (1.0 - fog) + BG * fog
    idx = np.where(mask)[0]
    color()[idx] = col
    depth()[idx] = t[mask]
    alpha()[idx] = 1.0


def draw_emissive(t, ok, n, colr, strength=1.0, soft=0.0):
    mask = ok & (t < depth())
    if not mask.any():
        return
    idx = np.where(mask)[0]
    view = -D[mask]
    base = np.broadcast_to((colr[None, :] * strength), (len(idx), 3)).copy()
    if soft > 0:
        fres = (1.0 - np.clip((n[mask] * view).sum(1), 0.0, 1.0)) ** 2.0
        base = base * (1.0 + fres * soft)[:, None]
    color()[idx] += base
    depth()[idx] = t[mask]
    alpha()[idx] = 1.0


# ----------------------------------------------------------------- primitives
def hit_sphere(c, r):
    oc = O - c
    b = (D * oc).sum(1)
    cc = (oc * oc).sum(1) - r * r
    disc = b * b - cc
    ok = disc > 0.0
    sq = np.sqrt(np.maximum(disc, 0.0))
    t = -b - sq
    t = np.where((t < 0.0) & ok, -b + sq, t)
    ok &= t > 1e-3
    p = O + D * t[:, None]
    n = (p - c) / r
    return t, ok, n.astype(F32)


def hit_box(center, half, rot_y=0.0, rot_x=0.0):
    cy, sy = np.cos(rot_y), np.sin(rot_y)
    cx, sx = np.cos(rot_x), np.sin(rot_x)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], F32)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]], F32)
    R = Rx @ Ry
    Rt = R.T
    o = (O - center) @ Rt
    d = D @ Rt
    lo, hi = -half, half
    inv = 1.0 / np.where(np.abs(d) < 1e-8, 1e-8, d)
    t1 = (lo - o) * inv
    t2 = (hi - o) * inv
    tmin = np.minimum(t1, t2).max(1)
    tmax = np.maximum(t1, t2).min(1)
    ok = (tmax >= np.maximum(tmin, 0.0)) & (tmax > 0.0)
    t = np.where(tmin > 1e-3, tmin, tmax)
    ok &= t > 1e-3
    p = o + d * t[:, None]
    a = np.abs(p)
    axis = np.argmax(a / half, axis=1)
    nloc = np.zeros_like(p)
    rows = np.arange(len(p))
    nloc[rows, axis] = np.sign(p[rows, axis])
    n = nloc @ R
    return t, ok, n.astype(F32)


def hit_disc(y, radius):
    dy = D[:, 1]
    safe = np.where(np.abs(dy) < 1e-6, 1e-6, dy)
    t = (y - O[:, 1]) / safe
    ok = (np.abs(dy) > 1e-6) & (t > 1e-3)
    p = O + D * t[:, None]
    ok &= (p[:, 0] ** 2 + p[:, 2] ** 2) <= radius * radius
    n = np.tile(np.array([0.0, 1.0, 0.0], F32), (len(O), 1))
    return t, ok, n.astype(F32)


def hit_annulus(y, r_in, r_out):
    dy = D[:, 1]
    safe = np.where(np.abs(dy) < 1e-6, 1e-6, dy)
    t = (y - O[:, 1]) / safe
    ok = (np.abs(dy) > 1e-6) & (t > 1e-3)
    p = O + D * t[:, None]
    r = np.sqrt(p[:, 0] ** 2 + p[:, 2] ** 2)
    ok &= (r >= r_in) & (r <= r_out)
    n = np.tile(np.array([0.0, 1.0, 0.0], F32), (len(O), 1))
    return t, ok, n.astype(F32)


def hit_capsule(p0, p1, radius):
    d = p1 - p0
    dd = float((d * d).sum()) + 1e-9
    f = O - p0
    dp = D @ d
    fp = f @ d
    a = 1.0 - (dp * dp) / dd
    b = 2.0 * ((D * f).sum(1) - (dp * fp) / dd)
    c = (f * f).sum(1) - (fp * fp) / dd - radius * radius
    disc = b * b - 4.0 * a * c
    ok = (disc > 0.0) & (np.abs(a) > 1e-9)
    sq = np.sqrt(np.maximum(disc, 0.0))
    t1 = (-b - sq) / (2.0 * a + 1e-12)
    t2 = (-b + sq) / (2.0 * a + 1e-12)
    t = np.where(t1 > 1e-3, t1, t2)
    ok &= t > 1e-3
    p = O + D * t[:, None]
    par = ((p - p0) @ d) / dd
    ok &= (par >= 0.0) & (par <= 1.0)
    for cp in (p0, p1):
        oc = O - cp
        bb = (D * oc).sum(1)
        cc = (oc * oc).sum(1) - radius * radius
        dd2 = bb * bb - cc
        okc = dd2 > 0.0
        sqc = np.sqrt(np.maximum(dd2, 0.0))
        tc = -bb - sqc
        tc = np.where(tc < 0.0, -bb + sqc, tc)
        okc &= tc > 1e-3
        take = okc & (~ok) & (tc < t)
        t = np.where(take, tc, t)
        ok = ok | take
    p = O + D * t[:, None]
    h = np.clip(((p - p0) @ d) / dd, 0.0, 1.0)
    closest = p0 + d * h[:, None]
    rad = p - closest
    n = rad / (np.linalg.norm(rad, axis=1, keepdims=True) + 1e-8)
    return t, ok, n.astype(F32)


def hit_triangle(v0, v1, v2):
    e1 = v1 - v0
    e2 = v2 - v0
    pvec = np.cross(D, e2)
    det = (e1 * pvec).sum(1)
    ok = np.abs(det) > 1e-9
    inv = 1.0 / (det + 1e-12)
    tvec = O - v0
    u = (tvec * pvec).sum(1) * inv
    qvec = np.cross(tvec, e1)
    v = (D * qvec).sum(1) * inv
    t = (e2 * qvec).sum(1) * inv
    ok &= (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 1e-3)
    n = np.cross(e1, e2)
    n /= np.linalg.norm(n) + 1e-9
    return t, ok, np.broadcast_to(n, D.shape).astype(F32)


# ================================================================= scene
# --- 1. holographic platform ------------------------------------------
set_layer("platform")
PLAT_Y = 0.0
PLAT_R = 3.05

t, ok, n = hit_disc(PLAT_Y, PLAT_R)
draw_opaque(t, ok, n, SURFACE * 1.05, spec=0.75, shininess=120.0)

t, ok, n = hit_disc(PLAT_Y - 0.09, PLAT_R * 0.985)
draw_opaque(t, ok, n, NAVY * 0.85, spec=0.35, shininess=40.0)

for i, rr in enumerate([0.62, 1.12, 1.68, 2.24, 2.74]):
    t, ok, n = hit_annulus(PLAT_Y + 0.005, rr - 0.016, rr + 0.016)
    mask = ok & (t < depth())
    if mask.any():
        idx = np.where(mask)[0]
        c = CYAN if i % 2 == 0 else VIOLET
        color()[idx] += c * (0.55 if i % 2 == 0 else 0.32)
        depth()[idx] = t[mask]
        alpha()[idx] = 1.0

for k in range(8):
    a = k / 8.0 * 2 * np.pi
    p0 = np.array([0.55 * np.cos(a), PLAT_Y + 0.004, 0.55 * np.sin(a)], F32)
    p1 = np.array([2.70 * np.cos(a), PLAT_Y + 0.004, 2.70 * np.sin(a)], F32)
    t, ok, n = hit_capsule(p0, p1, 0.010)
    mask = ok & (t < depth())
    if mask.any():
        idx = np.where(mask)[0]
        color()[idx] += CYAN * 0.16
        depth()[idx] = t[mask]
        alpha()[idx] = 1.0

# --- 2. open 3D book ----------------------------------------------------
set_layer("book")
BOOK_Y = 1.05
BOOK_TILT = np.radians(24.0)
CT, ST = np.cos(BOOK_TILT), np.sin(BOOK_TILT)


def book_page(side, scale=1.0, y_off=0.0):
    nu, nv = 8, 7
    pts = []
    for iu in range(nu):
        u = iu / (nu - 1.0)
        row = []
        for iv in range(nv):
            v = iv / (nv - 1.0)
            x = side * (0.07 + u * 1.42) * scale
            z = (v - 0.5) * 1.55 * scale
            y = 0.30 * (u ** 1.7) + 0.05 * np.sin(v * np.pi) + y_off
            row.append(np.array([x, BOOK_Y + (y * CT - z * ST), (y * ST + z * CT)], F32))
        pts.append(row)
    tris = []
    for iu in range(nu - 1):
        for iv in range(nv - 1):
            a, b = pts[iu][iv], pts[iu][iv + 1]
            c, d = pts[iu + 1][iv + 1], pts[iu + 1][iv]
            if side > 0:
                tris += [(a, b, c), (a, c, d)]
            else:
                tris += [(a, c, b), (a, d, c)]
    return tris


for side in (1, -1):                                    # dark cover slabs
    for tri in book_page(side, scale=1.05, y_off=-0.055):
        t, ok, n = hit_triangle(*tri)
        draw_opaque(t, ok, n, NAVY * 0.75, spec=0.5, shininess=80.0)

for side in (1, -1):                                    # pages
    for tri in book_page(side):
        t, ok, n = hit_triangle(*tri)
        draw_opaque(t, ok, n, ELEVATED * 1.05, emissive=CYAN * 0.015, spec=0.38, shininess=44.0)

for side in (1, -1):                                    # glowing page data lines
    for k, uu in enumerate([0.22, 0.42, 0.62, 0.80]):
        prev = None
        for step in range(5):
            v = 0.18 + step * 0.16
            x = side * (0.07 + uu * 1.42)
            z = (v - 0.5) * 1.55
            y = 0.30 * (uu ** 1.7) + 0.05 * np.sin(v * np.pi) + 0.012
            p = np.array([x, BOOK_Y + (y * CT - z * ST), (y * ST + z * CT)], F32)
            if prev is not None:
                t, ok, n = hit_capsule(prev, p, 0.009)
                draw_emissive(t, ok, n, CYAN if k % 2 == 0 else VIOLET, strength=0.55)
            prev = p

for side in (1, -1):                                    # glowing page edges
    edge_pts = []
    for iu in range(8):
        u = iu / 7.0
        x = side * (0.07 + u * 1.42)
        y = 0.30 * (u ** 1.7) + 0.05 * np.sin(np.pi)
        z = 0.5 * 1.55
        edge_pts.append(np.array([x, BOOK_Y + (y * CT - z * ST), (y * ST + z * CT)], F32))
    for i in range(len(edge_pts) - 1):
        t, ok, n = hit_capsule(edge_pts[i], edge_pts[i + 1], 0.020)
        draw_emissive(t, ok, n, CYAN, strength=1.6)

sp_a = np.array([0.0, BOOK_Y + (0.775 * ST), -0.775 * CT], F32)
sp_b = np.array([0.0, BOOK_Y - (0.775 * ST), 0.775 * CT], F32)
t, ok, n = hit_capsule(sp_a, sp_b, 0.055)
draw_opaque(t, ok, n, NAVY * 1.25, spec=0.85, shininess=120.0)
t, ok, n = hit_capsule(sp_a + np.array([0, 0.045, 0], F32),
                       sp_b + np.array([0, 0.045, 0], F32), 0.018)
draw_emissive(t, ok, n, CYAN, strength=1.2)

glyph_nodes = []                                         # data glyphs above the book
for i in range(18):
    ang = rng.uniform(0, 2 * np.pi)
    rad = rng.uniform(0.05, 0.62)
    glyph_nodes.append(np.array([rad * np.cos(ang) * 1.15,
                                  BOOK_Y + 0.55 + rng.uniform(0.0, 0.45),
                                  rad * np.sin(ang) * 0.9], F32))
for i, p in enumerate(glyph_nodes):
    t, ok, n = hit_sphere(p, rng.uniform(0.022, 0.042))
    draw_emissive(t, ok, n, CYAN if i % 3 else VIOLET, strength=1.6)
for i in range(len(glyph_nodes) - 1):
    if rng.random() < 0.55:
        t, ok, n = hit_capsule(glyph_nodes[i], glyph_nodes[i + 1], 0.008)
        draw_emissive(t, ok, n, CYAN * 0.9, strength=0.55)

# --- 3. holographic AI brain -------------------------------------------
set_layer("brain")
BRAIN_C = np.array([0.0, 2.92, -0.22], F32)
brain_spheres = []
for i in range(34):
    u = rng.uniform(-1, 1)
    v = rng.uniform(-1, 1)
    w = rng.uniform(-1, 1)
    if i % 9 == 0:
        p = BRAIN_C + np.array([rng.uniform(-0.3, 0.3), -0.42 + rng.uniform(-0.1, 0.1),
                                rng.uniform(-0.3, 0.2)], F32)
        r = rng.uniform(0.13, 0.20)
    else:
        side = 1.0 if u >= 0 else -1.0
        p = BRAIN_C + np.array([side * (0.10 + 0.44 * abs(u)) + rng.uniform(-0.05, 0.05),
                                0.30 * v, 0.38 * w], F32)
        r = rng.uniform(0.12, 0.21)
    brain_spheres.append((p, r))
for p, r in brain_spheres:
    t, ok, n = hit_sphere(p, r)
    draw_opaque(t, ok, n, CYAN * 0.30 + VIOLET * 0.12, emissive=CYAN * 0.16,
                spec=0.85, shininess=90.0)
for i in range(len(brain_spheres)):
    for _ in range(3):
        j = int(rng.integers(0, len(brain_spheres)))
        if j == i:
            continue
        t, ok, n = hit_capsule(brain_spheres[i][0], brain_spheres[j][0], 0.010)
        draw_emissive(t, ok, n, CYAN if i % 2 else VIOLET, strength=0.75)

orbit = []
for i in range(14):
    a = i / 14.0 * 2 * np.pi
    rr = 0.95 + 0.12 * np.sin(i * 1.7)
    orbit.append(BRAIN_C + np.array([rr * np.cos(a), 0.30 * np.sin(a * 1.3),
                                      rr * 0.8 * np.sin(a)]))
for i, p in enumerate(orbit):
    t, ok, n = hit_sphere(p, 0.030)
    draw_emissive(t, ok, n, CYAN if i % 2 else VIOLET, strength=1.7)
for i in range(len(orbit)):
    t, ok, n = hit_capsule(orbit[i], orbit[(i + 1) % len(orbit)], 0.007)
    draw_emissive(t, ok, n, VIOLET, strength=0.5)

# --- 4. glass dashboards, charts, cubes --------------------------------
set_layer("panels")
PANELS = [
    (np.array([-2.18, 2.42, 0.95], F32), (1.62, 1.00), 0.20, 0.10, CYAN),
    (np.array([2.22, 2.48, 0.45], F32), (1.52, 0.95), -0.24, 0.08, VIOLET),
    (np.array([-2.32, 1.05, -0.15], F32), (1.50, 0.92), 0.30, -0.06, CYAN),
    (np.array([2.38, 0.98, -0.75], F32), (1.46, 0.90), -0.34, -0.05, VIOLET),
]


def panel_basis(centre, rot_y, rot_x):
    cy, sy = np.cos(rot_y), np.sin(rot_y)
    cx, sx = np.cos(rot_x), np.sin(rot_x)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], F32)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]], F32)
    return Rx @ Ry


def bar_chart(centre, rot_y, rot_x, w, h, values, tint):
    R = panel_basis(centre, rot_y, rot_x)
    slot = w / (len(values) + 1.2)
    for i, v in enumerate(values):
        bh = h * v
        local = np.array([-w / 2 + slot * (i + 0.6), -h / 2 + bh / 2, 0.03], F32)
        c = centre + R @ local
        t, ok, nn = hit_box(c, np.array([slot * 0.26, bh / 2, 0.028], F32), rot_y, rot_x)
        col = tint * (0.55 + 0.45 * v)
        draw_opaque(t, ok, nn, col * 0.35, emissive=col * 0.85, spec=0.4, shininess=60.0)


def line_chart(centre, rot_y, rot_x, w, h, values, tint):
    R = panel_basis(centre, rot_y, rot_x)
    pts = []
    for i, v in enumerate(values):
        local = np.array([-w / 2 + (w * i / (len(values) - 1)), -h / 2 + h * v, 0.04], F32)
        pts.append(centre + R @ local)
    for i in range(len(pts) - 1):
        t, ok, nn = hit_capsule(pts[i], pts[i + 1], 0.014)
        draw_emissive(t, ok, nn, tint, strength=1.5)
    for p in pts:
        t, ok, nn = hit_sphere(p, 0.026)
        draw_emissive(t, ok, nn, tint * 1.15, strength=1.8)


def donut(centre, rot_y, rot_x, r, tint_a, tint_b):
    R = panel_basis(centre, rot_y, rot_x)
    n = 34
    for i in range(n):
        a = i / n * 2 * np.pi
        p = centre + R @ np.array([r * np.cos(a), r * np.sin(a), 0.035], F32)
        t, ok, nn = hit_sphere(p, 0.030)
        draw_emissive(t, ok, nn, tint_a if (i // 6) % 2 == 0 else tint_b, strength=1.6)


def code_rows(centre, rot_y, rot_x, w, h, tint):
    R = panel_basis(centre, rot_y, rot_x)
    rows = 7
    for i in range(rows):
        ww = w * rng.uniform(0.32, 0.92)
        local = np.array([-w / 2 + ww / 2, h / 2 - 0.10 - i * (h / (rows + 0.6)), 0.03], F32)
        c = centre + R @ local
        t, ok, nn = hit_box(c, np.array([ww / 2, 0.018, 0.012], F32), rot_y, rot_x)
        draw_opaque(t, ok, nn, tint * 0.30, emissive=tint * 0.7, spec=0.3, shininess=40.0)


bar_chart(PANELS[2][0], PANELS[2][2], PANELS[2][3], 1.30, 0.66,
          [0.42, 0.68, 0.30, 0.86, 0.55, 0.74], CYAN)
line_chart(PANELS[0][0], PANELS[0][2], PANELS[0][3], 1.36, 0.60,
           [0.22, 0.48, 0.34, 0.70, 0.55, 0.88, 0.62, 0.95], CYAN)
donut(PANELS[1][0], PANELS[1][2], PANELS[1][3], 0.30, CYAN, VIOLET)
code_rows(PANELS[3][0], PANELS[3][2], PANELS[3][3], 1.22, 0.60, CYAN)

for (centre, size, rot_y, rot_x, tint) in PANELS:
    half = np.array([size[0] / 2, size[1] / 2, 0.012], F32)
    t, ok, n = hit_box(centre, half, rot_y, rot_x)
    mask = ok & (t < depth())
    if not mask.any():
        continue
    view = -D[mask]
    fres = (1.0 - np.clip((n[mask] * view).sum(1), 0.0, 1.0)) ** 2.2
    a = np.clip(0.10 + fres * 0.45, 0.0, 0.6)
    base = (tint * 0.10 + SURFACE * 0.55)[None, :]
    idx = np.where(mask)[0]
    aa = a[:, None]
    color()[idx] = color()[idx] * (1 - aa) + base * aa
    alpha()[idx] = alpha()[idx] * (1 - a) + a
    edge = np.abs(n[mask][:, 2]) < 0.5
    frame_idx = idx[edge]
    if len(frame_idx):
        color()[frame_idx] += tint * 0.35
        alpha()[frame_idx] = 1.0

CUBES = [
    (np.array([-1.85, 0.34, 1.35], F32), 0.17, 0.35),
    (np.array([1.72, 0.30, 1.15], F32), 0.15, -0.45),
    (np.array([-1.35, 0.28, -1.45], F32), 0.14, 0.80),
    (np.array([1.50, 0.42, -1.25], F32), 0.19, -0.30),
    (np.array([0.35, 0.26, 1.75], F32), 0.13, 0.60),
]
for (c, s, ry) in CUBES:
    t, ok, n = hit_box(c, np.array([s, s, s], F32), ry, 0.3)
    draw_opaque(t, ok, n, SURFACE * 1.15, emissive=CYAN * 0.05, spec=0.9, shininess=120.0)
    t, ok, n = hit_capsule(c + np.array([0, s, 0], F32), c + np.array([0, -s, 0], F32), 0.012)
    draw_emissive(t, ok, n, CYAN, strength=1.0)

# --- 5. particles, data streams, glow ----------------------------------
set_layer("particles")
for i in range(5):
    a = rng.uniform(0, 2 * np.pi)
    start = np.array([1.3 * np.cos(a), 0.05, 1.3 * np.sin(a)], F32)
    mid = np.array([0.55 * np.cos(a), 1.55, 0.55 * np.sin(a)], F32)
    end = BRAIN_C + np.array([0.3 * np.cos(a), -0.35, 0.25 * np.sin(a)], F32)
    t, ok, n = hit_capsule(start, mid, 0.011)
    draw_emissive(t, ok, n, CYAN, strength=0.85)
    t, ok, n = hit_capsule(mid, end, 0.009)
    draw_emissive(t, ok, n, VIOLET, strength=0.8)

for i in range(190):
    p = np.array([rng.uniform(-3.4, 3.4),
                  rng.uniform(0.15, 3.85),
                  rng.uniform(-2.2, 2.4)], F32)
    r = rng.uniform(0.010, 0.028)
    if rng.random() < 0.05:
        r = rng.uniform(0.038, 0.055)
    t, ok, n = hit_sphere(p, r)
    roll = rng.random()
    c = CYAN if roll < 0.65 else (VIOLET if roll < 0.92 else WHITE)
    strength = float(rng.uniform(0.45, 1.25))
    if c is WHITE:
        strength = float(rng.uniform(0.30, 0.60))
    draw_emissive(t, ok, n, c, strength=strength, soft=0.5)


def add_glow(center, radius, colr, strength):
    d = np.linalg.norm(O - center, axis=1)
    g = np.clip(1.0 - d / radius, 0.0, 1.0) ** 2.4 * strength
    color()[:] += colr[None, :] * g[:, None]
    alpha()[:] = np.maximum(alpha(), np.clip(g * 1.2, 0.0, 0.55))


add_glow(BRAIN_C, 1.9, CYAN * 0.55, 0.55)
add_glow(np.array([0.0, BOOK_Y + 0.2, 0.0], F32), 2.2, VIOLET * 0.35, 0.35)
add_glow(np.array([0.0, 0.05, 0.0], F32), 3.4, CYAN * 0.30, 0.40)

# ----------------------------------------------------------------- output
def finish(img_rgba, size, name, webp=True):
    out = Image.fromarray((np.clip(img_rgba, 0, 1) * 255).astype(np.uint8), "RGBA")
    out = out.resize(size, Image.LANCZOS)
    out.save(os.path.join(OUT_DIR, name + ".png"), optimize=True)
    if webp:
        out.save(os.path.join(OUT_DIR, name + ".webp"), quality=86, method=6)
    return out


def bloom_layer(rgba):
    rgb = np.clip(rgba[:, :, :3], 0, 6)
    lum = rgb.max(axis=2)
    bright = np.clip((lum - 0.85) / 1.1, 0, 1)[..., None] * rgb
    bimg = Image.fromarray(np.clip(bright * 255, 0, 255).astype(np.uint8), "RGB")
    bimg = bimg.filter(ImageFilter.GaussianBlur(18))
    bl = np.asarray(bimg).astype(np.float32) / 255.0
    rgba[:, :, :3] = np.clip(rgba[:, :, :3] + bl * 0.8, 0, 1)
    rgba[:, :, 3] = np.clip(rgba[:, :, 3] + bl.max(axis=2) * 0.5, 0, 1)
    return rgba


# vignette (shared by all layers)
vx = (np.arange(W) / (W - 1) - 0.5) * 2
vy = (np.arange(H) / (H - 1) - 0.5) * 2
VIG = (1.0 - 0.20 * np.clip((vx[None, :] ** 2 + vy[:, None] ** 2) * 0.75, 0, 1))[:, :, None]

layer_imgs = {}
for name in LAYERS:
    rgba = np.zeros((H, W, 4), np.float32)
    rgba[:, :, :3] = BUF[name]["color"].reshape(H, W, 3)
    rgba[:, :, 3] = BUF[name]["alpha"].reshape(H, W)
    rgba = bloom_layer(rgba)
    rgba[:, :, :3] *= VIG
    layer_imgs[name] = rgba
    finish(rgba, (OUT_W, OUT_H), "hero-layer-" + name)
    print("layer", name, "ok")

# flattened fallback (all layers composited back to front)
flat = np.zeros((H, W, 4), np.float32)
for name in LAYERS:
    src = layer_imgs[name]
    a = src[:, :, 3:4]
    flat[:, :, :3] = flat[:, :, :3] * (1 - a) + src[:, :, :3] * a
    flat[:, :, 3] = flat[:, :, 3] * (1 - a[:, :, 0]) + a[:, :, 0]
finish(flat, (FULL_W, FULL_H), "hero-3d")
print("done")
