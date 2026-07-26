# Cubici 환경설정 RawData 화면 Migration

## 작업 결과

- legacy `adminPreference/prizmRawData` 화면을 React 관리자 화면으로 구현했다.
- legacy `CBCI_RAW_DATA` 계산식 관리 흐름을 PostgreSQL `prizm_raw_data_formula` 구조로 신규 정의했다.
- 테이블 목록, 컬럼 목록, 계산식 목록/등록/수정/삭제, 선택 컬럼 preview API를 구현했다.

## 변경 파일

- `db/postgres/migrations/016_prizm_raw_data_formula.sql`
- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/preferences.js`
- `admin-web/src/pages/RawDataConfigPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/raw-data-config.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`
- `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`

## Legacy 기준

- legacy 화면:
  - `/admin/cubici/adminPreference/prizmRawData`
- legacy Ajax/API:
  - `/admin/cubici/adminPreference/rawDataList`
  - `/admin/cubici/adminPreference/rawDataCalculInsert`
  - `/admin/cubici/adminPreference/rawDataCalculUpdate`
  - `/admin/cubici/adminPreference/rawDataCalculDelete`
  - `/admin/cubici/adminPreference/rawDataExcel`
- legacy 테이블:
  - `CBCI_RAW_DATA`
  - `information_schema.columns`
- PostgreSQL 전환 테이블/API:
  - `prizm_raw_data_formula`
  - `information_schema.tables`
  - `information_schema.columns`

## 구현 범위

- RawData 대상 테이블 목록 조회
- 선택 테이블 컬럼 목록 조회
- 선택 컬럼 preview
- 계산식 등록
- 계산식 수정
- 계산식 삭제

## 검증 여부

- Python API 테스트: `45 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `raw-data-config.spec.js` 성공
- PostgreSQL live DB 직접 저장/조회 검증: 미완료

## 보류/주의사항

- legacy Excel 다운로드는 이번 범위에서 직접 구현하지 않았다.
- 신규 API는 임의 SQL 실행을 허용하지 않고, `information_schema`에서 확인된 테이블/컬럼만 preview하도록 제한했다.
- 실제 데이터 preview는 민감 데이터가 포함될 수 있으므로 운영 전 권한/감사로그/다운로드 정책 확인이 필요하다.
- legacy `CBCI_RAW_DATA` 원천 DDL은 현재 PostgreSQL schema에 없어 신규 `prizm_raw_data_formula`로 정의했다.
- 현재 테이블 라벨/컬럼 라벨은 PostgreSQL comment 부재 가능성을 고려해 물리명으로 표시한다.

## 다음 액션

- PostgreSQL 실행 후 `prizm_raw_data_formula` live CRUD 검증.
- RawData Excel 다운로드 필요 여부와 권한 정책 확정.
- 관리자 남은 큰 범위:
  - 통합정보 placeholder 실구현
  - PostgreSQL live CRUD/legacy 산식 검증
