import json, bisect
OFF={"LCK":0,"LPL":0,"LEC":-3,"LCS":-6}
def metrics(v):
    sup=v["pos"]=="SUP"
    return {
     "lane": [(v["gpm"],1),(v["apm"],1)] if sup else [(v["cspm"],1),(v["gpm"],1)],
     "tf":   [(v["kp"],0.7),(v["apm"],0.3)] if sup else [(v["kp"],0.5),(v["ds"],0.5)],
     "mac":  [(v["wr"],0.6),(v["vspm"],0.4)],
     "phy":  [(v["kda"],1)] if sup else [(v["kda"],0.5),(v["dpm"],0.5)],
     "pool": [(v["nchamp"],1)],
     "con":  [(-v["dpg"],0.6),(v["g"],0.4)],
    }
KEYS=["lane","tf","mac","phy","pool","con"]
def build_pool(agg, ming=10):
    pool={}
    for v in agg.values():
        if v["g"]<ming: continue
        m=metrics(v)
        for k in KEYS:
            for i,(x,_) in enumerate(m[k]):
                pool.setdefault((v["pos"],k,i),[]).append(x)
    for k in pool: pool[k].sort()
    return pool
def pct(arr,x):
    if len(arr)<2: return 0.5
    lo=bisect.bisect_left(arr,x); hi=bisect.bisect_right(arr,x)
    return ((lo+hi)/2)/len(arr)
def rate(v,pool,league=None):
    m=metrics(v); out=[]
    # 출전 경기가 적으면 평균 쪽으로 수축
    shrink=min(1.0, v["g"]/20)
    for k in KEYS:
        tot=sum(w for _,w in m[k]); p=sum(pct(pool[(v["pos"],k,i)],x)*w for i,(x,w) in enumerate(m[k]))/tot
        p=0.5+(p-0.5)*shrink
        out.append(round(68+26*p+OFF[league or v["league"]]))
    return out
