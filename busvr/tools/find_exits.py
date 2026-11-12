"""List the places where ramps leave / join the route, so real IC/JC names can be attached."""
import pickle, numpy as np, pyarrow.parquet as pq, shapely, collections
from geo import fwd, inv
R = pickle.load(open("/opt/data/route_raw.pkl", "rb")); P, S, A, path = R["P"], R["S"], R["A"], R["path"]
t = pq.read_table("/opt/data/roads.parquet", columns=["class", "subclass", "names", "routes", "connectors", "geometry"])
cls = t["class"].to_pylist(); sub = t["subclass"].to_pylist(); conns = t["connectors"].to_pylist()
names = [(n or {}).get("primary") for n in t["names"].to_pylist()]
onroute = set(i for i, a, b in path)
# connector -> segments
c2s = collections.defaultdict(list)
for i, cs in enumerate(conns):
    for c in cs or []: c2s[c["connector_id"]].append((i, c["at"]))
geoms = shapely.from_wkb(t["geometry"].to_pylist())
from scipy.spatial import cKDTree
tree = cKDTree(P)
exits = []
for i in onroute:
    for c in conns[i] or []:
        for j, at in c2s[c["connector_id"]]:
            if j in onroute or sub[j] != "link": continue
            if at > 0.01: continue          # link must START here (diverge), not merge
            g = shapely.get_coordinates(geoms[j]); x, n = fwd(g[0, 0], g[0, 1]); d, k = tree.query([x, n])
            # follow link forward a few hops to find named roads
            seen = {j}; frontier = [j]; found = []
            for hop in range(6):
                nxt = []
                for a_ in frontier:
                    for cc in conns[a_] or []:
                        if cc["at"] < 0.99: continue
                        for b_, at2 in c2s[cc["connector_id"]]:
                            if b_ in seen or b_ in onroute: continue
                            seen.add(b_)
                            if names[b_] and sub[b_] != "link": found.append(names[b_] if cls[b_] != "motorway" else "*" + names[b_])
                            else: nxt.append(b_)
                frontier = nxt
            exits.append((S[k], d, tuple(sorted(set(found)))[:4]))
exits.sort()
cl = []
for s, d, f in exits:
    if cl and s - cl[-1][1] < 1200: cl[-1][1] = s; cl[-1][2] |= set(f)
    else: cl.append([s, s, set(f)])
print(len(cl), "exit clusters")
for a, b, f in cl:
    k = np.searchsorted(S, a); lon, lat = inv(*P[min(k, len(P) - 1)])
    print(f"{a/1000:7.2f} km  {lat:.4f},{lon:.4f}  {', '.join(sorted(f))[:90]}")
pickle.dump(cl, open("/opt/data/exits.pkl", "wb"))
