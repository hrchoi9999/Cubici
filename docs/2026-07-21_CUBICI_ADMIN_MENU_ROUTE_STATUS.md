# Cubici 관리자 메뉴 라우트 연결

## 작업 결과

- 관리자 좌측 메뉴의 모든 등록 경로를 React 라우팅 기준으로 인식하도록 정리했다.
- 기존 3개 완료 화면은 기존 구현 화면으로 유지했다.
  - 신청 접수: `/admin/moneybank/request`
  - 정산 관리: `/admin/moneybank/settlement`
  - 상환 관리: `/admin/moneybank/redemption`
- 아직 개별 화면이 구현되지 않은 메뉴는 신청 접수 화면으로 잘못 떨어지지 않고, 해당 메뉴 active 상태와 DB/API 연결 상태 화면을 표시한다.
- 미구현 메뉴 상태 화면은 실제 API를 호출해 계약/정산/상환 데이터 건수를 표시한다.

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/components/layout/AdminLayout.jsx`
- `admin-web/src/pages/MigrationRouteStatusPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-21_CUBICI_ADMIN_MENU_ROUTE_STATUS.md`

## 검증 여부

- React build: 통과
- Playwright E2E: `5 passed`
- 실제 DB API 응답 확인
  - 계약: `7건`
  - 정산: `469건`
  - 상환: `6건`
- `/admin/cubici/infoIntegrated/cubici_tab1` 렌더링 확인
  - active 그룹: `통합정보`
  - active 메뉴: `큐빅아이`
  - DB 상태 row: `3`
  - horizontal overflow: `0`

## 다음 액션

- 미구현 메뉴 중 업무 우선순위가 높은 화면부터 실제 목록/API/상세 화면으로 전환한다.
- 각 화면은 실제 DB 데이터 로딩까지 연결한 뒤 완료로 본다.
