import json, collections, re
rows=json.load(open("sb_vets.json"))
ROLE={'Top':'TOP','Jungle':'JGL','Mid':'MID','Bot':'ADC','Support':'SUP'}
num=lambda x: float(x) if x not in (None,"") else 0.0
P={}
for r in rows:
    if r["Role"] not in ROLE or "Showmatch" in r["GameId"] or "All-Star" in r["GameId"]: continue
    p=P.setdefault(r["Link"],{"g":0,"w":0,"k":0,"d":0,"a":0,"cs":0,"gold":0,"dmg":0,"vs":0,"min":0,"tk":0,"champs":collections.Counter(),"roles":collections.Counter(),"teams":[],"years":set()})
    mins=num(r["Gamelength Number"]) or 32
    p["g"]+=1; p["w"]+=r["PlayerWin"]=="Yes"
    for a,b in [("k","Kills"),("d","Deaths"),("a","Assists"),("cs","CS"),("gold","Gold"),("dmg","DamageToChampions"),("vs","VisionScore")]: p[a]+=num(r[b])
    p["min"]+=mins
    tk=num(r["Team1Kills"]) if r["Team"]==r["Team1"] else num(r["Team2Kills"])
    p["tk"]+=tk
    p["champs"][r["Champion"]]+=1; p["roles"][ROLE[r["Role"]]]+=1
    p["teams"].append((r["GameId"],r["Team"]))
    y=re.search(r"LCK/(\d{4})",r["GameId"]); 
    if y: p["years"].add(int(y.group(1)))
out={}
for L,p in P.items():
    if p["g"]<20: continue
    mins=p["min"]; g=p["g"]
    p["teams"].sort()
    seq=[]
    for _,t in p["teams"]:
        if not seq or seq[-1]!=t: seq.append(t)
    yrs=sorted(p["years"])
    dpm=p["dmg"]/mins
    out[L]={"link":L,"pos":p["roles"].most_common(1)[0][0],"g":g,"w":p["w"],"wr":p["w"]/g,"kda":(p["k"]+p["a"])/max(1,p["d"]),
      "kp":(p["k"]+p["a"])/max(1,p["tk"]),"ds":dpm,"dsproxy":True,"cspm":p["cs"]/mins,"gpm":p["gold"]/mins,"dpm":dpm,"vspm":p["vs"]/mins,
      "dpg":p["d"]/g,"apm":p["a"]/mins,"nchamp":len(p["champs"]),"champs":[c for c,_ in p["champs"].most_common(3)],
      "mainTeam":collections.Counter(t for _,t in p["teams"]).most_common(1)[0][0],"teamSeq":seq,"years":"%d~%d"%(yrs[0],yrs[-1]) if yrs[0]!=yrs[-1] else str(yrs[0])}
json.dump(out,open("vagg.json","w"),ensure_ascii=False)
print(len(out), collections.Counter(v["pos"] for v in out.values()))
