# Cubici 문자/이메일 관리자 화면 DB 연결

## 작업 결과

- 관리자 `고객관리 > 문자/이메일` 화면을 Python/React로 구현했다.
- PostgreSQL 이관 테이블 `message_template` 기준으로 목록, 상세, 등록, 수정, 삭제 API를 연결했다.
- 실제 SMS/메일 발송은 개발환경 비활성화 원칙에 따라 구현 범위에서 제외했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `service-api/src/cubici_service/support/repository.py` | 문자/이메일 템플릿 조회/등록/수정/삭제 |
| `service-api/src/cubici_service/api/v1/endpoints/support.py` | `/support/message-templates` API |
| `service-api/tests/test_domain_routes.py` | route/payload 테스트 |
| `admin-web/src/api/support.js` | 문자/이메일 템플릿 API client |
| `admin-web/src/pages/MessageTemplatePage.jsx` | 문자/이메일 관리자 화면 |
| `admin-web/src/App.jsx` | legacy `manageSms`, `manageEmail` route 연결 |
| `admin-web/src/styles/admin-web.css` | 문자/이메일 화면 스타일 |
| `admin-web/tests/e2e/message-template-management.spec.js` | Playwright E2E |

## Legacy 확인

- Legacy 최종 Depth 메뉴: `/admin/cubici/supportMember/manageSms`
- 화면 내부 탭:
  - 문자 공지: `SMS_KEY=00`
  - 이메일: `SMS_KEY=01`
- Legacy AJAX:
  - 목록: `/admin/sms/list`
  - 등록: `/admin/sms/insert`
  - 수정: `/admin/sms/update`
  - 삭제: `/admin/sms/delete`
  - 이메일 상세 modal: `/admin/cubici/supportMember/manageEmail/modal`
- legacy 테이블: `CBCI_SMS_TEMPLATE`
- 이관 PostgreSQL 테이블: `message_template`

## 구현 범위

- 문자/이메일 탭 전환
- 템플릿 목록 조회
- 검색/정렬
- 템플릿 상세 조회
- 템플릿 등록
- 템플릿 수정
- 템플릿 삭제
- 내용 미리보기

## 보류 범위

- 실제 SMS 발송
- 실제 메일 발송
- legacy `CBCI_SELECT_CODE` 기반 메뉴/구분 코드명 1:1 검산
- 메일 HTML 에디터와 실제 렌더링 미리보기

## 검증 결과

- PostgreSQL 실데이터 조회:
  - `message_template` 8건
- PostgreSQL write/cleanup 검증:
  - 임시 템플릿 생성
  - 수정
  - 삭제
  - 최종 cleanup 확인
- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest`
  - `27 passed, 1 skipped`
- `npm run build`
  - 성공
- `npm run test:e2e -- message-template-management.spec.js`
  - `1 passed`

## 완성도 판단

- DB/API/React/E2E와 등록/수정/삭제까지 연결했다.
- 실제 발송 기능은 개발환경에서 의도적으로 제외했고, 코드명 검산과 HTML 미리보기 정밀도가 남아 있다.
- 보수적 완성도는 `65%`로 본다.

## 다음 액션

- `고객관리 > 고객 공지 관리` 화면을 구현한다.
- 이후 고객관리 3개 최종 Depth 메뉴의 연결 상태를 통합 검증한다.
