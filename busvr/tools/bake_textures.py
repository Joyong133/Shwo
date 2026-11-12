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
    # urban ground: pale paving with faint slab patches
    r = np.random.default_rng(9); u = np.full((N, N), 0.5, np.float32)
    for _ in range(40):
        x0, y0 = r.integers(0, N, 2); w, hh = r.integers(40, 160, 2); v = r.uniform(-0.035, 0.035)
        ys = (np.arange(y0, y0 + hh) % N)[:, None]; xs = (np.arange(x0, x0 + w) % N)[None, :]; u[ys, xs] += v
    u = u + 0.10 * (fnoise(N, 1.6, 10) - 0.5) + 0.05 * (fnoise(N, 0.3, 16) - 0.5)
    u = np.clip(0.5 + (u - u.mean()), 0, 1); L.append(np.stack([u * 1.01, u, u * 0.98], 2))
    save_layers("terrain.png", [np.dstack([rgb(l), np.full((N, N, 1), 255, np.uint8)]) for l in L])
    a = norm(0.6 * fnoise(256, 0.3, 11) + 0.4 * fnoise(256, 1.4, 12), 0.5, 1.1)
    Image.fromarray(rgb(np.stack([a, a, a], 2))).save(os.path.join(OUT, "asphalt.png"), optimize=True)
    cl = 0.6 * fnoise(512, 2.3, 13) + 0.28 * fnoise(512, 1.4, 14) + 0.12 * fnoise(512, 0.8, 15); cl = (cl - cl.min()) / (cl.max() - cl.min())
    Image.fromarray(rgb(np.stack([cl, cl, cl], 2))).save(os.path.join(OUT, "clouds.png"), optimize=True)

# ------------------------------------------------------------------ tree sprites (4 x 2 cells of 512 px, RGBA)
def tree_cell(kind, seed):
    """One sprite: crown built from overlapping lobes (shaded as rounded masses) with leaf-scale breakup and ragged edges."""
    S = 512; r = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    lobes = []; trunks = []
    bark = np.array([0.30, 0.24, 0.19]); grey = np.array([0.50, 0.52, 0.47])
    def lobe(cx, cy, rx, ry, depth, tone=1.0): lobes.append((cx, cy, rx, ry, depth, tone))
    def trunk(x0, y0, x1, y1, w0, w1): trunks.append((x0, y0, x1, y1, w0, w1))
    base = grey; bx = S / 2
    if kind in ("pine", "pine2"):
        base = np.array([0.33, 0.43, 0.30]) if kind == "pine" else np.array([0.29, 0.40, 0.28])
        lean = r.uniform(-0.05, 0.05) * S
        trunk(bx, S - 1, bx + lean, S * 0.30, 9, 4)
        for k in range(6):
            y = S * r.uniform(0.27, 0.56); x = bx + lean * (1 - (y / S - 0.3)) + r.uniform(-1, 1) * S * 0.26
            trunk(bx + lean * 0.7, y + r.uniform(10, 40), x, y, 4, 2)
            lobe(x, y - 6, r.uniform(55, 95), r.uniform(20, 34), r.uniform(0, 1), r.uniform(0.85, 1.1))
        for k in range(22): lobe(bx + lean + r.uniform(-1, 1) * S * 0.27, S * r.uniform(0.18, 0.44), r.uniform(30, 62), r.uniform(12, 22), r.uniform(0, 1), r.uniform(0.8, 1.15))
    elif kind in ("oak", "oak2", "ginkgo"):
        trunk(bx, S - 1, bx + r.uniform(-6, 6), S * 0.52, 11, 6)
        for k in range(3): trunk(bx, S * 0.66, bx + r.uniform(-90, 90), S * r.uniform(0.36, 0.5), 5, 2)
        cy0, rx0, ry0 = (S * 0.40, S * 0.36, S * 0.31) if kind != "ginkgo" else (S * 0.43, S * 0.24, S * 0.37)
        lobe(bx, cy0, rx0 * 0.75, ry0 * 0.8, 0.2)
        for k in range(34):
            a = r.uniform(0, 2 * np.pi); rr = r.uniform(0.15, 1.0) ** 0.7
            lobe(bx + np.cos(a) * rr * rx0, cy0 + np.sin(a) * rr * ry0, r.uniform(26, 52) * (0.8 if kind == "ginkgo" else 1), r.uniform(22, 44), r.uniform(0, 1), r.uniform(0.86, 1.12))
    elif kind == "poplar":
        trunk(bx, S - 1, bx, S * 0.25, 7, 2)
        for k in range(40):
            t = r.uniform(0, 1); cy = S * (0.07 + 0.80 * t); half = S * (0.03 + 0.11 * np.sin(np.clip(t * 1.15, 0, 1) * np.pi) ** 0.7)
            lobe(bx + r.uniform(-half, half), cy, r.uniform(18, 32), r.uniform(22, 40), r.uniform(0, 1), r.uniform(0.88, 1.1))
    elif kind == "shrub":
        for k in range(30):
            a = r.uniform(0, np.pi); rr = r.uniform(0, 1) ** 0.6
            lobe(S / 2 + np.cos(a) * rr * S * 0.36, S * 0.98 - np.sin(a) * rr * S * 0.5 - 30, r.uniform(30, 56), r.uniform(26, 44), r.uniform(0, 1), r.uniform(0.88, 1.1))
    elif kind == "clump":
        for t in range(5):
            tx = S * r.uniform(0.2, 0.8); top = S * r.uniform(0.14, 0.4); wd = S * r.uniform(0.11, 0.17)
            trunk(tx, S - 1, tx, top + 70, 5, 3)
            for k in range(16):
                a = r.uniform(0, 2 * np.pi); rr = r.uniform(0.1, 0.9)
                lobe(tx + np.cos(a) * rr * wd, top + (S * 0.92 - top) * 0.42 + np.sin(a) * rr * (S - top) * 0.36, r.uniform(22, 40), r.uniform(22, 38), r.uniform(0, 1) + t, r.uniform(0.85, 1.1))
    best = np.full((S, S), -1e9, np.float32); mass = np.full((S, S), -1.0, np.float32); shade = np.zeros((S, S), np.float32); tone = np.ones((S, S), np.float32)
    for (cx, cy, rx, ry, depth, tn) in lobes:
        nx = (xx - cx) / rx; ny = (yy - cy) / ry; d2 = nx * nx + ny * ny
        val = 1 - d2; nz = np.sqrt(np.clip(val, 0, 1))
        sh = 0.52 + 0.24 * (-ny * 0.8 - nx * 0.35) + 0.16 * nz           # light from the upper left
        key = np.where(val > 0, depth * 0.35 + nz * 0.9, -1e9)
        w = key > best
        shade = np.where(w, sh, shade); tone = np.where(w, tn, tone); best = np.where(w, key, best)
        mass = np.maximum(mass, val)
    n1 = fnoise(S, 1.3, seed + 100); n2 = fnoise(S, 0.75, seed + 101); n3 = fnoise(S, 1.0, seed + 102); n4 = fnoise(S, 0.35, seed + 103)
    n2 = np.clip((n2 - n2.mean()) / n2.std() * 0.22 + 0.5, 0, 1); n4 = np.clip((n4 - n4.mean()) / n4.std() * 0.22 + 0.5, 0, 1)
    edge = mass + 0.50 * (n1 - 0.5) + 0.45 * (n2 - 0.5)
    alpha = (edge > 0.16).astype(np.float32)
    holes = (n3 > 0.70) & (mass < 0.55)                                   # sky showing through the outer foliage
    alpha[holes] = 0
    leaf = (0.50 + 1.0 * n2 + 0.3 * (n1 - 0.5)) * np.where(n4 < 0.36, 0.62, 1.0)   # leaf clumps and the dark gaps between them
    inner = np.clip(mass * 1.4, 0.35, 1.0)                                 # edges of masses fall into shadow
    col = base[None, None, :] * (shade * leaf * tone * (0.75 + 0.25 * inner))[..., None]
    # trunk and branches behind the foliage
    timg = Image.new("L", (S, S), 0); dr = ImageDraw.Draw(timg)
    for (x0, y0, x1, y1, w0, w1) in trunks:
        n = 24
        for i in range(n):
            t0, t1 = i / n, (i + 1) / n; w = w0 + (w1 - w0) * t0
            dr.line([(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0), (x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1)], fill=255, width=int(max(w * 2, 2)))
    tm = np.asarray(timg).astype(np.float32) / 255
    tcol = bark[None, None, :] * (0.75 + 0.5 * n2)[..., None] * (0.8 + 0.4 * (xx / S))[..., None]
    showt = (tm > 0.5) & (alpha < 0.5)
    col = np.where(showt[..., None], tcol, col); alpha = np.maximum(alpha, showt.astype(np.float32))
    a_img = Image.fromarray(rgb(alpha)); a_fin = np.asarray(a_img.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
    cimg = Image.fromarray(rgb(col * alpha[..., None])); blur = np.asarray(cimg.filter(ImageFilter.GaussianBlur(7))).astype(np.float32) / 255
    wb = np.asarray(a_img.filter(ImageFilter.GaussianBlur(7))).astype(np.float32) / 255
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
    pl = 0.5 + 0.5 * np.sin(yy * 2 * np.pi / 32 + 0.6 * np.sin(xx * 2 * np.pi / 256)); L.append(flat(6, (0.5, 0.5, 0.5), 0.04) * (0.62 + 0.5 * pl[..., None]))
    # 5 ceiling / wall trim fabric
    L.append(flat(7, (0.5, 0.5, 0.5), 0.07))
    # 6 brushed metal / dark rubber
    br = fnoise(S, 0.2, 8)[:, :1].repeat(S, 1); L.append(np.clip(np.full((S, S, 3), 0.5) * (0.9 + 0.2 * br[..., None]), 0, 1))
    # 7 perforated speaker / vent grille
    gr = ((xx % 12 - 6) ** 2 + (yy % 12 - 6) ** 2 < 9).astype(np.float32); L.append(np.full((S, S, 3), 0.5) * (1 - 0.6 * gr[..., None]))
    save_layers("interior.png", [np.dstack([rgb(l), np.full((S, S, 1), 255, np.uint8)]) for l in L])

if __name__ == "__main__":
    terrain(); trees(); facades(); interior()
