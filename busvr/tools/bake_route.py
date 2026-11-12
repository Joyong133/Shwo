"""Smooth + resample the route, derive grade, lanes, flags, speed profile and bus lateral offset."""
import pickle, numpy as np
from scipy.ndimage import gaussian_filter1d, grey_opening, uniform_filter, uniform_filter1d
from scipy.spatial import cKDTree
from geo import fwd, inv
STEP = 5.0
R = pickle.load(open("/opt/data/route_raw.pkl", "rb")); P, S, A = R["P"], R["S"], R["A"]
EXT = pickle.load(open("/opt/data/extent.pkl", "rb")); X0, N1 = EXT["X0"], EXT["N1"]

# ---------- bare-earth-ish DEM: knock building bumps out of built-up areas ----------
try:
    dem = np.load("/opt/data/dem32c.npy")
except FileNotFoundError:
    dem = np.load("/opt/data/dem32.npy"); lc = np.load("/opt/data/lc16.npy")
    b = (lc == 50).astype(np.float32); b = (b[0::2, 0::2] + b[1::2, 0::2] + b[0::2, 1::2] + b[1::2, 1::2]) / 4
    fb = uniform_filter(b, 7); w = np.clip((fb - 0.2) / 0.3, 0, 1)
    op = grey_opening(dem, size=(7, 7)); op = uniform_filter(op, 3)
    dem = dem * (1 - w) + op * w; np.save("/opt/data/dem32c.npy", dem.astype(np.float32)); del lc, b, fb, w, op
def dem_at(x, n):
    c = (x - X0) / 32 - 0.5; r = (N1 - n) / 32 - 0.5
    c0 = np.clip(np.floor(c).astype(int), 0, dem.shape[1] - 2); r0 = np.clip(np.floor(r).astype(int), 0, dem.shape[0] - 2)
    fc, fr = c - c0, r - r0
    return (dem[r0, c0] * (1 - fc) + dem[r0, c0 + 1] * fc) * (1 - fr) + (dem[r0 + 1, c0] * (1 - fc) + dem[r0 + 1, c0 + 1] * fc) * fr

# ---------- raw polyline + terminal lead-in / lead-out ----------
t0 = P[3] - P[0]; t0 /= np.hypot(*t0); r0 = np.array([t0[1], -t0[0]])
te = P[-1] - P[-4]; te /= np.hypot(*te); re = np.array([te[1], -te[0]])
lead_in = np.array([P[0] - t0 * 26 + r0 * 96, P[0] - t0 * 26 + r0 * 30, P[0] - t0 * 26 + r0 * 3])
lead_out = np.array([P[-1] + te * 24 + re * 3, P[-1] + te * 24 + re * 34, P[-1] + te * 24 + re * 92])
KIND = {"city": 0, "ramp": 1, "exp": 2, "lot": 3}
def kind_of(a):
    if a[0] in ("motorway", "trunk"): return 1 if a[1] else 2
    return 0
kraw = np.array([kind_of(a) for a in A]); braw = np.array([a[3] for a in A]); traw = np.array([a[4] for a in A]); mraw = np.array([a[5] for a in A])
PP = np.vstack([lead_in, P, lead_out])
kk = np.r_[[3] * 3, kraw, [3] * 3]; bb = np.r_[[0] * 3, braw, [0] * 3].astype(bool); tt = np.r_[[0] * 3, traw, [0] * 3].astype(bool); mm = np.r_[[0] * 3, mraw, [0] * 3]
SS = np.r_[0, np.cumsum(np.hypot(*np.diff(PP, axis=0).T))]
LEAD = SS[3]                                    # raw-route km 0 sits at this arc length
sd = np.arange(0, SS[-1], 1.0); idx = np.clip(np.searchsorted(SS, sd, side="right") - 1, 0, len(PP) - 2)
u = (sd - SS[idx]) / np.maximum(SS[idx + 1] - SS[idx], 1e-9)
xd = PP[idx, 0] + u * (PP[idx + 1, 0] - PP[idx, 0]); nd = PP[idx, 1] + u * (PP[idx + 1, 1] - PP[idx, 1])
kd = kk[idx].copy(); kd[kk[idx + 1] == 3] = 3 if True else 0
kd = np.where((kk[idx] == 3) | (kk[idx + 1] == 3), 3, kk[idx])
bd = bb[idx] & bb[idx + 1]; td = tt[idx] & tt[idx + 1]; md = mm[idx]
def smooth(v, sig):
    pad = int(sig * 4); e0 = v[0] + (v[0] - v[1]) * np.arange(pad, 0, -1); e1 = v[-1] + (v[-1] - v[-2]) * np.arange(1, pad + 1)
    return gaussian_filter1d(np.r_[e0, v, e1], sig)[pad:-pad]
wexp = gaussian_filter1d((kd == 2).astype(float), 40); wramp = gaussian_filter1d((kd == 1).astype(float), 20) * (1 - wexp)
def blend(v): return smooth(v, 9) * (1 - wexp - wramp) + smooth(v, 14) * wramp + smooth(v, 26) * wexp
xs, ns = blend(xd), blend(nd)
sl = np.r_[0, np.cumsum(np.hypot(np.diff(xs), np.diff(ns)))]
s = np.arange(0, sl[-1], STEP); N = len(s)
x = np.interp(s, sl, xs); n = np.interp(s, sl, ns); j = np.clip(np.searchsorted(sl, s), 0, len(sd) - 1)
kind = kd[j]; bridge = bd[j]; tunnel = td[j]; ms = md[j]; rawkm = (sd[j] - LEAD) / 1000.0
LEAD_S = float(np.interp(LEAD, sd, sl))
def S_of_km(km): return float(np.interp(km * 1000 + LEAD, sd, sl))          # raw-route km -> final arc length
print("samples", N, "length km", s[-1] / 1000, "lead", LEAD_S)
tx = np.gradient(x, STEP); tn = np.gradient(n, STEP); tl = np.hypot(tx, tn); tx /= tl; tn /= tl
hd = np.unwrap(np.arctan2(tn, tx)); curv = np.gradient(uniform_filter1d(hd, 5), STEP)        # +ve = turning left
rad = 1.0 / np.maximum(np.abs(curv), 1e-5)

# ---------- grade ----------
g = dem_at(x, n).astype(np.float64)
def runs(mask):
    out = []; i = 0
    while i < N:
        if mask[i]:
            k = i
            while k + 1 < N and mask[k + 1]: k += 1
            out.append((i, k)); i = k + 1
        else: i += 1
    return out
struct = bridge | tunnel
for a, b in runs(struct):
    a0 = max(a - 6, 0); b0 = min(b + 6, N - 1)
    ga = g[max(a0 - 4, 0):a0 + 1].mean(); gb = g[b0:b0 + 5].mean()
    g[a0:b0 + 1] = np.linspace(ga, gb, b0 - a0 + 1)
sig = np.where(kind == 2, 70, np.where(kind == 1, 40, 20)) / STEP
ga = gaussian_filter1d(g, 14); gb_ = gaussian_filter1d(g, 8); gc = gaussian_filter1d(g, 4)
grade = np.where(kind == 2, ga, np.where(kind == 1, gb_, gc)); grade = gaussian_filter1d(grade, 3)
for it in range(40):
    sl_ = np.gradient(grade, STEP); bad = uniform_filter1d((np.abs(sl_) > 0.055).astype(float), 41) > 0
    if not bad.any(): break
    grade = np.where(bad, gaussian_filter1d(grade, 30), grade); grade = gaussian_filter1d(grade, 2)
print("grade max slope", np.abs(np.gradient(grade, STEP)).max(), "elev range", grade.min(), grade.max())

# ---------- lanes / flags ----------
def km_range(a, b): return (s >= S_of_km(a)) & (s < S_of_km(b))
lanes = np.full(N, 3, np.uint8)
for a, b, L in [(2.2, 6.3, 4), (6.3, 34.6, 5), (34.6, 153.5, 4), (153.5, 238.3, 3), (238.3, 299.1, 4), (299.1, 417.0, 3)]:
    lanes[km_range(a, b) & (kind == 2)] = L
lanes[kind == 1] = 2; lanes[kind == 0] = 3; lanes[kind == 3] = 1
lanes[km_range(417.1, 418.0) & (kind == 0)] = 2
buslane = km_range(2.2, 139.8) & (kind == 2)
B = pickle.load(open("/opt/data/buildings.pkl", "rb")); bt = cKDTree(np.stack([B["x"], B["n"]], 1))
barR = np.zeros(N, bool); barL = np.zeros(N, bool)
for i in range(0, N, 4):
    if kind[i] != 2 or tunnel[i]: continue
    ids = bt.query_ball_point([x[i], n[i]], 170.0)
    if not ids: continue
    lat = (B["x"][ids] - x[i]) * tn[i] - (B["n"][ids] - n[i]) * tx[i]          # +ve = right of travel
    barR[i:i + 4] = (lat > 25).sum() >= 9; barL[i:i + 4] = (lat < -45).sum() >= 9
def clean(m, close=60, minlen=50):
    m = m.copy()
    for a, b in runs(~m):
        if b - a < close and a > 0 and b < N - 1: m[a:b + 1] = True
    for a, b in runs(m):
        if b - a < minlen: m[a:b + 1] = False
    return m
barR = clean(barR) & ~bridge; barL = clean(barL) & ~bridge

# ---------- named places ----------
PLACES = [  # raw km of ramp diverge, name, type
 (3.54, "서초IC", "IC"), (6.04, "양재IC", "IC"), (12.81, "판교JC", "JC"), (18.30, "서울요금소", "TG"), (26.82, "신갈JC", "JC"), (29.99, "수원신갈IC", "IC"),
 (33.17, "기흥휴게소", "REST"), (34.53, "기흥IC", "IC"), (39.57, "동탄JC", "JC"), (43.88, "오산IC", "IC"), (50.37, "남사진위IC", "IC"), (56.20, "안성JC", "JC"),
 (59.65, "안성휴게소", "REST"), (61.92, "안성IC", "IC"), (67.29, "입장거봉포도휴게소", "REST"), (73.73, "북천안IC", "IC"), (78.39, "망향휴게소", "REST"), (81.98, "천안IC", "IC"),
 (87.98, "천안JC", "JC"), (91.83, "목천IC", "IC"), (105.23, "옥산JC", "JC"), (113.15, "옥산휴게소", "REST"), (116.95, "청주IC", "IC"), (125.08, "남이JC", "JC"),
 (128.92, "남청주IC", "IC"), (134.10, "죽암휴게소", "REST"), (139.79, "신탄진IC", "IC"), (143.84, "회덕JC", "JC"), (149.79, "대전IC", "IC"), (153.53, "비룡JC", "JC"),
 (162.25, "옥천IC", "IC"), (165.96, "옥천휴게소", "REST"), (173.23, "금강휴게소", "REST"), (189.21, "영동IC", "IC"), (199.42, "황간IC", "IC"), (206.97, "추풍령휴게소", "STOP"),
 (214.53, "김천휴게소", "REST"), (221.33, "김천IC", "IC"), (229.21, "동김천IC", "IC"), (238.28, "김천JC", "JC"), (242.30, "북구미IC", "IC"), (249.62, "구미IC", "IC"),
 (254.55, "남구미IC", "IC"), (263.24, "칠곡휴게소", "REST"), (268.19, "왜관IC", "IC"), (271.37, "칠곡물류IC", "IC"), (277.69, "칠곡JC", "JC"), (281.83, "금호JC", "JC"),
 (287.43, "북대구IC", "IC"), (294.64, "도동JC", "JC"), (299.06, "동대구JC", "JC"), (308.55, "경산IC", "IC"), (315.88, "평사휴게소", "REST"), (324.99, "영천IC", "IC"),
 (342.90, "건천IC", "IC"), (345.70, "건천휴게소", "REST"), (353.60, "경주IC", "IC"), (362.50, "경주휴게소", "REST"), (364.46, "활천IC", "IC"), (378.23, "언양휴게소", "REST"),
 (381.17, "언양JC", "JC"), (383.07, "서울산IC", "IC"), (387.31, "울주JC", "JC"), (389.44, "통도사IC", "IC"), (403.57, "양산IC", "IC"), (408.54, "양산JC", "JC"),
 (415.17, "노포JC", "JC"), (416.72, "노포IC", "EXIT")]
REGIONS = [(0, "서울특별시 서초구"), (8.2, "경기도 성남시"), (20.5, "경기도 용인시"), (33.5, "경기도 화성시"), (41.5, "경기도 오산시"), (47.5, "경기도 용인시"),
 (52.0, "경기도 안성시"), (66.0, "충청남도 천안시"), (101.5, "충청북도 청주시"), (137.5, "대전광역시"), (156.0, "충청북도 옥천군"), (178.0, "충청북도 영동군"),
 (211.0, "경상북도 김천시"), (240.5, "경상북도 구미시"), (257.0, "경상북도 칠곡군"), (276.0, "대구광역시"), (301.0, "경상북도 경산시"), (317.0, "경상북도 영천시"),
 (334.0, "경상북도 경주시"), (368.0, "울산광역시 울주군"), (392.0, "경상남도 양산시"), (412.0, "부산광역시 금정구")]
places = [(S_of_km(km), nm, ty) for km, nm, ty in PLACES]
lit = (kind != 2) | tunnel
for sp, nm, ty in places:
    a = 500 if ty in ("IC", "REST") else 800
    lit |= (s > sp - a) & (s < sp + a)
lit |= km_range(2.2, 9.0)
S_TG = S_of_km(18.30); S_REST = S_of_km(206.97); S_EXITTOLL = S_of_km(416.95)
toll = (np.abs(s - S_TG) < 140)
rest = (s > S_REST - 30) & (s < S_REST + 820)

# ---------- bus lateral offset ----------
W = lanes * 3.6
def lane_c(L, i): return -np.asarray(L, float) * 3.6 / 2 + (np.asarray(i, float) - 0.5) * 3.6
off = np.zeros(N)
m2 = kind == 2
off[m2] = np.where(buslane[m2], lane_c(lanes[m2], 1), lane_c(lanes[m2], 2))
off[kind == 0] = 2.0
S_ENTER = s[np.argmax(m2)]; S_LEAVE = s[len(m2) - 1 - np.argmax(m2[::-1])]
right = lane_c(lanes, lanes)
k = m2 & (s < S_ENTER + 260); off[k] = right[k] + 1.9          # merge lane on entering (wider at ramp nose)
k = m2 & (s >= S_ENTER + 260) & (s < S_ENTER + 520); off[k] = right[k]
k = m2 & (s > S_LEAVE - 1500); off[k] = right[k]
k = m2 & (s > S_LEAVE - 220); off[k] = right[k] + 1.9
k = m2 & (s > S_REST - 1300) & (s < S_REST); off[k] = right[k]            # move right before the rest area
k = m2 & (s >= S_REST + 800) & (s < S_REST + 1300); off[k] = right[k]
off = gaussian_filter1d(off, 26)                                          # ~130 m lane-change blends
REST_LANE = 58.0; S_PARK = S_REST + 400
def sstep(a, b, v): t_ = np.clip((v - a) / (b - a), 0, 1); return t_ * t_ * (3 - 2 * t_)
det = sstep(S_REST - 10, S_REST + 230, s) * (1 - sstep(S_REST + 560, S_REST + 800, s))
off = off * (1 - det) + det * (right + 3.6 / 2 + 3.0 + REST_LANE)
off[kind == 3] = 0
off = gaussian_filter1d(off, 2)

# ---------- speed profile ----------
def profile(f):
    cap = np.where(kind == 2, f, np.where(kind == 1, 58, np.where(kind == 0, 50, 14))) / 3.6
    # path curvature incl. lateral offset changes
    cap = np.minimum(cap, np.sqrt(1.15 * rad))
    cap[kind == 3] = np.minimum(cap[kind == 3], 14 / 3.6)
    cap[np.abs(s - S_TG) < 90] = np.minimum(cap[np.abs(s - S_TG) < 90], 60 / 3.6)
    cap[np.abs(s - S_EXITTOLL) < 40] = np.minimum(cap[np.abs(s - S_EXITTOLL) < 40], 30 / 3.6)
    inrest = (s > S_REST + 40) & (s < S_REST + 700); cap[inrest] = np.minimum(cap[inrest], np.where(np.abs(s[inrest] - S_PARK) < 150, 22, 50) / 3.6)
    cap = uniform_filter1d(cap, 5)
    v = cap.copy()
    for i_ in STOPS_I: v[i_] = 0
    v[0] = 0; v[-1] = 0
    for i in range(1, N):
        a_ = max(0.3, 0.9 - 0.02 * v[i - 1]); v[i] = min(v[i], np.sqrt(v[i - 1] ** 2 + 2 * a_ * STEP))
    for i in range(N - 2, -1, -1):
        v[i] = min(v[i], np.sqrt(v[i + 1] ** 2 + 2 * 0.95 * STEP))
    return v
def drive_time(v):
    vm = np.maximum((v[:-1] + v[1:]) / 2, 0.35); return np.r_[0, np.cumsum(STEP / vm)]
STOPS = [(LEAD_S + 446, 22.0, "signal"), (LEAD_S + 772, 26.0, "signal"), (S_PARK, 900.0, "rest"), (S_of_km(417.955), 20.0, "signal")]
STOPS_I = [int(round(sp / STEP)) for sp, d, ty in STOPS]
TOTAL = 4 * 3600 + 15 * 60; dwell = sum(d for _, d, _ in STOPS)
lo, hi = 90.0, 113.0
for it in range(30):
    f = (lo + hi) / 2; T = drive_time(profile(f))[-1] + dwell
    if T > TOTAL: lo = f
    else: hi = f
v = profile(f); tt_ = drive_time(v)
print("cruise kmh", f, "=> trip", (tt_[-1] + dwell) / 3600, "h; max kmh", v.max() * 3.6, "mean expressway kmh", v[kind == 2].mean() * 3.6)

out = dict(STEP=STEP, s=s, x=x, n=n, grade=grade, kind=kind, lanes=lanes, bridge=bridge, tunnel=tunnel, buslane=buslane, barR=barR, barL=barL, lit=lit, toll=toll,
           rest=rest, off=off, v=v, t=tt_, hd=hd, curv=curv, rawkm=rawkm, places=places, stops=STOPS, stops_i=STOPS_I, regions=[(S_of_km(a), b) for a, b in REGIONS],
           S_TG=S_TG, S_REST=S_REST, S_PARK=S_PARK, S_EXITTOLL=S_EXITTOLL, S_ENTER=S_ENTER, S_LEAVE=S_LEAVE, LEAD_S=LEAD_S, REST_LANE=REST_LANE, total=TOTAL,
           lonlat=np.stack(inv(x, n), 1), raw_dem=dem_at(x, n))
pickle.dump(out, open("/opt/data/route.pkl", "wb"))
print("bridges", len(runs(bridge)), "tunnels", [(round(s[a] / 1000, 1), int((b - a) * STEP)) for a, b in runs(tunnel)])
print("barrier R km", barR.sum() * STEP / 1000, "L km", barL.sum() * STEP / 1000, "lit km", lit.sum() * STEP / 1000)
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
fig, ax = plt.subplots(3, 1, figsize=(16, 9))
ax[0].plot(s / 1000, out["raw_dem"], lw=0.4, c="gray"); ax[0].plot(s / 1000, grade, lw=0.8, c="r"); ax[0].set_ylabel("elev m")
ax[1].plot(s / 1000, v * 3.6, lw=0.6); ax[1].set_ylabel("km/h")
ax[2].plot(x / 1000, n / 1000, lw=1); ax[2].set_aspect("equal")
for sp, nm, ty in places[::6]: i = int(sp / STEP); ax[2].annotate(str(round(sp / 1000)), (x[i] / 1000, n[i] / 1000), fontsize=7)
plt.tight_layout(); plt.savefig("/opt/data/out/route_profile.png", dpi=70)
