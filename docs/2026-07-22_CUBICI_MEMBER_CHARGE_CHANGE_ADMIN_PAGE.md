# Cubici 회원관리 요금변경 관리 Admin 화면

## 작업 결과

- legacy `회원관리 > 결제관리 > 요금변경 관리(payment_tab2)` 화면을 React 관리자 화면으로 1차 migration했다.
- legacy `AdminBillingMapper.selectChangeChargeList`, `selectRefundData`, `updateRefundData`, `updateDetailData` 기준으로 목록/환급 상세/환급완료 API를 구현했다.
- `payment_tab2` 라우팅과 E2E 검증을 추가했다.

## Legacy 기준

- 원 legacy 테이블:
  - `CBCI_BILLING_PAYMENT_DETAIL`
  - `CBCI_BILLING_REFUND`
  - `CBCI_BILLING_CHARGE`
  - `CBCI_USER`
  - `CBCI_ACCOUNT`
- 신규 PostgreSQL 매핑:
  - `billing_payment_detail`
  - `billing_refund`
  - `charge`
  - `users`
  - `shop_accounts`
- legacy 상태 기준:
  - `refund_type is null`: 변경/추가
  - `refund_type = 'C'`: 변경/환급
  - `refund_type = 'R'`: 해지/환급
  - 환급완료 시 `billing_refund.status = 'C'`, `refund_date = now()`
  - 신규 결제상세 row는 `status = RR`이면 `RC`, 그 외는 `CC`로 변경

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/MemberChargeChangePage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/member-charge-change-management.spec.js`

## 검증 여부

- `service-api` pytest:
  - `37 passed, 1 skipped`
- React build:
  - 성공
- Playwright E2E:
  - `member-charge-change-management.spec.js` 1건 통과
- PostgreSQL 실조회:
  - 현재 PostgreSQL 프로세스가 없어 직접 조회는 실패했다.
  - PostgreSQL 실행 요청은 보안 검토에서 거절되어 우회 실행하지 않았다.

## 제한 사항

- 현재 로컬 PostgreSQL에는 legacy 결제상세 원천 row가 없어 `payment_tab1`과 동일하게 실데이터 재현 검산은 남아 있다.
- 카드 PG 취소 API는 외부 결제망 연동이므로 로컬 개발에서는 직접 호출하지 않았다.
- 환급완료 DB write는 API로 구현했지만, 실제 row 기준 write/rollback 검증은 PostgreSQL 재실행 후 수행해야 한다.

## 보수적 완성도

- `회원관리 > 결제관리`: 50~55%.
- 사유:
  - `payment_tab1`, `payment_tab2` 목록/화면/API/E2E는 구현됨.
  - legacy 컬럼과 상태 처리 기준은 반영됨.
  - 결제상세 원천 데이터와 PG 취소 연동 검증이 남아 있음.

## 다음 액션

- PostgreSQL 실행 승인 후 `billing_payment_detail`, `billing_refund` 실데이터 또는 임시 transaction row로 목록/환급완료 write 검증을 수행한다.
- 다음 화면은 `환경설정 > 요금제 관리(manageCharge)` 또는 `환경설정 > 관리자 등록(adminRegister_tab1)` 중 우선순위에 따라 진행한다.
