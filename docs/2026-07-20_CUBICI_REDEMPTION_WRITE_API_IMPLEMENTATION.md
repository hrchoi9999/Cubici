# Cubici 지급/상환 등록 Write API 1차 구현

## 작업 결과

- 지급/상환 write action 감사 테이블을 추가했다.
- 지급 등록 API를 추가했다.
- 상환 등록 API를 추가했다.
- 두 API 모두 원장 insert, 누적 history append, 감사 history append를 하나의 DB transaction으로 처리한다.

## 변경 파일

- `Cubici/db/postgres/migrations/007_redemption_operation_history.sql`
- `Cubici/service-api/src/cubici_service/redemptions/repository.py`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/redemptions.py`
- `Cubici/service-api/tests/test_domain_routes.py`

## DB 변경

- 신규 테이블: `moneybank_redemption_operation_history`
- 목적:
  - 지급/상환 write action 감사 추적
  - 이전 누적 지급액/상환액/잔액 저장
  - 신규 누적 지급액/상환액/잔액 저장
  - 원본 payload JSON 저장
  - 조작자, 사유, 일시 저장

## 추가 API

### 지급 등록

- `POST /v1/api/redemptions/{mbid}/provisions`
- 처리 테이블:
  - `moneybank_redemption_provision`
  - `moneybank_redemption_sales`
  - `moneybank_redemption_history`
  - `moneybank_redemption_operation_history`
- 주요 검증:
  - 계약 존재 확인
  - `provision_code` 중복 확인
  - `sales_code` 중복 확인
  - `total_provision_amount <= total_payment_amount`
  - sales 목록이 있으면 sales 지급액 합계와 `total_provision_amount` 일치

### 상환 등록

- `POST /v1/api/redemptions/{mbid}/repayments`
- 처리 테이블:
  - `moneybank_redemption_repayment`
  - `moneybank_redemption_deposit`
  - `moneybank_redemption_history`
  - `moneybank_redemption_operation_history`
- 주요 검증:
  - 계약 존재 확인
  - `repayment_code` 중복 확인
  - `deposit_code` 중복 확인
  - deposit 목록이 있으면 deposit 총액이 `repayment_amount` 이상
  - 신규 `outstanding_balance` 음수 금지

## History 산식

- 지급 등록:
  - `new_cumulative_provision = previous_cumulative_provision + total_provision_amount`
  - `new_cumulative_repayment = previous_cumulative_repayment`
  - `new_outstanding_balance = new_cumulative_provision - new_cumulative_repayment`
- 상환 등록:
  - `new_cumulative_provision = previous_cumulative_provision`
  - `new_cumulative_repayment = previous_cumulative_repayment + repayment_amount`
  - `new_outstanding_balance = new_cumulative_provision - new_cumulative_repayment`

## 검증 결과

- migration 적용: `MIGRATION_007_OK`
- service-api pytest: `18 passed`
- 실제 DB E2E:
  - 대상 MBID: `MPK2723123`
  - 지급 등록 API 성공
  - 상환 등록 API 성공
  - 원장 row 생성 확인
  - sales/deposit row 생성 확인
  - operation history 2건 생성 확인
  - 생성 row 전체 원복 완료
- 원복 후 잔여 테스트 데이터:
  - operation history: `0`
  - provision: `0`
  - repayment: `0`

## 보류 사항

- 입금 단독 등록 API는 구현하지 않았다.
- 사유: `moneybank_redemption_deposit`은 `repayment_code` 기반 상환 row에 종속되므로 단독 등록은 원장 일관성을 깨뜨릴 수 있다.
- 운영 화면 연결은 아직 하지 않았다. 먼저 API transaction 안정성을 확인했다.

## 다음 액션

- 관리자 상환 상세 화면에 지급/상환 등록 폼을 연결한다.
- 운영 전에는 `MPH0823122` 기존 history 불일치 1건의 처리 정책을 별도 확정한다.
