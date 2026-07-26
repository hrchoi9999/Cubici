# Cubici Admin Batch File Ownership Plan

## 목적

관리자단 일괄 개발을 Sub Agent 방식으로 진행할 때 파일 충돌과 병합 지연을 줄이기 위해 작업군별 파일 소유권을 고정한다.

## 기본 원칙

- 개발 중 `git add`, `git commit`, `git push`는 하지 않는다.
- 기능별 검증은 focused test만 수행한다.
- 관리자단 전체 E2E는 1차 구현 완료 후 milestone에서 1회만 실행한다.
- 한 Agent는 지정된 소유 파일만 수정한다.
- 공통 파일 수정이 필요하면 Master Agent가 먼저 승인하고 직접 반영한다.
- 같은 repository module을 여러 Agent가 동시에 수정하지 않는다.
- DB schema 변경은 Master Agent가 migration 파일 번호와 적용 순서를 정한 뒤 진행한다.

## 공통 파일 소유권

다음 파일은 Master Agent 전용이다.

| 파일 | 사유 |
| --- | --- |
| `admin-web/src/App.jsx` | 전체 route 분기 충돌 위험 |
| `admin-web/src/components/layout/AdminLayout.jsx` | 전체 메뉴/사이드바 충돌 위험 |
| `admin-web/src/styles/admin-web.css` | 모든 화면 layout에 영향 |
| `admin-web/scripts/run-playwright-e2e.mjs` | 전체 E2E runner |
| `admin-web/playwright.config.js` | 전체 E2E 설정 |
| `service-api/src/cubici_service/api/v1/router.py` | API router 등록 충돌 위험 |
| `service-api/src/cubici_service/app.py` | FastAPI app 공통 설정 |
| `service-api/src/cubici_service/core/config.py` | DB/env 공통 설정 |
| `service-api/src/cubici_service/db/connection.py` | DB connection 공통 설정 |
| `db/postgres/schema/**` | 전체 schema 기준 |
| `docker-compose.dev.yml` | DB runtime 기준 |
| `AGENTS.md` | 운영 원칙 |

## 작업군별 소유권

### 1. Admin Moneybank State Agent

담당:

- 신청 접수
- 심사 승인
- 계약 관리
- 제출서류 확인
- 계약 상태/버튼/권한/예외 workflow

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/AdminDashboardPage.jsx` |
| Frontend page | `admin-web/src/pages/ApprovalManagementPage.jsx` |
| Frontend page | `admin-web/src/pages/ContractManagementPage.jsx` |
| Frontend API | `admin-web/src/api/contracts.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/contracts.py` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/documents.py` |
| Backend domain | `service-api/src/cubici_service/contracts/repository.py` |
| Backend domain | `service-api/src/cubici_service/documents/repository.py` |
| Focused E2E | `admin-web/tests/e2e/contract-request-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/contract-documents-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/contract-document-review-management.spec.js` |
| DB E2E | `admin-web/tests/e2e/moneybank-contract-db-e2e.spec.js` |
| DB E2E | `admin-web/tests/e2e/moneybank-contract-flow.spec.js` |
| DB E2E | `admin-web/tests/e2e/moneybank-full-lifecycle-db-e2e.spec.js` |
| DB E2E | `admin-web/tests/e2e/moneybank-document-supplement-db-e2e.spec.js` |
| DB E2E | `admin-web/tests/e2e/moneybank-exception-status-db-e2e.spec.js` |
| DB E2E | `admin-web/tests/e2e/moneybank-termination-status-db-e2e.spec.js` |
| API test | `service-api/tests/test_contract_lifecycle_db_e2e.py` |

제한:

- `RedemptionManagementPage.jsx`, `redemptions/repository.py`는 직접 수정하지 않는다.
- 상환/잔액 산식 변경이 필요하면 Redemption Agent와 Master Agent에 넘긴다.
- `App.jsx`, `AdminLayout.jsx`, `admin-web.css` 수정은 Master Agent만 수행한다.

### 2. Admin Settlement Agent

담당:

- 정산 목록/상세
- `settlement_amount` 원천 산식 대조
- 정산 focused 검증

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/SettlementManagementPage.jsx` |
| Frontend API | `admin-web/src/api/settlements.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/settlements.py` |
| Backend domain | `service-api/src/cubici_service/settlements/repository.py` |
| Focused E2E | `admin-web/tests/e2e/settlement-management.spec.js` |

제한:

- 상환 잔액 또는 지급/상환 이력 테이블은 직접 수정하지 않는다.
- 정산 산식이 상환 잔액에 영향을 주면 Master Agent에게 정책 결정을 요청한다.

### 3. Admin Redemption Agent

담당:

- 상환 관리
- 지급/상환 생성
- 취소/재계산
- 미상환잔액/해지 정책 검산

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/RedemptionManagementPage.jsx` |
| Frontend API | `admin-web/src/api/redemptions.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/redemptions.py` |
| Backend domain | `service-api/src/cubici_service/redemptions/repository.py` |
| Focused E2E | `admin-web/tests/e2e/redemption-management.spec.js` |
| API test | `service-api/tests/test_redemption_operation_cancel_e2e.py` |

제한:

- 계약 상태 변경 API는 직접 수정하지 않는다.
- 상환 취소가 계약 해지 상태와 연결되면 Master Agent가 정책을 결정한다.

### 4. Admin Fintech Mock Agent

담당:

- 펌뱅킹 전문 조회
- Hyphen/은행 mock 송금요청
- mock 응답/결과조회
- 실송금 제외 라벨

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/FintechTradeRequestPage.jsx` |
| Frontend API | `admin-web/src/api/fintech.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/fintech.py` |
| Backend domain | `service-api/src/cubici_service/fintech/repository.py` |

제한:

- Hyphen/경남은행 실 API 호출은 2차 범위다.
- 계좌정보, 인증키, 실제 전문 식별정보는 코드/문서/로그에 기록하지 않는다.

### 5. Admin Integrated Management Agent

담당:

- 큐빅아이 통합정보
- 머니뱅크 통합정보
- 머니뱅크 통합 현황
- 이용상세/상세 화면
- shop grouping/통계 산식 대조

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/CubiciIntegratedInfoPage.jsx` |
| Frontend page | `admin-web/src/pages/MoneybankIntegratedInfoPage.jsx` |
| Frontend page | `admin-web/src/pages/ManagementOverviewPage.jsx` |
| Frontend page | `admin-web/src/pages/ManagementUsagePage.jsx` |
| Frontend page | `admin-web/src/pages/ManagementUsageDetailPage.jsx` |
| Frontend API | `admin-web/src/api/management.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/management.py` |
| Backend domain | `service-api/src/cubici_service/management/repository.py` |
| Focused E2E | `admin-web/tests/e2e/integrated-info.spec.js` |

제한:

- 회원/결제 상태 변경은 Member Billing Agent 소유다.
- 계약 상태 변경은 Moneybank State Agent 소유다.

### 6. Admin Member Billing Agent

담당:

- 회원현황
- 회원정보
- 휴면/해지
- 결제현황
- 요금변경/환불

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/MemberSummaryPage.jsx` |
| Frontend page | `admin-web/src/pages/MemberInfoPage.jsx` |
| Frontend page | `admin-web/src/pages/MemberWithdrawalPage.jsx` |
| Frontend page | `admin-web/src/pages/MemberStatusPage.jsx` |
| Frontend page | `admin-web/src/pages/MemberPaymentPage.jsx` |
| Frontend page | `admin-web/src/pages/MemberChargeChangePage.jsx` |
| Frontend API | `admin-web/src/api/management.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/management.py` |
| Backend domain | `service-api/src/cubici_service/management/repository.py` |
| Focused E2E | `admin-web/tests/e2e/member-summary-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/member-info-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/member-withdrawal-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/member-status-detail.spec.js` |
| Focused E2E | `admin-web/tests/e2e/member-payment-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/member-charge-change-management.spec.js` |

제한:

- `management.py`, `management/repository.py`, `management.js`는 Integrated Management Agent와 공유 충돌 위험이 있다.
- 두 Agent를 동시에 실행할 경우 같은 파일을 동시에 수정하지 않도록 Master Agent가 순서를 분리한다.
- 환불 실 PG 연동은 2차 범위다.

### 7. Admin Preference Prism Agent

담당:

- 관리자 등록
- 요금제 관리
- 연계코드/프로모션
- 협력사 관리
- 금융상품 관리
- Prism System
- Raw Data 설정

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/AdminAccountManagementPage.jsx` |
| Frontend page | `admin-web/src/pages/ChargeManagementPage.jsx` |
| Frontend page | `admin-web/src/pages/PromotionManagementPage.jsx` |
| Frontend page | `admin-web/src/pages/PartnerManagementPage.jsx` |
| Frontend page | `admin-web/src/pages/MoneybankProductPreferencePage.jsx` |
| Frontend page | `admin-web/src/pages/PrizmConfigPage.jsx` |
| Frontend page | `admin-web/src/pages/RawDataConfigPage.jsx` |
| Frontend API | `admin-web/src/api/preferences.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/preferences.py` |
| Backend domain | `service-api/src/cubici_service/preferences/repository.py` |
| Focused E2E | `admin-web/tests/e2e/admin-account-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/charge-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/promotion-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/partner-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/moneybank-product-preference.spec.js` |
| Focused E2E | `admin-web/tests/e2e/prizm-config.spec.js` |
| Focused E2E | `admin-web/tests/e2e/raw-data-config.spec.js` |

제한:

- 금융상품 master row가 0인 상태이므로 fixture 부족과 기능 실패를 분리한다.
- Alt_CSM score 재산출 연동은 2차 범위다.

### 8. Admin Support Monitoring Agent

담당:

- 고객문의
- 문자/이메일 템플릿
- 고객 공지/FAQ
- Error Log
- 서버 관리

소유 파일:

| 영역 | 파일 |
| --- | --- |
| Frontend page | `admin-web/src/pages/CustomerInquiryPage.jsx` |
| Frontend page | `admin-web/src/pages/MessageTemplatePage.jsx` |
| Frontend page | `admin-web/src/pages/CustomerBoardPage.jsx` |
| Frontend page | `admin-web/src/pages/ErrorLogPage.jsx` |
| Frontend page | `admin-web/src/pages/ServerMonitorPage.jsx` |
| Frontend API | `admin-web/src/api/support.js` |
| Frontend API | `admin-web/src/api/monitoring.js` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/support.py` |
| Backend endpoint | `service-api/src/cubici_service/api/v1/endpoints/monitoring.py` |
| Backend domain | `service-api/src/cubici_service/support/repository.py` |
| Backend domain | `service-api/src/cubici_service/monitoring/repository.py` |
| Focused E2E | `admin-web/tests/e2e/customer-inquiry-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/message-template-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/customer-board-management.spec.js` |
| Focused E2E | `admin-web/tests/e2e/error-log-monitoring.spec.js` |
| Focused E2E | `admin-web/tests/e2e/server-monitoring.spec.js` |

제한:

- 실제 SMS/email 발송은 2차 범위다.
- 외부 서버 metric 직접 수집은 2차 범위다.

## Migration 파일 소유권

| 범위 | 소유 Agent | 규칙 |
| --- | --- | --- |
| 계약/서류/상태 | Moneybank State Agent | Master Agent가 migration 번호를 지정한 뒤 작성 |
| 정산 | Settlement Agent | 산식 검산 SQL은 문서와 test를 함께 작성 |
| 상환/잔액 | Redemption Agent | 잔액 재계산 정책은 Master 승인 후 작성 |
| Fintech mock | Fintech Mock Agent | 실연동 secret 또는 실계좌 정보 금지 |
| 회원/결제 | Member Billing Agent | 결제 식별정보/카드정보 기록 금지 |
| 환경설정/Prism | Preference Prism Agent | master fixture 부족은 별도 문서화 |
| 고객/모니터링 | Support Monitoring Agent | 실제 발송/외부 metric 제외 |

## 병렬 실행 가능 조합

동시 실행 가능:

- Settlement Agent + Fintech Mock Agent + Preference Prism Agent + Support Monitoring Agent
- Redemption Agent + Preference Prism Agent + Support Monitoring Agent
- Member Billing Agent + Preference Prism Agent + Support Monitoring Agent

주의 필요:

- Integrated Management Agent와 Member Billing Agent는 `management.*` 파일을 공유하므로 동시 수정하지 않는다.
- Moneybank State Agent와 Redemption Agent는 계약 해지/잔액 정책에서 충돌 가능성이 있으므로 정책 변경 시 Master가 조정한다.
- Moneybank State Agent는 신청/심사/계약/서류 공통 상태 로직을 단독으로 처리한다.

## Sub Agent 완료 보고 형식

각 Sub Agent는 완료 시 다음 항목을 보고한다.

- `작업 결과`
- `변경 파일`
- `검증 여부`
- `다음 액션`
- `소유권 위반 여부`

## 다음 액션

1. 관리자단 일괄 구현 전 이 파일 소유권을 Sub Agent 지시문에 포함한다.
2. 첫 구현은 Moneybank State Agent 단독 작업으로 시작한다.
3. 이후 파일 충돌이 낮은 Settlement, Redemption, Fintech, Preference, Support 영역을 병렬 처리한다.
