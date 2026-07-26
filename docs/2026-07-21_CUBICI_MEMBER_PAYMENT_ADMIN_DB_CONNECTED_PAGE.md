# Cubici 회원관리 결제현황 Admin DB 연결 화면

## 작업 결과

- legacy `회원관리 > 결제관리 > 결제 현황(payment_tab1)` 화면을 React 관리자 화면으로 1차 migration했다.
- legacy `AdminBillingMapper.selectPaymentList` 기준 컬럼과 금액 계산식을 반영했다.
- PostgreSQL에 누락된 legacy 결제상세 수용 테이블 `billing_payment_detail`, `billing_refund` migration을 추가하고 로컬 DB에 적용했다.

## Legacy 기준

- 원 legacy 테이블:
  - `CBCI_BILLING_PAYMENT_DETAIL`
  - `CBCI_BILLING_CHARGE`
  - `CBCI_USER`
  - `CBCI_ACCOUNT`
- 신규 PostgreSQL 매핑:
  - `billing_payment_detail`
  - `billing_refund`
  - `charge`
  - `users`
  - `shop_accounts`
- legacy 계산식:
  - 결제수수료: `TRUNCATE(amount * 0.032, 0)`
  - 부가세: `TRUNCATE(amount / 11, 0)`
  - 순수입: `amount - 결제수수료 - 부가세`

## 변경 파일

- `db/postgres/migrations/011_legacy_billing_payment_tables.sql`
- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/MemberPaymentPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/member-payment-management.spec.js`

## 검증 여부

- PostgreSQL migration 적용 완료.
- 직접 DB/API 함수 조회:
  - `billing_payment_detail` 현재 row: 0건
  - `/management/member-payments` 응답 구조 정상.
- `service-api` pytest:
  - `35 passed, 1 skipped`
- React build:
  - 성공.
- Playwright E2E:
  - `member-payment-management.spec.js` 1건 통과.

## 제한 사항

- 현재 이관된 `data_local/pg_copy` 및 `backup_20240508.sql`에는 legacy 결제상세 원천 데이터가 확인되지 않았다.
- 따라서 화면/API는 legacy 기준으로 구현했지만, 실제 결제 row는 현재 0건이다.
- 결제 이력 완전 재현을 위해서는 운영 원천의 `CBCI_BILLING_PAYMENT_DETAIL`, `CBCI_BILLING_REFUND` 데이터 재확보 또는 별도 CSV 이관이 필요하다.

## 보수적 완성도

- `회원관리 > 결제관리`: 35~40%.
- 사유:
  - 화면/API/E2E는 구현됨.
  - legacy 컬럼/계산식은 반영됨.
  - 원천 결제 데이터 미이관으로 실데이터 재현 검증은 미완료.

## 다음 액션

- `회원관리 > 결제관리 > 요금변경 관리(payment_tab2)`를 legacy 기준으로 구현한다.
- 결제상세 원천 데이터 확보 시 `billing_payment_detail`, `billing_refund`에 이관하고 금액 합계 검산을 진행한다.
