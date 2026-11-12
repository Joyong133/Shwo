"""Route Seoul Express Bus Terminal -> Busan Central Bus Terminal over the real road graph."""
import heapq, math, pickle, sys
import numpy as np, pyarrow.parquet as pq, shapely
from geo import fwd
START = (127.00476, 37.50468)   # 서울고속버스터미널 (경부선) 앞 신반포로
END = (129.09492, 35.28467)     # 부산종합버스터미널 (노포동) 앞 중앙대로
SPEED = {"motorway": 100, "trunk": 60, "primary": 45, "secondary": 35, "tertiary": 25}
t = pq.read_table("/opt/data/roads.parquet", columns=["id", "geometry", "class", "subclass", "names", "routes", "road_flags", "connectors", "speed_limits"])
cls = t["class"].to_pylist(); sub = t["subclass"].to_pylist()
names = [(n or {}).get("primary") for n in t["names"].to_pylist()]
routes = t["routes"].to_pylist(); flags = t["road_flags"].to_pylist(); conns = t["connectors"].to_pylist()
geoms = shapely.from_wkb(t["geometry"].to_pylist())
N = len(cls); print("segments", N, flush=True)
coords = []
for g in geoms:
    c = shapely.get_coordinates(g); x, n = fwd(c[:, 0], c[:, 1]); coords.append(np.stack([x, n], 1))
cid = {}; cpos = []
def node(c, p):
    i = cid.get(c)
    if i is None: i = cid[c] = len(cpos); cpos.append(p)
    return i
adj = {}
def pt_at(i, f):
    c = coords[i]; d = np.r_[0, np.cumsum(np.hypot(*np.diff(c, axis=0).T))]
    s = f * d[-1]; k = min(max(np.searchsorted(d, s) - 1, 0), len(c) - 2)
    u = (s - d[k]) / max(d[k + 1] - d[k], 1e-9); return c[k] + u * (c[k + 1] - c[k]), d[-1]
for i in range(N):
    cs = sorted(conns[i] or [], key=lambda c: c["at"])
    if len(cs) < 2: continue
    is_gb = any((r.get("ref") == "1") for r in (routes[i] or [])) or names[i] == "경부고속도로"
    v = SPEED[cls[i]] * (0.5 if sub[i] == "link" else 1.0)
    pen = 1.0 if (cls[i] != "motorway" or is_gb or sub[i] == "link") else 3.0
    oneway = cls[i] == "motorway" or sub[i] == "link"
    prev = None
    for c in cs:
        p, L = pt_at(i, c["at"]); nd = node(c["connector_id"], p)
        if prev is not None and c["at"] > prev[1]:
            w = (c["at"] - prev[1]) * L / v * pen
            adj.setdefault(prev[0], []).append((nd, w, i, prev[1], c["at"]))
            if not oneway: adj.setdefault(nd, []).append((prev[0], w, i, c["at"], prev[1]))
        prev = (nd, c["at"])
cpos = np.array(cpos); print("nodes", len(cpos), flush=True)
def nearest(lonlat, need_out=True):
    p = np.array(fwd(*lonlat)); d = np.hypot(*(cpos - p).T); order = np.argsort(d)
    for j in order[:50]:
        if (j in adj) == need_out or not need_out: return int(j), d[j]
s, ds = nearest(START); e, de = nearest(END, False); print("snap", ds, de)
dist = {s: 0.0}; prev = {}; pq_ = [(0.0, s)]
while pq_:
    d, u = heapq.heappop(pq_)
    if u == e: break
    if d > dist.get(u, 1e18): continue
    for (v, w, i, a, b) in adj.get(u, ()):
        nd = d + w
        if nd < dist.get(v, 1e18): dist[v] = nd; prev[v] = (u, i, a, b); heapq.heappush(pq_, (nd, v))
path = []; u = e
while u != s: pu, i, a, b = prev[u]; path.append((i, a, b)); u = pu
path.reverse(); print("edges", len(path))
# stitch geometry with per-vertex attributes
P = []; A = []   # points, (class, link, name, bridge, tunnel, maxspeed)
def sub_line(i, a, b):
    c = coords[i]; d = np.r_[0, np.cumsum(np.hypot(*np.diff(c, axis=0).T))]; L = d[-1]
    lo, hi = min(a, b) * L, max(a, b) * L
    pts = [(lo, pt_at(i, min(a, b))[0])] + [(d[k], c[k]) for k in range(len(c)) if lo < d[k] < hi] + [(hi, pt_at(i, max(a, b))[0])]
    if a > b: pts.reverse()
    return [(s_ / max(L, 1e-9), p) for s_, p in pts]
for (i, a, b) in path:
    fl = flags[i] or []
    ms = 0
    for sl in (t["speed_limits"][i].as_py() or []):
        if sl.get("when") is None and sl.get("max_speed"): ms = sl["max_speed"]["value"]
    for f, p in sub_line(i, a, b):
        br = any("is_bridge" in (x["values"] or []) and (x["between"] is None or x["between"][0] <= f <= x["between"][1]) for x in fl)
        tu = any("is_tunnel" in (x["values"] or []) and (x["between"] is None or x["between"][0] <= f <= x["between"][1]) for x in fl)
        if P and np.hypot(*(P[-1] - p)) < 0.05: continue
        P.append(p); A.append((cls[i], sub[i] == "link", names[i], br, tu, ms))
P = np.array(P); seglen = np.hypot(*np.diff(P, axis=0).T); S = np.r_[0, np.cumsum(seglen)]
print("route km", S[-1] / 1000, "verts", len(P))
pickle.dump({"P": P, "S": S, "A": A, "path": path}, open("/opt/data/route_raw.pkl", "wb"))
# summary
runs = []; cur = None
for k, a in enumerate(A):
    key = (a[0], a[1], a[2])
    if key != cur: runs.append([S[k], key]); cur = key
for r in runs[:40] + [["..."]] + runs[-25:]: print(r)
nb = sum(1 for k in range(1, len(A)) if A[k][3] and not A[k - 1][3]); nt = sum(1 for k in range(1, len(A)) if A[k][4] and not A[k - 1][4])
print("bridges", nb, "tunnels", nt)
