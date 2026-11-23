# LCK 선수 카드 도감 (Android APK)

LCK 현역·은퇴 선수를 한 장씩 카드로 넘겨 보며 소개와 능력치를 확인하는 안드로이드 앱입니다.

- **설치 파일:** [`release/lck-cards.apk`](release/lck-cards.apk) (약 35KB, 인터넷 연결 없이 동작)
- **선수 85명:** 2026 LCK 정규 시즌 현역 52명 + 은퇴·전 LCK 레전드 33명
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
