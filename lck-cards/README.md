# LoL 프로 선수 카드 도감 (Android APK)

LCK · LPL · LEC · LCS 현역·은퇴 선수를 한 장씩 카드로 넘겨 보며 소개와 능력치를 확인하는 안드로이드 앱입니다.

- **설치 파일:** [`release/lck-cards.apk`](release/lck-cards.apk) (약 4MB, 인터넷 연결 없이 동작)
- **선수 386명:** LCK 165 · LPL 94 · LEC 73 · LCS 54 (2026 시즌 현역 + 은퇴 레전드)
- 리그 필터, 2026 시즌 경기 기록(경기 수·승률·KDA·킬 관여·분당 CS·딜 비중·주력 챔피언)
- **실제 선수 사진** (Leaguepedia 헤드샷, 현역은 2026 시즌 사진)과 2026년 11월 현재 소속(2027 이적 시장 반영)
- 카드마다 종합 능력치(OVR), 별 등급(2~5성, 0.5 단위), 카드 등급(ICON / LEGEND / EPIC / RARE / NORMAL)
- 상세 화면: 선수 소개, 6각형 능력치 차트, 능력치별 가중치와 종합 산출 과정, 주요 경력, 소속 이력
- 현역/은퇴 탭, 포지션·팀 필터, 검색, 정렬, 좌우 스와이프로 다음 선수 보기, 랜덤 **카드 뽑기**

## 설치

1. 휴대폰에서 `release/lck-cards.apk` 를 내려받습니다 (GitHub에서 파일을 열고 **Download raw file**).
2. 파일을 열면 "출처를 알 수 없는 앱" 설치 허용을 묻습니다. 허용하고 설치합니다.
3. 안드로이드 8.0 이상이 필요합니다.

## 능력치 · 별 등급 계산

각 선수의 커리어 **전성기 기량**을 바탕으로 6가지 능력치(라인전 · 한타 · 운영 · 피지컬 · 챔프폭 · 안정감)를 매기고,
포지션별 가중치로 평균을 낸 뒤 국제대회 보너스를 더합니다.

| | 라인전 | 한타 | 운영 | 피지컬 | 챔프폭 | 안정감 |
|---|---|---|---|---|---|---|
| 탑 | 22% | 18% | 15% | 20% | 12% | 13% |
| 정글 | 10% | 20% | 25% | 18% | 12% | 15% |
| 미드 | 22% | 18% | 17% | 20% | 12% | 11% |
| 원딜 | 20% | 25% | 10% | 22% | 8% | 15% |
| 서폿 | 15% | 22% | 23% | 12% | 13% | 15% |

- 보너스 = 롤드컵 우승 × 0.8 + MSI 우승 × 0.4 (최대 +4), 종합 최대 99
- 별 등급: 93+ ★5 · 90+ ★4.5 · 87+ ★4 · 84+ ★3.5 · 81+ ★3 · 78+ ★2.5 · 그 아래 ★2
- 카드 등급: 98+ ICON · 93+ LEGEND · 87+ EPIC · 81+ RARE · 그 아래 NORMAL

능력치는 팬 메이드 평가이며 공식 수치가 아닙니다. 현역 로스터는 2026 시즌 개막 기준이라 시즌 중 교체나 이적 시장에 따라 달라질 수 있습니다.

## 직접 평가 vs 기록 기반 능력치

- 처음 넣은 LCK 115명과 해외 레전드는 전성기 기량을 기준으로 직접 매긴 능력치입니다.
- LPL·LEC·LCS 2026 현역과 추가 LCK 선수는 Leaguepedia 경기 기록으로 자동 산출했습니다.
  같은 포지션 안의 백분위를 68~94점으로 바꾸고, 리그 수준 보정(LEC −3, LCS −6)을 적용합니다.
  LCK 베테랑(2016~2025)은 LCK 통산 기록을 같은 그룹 안에서 비교해 72~88점으로 환산합니다.
- 자동 산출 데이터는 `app/src/main/assets/world.js` 에 있습니다.

## 사진 · 소속 정보 출처

선수 사진(`app/src/main/assets/photos/`)과 현재 소속(`app/src/main/assets/meta.js`)은
[Leaguepedia](https://lol.fandom.com)에서 2026년 11월 23일에 가져왔습니다.
사진의 저작권은 라이엇 게임즈·LCK·각 구단 등 원저작자에게 있으므로, 이 앱은 개인 감상용으로만 쓰고
스토어 등에 공개 배포하지 마세요.

## 데이터 고치기

선수 데이터는 [`app/src/main/assets/data.js`](app/src/main/assets/data.js) 한 파일에 있습니다.
선수를 추가하거나 능력치(`s: [라인전, 한타, 운영, 피지컬, 챔프폭, 안정감]`)를 바꾸면 종합 능력치와 별 등급은 자동으로 다시 계산됩니다.
`app/src/main/assets/index.html` 을 PC 브라우저로 열면 앱과 같은 화면으로 바로 확인할 수 있습니다.

## 빌드

필요: JDK 17 이상, Gradle 8.9 이상, Android SDK (platform 35, build-tools).

```bash
cd lck-cards
echo "sdk.dir=/path/to/android-sdk" > local.properties
gradle assembleRelease
# → app/build/outputs/apk/release/app-release.apk
```

릴리스 서명은 `keystore.properties` 가 있으면 그 키스토어를 쓰고, 없으면 디버그 키로 서명합니다.
키스토어와 비밀번호 파일은 저장소에 올리지 않습니다(`.gitignore`).

```properties
# keystore.properties 예시
storeFile=lck-cards.keystore
storePassword=...
keyAlias=lckcards
keyPassword=...
```

같은 패키지(`kr.lckcards.app`)를 업데이트 설치하려면 처음과 같은 키로 서명해야 합니다.
