# Cubici PostgreSQL FK/Index Review

작성일: 2026-06-30

## 작업 결과

- 핵심 운영 테이블의 조회 조건 기준 인덱스를 추가했다.
- 명확한 참조 관계 후보 18개를 점검했다.
- orphan count가 0인 FK 17개를 PostgreSQL에 적용했다.
- orphan count가 1인 `prizm_pcs_result.mbid -> moneybank_contract.mbid` FK는 보류했다.
- 원본 개인정보, 계좌정보, 식별정보 값은 출력하거나 문서에 기록하지 않았다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/db/postgres/migrations/003_core_indexes_and_constraints.sql` | 핵심 workflow 인덱스 42개와 FK 17개 추가 |
| `Cubici/docs/2026-06-30_CUBICI_FK_INDEX_REVIEW.md` | FK/index 검토 결과 기록 |
| `Cubici/docs/2026-06-30_CUBICI_DB_MIGRATION_RUN_RESULT.md` | DB migration 진행 결과 갱신 |

## FK 후보 점검 결과

| 구분 | 결과 |
|---|---:|
| 점검 FK 후보 | 18 |
| 적용 FK | 17 |
| 보류 FK | 1 |
| 적용 FK validated | 17 |

## 적용 FK

- `users.fintech_id -> fintech.id`
- `fintech_info.fintech_id -> fintech.id`
- `shop_accounts.user_no -> users.user_no`
- `moneybank_advance_contract.user_no -> users.user_no`
- `moneybank_contract.user_no -> users.user_no`
- `moneybank_contract.fintech_id -> fintech.id`
- `moneybank_contract_shop.mbid -> moneybank_contract.mbid`
- `moneybank_contract_fee.mbid -> moneybank_contract.mbid`
- `moneybank_contract_fee_rates.contract_fee_id -> moneybank_contract_fee.id`
- `moneybank_contract_certificate.mbid -> moneybank_contract.mbid`
- `moneybank_contract_document.mbid -> moneybank_contract.mbid`
- `moneybank_redemption_deposit.mbid -> moneybank_contract.mbid`
- `moneybank_redemption_history.mbid -> moneybank_contract.mbid`
- `moneybank_redemption_provision.mbid -> moneybank_contract.mbid`
- `moneybank_redemption_repayment.mbid -> moneybank_contract.mbid`
- `moneybank_redemption_sales.mbid -> moneybank_contract.mbid`
- `prizm_pms_result.mbid -> moneybank_contract.mbid`

## 보류 FK

| FK 후보 | 보류 사유 |
|---|---|
| `prizm_pcs_result.mbid -> moneybank_contract.mbid` | 기존 데이터 기준 orphan count 1 |

## 인덱스 설계 기준

- 사용자/관리자 회원 조회: `users`, `shop_accounts`
- 판매/반품/정산 조회: `sale`, `sale_return`, `settlement`
- 선정산 계약/상환 조회: `moneybank_contract`, `moneybank_contract_*`, `moneybank_redemption_*`
- 평가 결과 연결: `prizm_pcs_result`, `prizm_pms_result`
- 펌뱅킹/거래 요청 추적: `TRADE_REQUEST_BIN`, `firm_request_bin`

## 검증 여부

- PostgreSQL migration 적용: 성공
- `idx_cubici_%` 인덱스 생성 수: 42
- `fk_cubici_%` FK 생성 수: 17
- `fk_cubici_%` FK validated 수: 17
- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 1 passed

## 다음 액션

1. `prizm_pcs_result.mbid` orphan 1건의 업무 의미를 확인한다.
2. 사용자/관리자 화면 inventory와 API 우선순위를 DB 테이블에 연결한다.
3. 핵심 목록 조회 API부터 PostgreSQL query plan을 점검한다.
