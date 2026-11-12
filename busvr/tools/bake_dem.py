"""Reproject Copernicus DEM + ESA WorldCover into the local metric grid (cached as .npy)."""
import glob, numpy as np, rasterio, pickle
from rasterio.merge import merge
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_origin
from geo import PROJ4
R = pickle.load(open("/opt/data/route_raw.pkl", "rb")); P = R["P"]
M = 28000.0
X0 = np.floor((P[:, 0].min() - M) / 4096) * 4096; X1 = np.ceil((P[:, 0].max() + M) / 4096) * 4096
N0 = np.floor((P[:, 1].min() - M) / 4096) * 4096; N1 = np.ceil((P[:, 1].max() + M) / 4096) * 4096
print("extent km", (X1 - X0) / 1000, (N1 - N0) / 1000)
def warp(files, res, resampling, dtype, nodata=0, src_nodata=None):
    W = int((X1 - X0) / res); H = int((N1 - N0) / res)
    dst = np.full((H, W), nodata, dtype); tr = from_origin(X0, N1, res, res)
    for f in files:
        with rasterio.open(f) as src:
            tmp = np.full((H, W), nodata, dtype)
            reproject(rasterio.band(src, 1), tmp, dst_transform=tr, dst_crs=PROJ4, resampling=resampling, src_nodata=src_nodata, dst_nodata=nodata, num_threads=4)
            m = tmp != nodata; dst[m] = tmp[m]
        print(" ", f.split("/")[-1], flush=True)
    return dst
dem = glob.glob("/opt/data/dem/*.tif"); wc = glob.glob("/opt/data/wc/*.tif")
d32 = warp(dem, 32.0, Resampling.bilinear, np.float32, nodata=-9999.0); d32[d32 < -1000] = 0
np.save("/opt/data/dem32.npy", d32.astype(np.float32)); print("dem32", d32.shape, d32.min(), d32.max())
c16 = warp(wc, 16.0, Resampling.mode, np.uint8, nodata=0, src_nodata=0)
np.save("/opt/data/lc16.npy", c16); print("lc16", c16.shape, np.unique(c16, return_counts=True))
pickle.dump({"X0": X0, "X1": X1, "N0": N0, "N1": N1}, open("/opt/data/extent.pkl", "wb"))
