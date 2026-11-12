"""Find the Overture parquet row groups that intersect a lon/lat box."""
import sys, re, json, urllib.request, concurrent.futures as cf
import pyarrow.parquet as pq
from httpfile import HttpFile
BASE = "https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com/"
REL = "release/2026-10-21.0/"
def list_keys(prefix):
    keys, tok = [], None
    while True:
        u = BASE + "?list-type=2&prefix=" + prefix + ("&continuation-token=" + urllib.parse.quote(tok) if tok else "")
        d = urllib.request.urlopen(u, timeout=60).read().decode()
        keys += re.findall(r"<Key>([^<]+)</Key>", d)
        m = re.search(r"<NextContinuationToken>([^<]+)<", d)
        if not m: return keys
        tok = m.group(1)
def scan(key, box):
    f = HttpFile(BASE + key, block=1 << 22)
    md = pq.ParquetFile(f).metadata
    names = [md.schema.column(i).path for i in range(md.num_columns)]
    ix = {n: names.index("bbox." + n) for n in ("xmin", "xmax", "ymin", "ymax")}
    hits = []
    for g in range(md.num_row_groups):
        rg = md.row_group(g)
        st = {n: rg.column(i).statistics for n, i in ix.items()}
        if any(s is None or not s.has_min_max for s in st.values()): hits.append(g); continue
        if st["xmin"].min <= box[2] and st["xmax"].max >= box[0] and st["ymin"].min <= box[3] and st["ymax"].max >= box[1]:
            hits.append(g)
    return key, hits, md.num_row_groups
if __name__ == "__main__":
    import urllib.parse
    theme, out = sys.argv[1], sys.argv[2]
    box = [float(x) for x in sys.argv[3:7]]
    keys = list_keys(REL + theme + "/")
    res = {}
    with cf.ThreadPoolExecutor(12) as ex:
        for key, hits, n in ex.map(lambda k: scan(k, box), keys):
            if hits: res[key] = hits; print(key.split("/")[-1][:10], len(hits), "/", n, flush=True)
    json.dump(res, open(out, "w"))
    print("files", len(res), "rowgroups", sum(len(v) for v in res.values()))
