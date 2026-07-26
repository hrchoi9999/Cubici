# Cubici Service API DB Connection

작성일: 2026-06-30

## 작업 결과

- `service-api`에 PostgreSQL 연결 설정을 추가했다.
- `.env` 기반 `CUBICI_DB_*` 설정 로더를 추가했다.
- `psycopg` 기반 DB 연결 helper를 추가했다.
- DB 상태 확인 endpoint `GET /v1/api/health/db`를 추가했다.
- 비밀번호와 원본 민감값은 코드/문서/테스트 출력에 기록하지 않았다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/pyproject.toml` | `psycopg` 의존성 명시 |
| `Cubici/service-api/src/cubici_service/core/config.py` | `.env` 로더와 DB 설정 추가 |
| `Cubici/service-api/src/cubici_service/db/connection.py` | PostgreSQL 연결 helper와 DB check 함수 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/health.py` | DB health endpoint 추가 |
| `Cubici/service-api/tests/test_health.py` | health/db 라우트 및 payload 테스트 |
| `Cubici/service-api/README.md` | DB 설정 및 endpoint 문서화 |

## Endpoint

- `GET /v1/api/health/db`

응답 항목:

- `status`
- `database`
- `schema_name`
- `application_table_count`

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 3 passed.
- 실제 PostgreSQL DB check 실행: 성공.
- 확인 결과: database `cubici_local`, schema `public`, application table count `45`.

## 다음 액션

1. 핵심 도메인별 read-only 라우터 골격을 만든다.
2. 회원/쇼핑몰 계정 목록 API부터 구현한다.
