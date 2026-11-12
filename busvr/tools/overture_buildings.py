"""Download building footprints within 4 km of the route and reduce each to an oriented box."""
import json, pickle, sys, concurrent.futures as cf
import numpy as np, pyarrow as pa, pyarrow.parquet as pq, pyarrow.compute as pc, shapely
from scipy import ndimage
from httpfile import HttpFile
from geo import fwd
BASE = "https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com/"
groups = json.load(open("/opt/data/bld_groups.json"))
R = pickle.load(open("/opt/data/route_raw.pkl", "rb")); P = R["P"]
CELL = 100.0; X0, N0 = P[:, 0].min() - 6000, P[:, 1].min() - 6000
W = int((P[:, 0].max() + 6000 - X0) / CELL) + 1; H = int((P[:, 1].max() + 6000 - N0) / CELL) + 1
mask = np.zeros((H, W), bool)
for a, b in zip(P[:-1], P[1:]):
    n = max(int(np.hypot(*(b - a)) / 40) + 1, 1)
    for u in np.linspace(0, 1, n + 1):
        q = a + u * (b - a); mask[int((q[1] - N0) / CELL), int((q[0] - X0) / CELL)] = True
mask = ndimage.binary_dilation(mask, iterations=40)   # 4 km
BOX = (126.85, 35.15, 129.25, 37.62)
def work(job):
    key, g = job
    pf = pq.ParquetFile(HttpFile(BASE + key, block=1 << 22))
    bb = pf.read_row_group(g, columns=["bbox"])["bbox"]
    xm = (pc.struct_field(bb, "xmin").to_numpy() + pc.struct_field(bb, "xmax").to_numpy()) / 2
    ym = (pc.struct_field(bb, "ymin").to_numpy() + pc.struct_field(bb, "ymax").to_numpy()) / 2
    inb = (xm > BOX[0]) & (xm < BOX[2]) & (ym > BOX[1]) & (ym < BOX[3])
    if not inb.any(): return None
    x, n = fwd(xm, ym); ix = ((x - X0) / CELL).astype(int); iy = ((n - N0) / CELL).astype(int)
    ok = inb & (ix >= 0) & (ix < W) & (iy >= 0) & (iy < H); ok[ok] = mask[iy[ok], ix[ok]]
    if not ok.any(): return None
    t = pf.read_row_group(g, columns=["geometry", "height", "num_floors", "class", "subtype"]).filter(pa.array(ok))
    geoms = shapely.from_wkb(t["geometry"].to_numpy(zero_copy_only=False))
    def tf(c): xx, nn = fwd(c[:, 0], c[:, 1]); return np.stack([xx, nn], 1)
    geoms = shapely.transform(geoms, tf)
    area = shapely.area(geoms)
    env = shapely.oriented_envelope(geoms)
    out = np.zeros((len(geoms), 9), np.float32); cx = np.zeros(len(geoms)); cn = np.zeros(len(geoms))
    for i, e in enumerate(env):
        if e is None or e.geom_type != "Polygon": out[i, 0] = -1; continue
        c = np.asarray(e.exterior.coords)[:4]; a = c[1] - c[0]; b = c[2] - c[1]
        la, lb = np.hypot(*a), np.hypot(*b)
        if la < lb: a, b, la, lb = b, a, lb, la
        ctr = c.mean(0); cx[i], cn[i] = ctr
        out[i, 0:3] = la, lb, np.arctan2(a[1], a[0])
    out[:, 3] = area
    out[:, 4] = np.nan_to_num(t["height"].to_numpy(zero_copy_only=False).astype(np.float32), nan=0)
    out[:, 5] = np.nan_to_num(t["num_floors"].to_numpy(zero_copy_only=False).astype(np.float32), nan=0)
    cl = t["class"].to_pylist(); st = t["subtype"].to_pylist()
    return cx, cn, out, cl, st
if __name__ == "__main__":
    jobs = [(k, g) for k, gs in groups.items() for g in gs]
    CX, CN, O, CL, ST = [], [], [], [], []
    with cf.ThreadPoolExecutor(8) as ex:
        for i, r in enumerate(ex.map(work, jobs)):
            if r is not None:
                CX.append(r[0]); CN.append(r[1]); O.append(r[2]); CL += r[3]; ST += r[4]
            print(i, len(jobs), 0 if r is None else len(r[0]), flush=True)
    pickle.dump({"x": np.concatenate(CX), "n": np.concatenate(CN), "o": np.concatenate(O), "cls": CL, "sub": ST}, open("/opt/data/buildings.pkl", "wb"))
    print("BLD_DONE", sum(len(c) for c in CX))
