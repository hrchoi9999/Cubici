# Cubici 관리자 로컬 실행환경 및 사이드바 수정

## 작업 결과

- 관리자 화면 확인 시 API 미실행으로 로딩이 느려지는 문제를 줄이기 위해 API와 admin-web을 함께 실행하는 로컬 스크립트를 추가했다.
- 좌측 사이드바 대메뉴 클릭 시 submenu가 열리도록 React state 기반 accordion 동작을 추가했다.
- `javascript:` 링크를 대메뉴에서 제거하고 `button`으로 변경했다.

## 변경 파일

- `admin-web/src/components/layout/AdminLayout.jsx`
- `scripts/start-admin-local.ps1`
- `docs/2026-07-21_CUBICI_ADMIN_LOCAL_RUNTIME_AND_SIDEBAR_FIX.md`

## 실행 방법

```powershell
powershell -ExecutionPolicy Bypass -File D:\Alt_CSM\Cubici\scripts\start-admin-local.ps1
```

## 검증 항목

- React build: 통과
- FastAPI route/domain test: `18 passed, 1 skipped`
- Playwright E2E: `5 passed`
- 로컬 API/admin 서버 실행 확인: 사용자 명시 승인 필요로 보류

## 다음 액션

- 기존 JSP markup과 React markup 차이를 줄여 legacy CSS 재현도를 높인다.
- 관리자 화면 screenshot 기준 layout/font/table 비교 검증을 추가한다.

## 실행 보류 사유

- `scripts/start-admin-local.ps1` 실행은 FastAPI와 Vite 서버를 호스트 프로세스로 띄우는 작업이다.
- 현재 도구 권한 검토에서 기존 승인 범위가 npm install/build에 한정되어 있어 실행이 차단됐다.
- 사용자가 해당 로컬 서버 실행을 명시 승인하면 다시 실행한다.
