# 사이트 통째로 가져오기 (site-grabber)

링크 하나를 넣으면 그 사이트 안의 페이지를 따라가며 **HTML · 본문 텍스트 · 이미지 · 첨부파일**을 전부 저장합니다.
Python 3.8+ 만 있으면 되고 추가 설치는 필요 없습니다.

## 실행
| 기기 | 방법 |
|---|---|
| **안드로이드 폰** | `release/site-grabber.apk` 설치 → 주소 입력(또는 다른 앱에서 링크 '공유') → 가져오기 → '전부 저장 (ZIP)' |
| **윈도우** | `grab.bat` 더블클릭 → 주소 입력 → 페이지 수 입력(엔터=300) |
| **리눅스 / macOS** | `./grab.sh https://example.com/` (주소 없이 실행하면 물어봄) |
| **안드로이드 (Termux)** | `pkg install python` 후 `python grab.py https://example.com/` |
| **claude.ai** | https://claude.ai/artifact/XDLYiRaDdA8ZYrg84J1ZqA — Claude 데스크톱 앱에서만 동작 |

아이폰은 앱 설치 파일을 따로 배포할 수 없어 지원하지 않습니다.

### 안드로이드 앱 기능
- 이미지·첨부파일 받기 (체크 해제 가능), robots.txt 준수
- **JS 사이트 모드**: 화면 뒤 브라우저로 페이지를 그린 뒤 읽어서, 자바스크립트로 내용을 그리는 사이트도 가져옴 (느림, 첨부파일은 일반 모드와 같이 받음)
- 목록에서 페이지를 누르면 본문 보기, 브라우저로 열기
- 저장은 위치를 직접 고르는 방식이라 저장소 권한이 필요 없음. ZIP 안의 구성은 아래 표와 같음 (`pages/`, `text/`, `files/`, `all_text.txt`, `pages.csv`, `files.csv`)
- 다시 빌드: `cd android && ./gradlew assembleRelease` (서명 키 `sitegrabber.keystore`, 비밀번호 `sitegrabber1234`)

## 결과 (`grabbed/<도메인>/`)
| 파일/폴더 | 내용 |
|---|---|
| `all_text.txt` | 모든 페이지 본문을 한 파일로 |
| `pages.csv` | 주소·제목·저장 위치 목록 (엑셀로 열림) |
| `pages/` | 각 페이지 원본 HTML |
| `text/` | 각 페이지 본문 텍스트 |
| `files/` | 이미지, PDF, 한글(hwp) 등 첨부파일 |

## 옵션
| 옵션 | 설명 |
|---|---|
| `-n 1000` | 최대 페이지 수 (기본 300) |
| `-d 0.5` | 페이지 사이 대기 초 (기본 1초) |
| `--whole-site` | 시작 주소 하위 경로만이 아니라 사이트 전체 |
| `--no-files` | 이미지·첨부파일 받지 않기 |
| `--js` | 자바스크립트로 내용이 그려지는 사이트 (`pip install playwright && playwright install chromium` 필요) |
| `--cookie "..."` | 로그인해야 보이는 페이지 (브라우저 개발자도구의 Cookie 값) |
| `-o 폴더` | 저장 위치 |

`Ctrl+C`로 중간에 멈춰도 그때까지 받은 것은 저장됩니다.

## 주의
- 기본으로 `robots.txt`를 지키고 1초씩 쉬면서 받습니다. 서버에 부담을 주지 않도록 대기 시간을 너무 줄이지 마세요.
- 사이트 이용약관과 저작권을 지켜 개인 보관·분석 용도로만 쓰세요.
