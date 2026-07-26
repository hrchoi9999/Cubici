# Cubici Admin Inventory C: Support, Monitoring, Common, E2E

작성일: 2026-07-26

## 범위

- 관리자 레이아웃, 좌측 메뉴, route, fallback
- 서버관리, 오류로그, 고객문의, 게시판/공지/FAQ, 문자/이메일 템플릿
- `admin-web` E2E runner/config/test files 현황
- 관리자단 milestone E2E 전 전제조건과 skip 가능성

## 조사 기준

- 작업공간은 `D:\Alt_CSM` 내부로 제한했다.
- 전체 E2E는 실행하지 않았다.
- `rg`, 파일 읽기, 기존 문서/소스 확인만 수행했다.
- 완료율은 화면 표시가 아니라 운영 재현 기준으로 보수 산정했다.

## 관련 구현 파일

- `Cubici/admin-web/src/App.jsx`
- `Cubici/admin-web/src/components/layout/AdminLayout.jsx`
- `Cubici/admin-web/src/pages/ServerMonitorPage.jsx`
- `Cubici/admin-web/src/pages/ErrorLogPage.jsx`
- `Cubici/admin-web/src/pages/CustomerInquiryPage.jsx`
- `Cubici/admin-web/src/pages/CustomerBoardPage.jsx`
- `Cubici/admin-web/src/pages/MessageTemplatePage.jsx`
- `Cubici/admin-web/src/api/monitoring.js`
- `Cubici/admin-web/src/api/support.js`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/monitoring.py`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/support.py`
- `Cubici/service-api/src/cubici_service/monitoring/repository.py`
- `Cubici/service-api/src/cubici_service/support/repository.py`

## Legacy 참조 파일

- `Cubici/src/main/java/egovframework/azon/admin/cubici/web/AdminCubiciUserController.java`
- `Cubici/src/main/java/egovframework/azon/admin/cubici/web/AdminUserSupportController.java`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminMonitor/error_report.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageInquiry.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageInquiry_detail.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageInquiry_write.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageBoard_tab1.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageBoard_tab1_Write.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageBoard_tab2.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageBoard_tab2_Detail.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageBoard_tab2_Write.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageSms.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageSms_Write.jsp`
- `Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageEmail.jsp`

## 기능별 Inventory

| 기능 | Legacy 재현 수준 | DB/API 연결 | 저장/상태변경 | focused E2E | 남은 개발 내역 | 병렬 개발 가능 |
|---|---:|---:|---:|---:|---|---|
| 관리자 레이아웃/좌측 메뉴 | 75% | 해당 없음 | 해당 없음 | 부분 | 메뉴 depth, legacy route alias, fallback route 전체 대조 필요 | 가능 |
| route/fallback | 65% | 해당 없음 | 해당 없음 | 부족 | 미구현 route가 fallback 화면으로 렌더된다. 실제 기능 미구현과 화면 안내를 명확히 분리해야 함 | 가능 |
| 서버관리 | 55% | 70% | 해당 없음 | mock 있음 | legacy 별도 `server_monitor` 근거는 약함. 현재는 FastAPI/DB/batch log 기반 신규 모니터링 성격이다. 실제 metric/source 연결 필요 | 가능 |
| 오류로그 | 68% | 75% | 조회 전용 | mock 있음 | `cbci_err_report`, `cbci_scheduled_report` 조회는 구현. legacy 필터/컬럼/페이징 표시 정밀 대조 필요 | 가능 |
| 고객문의 | 72% | 80% | 75% | mock 있음 | 문의 목록/상세/답변 등록·수정 구현. 알림/메일 발송, 권한, 답변 삭제, 운영 처리상태는 미구현 또는 미확정 | 가능 |
| 게시판/공지 | 70% | 80% | 75% | mock 있음 | 공지 등록/수정/삭제 구현. 첨부파일, 노출기간/팝업/상단고정 등 legacy 정책 확인 필요 | 가능 |
| FAQ | 68% | 80% | 75% | mock 있음 | FAQ 등록/수정/삭제 구현. legacy 상세/토글 UI, 구분값 매핑, 노출정책 추가 대조 필요 | 가능 |
| 문자 템플릿 | 68% | 78% | 75% | mock 있음 | 템플릿 CRUD 구현. 실제 SMS 발송 연동, 코드 중복 정책, 변수 치환 정책 검수 필요 | 가능 |
| 이메일 템플릿 | 65% | 78% | 75% | mock 있음 | 템플릿 CRUD 구현. legacy email modal/미리보기/발송 연동/HTML 렌더 정책 검수 필요 | 가능 |
| admin-web E2E runner | 55% | 부분 | 해당 없음 | 있음 | runner가 preview 실행과 Playwright 실행만 수행한다. production build, DB preflight, DB E2E env 기본값은 user-web runner 수준으로 보강 필요 | 가능 |

## E2E 현황

`admin-web/tests/e2e`에는 다음 C 영역 focused test가 있다.

- `server-monitoring.spec.js`: mock 기반 서버관리 카드 렌더 검증
- `error-log-monitoring.spec.js`: mock 기반 오류로그 목록/상세 검증
- `customer-inquiry-management.spec.js`: mock 기반 고객문의 상세/답변 수정 검증
- `customer-board-management.spec.js`: mock 기반 게시판 목록/수정/삭제 검증
- `message-template-management.spec.js`: mock 기반 문자/이메일 템플릿 목록/수정/삭제 검증

DB 기반 관리자 E2E는 머니뱅크 계약/문서/예외/해지 쪽에 집중되어 있고, C 영역은 아직 실제 Docker PostgreSQL 기반 CRUD E2E가 부족하다.

## Milestone E2E 전 전제조건

1. `admin-web/scripts/run-playwright-e2e.mjs`에 production build 실행 또는 build 완료 전제 확인을 추가한다.
2. 관리자단 runner에도 DB preflight를 추가한다.
3. DB 기반 test 실행 시 `CUBICI_RUN_DB_E2E=1` 전달 누락이 없도록 한다.
4. mock E2E와 DB E2E를 명시적으로 분리한다.
5. C 영역 CRUD E2E는 임시 데이터를 생성하고 테스트 종료 후 삭제하도록 고정한다.
6. 전체 관리자단 milestone E2E는 기능 구현/보강 후 1회만 실행한다.

## Skip 가능성

- `CUBICI_RUN_DB_E2E` 누락 시 DB 기반 테스트 skip 가능성이 있다.
- Docker PostgreSQL unhealthy 또는 DB preflight 실패는 기능 실패가 아니라 환경 blocker로 분류한다.
- legacy route가 React fallback으로 잡히면 E2E가 화면 렌더 성공으로 오판할 수 있다.
- mock 기반 테스트는 API/DB 저장 실패를 잡지 못한다.
- 첨부파일, SMS/Email 실제 발송, 외부 모니터링 metric은 1차 범위에서 제외하거나 별도 mock 정책이 필요하다.

## Sub Agent 병렬 개발 준비

다음 병렬 분배가 가능하다.

| Sub Agent | 작업 범위 | 충돌 가능 파일 | 검증 방식 |
|---|---|---|---|
| C1 공통/route Agent | 메뉴 depth, legacy route alias, fallback 분류 문구 보강 | `App.jsx`, `AdminLayout.jsx` | route focused E2E |
| C2 모니터링 Agent | 오류로그/서버관리 legacy 컬럼/필터 대조, DB focused E2E 추가 | `ErrorLogPage.jsx`, `ServerMonitorPage.jsx`, `monitoring.py`, `monitoring/repository.py` | API/domain + DB focused E2E |
| C3 고객지원 Agent | 문의 답변 workflow, 게시판/FAQ 첨부/노출정책, 템플릿 코드/미리보기 보강 | `CustomerInquiryPage.jsx`, `CustomerBoardPage.jsx`, `MessageTemplatePage.jsx`, `support.py`, `support/repository.py` | API/domain + DB focused E2E |
| C4 E2E Harness Agent | admin-web runner build/preflight/env 보강, mock/DB suite 분리 | `run-playwright-e2e.mjs`, `playwright.config.js`, `tests/e2e/*` | runner dry check + focused spec |

병렬 개발 시 `support/repository.py`와 `support.py`는 C3 전담으로 두고, C2는 monitoring 파일만 수정하도록 제한하는 것이 안전하다.

## 1차 개발 우선순위

1. admin-web E2E runner를 user-web 수준으로 보강한다.
2. route/fallback inventory를 전체 메뉴 기준으로 분류한다.
3. 고객문의 답변 등록/수정 DB E2E를 추가한다.
4. 게시판/FAQ/템플릿 CRUD DB E2E를 추가한다.
5. 오류로그/서버관리 DB 조회 focused E2E를 추가한다.
6. 첨부파일, SMS/Email 실발송, 외부 metric은 2차 범위 또는 mock 정책으로 분리한다.

## 보수 완료율

- 공통 layout/route: 65~75%
- 모니터링: 55~68%
- 고객지원: 65~72%
- 문자/이메일 템플릿: 65~68%
- C 영역 전체: 63~70%

위 수치는 운영 재현 기준의 추정이다. mock E2E가 DB E2E로 전환되면 일부 항목은 상향 가능하다.
