# Quest App Hider (앱 차단 · 숨기기)

Meta Quest에서 **브라우저(`com.oculus.browser`) 같은 앱을 막는** 관리용 앱입니다.
**ADB 없이** 헤드셋 안에서만 설정할 수 있습니다.

**APK 직접 다운로드 (.apk):**
https://github.com/Joyong133/Shwo/raw/993e62f7ba6242661623e5e1c8de0a9080721e6e/quest-app-hider/quest-app-hider.apk

---

## 두 가지 모드

| 모드 | ADB | 하는 일 |
|---|---|---|
| **차단 (기본)** | 필요 없음 | 차단한 앱이 열리면 바로 닫고 🔒 "관리자가 차단한 앱" 화면을 띄움 |
| 숨기기 (선택) | 1회 필요 | 아이콘 자체를 라이브러리에서 숨김 (Device Owner 권한) |

안드로이드 보안 정책상 **아이콘을 완전히 없애는 것**은 ADB(또는 기업용 MDM) 없이는 불가능합니다.
그래서 ADB 없이 쓰는 방식은 **열리는 순간 막는 방식**이고, 일반 자녀보호 앱과 같은 원리입니다.

---

## 설정 방법 (ADB 없이)

1. **설치** — 헤드셋의 Quest 브라우저로 위 링크를 열어 `.apk`를 받고 설치합니다.
   (알 수 없는 출처 설치를 허용해야 하며, 펌웨어 버전에 따라 헤드셋 안에서 바로
   설치가 안 될 수 있습니다. 그런 경우 설치 단계만은 SideQuest 같은 도구가 필요합니다.)
2. **앱 실행** — 라이브러리 → *알 수 없는 출처* → **Quest App Hider**
3. **관리자 PIN 설정** (숫자 4자리 이상) — 이후 설정을 바꾸려면 이 PIN이 필요합니다.
4. **① 접근성에서 차단 켜기** 버튼 → *설치된 앱/서비스* → **Quest App Hider 차단** 켜기
   - 회색으로 막혀 있으면: **앱 정보 (제한된 설정 허용)** 버튼 → 오른쪽 위 ⋮ →
     **제한된 설정 허용** → 다시 4번
5. 목록에서 막을 앱(예: **Browser**) 옆 **차단** 누르기 → `차단됨 · 해제` 로 바뀌면 완료

상단 상태가 `✓ 차단 서비스 켜짐` 이면 작동 중입니다.

## 안전장치
- 관리 화면은 PIN으로 잠기며, 화면을 벗어나면 자동으로 다시 잠깁니다.
- 시스템 UI, 홈 런처, 설정, 이 앱 자체는 **차단할 수 없게** 막아뒀습니다 (헤드셋이 먹통이 되지 않도록).
- 차단 서비스는 화면 내용을 읽지 않고, **어떤 앱이 열렸는지만** 확인합니다.

## 한계
- 차단한 앱의 아이콘은 라이브러리에 그대로 보입니다 (누르면 바로 닫힘).
- 접근성 설정을 직접 끄면 차단이 풀립니다. ADB 없이 이것까지 막을 방법은 없습니다.
- 실제 Quest 기기에서는 아직 테스트하지 않았습니다. Horizon OS 버전에 따라 차단 화면이
  뜨는 방식이 다를 수 있습니다.

---

## (선택) 아이콘까지 숨기기 — ADB 1회
```bash
adb shell dpm set-device-owner com.questhider.app/.HiderAdminReceiver
```
설정하면 각 앱 줄에 **숨기기** 버튼이 추가됩니다. 앱을 지우기 전에 반드시 앱 안의
**기기 소유자 해제** 버튼을 먼저 누르세요 (안 그러면 공장초기화가 필요할 수 있음).

---

## 직접 빌드하기
Android SDK(build-tools 34.0.0, platform android-34)만 있으면 Gradle 없이 빌드됩니다.
```bash
export ANDROID_HOME=/path/to/android-sdk
# (선택) 최신 r8.jar 를 $ANDROID_HOME/r8.jar 로 두면 그걸 사용합니다 (JDK 21 호환)
./build.sh   # → quest-app-hider.apk
```

## 구조
```
app/src/com/questhider/app/
├── MainActivity.java        # PIN 잠금 + 앱 목록 + 차단/숨기기
├── BlockerService.java      # 접근성 서비스: 차단 앱이 열리면 닫음 (ADB 불필요)
├── BlockedActivity.java     # 🔒 차단 안내 화면
├── Prefs.java               # 차단 목록 / PIN(해시) 저장
├── HiderAdminReceiver.java  # (선택) Device Owner 숨기기 모드
└── AppLabelComparator.java
```
