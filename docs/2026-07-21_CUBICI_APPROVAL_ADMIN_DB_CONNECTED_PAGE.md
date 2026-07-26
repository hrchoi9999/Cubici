# Cubici 심사 승인 관리자 화면 DB 연결

## 작업 결과

- `/admin/moneybank/approval_tab1` 메뉴를 임시 상태 화면에서 실제 심사 승인 목록 화면으로 전환했다.
- 기존 `moneybank_contract` 기반 계약 API를 사용해 실제 PostgreSQL 데이터로 목록을 로딩한다.
- 심사 승인 목록에 다음 정보를 표시한다.
  - 승인상태
  - 신청일자
  - 회원명
  - 회사명
  - 신청서비스
  - 사업기간
  - 월결제액
  - 프리즘 점수
  - 프리즘 추천 조건
  - 조건심사 상세 버튼
- 목록 row의 `보기` 버튼으로 계약 상세 API를 호출해 심사 상세 정보를 표시한다.
- legacy `m-search`, `fixTable`, `m-shadowTable`, `fixBottom` 구조를 사용해 기존 Cubici 관리자 화면과 같은 흐름으로 맞췄다.

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/pages/ApprovalManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-21_CUBICI_APPROVAL_ADMIN_DB_CONNECTED_PAGE.md`

## 검증 여부

- React build: 통과
- Playwright E2E: `5 passed`
- 실제 DB API 응답 확인
  - 계약: `7건`
  - 정산: `469건`
  - 상환: `6건`
- `/admin/moneybank/approval_tab1` 실제 렌더링 확인
  - active 메뉴: `심사 승인`
  - 목록 row: `7`
  - 요약: 총 `7건`, 심사대기 `1건`, 심사완료 `6건`, 승인 `4건`
  - 상세 row: `6`
  - horizontal overflow: `0`

## 다음 액션

- `/admin/moneybank/approval_tab2` 계약 관리 화면을 실제 DB 목록 화면으로 전환한다.
- 심사 승인 화면의 상태 분류는 legacy 상태코드 매핑을 추가 확인해 정교화한다.
