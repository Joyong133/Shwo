"""Download motorway/trunk/primary road segments for the corridor from Overture."""
import json, sys, pickle, concurrent.futures as cf
import pyarrow as pa, pyarrow.parquet as pq, pyarrow.compute as pc
from httpfile import HttpFile
BASE = "https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com/"
groups = json.load(open("/opt/data/seg_groups.json"))
BOX = (126.85, 35.15, 129.25, 37.62)
COLS = ["id", "geometry", "bbox", "subtype", "class", "names", "routes", "road_flags", "subclass", "level_rules", "speed_limits", "connectors"]
def work(job):
    key, g = job
    pf = pq.ParquetFile(HttpFile(BASE + key, block=1 << 22))
    cols = [c for c in COLS if c in pf.schema_arrow.names]
    t = pf.read_row_group(g, columns=cols)
    m = pc.and_(pc.equal(t["subtype"], "road"), pc.is_in(t["class"], value_set=pa.array(["motorway", "trunk", "primary", "secondary", "tertiary"])))
    bb = t["bbox"]
    m = pc.and_(m, pc.and_(pc.and_(pc.less_equal(pc.struct_field(bb, "xmin"), BOX[2]), pc.greater_equal(pc.struct_field(bb, "xmax"), BOX[0])),
                           pc.and_(pc.less_equal(pc.struct_field(bb, "ymin"), BOX[3]), pc.greater_equal(pc.struct_field(bb, "ymax"), BOX[1]))))
    return t.filter(m)
if __name__ == "__main__":
    jobs = [(k, g) for k, gs in groups.items() for g in gs]
    if len(sys.argv) > 1:
        pf = pq.ParquetFile(HttpFile(BASE + jobs[0][0], block=1 << 22)); print(pf.schema_arrow); sys.exit()
    tabs = []
    with cf.ThreadPoolExecutor(10) as ex:
        for i, t in enumerate(ex.map(work, jobs)):
            tabs.append(t); print(i, len(jobs), t.num_rows, flush=True)
    t = pa.concat_tables(tabs, promote_options="default")
    pq.write_table(t, "/opt/data/roads.parquet")
    print("rows", t.num_rows)
