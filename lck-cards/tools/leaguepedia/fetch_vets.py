from q import cargo
import json, collections, time
rows=cargo("TournamentPlayers","Team,Link,Role,OverviewPage","OverviewPage LIKE 'LCK/20%' AND Role IN ('Top','Jungle','Mid','Bot','Support')",pause=3)
json.dump(rows,open("tp_lck_all.json","w"),ensure_ascii=False)
print("tp",len(rows),flush=True)
