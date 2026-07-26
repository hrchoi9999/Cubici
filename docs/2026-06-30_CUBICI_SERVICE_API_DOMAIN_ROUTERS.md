# Cubici Service API Domain Routers

작성일: 2026-06-30

## 작업 결과

- 핵심 도메인별 read-only API 라우터 골격을 추가했다.
- API 기본 경로는 `/v1/api`를 유지했다.
- 실제 데이터 조회 SQL은 다음 단계로 분리했다.
- 원본 개인정보, 계좌정보, 결제 식별정보는 출력하거나 문서화하지 않았다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/api/v1/schemas.py` | 공통 `DomainStatus` 응답 schema |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/accounts.py` | 회원/쇼핑몰 계정 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/sales.py` | 판매/반품 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/settlements.py` | 정산 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/contracts.py` | 선정산 계약 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/redemptions.py` | 상환/지급 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/risk_results.py` | 평가결과 연동 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/router.py` | 도메인 라우터 등록 |
| `Cubici/service-api/tests/test_domain_routes.py` | 도메인 route 등록 및 payload 테스트 |
| `Cubici/service-api/README.md` | read-only domain endpoint 목록 |

## Endpoint 골격

| Endpoint | 도메인 | 주요 source table |
|---|---|---|
| `GET /v1/api/accounts` | 회원/쇼핑몰 계정 | `users`, `shop_accounts` |
| `GET /v1/api/accounts/users` | 회원/쇼핑몰 계정 목록 | `users`, `shop_accounts` |
| `GET /v1/api/sales` | 판매 | `sale` |
| `GET /v1/api/sales/orders` | 판매 주문 목록 | `sale` |
| `GET /v1/api/sales/returns` | 반품/클레임 목록 | `sale_return` |
| `GET /v1/api/settlements` | 정산 목록 | `settlement` |
| `GET /v1/api/contracts` | 선정산 계약 목록 | `moneybank_contract`, `moneybank_contract_shop`, `moneybank_contract_fee` |
| `GET /v1/api/contracts/{mbid}` | 선정산 계약 상세 | `moneybank_contract`, `moneybank_contract_*`, `moneybank_redemption_*`, `prizm_*` |
| `GET /v1/api/redemptions` | 상환/지급 집계 목록 | `moneybank_redemption_*` |
| `GET /v1/api/risk-results` | 평가결과 목록 | `prizm_pcs_result`, `prizm_pms_result` |

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 5 passed.
- OpenAPI path 등록 확인:
  - `/v1/api/accounts`
  - `/v1/api/sales`
  - `/v1/api/sales/returns`
  - `/v1/api/settlements`
  - `/v1/api/contracts`
  - `/v1/api/redemptions`
  - `/v1/api/risk-results`
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. 회원/쇼핑몰 계정 read-only 목록 API를 PostgreSQL 실제 조회로 구현한다.
2. 목록 API 공통 pagination/query parameter 규칙을 확정한다.
