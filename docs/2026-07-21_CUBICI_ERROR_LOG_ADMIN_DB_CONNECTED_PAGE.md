# Cubici Error Log 관리자 화면 DB 연결 구현

## 작업 결과

- legacy `adminMonitor/error_report` 화면을 React 관리자 화면으로 1차 migration했다.
- legacy mapper 기준 원본 테이블은 `CBCI_ERR_REPORT`, `CBCI_SCHEDULED_REPORT`였으나 현재 PostgreSQL migration DB에는 누락되어 있어 보완 migration을 추가했다.
- 신규 API는 `/v1/api/monitoring/error-logs`이며 성공/실패 로그를 통합 목록으로 조회한다.

## 변경 파일

- `db/postgres/migrations/010_monitoring_error_reports.sql`
- `service-api/src/cubici_service/monitoring/__init__.py`
- `service-api/src/cubici_service/monitoring/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/monitoring.py`
- `service-api/src/cubici_service/api/v1/router.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/monitoring.js`
- `admin-web/src/pages/ErrorLogPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/error-log-monitoring.spec.js`

## 검증 여부

- 고객관리 3개 화면 회귀 E2E: 통과.
- `010_monitoring_error_reports.sql` PostgreSQL 적용: 통과.
- API pytest: `30 passed, 1 skipped`.
- React build: 통과.
- Error Log E2E: 통과.
- 실 DB 조회: `cbci_err_report`, `cbci_scheduled_report` 테이블 생성 확인, 현재 row count는 각각 0건.

## 보수적 완성도

- `모니터링 > Error Log`: 55~60%.
- 테이블/API/화면/E2E 골격은 구현했으나, 실제 legacy 운영 로그 데이터가 dump에 포함되지 않아 실데이터 재현 검증은 아직 불가하다.

## 다음 액션

- 실제 운영 로그 데이터가 제공되면 row count와 legacy 화면 표시값을 대조한다.
- 다음 미구현 메뉴는 `환경설정` 계열 또는 `회원관리` 계열 중 우선순위를 정해 진행한다.
