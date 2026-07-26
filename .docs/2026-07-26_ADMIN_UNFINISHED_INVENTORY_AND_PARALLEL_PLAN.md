# Cubici 관리자단 미완 기능 Inventory 및 병렬 개발 준비

## 목적

- 관리자단 전체 E2E를 먼저 실행하지 않고, 미완 기능 inventory를 확정한 뒤 기능 구현을 진행한다.
- 완료율은 화면 표시가 아니라 운영 재현 기준으로 보수적으로 산정한다.
- 기능 개발 중 검증은 focused test만 수행하고, 관리자단 전체 E2E는 milestone에서 1회 실행한다.

## 산정 기준

- 화면 표시: legacy 메뉴와 유사한 화면이 표시되는지
- DB/API 연결: 실제 PostgreSQL API와 연결되는지
- 저장/상태변경: 운영자가 실제 처리할 수 있는지
- legacy 정책 재현: 상태값, 버튼 노출, 산식, 예외 흐름이 legacy 정책과 맞는지
- 검증: focused E2E 또는 API/domain test가 있는지

## 관리자 메뉴 Inventory

| 대분류 | 최종 표시 메뉴 | 구현 화면 | E2E 파일 | 보수 완료율 | 미완 핵심 |
| --- | --- | --- | --- | ---: | --- |
| 통합정보 | 큐빅아이 | `CubiciIntegratedInfoPage` | `integrated-info.spec.js` | 66% | 집계 기준 상태 표시 보강, legacy 통계 procedure/shop grouping 대조 잔여 |
| 통합정보 | 머니뱅크 | `MoneybankIntegratedInfoPage` | `integrated-info.spec.js` | 67% | 집계 기준/잔액검산 상태 표시 보강, 계약/상환/정산 통계 산출 근거 대조 잔여 |
| 회원관리 | 회원현황 | `MemberSummaryPage`, `MemberInfoPage`, `MemberWithdrawalPage`, `MemberStatusPage` | `member-*.spec.js` | 64% | 수정/상태변경/audit, 미상환 해지 정책 |
| 회원관리 | 결제관리 | `MemberPaymentPage`, `MemberChargeChangePage` | `member-payment-management.spec.js`, `member-charge-change-management.spec.js` | 61% | 상태 라벨 1차 보강 완료, 실 PG/환불 연동 제외 범위 명확화 |
| 머니뱅크 관리 | 통합 현황 | `ManagementOverviewPage` | 없음 또는 간접 | 64% | 잔액검산 상태 표시 보강, 운영 지표 정의/통계 산식 대조 잔여 |
| 머니뱅크 관리 | 이용상세 | `ManagementUsagePage`, `ManagementUsageDetailPage` | 없음 또는 간접 | 62% | 상세 상태/금액/수수료 항목 legacy 대조 |
| 머니뱅크 운영 | 신청 접수 | `AdminDashboardPage` | `contract-request-*`, `moneybank-*-db-e2e` | 76% | 상태 버튼 1차 보강 완료, 권한/audit/legacy 예외 흐름 추가 대조 |
| 머니뱅크 운영 | 심사 승인 | `ApprovalManagementPage` | `moneybank-contract-*` | 75% | 조건 제시 전 단계 판정 보강, 심사항목/수수료 조건 legacy 대조 |
| 머니뱅크 운영 | 계약 관리 | `ContractManagementPage` | `moneybank-contract-*`, `moneybank-full-lifecycle-*` | 73% | 체결 가능 상태 판정 보강, 계약서/전자서명 실연동 제외 범위 명확화 |
| 머니뱅크 운영 | 정산 관리 | `SettlementManagementPage` | `settlement-management.spec.js` | 67% | 정산 검산 표시 완료, `settlement_amount` 원천 batch/procedure 대조 잔여 |
| 머니뱅크 운영 | 상환 관리 | `RedemptionManagementPage` | `redemption-management.spec.js` | 69% | 잔액 검산 표시 완료, 해지/강제해지 운영정책 반복 검수 잔여 |
| 머니뱅크 운영 | 프리즘 지표 관리 | `PrizmManagementPage` | 없음 또는 간접 | 58% | Alt_CSM score 경계, legacy 평가결과 표시 대조 |
| 고객관리 | 고객문의 | `CustomerInquiryPage` | `customer-inquiry-management.spec.js` | 73% | 답변 CRUD/후속상태 표시 보강, 알림/메일 실발송 잔여 |
| 고객관리 | 문자/이메일 | `MessageTemplatePage` | `message-template-management.spec.js` | 67% | 템플릿 CRUD/실발송 미연동/변수정책 상태 표시 보강, 실제 발송 연동 잔여 |
| 고객관리 | 고객 공지 관리 | `CustomerBoardPage` | `customer-board-management.spec.js` | 73% | 공지/FAQ CRUD/첨부·노출정책 상태 표시 보강, 첨부/팝업/상단고정 잔여 |
| 모니터링 | Error Log | `ErrorLogPage` | `error-log-monitoring.spec.js` | 68% | 처리상태/후속조치 표시 보강, 처리 완료 저장/alert 연계 잔여 |
| 모니터링 | 서버 관리 | `ServerMonitorPage` | `server-monitoring.spec.js` | 61% | metric source/후속조치 표시 보강, 외부 서버 metric source 연결 잔여 |
| 모니터링 | 펌뱅킹 전문 | `FintechTradeRequestPage` | `e2e-fintech-mock-ui.mjs` | 55% | Hyphen 실연동은 2차, 대사/정책 라벨 보강 |
| 환경설정 | 관리자 등록 | `AdminAccountManagementPage` | `admin-account-management.spec.js` | 66% | 권한/audit 상태 표시 보강, 실제 접근제어 엔진 잔여 |
| 환경설정 | 요금제 관리 | `ChargeManagementPage` | `charge-management.spec.js` | 64% | 운영 요금정책 반복 검증 |
| 환경설정 | 연계코드 관리 | `PromotionManagementPage` | `promotion-management.spec.js` | 60% | 적용/노출 정책 검수 |
| 환경설정 | 협력사 관리 | `PartnerManagementPage` | `partner-management.spec.js` | 66% | 담당자 정합성 표시 보강, 금융상품 연결 정책 잔여 |
| 환경설정 | 머니뱅크 관리 | `MoneybankProductPreferencePage` | `moneybank-product-preference.spec.js` | 60% | master 미적재/조건상태 표시 보강, 상품 seed 데이터 잔여 |
| 환경설정 | Prism System | `PrizmConfigPage`, `RawDataConfigPage` | `prizm-config.spec.js`, `raw-data-config.spec.js` | 62% | 설정 미완성/공식 연결상태 표시 보강, 산식/Alt_CSM 연동 경계 잔여 |

## 전체 완료율

- 화면 migration: 75~80%
- DB/API 연결: 70~75%
- 저장/변경 workflow: 60~68%
- legacy 정책 재현: 55~62%
- E2E/운영 검수: 45~55%
- 관리자단 전체 운영 재현: 73~77%
- 1차 제외 항목을 제외한 관리자단 운영 재현: 84~88%

## 1차 개발 범위 확정 후보

### 최우선

1. 관리자 미완 route/detail inventory 확정
2. 머니뱅크 운영 상태 버튼/권한/예외 흐름 보강
3. 정산 `settlement_amount` 원천 batch/procedure 대조
4. 상환/해지/강제해지/미상환잔액 정책 확정 및 구현
5. 결제현황/요금변경/환불 상태전이 보강

### 다음

6. 금융상품/협력사 master 데이터 정합성 검수
7. 관리자 권한등급/audit/민감정보 노출 정책 정리
8. Prism/Raw data 설정 반영 검증
9. 통합정보 shop grouping/legacy 통계 procedure 대조
10. 서버관리/오류로그/알림 workflow 보강

### 2차 제외 또는 후순위

- Hyphen/경남은행 실송금 연동
- 실제 메일/SMS 발송
- 외부 쇼핑몰 API 실연동
- 운영 배포용 권한 체계 고도화
- 외부 서버 metric 수집
- 게시판 첨부파일 고도화, 팝업, 상단고정, 노출기간
- 금융상품 master 실데이터 확정/seed 생성
- Prism/RawData 실제 산식 운영 연동

## Sub Agent 병렬 분배안

| Agent | 담당 범위 | 산출물 | 충돌 위험 |
| --- | --- | --- | --- |
| Admin Moneybank Agent | 신청/심사/계약/서류/정산/상환/해지/펌뱅킹 mock | Moneybank 운영 gap 구현 및 focused E2E | 중간 |
| Admin Member Billing Agent | 회원현황/회원정보/해지/결제현황/요금변경 | 회원/결제 gap 구현 및 focused E2E | 낮음 |
| Admin Preference Prism Agent | 요금제/관리자/프로모션/협력사/금융상품/Prism/Raw data | 환경설정 gap 구현 및 focused E2E | 낮음 |
| Admin Support Monitoring Agent | 고객문의/게시판/템플릿/오류로그/서버관리 | 고객관리/모니터링 gap 구현 및 focused E2E | 낮음 |
| Master Agent | 공통 상태/권한/audit 정책, 문서 병합, 전체 E2E | 최종 통합/검증/진행률 관리 | 높음 |

파일 소유권 상세 기준은 `2026-07-26_CUBICI_ADMIN_FILE_OWNERSHIP_PLAN.md`를 따른다.
Sub Agent 병렬 작업 지시 시 해당 문서의 소유 파일과 제한 사항을 반드시 포함한다.

## Inventory 확정 근거

| 문서 | 담당 범위 | 상태 |
| --- | --- | --- |
| `2026-07-26_ADMIN_INVENTORY_MONEYBANK.md` | 신청/심사/계약/서류/정산/상환/펌뱅킹/머니뱅크 통합정보 | 완료 |
| `2026-07-26_ADMIN_INVENTORY_MEMBER_PREFERENCES.md` | 회원/결제/환경설정/Prism | 완료 |
| `2026-07-26_ADMIN_INVENTORY_SUPPORT_MONITORING_E2E.md` | 고객관리/모니터링/공통/E2E | 완료 |

Moneybank 신청/심사/계약/서류는 계약 상태 공통 로직과 충돌 위험이 커서 단독 작업으로 진행한다.
정산, 상환, Fintech mock, 통합정보 집계는 변경 파일을 분리해 병렬 작업할 수 있다.
회원/결제, 환경설정/Prism, 고객/모니터링은 Moneybank 상태 로직과 직접 충돌이 적어 병렬 작업 가능 영역으로 본다.

## 1단계 Moneybank 상태 Workflow 반영

- 결과 문서: `2026-07-26_ADMIN_BATCH_STAGE1_MONEYBANK_STATUS_RESULT.md`
- `approve`는 계약완료가 아니라 심사대기 전환으로 정정했다.
- 계약 체결은 `contract_ready`/전자서명 흐름에서만 계좌대기로 이동하도록 분리했다.
- 신청 접수, 심사 승인, 계약 관리 화면의 상태 판정 기준을 공통화했다.
- focused 검증은 backend 정책/라우트 75 passed, DB lifecycle 2 passed, 관리자 신청 접수 E2E 1 passed로 완료했다.

## 2단계 정산/상환/결제 일괄작업 반영

- 결과 문서: `2026-07-26_ADMIN_BATCH_STAGE2_SETTLEMENT_REDEMPTION_BILLING_RESULT.md`
- 정산 원본값은 보존하고 검산 금액/차이/상태를 추가했다.
- 상환 잔액은 `누적지급액 - 누적상환액 = 미상환잔액` 기준으로 검산 상태를 추가했다.
- 결제 현황에는 결제상태 라벨을, 요금변경 관리에는 환급상태 라벨을 추가했다.
- 요금변경 조회 SQL의 `like '%F%'` placeholder 오인 버그를 수정했다.
- focused 검증은 backend 71 passed, 1 skipped, 실제 DB API 조회 4개 endpoint 200, admin E2E 4 passed로 완료했다.

## 3단계 환경설정/Prism/Master 일괄작업 반영

- 결과 문서: `2026-07-26_ADMIN_BATCH_STAGE3_PREFERENCE_PRISM_MASTER_RESULT.md`
- 협력사 담당자 미지정 수와 행별 담당상태를 표시했다.
- 머니뱅크 금융상품 master 적재 상태와 조건 미완성 상태를 표시했다.
- 관리자 계정 권한범위/audit 상태를 표시했다.
- Prism 설정 미완성 수와 행별 설정상태를 표시했다.
- RawData 공식 연결상태를 표시했다.
- 실제 DB 기준 협력사 4건, 금융상품 master 0건, 관리자 0건, Prism 26건, RawData 공식 0건이다.
- focused 검증은 backend 69 passed, 실제 DB API 조회 6개 endpoint 200, admin E2E 5 passed로 완료했다.

## 4단계 통합정보 집계/검산 일괄작업 반영

- 결과 문서: `2026-07-26_ADMIN_BATCH_STAGE4_INTEGRATED_INFO_RESULT.md`
- 큐빅아이 통합정보에 PostgreSQL 직접집계/legacy procedure 대조 필요/shop grouping 대조 필요 상태를 표시했다.
- 머니뱅크 통합정보에 PostgreSQL 직접집계/legacy procedure 대조 필요/잔액검산 상태를 표시했다.
- 머니뱅크 관리 통합 현황에 집계 상태와 잔액검산 상태를 표시했다.
- 실제 DB 기준 잔액 검산은 `검산차이`, 차이금액은 `-43,050,505`로 확인했다.
- 이 차이는 취소/해지/상환취소 또는 legacy batch/procedure 산식 차이 가능성이 있어 운영 검수 항목으로 유지한다.
- focused 검증은 backend 69 passed, 실제 DB API 조회 2개 endpoint 200, integrated-info E2E 2 passed로 완료했다.

## 5단계 서버관리/Error Log Workflow 일괄작업 반영

- 결과 문서: `2026-07-26_ADMIN_BATCH_STAGE5_MONITORING_WORKFLOW_RESULT.md`
- Error Log에 조치필요 수, workflow 상태, 행별 처리상태, 후속조치, 원천테이블을 표시했다.
- 서버관리에 metric source, 외부 서버 metric 미연동 상태, 후속조치 라벨을 표시했다.
- 실제 DB 기준 Error Log는 0건이고, 최근 24시간 배치 성공/실패 로그도 0건이다.
- 서버 상태 follow-up은 `배치 스케줄 실행 여부 확인`으로 표시된다.
- focused 검증은 backend 69 passed, 실제 DB API 조회 2개 endpoint 200, monitoring E2E 2 passed로 완료했다.

## 6단계 고객관리/공지/템플릿 Workflow 일괄작업 반영

- 결과 문서: `2026-07-26_ADMIN_BATCH_STAGE6_SUPPORT_WORKFLOW_RESULT.md`
- 고객문의에 Workflow, 알림 미연동, 알림대기 수, 후속상태를 표시했다.
- 공지/FAQ에 첨부 미연동, 노출정책 확인, 상시노출 상태를 표시했다.
- 문자/이메일 템플릿에 실발송 미연동, 변수정책 확인, 템플릿 CRUD workflow를 표시했다.
- 실제 DB 기준 문의 1건, 공지 5건, FAQ 31건, 템플릿 8건을 확인했다.
- focused 검증은 backend 69 passed, 실제 DB API 조회 4개 endpoint 200, support E2E 3 passed로 완료했다.

## 7단계 D~H 마무리 기준 반영

- 결과 문서: `2026-07-26_ADMIN_BATCH_STAGE7_D_TO_H_CLOSURE_PLAN_RESULT.md`
- 알 수 없는 route가 구현 메뉴로 자동 대체되는 fallback을 제거했다.
- 미구현 route는 `Route 점검 / 미구현 경로`로 표시하고 진행률 산정에서 제외한다.
- 정산 원본값, 상환/지급 취소 재계산, 해지 상태 이벤트의 1차 완료 기준을 문서화했다.
- 실제 DB 통합 현황 잔액 검산 차이 `-43,050,505`는 운영 검수 항목으로 유지한다.
- Hyphen/은행, 외부 쇼핑몰, SMS/Email/Alert 실발송, 외부 서버 metric, 첨부/팝업/상단고정/노출기간, 금융상품 seed, Prism/RawData 실연동은 1차 제외 또는 후순위로 분리했다.
- 관리자단 전체 E2E milestone은 33 passed로 완료했다.

## 관리자 E2E Runner 준비

- `admin-web/scripts/run-playwright-e2e.mjs`에 DB preflight를 추가했다.
- `admin-web/scripts/run-playwright-e2e.mjs`에 production build를 추가했다.
- `admin-web/scripts/run-playwright-e2e.mjs`에 `CUBICI_RUN_DB_E2E=1` 기본 설정을 추가했다.
- `admin-web/scripts/run-playwright-e2e.mjs`는 stale server 재사용 방지를 위해 실행별 동적 포트를 사용한다.
- `admin-web/playwright.config.js`는 `CUBICI_ADMIN_BASE_URL`을 우선 사용한다.
- 관리자단 전체 E2E milestone 1회 실행 결과: 33 passed.

## 다음 액션

1. Moneybank 신청/심사/계약/서류 상태 공통 로직을 단독 작업으로 먼저 정리한다.
2. 정산 산식, 상환 산식, Fintech mock, 통합정보 집계는 병렬 구현 단위로 분리한다.
3. 회원/결제, 환경설정/Prism, 고객/모니터링은 독립 Agent 작업군으로 병렬 구현한다.
4. 각 기능은 focused API/E2E로 검증한다.
5. 주요 gap 해소 후 관리자단 전체 E2E milestone을 1회 실행한다.
