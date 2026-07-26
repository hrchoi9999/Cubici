# Cubici Contracts Read-only API

작성일: 2026-06-30

## 작업 결과

- 선정산 계약 read-only 목록 API를 추가했다.
- Endpoint는 `GET /v1/api/contracts`로 정했다.
- `moneybank_contract` 테이블 기준 pagination 조회를 구현했다.
- 계약별 `moneybank_contract_shop`, `moneybank_contract_fee` 연결 건수를 함께 조회한다.
- DB 조회는 `contracts.repository`로 분리했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/contracts/repository.py` | 선정산 계약 목록 PostgreSQL 조회 |
| `Cubici/service-api/src/cubici_service/contracts/__init__.py` | contracts domain package |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/contracts.py` | `/contracts` 실제 목록 endpoint 전환 |
| `Cubici/service-api/tests/test_domain_routes.py` | endpoint payload 테스트 |
| `Cubici/docs/2026-06-30_CUBICI_CONTRACTS_READONLY_API.md` | 개발/검증 기록 |

## Endpoint

- `GET /v1/api/contracts?limit=20&offset=0`

주요 응답 항목:

- 계약 식별: `mbid`, `user_no`, `fintech_id`, `product_code`
- 상태/일자: `status`, `request_date`, `approval_date`, `agree_date`, `contract_date`, `expire_date`, `cancel_request_date`
- 사업/한도 확인: `reg_no_first`, `reg_no_second`, `sales_amount`, `payer_number`, `payer_status`
- 계좌 확인: `demand_acc_*`, `main_acc_*`
- 연결 건수: `contract_shop_count`, `contract_fee_count`

## 판단

- 서비스 재현 개발과 관리자 화면 확인을 위해 계약 계좌/사업 식별 관련 필드를 API 모델에 포함한다.
- 실제 원문 데이터 값은 문서, 테스트 출력, 로그에 기록하지 않는다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 10 passed.
- 실제 PostgreSQL 조회 확인: total `7`, limit `5`, returned item count `5`.
- OpenAPI path 확인: `/v1/api/contracts`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. 계약 detail API를 기준으로 React Admin 계약 상세 화면 구조를 설계한다.
2. 필요 시 개별 redemption 행 detail API를 분리한다.
