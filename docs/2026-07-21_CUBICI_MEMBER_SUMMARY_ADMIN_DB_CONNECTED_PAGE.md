# Cubici 회원현황 회원 종합 관리자 화면 DB 연결 구현

## 작업 결과

- legacy `회원관리 > 회원현황 > 회원 종합(member_tab1)` 화면을 React 관리자 화면으로 1차 migration했다.
- 신규 API는 `/v1/api/management/member-summary`이다.
- `users.reg_date`, `moneybank_contract.request_date`, `partner.reg_date` 기준으로 전일/누적 지표와 기간별 추이를 조회한다.
- legacy `MONEYBANK_USER_INFO`, `CBCI_USER.WITHDRAW_DATE`, `CBCI_USER.WITHDRAW_YN`은 현재 PostgreSQL migration DB에 없어 1:1 산식 재현은 보류했다.

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/MemberSummaryPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/member-summary-management.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`

## 검증 여부

- API pytest: `31 passed, 1 skipped`.
- 실제 DB 조회: 통과.
  - `users`: 45건, `USER`: 42건.
  - `moneybank_contract`: 7건.
  - `partner`: 4건.
- React build: 통과.
- 회원현황 E2E: 통과.

## 보수적 완성도

- `회원관리 > 회원현황`: 50~55%.
- `member_tab1` 회원 종합은 DB/API/화면/E2E까지 구현했다.
- `member_tab2` 회원 정보, `member_tab3` 휴면/해지, legacy 해지회원 원본 필드 대조는 미완료다.

## 다음 액션

- `회원관리 > 회원현황 > 회원 정보(member_tab2)` 목록/상세를 구현한다.
- legacy 해지회원 원본 필드가 추가 제공되면 `가입해지` 산식을 재검산한다.
