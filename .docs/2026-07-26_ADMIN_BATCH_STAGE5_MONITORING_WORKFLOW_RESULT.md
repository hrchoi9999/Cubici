# 관리자단 5단계 서버관리/Error Log Workflow 일괄작업 결과

## 범위

- Error Log 처리상태/후속조치 workflow 표시
- 서버관리 metric source와 후속조치 표시
- 실제 PostgreSQL API 응답 기준 검증
- focused Playwright E2E 검증

제외:

- 외부 서버 metric 수집 연동
- Error Log 처리 완료 저장 테이블 신규 생성
- alert/SMS/Email 실발송 연동
- 배치 재실행 자동 호출

## 작업 결과

### Error Log

- Error Log 응답에 `pending_action_count`, `workflow_status_label`을 추가했다.
- 행별 `processing_status_label`, `follow_up_action_label`, `source_table`을 추가했다.
- 실패 로그는 `조치필요`, 후속조치는 `원인 확인 후 재수집/배치 재실행`으로 표시한다.
- 성공 로그는 `처리완료`, 후속조치는 `추가조치 없음`으로 표시한다.

### 서버관리

- 서버 상태 응답에 `metric_source_label`, `metric_source_status_label`, `follow_up_action_label`을 추가했다.
- metric별 `source_label`, `action_label`을 추가했다.
- 현재 서버관리는 FastAPI self-check, PostgreSQL 연결, `cbci_scheduled_report`, `cbci_err_report` 기반이다.
- 외부 서버 metric은 미연동 상태로 표시한다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/monitoring/repository.py` | Error Log workflow/서버 metric source 상태 필드 추가 |
| `service-api/tests/test_domain_routes.py` | monitoring 응답 모델 테스트 fixture 보강 |
| `admin-web/src/pages/ErrorLogPage.jsx` | 조치필요/Workflow/후속조치/원천테이블 표시 |
| `admin-web/src/pages/ServerMonitorPage.jsx` | metric source/외부 metric 미연동/후속조치 표시 |
| `admin-web/tests/e2e/error-log-monitoring.spec.js` | Error Log workflow focused E2E 보강 |
| `admin-web/tests/e2e/server-monitoring.spec.js` | 서버관리 metric source focused E2E 보강 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| backend domain route focused test | 통과: 69 passed |
| 실제 PostgreSQL API 조회 | 통과: `/v1/api/monitoring/error-logs`, `/v1/api/monitoring/server-status` 200 |
| admin focused Playwright E2E | 통과: monitoring 2 passed |
| admin-web production build | 통과: focused E2E runner 내 build 완료 |

실제 DB 기준:

- Error Log: total 0, success 0, fail 0, pending 0
- Server Status: overall `정상`
- 단, 최근 24시간 성공/실패 로그가 모두 0건이므로 follow-up은 `배치 스케줄 실행 여부 확인`으로 표시된다.

## 보수적 완료율 갱신

| 메뉴 | 이전 보수 완료율 | 현재 보수 완료율 | 비고 |
| --- | ---: | ---: | --- |
| Error Log | 62% | 68% | 조회/상세/workflow 상태 표시 보강, 처리 완료 저장/alert 연동 잔여 |
| 서버 관리 | 55% | 61% | metric source/후속조치 표시 보강, 외부 서버 metric 연동 잔여 |

관리자단 전체 운영 재현율은 보수적으로 72~76% 수준으로 본다.

## 다음 액션

1. 고객문의/공지/템플릿 후속 상태 workflow 점검
2. 게시판/FAQ 첨부·노출정책 잔여 범위 정리
3. 외부 SMS/Email/Alert 실발송은 2차 개발 범위로 유지
4. 잔여 작업 완료 후 관리자단 전체 E2E milestone 1회 실행
