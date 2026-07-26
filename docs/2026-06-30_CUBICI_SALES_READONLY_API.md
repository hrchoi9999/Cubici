# Cubici Sales Read-only API

작성일: 2026-06-30

## 작업 결과

- 판매 주문 read-only 목록 API를 추가했다.
- Endpoint는 `GET /v1/api/sales/orders`로 정했다.
- `sale` 테이블 기준 pagination 조회를 구현했다.
- 주문/상품/상태/금액/정산 예정/정산 완료 필드를 포함했다.
- DB 조회는 `sales.repository`로 분리했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/sales/repository.py` | 판매 목록 PostgreSQL 조회 |
| `Cubici/service-api/src/cubici_service/sales/__init__.py` | sales domain package |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/sales.py` | `/sales/orders` endpoint |
| `Cubici/service-api/tests/test_domain_routes.py` | route 및 endpoint payload 테스트 |
| `Cubici/service-api/README.md` | sales orders endpoint 기록 |

## Endpoint

- `GET /v1/api/sales/orders?limit=20&offset=0`

주요 응답 항목:

- 주문 식별: `sales_id`, `shop_type`, `shop_id`, `order_no`, `product_no`, `option_no`
- 상태/일자: `status`, `ordered_date`, `paid_date`, `confirm_date`, `settle_estimate_date`, `settle_complete_date`
- 상품/수량: `product_name`, `option_name`, `quantity`
- 금액: `sales_amount`, `discount_amount`, `payment_amount`, `settle_estimate_amount`, `settlement_amount`
- 재현 확인용 주문자 필드: `orderer_id`, `orderer_name`

## 판단

- 서비스 재현 개발을 위해 판매 목록에는 기존 운영 화면 확인에 필요한 필드를 포함한다.
- 실제 원문 데이터 값은 문서, 테스트 출력, 로그에 기록하지 않는다.
- 관리자/사용자 화면별 필드 노출 정책은 React 화면 구현 단계에서 분리한다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 7 passed.
- 실제 PostgreSQL 조회 확인: total `2,390`, limit `5`, returned item count `5`.
- OpenAPI path 확인: `/v1/api/sales/orders`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. `sale_return` 기반 반품/클레임 목록 API를 구현한다.
2. `settlement` 정산 목록 API를 구현한다.
