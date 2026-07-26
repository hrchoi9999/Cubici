# Cubici 고객 공지 관리 화면 DB 연결

## 작업 결과

- 관리자 `고객관리 > 고객 공지 관리` 화면을 Python/React로 구현했다.
- PostgreSQL 이관 테이블 `notice`, `faq` 기준으로 목록, 상세, 등록, 수정, 삭제 API를 연결했다.
- legacy `CBCI_BOARD` 구조는 업무 흐름 분석용으로만 사용하고 이관 DB 구조에 맞게 재구성했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `service-api/src/cubici_service/support/repository.py` | 공지/FAQ 조회/등록/수정/삭제 |
| `service-api/src/cubici_service/api/v1/endpoints/support.py` | `/support/boards/{board_kind}` API |
| `service-api/tests/test_domain_routes.py` | route/payload 테스트 |
| `admin-web/src/api/support.js` | 고객 공지 API client |
| `admin-web/src/pages/CustomerBoardPage.jsx` | 고객 공지 관리 화면 |
| `admin-web/src/App.jsx` | legacy `manageBoard_tab1`, `manageBoard_tab2` route 연결 |
| `admin-web/src/styles/admin-web.css` | 고객 공지 화면 스타일 |
| `admin-web/tests/e2e/customer-board-management.spec.js` | Playwright E2E |

## Legacy 확인

- Legacy 최종 Depth 메뉴: `/admin/cubici/supportMember/manageBoard_tab1`
- 화면 내부 탭:
  - 서비스 공지: `DIVISION=03`
  - FAQ: `DIVISION=02`
- legacy AJAX:
  - 목록: `/admin/board/list/get`
  - 등록: `/admin/board/list/Insert`, `/admin/board/list/file/Insert`
  - 수정: `/admin/board/list/Update`, `/admin/board/list/file/Update`
  - 삭제: `/admin/board/list/Delete`
- legacy 테이블: `CBCI_BOARD`
- 이관 PostgreSQL 테이블: `notice`, `faq`

## 구현 범위

- 서비스 공지/FAQ 탭 전환
- 목록 조회
- 검색/구분/정렬
- 상세 조회
- 등록
- 수정
- 삭제
- 내용 미리보기

## 보류 범위

- 서비스 공지 첨부파일 업로드/다운로드
- legacy `CBCI_SELECT_CODE` 기반 구분 코드명 1:1 검산
- SmartEditor 수준 HTML 편집/렌더링 정밀 반영

## 검증 결과

- PostgreSQL 실데이터:
  - `notice` 5건
  - `faq` 31건
- PostgreSQL write/cleanup 검증:
  - 임시 공지 생성
  - 수정
  - 삭제
  - 최종 cleanup 확인
- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest`
  - `29 passed, 1 skipped`
- `npm run build`
  - 성공
- `npm run test:e2e -- customer-board-management.spec.js`
  - `1 passed`

## 완성도 판단

- DB/API/React/E2E와 등록/수정/삭제까지 연결했다.
- 첨부파일과 legacy 코드명 검산, HTML 편집 정밀도가 남아 있다.
- 보수적 완성도는 `65%`로 본다.

## 다음 액션

- 고객관리 3개 최종 Depth 메뉴의 통합 회귀검증을 진행한다.
- 이후 `모니터링 > Error Log` 또는 `환경설정` 메뉴 구현으로 넘어간다.
