# Cubici Sale Returns Read-only API

작성일: 2026-06-30

## 작업 결과

- 반품/클레임 read-only 목록 API를 추가했다.
- Endpoint는 `GET /v1/api/sales/returns`로 정했다.
- `sale_return` 테이블 기준 pagination 조회를 구현했다.
- DB 조회는 `sales.repository`에 추가했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/sales/repository.py` | 반품/클레임 목록 PostgreSQL 조회 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/sales.py` | `/sales/returns` 실제 목록 endpoint 전환 |
| `Cubici/service-api/tests/test_domain_routes.py` | endpoint payload 테스트 |
| `Cubici/docs/2026-06-30_CUBICI_SALE_RETURNS_READONLY_API.md` | 개발/검증 기록 |

## Endpoint

- `GET /v1/api/sales/returns?limit=20&offset=0`

주요 응답 항목:

- 반품 식별: `returns_id`, `shop_type`, `shop_id`, `order_no`, `product_no`, `option_no`
- 상태/클레임: `status`, `claim_status`, `release_stop_status`, `release_status`, `reason_code`
- 결제/취소: `payment_amount`, `receipt_no`, `payment_no`, `receipt_type`, `cancel_count`, `order_count`
- 처리 일자: `request_date`, `claim_complete_date`, `reg_date`, `modified_date`

## 판단

- 서비스 재현 개발을 위해 기존 반품/클레임 운영 화면 확인에 필요한 필드를 포함한다.
- 실제 원문 데이터 값은 문서, 테스트 출력, 로그에 기록하지 않는다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 8 passed.
- 실제 PostgreSQL 조회 확인: total `775`, limit `5`, returned item count `5`.
- OpenAPI path 확인: `/v1/api/sales/returns`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. `settlement` 정산 목록 API를 구현한다.
2. sales/returns detail API 필요 여부를 화면 inventory 기준으로 판단한다.
