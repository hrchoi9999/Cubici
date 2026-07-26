# Cubici Contract Detail API

작성일: 2026-06-30

## 작업 결과

- 선정산 계약 detail API를 추가했다.
- Endpoint는 `GET /v1/api/contracts/{mbid}`로 정했다.
- 계약을 중심으로 shop, fee/rate, document, certificate, redemption summary, risk result를 연결한다.
- 실제 원문 데이터 값은 문서, 테스트 출력, 로그에 기록하지 않았다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/contracts/repository.py` | 계약 detail PostgreSQL 조회 및 nested response model |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/contracts.py` | `/contracts/{mbid}` endpoint |
| `Cubici/service-api/tests/test_domain_routes.py` | detail route 및 payload 테스트 |
| `Cubici/docs/2026-06-30_CUBICI_CONTRACT_DETAIL_API.md` | 개발/검증 기록 |

## Endpoint

- `GET /v1/api/contracts/{mbid}`

연결 구조:

- `contract`: `moneybank_contract`
- `shops`: `moneybank_contract_shop`
- `fees[].rates`: `moneybank_contract_fee`, `moneybank_contract_fee_rates`
- `certificate`: `moneybank_contract_certificate`
- `document`: `moneybank_contract_document`
- `redemption`: `moneybank_redemption_*` 집계
- `risk_result`: `prizm_pcs_result`, `prizm_pms_result` 최신 결과

## 판단

- 서비스 재현 개발을 위해 계약 관련 원본 확인 필드를 API 모델에 포함한다.
- 실제 민감 원문 값은 DB와 API runtime에서만 확인하고, Git 문서/테스트 출력/로그에는 남기지 않는다.
- 존재하지 않는 `mbid`는 `404 contract not found`로 처리한다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 13 passed.
- 실제 PostgreSQL 조회 확인: detail found, shop count `1`, fee count `1`, document 연결 `true`, redemption 연결 `true`, risk result 연결 `true`.
- OpenAPI path 확인: `/v1/api/contracts/{mbid}`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. 계약 detail API를 기준으로 React Admin 계약 상세 화면 구조를 설계한다.
2. 필요 시 개별 redemption 행 detail API를 분리한다.
