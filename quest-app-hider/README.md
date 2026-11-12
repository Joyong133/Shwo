# Quest App Hider (앱 숨기기)

Meta Quest(Horizon OS는 Android 기반)에서 **다른 앱을 숨기거나 다시 보이게** 하는 작은 관리용 앱입니다.
브라우저(`com.oculus.browser`)처럼 라이브러리에 보이는 앱을 체크 한 번으로 감출 수 있습니다.

> 루팅은 필요 없습니다. 다만 안드로이드에서 앱을 숨기는 권한(`setApplicationHidden`)은
> **기기 소유자(Device Owner)** 에게만 있어서, 설치 후 PC에서 **ADB로 한 번** 소유자 지정을 해야 합니다.

빌드 결과물: **`quest-app-hider.apk`**

---

## 작동 원리

- 안드로이드 `DevicePolicyManager.setApplicationHidden(admin, 패키지명, true/false)` 사용
- `true` → 앱이 런처/라이브러리에서 사라짐, `false` → 다시 나타남 (되돌릴 수 있음)
- 이 권한은 **Device Owner** 앱만 쓸 수 있음 → 설치 후 ADB로 1회 지정

---

## 설치 & 설정 (PC + ADB 필요)

### 1. Quest 준비
- Meta 개발자 계정 등록 후, **Meta Horizon 모바일 앱 → 헤드셋 → 개발자 모드 ON**
- USB로 PC에 연결하고 헤드셋 안에서 **USB 디버깅 허용**
- 중요: `dpm set-device-owner`는 **기기에 다른 계정/직장 프로필이 없어야** 성공합니다.

### 2. 설치
```bash
adb install -r quest-app-hider.apk
```

### 3. 기기 소유자 지정 (핵심 · 1회만)
```bash
adb shell dpm set-device-owner com.questhider.app/.HiderAdminReceiver
```
`Success: Device owner set ...` 가 나오면 완료입니다.

> `java.lang.IllegalStateException: Not allowed to set the device owner ...` 가 나오면
> 기기에 이미 계정이 추가돼 있는 경우입니다. 설정에서 계정을 제거하거나,
> 공장초기화 직후(계정 추가 전)에 실행하세요.

### 4. 사용
- Quest 라이브러리 → **알 수 없는 출처** 섹션에서 **Quest App Hider** 실행
- 상단에 `✓ 기기 소유자로 설정됨` 이 보이면 준비 완료
- 각 앱 줄의 **숨기기 / 복원** 버튼으로 토글
- **모든 패키지 표시** 체크박스: 런처에 안 뜨는 시스템 패키지까지 표시

---

## 제거할 때 (중요)

Device Owner 앱은 그냥 지우려 하면 막힙니다. 앱 안의 **`기기 소유자 해제`** 버튼을 먼저 누르세요.
그러면 숨긴 앱을 모두 복원하고 소유자 권한을 반납하므로, 이후 일반적으로 삭제할 수 있습니다.
```bash
adb uninstall com.questhider.app
```
(버튼 없이 ADB만으로 강제로 하려면 보통 공장초기화가 필요합니다.)

---

## 직접 빌드하기

Android SDK(build-tools 34.0.0, platform android-34)만 있으면 Gradle 없이 빌드됩니다.

```bash
export ANDROID_HOME=/path/to/android-sdk
# (선택) 최신 r8.jar 를 $ANDROID_HOME/r8.jar 로 두면 그걸 사용합니다
./build.sh
# → quest-app-hider.apk 생성
```

`build.sh`가 하는 일: `aapt2`로 리소스/매니페스트 링크 → `javac`로 컴파일 →
`d8`(또는 `r8.jar`)로 dex 변환 → dex 패키징 → `zipalign` → `apksigner` 서명.

> 참고: build-tools 34에 포함된 `d8`(r8 8.2.2-dev)은 JDK 21에서 크래시하는 문제가 있어,
> 스크립트는 `$ANDROID_HOME/r8.jar`(최신 r8)가 있으면 그것을 우선 사용합니다.

---

## 구조

```
quest-app-hider/
├── app/
│   ├── AndroidManifest.xml
│   ├── res/
│   │   ├── values/strings.xml
│   │   └── xml/device_admin.xml
│   └── src/com/questhider/app/
│       ├── MainActivity.java        # 앱 목록 UI + 숨기기/복원 로직
│       ├── HiderAdminReceiver.java  # DeviceAdminReceiver (소유자 지정 대상)
│       └── AppLabelComparator.java  # 라벨 기준 정렬
├── build.sh                         # SDK 도구로 직접 APK 빌드
└── quest-app-hider.apk              # 빌드 결과물 (서명됨, 바로 설치 가능)
```

## 참고 / 한계
- 일부 핵심 시스템 패키지는 `setApplicationHidden`이 거부될 수 있어 "변경 실패" 토스트가 뜹니다.
- 숨김은 되돌릴 수 있습니다(복원 버튼). 데이터 삭제가 아니라 '숨김' 상태 전환입니다.
- 서명은 디버그 키입니다. 개인/사이드로드 용도로는 충분하며, 스토어 배포용은 아닙니다.
