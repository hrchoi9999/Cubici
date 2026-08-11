# Cubici 로컬 DB 비밀번호 설정 통일

## 작업 범위

- 로컬 전용 DB 비밀번호를 암호학적 난수로 생성했다.
- 기존 PostgreSQL 데이터는 유지하고 `cubici_app` 역할의 접속 비밀번호만 교체했다.
- 생성값은 Git 제외 대상인 저장소 루트 `.env`에만 저장했다.
- Docker Compose와 FastAPI가 같은 루트 `.env`를 사용하도록 설정 경로를 통일했다.
- 기존 `service-api/.env` 경로는 로컬 호환용 후순위 경로로 유지했다.
- 관리자 계정 비밀번호와 토큰은 저장, 출력, 변경하지 않았다.

## 변경 파일

- `service-api/src/cubici_service/core/config.py`
- `service-api/.env.example`
- 로컬 전용 `.env`는 Git ignore 상태이며 변경 파일 목록과 commit 대상에서 제외한다.

## 검증

| 항목 | 결과 |
|---|---|
| `.env` Git 제외 | 통과 |
| PostgreSQL 역할 비밀번호 교체 | 통과 |
| FastAPI 루트 `.env` 로딩 | 통과 |
| `psycopg` `SELECT 1` | 통과 |
| FastAPI `/v1/api/health/db` | HTTP 200 |
| Docker Compose 환경변수 해석 | 통과 |
| Docker DB health | `healthy` |
| 설정·관리자 권한 focused pytest | 7/7 통과 |

## 보안 경계

- DB 비밀번호 값은 코드, 문서, 명령 출력, Git에 기록하지 않는다.
- DB 비밀번호와 관리자 계정 비밀번호를 재사용하지 않는다.
- 관리자 API 회귀는 별도 인증 단계에서 런타임 로그인으로 임시 Bearer Token을 발급받아야 한다.

## 후속 완료

- 관리자 preflight에 인증 누락 fail-fast 검사를 적용했다.
- 자동 로컬 검증은 합성 관리자 계정으로 `/accounts/admin-login`을 통과하고 임시 Token을 사용한다.
- 합성 계정과 Token은 preflight 종료 시 폐기되며 실제 관리자 자격정보는 저장하지 않는다.
