from q import cargo
import json, sys, time
pages={
 "LCK":['LCK/2026 Season/Cup','LCK/2026 Season/Rounds 1-2','LCK/2026 Season/Rounds 3-4','LCK/2026 Season/Season Play-In','LCK/2026 Season/Season Playoffs','LCK/2026 Season/Road to MSI'],
 "LPL":['LPL/2026 Season/Split 1','LPL/2026 Season/Split 1 Playoffs','LPL/2026 Season/Split 2','LPL/2026 Season/Split 2 Playoffs','LPL/2026 Season/Split 3','LPL/2026 Season/Grand Finals','LPL/2026 Season/Regional Finals'],
 "LEC":['LEC/2026 Season/Versus Season','LEC/2026 Season/Versus Playoffs','LEC/2026 Season/Spring Season','LEC/2026 Season/Spring Playoffs','LEC/2026 Season/Summer Season','LEC/2026 Season/Summer Playoffs'],
 "LCS":['LCS/2026 Season/Lock-In','LCS/2026 Season/Spring Season','LCS/2026 Season/Spring Playoffs','LCS/2026 Season/Summer Season','LCS/2026 Season/Summer Playoffs'],
}
for lg in sys.argv[1:]:
    rows=[]
    for pg in pages[lg]:
        r=cargo("ScoreboardPlayers=SP,ScoreboardGames=SG","SP.Link,SP.Team,SP.Role,SP.Champion,SP.Kills,SP.Deaths,SP.Assists,SP.Gold,SP.CS,SP.DamageToChampions,SP.VisionScore,SP.PlayerWin,SP.GameId,SG.Gamelength_Number",
                "SP.OverviewPage='%s'"%pg, join="SP.GameId=SG.GameId", pause=3)
        for x in r: x["page"]=pg
        rows+=r; print(lg,pg,len(r),flush=True); time.sleep(3)
    json.dump(rows,open("sb_%s.json"%lg,"w"),ensure_ascii=False)
print("DONE")
