import json, sys, urllib.request, urllib.parse, time
API="https://lol.fandom.com/api.php"
def get(params):
    u=API+"?"+urllib.parse.urlencode(params)
    for t in range(12):
        try:
            d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"lck-cards-builder/1.0 (personal fan app)"}),timeout=60))
        except Exception as e:
            print("neterr",e,file=sys.stderr); time.sleep(5+t*5); continue
        if "error" in d and d["error"].get("code")=="ratelimited":
            print("ratelimited, sleeping",file=sys.stderr); time.sleep(30+t*15); continue
        return d
    raise SystemExit("fail "+u)
def cargo(tables, fields, where, limit=500, order=None, join=None, pause=2):
    out=[]; off=0
    while True:
        p={"action":"cargoquery","format":"json","tables":tables,"fields":fields,"where":where,"limit":limit,"offset":off}
        if order: p["order_by"]=order
        if join: p["join_on"]=join
        d=get(p)
        if "error" in d: raise SystemExit(json.dumps(d["error"]))
        rows=[r["title"] for r in d.get("cargoquery",[])]
        out+=rows
        if len(rows)<limit: return out
        off+=limit; time.sleep(pause)
