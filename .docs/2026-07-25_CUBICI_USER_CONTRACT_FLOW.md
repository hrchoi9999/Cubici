# Cubici 사용자 신청/계약 흐름 구현 기록

## 작업 결과

- 사용자 머니뱅크 신청/계약 흐름을 legacy 운영 흐름 기준으로 재대조했다.
- legacy 흐름상 계약 체결 전 `조건 제시 -> 이용자 이용조건 동의/거절 -> 관리자 계약 체결` 단계가 존재한다.
- 신규 `service-api`에 사용자 이용조건 동의/거절 및 계약 준비 상태 액션을 추가했다.
- 신규 `user-web`의 서비스 현황/계약 상세에 이용조건 확인 및 동의/거절 UI를 추가했다.
- 신청서류 업로드 조건은 legacy together 신청 화면 기준으로 3MB 이하 `jpg/jpeg/png/pdf`로 제한했다.
- legacy 대상 쇼핑몰 목록에 있던 인터파크를 사용자 신청 쇼핑몰 목록에 추가했다.

## Legacy 대조 근거

- `togetherRequest.jsp`
  - 신청 시 운영 쇼핑몰과 사업자등록증, 대표자 신분증을 제출한다.
  - 안내 문구는 3MB 이하 `pdf/jpg/png` 업로드 기준이다.
  - 운영 쇼핑몰 코드는 Auction, Naver, Gmarket, 11st, Interpark, Coupang을 사용한다.
- `hellopayCal/evaluate.jsp`
  - 심사결과 및 이용조건을 사용자에게 보여준다.
  - 사용자가 `이용조건 동의` 또는 `동의하지 않습니다`를 선택한다.
- `AdvCalcService.isApprovalTermsOfUse`
  - 조건 상태 `04`에서 동의 시 `05`, 거절 시 `51`로 변경한다.
- `JudgeService.makeContract`
  - 관리자 계약 체결은 사용자 상태가 `05`일 때만 가능하다.
  - 체결 시 `81` 계좌대기 상태로 진행한다.

## 신규 상태 매핑

- `CONDITIONS_ACCEPT`: legacy `04`, 이용조건 제시
- `USE_AGREE`: legacy `05`, 사용자 이용조건 동의
- `TERMS_REFUSED`: legacy `51`, 이용조건 거절
- `ACCOUNT_STANDBY`: legacy `81`, 관리자 계약 체결 후 계좌대기

## 변경 파일

- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/tests/test_domain_routes.py`
- `user-web/src/App.jsx`
- `user-web/src/styles/user-web.css`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

## 검증 여부

- API 계약 상태 기존 테스트 통과.
- user-web production build 통과.
- 전체 service-api 테스트와 user-web E2E는 후속 검증 대상이다.

## 다음 액션

- 조건 제시 상태를 만드는 관리자 심사/수수료 확정 UI와 API 액션을 연결한다.
- 사용자 이용조건 동의 후 관리자 계약 체결(`ACCOUNT_STANDBY`)까지 E2E 시나리오를 추가한다.
- 실제 DB 운영 데이터에서 legacy 숫자 상태와 신규 문자열 상태가 혼재할 경우 조회/표시/필터 정책을 재확인한다.

## 2026-07-25 추가 작업

### 작업 결과

- 관리자 `심사 승인` 상세 화면에 `조건 제시` 액션을 연결했다.
- `조건 제시`는 수수료 조건이 등록된 경우에만 활성화한다.
- 관리자 `계약 관리` 상세 화면에 `체결` 액션을 연결했다.
- `체결`은 사용자가 이용조건에 동의한 `USE_AGREE` 또는 legacy `05` 상태에서만 활성화한다.
- 관리자 상태 라벨과 검색 필터를 신규 상태/legacy 숫자 상태 기준으로 보강했다.
- mock 기반 Playwright E2E로 `조건 제시`와 `체결 -> 계좌대기` 흐름을 검증했다.

### 변경 파일

- `admin-web/src/pages/ApprovalManagementPage.jsx`
- `admin-web/src/pages/ContractManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/moneybank-contract-flow.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- API 상태 액션 테스트 통과.
- admin-web production build 통과.
- admin-web Playwright E2E `moneybank-contract-flow.spec.js` 통과.

### 다음 액션

- 조건 제시 전 수수료 조건 생성/조정 UI와 심사 화면을 더 자연스럽게 연결한다.
- 실제 DB 데이터로 `REQUEST -> CONDITIONS_ACCEPT -> USE_AGREE -> ACCOUNT_STANDBY` 운영 흐름을 한 건 단위로 통합 검증한다.

## 2026-07-25 추가 작업 2

### 작업 결과

- 관리자 `심사 승인` 상세 화면에 계약 조건 조정 폼을 직접 추가했다.
- 수수료 조건이 없는 신청건도 심사 상세에서 지급율, 주문한도, 최대잔액, 수수료율을 저장할 수 있게 했다.
- 조건 저장 후 상세 데이터를 다시 조회해 `조건 제시` 버튼이 활성화되도록 연결했다.
- `조건 제시` 전에는 수수료 조건이 없으면 버튼이 비활성화되도록 유지했다.
- Playwright E2E에서 `조건 없음 -> 조건 저장 -> 조건 제시` 흐름을 검증했다.

### 변경 파일

- `admin-web/src/pages/ApprovalManagementPage.jsx`
- `admin-web/tests/e2e/moneybank-contract-flow.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- admin-web production build 통과.
- admin-web Playwright E2E `moneybank-contract-flow.spec.js` 통과.

### 다음 액션

- 실제 DB 데이터 1건 기준으로 관리자 조건 저장, 조건 제시, 사용자 동의, 관리자 체결까지 통합 검증한다.
- 통합 검증 전에 테스트용 계약/회원/쇼핑몰 데이터 생성 및 cleanup 절차를 정리한다.

## 2026-07-25 추가 작업 3

### 작업 결과

- 실제 PostgreSQL DB를 사용하는 계약 lifecycle E2E 테스트를 추가했다.
- 테스트용 사용자와 쇼핑몰 계정을 임시 생성한 뒤 계약 신청은 API로 생성하도록 구성했다.
- `REQUEST -> CONDITIONS_ACCEPT -> USE_AGREE -> ACCOUNT_STANDBY` 상태 전환을 실제 DB write 기준으로 검증했다.
- 수수료 조건 저장, 수수료율 저장, 계약 상세 조회, 상태 이력 저장을 함께 검증했다.
- 테스트 종료 후 계약, 계약 쇼핑몰, 수수료, 수수료율, 수수료 변경 이력, 상태 이력, 테스트 사용자, 테스트 쇼핑몰 계정을 cleanup하도록 구성했다.

### 변경 파일

- `service-api/tests/test_contract_lifecycle_db_e2e.py`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- 기본 API 테스트: `66 passed, 2 skipped`
- 실제 DB E2E 명시 실행: `1 passed`
- 테스트 임시 사용자/쇼핑몰 계정 cleanup 확인: `users 0`, `shops 0`

### 다음 액션

- 사용자 화면과 관리자 화면을 실제 API/DB에 붙여 동일 흐름을 Playwright로 검증한다.
- 사용자 신청/계약 화면에서 legacy 상태 코드와 신규 상태 문자열 혼재 표시를 계속 보강한다.

## 2026-07-25 추가 작업 4

### 작업 결과

- 관리자 화면 기준 실제 PostgreSQL DB Playwright E2E를 추가했다.
- 테스트용 사용자와 쇼핑몰 계정을 생성한 뒤 계약 신청은 실제 API로 생성한다.
- 관리자 `심사 승인` 화면에서 검색, 상세 조회, 계약 조건 저장, 조건 제시 버튼 동작을 실제 API/DB 기준으로 검증했다.
- 사용자 이용조건 동의 단계는 테스트 중 API로 전환한 뒤, 관리자 `계약 관리` 화면에서 검색, 상세 조회, 체결 버튼 동작을 검증했다.
- 최종 상태가 `ACCOUNT_STANDBY`로 저장되는지 실제 API 상세 조회로 검증했다.
- 실패/성공 여부와 관계없이 테스트용 계약, 수수료, 상태 이력, 회원, 쇼핑몰 계정을 cleanup하도록 보강했다.

### 변경 파일

- `admin-web/tests/e2e/moneybank-contract-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- 기본 Playwright 실행: `1 skipped`
- 실제 DB/관리자 화면 E2E: `1 passed`
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`

### 다음 액션

- 사용자 화면에서 이용조건 확인/동의 버튼을 실제 API/DB 기준으로 Playwright E2E 검증한다.
- 사용자 신청 화면에서 실제 DB 신청 생성까지 화면 입력 기반으로 검증할지, 신청 생성은 API fixture로 둘지 결정한다.

## 2026-07-25 추가 작업 5

### 작업 결과

- 사용자 계약 상세 화면 기준 실제 PostgreSQL DB Playwright E2E를 추가했다.
- 테스트용 사용자와 쇼핑몰 계정을 생성하고, 계약 신청/수수료 조건 저장/조건 제시는 실제 API로 준비했다.
- 사용자 세션을 `cubiciUserAuth` localStorage에 주입한 뒤 `/moneybank/current/{mbid}` 상세 화면을 열어 이용조건 확인 패널을 검증했다.
- 사용자 화면의 `이용조건 동의` 버튼 클릭 후 최종 상태가 `USE_AGREE`로 저장되는지 실제 API 상세 조회로 검증했다.
- 테스트용 계약, 수수료, 상태 이력, 회원, 쇼핑몰 계정을 cleanup하도록 구성했다.

### 변경 파일

- `user-web/tests/e2e/moneybank-terms-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- user-web production build 통과.
- 기본 Playwright 실행: `1 skipped`
- 실제 DB/사용자 화면 E2E: `1 passed`
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`

### 확인된 이슈

- `moneybank_contract_fee.created_by`, `last_modified_by`는 legacy DB 기준 `varchar(15)` 길이 제한이 있어 조작자 ID는 15자 이하로 넣어야 한다.
- user-web dev 서버는 현재 `react-refresh` 의존성 문제로 Vite overlay가 발생할 수 있어 E2E는 production build + preview 기준으로 실행했다.

### 다음 액션

- 사용자 신청 화면에서 실제 화면 입력 기반 신청 생성 E2E를 추가한다.
- 관리자 조건 제시 E2E와 사용자 이용조건 동의 E2E를 하나의 full lifecycle 시나리오로 묶을지 검토한다.

## 2026-07-25 추가 작업 6

### 작업 결과

- 사용자 `머니뱅크 신청` 화면 기준 실제 PostgreSQL DB Playwright E2E를 추가했다.
- 테스트용 사용자와 쇼핑몰 계정을 생성하고, 실제 인증 토큰 규칙에 맞는 `cubiciUserAuth` 세션을 주입했다.
- 신청 화면에서 연결 쇼핑몰 조회, 네이버 쇼핑몰 선택 상태, 사업자등록증/대표자 신분증 파일 선택, 본인확인/약관동의 체크, `서비스 신청` 클릭을 화면 입력 기준으로 검증했다.
- 계약 신청 생성, 필수 제출서류 2건 업로드, 계약 상태 `REQUEST`, 계약 쇼핑몰 `NAVER`, `CBCI_FILE` 파일 메타데이터 저장을 실제 API/DB 기준으로 검증했다.
- 테스트 종료 후 계약, 계약 쇼핑몰, 상태 이력, 제출서류 메타데이터, 실제 업로드 파일, 회원, 쇼핑몰 계정을 cleanup하도록 구성했다.

### 변경 파일

- `user-web/tests/e2e/moneybank-request-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- user-web production build 통과.
- 기본 Playwright 실행: `1 skipped`
- 실제 DB/사용자 신청 화면 E2E: `1 passed`
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`, `files 0`

### 다음 액션

- 사용자 신청 생성, 관리자 조건 제시, 사용자 이용조건 동의, 관리자 체결을 하나의 full lifecycle E2E로 연결한다.
- 이후 사용자 현황/관리자 목록에서 같은 계약의 상태 표시가 일관적인지 최종 확인한다.

## 2026-07-25 추가 작업 7

### 작업 결과

- 사용자 신청, 관리자 심사 조건 저장/조건 제시, 사용자 이용조건 동의, 관리자 체결, 사용자 최종 계약 상세 확인을 하나의 full lifecycle Playwright E2E로 연결했다.
- 테스트용 회원/쇼핑몰을 생성하고 사용자 신청 화면에서 서류 2건을 실제 업로드한 뒤 계약 상태 `REQUEST`와 제출서류 저장을 검증했다.
- 관리자 심사 화면에서 수수료 조건과 한도 조건을 저장하고 `CONDITIONS_ACCEPT` 상태 전환을 검증했다.
- 사용자 계약 상세 화면에서 제시 조건 확인 후 이용조건 동의를 수행하고 `USE_AGREE` 상태 전환을 검증했다.
- 관리자 계약 관리 화면에서 체결 처리 후 최종 상태 `ACCOUNT_STANDBY`와 사용자 화면의 `계좌대기` 표시를 확인했다.
- E2E 임시 업로드 파일 생성 위치를 `D:\Alt_CSM\.tmp\cubici-e2e` 아래로 제한했다.

### 변경 파일

- `admin-web/tests/e2e/moneybank-full-lifecycle-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- user-web production build 통과.
- 기본 Playwright 실행: `1 skipped`
- 실제 DB/관리자/사용자 full lifecycle E2E: Playwright 결과 `ok 1`
- 테스트 실행 래퍼는 서버 종료 대기 중 timeout이 발생했으나, 테스트 본문은 통과했고 DB cleanup은 별도 확인했다.
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`, `files 0`

### 확인된 이슈

- 테스트용으로 기본 CORS 허용 포트 밖의 포트(`4176`, `5176`)를 쓰면 인증 쇼핑몰 조회 preflight가 차단된다.
- 임시 테스트 서버를 띄울 때는 `CUBICI_CORS_ALLOW_ORIGINS`에 사용자/관리자 테스트 포트를 명시해야 한다.

### 다음 액션

- 사용자 현황 목록, 사용자 계약 상세, 관리자 신청/계약 목록의 상태 표시 문구가 같은 계약에서 일관적인지 점검한다.
- 이후 문서 보류/반려/취소 등 예외 상태 흐름을 실제 DB E2E로 확장한다.

## 2026-07-25 추가 작업 8

### 작업 결과

- 계약 상태 표시 문구를 사용자/관리자 주요 화면에서 일관되게 맞췄다.
- 관리자 `심사 승인`, `계약 관리`, `신청/상태 상세`, `회원 상세 머니뱅크 계약` 화면에 공통 상태 라벨 유틸을 적용했다.
- 사용자 화면의 `TERMS_REFUSED`, legacy 숫자 상태 코드 `04`, `05`, `06` 문구를 관리자 공통 라벨과 맞췄다.
- full lifecycle E2E에 같은 계약의 사용자 현황/상세, 관리자 심사/계약 목록 상태 문구 검증을 추가했다.
- 검증한 주요 상태 문구는 `신청접수`, `조건제시`, `이용조건 동의`, `계좌대기`다.

### 변경 파일

- `admin-web/src/utils/contractStatus.js`
- `admin-web/src/pages/ApprovalManagementPage.jsx`
- `admin-web/src/pages/ContractManagementPage.jsx`
- `admin-web/src/pages/AdminDashboardPage.jsx`
- `admin-web/src/pages/MemberStatusPage.jsx`
- `user-web/src/App.jsx`
- `admin-web/tests/e2e/moneybank-full-lifecycle-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- admin-web production build 통과.
- user-web production build 통과.
- 기본 Playwright 실행: `1 skipped`
- 실제 DB/관리자/사용자 full lifecycle E2E: `1 passed`
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`, `files 0`

### 다음 액션

- 문서 보완 요청(`PENDING_DOCUMENTS`)과 보완서류 재업로드 흐름을 사용자/관리자 실제 DB E2E로 검증한다.
- 이후 반려/동의거부/해지 등 예외 상태 흐름을 순서대로 고정한다.

## 2026-07-25 추가 작업 9

### 작업 결과

- 관리자 신청/상태 상세 화면에 `서류보완 요청` 버튼을 추가했다.
- 관리자가 `document_pending` 액션을 실행하면 계약 상태가 `PENDING_DOCUMENTS`로 변경되고, 사용자 현황에서 `서류보완`으로 표시되는지 검증했다.
- 사용자 현황에서 보완서류 2건을 재업로드하면 `document_ready` 액션으로 계약 상태가 `REQUEST`로 복귀하고, 사용자 현황에서 `신청접수`로 표시되는지 검증했다.
- 보완서류 제출 후 상태가 즉시 복귀하면서 보완 폼이 사라져 성공 메시지도 사라지는 문제가 있어, 성공 안내와 업로드 목록이 폼 밖에서도 유지되도록 보강했다.
- 관리자 신청 접수 목록에는 회사명이 별도 컬럼으로 표시되지 않는 것을 확인했다. 운영상 필요하면 후속 UI 개선 후보로 본다.

### 변경 파일

- `admin-web/src/pages/AdminDashboardPage.jsx`
- `user-web/src/App.jsx`
- `admin-web/tests/e2e/moneybank-document-supplement-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- admin-web production build 통과.
- user-web production build 통과.
- 기본 Playwright 실행: `1 skipped`
- 실제 DB/관리자/사용자 문서보완 E2E: `1 passed`
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`, `files 0`

### 다음 액션

- 반려(`REJECTED`)와 동의거부(`TERMS_REFUSED`) 예외 흐름을 사용자/관리자 실제 DB E2E로 고정한다.
- 이후 해지(`SELF_TERMINATION`) 흐름과 상환/잔액 영향 검증으로 넘어간다.

## 2026-07-25 추가 작업 10

### 작업 결과

- 관리자 반려(`REJECTED`)와 사용자 동의거부(`TERMS_REFUSED`) 예외 상태 흐름을 실제 DB E2E로 고정했다.
- 관리자 신청 접수 화면에서 `거부` 액션을 실행하면 계약 상태가 `REJECTED`로 저장되고, 사용자 현황에서 `거절`로 표시되는지 검증했다.
- 별도 계약에 대해 관리자 심사 화면에서 조건 저장/조건 제시 후, 사용자 계약 상세 화면에서 `동의하지 않습니다`를 클릭하면 `TERMS_REFUSED`로 저장되는지 검증했다.
- 사용자 현황과 관리자 심사 목록에서 동의거부 상태가 `동의거부`로 일관 표시되는지 검증했다.
- 두 예외 계약 모두 테스트 종료 후 계약, 수수료, 상태 이력, 제출서류 메타데이터, 실제 업로드 파일, 회원, 쇼핑몰 계정을 cleanup했다.

### 변경 파일

- `admin-web/tests/e2e/moneybank-exception-status-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- admin-web production build 통과.
- user-web production build 통과.
- 기본 Playwright 실행: `1 skipped`
- 실제 DB/관리자/사용자 예외 상태 E2E: `1 passed`
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`, `files 0`

### 다음 액션

- 해지(`SELF_TERMINATION`) 흐름을 실제 DB E2E로 고정한다.
- 해지 이후 상환/잔액에 미치는 영향은 legacy 정책 재확인 후 별도 검산한다.

## 2026-07-25 추가 작업 11

### 작업 결과

- 관리자 해지(`SELF_TERMINATION`) 흐름을 실제 DB E2E로 고정했다.
- 테스트용 회원/쇼핑몰을 생성하고 API로 계약을 `ACCOUNT_STANDBY` 상태까지 준비한 뒤, 관리자 신청/상태 상세 화면에서 `해지` 버튼을 실행했다.
- 해지 실행 후 계약 상태가 `SELF_TERMINATION`으로 저장되고 `cancel_request_date`가 기록되는지 검증했다.
- 사용자 머니뱅크 현황에서 같은 계약이 `해지`로 표시되는지 검증했다.
- 관리자 휴면/해지 화면에서 같은 회원이 `머니뱅크`, `해지` 상태로 조회되는지 검증했다.

### 변경 파일

- `admin-web/tests/e2e/moneybank-termination-status-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- admin-web production build 통과.
- user-web production build 통과.
- 기본 Playwright 실행: `1 skipped`
- 실제 DB/관리자/사용자 해지 E2E: `1 passed`
- 테스트 임시 데이터 cleanup 확인: `users 0`, `shops 0`, `contracts 0`, `files 0`

### 확인된 이슈

- 해지 액션은 현재 계약 상태와 무관하게 API에서 허용된다. 운영 정책상 해지 가능 상태 제한이 필요한지는 legacy 정책 재확인이 필요하다.
- 해지 시 상환/잔액 재계산 또는 미상환잔액 처리 정책은 아직 이 E2E 범위에 포함하지 않았다.

### 다음 액션

- 해지 가능 상태 제한과 상환/잔액 영향 정책을 legacy 기준으로 재확인한다.
- 이후 상환/잔액 검산 E2E 또는 정책 문서화를 진행한다.

## 2026-07-25 추가 작업 12

### 작업 결과

- legacy 기준 해지/상환 잔액 정책을 재확인했다.
- legacy 머니뱅크 상태에는 `중도해지`, `해지신청`, `본인해지`, `강제해지`, `계좌해지`가 분리되어 있음을 확인했다.
- legacy 관리자 회원 해지 확인은 `CBCI_USER` 탈퇴 플래그 갱신이며, 상환 잔액 자동 재계산 근거는 확인되지 않았다.
- 현재 Python API의 `SELF_TERMINATION` 단일 처리와 legacy 세부 상태 간 차이를 별도 정책 문서로 기록했다.

### 변경 파일

- `.docs/2026-07-25_CUBICI_TERMINATION_REDEMPTION_POLICY_REVIEW.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- legacy Java/JSP/MyBatis 파일 기준 수동 확인.
- 문서 변경만 수행했으므로 build/E2E는 실행하지 않았다.

### 다음 액션

- 해지 가능 상태 제한을 Python API와 관리자 화면에 반영한다.
- 미상환잔액 보유 계약 해지 정책은 운영 정책 확정 후 E2E로 고정한다.

## 2026-07-25 추가 작업 13

### 작업 결과

- 해지 가능 상태 제한을 Python API와 관리자 신청/상태 상세 화면에 반영했다.
- `cancel` 액션은 `ACCOUNT_STANDBY`, `CONTRACT`, legacy `06`, `81`에서만 허용한다.
- 관리자 화면의 `해지` 버튼도 같은 상태에서만 표시되도록 조정했다.
- 신청 직후 `REQUEST` 상태에서 해지를 시도하면 `409`로 차단하고 상태가 유지되는 DB E2E를 추가했다.
- 기존 `ACCOUNT_STANDBY -> SELF_TERMINATION` 해지 Playwright E2E가 계속 통과하는지 확인했다.

### 변경 파일

- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/tests/test_contract_lifecycle_db_e2e.py`
- `admin-web/src/utils/contractStatus.js`
- `admin-web/src/pages/AdminDashboardPage.jsx`
- `.docs/2026-07-25_CUBICI_TERMINATION_REDEMPTION_POLICY_REVIEW.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- `test_contract_cancel_rejects_pre_contract_status_with_real_db`: 통과
- `test_contract_lifecycle_db_e2e.py`: `2 passed`
- `admin-web` production build: 통과
- `moneybank-termination-status-db-e2e.spec.js`: `1 passed`

### 다음 액션

- 미상환잔액 보유 계약의 해지 정책을 확정한다.
- 확정 후 상환/잔액 영향 E2E를 추가한다.

## 2026-07-25 추가 작업 14

### 작업 결과

- 사용자단 병렬 개발을 위해 `user-web/src/App.jsx` 단일 파일 구조를 기능별 파일로 분리했다.
- 공통 유틸, API helper, 레이아웃, 공통 컴포넌트는 `shared/UserCore.jsx`로 분리했다.
- 홈, 머니뱅크, 판매/정산, 계정/마이페이지, 고객지원/요금 화면을 각각 페이지 파일로 분리했다.
- 신청 완료 후 대시보드 refresh가 늦어도 성공 메시지가 먼저 표시되도록 신청 UX를 보정했다.
- Sub Agent 분석 결과, 사용자단 누락/부분구현 항목과 병렬 작업 범위를 재정리했다.

### 변경 파일

- `user-web/src/App.jsx`
- `user-web/src/shared/UserCore.jsx`
- `user-web/src/pages/HomePages.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/pages/CommercePages.jsx`
- `user-web/src/pages/AccountPages.jsx`
- `user-web/src/pages/SupportPages.jsx`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- 1차 검증: user-web production build 통과.
- 2차 검증: 사용자 Playwright DB E2E 전체 suite `4 passed`.
- 구조 분리 후 실패했던 신청 E2E는 신청 성공 메시지 선표시 보정 후 통과.
- 일시적 `ECONNRESET`이 있었던 이용조건 E2E는 단독 재실행 통과 후 전체 suite 재실행에서도 통과.

### 다음 액션

- 분리된 파일 기준으로 Sub Agent 병렬 작업을 시작한다.
- 병렬 범위는 계정/마이페이지, 판매/반품/정산, 머니뱅크 상세/해지, 고객지원/요금으로 나눈다.

## 2026-07-25 추가 작업 15

### 작업 결과

- Sub Agent 4개 작업 결과를 Master Agent가 검토하고 사용자단 코드에 병합했다.
- 계정/마이페이지, 판매/반품/정산, 머니뱅크 계약 상세/해지신청, 고객지원/요금 상세의 사용자단 운영 재현 범위를 넓혔다.
- 사용자 계약 상세에서 지급/상환 operation history를 조회하고, 미상환잔액 경고와 함께 해지신청을 저장하도록 했다.
- 공통 사용자/관리자 계약 상태 라벨에 `TERMINATION_REQUEST`, legacy `71/72/73/82`를 추가했다.
- 전체 E2E 안정화를 위해 직접 API fixture helper에 짧은 재시도를 추가했다.

### 변경 파일

- `admin-web/src/utils/contractStatus.js`
- `user-web/src/shared/UserCore.jsx`
- `user-web/tests/e2e/moneybank-request-db-e2e.spec.js`
- `user-web/tests/e2e/moneybank-terms-db-e2e.spec.js`
- `user-web/tests/e2e/moneybank-user-termination-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_PARALLEL_WORK_PLAN.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

## 추가 작업 19 - 사용자 Q&A 수정/삭제 및 전체 회귀 검증

### 작업 결과

- legacy `m_boardDetail.jsp` 기준으로 답변 전 문의만 수정/삭제 가능하다는 정책을 확인했다.
- 신규 사용자 Q&A 상세에 본인 문의 수정/삭제 UI를 추가했다.
- 원글 수정/삭제 API를 추가하고, 답변이 있는 문의는 API에서 차단한다.
- Q&A E2E는 실제 PostgreSQL DB에 생성 후 수정, 삭제까지 수행한다.
- 전체 사용자 DB E2E를 재실행해 계정, 쇼핑몰 연결, 매출/반품/정산, 머니뱅크 신청/약관/해지, Q&A/요금 상세까지 회귀 확인했다.

### 변경 파일

- `service-api/src/cubici_service/support/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/support.py`
- `service-api/tests/test_domain_routes.py`
- `user-web/src/shared/UserCore.jsx`
- `user-web/src/pages/SupportPages.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/tests/e2e/support-and-charge.spec.js`

### 검증 여부

- `pytest service-api/tests/test_domain_routes.py -q`: `65 passed`
- user-web build: 통과
- `support-and-charge.spec.js`: `2 passed`
- `account-mypage-db-e2e.spec.js`: `2 passed`
- `moneybank-request-db-e2e.spec.js`: `2 passed`
- 전체 user-web DB E2E: `10 passed`

### 남은 차이

- 약관 상세는 아직 운영 테스트용 요약본이므로 legacy 전문 확정이 필요하다.
- 사용자 상품/재고 화면은 PostgreSQL 이관 DB에 legacy 원천 테이블이 없어 매출 기반 부분 재현 상태다.
- 모바일 전용 JSP route와 본인확인/계약 외부 callback은 현재 안내/대체 흐름 중심이며 후속 정밀 구현이 필요하다.

### 검증 여부

- `service-api/tests/test_domain_routes.py`: `63 passed`
- `user-web` production build: 통과
- `admin-web` production build: 통과
- 신규 사용자 DB E2E 개별 검증: 통과
- 전체 사용자 DB E2E suite: `9 passed`

### 다음 액션

- 사용자단 잔여 depth 메뉴 inventory를 최신 상태로 다시 계산한다.
- 통합정보 tab, 재고/매입 화면, Q&A 수정/삭제, 모바일 route, 금융상품/제휴 master 화면은 후속 구현 대상으로 둔다.
- 운영 재현율 90% 판정 전 legacy 세부정책과 실데이터 반복 테스트를 추가로 수행한다.

## 2026-07-25 추가 작업 16

### 작업 결과

- 사용자 통합정보 3개 탭을 DB API 기반으로 추가했다.
- 기존 sales/returns/settlements API와 로그인 사용자의 shop account를 조합해 legacy 통합정보의 당월현황, 매출분석, 상품분석 흐름을 재현했다.
- 전체 사용자 E2E 반복 중 발생한 로컬 DB 연결 timeout과 preview 대기 문제를 완화했다.

### 변경 파일

- `service-api/src/cubici_service/db/connection.py`
- `user-web/src/App.jsx`
- `user-web/src/pages/HomePages.jsx`
- `user-web/scripts/run-playwright-e2e.mjs`
- `user-web/tests/e2e/commerce-sales-settlement-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_PARALLEL_WORK_PLAN.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- `service-api/tests/test_domain_routes.py`: `63 passed`
- `user-web` production build: 통과
- `commerce-sales-settlement-db-e2e.spec.js`: `1 passed`
- 전체 사용자 DB E2E suite: `9 passed`

### 다음 액션

- 재고/상품 사용자 화면(`/cubici/invento/index`)을 먼저 구현한다.
- 이후 헬로페이 Biz/Cal, 약관/계약서/계좌점검성 화면을 legacy 운영 필요도 기준으로 분류한다.

## 2026-07-25 추가 작업 17

### 작업 결과

- 사용자 `/cubici/invento/index` 상품/재고현황 route를 추가했다.
- legacy `inventoIndex.jsp`와 `InventoMapper.xml` 기준으로 확인한 원래 기능은 쇼핑몰별 상품/재고 원천 테이블 조회, 상품 매칭, 매칭 해제, 엑셀 다운로드다.
- 현재 PostgreSQL migration DB에서는 해당 재고 원천 테이블이 확인되지 않아, 판매 주문 데이터 기반 상품 집계 화면으로 우선 구현했다.
- 이 화면은 운영 재현 관점에서 부분 구현이며, legacy 재고/상품매칭 원천 데이터가 확보되면 재구현해야 한다.

### 변경 파일

- `user-web/src/App.jsx`
- `user-web/src/pages/HomePages.jsx`
- `user-web/tests/e2e/commerce-sales-settlement-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_PARALLEL_WORK_PLAN.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- 사용자 웹 production build 통과.
- 판매/반품/정산/통합정보/상품재고 범위 DB E2E 통과: `1 passed`.
- 사용자단 전체 DB E2E 통과: `9 passed`.
- build 경고의 `/resources/...` 정적 자산 미해결 메시지는 legacy runtime asset 경로 유지로 인한 기존 경고이며, 이번 작업의 차단 이슈는 아니다.

### 다음 액션

- 사용자 잔여 route 중 `hellopayBiz`, `hellopayCal`, `depositTest`, `contractForm`, `clauseDetails`를 legacy 운영 필요도 기준으로 우선순위화한다.
- 재고 원천 테이블 또는 추가 dump 확보 전까지 상품/재고현황은 부분 구현으로 유지한다.

## 2026-07-25 추가 작업 18

### 작업 결과

- legacy `hellopayBiz`, `hellopayCal` 신청 route를 React 사용자 신청 화면으로 분기했다.
- 구매자금 선지급 신청은 B2B몰, B2B몰 ID, 희망 선지급 한도 입력을 화면에 추가했다.
- 매출 선정산 신청은 정산계좌, 주거래계좌, 통장사본, 출금이체 동의서 제출 흐름을 실제 PostgreSQL 저장/API 업로드에 연결했다.
- 신청 API에 `demand_acc_*`, `main_acc_*` 계좌 저장 필드를 추가했다.
- 제출서류 API 허용 타입에 `demandAccCopy`, `mainAccCopy`, `transferConsent`, `consentFile`을 추가했다.
- 약관 상세 route, 계약 체결 중간 route, depositTest route는 운영 분류/안내 화면으로 연결했다.

### 변경 파일

- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/src/cubici_service/documents/repository.py`
- `user-web/src/App.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/tests/e2e/moneybank-request-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_PARALLEL_WORK_PLAN.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- `service-api/tests/test_domain_routes.py`: `63 passed`.
- `user-web` production build: 통과.
- `moneybank-request-db-e2e.spec.js`: `2 passed`.
- 사용자단 전체 DB E2E suite: `10 passed`.
- build 경고의 `/resources/...` 정적 자산 미해결 메시지는 legacy runtime asset 경로 유지로 인한 기존 경고다.

### 남은 차이

- 약관 상세는 현재 운영 테스트용 요약본이다. legacy 전문을 법무/운영 검수 후 확정본으로 이관해야 한다.
- B2B몰 ID는 현재 별도 DB 컬럼이 없어 화면 입력/검증까지만 반영했다. 저장 정책 확정 시 계약 부가정보 테이블 또는 신청 메모 테이블이 필요하다.
- `depositTest`는 사용자 일반 기능이 아니라 관리자 상환입금/연장 테스트성 화면으로 분류했다.

### 다음 액션

- 사용자 Q&A 수정/삭제를 실제 DB API/E2E로 구현한다.
- 약관 전문 이관 범위와 B2B몰 신청 부가정보 저장 정책을 확정한다.

## 2026-07-26 추가 작업 19

### 작업 결과

- Sub Agent 병렬 조사로 legacy 신청/계약 관련 약관, 상태 redirect, 본인확인, 전자서명 기준을 재확인했다.
- moneybank 약관 전문 위치는 `src/main/webapp/WEB-INF/jsp/egovframework/azon/cubici/moneybank/clauseDetails/details1~4.jsp`로 확인했다.
- 회원가입 약관 위치는 `home/agree1~3.jsp`이며, `mainSignUp.jsp`에서 include되는 구조로 확인했다.
- 상태별 redirect 기준은 legacy `MoneybankCmmService.setUrlByMbStatus`에 따라 `ROLE_MB_EVALUATE`, `ROLE_MB_CONTRACT`, `ROLE_MB_REQUEST`가 각각 평가, 계약, 신청 화면으로 분기된다.
- legacy 신청 화면의 본인확인은 주민등록증/운전면허증 입력 후 Hyphen 본인확인 API를 호출하는 구조로 확인했다.
- 신청 승인은 공동인증 전자서명 popup에서 `signCert`, `signPri`, `signPw`와 계좌/서류 정보를 POST하는 구조로 확인했다.
- React 사용자 웹에는 모바일 legacy route alias와 모바일 E2E를 추가해 `/m/...` 주요 경로가 사용자 페이지로 표시되도록 했다.
- 신청 E2E는 화면 메시지 대신 계약 생성과 제출서류 파일 저장 API 결과를 기준으로 검증하도록 보정했다.

### 변경 파일

- `user-web/src/App.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/scripts/run-playwright-e2e.mjs`
- `user-web/tests/e2e/mobile-legacy-routes-db-e2e.spec.js`
- `user-web/tests/e2e/account-mypage-db-e2e.spec.js`
- `user-web/tests/e2e/moneybank-request-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_PARALLEL_WORK_PLAN.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- 사용자단 전체 DB E2E suite: `11 passed`.
- `service-api/tests/test_domain_routes.py`: `65 passed`.
- `moneybank-request-db-e2e.spec.js` focused 재검증: `2 passed`.
- 모바일 legacy route E2E 포함 production build 검증 완료.

### 남은 차이

- 약관 화면은 아직 legacy 전문 전체 이관 전이다.
- 주민등록증/운전면허증 본인확인, 공동인증 전자서명은 현재 운영 재현용 mock/단계 표시 수준이며 legacy API 실호출 구조와 동일하다고 볼 수 없다.
- legacy 외부 callback은 일반 callback 서버보다 JSP AJAX/전자서명 popup 연계 성격이 강한 것으로 보이나, 이는 추가 검증 전까지 추정이다.
- 모바일 경로는 표면 route 중심으로 대응했으며, 모바일 전용 화면 레이아웃 1:1 복원은 아직 아니다.

### 다음 액션

- `details1~4.jsp`, `agree1~3.jsp` 기준 약관 전문을 React 약관 화면에 반영한다.
- 본인확인/운전면허 확인/공동인증 전자서명은 실호출 없는 내부 테스트 모드와 운영 실연동 모드를 분리해 설계한다.
- 사용자 계약 상태별 redirect와 화면 전환을 legacy 상태값 기준으로 추가 검증한다.

## 2026-07-26 추가 작업 20

### 작업 결과

- 머니뱅크 신청 약관 `details1~4.jsp` 전문을 사용자 React 화면에 이관했다.
- 이관 대상은 개인(신용)정보 수집·이용, 개인(신용)정보 제공, 개인(신용)정보 조회, 선정산 서비스 약관이다.
- 약관 화면에서 더 이상 운영 테스트용 요약본 안내가 표시되지 않도록 변경했다.
- E2E에서 각 약관의 legacy 핵심 문구를 확인하도록 보강했다.

### 변경 파일

- `user-web/src/shared/legacyMoneybankClauses.js`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/tests/e2e/moneybank-request-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_PARALLEL_WORK_PLAN.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- `moneybank-request-db-e2e.spec.js`: `3 passed`.
- 사용자단 전체 DB E2E suite: `12 passed`.
- `service-api/tests/test_domain_routes.py`: `65 passed`.

### 남은 차이

- 회원가입 약관 `agree1~3.jsp`는 아직 React 회원가입 화면에 전문 이관 전이다.
- 주민등록증/운전면허증 본인확인과 공동인증 전자서명은 아직 legacy와 동일한 입력/검증/상태 저장 구조가 아니다.
- 상태별 중간 redirect는 아직 legacy `MoneybankCmmService.setUrlByMbStatus`와 완전 동일하지 않다.

### 다음 액션

- 상태별 중간 route와 신청/심사/계약 화면 전환을 legacy 기준으로 맞춘다.
- 본인확인/운전면허 확인 UI와 내부 mock 검증 상태 저장을 구현한다.

## 2026-07-26 추가 작업 21

### 작업 결과

- `requestForm.jsp`의 주민등록증/운전면허증 본인확인 흐름을 React 신청 화면에 mock 테스트 모드로 구현했다.
- 사용자는 확인 방식, 생년월일, 주민등록증 발급정보 또는 운전면허번호를 입력한 뒤 mock 확인을 실행한다.
- 신청 API는 `identity_confirmed=True`만으로는 접수하지 않고, mock/실확인 method와 status가 있어야 접수하도록 강화했다.
- 계약 상세 API 응답에 본인확인 method/status/reference/verified_at을 포함했다.
- `/moneybank/processContinue`, `/moneybank/processEnd` 중간 route를 React에 추가했다.

### 변경 파일

- `db/postgres/migrations/017_moneybank_user_identity_verification.sql`
- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/tests/test_domain_routes.py`
- `service-api/tests/test_contract_lifecycle_db_e2e.py`
- `user-web/src/App.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/tests/e2e/moneybank-request-db-e2e.spec.js`
- `user-web/tests/e2e/moneybank-terms-db-e2e.spec.js`
- `user-web/tests/e2e/moneybank-user-termination-db-e2e.spec.js`
- `.docs/2026-07-25_CUBICI_USER_PARALLEL_WORK_PLAN.md`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- `service-api/tests/test_domain_routes.py`: `65 passed`.
- `service-api/tests/test_contract_lifecycle_db_e2e.py`: `2 passed`.
- 사용자단 전체 DB E2E suite: `12 passed`.

### 남은 차이

- 현재 본인확인은 `mock_verified`이며 실제 Hyphen API 호출 결과가 아니다.
- 본인확인 입력값 원문은 저장하지 않고 mock reference만 저장한다.
- 공동인증 전자서명 popup의 `signCert`, `signPri`, `signPw` 전송 흐름은 아직 구현 전이다.
- evaluate 전용 legacy 화면은 현재 계약 상세/이용조건 확인 화면으로 흡수되어 있다.

### 다음 액션

- 공동인증 전자서명 내부 테스트 모드와 계약 승인 상태 저장을 구현한다.
- 회원가입 약관 전문 이관을 진행한다.

## 2026-07-26 추가 작업 22

### 작업 결과

- 이용조건 동의 이후 공동인증 전자서명 단계를 내부 테스트 모드로 구현했다.
- 사용자 계약 상세 화면에 `공동인증 전자서명` 패널을 추가했다.
- 전자서명 mock 저장 시 계약 상태를 `USE_AGREE`에서 `ACCOUNT_STANDBY`로 전환한다.
- 전자서명 method/status/reference/signed_at을 계약 상세 API와 화면에 표시한다.
- 상태 이력에는 `electronic_signature` action을 남긴다.
- 실제 인증서, 개인키, 비밀번호 원문은 저장하지 않는다.

### 변경 파일

- `db/postgres/migrations/018_moneybank_contract_electronic_signature.sql`
- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/contracts.py`
- `service-api/tests/test_domain_routes.py`
- `service-api/tests/test_contract_lifecycle_db_e2e.py`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/tests/e2e/moneybank-terms-db-e2e.spec.js`

### 검증 여부

- `service-api/tests/test_domain_routes.py`: `66 passed`.
- `service-api/tests/test_contract_lifecycle_db_e2e.py`: `2 passed`.
- `moneybank-terms-db-e2e.spec.js`: `1 passed`.

### 남은 차이

- 실제 Hyphen/공동인증 실호출은 아직 연결하지 않았다.
- legacy popup의 `signCert`, `signPri`, `signPw` 전송 구조는 운영 실연동 단계에서 별도 설계가 필요하다.
- 현재는 운영 재현 테스트를 위한 mock reference만 저장한다.

### 다음 액션

- 회원가입 약관 `agree1~3.jsp` 전문 이관을 진행한다.
- 상태별 redirect/evaluate 화면의 legacy 세부 정책을 추가 보정한다.
- 전체 E2E suite 안정화를 별도 작업으로 처리한다.

## 2026-07-26 추가 작업 23

### 작업 결과

- 전자서명 저장 요청을 사용자 인증 세션 기반 호출로 통일했다.
- 해지신청 저장 후 상세 재조회가 지연되어도 화면이 계속 `해지신청 중`으로 멈추지 않도록 로컬 계약 상태를 먼저 반영한다.
- 공통 JSON 쓰기 요청에 timeout 처리를 추가했다.

### 변경 파일

- `user-web/src/shared/UserCore.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `.docs/2026-07-25_CUBICI_USER_CONTRACT_FLOW.md`

### 검증 여부

- `user-web` production build: 통과.
- `service-api/tests/test_domain_routes.py`: `66 passed`.
- focused E2E는 PostgreSQL connection timeout으로 fixture 생성 단계에서 실패했다.

### 남은 차이

- 실제 공동인증/Hyphen 호출은 아직 mock 단계다.
- 전체 E2E는 DB 연결 안정화 후 다시 실행해야 한다.

### 다음 액션

- PostgreSQL 연결 timeout 정리 후 전체 사용자단 E2E를 재실행한다.
