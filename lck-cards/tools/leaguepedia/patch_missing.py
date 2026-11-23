import json, time
from q import cargo
I=json.load(open("info.json")); v=json.load(open("vagg.json")); a=json.load(open("agg.json"))
miss=[k for k in v if k not in I["info"]]+[k for k in I["links"] if k in a and k not in I["info"]]
red=cargo("PlayerRedirects","AllName,OverviewPage","AllName IN ("+",".join("'%s'"%x.replace("'","''") for x in miss)+")",pause=3)
rmap={}
for r in red: rmap.setdefault(r["AllName"].lower(),r["OverviewPage"])
pages=sorted(set(rmap.values()))
print(len(miss),len(pages))
time.sleep(3)
pl=cargo("Players","ID,OverviewPage,NativeName,Name,Team,Role,IsRetired,Country,Residency","OverviewPage IN ("+",".join("'%s'"%x.replace("'","''") for x in pages)+")",pause=3)
pm={r["OverviewPage"]:r for r in pl}
time.sleep(3)
imgs=cargo("PlayerImages","FileName,Link,Tournament,ImageType","Link IN ("+",".join("'%s'"%x.replace("'","''") for x in pages)+")",pause=3)
alias={}
for k in miss:
    pg=rmap.get(k.lower())
    if pg and pg in pm: I["info"][k]=pm[pg]; alias[pg]=k
    else: print("unresolved",k)
json.dump(I,open("info.json","w"),ensure_ascii=False)
old=json.load(open("imgs2.json"))
for i in imgs:
    if i["Link"] in alias: i["Link"]=alias[i["Link"]]
old+=imgs
json.dump(old,open("imgs2.json","w"),ensure_ascii=False)
print("ok")
