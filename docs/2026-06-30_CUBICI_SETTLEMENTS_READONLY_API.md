# Cubici Settlements Read-only API

작성일: 2026-06-30

## 작업 결과

- 정산 read-only 목록 API를 추가했다.
- Endpoint는 `GET /v1/api/settlements`로 정했다.
- `settlement` 테이블 기준 pagination 조회를 구현했다.
- DB 조회는 `settlements.repository`로 분리했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/settlements/repository.py` | 정산 목록 PostgreSQL 조회 |
| `Cubici/service-api/src/cubici_service/settlements/__init__.py` | settlements domain package |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/settlements.py` | `/settlements` 실제 목록 endpoint 전환 |
| `Cubici/service-api/tests/test_domain_routes.py` | endpoint payload 테스트 |
| `Cubici/docs/2026-06-30_CUBICI_SETTLEMENTS_READONLY_API.md` | 개발/검증 기록 |

## Endpoint

- `GET /v1/api/settlements?limit=20&offset=0`

주요 응답 항목:

- 정산 식별: `settlements_id`, `shop_type`, `shop_id`, `settlement_type`
- 상태/일자: `settlement_date`, `status`, `reg_date`, `modified_date`
- 금액: `total_sale`, `service_fee`, `settlement_target_amount`, `settlement_amount`, `pending_released_amount`
- 차감/수수료: `seller_discount_coupon`, `downloadable_coupon`, `seller_service_fee`, `store_fee_discount`, `debt_of_last_week`
- 계좌 확인: `bank_account_holder`, `bank_name`, `bank_account`

## 판단

- 서비스 재현 개발과 관리자 화면 확인을 위해 정산 계좌 관련 필드를 API 모델에 포함한다.
- 실제 원문 데이터 값은 문서, 테스트 출력, 로그에 기록하지 않는다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 9 passed.
- 실제 PostgreSQL 조회 확인: total `469`, limit `5`, returned item count `5`.
- OpenAPI path 확인: `/v1/api/settlements`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. `moneybank_contract` 기반 선정산 계약 목록 API를 구현한다.
2. 정산 summary API 필요 여부를 관리자 화면 inventory 기준으로 판단한다.
