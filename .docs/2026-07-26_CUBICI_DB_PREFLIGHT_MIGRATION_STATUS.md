# Cubici DB Preflight and Migration Status

## 확인 목적

관리자단 일괄 개발 전에 DB 접속 가능 여부와 PostgreSQL migration 반영 상태를 확인한다.

## DB Preflight 결과

- 실행 기준: `D:\Alt_CSM\.venv\Scripts\python.exe`
- API source path: `D:\Alt_CSM\Cubici\service-api\src`
- DB 접속 결과: 성공
- database: `cubici_local`
- schema: `public`
- base table count: `59`
- PostgreSQL version: `PostgreSQL 17.10`
- server address: Docker 내부 네트워크 대역으로 확인됨
- server port: `5432`
- application 접속 포트 기준: `55432`

## Docker 상태 확인

- `docker ps` 직접 조회는 권한/작업공간 원칙 충돌로 실행 거부됨.
- 다만 DB 접속 결과의 server address가 Docker 내부 네트워크 대역으로 확인되어, 현재 API preflight 기준으로는 Docker PostgreSQL 연결 상태로 판단한다.
- Docker CLI 상태 확인이 꼭 필요하면 별도 승인 후 조회한다.

## Migration 반영 확인

현재 migration tracking table은 없다.

- `public.schema_migrations`: 없음
- `public.alembic_version`: 없음

따라서 migration 적용 여부는 SQL 파일 실행 이력이 아니라 실제 DB object 존재 여부로 확인했다.

## 확인한 Migration Object

### Tables

다음 migration table은 모두 존재한다.

- `contract_review_note`
- `contract_status_history`
- `contract_fee_adjustment_history`
- `moneybank_redemption_operation_history`
- `cbci_err_report`
- `cbci_scheduled_report`
- `billing_payment_detail`
- `billing_refund`
- `admin_account`
- `promotion_charge`
- `moneybank_partner`
- `moneybank_product_preference`
- `prizm_item_update_record`
- `prizm_raw_data_formula`

### Columns

다음 migration column은 모두 존재한다.

- `moneybank_redemption_operation_history.is_reversal`
- `moneybank_redemption_operation_history.reversed_operation_history_id`
- `moneybank_redemption_operation_history.canceled_by_operation_history_id`
- `moneybank_contract.identity_verification_method`
- `moneybank_contract.identity_verification_status`
- `moneybank_contract.identity_verification_reference`
- `moneybank_contract.identity_verified_at`
- `moneybank_contract.electronic_signature_method`
- `moneybank_contract.electronic_signature_status`
- `moneybank_contract.electronic_signature_reference`
- `moneybank_contract.electronic_signed_at`

### Indexes

주요 migration index는 모두 존재한다.

- `idx_contract_review_note_mbid_reg_date`
- `idx_contract_status_history_mbid_reg_date`
- `idx_contract_fee_adjustment_history_mbid_reg_date`
- `idx_redemption_operation_history_mbid_reg_date`
- `idx_redemption_operation_history_reversal_refs`
- `idx_cbci_err_report_input_datetime`
- `idx_cbci_scheduled_report_input_date`
- `idx_billing_payment_detail_payment_date`
- `idx_admin_account_type_grade`
- `idx_promotion_charge_charge_code`
- `ix_moneybank_partner_firm_name`
- `ix_moneybank_product_name`
- `ix_prizm_item_update_record_item`
- `ix_prizm_raw_data_formula_lookup`
- `ix_moneybank_contract_identity_verification`
- `ix_moneybank_contract_electronic_signature`

## 핵심 Table Row Count

| table | row count |
| --- | ---: |
| `users` | 45 |
| `shop_accounts` | 19 |
| `sale` | 2390 |
| `sale_return` | 775 |
| `settlement` | 469 |
| `moneybank_contract` | 7 |
| `moneybank_contract_document` | 6 |
| `moneybank_contract_fee` | 6 |
| `moneybank_redemption_history` | 388 |
| `moneybank_redemption_sales` | 2098 |
| `moneybank_redemption_operation_history` | 0 |
| `prizm_pcs_result` | 536 |
| `prizm_pms_result` | 44 |
| `billing_payment_detail` | 0 |
| `billing_refund` | 0 |
| `charge` | 5 |
| `promotion` | 1 |
| `moneybank_partner` | 0 |
| `moneybank_product_preference` | 0 |

## 판단

- DB preflight는 통과했다.
- 관리자단 일괄 개발을 시작할 수 있는 DB 연결 상태다.
- `003~018` migration의 핵심 object는 적용된 상태로 판단한다.
- 단, migration tracking table이 없기 때문에 이후 migration 추가 시 적용 여부 추적이 어렵다.
- `billing_*`, `moneybank_partner`, `moneybank_product_preference`, `moneybank_redemption_operation_history`는 table은 있으나 현재 row가 없다.

## 개발 지연 리스크

- migration tracking table 부재로 같은 migration이 누락/중복 적용되었는지 이력 확인이 어렵다.
- master data가 비어 있는 영역은 UI가 정상이어도 운영 재현 검증에서 fixture 부족으로 실패할 수 있다.
- 정산/상환 산식 검산은 table 존재와 별개로 legacy batch 산식 대조가 필요하다.

## 다음 액션

1. 관리자단 일괄 개발 전 DB preflight는 통과한 것으로 본다.
2. 다음 migration부터는 적용 이력 table 또는 migration manifest를 추가하는 방안을 검토한다.
3. 관리자단 개발 중 DB 실패가 발생하면 기능 실패가 아니라 환경/fixture/migration 문제로 먼저 분류한다.
