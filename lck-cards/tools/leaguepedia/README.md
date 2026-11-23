# Leaguepedia 데이터 수집 스크립트

`world.js`(LPL·LEC·LCS·추가 LCK 선수)와 `photos/w_*.webp`를 만든 스크립트입니다. 이 폴더에서 순서대로 실행합니다.
Leaguepedia API는 요청 속도 제한이 있어 전체 수집에 수십 분이 걸립니다.

1. `python3 fetch_sb.py LCK LPL LEC LCS` — 2026 시즌 경기별 선수 기록 (`sb_*.json`)
2. `python3 aggregate.py` — 선수별 합산 (`agg.json`)
3. `python3 fetch_vets.py && python3 fetch_vets2.py && python3 vagg.py` — LCK 베테랑 통산 기록 (`vets.json` 은 1단계 후 직접 고른 목록)
4. `python3 fetch_info.py && python3 patch_missing.py` — 본명·현재 소속·사진 목록
5. `python3 photos2.py` — 사진 내려받기·자르기
6. `python3 build_world.py` — `world.js` 생성

`map.json`(기존 LCK 카드의 Leaguepedia 페이지 목록)이 필요합니다. 능력치 환산 방식은 `rate.py`에 있습니다.
