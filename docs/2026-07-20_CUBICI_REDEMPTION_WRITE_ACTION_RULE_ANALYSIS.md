# Cubici 지급/상환 Write Action 규칙 분석 및 Transaction 설계

## 작업 결과

- legacy 상환 관리 화면, controller, service, mapper를 분석했다.
- 신규 PostgreSQL `moneybank_redemption_*` 데이터 관계를 검증했다.
- 지급/상환 등록 write API를 바로 구현하지 않고, transaction 설계를 먼저 확정했다.

## Legacy 분석 범위

- `src/main/java/egovframework/azon/admin/moneybank/operation/web/RedemController.java`
- `src/main/java/egovframework/azon/admin/moneybank/operation/service/RedemService.java`
- `src/main/java/egovframework/azon/admin/moneybank/operation/service/MbStatus.java`
- `src/main/resources/egovframework/sqlmap/mappers/AdminRedemMapper.xml`
- `src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/moneybank/operation/redemDetail.jsp`

## 확인된 Legacy 동작

- 관리자 상환 화면의 주요 API는 조회 중심이다.
  - `/admin/moneybank/redemption/list`
  - `/admin/moneybank/redemdetail/list`
  - `/admin/moneybank/redemdetail/eval-list`
  - `/admin/moneybank/redemdetail/eval-enroll`
  - `/admin/moneybank/redemdetail/update/status`
- `redemDetail.jsp`에서 가능한 write 동작은 다음 2개다.
  - 평가 메모 등록
  - 상환 계약 상태 변경
- legacy 관리자 코드에서 `MONEYBANK_REDEM_*` 또는 신규 `moneybank_redemption_*` 원장 테이블에 직접 insert/update하는 흐름은 확인되지 않았다.
- 따라서 지급/상환/입금 원장 생성은 관리자 화면이 아니라 외부 배치 또는 정산 연동에서 생성된 것으로 추정한다.

## Legacy 상환 상세 산식

- 상환 상세 목록은 입금/상환을 같은 timeline으로 합쳐 보여준다.
- legacy 쿼리 구조:
  - 입금 row: `MONEYBANK_REDEM_PROVISION`
  - 상환 row: `MONEYBANK_REDEM_CALCULATE`
  - 상환 입금액: `MONEYBANK_REDEM_DEPOSIT`
- legacy 잔액 계산:
  - `cal_balance = 누적 입금액 - 누적 상환원금`
- 신규 PostgreSQL 대응:
  - 지급/입금 성격: `moneybank_redemption_provision`
  - 상환 성격: `moneybank_redemption_repayment`
  - 상환 입금 내역: `moneybank_redemption_deposit`
  - 판매별 지급 내역: `moneybank_redemption_sales`
  - 누적 잔액 스냅샷: `moneybank_redemption_history`

## 상태 코드

- `06`: 계약체결
- `07`: 계약만료
- `62`: 주의
- `63`: 경고
- `71`: 해지신청
- `72`: 본인해지
- `73`: 강제해지
- legacy 상환 상세 화면:
  - 상태 `71`이면 `본인해지` 버튼 노출
  - 상태 `06`, `62`, `63`, `71`이면 `강제해지` 버튼 노출

## DB 검증 결과

- `moneybank_redemption_provision.status`
  - `END`: 532
  - `PROVISION`: 6
- `moneybank_redemption_repayment.status`
  - `END`: 339
- `moneybank_redemption_history` 관계 검증:
  - 원칙: `outstanding_balance = cumulative_provision_amount - cumulative_repayment_amount`
  - 전체 388건 중 1건 불일치
  - 불일치 row: `MPH0823122`
    - `cumulative_provision_amount = 3616`
    - `cumulative_repayment_amount = 3616`
    - `outstanding_balance = 3616`
    - 산식상 잔액은 `0`
- `moneybank_redemption_deposit.repayment_code`는 null이 아니며 repayment code와 모두 매칭된다.

## 신규 Write API 설계 원칙

- 기존 조회 화면과 집계 API는 유지한다.
- 지급/상환/입금 원장 등록은 신규 Python API로 명시적으로 분리한다.
- 모든 write는 단일 DB transaction으로 처리한다.
- transaction 안에서 원장 테이블 insert 후 `moneybank_redemption_history`를 append-only로 추가한다.
- 기존 history row를 수정하지 않는다.
- 원복은 삭제보다 reverse entry 또는 취소 이력을 우선한다.
- 금액 산식 검증 실패 시 transaction 전체 rollback한다.

## 제안 API

### 지급 등록

- `POST /v1/api/redemptions/{mbid}/provisions`
- 대상 테이블:
  - `moneybank_redemption_provision`
  - `moneybank_redemption_sales`
  - `moneybank_redemption_history`
- 입력:
  - `request_code`
  - `provision_code`
  - `total_payment_amount`
  - `total_usage_fee`
  - `total_provision_amount`
  - `provision_date`
  - 판매별 지급 row 목록
- 처리:
  - 계약 존재 확인
  - `provision_code` 중복 확인
  - 판매별 `sales_code` 중복 확인
  - provision row insert
  - sales row insert
  - latest history 조회
  - `new_cumulative_provision = previous_cumulative_provision + total_provision_amount`
  - `new_cumulative_repayment = previous_cumulative_repayment`
  - `new_outstanding_balance = new_cumulative_provision - new_cumulative_repayment`
  - history append

### 상환 등록

- `POST /v1/api/redemptions/{mbid}/repayments`
- 대상 테이블:
  - `moneybank_redemption_repayment`
  - `moneybank_redemption_deposit`
  - `moneybank_redemption_history`
- 입력:
  - `repayment_code`
  - `repayment_amount`
  - `repayment_usage_fee`
  - `remittance_fee`
  - `balance_provision_amount`
  - `balance_provision_date`
  - 입금 row 목록
- 처리:
  - 계약 존재 확인
  - `repayment_code` 중복 확인
  - deposit row별 `deposit_code` 중복 확인
  - repayment row insert
  - deposit row insert
  - latest history 조회
  - `new_cumulative_provision = previous_cumulative_provision`
  - `new_cumulative_repayment = previous_cumulative_repayment + repayment_amount`
  - `new_outstanding_balance = new_cumulative_provision - new_cumulative_repayment`
  - `new_outstanding_balance`가 음수면 rollback
  - history append

### 입금 단독 등록

- 원칙적으로 보류한다.
- 사유: 현재 schema에서 deposit은 `repayment_code` FK 성격을 가지므로 repayment 없이 단독 등록하면 원장 일관성이 깨진다.

## Transaction 검증 조건

- `mbid`는 `moneybank_contract.mbid`에 존재해야 한다.
- `provision_code`, `repayment_code`, `sales_code`, `deposit_code`는 중복되면 안 된다.
- 모든 금액은 0 이상 정수여야 한다.
- `total_provision_amount <= total_payment_amount` 조건을 기본 검증으로 둔다.
- `repayment_amount + repayment_usage_fee + remittance_fee`와 deposit 총액의 관계는 legacy에서 명확히 확인되지 않아 추가 검증 필요로 둔다.
- history append 후 다음 관계를 만족해야 한다.
  - `outstanding_balance = cumulative_provision_amount - cumulative_repayment_amount`

## 구현 전 보류/확인 필요

- `PROVISION` 상태 row 6건의 의미 확인이 필요하다.
  - 추정: 지급 진행 중 또는 미상환 지급 건.
- `MPH0823122` history 불일치 row 처리 방침이 필요하다.
  - 기존 데이터 보존 원칙상 자동 수정하지 않는다.
  - 신규 write API에서는 새 history부터 산식 검증을 강제한다.
- 상환 등록 시 `deposit_amount`, `repayment_amount`, `balance_provision_amount` 사이의 정확한 업무 산식은 legacy write 코드가 없어 추가 확인이 필요하다.

## 다음 액션

- `moneybank_redemption_operation_history` 감사 테이블 migration을 추가한다.
- 지급/상환 등록 API는 감사 테이블과 함께 구현한다.
- 첫 구현은 실제 DB row를 생성한 뒤 즉시 rollback하는 E2E로 검증한다.
