from q import cargo
import json, time
vets=json.load(open("vets.json")); rows=[]
for k in range(0,len(vets),6):
    sub=vets[k:k+6]
    w="SP.Link IN ("+",".join("'%s'"%x.replace("'","''") for x in sub)+") AND SP.OverviewPage LIKE 'LCK/20%'"
    r=cargo("ScoreboardPlayers=SP,ScoreboardGames=SG","SP.Link,SP.Team,SP.Role,SP.Champion,SP.Kills,SP.Deaths,SP.Assists,SP.Gold,SP.CS,SP.DamageToChampions,SP.VisionScore,SP.PlayerWin,SP.GameId,SP.OverviewPage,SG.Gamelength_Number,SG.Team1,SG.Team2,SG.Team1Kills,SG.Team2Kills",w,join="SP.GameId=SG.GameId",pause=3)
    rows+=r; print(k,len(r),flush=True); time.sleep(3)
json.dump(rows,open("sb_vets.json","w"),ensure_ascii=False)
# 팀 합계(킬 관여·딜 비중용): 같은 게임 팀원 기록
games=sorted({r["GameId"] for r in rows})
print("games",len(games),flush=True)
print("DONE")
