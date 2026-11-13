# 부산 VR 여행 (Meta Quest APK · 휴대폰 · PC)

부산 5개 권역 17개 명소를 **지하철·시내버스·2층 시티투어버스**로 여행하는 WebXR 앱입니다.
이미지·사운드 파일 없이 Three.js 절차적 3D와 Web Audio 합성음만으로 실행됩니다.

- **Meta Quest 2/3**: `.apk` 로 설치(Sideload)해 단독 앱으로 실행 — 6DoF, 양손 컨트롤러, 레이저 포인터, 포물선 텔레포트, 스냅 턴
- **휴대폰/PC**: 같은 코드를 브라우저에서 바로 테스트 — 터치 드래그, 자이로(iOS 권한 포함), 탭 레이캐스팅, 하단 퀵 HUD

## APK 방식

일반 Android WebView/Capacitor 는 Quest에서 WebXR `immersive-vr` 를 지원하지 않습니다.
이 프로젝트는 **Meta 공식 Bubblewrap 포크(`@meta-quest/bubblewrap-cli`)** 로 "Horizon OS PWA" APK를 만듭니다.
APK는 Meta Quest Browser 엔진 위에서 실행되므로 브라우저와 똑같이 WebXR 6DoF·컨트롤러가 동작합니다.

> APK 안에는 "웹앱 주소"가 들어갑니다. 따라서 **`dist/`(또는 `../busan/`)를 HTTPS 주소에 배포**해야 앱이 열립니다.
> 한 번 실행한 뒤에는 서비스 워커 캐시로 오프라인에서도 실행됩니다.

| 실행 모드 | 동작 | 조건 |
|---|---|---|
| `2D` | 앱을 열면 패널 창 → **"VR로 시작"** 버튼으로 몰입형 VR 진입 | 없음 (어디에 배포해도 동작) |
| `immersive` | 앱을 열면 곧바로 VR | 도메인 **루트**에 `/.well-known/assetlinks.json` 필요 (Digital Asset Links) |

`npm run apk` 는 기본값 `auto` 로, 검증 파일이 확인되면 `immersive`, 아니면 `2D` 로 빌드합니다.

## ① PC · 휴대폰 사전 테스트

```bash
cd busan-vr
npm install
npm run dev          # https://<PC의 IP>:5173  (자체 서명 인증서 → "고급 → 계속" 선택)
```

- 같은 Wi-Fi의 휴대폰/Quest 브라우저에서 `Network:` 로 표시된 주소로 접속합니다.
- HTTPS 이므로 휴대폰 자이로(🧭)와 Quest 브라우저의 "VR로 시작"이 동작합니다.
- 바로가기(테스트용): `?spot=haeundae`, `?ride=subway&to=haeundae`, `?ride=bus&to=gwangalli`

## ② 빌드 → 배포 → 서명 APK 생성

```bash
npm run build                      # dist/ 생성 (아이콘·Quest 컨트롤러 모델 자동 준비)
npm run apk:key                    # 서명 키스토어(android/busan-vr.keystore) + public/.well-known/assetlinks.json 생성
npm run build                      # assetlinks.json 을 포함해 다시 빌드
# dist/ 를 HTTPS 정적 호스팅에 올립니다. 예) 이 저장소의 GitHub Pages:
npm run build:pages                # ../busan/ 에 빌드 → 커밋/푸시하면 https://<아이디>.github.io/<저장소>/busan/
npm run apk -- --url=https://<배포주소>/          # → busan-vr.apk (서명 완료)
```

- 처음 실행하면 Bubblewrap 이 **JDK 17 과 Android SDK 를 `~/.bubblewrap` 에 자동 설치**할지 묻습니다. 모두 `Y`, SDK 약관은 `y`.
- 비밀번호는 `BUBBLEWRAP_KEYSTORE_PASSWORD`, `BUBBLEWRAP_KEY_PASSWORD` 환경변수로 지정합니다(기본 `busanvr1234`).
- 옵션: `--mode=immersive|2D|auto`, `--out=파일이름.apk`, `--package=kr.busanvr.app`, `--version=1.0.1 --code=2`
- 네트워크 오류(429 등)로 멈추면 같은 명령을 다시 실행하세요. 받은 파일은 캐시되어 이어집니다.
- **키스토어는 꼭 보관하세요.** 같은 키로 서명해야 `adb install -r` 로 덮어쓸 수 있습니다.

### `immersive`(실행 즉시 VR) 로 만들려면

`https://<도메인>/.well-known/assetlinks.json` 이 열려야 합니다(하위 경로 불가).

- Netlify / Vercel / Cloudflare Pages / Firebase Hosting: `dist/` 를 그대로 올리면 됩니다.
- GitHub Pages 프로젝트 사이트(`<아이디>.github.io/<저장소>/`): `<아이디>.github.io` 저장소를 만들어
  `.well-known/assetlinks.json` 과 빈 `.nojekyll` 파일을 올려야 합니다.

## ③ Quest 에 설치 · 실행

```bash
# Quest: 휴대폰 Meta Horizon 앱 → 기기 → 헤드셋 설정 → 개발자 모드 ON, USB 연결 후 헤드셋에서 "USB 디버깅 허용"
adb devices
adb install -r busan-vr.apk
```

헤드셋의 **라이브러리 → (필터) 알 수 없는 출처 → "부산 VR 여행"** 을 실행합니다.

## 조작

| | Meta Quest | 휴대폰 | PC |
|---|---|---|---|
| 둘러보기 | 고개 / 스틱 좌우(30° 스냅 턴) | 드래그 · 🧭 자이로 | 마우스 드래그 · Q/E |
| 이동 | 스틱 앞으로 밀거나 그립 쥐기 → 포물선 조준 → 놓으면 텔레포트 | — | W A S D |
| 선택 | 레이저로 가리키고 트리거 | 탭 | 클릭 |
| 메뉴 | A/X · B/Y 버튼 | 하단 HUD | 하단 HUD |
| 하차벨 | 기둥의 빨간 버튼을 레이저+트리거 | 빨간 버튼 탭 | 클릭 |

## 구조

```
index.html              시작 화면 · 모바일 HUD
public/manifest.json    PWA 매니페스트 (APK 생성에 사용)
public/sw.js            서비스 워커 (오프라인 캐시)
src/busanData.js        명소 17곳 · 지하철 1~4호선 · 버스 노선 · 지형 데이터
src/proceduralScenes.js 3D 부산 지도(허브) · 명소 장면 틀 · 360° 파노라마 교체
src/spots/*.js          권역별 절차적 명소 장면
src/kit3d.js            절차적 3D 도구(배치 메시 · 하늘 · 바다 셰이더 · 현수교 · 전각 …)
src/subwaySystem.js     지도 위 열차 운행 + 1인칭 객차 탑승
src/busSystem.js        지도 위 버스 운행 + 시내버스/2층 오픈탑 탑승, 하차벨
src/vrMenu.js           CanvasTexture 한글 UI 패널 · 레이캐스트 · Quest 컨트롤러(레이저·텔레포트·스냅턴)
src/mobileControls.js   터치/자이로/키보드 조작 · 하단 HUD
src/audioEngine.js      Web Audio 합성음 · ko-KR 안내방송(TTS)
src/main.js             장면 전환 · 입력 통합
scripts/prepare-assets.mjs  아이콘 PNG 생성 · Quest 컨트롤러 모델 복사
scripts/build-apk.mjs       키스토어 · assetlinks · Bubblewrap(Quest) APK 빌드
```

### 360° 파노라마로 교체

`src/busanData.js` 의 명소에 equirectangular 이미지 주소를 넣으면 절차적 장면 대신 표시됩니다
(CORS 허용 필요, 로딩 실패 시 절차적 장면 유지).

```js
{ id: 'haeundae', …, panoramaUrl: 'https://example.com/haeundae_360.jpg' }
```

## 알아 둘 점

- 안내방송은 Web Speech API(`ko-KR`)를 사용합니다. 한국어 음성이 없는 기기에서는 소리 대신 전광판·자막으로 표시됩니다.
- 명소·역 좌표와 노선은 여행 연출용 근사값입니다.
