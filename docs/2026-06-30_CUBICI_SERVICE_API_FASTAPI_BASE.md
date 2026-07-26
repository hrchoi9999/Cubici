# Cubici Service API FastAPI Base

작성일: 2026-06-30

## 작업 결과

- `service-api`를 FastAPI 앱 구조로 확정했다.
- 앱 팩토리 `create_app()`과 ASGI app `app`을 추가했다.
- API v1 라우터 기본 경로를 `/v1/api`로 정했다.
- 기본 health endpoint를 `GET /v1/api/health`로 추가했다.
- 현재 Starlette TestClient는 `httpx2` 설치가 필요하므로 의존성에 명시했다.
- DB 연결은 다음 작업으로 분리했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/pyproject.toml` | FastAPI/Pydantic/httpx2/Uvicorn 의존성 및 실행 스크립트 명시 |
| `Cubici/service-api/src/cubici_service/app.py` | FastAPI 앱 팩토리와 ASGI app |
| `Cubici/service-api/src/cubici_service/main.py` | 로컬 개발 서버 진입점 |
| `Cubici/service-api/src/cubici_service/core/config.py` | 기본 설정 객체 |
| `Cubici/service-api/src/cubici_service/api/router.py` | 최상위 API 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/router.py` | API v1 라우터 |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/health.py` | health endpoint |
| `Cubici/service-api/tests/test_health.py` | FastAPI TestClient 기반 테스트 |
| `Cubici/service-api/README.md` | 실행 방법과 기본 endpoint 기록 |

## 기본 구조

```text
service-api/
  src/cubici_service/
    app.py
    main.py
    core/
      config.py
    api/
      router.py
      v1/
        router.py
        endpoints/
          health.py
```

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 2 passed.
- OpenAPI path 확인: `/v1/api/health`.
- 추가 OpenAPI path 확인: `/v1/api/health/db`.
- 테스트는 health payload와 route 등록을 검증한다.

## 다음 액션

1. PostgreSQL 연결 설정을 추가한다.
2. `GET /v1/api/health/db` 또는 별도 DB check endpoint를 추가한다.
3. 핵심 도메인별 read-only 라우터 골격을 만든다.
