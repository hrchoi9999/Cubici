# Cubici 모니터링 서버 관리 화면 Migration

## 작업 결과

- legacy 좌측 메뉴의 `모니터링 > 서버 관리`를 React 관리자 화면으로 구현했다.
- legacy에는 전용 JSP/Controller가 확인되지 않아 신규 운영 점검 화면으로 대체 정의했다.
- API 서버, PostgreSQL 연결, 최근 배치 성공/실패 상태를 `/v1/api/monitoring/server-status`로 조회하도록 구현했다.

## 변경 파일

- `service-api/src/cubici_service/monitoring/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/monitoring.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/monitoring.js`
- `admin-web/src/pages/ServerMonitorPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/server-monitoring.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`
- `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`

## Legacy 기준

- legacy 좌측 메뉴:
  - `모니터링 > 서버 관리`
- legacy link:
  - `javascript:;`
- legacy JSP:
  - 확인되지 않음
- 신규 URL:
  - `/admin/cubici/adminMonitor/server_monitor`
- 신규 API:
  - `/v1/api/monitoring/server-status`

## 구현 범위

- API 서버 응답 상태
- PostgreSQL 연결 상태
- 최근 배치 성공 건수
- 최근 배치 실패 건수
- 조회 범위:
  - 최근 1시간
  - 최근 6시간
  - 최근 24시간
  - 최근 72시간
  - 최근 7일

## 검증 여부

- Python API 테스트: `44 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `server-monitoring.spec.js` 성공
- PostgreSQL live DB 직접 검증: 미완료

## 보류/주의사항

- legacy 전용 화면이 확인되지 않아 1:1 migration이 아니라 신규 운영 점검 화면이다.
- OS CPU/Memory/Disk 사용량은 이번 범위에서 제외했다.
- 서비스 프로세스 제어, 재시작, 로그 파일 다운로드는 구현하지 않았다.
- PostgreSQL이 실제로 꺼져 있으면 해당 API는 실패 응답이 될 수 있다. 운영 단계에서는 DB 실패도 화면에 표시하는 별도 health endpoint 분리가 필요할 수 있다.

## 다음 액션

- PostgreSQL 실행 후 실제 `cbci_scheduled_report`, `cbci_err_report` 기준 상태 조회 검증.
- 운영 배포 단계에서 CPU/Memory/Disk/프로세스 상태 수집 방식 결정.
- 남은 관리자 후보:
  - 환경설정 > RawData
