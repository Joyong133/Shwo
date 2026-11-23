import json, re, os, time, urllib.request, urllib.parse
from PIL import Image
from q import get
I=json.load(open("info.json")); imgs=json.load(open("imgs2.json"))
from collections import defaultdict
by=defaultdict(list)
for i in imgs: by[i["Link"]].append(i)
def yk(i):
    t=i["Tournament"] or ""; f=i["FileName"]
    y=re.search(r"(20\d\d)",t) or re.search(r"(20\d\d)",f); y=int(y.group(1)) if y else 0
    tl=(t+" "+f).lower(); s=0
    for n,v in [("spring",1),("split 1",1),("msi",2),("summer",3),("split 2",3),("split 3",4),("rounds 3",3),("world",5),(" wc",5),("playoffs",4)]:
        if n in tl: s=max(s,v)
    return (y,s)
pick={}
for page in I["info"]:
    L=[i for i in by.get(page,[]) if i["ImageType"]!="Profile"] or by.get(page,[])
    if L: pick[page]=max(L,key=yk)["FileName"]
items=list(pick.items()); urls={}
for k in range(0,len(items),40):
    sub=items[k:k+40]
    d=get({"action":"query","format":"json","prop":"imageinfo","iiprop":"url","iiurlwidth":"360","titles":"|".join("File:"+f for _,f in sub)})
    norm={n["to"]:n["from"] for n in d["query"].get("normalized",[])}
    for pg in d["query"]["pages"].values():
        t=norm.get(pg["title"],pg["title"]); ii=pg.get("imageinfo")
        if ii: urls[t[5:]]=ii[0].get("thumburl") or ii[0]["url"]
    time.sleep(3)
os.makedirs("raw2",exist_ok=True)
dst="/home/user/Shwo/lck-cards/app/src/main/assets/photos"
out={}
for page,f in items:
    u=urls.get(f)
    if not u: continue
    slug="w_"+re.sub(r"[^a-z0-9]","",page.lower())[:40]
    raw="raw2/"+slug
    if not os.path.exists(raw):
        for t in range(4):
            try:
                open(raw,"wb").write(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"lck-cards-builder/1.0"}),timeout=40).read()); break
            except Exception as e: time.sleep(3+t*3)
        else: continue
    im=Image.open(raw).convert("RGBA"); a=im.getchannel("A")
    tr=sum(1 for v in a.get_flattened_data() if v<20)/(im.width*im.height)>0.05 if hasattr(a,"get_flattened_data") else sum(1 for v in a.getdata() if v<20)/(im.width*im.height)>0.05
    if tr:
        bb=a.point(lambda v:255 if v>40 else 0).getbbox(); x0,y0,x1,y1=bb; side=min(x1-x0,im.width); cx=(x0+x1)//2
        top=max(0,y0-int(side*0.04)); h=min(side,im.height-top); left=max(0,min(im.width-side,cx-side//2))
        c=im.crop((left,top,left+side,top+h))
    else:
        side=min(im.width,im.height); left=(im.width-side)//2; c=im.crop((left,0,left+side,side))
    c.thumbnail((260,260),Image.LANCZOS)
    c.save(os.path.join(dst,slug+".webp"),"WEBP",quality=80,method=6)
    out[page]={"file":"photos/"+slug+".webp","t":tr}
json.dump(out,open("photos2.json","w"),ensure_ascii=False)
print("photos",len(out),"of",len(I["info"]))
