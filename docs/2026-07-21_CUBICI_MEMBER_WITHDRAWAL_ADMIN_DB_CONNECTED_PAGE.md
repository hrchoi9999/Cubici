# Cubici 회원현황 휴면/해지 관리자 화면 DB 연결 구현

## 작업 결과

- legacy `회원관리 > 회원현황 > 휴면/해지(member_tab3)` 화면을 React 관리자 화면으로 1차 migration했다.
- 신규 API는 `/v1/api/management/member-withdrawals`이다.
- 현재 PostgreSQL DB 기준으로 `moneybank_contract.status = SELF_TERMINATION`, `cancel_request_date`, `users.last_login_date`를 조합해 해지/해지 신청/휴면 후보 목록을 조회한다.
- legacy의 사용자 해지 확정 컬럼(`WITHDRAW_DATE`, `WITHDRAW_YN`)은 현재 PostgreSQL `users` 테이블에 없어 해지확인 write 기능은 구현하지 않았다.

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/MemberWithdrawalPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/member-withdrawal-management.spec.js`
- `admin-web/scripts/run-playwright-e2e.mjs`
- `admin-web/playwright.config.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`

## 검증 여부

- API pytest: `33 passed, 1 skipped`.
- 실제 DB 조회: 통과.
  - 전체 후보: 43건.
  - 해지: 2건.
  - 해지 신청: 1건.
  - 휴면 후보: 40건.
- React build: 통과.
- 휴면/해지 E2E: 통과.

## 보수적 완성도

- `회원관리 > 회원현황`: 70~75%.
- `member_tab1`, `member_tab2`, `member_tab3`의 목록/집계 화면은 DB/API/화면/E2E까지 구현했다.
- 회원 상세 상태 페이지(`/admin/cubici/manageMember/userstatus`)와 legacy 해지확인 write 기능은 아직 미구현이다.

## 다음 액션

- 회원명 클릭 상세 화면 `/admin/cubici/manageMember/userstatus`를 구현한다.
- legacy 해지 컬럼이 추가 제공되면 해지확인 write 정책을 재검토한다.
