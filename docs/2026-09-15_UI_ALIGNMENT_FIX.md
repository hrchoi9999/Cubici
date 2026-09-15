# CUBICI UI 배치 오류 수정

## 범위와 변경

- 2026-09-15 UI 검토에서 확인한 두 문제에 대해 사용자가 수정 승인함.
- 기준 커밋: `f0b092d`. 기존 관리자 E2E 7개, 참조 이미지 2개 및 미추적 자료는 보존함.
- `user-web/src/pages/HomePages.jsx`: 비로그인 모바일 영역을 비인증 상태에서만 렌더링함.
- `user-web/src/styles/final-ui-foundation.css`: 해당 영역 표시 규칙을 공개 메인으로 제한함. 로그인 대시보드에 남아 있던 legacy 모바일 숨김 조건 및 1120px 최소 폭 충돌을 해소하고, 기존 모바일 스타일의 세로 배치/글자 크기를 인증 화면 범위에 복구함.
- 같은 CSS: 목록 도구 모음 라벨 40px 안에 select가 맞도록 높이를 설정하고, 문구 줄바꿈을 방지함. 좁으면 컨트롤 전체를 다음 줄로 배치하며 불필요한 세로 스크롤을 제거함.
- 경계 검증에서 같은 판매/반품/정산 상세 화면의 제목 및 본문에 남아 있던 1120px 최소 폭을 발견함. 해당 세 화면의 1024~1119px 구간에 한해 내부 폭을 보정함. 표 내부의 의도된 가로 스크롤은 유지함.
- 색상, 이미지, 메뉴 구성, 업무 처리, API, 관리자 화면은 변경하지 않음.

## 검증 방식

- 신규 회귀 테스트: `user-web/tests/e2e/ui-alignment-regression.spec.js`.
- 비로그인 메인, 로그인 메인, 판매/반품/정산 목록 5개 화면 상태를 검사함.
- CSS 뷰포트: 360, 390, 767, 768, 1023, 1024, 1119, 1120, 1366px.
- 로그인 메인의 잘못된 비로그인 영역 부재, 실제 대시보드 표시, 긴 금액과 제목의 비겹침, 공개 메인 탭 간격/링크 경계, 도구 모음 40px/내부 select 38px, 컨트롤 비겹침 및 페이지 넘침을 검사함.
- API와 인증은 모두 합성 fixture임. 허용된 preview origin 외 네트워크 요청과 미등록 API를 차단함. 실제 사용자 계정, 운영 API, DB에 접근하지 않음.
- DB 통합 E2E가 아닌 frontend-only mocked browser 검증이므로 DB preflight 및 서버/DB 실행은 불필요함. 기존 DB E2E 실행 래퍼는 실행하지 않음.
- Playwright가 요구하는 기본 브라우저 revision이 설치된 revision과 달라 첫 시도가 실행 환경 단계에서 실패함. 패키지 설치 없이 기존 로컬 Chromium 경로를 명시하여 해결함.
- 초기 focused 검증은 인증 대시보드 숨김과 1024px 최소 폭 문제를 실제로 검출했고, 이를 수정한 뒤 재검증함.
- 소스/테스트는 별도 검토 담당이 읽기 전용으로 검토함. Master가 exact-origin 차단, 공유 반품 화면, 컨트롤 크기/비겹침, breakpoint 테스트 지적을 반영함.

## 실행 방법

최종 결과: Vite build 통과(8.65초), Chromium focused UI 테스트 **45/45 통과**(1.6분), 테스트 파일 `node --check` 및 변경 소스 `git diff --check` 통과. 모든 테스트에서 예기치 않은 네트워크 요청 및 pageerror 없음. 모바일 360/390px, 태블릿 768px 인증 메인과 좁은/일반 데스크톱 1024/1366px 목록의 스크린샷을 육안 대조함. 저장된 최종 합성 캡처는 `data_local/ui-alignment/verified`에 있음.

빌드에는 기존 legacy 이미지 경로의 런타임 해석 및 큰 chunk 경고가 있으나 빌드 실패는 아님. 검증은 위 화면 범위에 한정함. 로컬 preview `http://127.0.0.1:18126/`는 비로그인 화면 확인용으로 실행 상태를 유지함.

작업 위치: `D:\Cubici_Integration_20260730\user-web`.

```powershell
$Node = 'D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe'
$env:VITE_API_BASE_URL = 'http://127.0.0.1:18126'
& $Node ..\admin-web\node_modules\vite\bin\vite.js build --outDir ../data_local/ui-alignment/dist
# 이미 같은 preview가 실행 중이면 중복 실행하지 않음.
& $Node ..\admin-web\node_modules\vite\bin\vite.js preview --outDir ../data_local/ui-alignment/dist --host 127.0.0.1 --port 18126 --strictPort
```

Preview 기동 및 HTTP 200 확인 후 별도 터미널에서:

```powershell
$Node = 'D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe'
$env:PLAYWRIGHT_EXECUTABLE_PATH = 'D:\Alt_CSM\.downloads\ms-playwright\chromium-1228\chrome-win64\chrome.exe'
$env:CUBICI_USER_E2E_PORT = '18126'
& $Node ..\admin-web\node_modules\@playwright\test\cli.js test ui-alignment-regression.spec.js --output ../data_local/ui-alignment/verified
```

`VITE_API_BASE_URL`과 preview origin은 동일하게 맞춤. Playwright가 테스트 컨텍스트에서만 합성 API를 제공하므로 일반 브라우저 preview는 비로그인 화면 확인용이며, 실제 로그인/API 사용은 지원하지 않음. 생성물/로그/합성 스크린샷은 Git 제외 경로 `data_local/ui-alignment`에만 둠. 운영 배포 번들은 덮어쓰지 않음.

## 배포 및 제한

- 이번 작업은 코드 수정 및 로컬 검증까지임. 커밋, 푸시, Cloudflare 배포는 하지 않음.
- 운영 사이트에는 기존 배포가 남아 있음. 운영 반영은 별도 배포 작업이 필요함.
- 전체 사용자/관리자 UI, 업무 기능, legacy 산식, 접근권한에 대한 전체 회귀 검증 결과가 아님.
- 좁은 데스크톱에서 공통 헤더 문구가 여러 줄로 보이는 기존 표현은 이번 본문 수정 범위에 포함하지 않음.

## 후속 승인에 따른 운영 배포 및 푸시

- 사용자가 이후 배포 및 푸시를 명시 승인함. 위 미배포 서술은 로컬 수정 완료 시점 기록임.
- UI 소스/회귀 테스트/검토 문서 5개만 커밋: `d836ab3bdeef0eb3f2e3500d38c77eefc41242b5`.
- GitHub `hrchoi9999/Cubici`의 `fix/cloudflare-admin-spa-routing`에 푸시하고 원격 해시 일치 확인. main 병합이나 force push는 하지 않음.
- 공식 Wrangler로 Pages 프로젝트 `cubici`, production branch `main`에 `dist-cloudflare`만 배포함. 배포 소스 메타데이터는 위 코드 커밋과 일치함.
- 배포 ID: `e98f3946-92ad-42f1-9c44-b95fe4b0af38`.
- 배포 주소: https://e98f3946.cubici.pages.dev
- 운영 주소: https://cubici.co.kr
- 롤백 기준: 이전 운영 배포 `4b4b21d5-23a2-40f4-acd2-47fb31359202`. 필요 시 Cloudflare Pages의 이전 배포 롤백 기능으로 복귀하며 DB/API는 건드리지 않음.
- 운영 API 주소로 사용자/관리자 번들을 재빌드하고 `smoke-cloudflare-static-bundle.mjs` 통과. 관리자 번들, 공통 resources, final-ui 자산 디렉터리 해시가 이전 배포와 모두 동일함. 실제 새 업로드는 사용자 HTML/JS/CSS 3개이며 나머지 3754개 자산은 재사용함.
- 게시 대상 5개만 staging 확인, diff 공백 검사 및 비밀키 패턴 검사 통과. 별도 읽기 전용 검토 담당이 확정적 회귀나 민감정보 공개 위험을 발견하지 못함. 기존 관리자 E2E 7개, PNG 2개와 과거 미추적 자료는 커밋하지 않고 보존함.
- 배포 전용 주소와 운영 주소에서 `verify-astra-deployment.mjs` 각각 23/23 통과: HTML/JS/CSS/관리자 경로와 정적 파일의 원격 해시 일치, CSS 참조 자산 존재 확인.
- API `/v1/api/health`, `/v1/api/health/db` 모두 HTTP 200. API 이미지, Docker 서비스, DB, 외부 runtime env 변경 없음.

### 배포 전환 캐시 처리

초기 운영 도메인 검증에서 새 JS `/assets/index-B5Yjghyv.js`에 412-byte HTML이 캐시된 응답(HTTP 200, text/html, CF-Cache-Status HIT)을 확인함. 같은 URL에 배포 식별 query를 붙인 응답은 정상 JavaScript 및 로컬 해시와 일치하여 배포 원본 손상과 구분함.

Cloudflare 대시보드에서 다음 두 URL만 선택적으로 purge한 후 운영 23/23 검증 통과함. 전체 cache purge, DNS, 캐시 정책, 보안 설정 변경은 하지 않음.

- `https://cubici.co.kr/assets/index-B5Yjghyv.js`
- `https://cubici.co.kr/assets/index-C4aow9g9.css`

배포 전용 주소의 Chrome 렌더링은 확인됨. 전환 중 접속했던 기존 Chrome에는 브라우저 캐시로 빈 화면이 남아 사용자에게 강력 새로고침을 요청함. CDN purge는 이미 내려받은 브라우저 로컬 캐시를 직접 지우지 않으므로, 같은 증상일 때 Ctrl+Shift+R로 재요청이 필요함. 실제 로그인/업무 데이터 변경은 수행하지 않음.

사용자가 강력 새로고침 완료를 알려준 뒤 `https://cubici.co.kr/`의 기존 Chrome 탭에서 실제 본문 렌더링을 재확인함. 데스크톱 및 모바일 비로그인 메인의 탭/로그인 링크/버튼 배치와 이미지 표시를 확인하고 임시 뷰포트를 복원함. 브라우저 캐시 관련 확인도 완료됨. 인증 화면의 수정 검증은 앞선 로컬 합성 회귀 테스트 45/45와 운영 JS/CSS 해시 일치에 근거하며, 이번 배포 후 실제 사용자 로그인은 수행하지 않음.
