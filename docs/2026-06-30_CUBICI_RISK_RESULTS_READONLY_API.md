# Cubici Risk Results Read-only API

작성일: 2026-06-30

## 작업 결과

- 평가결과 read-only 목록 API를 추가했다.
- Endpoint는 `GET /v1/api/risk-results`로 정했다.
- `prizm_pcs_result`, `prizm_pms_result` 최신 결과를 `mbid`, `user_no` 기준으로 결합한다.
- DB 조회는 `risk_results.repository`로 분리했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/risk_results/repository.py` | PCS/PMS 평가결과 PostgreSQL 조회 |
| `Cubici/service-api/src/cubici_service/risk_results/__init__.py` | risk_results domain package |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/risk_results.py` | `/risk-results` 실제 목록 endpoint 전환 |
| `Cubici/service-api/tests/test_domain_routes.py` | endpoint payload 테스트 |
| `Cubici/docs/2026-06-30_CUBICI_RISK_RESULTS_READONLY_API.md` | 개발/검증 기록 |

## Endpoint

- `GET /v1/api/risk-results?limit=20&offset=0`

주요 응답 항목:

- 연결 식별: `mbid`, `user_no`
- PCS 결과: `pcs_no`, `prizm_grade`, `prizm_score`, 주요 영업/정산/반품 feature
- PMS 결과: `pms_no`, `pms_grade`, `pms_score`, 판매/관리 점수 및 세부 score
- 결과 일자: `pcs_reg_date`, `pms_reg_date`

## 판단

- 이 API는 legacy 평가결과를 운영 화면에서 확인하기 위한 조회용이다.
- Alt_CSM 연동용 신규 score contract는 별도 API로 분리한다.
- 실제 원문 데이터 값은 문서, 테스트 출력, 로그에 기록하지 않는다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 12 passed.
- 실제 PostgreSQL 조회 확인: total `8`, limit `5`, returned item count `5`.
- OpenAPI path 확인: `/v1/api/risk-results`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. 계약 detail API에서 risk result 연결 방식을 확정한다.
2. Alt_CSM score 제공 서비스 연동 contract를 별도 문서로 정의한다.
