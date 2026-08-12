# Cubici REL-1 릴리즈 준비 및 민감정보 점검

## 범위

- 기준일: 2026-08-12 KST
- 브랜치: `fix/cloudflare-admin-spa-routing`
- 원격: `https://github.com/hrchoi9999/Cubici.git`
- 기준 커밋: `e9ed8ae`
- 이번 Batch에서는 staging, commit, push, 운영 배포를 수행하지 않았다.
- 현재 작업 트리의 사용자 승인 변경은 보존했다.

## 변경 소유권

현재 변경은 선행 승인 Batch의 네 기능군과 REG-1 테스트 계약 보정으로 설명된다.

| 기능군 | 주요 변경 |
| --- | --- |
| Q&A | 사용자 server pagination, 사용자 수정 소유권, 관리자 답변 주체, 실DB lifecycle |
| 정산 | 쿠팡 원천 70% 검산과 `SOURCE_RECONCILED` 상태 |
| 통합원장 | 초기 이관 누적상환액 반영과 잔액 정합성 |
| legacy 산식 | replay 스크립트, 단위 테스트, 산식 기록 |
| REG-1 | 현재 UI/라우트 계약에 맞춘 E2E 보정과 DB E2E 실행 분리 |

설명되지 않는 제품 소스 변경은 확인되지 않았다. LV reference 이미지는 사용자가 승인한 로컬 증빙이므로 수정하거나 삭제하지 않았다.

## 변경 파일 현황

| 구분 | 수량 | 상태 |
| --- | ---: | --- |
| 제품 소스 | 9 | 릴리즈 후보 |
| 테스트 | 27 | 릴리즈 후보 |
| 산식 replay 스크립트 | 1 | 릴리즈 후보 |
| 비-reference 문서 | 기존 23 + 본 문서 1 | 12개 후보, 12개 제외 |
| LV reference 변경·미추적 | 554 | 전부 제외 |

미추적 LV reference는 552개, 76,119,881 bytes다. 구성은 PNG 494개, JPG 31개, HTML 25개, 기타 2개다. 별도로 기존 추적 PNG 2개가 수정 상태다.

## 민감정보 점검

| 검사 | 결과 |
| --- | --- |
| private key 본문 | 0건 |
| service account JSON 표식 | 0건 |
| PostgreSQL/MySQL 접속 URI | 0건 |
| Bearer 장기 토큰 | 0건 |
| 변경 텍스트의 credential assignment | 12개 파일 |
| 변경 텍스트의 email literal | 19개 파일 |
| 1 MiB 초과 비-reference 파일 | 0개 |

credential assignment 12건은 모두 E2E 파일의 `access_token` 테스트 fixture이며 값에 `test`, `e2e`, `local`, `mock`, `token` 표식이 있다. 제품 소스와 문서에서는 같은 패턴이 검출되지 않았다.

email literal은 E2E fixture와 관리자 계정 설정 문서에서 검출됐다. 테스트 파일은 fixture로 판정했고, `docs/2026-08-07_CUBICI_ADMIN_ACCOUNT_SETUP.md`는 운영 계정 문맥이므로 공개 staging에서 제외한다.

현재 추적 파일명 점검에서는 PostgreSQL schema/migration SQL과 `service-api/.env.example`만 위험 확장자·이름 규칙에 해당했다. DB dump, 실제 `.env`, private key, service-account JSON은 추적되지 않았다. `.gitignore`는 `.env`, `data_local`, DB backup/dump, legacy MySQL dump, service-account JSON을 차단한다.

## 릴리즈 후보

다음 승인 Batch에서는 아래 49개만 명시적으로 staging한다. 디렉터리 전체를 `git add`하지 않는다.

### 제품 소스 9개

- `admin-web/src/App.jsx`
- `admin-web/src/pages/CustomerInquiryPage.jsx`
- `admin-web/src/pages/ManagementOverviewPage.jsx`
- `admin-web/src/pages/MoneybankIntegratedInfoPage.jsx`
- `admin-web/src/pages/SettlementManagementPage.jsx`
- `service-api/src/cubici_service/core/access_control.py`
- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/settlements/repository.py`
- `user-web/src/pages/SupportPages.jsx`

### 테스트·검산 28개

- `admin-web/tests/e2e/adm-lv-08-settlement-management.spec.js`
- `admin-web/tests/e2e/admin-operational-flow-focused.spec.js`
- `admin-web/tests/e2e/batch11-3-admin-common-ui-smoke.spec.js`
- `admin-web/tests/e2e/batch11-4-admin-info-member-support-smoke.spec.js`
- `admin-web/tests/e2e/batch11-5-admin-moneybank-operation-smoke.spec.js`
- `admin-web/tests/e2e/contract-document-review-management.spec.js`
- `admin-web/tests/e2e/contract-documents-management.spec.js`
- `admin-web/tests/e2e/contract-request-management.spec.js`
- `admin-web/tests/e2e/customer-inquiry-management.spec.js`
- `admin-web/tests/e2e/ledger-opening-repayment.spec.js`
- `admin-web/tests/e2e/moneybank-contract-flow.spec.js`
- `admin-web/tests/e2e/qna-user-admin-db-e2e.spec.js`
- `admin-web/tests/e2e/raw-data-config.spec.js`
- `admin-web/tests/e2e/redemption-management.spec.js`
- `admin-web/tests/e2e/settlement-source-reconcile.spec.js`
- `service-api/tests/test_access_control.py`
- `service-api/tests/test_admin_api_auth.py`
- `service-api/tests/test_legacy_financial_formula_replay.py`
- `service-api/tests/test_management_ledger_reconciliation.py`
- `service-api/tests/test_settlement_amount_check.py`
- `service-api/tests/test_support_qna_lifecycle_db_e2e.py`
- `user-web/tests/e2e/account-mypage-db-e2e.spec.js`
- `user-web/tests/e2e/m1-1-usr-main-auth-pc-visual.spec.js`
- `user-web/tests/e2e/m1-19-usr-qa-list-candidate.spec.js`
- `user-web/tests/e2e/qna-server-pagination-db-e2e.spec.js`
- `user-web/tests/e2e/support-and-charge.spec.js`
- `user-web/tests/e2e/support-billing-detail-db-e2e.spec.js`
- `scripts/replay_legacy_financial_formulas.py`

### 공개 가능 기술 문서 12개

- `docs/2026-08-09_USR_QA_LIST_IMPLEMENTATION_RESULT.md`
- `docs/2026-08-11_CUBICI_LEGACY_FORMULA_CATALOG.md`
- `docs/2026-08-12_CUBICI_COUPANG_SETTLEMENT_SOURCE_RECONCILIATION.md`
- `docs/2026-08-12_CUBICI_LEDGER_OPENING_REPAYMENT_RECONCILIATION.md`
- `docs/2026-08-12_CUBICI_LV_REMAINING_WORK_REBASE.md`
- `docs/2026-08-12_CUBICI_PMS_SETTLEMENT_LEDGER_LEGACY_REPLAY.md`
- `docs/2026-08-12_CUBICI_QNA_1_OWNERSHIP_FIX.md`
- `docs/2026-08-12_CUBICI_QNA_2_DB_LIFECYCLE.md`
- `docs/2026-08-12_CUBICI_QNA_3_SERVER_PAGINATION.md`
- `docs/2026-08-12_CUBICI_REG_1_FULL_REGRESSION.md`
- `docs/2026-08-12_CUBICI_REL_1_RELEASE_SECURITY_REVIEW.md`
- `docs/reference/lv-ui/page-progress-register.md`

## 공개 staging 제외

다음 항목은 로컬에 보존하되 공개 Git 반영에서 제외한다.

- `docs/reference/lv-ui` 아래 미추적 파일 552개
- 수정된 기존 추적 PNG 2개
- 2026-07-31 디자인 자산 요청 문서
- 2026-08-06 Batch10/Batch11 내부 진행 문서 7개
- 2026-08-07 관리자 계정 설정 문서
- 2026-08-07 종료 상태 문서
- 2026-08-08 마스터 스레드 운영 문서
- 2026-08-10 로컬 폴더 인벤토리 문서
- `.env`, `data_local`, DB dump/backup, service-account JSON, 첨부 원본

LV reference에는 화면 캡처와 외주 원본 HTML이 포함돼 있어 개인정보·저작권·용량을 별도로 검토하기 전 공개 업로드하지 않는다.

## 릴리즈 근거

- Backend: 150 passed, 8 skipped
- 사용자 build: 성공
- 사용자 E2E: 105 passed, 13 skipped, fail 0
- 관리자 build: 성공
- 관리자 정식 E2E: 147 passed, 24 skipped, fail 0
- fixture 잔여: 0건
- 테스트 listener: 0건
- `git diff --check`: REG-1 통과

구형 관리자 반응형 강제 테스트는 12 passed, 12 failed이며 현재 정식 UI 계약과 분리된 테스트 부채다. 릴리즈 차단 사유로 보지는 않지만 삭제하지 않는다.

## REL-2 사전 커밋 검증

- 명시적 staging: 49개
- 구성: 제품 소스 9개, 테스트 27개, replay 스크립트 1개, 문서 12개
- 공개 제외 파일의 staging 혼입: 0개
- staged `diff --check`: 통과
- private key, service account, DB URI, Bearer 장기 토큰: 0건
- E2E synthetic `access_token`: 12개 테스트 파일
- staged 파일의 별도 unstaged 수정: 0개

위 검사를 통과한 동일 staging을 1회 commit/push 대상으로 확정했다. 실제 commit과 push 결과는 Git history와 REL-2 종료 보고를 기준으로 확인한다.

## 다음 Batch

Git 원격 반영 후 운영 배포와 운영 URL smoke를 `DEPLOY-1`로 분리한다.
