"""Pack route, terrain tiles, land cover, buildings and other roads into the runtime asset files."""
import pickle, struct, zlib, os, numpy as np
from scipy import ndimage
from scipy.ndimage import gaussian_filter1d
from scipy.spatial import cKDTree
import pyarrow.parquet as pq, shapely
from geo import fwd, inv, LON0, LAT0
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets"); os.makedirs(OUT, exist_ok=True)
R = pickle.load(open("/opt/data/route.pkl", "rb")); EXT = pickle.load(open("/opt/data/extent.pkl", "rb"))
X0, X1, N0, N1 = EXT["X0"], EXT["X1"], EXT["N0"], EXT["N1"]
s, x, n = R["s"], R["x"], R["n"]; N = len(s); STEP = R["STEP"]; kind = R["kind"]; lanes = R["lanes"].astype(float)
def save(name, raw):
    z = zlib.compress(raw, 9); open(os.path.join(OUT, name), "wb").write(struct.pack("<I", len(raw)) + z)
    print(f"{name}: {len(raw)/1e6:.2f} MB -> {len(z)/1e6:.2f} MB", flush=True)
def sstep(a, b, v): t = np.clip((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ---------------- platform extents ----------------
W = lanes * 3.6
extL = np.where(kind == 2, 1.5 * W + 6.2, np.where(kind == 1, 5.6, np.where(kind == 0, lanes * 3.3 + 4.6, 26.0)))
extR = np.where(kind == 2, W / 2 + 3.0, np.where(kind == 1, 5.6, np.where(kind == 0, lanes * 3.3 + 4.6, 44.0)))
tgb = sstep(R["S_TG"] - 320, R["S_TG"] - 90, s) * (1 - sstep(R["S_TG"] + 90, R["S_TG"] + 320, s)); extL += 20 * tgb; extR += 20 * tgb
rb = sstep(R["S_REST"] + 10, R["S_REST"] + 150, s) * (1 - sstep(R["S_REST"] + 640, R["S_REST"] + 800, s)); extR += 128 * rb
extL = gaussian_filter1d(extL, 5); extR = gaussian_filter1d(extR, 5); Wsm = gaussian_filter1d(W, 5)
flags = (R["bridge"].astype(np.uint16) | (R["tunnel"].astype(np.uint16) << 1) | (R["buslane"].astype(np.uint16) << 2) | (R["lit"].astype(np.uint16) << 3) |
         (R["barR"].astype(np.uint16) << 4) | (R["barL"].astype(np.uint16) << 5) | (R["toll"].astype(np.uint16) << 6) | (R["rest"].astype(np.uint16) << 7))
def name48(sn): b = sn.encode("utf-8")[:47]; return b + b"\0" * (48 - len(b))
PT = {"IC": 0, "JC": 1, "REST": 2, "TG": 3, "STOP": 4, "EXIT": 5}; ST = {"signal": 0, "rest": 1}
buf = struct.pack("<4sIf", b"BRT2", N, STEP)
buf += x.astype("<f8").tobytes() + (-n).astype("<f8").tobytes()
for arr in (R["grade"], R["off"], R["v"], R["t"], extL, extR, Wsm): buf += arr.astype("<f4").tobytes()
buf += R["lanes"].astype(np.uint8).tobytes() + kind.astype(np.uint8).tobytes() + flags.astype("<u2").tobytes()
buf += struct.pack("<I", len(R["stops"])) + b"".join(struct.pack("<ffI", a, b, ST[c]) for a, b, c in R["stops"])
buf += struct.pack("<I", len(R["places"])) + b"".join(struct.pack("<fI", a, PT[c]) + name48(b) for a, b, c in R["places"])
buf += struct.pack("<I", len(R["regions"])) + b"".join(struct.pack("<f", a) + name48(b) for a, b in R["regions"])
buf += struct.pack("<8f", R["S_TG"], R["S_REST"], R["S_PARK"], R["S_EXITTOLL"], R["LEAD_S"], R["REST_LANE"], R["total"], R["S_ENTER"])
buf += struct.pack("<2d", LON0, LAT0)
save("route.bin.z", buf)

# ---------------- terrain + land cover tiles ----------------
dem = np.load("/opt/data/dem32c.npy"); lc = np.load("/opt/data/lc16.npy")
H32, W32 = dem.shape
LUT = np.zeros(256, np.uint8); LUT[[10, 20, 30, 40, 50, 60, 80, 90]] = [1, 2, 3, 4, 5, 6, 7, 3]     # tree shrub grass crop built bare water (wetland->grass)
lc = LUT[lc]
lc[lc == 0] = 7                                                                                      # nodata = sea
NT, FT = 1024, 4096
nx, nn = int((X1 - X0) / NT), int((N1 - N0) / NT); fx, fn = int((X1 - X0) / FT), int((N1 - N0) / FT)
mask = np.zeros((nn, nx), bool); mask[np.clip(((n - N0) / NT).astype(int), 0, nn - 1), np.clip(((x - X0) / NT).astype(int), 0, nx - 1)] = True
near = ndimage.binary_dilation(mask, iterations=4)
fm = np.zeros((fn, fx), bool); fm[np.clip(((n - N0) / FT).astype(int), 0, fn - 1), np.clip(((x - X0) / FT).astype(int), 0, fx - 1)] = True
far = ndimage.binary_dilation(fm, structure=ndimage.generate_binary_structure(2, 2), iterations=7)
print("near tiles", near.sum(), "far tiles", far.sum())
def hq(a): return np.clip((a + 64.0) * 16.0 + 0.5, 0, 65535).astype("<u2")
def hblock(r0, c0, step, cnt):          # north-up block of heights, sample (jn, jx) at x = X0 + (c0 + jx*step)*32 ; rows flipped
    rr = np.clip(H32 - 1 - (r0 + np.arange(cnt) * step), 0, H32 - 1); cc = np.clip(c0 + np.arange(cnt) * step, 0, W32 - 1)
    return dem[np.ix_(rr, cc)]
# heights are sampled at pixel centres; treat centre (i+0.5)*32 as node i*32 (half-pixel shift is absorbed everywhere consistently)
hdr = struct.pack("<4s4d6I", b"BTR2", X0, N0, float(NT), float(FT), nx, nn, fx, fn, int(near.sum()), int(far.sum()))
ndir = np.full((nn, nx), -1, "<i4"); fdir = np.full((fn, fx), -1, "<i4"); nb = []; fb = []
HL, WL = lc.shape
k = 0
for jn in range(nn):
    for jx in range(nx):
        if not near[jn, jx]: continue
        ndir[jn, jx] = k; k += 1
        h = hq(hblock(jn * 32, jx * 32, 1, 33)); d = h.copy(); d[:, 1:] = h[:, 1:] - h[:, :-1]
        rr = np.clip(HL - 1 - (jn * 64 + np.arange(64)), 0, HL - 1); c = lc[np.ix_(rr, jx * 64 + np.arange(64))]
        nb.append(d.tobytes() + c.tobytes())
k = 0
lc128 = lc[::-1][:(HL // 8) * 8, :(WL // 8) * 8].reshape(HL // 8, 8, WL // 8, 8)       # north-up, mode per 128 m cell
cnt = np.stack([(lc128 == c).sum(axis=(1, 3)) for c in range(8)], 0); lc128 = cnt.argmax(0).astype(np.uint8); del cnt
for jn in range(fn):
    for jx in range(fx):
        if not far[jn, jx]: continue
        fdir[jn, jx] = k; k += 1
        h = hq(hblock(jn * 128, jx * 128, 4, 33)); d = h.copy(); d[:, 1:] = h[:, 1:] - h[:, :-1]
        fb.append(d.tobytes() + lc128[jn * 32:(jn + 1) * 32, jx * 32:(jx + 1) * 32].tobytes())
save("terrain.bin.z", hdr + ndir.tobytes() + fdir.tobytes() + b"".join(nb) + b"".join(fb))
del dem

# ---------------- route lookup ----------------
rt = cKDTree(np.stack([x, n], 1)); tx = np.gradient(x, STEP); tn = np.gradient(n, STEP); tl = np.hypot(tx, tn); tx /= tl; tn /= tl
def project(px, pn):
    d, i = rt.query(np.stack([px, pn], 1)); lat = (px - x[i]) * tn[i] - (pn - n[i]) * tx[i]; return i, lat, d

# ---------------- buildings ----------------
B = pickle.load(open("/opt/data/buildings.pkl", "rb")); o = B["o"]; bx, bn = B["x"], B["n"]; cls = np.array([c or "" for c in B["cls"]]); sub = np.array([c or "" for c in B["sub"]])
L, Wd, ang, area, hgt, flo = o[:, 0], o[:, 1], o[:, 2], o[:, 3], o[:, 4], o[:, 5]
bt = cKDTree(np.stack([bx, bn], 1)); dens = np.array([len(v) for v in bt.query_ball_point(np.stack([bx, bn], 1), 200.0)])
slab = (Wd >= 9.5) & (Wd <= 19) & (L >= 34) & (L <= 120) & (area > 0.8 * L * Wd * 0.75)
sidx = np.where(slab)[0]; st = cKDTree(np.stack([bx[sidx], bn[sidx]], 1)); sn_ = np.array([len(v) for v in st.query_ball_point(np.stack([bx[sidx], bn[sidx]], 1), 160.0)])
apt = np.zeros(len(L), bool); apt[sidx[sn_ >= 3]] = True
apt |= np.isin(cls, ["apartments"]) & (area > 250)
rng = np.random.default_rng(7); rnd = rng.random(len(L))
typ = np.zeros(len(L), np.uint8); H = np.zeros(len(L))
ind = np.isin(cls, ["industrial", "warehouse", "factory", "manufacture"]) | (sub == "industrial") | ((area > 900) & (Wd > 22) & ~apt)
gh = np.isin(cls, ["greenhouse", "glasshouse"]) | (sub == "agricultural")
com = np.isin(cls, ["commercial", "office", "retail", "hotel", "hospital"]) | (sub == "commercial")
pub = np.isin(cls, ["school", "university", "kindergarten", "public", "college", "civic"]) | np.isin(sub, ["education", "civic"])
small = area < 150
typ[:] = 0; typ[small & (dens < 60)] = 2; typ[apt] = 1; typ[ind] = 3; typ[com] = 4; typ[pub] = 6; typ[gh] = 5
H[:] = np.where(dens > 120, 3 + np.floor(rnd * 4), np.where(dens > 40, 2 + np.floor(rnd * 3), 1 + np.floor(rnd * 2))) * 3.1
H[typ == 2] = np.where(rnd[typ == 2] < 0.7, 3.4, 6.2)
H[typ == 1] = (13 + np.floor(rnd[typ == 1] * 13)) * 2.85
H[typ == 3] = 7 + rnd[typ == 3] * 7
H[typ == 4] = np.where(dens[typ == 4] > 100, 4 + np.floor(rnd[typ == 4] * 9), 2 + np.floor(rnd[typ == 4] * 4)) * 3.6
H[typ == 6] = (3 + np.floor(rnd[typ == 6] * 2)) * 3.6
H[typ == 5] = 3.2
H = np.where(flo > 0, flo * np.where(typ == 1, 2.85, 3.3) + 1.0, H); H = np.where(hgt > 2, hgt, H)
typ[(H > 100) & (typ != 1)] = 4
i, lat, d = project(bx, bn); hd = 0.5 * np.hypot(L, Wd) * 0.75
keep = (L > 3) & (Wd > 2.5) & (area > 18) & ~((lat > -(extL[i] + 5 + hd)) & (lat < extR[i] + 5 + hd) & (d < 400))
# terminal lots
for (i0, sgn) in ((int(R["LEAD_S"] / STEP), 1), (N - 1 - int(100 / STEP), 1)):
    al = (bx - x[i0]) * tx[i0] + (bn - n[i0]) * tn[i0]; la = (bx - x[i0]) * tn[i0] - (bn - n[i0]) * tx[i0]
    keep &= ~((np.abs(al) < 190) & (la > -10) & (la < 230))
print("buildings kept", keep.sum(), "types", np.bincount(typ[keep]))
BT = 512; bnx, bnn = int((X1 - X0) / BT), int((N1 - N0) / BT)
ids = np.where(keep)[0]; tid = ((bn[ids] - N0) / BT).astype(int) * bnx + ((bx[ids] - X0) / BT).astype(int)
order = np.argsort(tid, kind="stable"); ids = ids[order]; tid = tid[order]
rec = np.zeros(len(ids), dtype=[("x", "<f4"), ("n", "<f4"), ("l", "<u2"), ("w", "<u2"), ("h", "<u2"), ("a", "u1"), ("t", "u1")])
rec["x"] = bx[ids] - X0; rec["n"] = bn[ids] - N0; rec["l"] = np.clip(L[ids] * 10, 0, 65535); rec["w"] = np.clip(Wd[ids] * 10, 0, 65535)
rec["h"] = np.clip(H[ids] * 10, 0, 65535); rec["a"] = (np.mod(ang[ids], np.pi) / np.pi * 256).astype(int) % 256; rec["t"] = typ[ids]
ut, first, cntt = np.unique(tid, return_index=True, return_counts=True)
bdir = np.zeros((bnn * bnx, 2), "<u4"); bdir[ut, 0] = first; bdir[ut, 1] = cntt
save("buildings.bin.z", struct.pack("<4sdd f 3I", b"BBD1", X0, N0, float(BT), bnx, bnn, len(ids)) + bdir.tobytes() + rec.tobytes())

# ---------------- other roads ----------------
t = pq.read_table("/opt/data/roads.parquet", columns=["geometry", "class", "subclass", "names", "routes", "road_flags"])
rcls = t["class"].to_pylist(); rsub = t["subclass"].to_pylist(); rfl = t["road_flags"].to_pylist()
geoms = shapely.from_wkb(t["geometry"].to_pylist())
bounds = shapely.bounds(geoms); cx_, cn_ = fwd((bounds[:, 0] + bounds[:, 2]) / 2, (bounds[:, 1] + bounds[:, 3]) / 2)
dd, _ = rt.query(np.stack([cx_, cn_], 1)); cand = np.where(dd < 2600)[0]; print("road candidates", len(cand))
WIDTH = {"motorway": 11.0, "trunk": 13.0, "primary": 12.0, "secondary": 9.0, "tertiary": 6.5}; CLS = {"motorway": 0, "trunk": 1, "primary": 2, "secondary": 3, "tertiary": 4}
grade = R["grade"]; isbr = R["bridge"]; istu = R["tunnel"]
polys = []
for j in cand:
    c = shapely.get_coordinates(geoms[j]); px, pn = fwd(c[:, 0], c[:, 1]); seg = np.hypot(np.diff(px), np.diff(pn)); cum = np.r_[0, np.cumsum(seg)]
    if cum[-1] < 8: continue
    m = np.arange(0, cum[-1] + 1e-6, 12.0); m = np.r_[m, cum[-1]] if cum[-1] - m[-1] > 2 else m
    qx = np.interp(m, cum, px); qn = np.interp(m, cum, pn); f = m / cum[-1]
    br = np.zeros(len(m), bool); tu = np.zeros(len(m), bool)
    for fl in rfl[j] or []:
        a, b = (fl["between"] or [0.0, 1.0]); inr = (f >= a - 1e-6) & (f <= b + 1e-6)
        if "is_bridge" in (fl["values"] or []): br |= inr
        if "is_tunnel" in (fl["values"] or []): tu |= inr
    ri, lat, d = project(qx, qn)
    inside = (lat > -(extL[ri] + 1.5)) & (lat < extR[ri] + 1.5) & (d < 300) & (kind[ri] != 3)
    link = rsub[j] == "link"; wdt = 7.0 if link else WIDTH[rcls[j]]
    yabs = np.full(len(m), np.nan); drop = tu.copy()
    over = inside & br & ~isbr[ri] & ~istu[ri]                 # flagged bridge crossing our road at grade -> overpass
    drop |= inside & ~over & ~isbr[ri] & ~istu[ri]             # at-grade overlap with our platform: cut
    if over.any():
        # each contiguous bridge run that crosses us becomes a level deck; approaches blend to ground at runtime (NaN)
        k = 0
        while k < len(m):
            if br[k]:
                e = k
                while e + 1 < len(m) and br[e + 1]: e += 1
                if over[k:e + 1].any():
                    gi = ri[k:e + 1][over[k:e + 1]]; deck = grade[gi].max() + 6.4
                    yabs[k:e + 1] = deck
                    for q in range(1, 10):                         # 108 m approach ramps, absolute heights filled at runtime by blending
                        for idx in (k - q, e + q):
                            if 0 <= idx < len(m) and np.isnan(yabs[idx]) and not inside[idx]: yabs[idx] = -1000.0 - q   # marker: approach step q
                    drop[k:e + 1] = False
                k = e + 1
            else: k += 1
    # emit runs
    k = 0
    while k < len(m):
        if drop[k]: k += 1; continue
        e = k
        while e + 1 < len(m) and not drop[e + 1] and e - k < 40: e += 1
        if e > k: polys.append((CLS[rcls[j]], 1 if link else 0, wdt, qx[k:e + 1], qn[k:e + 1], yabs[k:e + 1], br[k:e + 1]))
        k = e if (e + 1 < len(m) and not drop[e + 1]) else e + 1
print("road polylines", len(polys), "points", sum(len(p[3]) for p in polys))
RTILE = 1024; rnx, rnn = int((X1 - X0) / RTILE), int((N1 - N0) / RTILE)
ptid = np.array([int((p[4][len(p[4]) // 2] - N0) / RTILE) * rnx + int((p[3][len(p[3]) // 2] - X0) / RTILE) for p in polys]); order = np.argsort(ptid, kind="stable")
body = b""; offs = []; 
for oi in order:
    c_, lk, wdt, qx, qn, ya, br = polys[oi]; offs.append(len(body))
    body += struct.pack("<BBHf", c_, lk, len(qx), wdt)
    arr = np.zeros((len(qx), 4), "<f4"); arr[:, 0] = qx - X0; arr[:, 1] = qn - N0; arr[:, 2] = np.where(np.isnan(ya), -9999.0, ya); arr[:, 3] = br
    body += arr.tobytes()
ut, first, cntt = np.unique(ptid[order], return_index=True, return_counts=True)
rdir = np.zeros((rnn * rnx, 2), "<u4"); rdir[ut, 0] = first; rdir[ut, 1] = cntt
save("roads.bin.z", struct.pack("<4sdd f 3I", b"BRD1", X0, N0, float(RTILE), rnx, rnn, len(polys)) + rdir.tobytes() + np.array(offs, "<u4").tobytes() + body)
