import json, time
from q import cargo
from legends_world import L
I=json.load(open("info.json")); agg=json.load(open("agg.json"))
ign_of=lambda l: l.split(" (")[0]
active={(ign_of(k).lower(),v["league"]) for k,v in agg.items()}
need=[x for x in L if x[0] not in I["legend"] and (x[0].lower(),x[1]) not in active]
print("need",[x[0] for x in need])
fields="ID,OverviewPage,NativeName,Name,Team,Role,IsRetired,Country,Residency"
cand=cargo("Players",fields,"ID IN ("+",".join("'%s'"%x[0] for x in need)+")",pause=3)
RES={"LPL":("China",),"LEC":("EMEA","Europe"),"LCS":("North America",)}
for ign,lg,*_ in need:
    c=[r for r in cand if r["ID"].lower()==ign.lower()]
    if len(c)>1: c=[r for r in c if any(x in (r["Residency"] or "") for x in RES[lg])] or c
    for r in c: print(ign, "->", r["OverviewPage"], r["Residency"], r["NativeName"], r["Team"], r["Role"])
    if c: I["legend"][ign]=c[0]; I["info"][c[0]["OverviewPage"]]=c[0]
json.dump(I,open("info.json","w"),ensure_ascii=False)
time.sleep(3)
pages=[I["legend"][x[0]]["OverviewPage"] for x in need if x[0] in I["legend"]]
imgs=cargo("PlayerImages","FileName,Link,Tournament,ImageType","Link IN ("+",".join("'%s'"%p.replace("'","''") for p in pages)+")",pause=3)
old=json.load(open("imgs2.json")); old+=imgs; json.dump(old,open("imgs2.json","w"),ensure_ascii=False)
print("imgs",len(imgs))
