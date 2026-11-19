# 재난문자 차단 (Android APK)

위급·긴급 재난문자가 화면에 뜨지 않도록 휴대폰에 기본으로 들어 있는 **재난문자 표시 앱(Cell Broadcast)을 끄고 켜는** 앱입니다.
테스트 알림 버튼을 누르면 실제 재난문자와 비슷한 화면·경보음·진동을 앱 안에서 직접 띄워 볼 수 있습니다.

설치 파일: [`release/alert-blocker.apk`](release/alert-blocker.apk)

## 왜 Shizuku가 필요한가
안드로이드는 일반 앱이 재난문자를 가로채거나 막지 못하게 되어 있습니다. 시스템 앱을 끄려면 ADB 권한이 필요해서
**Shizuku**(무료 앱, ADB 권한을 대신 빌려줌)를 함께 씁니다. 루팅은 필요 없습니다.

1. Play 스토어에서 **Shizuku**를 설치합니다.
2. 개발자 옵션 → **무선 디버깅**을 켜고, Shizuku 앱에서 "무선 디버깅으로 시작"(페어링)을 합니다.
3. 이 앱을 열고 **Shizuku 권한 요청** → 허용
4. **재난문자 차단하기** → 상태가 `🔕 차단됨`으로 바뀌면 끝
5. 되돌릴 때는 **차단 해제 (원래대로)**

Shizuku는 재부팅하면 다시 시작해야 하지만, 한 번 차단한 상태는 재부팅해도 유지됩니다.

## Shizuku 없이 PC로 하기
앱의 **ADB 명령어 복사** 버튼을 누르면 내 폰에 맞는 명령이 복사됩니다. 예(구글/대부분 기기):
```
adb shell pm disable-user --user 0 com.google.android.cellbroadcastreceiver   # 차단
adb shell pm enable --user 0 com.google.android.cellbroadcastreceiver         # 해제
```

## 테스트 알림
- **지금 테스트 알림 띄우기**: 바로 경보 화면 + 853/960Hz 경보음 + 진동
- **10초 후 테스트**: 버튼을 누르고 화면을 끄면 10초 뒤 잠금화면 위로 뜹니다
- 테스트 알림은 이 앱이 직접 만드는 가짜 알림이라 차단 여부와 상관없이 항상 울립니다.
  실제 통신사 재난문자를 앱이 만들어 보낼 수는 없습니다.

## 주의
- 차단 중에는 **지진·공습·쓰나미 같은 실제 위급 경보도 오지 않습니다.**
- 제조사(특히 삼성)·안드로이드 버전에 따라 패키지 이름이 다르거나 끄기가 거부될 수 있습니다. 로그에 결과가 표시됩니다.

## 빌드
```
cd alert-blocker
./gradlew assembleRelease   # Android SDK 필요 (local.properties 의 sdk.dir)
```
