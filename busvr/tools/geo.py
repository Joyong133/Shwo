"""Shared projection: local transverse Mercator centred on the corridor (metres). World: x east, n north."""
from pyproj import Transformer
LON0, LAT0 = 128.05, 36.40
_PROJ = f"+proj=tmerc +lat_0={LAT0} +lon_0={LON0} +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m"
_f = Transformer.from_crs("EPSG:4326", _PROJ, always_xy=True)
_i = Transformer.from_crs(_PROJ, "EPSG:4326", always_xy=True)
PROJ4 = _PROJ
def fwd(lon, lat): return _f.transform(lon, lat)
def inv(x, n): return _i.transform(x, n)
