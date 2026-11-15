# 펨뷰어 (에펨코리아 웹 보기 APK)

`https://www.fmkorea.com/` 을 앱 안의 WebView로 여는 간단한 안드로이드 앱입니다. (비공식, 개인용)

- 설치 파일: `release/fmviewer.apk` (Android 8.0 이상)
- 로그인 유지(쿠키 저장), 뒤로가기 = 이전 페이지 / 두 번 누르면 종료
- 동영상 전체화면, 사진 첨부(파일 선택), 파일 다운로드
- 외부 링크(intent://, tel:, 마켓 등)는 해당 앱으로 열기

## 설치
휴대폰에서 `fmviewer.apk` 를 받아 실행 → "출처를 알 수 없는 앱 설치" 허용 → 설치.

## 다시 빌드
```
echo "sdk.dir=/path/to/android-sdk" > local.properties
./gradlew assembleRelease
# 결과: app/build/outputs/apk/release/app-release.apk
```
서명 키: `fmviewer.keystore` (alias `fmviewer`, 비밀번호 `fmviewer1234`). 같은 키로 빌드해야 업데이트 설치가 됩니다.
