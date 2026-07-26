# Cubici Redemptions Read-only API

작성일: 2026-06-30

## 작업 결과

- 상환/지급 read-only 목록 API를 추가했다.
- Endpoint는 `GET /v1/api/redemptions`로 정했다.
- `moneybank_redemption_*` 테이블을 `mbid` 기준으로 집계한다.
- DB 조회는 `redemptions.repository`로 분리했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/redemptions/repository.py` | 상환/지급 집계 PostgreSQL 조회 |
| `Cubici/service-api/src/cubici_service/redemptions/__init__.py` | redemptions domain package |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/redemptions.py` | `/redemptions` 실제 목록 endpoint 전환 |
| `Cubici/service-api/tests/test_domain_routes.py` | endpoint payload 테스트 |
| `Cubici/docs/2026-06-30_CUBICI_REDEMPTIONS_READONLY_API.md` | 개발/검증 기록 |

## Endpoint

- `GET /v1/api/redemptions?limit=20&offset=0`

주요 응답 항목:

- 계약 식별: `mbid`
- 지급 집계: `provision_count`, `total_payment_amount`, `total_usage_fee`, `total_provision_amount`, `latest_provision_date`
- 상환 집계: `repayment_count`, `total_repayment_amount`, `total_repayment_usage_fee`, `total_remittance_fee`, `total_balance_provision_amount`
- 입금 집계: `deposit_count`, `total_deposit_amount`, `latest_deposit_date`
- 매출 반영 집계: `sales_count`, `sales_payment_amount`, `sales_usage_fee`, `sales_provision_amount`
- 잔액 이력: `latest_cumulative_provision_amount`, `latest_cumulative_repayment_amount`, `latest_outstanding_balance`

## 판단

- 목록 API는 계약별 현황을 빠르게 확인할 수 있도록 각 redemption 테이블을 집계한다.
- 개별 지급/상환/입금/매출 행 상세는 별도 detail API에서 분리 구현한다.
- 실제 원문 데이터 값은 문서, 테스트 출력, 로그에 기록하지 않는다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 11 passed.
- 실제 PostgreSQL 조회 확인: total `6`, limit `5`, returned item count `5`.
- OpenAPI path 확인: `/v1/api/redemptions`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. `prizm_pcs_result`, `prizm_pms_result` 기반 평가결과 목록 API를 구현한다.
2. 계약 detail API에서 redemption 세부 행 연결 구조를 확정한다.
