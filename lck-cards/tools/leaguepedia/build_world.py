import json, collections, re, hashlib, os
from rate import build_pool, rate, metrics, pct, KEYS
from legends_world import L as LEG, TITLES
agg=json.load(open("agg.json")); m=json.load(open("map.json"))
I=json.load(open("info.json")); info=I["info"]; legmap=I["legend"]
photos=json.load(open("photos2.json"))      # page -> {file, t}
vagg=json.load(open("vagg.json"))           # LCK 베테랑 통산
POSKO={"TOP":"탑","JGL":"정글","MID":"미드","ADC":"원딜","SUP":"서폿"}
POSFULL={"TOP":"탑 라이너","JGL":"정글러","MID":"미드 라이너","ADC":"원거리 딜러","SUP":"서포터"}
W={"TOP":[0.22,0.18,0.15,0.20,0.12,0.13],"JGL":[0.10,0.20,0.25,0.18,0.12,0.15],"MID":[0.22,0.18,0.17,0.20,0.12,0.11],"ADC":[0.20,0.25,0.10,0.22,0.08,0.15],"SUP":[0.15,0.22,0.23,0.12,0.13,0.15]}
STATN=["라인전","한타","운영","피지컬","챔프폭","안정감"]
COLORS={
 "Bilibili Gaming":"#2FA4E7","Top Esports":"#E0162B","JD Gaming":"#C8102E","Anyone's Legend":"#8B5CF6","LNG Esports":"#16A34A",
 "Weibo Gaming":"#F97316","Invictus Gaming":"#D4D4D8","EDward Gaming":"#A1A1AA","LGD Gaming":"#7C3AED","Ninjas in Pyjamas":"#E5E7EB",
 "FunPlus Phoenix":"#E31E24","Oh My God":"#DB2777","ThunderTalk Gaming":"#F28C28","Ultra Prime":"#2563EB","Team WE":"#DC2626","Royal Never Give Up":"#C8A04A",
 "G2 Esports":"#E5E7EB","Fnatic":"#FF5900","Karmine Corp":"#00C3FF","Movistar KOI":"#8B5CF6","Team Vitality":"#FFE500","Team Heretics":"#9CA3AF",
 "SK Gaming":"#38BDF8","GIANTX":"#F15A24","Team BDS":"#EC4899","Natus Vincere":"#FACC15","Los Ratones":"#84CC16","Rogue":"#60A5FA",
 "Cloud9":"#00AEEF","Team Liquid":"#3A7BD5","FlyQuest":"#22C55E","100 Thieves":"#E4002B","Dignitas":"#FFCC00","Shopify Rebellion":"#95BF47",
 "Disguised":"#A855F7","LYON":"#E31937","TSM":"#D4D4D8","Counter Logic Gaming":"#60A5FA","Evil Geniuses":"#3B82F6","Immortals":"#14B8A6",
}
LCKKEY={"T1":"T1","Gen.G":"GEN","Hanwha Life Esports":"HLE","KT Rolster":"KT","Dplus Kia":"DK","DN SOOPers":"DNS","Kiwoom DRX":"KRX","HANJIN BRION":"BRO","BNK FEARX":"BFX","Nongshim RedForce":"NS"}
def hue_color(name):
    h=int(hashlib.md5(name.encode()).hexdigest()[:4],16)%360
    return "hsl(%d,65%%,55%%)"%h
def dark(c):
    return "#0d0f18"
TEAMS={}
def team_key(name):
    if name in LCKKEY: return LCKKEY[name]
    k="X_"+re.sub(r"[^A-Za-z0-9]","",name)
    if k not in TEAMS: TEAMS[k]={"name":name,"color":COLORS.get(name,hue_color(name)),"color2":"#10131d"}
    return k
def short(name): return name
def now_text(r):
    if not r: return None
    KO={'T1':'T1','Gen.G':'젠지','Hanwha Life Esports':'한화생명e스포츠','KT Rolster':'kt 롤스터','Dplus Kia':'디플러스 기아','DN SOOPers':'DN 수퍼스','Kiwoom DRX':'키움 DRX','HANJIN BRION':'한진 브리온','BNK FEARX':'BNK 피어엑스','Nongshim RedForce':'농심 레드포스'}
    team=r["Team"]; role=r["Role"]; tk=KO.get(team,team)
    ROLE={'Coach':'코치','Streamer':'소속 방송인(스트리머)','Caster':'해설위원','Broadcast Talent':'방송 출연진','Analyst':'분석가·해설'}
    if role in ROLE: return (tk+' '+ROLE[role]) if team else {'Coach':'지도자(코치)'}.get(role,ROLE[role].replace('소속 ',''))
    if r["IsRetired"]=="1": return "은퇴"
    return tk+" 소속" if team else "소속팀 없음(FA)"
def native(r, fallback=""):
    if not r: return fallback
    n=r.get("NativeName") or ""
    if not n:
        n=re.sub(r"&nbsp;"," ",r.get("Name") or "")
    return n
def recd(v,label):
    return {"label":label,"g":v["g"],"w":v["w"],"wr":round(v["wr"]*100),"kda":round(v["kda"],1),"kp":round(v["kp"]*100) if v.get("kp") is not None else None,
            "cspm":round(v["cspm"],1) if v["pos"]!="SUP" else round(v["cspm"],1),"dmg":(None if v.get("dsproxy") else round(v["ds"]*100)),"vspm":round(v["vspm"],2),"champs":v["champs"]}
def ign_of(link): return re.sub(r"\s*\(.*\)$","",link)
def ovr(s,pos,w=0,mm=0): return min(99,round(sum(a*b for a,b in zip(s,W[pos]))+min(4,w*0.8+mm*0.4)))

pool=build_pool(agg)
out=[]
have={v["OverviewPage"].lower() for v in m.values()}
legend_links={legmap[x[0]]["OverviewPage"]:x for x in LEG if x[0] in legmap}

# ── 2026 현역 (자동 산출) ──
for link in I["links"]:
    if link not in agg: continue
    v=agg[link]; r=info.get(link)
    s=rate(v,pool)
    w,mm,thl=TITLES.get(link,(0,0,[]))
    lg=v["league"]; tname=v["team"]; posko=POSFULL[v["pos"]]
    legend=legend_links.get(link)
    hl=list(thl)
    if legend:
        _,_,_,_,_,lw,lm,lhl,ldesc,lteams=legend; w,mm=max(w,lw),max(mm,lm); hl=lhl+[h for h in hl if h not in lhl]
    hl.append("2026 %s %s %s (%d경기)"%(lg,tname,"주전" if v["g"]>=20 else "출전",v["g"]))
    hl.append("2026 시즌 %d승 %d패 · 승률 %d%% · KDA %.1f"%(v["w"],v["g"]-v["w"],round(v["wr"]*100),v["kda"]))
    best=STATN[s.index(max(s))]
    desc=(ldesc+" " if legend else "")+"%s의 %s. 2026 시즌 %s %d경기에서 KDA %.1f, 킬 관여율 %d%%를 기록했다. 주로 %s를 플레이했고, 가장 돋보이는 능력치는 %s이다."%(
        tname,posko,lg,v["g"],v["kda"],round(v["kp"]*100),"·".join(v["champs"]),best)
    seq=v["teamSeq"]
    teams=(legend[9]+" → " if legend else "")+" → ".join(seq)+" (2026)"
    ph=photos.get(link)
    out.append({"key":"w:"+link,"ign":ign_of(link),"name":native(r),"pos":v["pos"],"status":"active","league":lg,"team":team_key(tname),
        "teams":teams,"nick":"","s":s,"w":w,"m":mm,"hl":hl,"desc":desc,"auto":True,"rec":recd(v,"2026 시즌 기록 (%s)"%lg),
        "img":ph["file"] if ph else None,"opaque":(not ph["t"]) if ph else False,"now":now_text(r)})

# ── 해외 레전드 (직접 평가, 2026 비현역) ──
for ign,lg,pos,tk,s,w,mm,hl,desc,teams in LEG:
    r=legmap.get(ign)
    page=r["OverviewPage"] if r else ign
    if page in agg and page in I["links"]: continue   # 현역으로 이미 추가
    ph=photos.get(page)
    TN={"RNG":"Royal Never Give Up","EDG":"EDward Gaming","IG":"Invictus Gaming","FPX":"FunPlus Phoenix","FNC":"Fnatic","G2":"G2 Esports","EG":"Evil Geniuses","M5":"Moscow Five","TL":"Team Liquid","TSM":"TSM","C9":"Cloud9","CLG":"Counter Logic Gaming"}[tk]
    status="retired" if (not r or r["IsRetired"]=="1" or r["Role"] in ("Coach","Streamer","Caster","Analyst","Broadcast Talent")) else "former"
    out.append({"key":"w:"+page,"ign":ign,"name":native(r),"pos":pos,"status":status,"league":lg,"team":team_key(TN),"teams":teams,"nick":"",
        "s":s,"w":w,"m":mm,"hl":hl,"desc":desc,"img":ph["file"] if ph else None,"opaque":(not ph["t"]) if ph else False,"now":now_text(r)})

# ── LCK 베테랑 (LCK 통산 기록 기반) ──
vpool={}
for v in vagg.values():
    mt=metrics(v)
    for k in KEYS:
        for i,(x,_) in enumerate(mt[k]): vpool.setdefault((v["pos"],k,i),[]).append(x)
for k in vpool: vpool[k].sort()
seenv=set()
for link,v in sorted(vagg.items(), key=lambda kv:-kv[1]["g"]):
    if link.lower() in seenv: continue
    seenv.add(link.lower())
    r=info.get(link); mt=metrics(v); s=[]
    for k in KEYS:
        tot=sum(wt for _,wt in mt[k]); p=sum(pct(vpool[(v["pos"],k,i)],x)*wt for i,(x,wt) in enumerate(mt[k]))/tot
        s.append(round(72+16*p))
    tname=v["mainTeam"]; seq=v["teamSeq"]
    status="retired" if (not r or r["IsRetired"]=="1" or r["Role"] in ("Coach","Streamer","Caster","Analyst","Broadcast Talent")) else "former"
    if r and r["Team"] in LCKKEY and r["Role"] in ("Top","Jungle","Mid","Bot","Support"): status="active"
    best=STATN[s.index(max(s))]
    desc="%s 등에서 뛴 LCK %s. %s년 LCK 무대에서 통산 %d경기 %d승을 기록했다. 주로 %s를 플레이했고, 가장 돋보이는 능력치는 %s이다."%(
        "·".join(seq[:3]),POSFULL[v["pos"]],v["years"],v["g"],v["w"],"·".join(v["champs"]),best)
    hl=["LCK 통산 %d경기 %d승 %d패 (승률 %d%%)"%(v["g"],v["w"],v["g"]-v["w"],round(v["wr"]*100)),"LCK 활동 %s"%v["years"],"통산 KDA %.1f"%v["kda"]]
    ph=photos.get(link)
    out.append({"key":"w:"+link,"ign":ign_of(link),"name":native(r),"pos":v["pos"],"status":status,"league":"LCK","team":team_key(tname),
        "teams":" → ".join(seq),"nick":"","s":s,"w":0,"m":0,"hl":hl,"desc":desc,"auto":True,"rec":recd(v,"LCK 통산 기록 (%s)"%v["years"]),
        "img":ph["file"] if ph else None,"opaque":(not ph["t"]) if ph else False,"now":now_text(r)})

# 기존 카드에 2026 기록 붙이기
recs={}
for ign,r in m.items():
    pg=r["OverviewPage"]
    if pg in agg: recs[ign]=recd(agg[pg],"2026 시즌 기록 (%s)"%agg[pg]["league"])
js="// 자동 생성: Leaguepedia 2026 시즌 경기 기록 기반 (LPL·LEC·LCS·LCK 추가 선수)\n"
js+="Object.assign(window.TEAMS, "+json.dumps(TEAMS,ensure_ascii=False)+");\n"
js+="window.PLAYERS.push(...JSON.parse("+json.dumps(json.dumps(out,ensure_ascii=False),ensure_ascii=False)+"));\n"
js+="window.PLAYER_REC = "+json.dumps(recs,ensure_ascii=False)+";\n"
open("/home/user/Shwo/lck-cards/app/src/main/assets/world.js","w").write(js)
c=collections.Counter((p["league"],p["status"]) for p in out)
print(len(out),c)
dist=collections.Counter(ovr(p["s"],p["pos"],p["w"],p["m"])//5*5 for p in out); print(sorted(dist.items()))
