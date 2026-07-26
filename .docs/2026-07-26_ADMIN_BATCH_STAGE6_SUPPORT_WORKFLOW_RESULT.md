# 관리자단 6단계 고객관리/공지/템플릿 Workflow 일괄작업 결과

## 범위

- 고객문의 답변 후속상태/알림 미연동 상태 표시
- 공지/FAQ 첨부 미연동/노출정책 확인 상태 표시
- 문자/이메일 템플릿 실발송 미연동/변수정책 확인 상태 표시
- 실제 PostgreSQL API 응답 기준 검증
- focused Playwright E2E 검증

제외:

- 실제 SMS/Email 발송 연동
- 문의 답변 알림 자동 발송
- 공지/FAQ 첨부파일 저장/다운로드
- 팝업/상단고정/노출기간 등 legacy 상세 노출정책 확정

## 작업 결과

### 고객문의

- 문의 목록 응답에 `notification_pending_count`, `workflow_status_label`을 추가했다.
- 문의 행별 `follow_up_status_label`, `notification_status_label`, `workflow_status_label`을 추가했다.
- 화면에 Workflow, 알림 미연동, 알림대기 수, 후속상태를 표시했다.

### 공지/FAQ

- 게시판 목록 응답에 `attachment_status_label`, `exposure_policy_status_label`을 추가했다.
- 게시글 행별 `exposure_status_label`, `attachment_status_label`, `policy_status_label`을 추가했다.
- 화면에 첨부 미연동, 노출정책 확인, 상시노출 상태를 표시했다.

### 문자/이메일 템플릿

- 템플릿 목록 응답에 `external_send_status_label`, `variable_policy_status_label`을 추가했다.
- 템플릿 행별 `external_send_status_label`, `variable_policy_status_label`, `workflow_status_label`을 추가했다.
- 화면에 실발송 미연동, 변수정책 확인, 템플릿 CRUD workflow를 표시했다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/support/repository.py` | 고객문의/게시판/템플릿 workflow 상태 필드 추가 |
| `admin-web/src/pages/CustomerInquiryPage.jsx` | 문의 후속상태/알림 상태 표시 |
| `admin-web/src/pages/CustomerBoardPage.jsx` | 공지/FAQ 첨부/노출정책 상태 표시 |
| `admin-web/src/pages/MessageTemplatePage.jsx` | 템플릿 실발송/변수정책/workflow 상태 표시 |
| `admin-web/tests/e2e/customer-inquiry-management.spec.js` | 고객문의 상태 표시 E2E 보강 |
| `admin-web/tests/e2e/customer-board-management.spec.js` | 공지/FAQ 상태 표시 E2E 보강 |
| `admin-web/tests/e2e/message-template-management.spec.js` | 템플릿 상태 표시 E2E 보강 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| backend domain route focused test | 통과: 69 passed |
| 실제 PostgreSQL API 조회 | 통과: support 4개 endpoint 200 |
| admin focused Playwright E2E | 통과: support 3 passed |
| admin-web production build | 통과: focused E2E runner 내 build 완료 |

실제 DB 기준:

- 문의: 1건, 답변완료 1건, 답변대기 0건
- 공지: 5건
- FAQ: 31건
- 문자/이메일 템플릿: 8건

## 보수적 완료율 갱신

| 메뉴 | 이전 보수 완료율 | 현재 보수 완료율 | 비고 |
| --- | ---: | ---: | --- |
| 고객문의 | 68% | 73% | 답변 CRUD/후속상태 표시 보강, 알림/메일 실발송 잔여 |
| 고객 공지 관리 | 68% | 73% | 공지/FAQ CRUD/첨부·노출정책 상태 표시 보강, 첨부/팝업/상단고정 잔여 |
| 문자/이메일 | 60% | 67% | 템플릿 CRUD/실발송 미연동/변수정책 상태 표시 보강, 실제 발송 연동 잔여 |

관리자단 전체 운영 재현율은 보수적으로 73~77% 수준으로 본다.

## 다음 액션

1. 관리자 잔여 gap 재점검 및 우선순위 재정렬
2. route/fallback 미구현 메뉴 오판 가능성 점검
3. 정산/상환 취소·해지 재계산 정책 검수 항목 유지
4. 관리자단 잔여 보강 후 전체 E2E milestone 1회 실행
