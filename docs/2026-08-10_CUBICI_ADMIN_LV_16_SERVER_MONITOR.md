# Cubici 관리자 ADM-LV-16 서버 관리 복원

## 작업 범위

- 화면: `모니터링 > 서버 관리`
- route: `/admin/cubici/adminMonitor/server_monitor`
- 직접 LV 기준: 없음
- legacy JSP: 없음. `adminMonitor`에는 `error_report.jsp`만 남아 있다.
- 대체 기준: 승인된 관리자 공통 shell, ADM-LV-15 모니터링 색상·표 구조, 기존 서버 상태 API

## LV 대조와 적용

- 조회범위와 새로고침 기능을 유지했다.
- 개발용 source/status pill 7개를 제거하고 종합 상태, 정상 처리, 실패 발생, 최종 확인 4개 운영 요약으로 정리했다.
- API 서버, PostgreSQL, 배치 성공, 배치 실패 상태 카드를 동일 높이와 밝은 파란색 상단선으로 통일했다.
- 각 카드에는 점검 기준, 조치 안내, 확인 시각만 노출했다.
- 점검 기준 표를 LV 계열 제목 bar와 3열 표로 정리했다.
- 모바일은 요약 2열, 상태 카드 1열, 표 내부 가로 스크롤로 구성하고 메뉴 기본 닫힘 상태를 검증했다.

## DB/API 대조

- 목록: `GET /v1/api/monitoring/server-status`
- 조회범위: 최근 1시간, 6시간, 24시간, 72시간, 7일
- Docker 개발 DB `cubici-postgres-dev`: healthy
- `cbci_scheduled_report`: 0건
- `cbci_err_report`: 0건
- 현재 API는 FastAPI 자체 응답, PostgreSQL 연결, 두 배치 로그 테이블을 기준으로 한다.
- CPU, 메모리, 디스크, 프로세스 같은 외부 OS metric은 API에 없어 추가개발 잔여다.

## 변경 파일

- `admin-web/src/pages/ServerMonitorPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/server-monitoring.spec.js`
- `admin-web/tests/e2e/adm-lv-16-server-monitor.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| monitoring server-status API contract pytest | 1 passed |
| 상태 카드·조회범위·새로고침 focused E2E | 3 passed |
| 최종 PC/모바일 후보 재검증 | 1 passed |
| Docker 개발 DB 읽기 전용 대조 | healthy, 성공 0 / 실패 0 |
| 모바일 body 가로 overflow | 없음 |
| 실제 populated 배치 상태 | 데이터 부재로 미검증 |
| 외부 OS metric | 미연동 |
| 운영 배포 | 미수행 |

## 승인 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-16-SERVER-MONITOR/approved/ADM-LV-16-SERVER-MONITOR-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-16-SERVER-MONITOR/approved/ADM-LV-16-SERVER-MONITOR-MOBILE.png`

## 후보 SHA256

- PC: `15262B1895F88100D2B805DB4A75BB1B82698B59FA5DBA9B9D476AB7C879EB1F`
- 모바일: `C0B20838A7765F962E67EA1603E053ED293F3ECC16D8E8AEBD41683E3FEDF6B4`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 65%
- 직접 LV 화면이 없어 공통 LV 규칙으로 복원했으며 외부 OS metric과 실제 배치 데이터 검증이 남았다.
- 다음 승인 단위: `ADM-LV-17 모니터링 > 펌뱅킹 전문`
