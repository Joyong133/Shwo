# 펨뷰어 (에펨코리아 웹 보기 APK)

`https://www.fmkorea.com/` 을 앱 안의 WebView로 여는 간단한 안드로이드 앱입니다. (비공식, 개인용)

- 설치 파일: `release/fmviewer.apk` (Android 8.0 이상)
- **앱 잠금**: 처음 실행할 때 비밀번호를 만들고, 홈으로 나가거나 다른 앱으로 가거나 화면이 꺼졌다 돌아오면 다시 비밀번호를 넣어야 열림
  - 5번 틀리면 30초 대기 / 잠금 화면에서 '비밀번호 바꾸기' / '비밀번호를 잊었어요' → 초기화(사이트 로그인 정보도 함께 삭제)
  - Android 13 이상에서는 최근 앱 목록에 화면 내용이 보이지 않음
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
