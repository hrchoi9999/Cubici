# Cubici 환경설정 Prism System 화면 Migration

## 작업 결과

- legacy `adminPreference/prizmConfig` 화면을 React 관리자 화면으로 구현했다.
- 현재 PostgreSQL에 이관된 `prizm_items` 기준으로 Prism/CRA 평가 항목 목록, 상세, 수정, 변경이력 조회를 구현했다.
- legacy `CBCI_PRIZM_UPD_RECORD` 성격의 변경이력 저장을 위해 `prizm_item_update_record` 테이블을 추가했다.

## 변경 파일

- `db/postgres/migrations/015_prizm_config_update_record.sql`
- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/preferences.js`
- `admin-web/src/pages/PrizmConfigPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/prizm-config.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`
- `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`

## Legacy 기준

- legacy 화면:
  - `/admin/cubici/adminPreference/prizmConfig`
  - `/admin/cubici/adminPreference/prizmModify`
  - `/admin/cubici/adminPreference/craConfig`
- legacy Ajax/API:
  - `/admin/cubici/adminPreference/prizmEvalUpdate`
  - `/admin/cubici/adminPreference/prizmEvalUpdList`
- legacy 테이블:
  - `CBCI_PRIZM_SUBJECT`
  - `CBCI_PRIZM_ITEM`
  - `CBCI_PRIZM_ITEM_DETAIL`
  - `CBCI_PRIZM_UPD_RECORD`
  - `CBCI_PRIZM_UPD_DETAIL`
- PostgreSQL 현재 기준:
  - `prizm_items`
  - `prizm_item_update_record`

## 구현 범위

- 목록/검색:
  - 구분 전체/Prizm/CRA
  - 주제번호
  - 항목명
- 상세/수정:
  - 지표정의
  - 가중치
  - 1~5구간 기준값 하한/상한
  - 변경메모
- 변경이력:
  - 최근 변경이력 5건 조회
  - 수정 전/후 payload JSONB 저장

## 검증 여부

- Python API 테스트: `43 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `prizm-config.spec.js` 성공
- PostgreSQL live DB 직접 저장/조회 검증: 미완료

## 보류/주의사항

- PostgreSQL live DB가 실행되지 않아 실제 `prizm_items` 수정과 이력 저장은 미검증이다.
- 현재 PostgreSQL schema에는 legacy의 `CBCI_PRIZM_SUBJECT`, `CBCI_PRIZM_ITEM_DETAIL`, `CBCI_PRIZM_UPD_DETAIL`가 없다.
- 따라서 subject name은 현재 `주제 {subject_no}` 형태로 표시한다. 이는 추정/대체 표시다.
- legacy의 점수별 상세 기준(`ITEM_SCORE`, `OPERATOR1/2`)은 현재 `prizm_items`의 wide 기준값 컬럼으로 대체했다.
- Prism 산식 자체 재계산 또는 평가결과 재산출은 이번 범위에 포함하지 않았다.

## 다음 액션

- PostgreSQL 실행 후 `prizm_items`, `prizm_item_update_record` live CRUD 검증.
- legacy 원천 `CBCI_PRIZM_*` 테이블 확보 가능 여부 확인.
- subject/item/detail 정규화가 필요한지 운영 기준으로 결정.
- 다음 미구현 관리자 화면:
  - 모니터링 > 서버 관리
  - 환경설정 > RawData
