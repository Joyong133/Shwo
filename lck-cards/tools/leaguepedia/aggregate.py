import json, collections, os
LG=["LCK","LPL","LEC","LCS"]
ROLE={'Top':'TOP','Jungle':'JGL','Mid':'MID','Bot':'ADC','Support':'SUP'}
rows=[]
for lg in LG:
    f="sb_%s.json"%lg
    if os.path.exists(f):
        for r in json.load(open(f)): r["lg"]=lg; rows.append(r)
num=lambda x: float(x) if x not in (None,"") else 0.0
team_tot=collections.defaultdict(lambda:[0,0])
for r in rows:
    k=(r["GameId"],r["Team"]); team_tot[k][0]+=num(r["Kills"]); team_tot[k][1]+=num(r["DamageToChampions"])
P={}
for r in rows:
    L=r["Link"]
    if not L or r["Role"] not in ROLE: continue
    p=P.setdefault(L,{"link":L,"g":0,"w":0,"k":0,"d":0,"a":0,"cs":0,"gold":0,"dmg":0,"vs":0,"min":0,"kp_n":0,"kp_d":0,"ds_n":0,"ds_d":0,
        "champs":collections.Counter(),"roles":collections.Counter(),"lgs":collections.Counter(),"teams":[]})
    m=num(r["Gamelength Number"]) or 30
    p["g"]+=1; p["w"]+= r["PlayerWin"]=="Yes"
    for a,b in [("k","Kills"),("d","Deaths"),("a","Assists"),("cs","CS"),("gold","Gold"),("dmg","DamageToChampions"),("vs","VisionScore")]: p[a]+=num(r[b])
    p["min"]+=m
    tk,td=team_tot[(r["GameId"],r["Team"])]
    p["kp_n"]+=num(r["Kills"])+num(r["Assists"]); p["kp_d"]+=tk
    p["ds_n"]+=num(r["DamageToChampions"]); p["ds_d"]+=td
    p["champs"][r["Champion"]]+=1; p["roles"][ROLE[r["Role"]]]+=1; p["lgs"][r["lg"]]+=1
    p["teams"].append((r["lg"],r["page"],r["GameId"],r["Team"]))
order={pg:i for i,pg in enumerate([
 'LCK/2026 Season/Cup','LCK/2026 Season/Rounds 1-2','LCK/2026 Season/Road to MSI','LCK/2026 Season/Rounds 3-4','LCK/2026 Season/Season Play-In','LCK/2026 Season/Season Playoffs',
 'LPL/2026 Season/Split 1','LPL/2026 Season/Split 1 Playoffs','LPL/2026 Season/Split 2','LPL/2026 Season/Split 2 Playoffs','LPL/2026 Season/Split 3','LPL/2026 Season/Regional Finals','LPL/2026 Season/Grand Finals',
 'LEC/2026 Season/Versus Season','LEC/2026 Season/Versus Playoffs','LEC/2026 Season/Spring Season','LEC/2026 Season/Spring Playoffs','LEC/2026 Season/Summer Season','LEC/2026 Season/Summer Playoffs',
 'LCS/2026 Season/Lock-In','LCS/2026 Season/Spring Season','LCS/2026 Season/Spring Playoffs','LCS/2026 Season/Summer Season','LCS/2026 Season/Summer Playoffs'])}
out={}
for L,p in P.items():
    g=p["g"]; mins=p["min"]
    lg=p["lgs"].most_common(1)[0][0]
    tms=[t for t in p["teams"] if t[0]==lg]
    tms.sort(key=lambda t:(order.get(t[1],0),t[2]))
    last_team=tms[-1][3]
    team_counts=collections.Counter(t[3] for t in tms)
    team_seq=[]
    for t in tms:
        if not team_seq or team_seq[-1]!=t[3]: team_seq.append(t[3])
    out[L]={"link":L,"league":lg,"team":last_team,"teamSeq":team_seq,"teamGames":dict(team_counts),"pos":p["roles"].most_common(1)[0][0],
      "g":g,"w":p["w"],"wr":p["w"]/g,"kda":(p["k"]+p["a"])/max(1,p["d"]),"kp":p["kp_n"]/max(1,p["kp_d"]),"ds":p["ds_n"]/max(1,p["ds_d"]),
      "cspm":p["cs"]/mins,"gpm":p["gold"]/mins,"dpm":p["dmg"]/mins,"vspm":p["vs"]/mins,"dpg":p["d"]/g,"apm":p["a"]/mins,
      "nchamp":len(p["champs"]),"champs":[c for c,_ in p["champs"].most_common(3)]}
json.dump(out,open("agg.json","w"),ensure_ascii=False)
print(len(out), collections.Counter(v["league"] for v in out.values()))
