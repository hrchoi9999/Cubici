# Cubici Local Runtime Verification

작성일: 2026-07-20

## 작업 결과

- 사용자 승인 범위 내에서 `C:\PostgreSQL` 설치본을 확인했다.
- PostgreSQL 17을 `C:\PostgreSQL\17\data` 기준으로 실행했다.
- `service-api` DB health, 계약 목록 API, Vite proxy 연결을 실데이터 기준으로 검증했다.
- 개인정보 값은 검증 출력과 문서에 기록하지 않고, 총건수와 필드 존재 여부만 확인했다.

## 확인 경로

- PostgreSQL 실행 파일: `C:\PostgreSQL\17\pgsql\bin\pg_ctl.exe`
- PostgreSQL data directory: `C:\PostgreSQL\17\data`
- PostgreSQL log: `D:\Alt_CSM\Cubici\reports\postgres-local.log`
- API runtime: `D:\Alt_CSM\.venv\Scripts\python.exe`
- Admin web runtime: `D:\Alt_CSM\.tools\node-v22.13.1-win-x64`

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| PostgreSQL ready | `127.0.0.1:5432 - accepting connections` |
| DB health | `ok cubici_local public 45` |
| Backend tests | `13 passed` |
| `GET /v1/api/health/db` | HTTP 200 |
| `GET /v1/api/contracts?limit=3&offset=0` | HTTP 200, total 7, items 3 |
| `status=CONTRACT` filter | HTTP 200, total 4, returned statuses `CONTRACT` |
| Admin web root via Vite | HTTP 200 |
| Vite proxy `/v1/api/contracts` | HTTP 200, total 7, items 2 |
| User join fields | `user_email`, `user_name`, `firm_name` 필드 존재 확인 |
| Contract list legacy fields | `request_shop`, `sub_complete`, `prizm_score` 필드 존재 확인 |
| Contract detail API | HTTP 200, `contract`, `shops`, `risk_result` 구조 확인 |
| sub_complete mapping | 실데이터 total 7 기준 `Y=6`, `N=1` |

## 특이 사항

- PostgreSQL은 이전에 정상 종료되지 않아 startup 중 recovery/fsync를 수행했다.
- recovery 완료 후 `database system is ready to accept connections` 상태가 됐다.
- Codex 백그라운드 프로세스는 dev server를 지속 실행하지 못하므로, 검증 시에는 Python subprocess 안에서 API/Vite를 띄우고 확인 후 종료했다.
- 사용자가 브라우저에서 직접 확인하려면 API와 admin-web dev server를 사용자 터미널에서 실행하는 방식이 안정적이다.

## 다음 액션

1. `MONEYBANK_SUB_CHECK` 대응 migration 여부 확인
2. 신청 접수 상세 패널을 legacy `submissionState.jsp` 흐름에 맞게 확장
3. 브라우저 screenshot으로 legacy 화면과 React 화면의 시각 차이 확인
