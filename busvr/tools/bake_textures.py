"""Procedural textures: terrain layers, asphalt, tree sprites, building facades, bus interior, cloud noise."""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
rng = np.random.default_rng(42)

def fnoise(n, beta, seed):
    """Tileable 1/f^beta noise in [0,1]."""
    r = np.random.default_rng(seed); w = r.standard_normal((n, n))
    f = np.fft.fft2(w); fx = np.fft.fftfreq(n)[:, None]; fy = np.fft.fftfreq(n)[None, :]
    k = np.sqrt(fx * fx + fy * fy); k[0, 0] = 1
    out = np.real(np.fft.ifft2(f / k ** beta)); out -= out.min(); return out / out.max()
def norm(a, mean=0.5, contrast=1.0):
    a = (a - a.mean()) / (a.std() + 1e-9); return np.clip(mean + a * 0.16 * contrast, 0, 1)
def rgb(a): return (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)
def save_layers(name, layers):
    arr = np.concatenate(layers, 0); Image.fromarray(arr).save(os.path.join(OUT, name), optimize=True); print(name, arr.shape)
def tile_blobs(n, count, rmin, rmax, seed, soft=1.0):
    """Tileable field of soft shaded bumps (tree crowns): returns height in [0,1]."""
    r = np.random.default_rng(seed); h = np.zeros((n, n), np.float32)
    yy, xx = np.mgrid[0:n, 0:n]
    for _ in range(count):
        cx, cy, rad = r.uniform(0, n), r.uniform(0, n), r.uniform(rmin, rmax); top = r.uniform(0.55, 1.0)
        dx = np.minimum(np.abs(xx - cx), n - np.abs(xx - cx)); dy = np.minimum(np.abs(yy - cy), n - np.abs(yy - cy))
        d2 = (dx * dx + dy * dy) / (rad * rad)
        h = np.maximum(h, top * np.clip(1 - d2, 0, 1) ** (0.5 * soft))
    return h

# ------------------------------------------------------------------ terrain (all layers average ~0.5 grey: tint comes from the shader)
N = 512
def terrain():
    L = []
    # grass: fine mottled turf
    g = 0.55 * fnoise(N, 1.1, 1) + 0.3 * fnoise(N, 0.4, 2) + 0.15 * fnoise(N, 2.0, 3)
    g = norm(g, 0.5, 1.15); L.append(np.stack([g * 0.97, g * 1.02, g * 0.93], 2))
    # forest canopy: bumpy crowns lit from the upper left
    h = tile_blobs(N, 620, 9, 22, 4); h = h * 0.8 + 0.2 * fnoise(N, 1.5, 5)
    sh = (np.roll(h, 2, 0) - np.roll(h, -2, 0)) + (np.roll(h, 2, 1) - np.roll(h, -2, 1))
    f = norm(0.55 * h + 1.8 * sh + 0.15 * fnoise(N, 0.6, 6), 0.5, 1.5); L.append(np.stack([f * 0.96, f * 1.03, f * 0.92], 2))
    # crop: patchwork of fields with furrows and paths (one tile = 200 m)
    r = np.random.default_rng(7); c = np.zeros((N, N), np.float32); hue = np.zeros((N, N), np.float32)
    def split(x0, y0, x1, y1, depth):
        w, hh = x1 - x0, y1 - y0
        if depth == 0 or (w < 70 and hh < 70) or (r.random() < 0.12 and depth < 3):
            v = r.uniform(0.34, 0.66); hu = r.uniform(-1, 1); ys, xs = np.mgrid[y0:y1, x0:x1]
            period = r.choice([4, 5, 6]); fur = 0.03 * np.sin((xs if w > hh else ys) * 2 * np.pi / period)
            c[y0:y1, x0:x1] = v + fur; hue[y0:y1, x0:x1] = hu
            c[y0:y0 + 2, x0:x1] = 0.36; c[y0:y1, x0:x0 + 2] = 0.36      # levees / paths
            return
        if w > hh: m = int(x0 + w * r.uniform(0.35, 0.65)); split(x0, y0, m, y1, depth - 1); split(m, y0, x1, y1, depth - 1)
        else: m = int(y0 + hh * r.uniform(0.35, 0.65)); split(x0, y0, x1, m, depth - 1); split(x0, m, x1, y1, depth - 1)
    split(0, 0, N, N, 5)
    c = c + 0.05 * (fnoise(N, 1.2, 8) - 0.5); c = norm(c, 0.5, 1.0)
    L.append(np.stack([c * (1 + 0.05 * hue), c, c * (1 - 0.07 * hue)], 2))
    # urban ground: pale concrete / dirt mix with rectilinear patches
    r = np.random.default_rng(9); u = np.full((N, N), 0.5, np.float32)
    for _ in range(90):
        x0, y0 = r.integers(0, N, 2); w, hh = r.integers(20, 110, 2); v = r.uniform(-0.09, 0.09)
        ys = (np.arange(y0, y0 + hh) % N)[:, None]; xs = (np.arange(x0, x0 + w) % N)[None, :]; u[ys, xs] += v
    u = norm(u + 0.35 * (fnoise(N, 0.9, 10) - 0.5), 0.5, 1.0); L.append(np.stack([u * 1.01, u, u * 0.98], 2))
    save_layers("terrain.png", [np.dstack([rgb(l), np.full((N, N, 1), 255, np.uint8)]) for l in L])
    a = norm(0.6 * fnoise(256, 0.3, 11) + 0.4 * fnoise(256, 1.4, 12), 0.5, 1.1)
    Image.fromarray(rgb(np.stack([a, a, a], 2))).save(os.path.join(OUT, "asphalt.png"), optimize=True)
    cl = 0.6 * fnoise(512, 2.3, 13) + 0.28 * fnoise(512, 1.4, 14) + 0.12 * fnoise(512, 0.8, 15); cl = (cl - cl.min()) / (cl.max() - cl.min())
    Image.fromarray(rgb(np.stack([cl, cl, cl], 2))).save(os.path.join(OUT, "clouds.png"), optimize=True)

# ------------------------------------------------------------------ tree sprites (4 x 2 cells of 512 px, RGBA)
def tree_cell(kind, seed):
    S = 512; r = np.random.default_rng(seed)
    col = np.zeros((S, S, 3), np.float32); alpha = np.zeros((S, S), np.float32); zbuf = np.full((S, S), -1e9, np.float32)
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    def blob(cx, cy, rx, ry, base, z, light=1.0, rough=0.0):
        d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
        m = d < 1
        if not m.any(): return
        nz = np.sqrt(np.clip(1 - d, 0, 1)); nx = (xx - cx) / rx; ny = (yy - cy) / ry
        shade = np.clip(0.38 + 0.42 * (-ny * 0.75 - nx * 0.35) + 0.36 * nz, 0.12, 1.25) * light
        zz = z + nz * 0.5
        w = m & (zz > zbuf)
        for c in range(3): col[..., c] = np.where(w, base[c] * shade, col[..., c])
        zbuf[w] = zz[w]; alpha[m] = 1
    def trunk(x0, y0, x1, y1, w0, w1, base):
        n = int(max(abs(y1 - y0), abs(x1 - x0))) + 1
        for t in np.linspace(0, 1, n):
            cx, cy, w = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w0 + (w1 - w0) * t
            xa, xb = int(cx - w), int(cx + w) + 1; ya = int(cy)
            if 0 <= ya < S:
                xs = np.arange(max(xa, 0), min(xb, S)); sh = 0.55 + 0.45 * (xs - cx) / max(w, 1) * -1
                m = zbuf[ya, xs] < -10
                for c in range(3): col[ya, xs, c] = np.where(m, base[c] * (0.7 + 0.3 * sh), col[ya, xs, c])
                alpha[ya, xs] = 1; zbuf[ya, xs] = np.maximum(zbuf[ya, xs], -5)
    grey = np.array([0.50, 0.52, 0.47]); bark = np.array([0.27, 0.22, 0.17])
    if kind in ("pine", "pine2"):            # Korean red pine: bare trunk, irregular flat-topped crown of dark clumps
        lean = r.uniform(-0.06, 0.06); bx = S / 2
        trunk(bx, S - 1, bx + lean * S, S * 0.36, 9, 5, np.array([0.36, 0.24, 0.17]))
        for k in range(5):
            y = S * r.uniform(0.3, 0.55); trunk(bx + lean * S * 0.8, y + 20, bx + r.uniform(-120, 120), y - r.uniform(10, 60), 4, 2, np.array([0.33, 0.22, 0.16]))
        base = np.array([0.34, 0.44, 0.30]) if kind == "pine" else np.array([0.30, 0.41, 0.29])
        for k in range(150):
            a = r.uniform(0, 2 * np.pi); rr = r.uniform(0, 1) ** 0.6
            cx = bx + lean * S * 0.6 + np.cos(a) * rr * S * 0.36; cy = S * 0.3 + np.sin(a) * rr * S * 0.2 - 0.06 * S * (1 - rr)
            blob(cx, cy, r.uniform(16, 38), r.uniform(9, 20), base * r.uniform(0.75, 1.15), r.uniform(0, 1))
    elif kind in ("oak", "oak2", "ginkgo"):  # broadleaf: full rounded crown built from many leaf clumps
        bx = S / 2; trunk(bx, S - 1, bx + r.uniform(-8, 8), S * 0.5, 10, 6, bark)
        for k in range(4): trunk(bx, S * 0.62, bx + r.uniform(-110, 110), S * r.uniform(0.3, 0.45), 5, 2, bark)
        cy0, rx0, ry0 = (S * 0.4, S * 0.4, S * 0.36) if kind != "ginkgo" else (S * 0.42, S * 0.3, S * 0.4)
        for k in range(260):
            a = r.uniform(0, 2 * np.pi); rr = r.uniform(0, 1) ** 0.55
            cx = bx + np.cos(a) * rr * rx0; cy = cy0 + np.sin(a) * rr * ry0
            if kind == "ginkgo": cx = bx + (cx - bx) * (0.55 + 0.6 * (cy / S))
            blob(cx, cy, r.uniform(15, 34), r.uniform(12, 26), grey * r.uniform(0.78, 1.18), r.uniform(0, 1))
    elif kind == "poplar":                   # tall narrow column (metasequoia / poplar rows)
        bx = S / 2; trunk(bx, S - 1, bx, S * 0.2, 7, 2, bark)
        for k in range(230):
            t = r.uniform(0, 1); cy = S * (0.06 + 0.82 * t); half = S * (0.03 + 0.15 * np.sin(np.clip(t * 1.15, 0, 1) * np.pi) ** 0.7)
            blob(bx + r.uniform(-half, half), cy, r.uniform(12, 24), r.uniform(12, 22), grey * r.uniform(0.78, 1.15), r.uniform(0, 1))
    elif kind == "shrub":
        for k in range(160):
            a = r.uniform(0, np.pi); rr = r.uniform(0, 1) ** 0.6
            blob(S / 2 + np.cos(a) * rr * S * 0.44, S * 0.97 - np.sin(a) * rr * S * 0.6, r.uniform(18, 40), r.uniform(14, 28), grey * r.uniform(0.75, 1.15), r.uniform(0, 1))
    elif kind == "clump":                    # a stand of several crowns, used for distant woods
        for t in range(6):
            bx = S * r.uniform(0.18, 0.82); top = S * r.uniform(0.12, 0.45); wd = S * r.uniform(0.12, 0.2)
            trunk(bx, S - 1, bx, top + 60, 5, 3, bark)
            for k in range(70):
                a = r.uniform(0, 2 * np.pi); rr = r.uniform(0, 1) ** 0.6
                blob(bx + np.cos(a) * rr * wd, top + (S * 0.95 - top) * 0.4 + np.sin(a) * rr * (S - top) * 0.42, r.uniform(14, 30), r.uniform(12, 24), grey * r.uniform(0.75, 1.15), r.uniform(0, 1) + t)
    # leaf-scale breakup + soft edge
    n = fnoise(S, 0.5, seed + 100); col *= (0.86 + 0.28 * n)[..., None]
    a_img = Image.fromarray(rgb(alpha)); a_soft = np.asarray(a_img.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    edge = np.asarray(a_img.filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
    a_fin = np.clip(a_soft * (0.55 + 0.9 * n) * 1.25, 0, 1) * (edge > 0.25)
    # bleed colour outward so mip-mapped edges do not go dark
    cimg = Image.fromarray(rgb(col)); blur = np.asarray(cimg.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
    wb = np.asarray(a_img.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
    fill = blur / np.maximum(wb, 0.02)[..., None]
    col = np.where((alpha > 0.5)[..., None], col, np.clip(fill, 0, 1))
    return np.dstack([rgb(col), rgb(a_fin)])
def trees():
    kinds = ["pine", "pine2", "oak", "oak2", "poplar", "shrub", "clump", "ginkgo"]
    cells = [tree_cell(k, 20 + i) for i, k in enumerate(kinds)]
    top = np.concatenate(cells[:4], 1); bot = np.concatenate(cells[4:], 1)
    Image.fromarray(np.concatenate([top, bot], 0)).save(os.path.join(OUT, "trees.png"), optimize=True); print("trees.png")

# ------------------------------------------------------------------ facades: one bay x one floor per tile, alpha 0 = window glass
def facades():
    S = 256; L = []
    def base(seed, c=0.82, rough=0.03):
        n = fnoise(S, 0.8, seed); img = np.full((S, S, 4), 255, np.float32); img[..., :3] = 255 * (c + rough * (n[..., None] - 0.5) * 2); return img
    def rect(img, x0, y0, x1, y1, colr, a=255):
        img[int(y0 * S):int(y1 * S), int(x0 * S):int(x1 * S), :3] = np.array(colr) * 255; img[int(y0 * S):int(y1 * S), int(x0 * S):int(x1 * S), 3] = a
    glass = (0.20, 0.26, 0.32)
    # 0 apartment front: wide balcony window band with railing, slab line
    a = base(1, 0.84); rect(a, 0, 0.0, 1, 0.07, (0.70, 0.70, 0.68)); rect(a, 0.06, 0.2, 0.94, 0.86, glass, 0)
    rect(a, 0.49, 0.2, 0.51, 0.86, (0.86, 0.86, 0.84)); rect(a, 0.06, 0.52, 0.94, 0.54, (0.8, 0.8, 0.78)); rect(a, 0.04, 0.86, 0.96, 0.9, (0.62, 0.63, 0.62)); L.append(a)
    # 1 plain painted wall with faint panel joints
    b = base(2, 0.84, 0.025); rect(b, 0, 0.0, 1, 0.012, (0.74, 0.74, 0.72)); L.append(b)
    # 2 office curtain wall: glass with mullions and spandrel
    c = base(3, 0.6); rect(c, 0, 0, 1, 1, (0.33, 0.37, 0.41)); rect(c, 0.04, 0.24, 0.96, 0.97, (0.17, 0.25, 0.33), 0)
    rect(c, 0.0, 0.0, 0.04, 1, (0.42, 0.44, 0.46)); rect(c, 0.96, 0, 1, 1, (0.42, 0.44, 0.46)); rect(c, 0, 0, 1, 0.03, (0.45, 0.47, 0.49)); L.append(c)
    # 3 low-rise: punched windows
    d = base(4, 0.8); rect(d, 0.16, 0.26, 0.46, 0.74, glass, 0); rect(d, 0.56, 0.26, 0.86, 0.74, glass, 0)
    rect(d, 0.14, 0.74, 0.48, 0.78, (0.66, 0.66, 0.64)); rect(d, 0.54, 0.74, 0.88, 0.78, (0.66, 0.66, 0.64)); rect(d, 0, 0, 1, 0.02, (0.7, 0.7, 0.68)); L.append(d)
    # 4 house wall: one window, stucco
    e = base(5, 0.84, 0.05); rect(e, 0.32, 0.3, 0.68, 0.72, glass, 0); rect(e, 0.3, 0.72, 0.7, 0.76, (0.6, 0.6, 0.58)); rect(e, 0.49, 0.3, 0.51, 0.72, (0.88, 0.88, 0.86)); L.append(e)
    # 5 industrial sandwich panel: vertical ribs, high strip window
    f = base(6, 0.8, 0.02); xs = np.arange(S); rib = 0.045 * np.sin(xs * 2 * np.pi / 16); f[..., :3] += 255 * rib[None, :, None]
    rect(f, 0.0, 0.08, 1.0, 0.2, (0.3, 0.36, 0.42), 60); rect(f, 0, 0.96, 1, 1, (0.55, 0.56, 0.56)); L.append(f)
    # 6 flat roof: gravel / waterproofing
    g = base(7, 0.62, 0.06); L.append(g)
    # 7 shop front: sign band, large shop window below-level windows above
    h = base(8, 0.8); rect(h, 0.08, 0.22, 0.92, 0.72, glass, 0); rect(h, 0.0, 0.76, 1, 0.98, (0.86, 0.84, 0.8)); rect(h, 0.49, 0.22, 0.51, 0.72, (0.5, 0.5, 0.5)); L.append(h)
    out = []
    for im in L:
        im = np.clip(im, 0, 255).astype(np.uint8); out.append(im[::-1].copy())      # flip so v=0 is the floor line
    save_layers("facade.png", out)

# ------------------------------------------------------------------ bus interior materials
def interior():
    S = 256; L = []
    yy, xx = np.mgrid[0:S, 0:S]
    def flat(seed, c, rough): n = fnoise(S, 0.7, seed); return np.clip(np.array(c)[None, None, :] * (1 + rough * (n[..., None] - 0.5) * 2), 0, 1)
    # 0 seat upholstery: woven velour with a small diamond motif
    weave = 0.5 + 0.5 * np.sin(xx * np.pi / 2) * np.sin(yy * np.pi / 2)
    dia = ((np.abs((xx % 64) - 32) + np.abs((yy % 64) - 32)) < 9).astype(np.float32); dot = (((xx + 32) % 64 - 32) ** 2 + ((yy + 32) % 64 - 32) ** 2 < 20).astype(np.float32)
    f = flat(1, (0.5, 0.5, 0.5), 0.10) * (0.9 + 0.1 * weave[..., None]); f = f * (1 - 0.0 * dia[..., None]) + 0.16 * dia[..., None] * np.array([1.0, 0.85, 0.5]) + 0.10 * dot[..., None]; L.append(f)
    # 1 headrest cover: white cotton
    L.append(flat(2, (0.5, 0.5, 0.5), 0.05) * (0.94 + 0.06 * weave[..., None]))
    # 2 moulded plastic: fine grain
    L.append(flat(3, (0.5, 0.5, 0.5), 0.035))
    # 3 floor vinyl: speckled
    sp = (fnoise(S, 0.0, 4) > 0.86).astype(np.float32); L.append(flat(5, (0.5, 0.5, 0.5), 0.05) + 0.14 * sp[..., None])
    # 4 curtain: vertical pleats
    pl = 0.5 + 0.5 * np.sin(xx * 2 * np.pi / 32 + 0.6 * np.sin(yy * 2 * np.pi / 256)); L.append(flat(6, (0.5, 0.5, 0.5), 0.04) * (0.62 + 0.5 * pl[..., None]))
    # 5 ceiling / wall trim fabric
    L.append(flat(7, (0.5, 0.5, 0.5), 0.07))
    # 6 brushed metal / dark rubber
    br = fnoise(S, 0.2, 8)[:, :1].repeat(S, 1); L.append(np.clip(np.full((S, S, 3), 0.5) * (0.9 + 0.2 * br[..., None]), 0, 1))
    # 7 perforated speaker / vent grille
    gr = ((xx % 12 - 6) ** 2 + (yy % 12 - 6) ** 2 < 9).astype(np.float32); L.append(np.full((S, S, 3), 0.5) * (1 - 0.6 * gr[..., None]))
    save_layers("interior.png", [np.dstack([rgb(l), np.full((S, S, 1), 255, np.uint8)]) for l in L])

if __name__ == "__main__":
    terrain(); trees(); facades(); interior()
