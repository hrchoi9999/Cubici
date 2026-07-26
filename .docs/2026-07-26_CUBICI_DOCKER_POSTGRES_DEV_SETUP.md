# Cubici Docker PostgreSQL 개발 DB 구성

## 작업 결과

- Docker CLI와 Docker Compose 설치를 확인했다.
- Docker daemon 실행 상태를 확인했다.
- Cubici 개발용 PostgreSQL 컨테이너 `cubici-postgres-dev`를 실행했다.
- 기존 로컬 PostgreSQL `5432` timeout 회피를 위해 host 포트는 `55432`로 지정했다.
- DB volume은 `D:\Alt_CSM\Cubici\data_local\postgres` 아래에 둔다.
- DB 접속 비밀번호는 compose 파일에 저장하지 않고 `service-api/.env` 값을 실행 시점에 참조한다.

## 변경 파일

- `docker-compose.dev.yml`
- `.docs/2026-07-26_CUBICI_DOCKER_POSTGRES_DEV_SETUP.md`

## 검증 여부

- `docker info`: Docker daemon 정상 응답.
- `docker compose up -d cubici-postgres`: 컨테이너 시작 성공.
- Docker healthcheck: `healthy`.
- Python service-api 설정에 `CUBICI_DB_PORT=55432`를 적용해 DB 연결 성공.
- 컨테이너 내부 `public` schema table count: `0`.

## 판단

- Docker PostgreSQL은 기존 Windows PostgreSQL timeout 문제를 회피할 수 있는 안정적인 개발 DB 후보로 본다.
- 현재 컨테이너 DB는 빈 DB이므로 사용자단/관리자단 E2E를 돌리려면 schema와 migration data를 먼저 적재해야 한다.

## 다음 액션

- Docker DB에 Cubici PostgreSQL schema/migration을 적용한다.
- 기존 로컬 PostgreSQL 또는 dump 기준 데이터를 Docker DB로 적재한다.
- `service-api/.env` 또는 E2E 실행 환경을 `CUBICI_DB_PORT=55432` 기준으로 정리한다.

## 2026-07-26 적재 작업 결과

### 작업 결과

- `002_application_schema_draft.sql`를 Docker PostgreSQL DB에 적용했다.
- `003`~`018` migration SQL을 순서대로 적용했다.
- `backup_20240508.sql` MariaDB dump를 PostgreSQL COPY용 CSV로 변환했다.
- 변환 산출물은 `data_local/pg_copy` 아래에 생성했다.
- COPY 적재 중 FK 순서 문제를 피하기 위해 적재 트랜잭션 안에서 `session_replication_role = replica`를 사용했다.
- 적재 후 serial sequence를 현재 최대 ID 기준으로 보정했다.
- `service-api/.env`의 DB 포트를 Docker DB 기준 `55432`로 전환했다.

### 변경/생성 파일

- `service-api/.env` DB port local 변경. git 제외 파일이다.
- `data_local/pg_copy/csv/*`. git 제외 경로다.
- `data_local/pg_copy/summary.json`. git 제외 경로다.
- `data_local/pg_copy/copy_host_paths.sql`. git 제외 경로다.
- `data_local/pg_copy/copy_container_paths.sql`. git 제외 경로다.
- `data_local/pg_copy/copy_container_paths_replica.sql`. git 제외 경로다.
- `data_local/pg_copy/verify_counts_docker.json`. git 제외 경로다.
- `data_local/pg_copy/verify_counts_docker.md`. git 제외 경로다.
- `.docs/2026-07-26_CUBICI_DOCKER_POSTGRES_DEV_SETUP.md`

### 검증 여부

- dump 변환: `tables=45 rows=2052607 errors=0`.
- Docker DB row count 검증: `45`개 테이블, expected `2,052,607`, actual `2,052,607`, mismatch `0`.
- service-api DB 연결 확인: `status=ok`, `application_table_count=59`.
- `service-api/tests/test_domain_routes.py`: `66 passed`.
- `service-api/tests/test_contract_lifecycle_db_e2e.py`: `2 passed`.
- `user-web/tests/e2e/moneybank-terms-db-e2e.spec.js`: `1 passed`.

### 판단

- 기존 Windows PostgreSQL `5432` timeout 문제는 Docker PostgreSQL `55432` 기준으로 해소됐다.
- Docker DB는 schema/migration/data 적재와 focused E2E까지 통과했으므로 다음 개발/검증 DB로 사용할 수 있다.
- 전체 사용자단/관리자단 E2E는 milestone 검증 시점에 분리 실행한다.

### 다음 액션

- 다음 기능 개발부터는 Docker DB가 실행 중인지 preflight 후 focused test만 실행한다.
- milestone 시점에 사용자단 전체 E2E와 관리자단 전체 E2E를 분리해 1회씩 실행한다.
