# 새로 추가할 선수들의 Players 정보 + 사진 수집
import json, time, os, re, urllib.request, urllib.parse
from q import cargo, get
from legends_world import L
agg=json.load(open("agg.json")); m=json.load(open("map.json")); vets=json.load(open("vets.json"))
have={v["OverviewPage"].lower() for v in m.values()}
links=[k for k,v in agg.items() if k.lower() not in have and (v["g"]>=10 or (v["league"]=="LCK" and v["g"]>=3))]
links+=vets
fields="ID,OverviewPage,NativeName,Name,Team,Role,IsRetired,Country,Residency"
info={}
for k in range(0,len(links),20):
    sub=links[k:k+20]
    for r in cargo("Players",fields,"OverviewPage IN ("+",".join("'%s'"%x.replace("'","''") for x in sub)+")",pause=3): info[r["OverviewPage"]]=r
    time.sleep(2)
# 레전드: ID로 찾기
ids=[x[0] for x in L]
cand=[]
for k in range(0,len(ids),20):
    sub=ids[k:k+20]
    cand+=cargo("Players",fields,"ID IN ("+",".join("'%s'"%x for x in sub)+")",pause=3); time.sleep(2)
RES={"LPL":("China",),"LEC":("EMEA","Europe"),"LCS":("North America",)}
leg={}
for ign,lg,*_ in L:
    c=[r for r in cand if r["ID"].lower()==ign.lower()]
    if len(c)>1:
        c2=[r for r in c if any(x in (r["Residency"] or "") for x in RES[lg])]
        c=c2 or c
    if c: leg[ign]=c[0]; info[c[0]["OverviewPage"]]=c[0]
    else: print("legend not found",ign)
json.dump({"info":info,"legend":leg,"links":links},open("info.json","w"),ensure_ascii=False)
print("players",len(info),flush=True)
pages=list(info.keys())
imgs=[]
for k in range(0,len(pages),20):
    sub=pages[k:k+20]
    imgs+=cargo("PlayerImages","FileName,Link,Tournament,ImageType","Link IN ("+",".join("'%s'"%x.replace("'","''") for x in sub)+")",pause=3); time.sleep(2)
json.dump(imgs,open("imgs2.json","w"),ensure_ascii=False)
print("imgs",len(imgs),flush=True)
print("DONE")
