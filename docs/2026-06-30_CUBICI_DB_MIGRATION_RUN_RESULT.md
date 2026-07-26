# Cubici DB Migration Run Result

작성일: 2026-06-30

## 작업 결과

- `backup_20240508.sql`에서 schema inventory를 추출했다.
- 원본 `INSERT` 값은 산출물에 기록하지 않았다.
- MySQL 전체 테이블과 애플리케이션 테이블 후보를 분리했다.
- PostgreSQL DDL 초안을 생성했다.
- PostgreSQL 로컬 DB `cubici_local`을 생성했다.
- 애플리케이션 테이블 45개 schema apply를 완료했다.
- MySQL dump data를 PostgreSQL 적재용 CSV로 변환했다.
- 애플리케이션 테이블 45개에 원본 데이터를 적재했다.
- row count, 금액/수치 합계, 상태/코드 분포 검증을 완료했다.
- 핵심 업무 테이블 기준 인덱스와 FK 보강을 완료했다.

## 생성 산출물

| 파일 | 설명 |
|---|---|
| `Cubici/db/migration/extract_schema_inventory.py` | MySQL dump schema inventory 추출 스크립트 |
| `Cubici/db/mysql_legacy/schema_inventory.json` | 테이블/컬럼/PK/index/row count JSON |
| `Cubici/db/mysql_legacy/schema_only.sql` | INSERT 제외 MySQL schema-only extract |
| `Cubici/docs/2026-06-30_CUBICI_DB_SCHEMA_INVENTORY.md` | 전체 테이블 inventory |
| `Cubici/docs/2026-06-30_CUBICI_APPLICATION_TABLE_CLASSIFICATION.md` | 애플리케이션/시스템 테이블 분류 |
| `Cubici/db/postgres/schema/001_legacy_schema_all_tables_draft.sql` | 전체 테이블 PostgreSQL DDL 초안 |
| `Cubici/db/postgres/schema/002_application_schema_draft.sql` | 애플리케이션 테이블 PostgreSQL DDL 초안 |
| `Cubici/db/migration/mysql_dump_to_pg_copy.py` | MySQL INSERT dump를 PostgreSQL COPY CSV로 변환 |
| `Cubici/db/migration/verify_pg_counts.py` | PostgreSQL row count 검증 |
| `Cubici/db/migration/verify_amount_sums.py` | 금액/수치 합계 검증 |
| `Cubici/db/migration/verify_status_counts.py` | 상태/코드 분포 검증 |
| `Cubici/docs/2026-06-30_CUBICI_PG_ROW_COUNT_VERIFICATION.md` | row count 검증 결과 |
| `Cubici/docs/2026-06-30_CUBICI_PG_AMOUNT_SUM_VERIFICATION.md` | 금액/수치 합계 검증 결과 |
| `Cubici/docs/2026-06-30_CUBICI_PG_STATUS_COUNT_VERIFICATION.md` | 상태/코드 분포 검증 결과 |
| `Cubici/db/postgres/migrations/003_core_indexes_and_constraints.sql` | 핵심 업무 인덱스/FK 보강 migration |
| `Cubici/docs/2026-06-30_CUBICI_FK_INDEX_REVIEW.md` | FK/index 검토 및 적용 결과 |

## 추출 요약

- 전체 테이블 수: 72
- 전체 dump row count: 2,053,953
- 애플리케이션 테이블 후보: 45
- MySQL 시스템 테이블 제외 후보: 27
- 애플리케이션 dump row count: 2,052,607
- PostgreSQL 적재 row count: 2,052,607

## 검증 결과

- PostgreSQL DDL 초안과 inventory 문서에 `INSERT INTO` 또는 `VALUES (` 패턴이 없는 것을 확인했다.
- `002_application_schema_draft.sql`에서 `AUTO_INCREMENT`, `ENGINE=`, `CHARSET`, `COLLATE`, `unsigned`, `enum(`, `tinyint(`, `int(` 잔여 패턴이 없는 것을 확인했다.
- Python 3.14.5 `.venv`로 스크립트 실행 성공.
- service-api 기본 테스트 1개 통과.
- PostgreSQL row count 검증: 45개 테이블 일치.
- 금액/수치 합계 검증: 74개 컬럼 일치.
- 상태/코드 분포 검증: 106개 컬럼 일치.
- 핵심 인덱스 생성 검증: `idx_cubici_%` 42개.
- FK 생성 검증: `fk_cubici_%` 17개, 모두 validated.

## 판단

- 1차 PostgreSQL 전환 대상은 `002_application_schema_draft.sql`의 45개 애플리케이션 테이블로 진행한다.
- MySQL 권한/시스템 테이블 27개는 서비스 재현 대상에서 제외한다.
- DB 적재 전 DDL 수작업 검토 1차 범위는 완료했다.
- `prizm_pcs_result.mbid -> moneybank_contract.mbid`는 기존 데이터 orphan count 1건으로 FK 적용을 보류했다.

## 남은 작업

1. `prizm_pcs_result.mbid` orphan 1건 업무 의미 확인
2. 사용자/관리자 화면 inventory와 API 우선순위 연결
3. 핵심 목록 조회 API query plan 점검

## PostgreSQL 접속 기준

- Host: `127.0.0.1`
- Port: `5432`
- Database: `cubici_local`
- User: `cubici_app`
- Schema: `public`
- Password: `.env`에만 로컬 저장
- 상세 문서: `Cubici/docs/2026-06-30_CUBICI_POSTGRES_LOCAL_CONNECTION.md`

## Schema Apply 결과

- 대상 DB: `cubici_local`
- 적용 DDL: `Cubici/db/postgres/schema/002_application_schema_draft.sql`
- 생성 테이블 수: 45
- 적용 상태: 성공

## Data Load 결과

- 변환 대상 테이블 수: 45
- 변환 row count: 2,052,607
- 변환 오류: 0
- PostgreSQL 적재 상태: 성공
- 적재 row count: 2,052,607

## FK/Index 보강 결과

- 적용 migration: `Cubici/db/postgres/migrations/003_core_indexes_and_constraints.sql`
- 신규 핵심 인덱스: 42
- 신규 FK: 17
- FK validation 상태: 모두 validated
- FK 보류: `prizm_pcs_result.mbid -> moneybank_contract.mbid` 1건
