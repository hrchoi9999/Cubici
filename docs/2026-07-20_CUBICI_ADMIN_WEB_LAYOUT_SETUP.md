# Cubici Admin Web Layout Setup

작성일: 2026-07-20

## 작업 결과

- `admin-web`에 Vite React 기본 엔트리를 추가했다.
- 기존 Cubici 관리자 화면의 `/resources/...` 참조 경로를 유지하기 위해 legacy asset mirror를 구성했다.
- `cubiciAdminFrame.jsp`, `adminHeader.jsp` 기준으로 `AdminLayout` 1차 구조를 구현했다.
- 관리자 첫 화면은 `admin\moneybank\operation\requestState.jsp`의 신청 접수 화면을 기준으로 skeleton을 구성했다.

## 변경 파일

- `admin-web\package.json`
- `admin-web\index.html`
- `admin-web\vite.config.js`
- `admin-web\src\main.jsx`
- `admin-web\src\App.jsx`
- `admin-web\src\components\layout\AdminLayout.jsx`
- `admin-web\src\pages\AdminDashboardPage.jsx`
- `admin-web\src\api\contracts.js`
- `admin-web\src\styles\admin-web.css`
- `admin-web\public\resources\rudicks\...`
- `admin-web\public\resources\assets\images\favicon.png`
- `docs\2026-07-20_CUBICI_ADMIN_WEB_LAYOUT_SETUP.md`

## 설계 판단

- 기존 CSS가 `/resources/...` 절대 경로를 사용하므로 React public root 아래 `resources` 경로를 mirror 한다.
- 기존 jQuery, JSP, JSTL 코드는 직접 실행하지 않고 화면 구조와 workflow 분석용으로만 사용한다.
- 관리자 공통 메뉴는 `cubiciAdminFrame.jsp`의 `admin_type=00` 기준 전체 메뉴를 우선 반영했다.
- 화면 제목은 기존 frame의 `subVisual h2/h3` 갱신 방식을 React state/props로 대체한다.
- 신청 접수 skeleton은 현 API 범위 내에서 `GET /v1/api/contracts`를 우선 연결했다.
- legacy `requestState.jsp`의 검색 조건별 서버 필터는 아직 전용 API가 없어 후속 구현 대상으로 둔다.

## 검증 여부

- `admin-web\public\resources\rudicks\css\common.css` 경로 확인 완료
- `admin-web\public\resources\rudicks\img\logo-w.svg` 경로 확인 완료
- `admin-web\public\resources\assets\images\favicon.png` 경로 확인 완료
- `rudicks` mirror 파일 810개 확인 완료
- 로컬 PATH에서 `node`, `npm` 명령을 찾지 못했다.
- `D:\Alt_CSM\.tools\node-v22.13.1-win-x64`에 Node.js portable 설치 완료
- Node.js `v22.13.1`, npm `10.9.2` 확인 완료
- 사용자 명시 예외 승인 후 npm 의존성 설치 완료
- 최초 npm install은 esbuild postinstall에서 `node`를 PATH에서 찾지 못해 실패했고, portable Node 경로를 PATH 앞에 추가해 재시도 후 성공
- `npm run build` 성공
- Vite build 결과: 32 modules transformed, built in 8.00s
- build 산출물: `admin-web\dist\index.html`, `admin-web\dist\assets`, `admin-web\dist\resources`
- `admin-web\.gitignore`로 `node_modules`, `dist`, `.vite` 제외 처리
- 신청 접수 skeleton의 계약 목록 API 연결 코드 추가
- 신청 접수 검색 폼을 `GET /v1/api/contracts` query parameter와 연결
- 회원ID, 회원명, 회사명 검색을 `users.email/name/biz_name` 기준으로 연결
- 목록 상태 버튼에서 계약 상세 API를 조회하는 상세 패널 연결
- 상세 패널을 legacy 제출서류 확인 화면 기준으로 `회원정보`, `신용정보 입력`, `서류 확인` 섹션으로 확장
- Vite dev server proxy: `/v1/api` -> `http://127.0.0.1:8000`
- Vite dev server 직접 실행은 일시적으로 `http://127.0.0.1:5174`, HTTP 200을 확인했다.
- Codex 백그라운드 프로세스 유지 제약으로 dev server가 지속 실행되지는 않았다.
- npm dev script는 Windows child process에서 `node` PATH 인식 문제가 있어, dev server는 portable `node.exe`로 `node_modules\vite\bin\vite.js`를 직접 실행하는 방식이 안정적이다.
- 실제 계약 목록 데이터 표시는 `service-api`가 `127.0.0.1:8000`에서 실행 중이어야 한다.
- PostgreSQL 실행 후 Vite proxy를 통한 실데이터 API 호출을 확인했다.

## 다음 액션

1. 사용자 터미널에서 `service-api`와 `admin-web` dev server 실행
2. 브라우저에서 관리자 신청 접수 화면 확인
3. `MONEYBANK_SUB_CHECK` 대응 migration 여부 확인
4. Playwright 또는 브라우저 screenshot으로 legacy 화면과 시각 차이 기록

추가 상세 기록: `docs\2026-07-20_CUBICI_CONTRACT_FILTER_API_ADMIN_CONNECTION.md`

## 로컬 실행 명령

```powershell
cd D:\Alt_CSM\Cubici\admin-web
$env:Path='D:\Alt_CSM\.tools\node-v22.13.1-win-x64;' + $env:Path
D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe D:\Alt_CSM\Cubici\admin-web\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5174
```
