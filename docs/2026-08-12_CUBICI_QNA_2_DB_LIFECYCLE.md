# Cubici QNA-2 사용자·관리자 Q&A 실DB lifecycle

## 범위

- 사용자 문의 등록·목록·상세·수정·삭제
- 관리자 답변 등록·수정
- 답변 등록 후 사용자 수정·삭제 차단
- 다른 사용자의 비공개 문의 조회·변경 차단
- 실제 개발 PostgreSQL 저장 확인과 disposable fixture 완전 정리
- 사용자 React와 관리자 React를 실제 API·DB에 연결한 focused E2E

30건 초과 서버 페이지네이션, 첨부파일, SMS·메일 알림, commit·push·운영 배포는 이번 Batch에서 제외했다.

## 확인 및 수정

관리자 고객문의 화면은 답변 payload에 `user_no: 99`, `operated_by: admin`을 고정 전송했다. 개발 DB에는 99번 사용자가 없으므로 DB 제약과 데이터 추적 관점에서 안전하지 않았다.

`CustomerInquiryPage`에 검증 완료된 관리자 세션을 전달하고, 답변 등록·수정 시 로그인 관리자의 `user_no`와 이름 또는 이메일을 사용하도록 수정했다.

## 실DB lifecycle 검증

| 항목 | 결과 |
| --- | --- |
| 소유자 문의 등록·목록·상세 | 통과 |
| 소유자 문의 수정·삭제 | 통과 |
| 타 사용자 소유자 번호 위조 | HTTP 403 |
| 타 사용자 본인 번호로 비공개 상세 조회 | HTTP 404, 내용 비노출 |
| 관리자 답변 등록·수정 | 통과 |
| 답변 후 사용자 수정·삭제 | HTTP 409 |
| 답변 작성자 번호 | 로그인 관리자 `user_no` 저장 확인 |
| fixture 정리 | 사용자 0, 문의 0, 답변 0 |

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/pages/CustomerInquiryPage.jsx`
- `admin-web/tests/e2e/customer-inquiry-management.spec.js`
- `admin-web/tests/e2e/qna-user-admin-db-e2e.spec.js`
- `service-api/tests/test_support_qna_lifecycle_db_e2e.py`

## 검증 결과

- 개발 DB health: `cubici_local`, application table 60개, 정상
- 실DB API lifecycle: `1 passed`
- Q&A 소유권·관리자 인증 포함 focused 회귀: `16 passed`
- 사용자 React + 관리자 React + FastAPI + PostgreSQL E2E: `1 passed`, 13.7초
- 사용자·관리자 production build: 모두 통과
- 테스트 서버 종료: API·사용자·관리자 포트 모두 listener 없음
- 외부 재확인 fixture: 사용자 0, 문의 0, 답변 0
- `git diff --check`: 통과

## 진행 판단

QNA-2는 완료다. 화면 복원율은 사용자 직접 화면 26/26, 관리자 직접·파생 34/34로 기존 100%를 유지한다. 페이지별 기능 가중치를 재산정하지 않았으므로 기능 구현율은 사용자 90.4%, 관리자 전체 83.5%의 기존 보수적 하한을 유지한다.

## 다음 Batch

`QNA-3 사용자 Q&A 30건 초과 서버 페이지네이션`을 진행한다. API `total`, `limit`, `offset`을 기준으로 10건 단위 페이지 이동과 검색 결과를 서버 조회로 전환하고, 31건 이상 fixture로 첫·중간·마지막 페이지를 검증한다.
