# Cubici 고객문의 관리자 화면 DB 연결

## 작업 결과

- 관리자 `고객관리 > 고객문의` 화면을 Python/React로 구현했다.
- PostgreSQL 이관 테이블 `qna`, `qna_reply` 기준으로 목록/상세 조회와 답변 등록/수정 API를 연결했다.
- legacy `CBCI_BOARD` 구조는 업무 흐름 분석용으로만 사용하고, 이관 DB 구조에 맞춰 재구성했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `service-api/src/cubici_service/support/__init__.py` | support domain package |
| `service-api/src/cubici_service/support/repository.py` | 고객문의 목록/상세/답변 등록/수정 PostgreSQL 처리 |
| `service-api/src/cubici_service/api/v1/endpoints/support.py` | `/support/inquiries`, `/support/inquiries/{qna_id}/replies` API |
| `service-api/src/cubici_service/api/v1/router.py` | support router 연결 |
| `service-api/tests/test_domain_routes.py` | support API route/payload 테스트 |
| `admin-web/src/api/support.js` | 고객문의 API client |
| `admin-web/src/pages/CustomerInquiryPage.jsx` | 고객문의 관리자 화면 |
| `admin-web/src/App.jsx` | legacy 고객문의 경로 route 연결 |
| `admin-web/src/styles/admin-web.css` | 고객문의 화면 최소 스타일 |
| `admin-web/tests/e2e/customer-inquiry-management.spec.js` | 고객문의 Playwright E2E |

## Legacy 확인

- Legacy 메뉴: `/admin/cubici/supportMember/manageInquiry`
- 목록 AJAX: `/admin/board/list/get`
- 상세 화면: `/admin/board/manageInquiry/detail`
- 답변 등록: `/admin/board/manageInquiry/CommentWrite`
- 답변 수정: `/admin/board/manageInquiry/CommentUpdate`
- legacy query 기준 테이블: `CBCI_BOARD`, `CBCI_SELECT_CODE`
- 이관 PostgreSQL 기준 테이블: `qna`, `qna_reply`

## 구현 범위

- 목록 조회
- 검색어, 구분, 답변상태, 정렬 필터
- 답변완료/답변대기 건수
- 상세 패널
- 답변 조회
- 답변 등록
- 답변 수정

## 보류 범위

- legacy `CBCI_BOARD`의 `BOARD_DIVISION` 코드와 이관 `qna.type`의 완전한 코드 매핑 검산
- HTML 본문 표시 방식의 보안/렌더링 정책 확정

## 검증 결과

- PostgreSQL 실데이터 조회:
  - `qna` 1건
  - `qna_reply` 1건
  - 목록 total 1건, 답변완료 1건, 답변대기 0건
- PostgreSQL write/cleanup 검증:
  - 임시 `qna` row 생성
  - 답변 등록 `created` 확인
  - 답변 수정 `updated` 확인
  - 임시 `qna`, `qna_reply` row 삭제
- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest`
  - `25 passed, 1 skipped`
- `npm run build`
  - 성공
- `npm run test:e2e -- customer-inquiry-management.spec.js`
  - `1 passed`

## 완성도 판단

- DB/API/React/E2E와 답변 등록/수정 write 기능까지 연결했다.
- legacy 코드 매핑 검산과 HTML 본문 렌더링 정책이 남아 있어 보수적 완성도는 `70%`로 본다.

## 다음 액션

- legacy `BOARD_DIVISION` 코드와 이관 `qna.type` 매핑을 재검산한다.
- HTML 본문 렌더링 정책을 확정한다.
