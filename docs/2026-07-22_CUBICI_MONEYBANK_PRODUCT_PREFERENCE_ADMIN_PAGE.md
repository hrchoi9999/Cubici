# Cubici 환경설정 머니뱅크 관리 화면 Migration

## 작업 결과

- legacy `adminPreference/manageMoneybank_tab1/tab2` 화면을 React 관리자 화면으로 구현했다.
- legacy `MONEYBANK_PARTNER` + `MONEYBANK_PRODUCT` 흐름을 PostgreSQL `moneybank_partner` + `moneybank_product_preference` 구조로 신규 정의했다.
- 머니뱅크 상품 목록, 검색, 상세 조회, 등록, 수정 API를 추가했다.
- 상품 기본정보, 담당자, 신청조건, 운영조건 필드를 PostgreSQL/API/React form으로 연결했다.

## 변경 파일

- `db/postgres/migrations/014_moneybank_product_preferences.sql`
- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/preferences.js`
- `admin-web/src/pages/MoneybankProductPreferencePage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/moneybank-product-preference.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`
- `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`

## Legacy 기준

- legacy 화면:
  - `/admin/cubici/adminPreference/manageMoneybank_tab1`
  - `/admin/cubici/adminPreference/manageMoneybank_tab2`
- legacy Ajax/API:
  - `/admin/cubici/adminPreference/manageMoneybank_tab1_Select`
  - `/admin/cubici/adminPreference/manageMoneybank_tab1_gotoTab2`
  - `/admin/cubici/adminPreference/managerMoneybank_tab2_regist`
- legacy 테이블:
  - `MONEYBANK_PARTNER`
  - `MONEYBANK_PRODUCT`
- PostgreSQL 전환 테이블:
  - `moneybank_partner`
  - `moneybank_product_preference`

## 구현 범위

- 목록 컬럼:
  - 상태
  - 회사명
  - 상품명
  - 최소금액
  - 최대금액
  - 최소기간
  - 최대기간
  - 최소 수수료
  - 최대 수수료
  - 담당자
  - 전화
  - 상세보기
- 검색 조건:
  - 상태
  - 회사명
  - 상품명
  - 담당자
  - 보기기준
- write 기능:
  - 머니뱅크 협력사/상품 등록
  - 상세 조회
  - 협력사/상품 수정
  - 상품 운영조건 upsert

## 검증 여부

- Python API 테스트: `42 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `moneybank-product-preference.spec.js` 성공
- PostgreSQL live DB 직접 저장/조회 검증: 미완료

## 보류/주의사항

- 현재 PostgreSQL 프로세스가 실행 중이 아니어서 live DB CRUD 검증은 하지 못했다.
- legacy 원천 DDL이 현재 PostgreSQL schema에 없어서 `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT`는 신규 migration으로 정의했다.
- legacy `EXTENTION_YN` 오탈자 필드는 신규 DB에서 `extension_yn`으로 정리했다.
- legacy 삭제 기능이 화면에서 명확하지 않아 삭제 API/버튼은 이번 범위에서 제외했다.
- 상태값 `00/01/02`의 운영/완료/중지 매핑은 legacy 화면 흐름 기준 추정이다. 운영 전 실제 DB 값과 대조가 필요하다.
- 수수료/이자 단위는 `%` 전제로 표시했다. 기존 DB 실제 값 범위와 재확인이 필요하다.

## 다음 액션

- PostgreSQL 실행 후 `moneybank_partner`, `moneybank_product_preference` live CRUD 검증.
- legacy DB row count와 상품별 수수료/기간/한도 값 대조.
- 다음 환경설정 화면 후보:
  - Prism System
  - 서버 관리

## 2026-07-23 live DB schema 적용 및 CRUD 재검증

### 작업 결과

- 실제 PostgreSQL DB에 `moneybank_partner`, `moneybank_product_preference` 테이블이 없는 것을 확인했다.
- 누락 원인은 API 테이블 매핑 오류가 아니라 `014_moneybank_product_preferences.sql` migration 미적용으로 판단했다.
- `Cubici/db/postgres/migrations/014_moneybank_product_preferences.sql`를 실제 DB에 적용했다.
- `moneybank-products` 목록 API가 더 이상 `UndefinedTable` 오류를 내지 않는 것을 확인했다.
- 임시 머니뱅크 상품 row로 등록, 상세조회, 수정, 목록조회, cleanup을 검증했다.

### 변경/적용 내역

| 항목 | 내용 |
| --- | --- |
| DB schema | `moneybank_partner`, `moneybank_product_preference` 생성 |
| 적용 SQL | `db/postgres/migrations/014_moneybank_product_preferences.sql` |
| 테스트 row | `firm_id=E2E-MB-PROD-001` 임시 등록 후 삭제 |
| 문서 | live DB 검증 결과 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| migration 적용 | `applied_014_moneybank_product_preferences` |
| 테이블 존재 확인 | `moneybank_partner`, `moneybank_product_preference` |
| 적용 직후 목록 조회 | `moneybank_products_total 0`, 오류 없음 |
| 임시 상품 등록 | `created 1` |
| 임시 상품 상세조회 | `E2E 선정산 상품` |
| 임시 상품 수정 | `updated`, 상태 `중지` |
| 임시 상품 목록 검색 | `listed_total 1` |
| cleanup | `leftover_partner 0`, `leftover_product 0` |
| cleanup 후 목록 | `moneybank_products_total_after_cleanup 0` |
| API 단위 테스트 | `62 passed` |

### 보류/추정

- 현재 두 신규 테이블은 schema만 적용되어 있고 legacy 원천 데이터는 아직 적재되어 있지 않다.
- legacy `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` 원천 row가 PostgreSQL 초기 이관 대상 45개 테이블에는 포함되지 않았던 것으로 보인다.
- 운영 기능 재현을 위해서는 legacy 원천 데이터 추출본에서 해당 상품/협력사 데이터를 확보해 신규 테이블로 적재해야 한다.

### 다음 액션

1. legacy `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` 원천 데이터가 `.Cubici`/`Cubici` 자료 안에 남아 있는지 재검색한다.
2. 원천 row가 있으면 `moneybank_partner`, `moneybank_product_preference` 적재 SQL을 작성한다.
3. 사용자 마이페이지 요금정보를 실제 가입/결제 상태와 연결한다.

## 2026-07-23 legacy 원천 데이터 재검색 결과

### 작업 결과

- 현재 작업공간 `D:\Alt_CSM\Cubici` 내부 자료에서 legacy `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` 실제 row를 재검색했다.
- `backup_20240508.sql`, `db/mysql_legacy/schema_only.sql`, `db/mysql_legacy/schema_inventory.json`, `data_local/pg_copy` 기준으로 해당 두 테이블의 DDL/INSERT 원천은 확인되지 않았다.
- legacy Java/JSP/MyBatis 업무 흐름은 확인했다.
  - 목록: `/admin/cubici/adminPreference/manageMoneybank_tab1_Select`
  - 등록/수정: `/admin/cubici/adminPreference/managerMoneybank_tab2_regist`
  - 상세 이동: `/admin/cubici/adminPreference/manageMoneybank_tab1_gotoTab2`
  - 주요 매퍼: `PreferencesMapper.xml`의 `selectMoneybankList`, `insertMoneybankProduct`, `insertMoneybankPartner`, `updateMoneybankProduct`, `updateMoneybankPartner`
- 현재 PostgreSQL에는 신규 테이블 schema만 있고 상품 row는 없다.

### 확인한 자료

| 자료 | 결과 |
| --- | --- |
| `backup_20240508.sql` | `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` match `0` |
| `db/mysql_legacy/schema_only.sql` | `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` match `0` |
| `db/mysql_legacy/schema_inventory.json` | `moneybank_contract`, `moneybank_redemption_*` 등은 있으나 상품/협력사 테이블 없음 |
| `data_local/pg_copy` | `partner.csv`, `moneybank_contract*.csv`, `moneybank_redemption_*.csv` 등은 있으나 상품/협력사 CSV 없음 |
| legacy mapper/JSP | 상품관리 업무 흐름과 필드 구조 확인됨 |

### DB 현재 상태

| 테이블 | row 수 |
| --- | ---: |
| `moneybank_partner` | 0 |
| `moneybank_product_preference` | 0 |
| `partner` | 4 |
| `moneybank_contract` | 7 |
| `moneybank_redemption_sales` | 2098 |

### 판단

- 현재 보유 자료만으로는 legacy 상품관리 master인 `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` 실데이터를 신규 PostgreSQL에 적재할 수 없다.
- 단, 선정산/구매자금 대출에 실제 적용된 계약별 금융조건 DB는 존재한다.
  - `moneybank_contract.product_code`: 계약 상품 코드. 현재 실데이터는 `MP`.
  - `moneybank_contract_fee.payment_rate`: 지급율. 현재 주요 값은 `80`.
  - `moneybank_contract_fee.sales_limit_per_order`: 주문건당 한도. 현재 주요 값은 `3000000`.
  - `moneybank_contract_fee.max_outstanding_balance`: 최대 미상환금. 현재 주요 값은 `5000000`.
  - `moneybank_contract_fee_rates.fee_type`, `fee_rate`: 쇼핑몰별 수수료율. 현재 `COUPANG 1.60`, `NAVER 0.60/1.20`, `STREET11 0.80`, `GMARKET 0.80`, `AUCTION 0.80` 확인.
  - `fintech_request.interest_rate`: 자금 요청 이자율. 현재 주요 값은 `12.00`.
- 따라서 “금융상품 DB가 없다”가 아니라 “상품 운영정책 master 테이블은 누락됐고, 계약별 적용 금융조건 테이블은 이관되어 있다”가 정확한 판단이다.
- 신규 `moneybank_partner`, `moneybank_product_preference` schema는 legacy 상품관리 화면/API 재현용으로 유지한다.
- master 실데이터 적재는 추가 원천 덤프 또는 운영 DB 추출본에서 `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT`가 확보된 뒤 진행한다.
- 추정: 기존 백업/이관 범위는 실제 계약/정산/상환/요청 데이터 중심이고, 환경설정 상품 master 테이블은 초기 추출에서 누락된 것으로 보인다.

### 다음 액션

1. 사용자 페이지 개발은 현재 이관된 `moneybank_contract`, `moneybank_contract_fee`, `moneybank_contract_fee_rates`, `fintech_request`, `moneybank_redemption_*` 실데이터 기준으로 계속 진행한다.
2. 머니뱅크 상품관리 화면은 실데이터 확보 전까지 CRUD 기능 검증 완료 상태로 유지한다.
3. 추가 덤프 확보 시 `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` 전용 적재 스크립트를 작성하고, 적재 후 상품관리 목록/상세/E2E를 재검증한다.
