# Cubici 관리자단 Moneybank 운영 영역 미완 기능 Inventory

## 작업 목적

- 관리자단 전체 E2E 전에 Moneybank 운영 영역의 미완 기능 inventory를 먼저 확정한다.
- 화면 표시 여부가 아니라 운영 재현 기준으로 완료율을 보수적으로 산정한다.
- 이후 사용자단 작업처럼 Sub Agent 병렬 개발이 가능한 단위를 분리한다.

## 조사 범위

- React 관리자 화면: `admin-web/src/pages/*`, `admin-web/src/App.jsx`
- 관리자 API client: `admin-web/src/api/*`
- Python API endpoint: `service-api/src/cubici_service/api/v1/endpoints/*`
- 관리자 focused E2E: `admin-web/tests/e2e/*`
- 기존 진행 문서: `Cubici/docs`, `Cubici/.docs`
- 전체 E2E는 실행하지 않았다.

## 보수적 산정 기준

| 기준 | 반영 방식 |
|---|---|
| 화면 표시 | 낮은 가중치 |
| DB/API 연결 | 중간 가중치 |
| 저장/상태변경 | 높은 가중치 |
| legacy 정책/산식 재현 | 높은 가중치 |
| focused E2E | 중간 가중치 |
| 전체 관리자단 E2E | 이번 inventory 단계에서는 미반영 |
| 운영 데이터 반복 검수 | 미완으로 본다 |

## 기능별 Inventory

| 기능 | legacy 재현 수준 | DB/API 연결 | 저장/상태변경 | focused E2E 여부 | 보수 완료율 | 남은 개발/검수 | 병렬 개발 가능성 |
|---|---|---|---|---|---:|---|---|
| 신청/상태 관리 | 부분 재현 | `contracts` 목록/상세/상태 API 연결 | 승인, 반려, 서류보완, 해지 등 일부 액션 구현 | `contract-request`, `moneybank-full-lifecycle`, `exception-status`, `termination-status` 계열 존재 | 70~74% | legacy 숫자 상태와 신규 문자열 상태 매핑, 상태별 버튼 노출, 권한, 예외 상태 최종 검수 | 제한적 가능. 계약 상태 공통 로직과 충돌 위험이 있어 단독 Agent가 맡는 편이 안전 |
| 심사 승인/조건 제시 | 부분 재현 | `contracts`, `risk_results`, `review_notes`, 수수료 조정 API 연결 | 조건 저장, 수수료 조정, 메모 저장 구현 | 계약 lifecycle/문서확인 focused 검증 존재 | 68~72% | legacy 심사 항목, 조건 제시 기준, 반려/보완 사유, audit 이력 보강 | 신청/계약 상태 Agent와 같은 축으로 묶는 것이 안전 |
| 계약 관리 | 부분 재현 | 계약 목록/상세, 상태변경 API 연결 | 계약대기/체결 준비 일부 구현 | `moneybank-contract-flow`, `moneybank-contract-db-e2e` 존재 | 66~70% | 계약서/전자서명 실연동 제외 범위 명시, 계약 상태 예외, 수수료 회차 정책 검수 | 신청/심사와 상태 테이블을 공유하므로 병렬 분리 비추천 |
| 제출서류 관리 | 부분 재현 | 제출서류 파일 목록/업로드/확인값 API 연결 | 파일 업로드, 확인값 저장, 제출완료 처리 구현 | `contract-documents`, `contract-document-review`, `document-supplement` 계열 존재 | 66~70% | 파일 종류별 필수 여부, 보관/다운로드 권한, 운영 문서 검수, audit 보강 | 계약 상태 Agent와 협업 가능하나 파일 API만 분리 가능 |
| 정산 관리 | 조회 중심 부분 재현 | `settlements` 목록/상세 API 연결 | 저장/수정 기능은 현재 핵심 범위 아님 | `settlement-management.spec.js`는 mock route 기반 확인 | 58~63% | `settlement_amount` 원천 batch/legacy 산출 로직 대조, DB 기반 focused E2E 보강, Excel/export 정책 | 독립 Agent 가능 |
| 상환/지급 관리 | 부분 재현 | `redemptions` 목록/상세/작업이력/지급/상환/취소 API 연결 | 지급/상환 생성, 작업 취소, 잔액 재계산 구현 | UI mock E2E와 service-api 취소 검산 테스트 존재 | 62~67% | 입금/지급/상환 대사 정책, 과거 취소 후 후속 원장 재계산, 전체 DB reconciliation SQL, 미상환잔액 해지 정책 | 정산 Agent와 병렬 가능하나 잔액 산식은 단독 소유 필요 |
| 송금요청/Hyphen mock | mock 중심 부분 재현 | `fintech` status/list/detail/mock API 연결 | mock 송금요청/응답/결과조회 저장 구현 | 전용 mock UI script와 문서 존재, 전체 E2E는 미실행 | 52~58% | 성공/실패/재조회 정책 라벨 UI, 상환/지급 반영 전 대사 화면, 실 Hyphen/은행 API는 2차 제외 | 독립 Agent 가능 |
| Moneybank 통합정보 | 요약 화면 중심 부분 재현 | `management/overview` API 재사용 | 저장 기능 없음 | `integrated-info.spec.js` 존재하나 mock 기반 | 56~62% | legacy chart/procedure 산식 대조, 기간/그룹핑 기준 검산, DB 기반 focused E2E 보강 | 독립 Agent 가능 |
| 머니뱅크 이용상세/관리 현황 | 부분 재현 | `management/usage`, `management/usage/{mbid}` API 연결 | 저장 기능 없음 | 관련 화면 테스트 일부 존재 | 60~66% | 이용상세 탭별 legacy 항목 누락 대조, 상환/정산/계약 연결값 검산 | 통합정보 Agent와 묶어 진행 가능 |

## 1차 개발 범위 확정

1차 관리자 Moneybank 운영 재현 범위는 다음으로 잡는다.

| 우선순위 | 작업 | 이유 |
|---:|---|---|
| 1 | 신청/심사/계약/서류 상태 workflow 정밀 보정 | 실제 운영에서 상태 변경 오류가 가장 큰 리스크 |
| 2 | 상환/지급 취소/잔액 재계산 검산 보강 | 금액/잔액 오류가 금융 운영 리스크로 직결 |
| 3 | 정산 산식과 batch 원천 대조 | 화면 조회는 됐지만 원천 산출 정책 검증이 부족 |
| 4 | Hyphen mock 결과 정책/대사 UI 보강 | 실연동 전에도 운영 판단 라벨과 대사 기준은 필요 |
| 5 | Moneybank 통합정보/이용상세 산식 대조 | dashboard 숫자 신뢰성 확보 필요 |

## 2차 개발 범위로 분리

다음은 이번 1차 구현 범위에서 제외하고 운영 단계 또는 2차 개발 범위로 둔다.

- Hyphen/경남은행 실 API 호출
- 실제 이체 실행, 입금대사 자동 반영
- 공동인증/전자서명 실연동
- 외부 쇼핑몰 API 실연동
- 운영 서버 metric 직접 수집
- 결제 PG 실취소/환불 실연동

## Sub Agent 병렬 분배안

| Agent | 담당 범위 | 주요 파일 | 검증 방식 | 병렬성 판단 |
|---|---|---|---|---|
| Admin Moneybank State Agent | 신청/상태/심사/계약/서류 workflow | `AdminDashboardPage.jsx`, `ApprovalManagementPage.jsx`, `ContractManagementPage.jsx`, `contracts.py`, `contracts/repository.py`, `contractStatus.js` | 상태변경 API/domain test + 해당 화면 focused E2E | 단독 진행 권장. 상태 공통 로직 충돌 가능 |
| Admin Settlement Agent | 정산 목록/상세/산식/batch 원천 대조 | `SettlementManagementPage.jsx`, `settlements.py`, `settlements/repository.py` | DB preflight + 정산 row count/amount 검산 + focused 화면 테스트 | 병렬 가능 |
| Admin Redemption Agent | 지급/상환/취소/잔액 검산 | `RedemptionManagementPage.jsx`, `redemptions.py`, `redemptions/repository.py` | API/domain test + 취소/재계산 focused 검증 | 병렬 가능. Settlement Agent와 산식 문서 공유 필요 |
| Admin Fintech Mock Agent | 송금요청/Hyphen mock/결과정책/대사 표시 | `FintechTradeRequestPage.jsx`, `fintech.py`, `fintech/repository.py` | mock 저장 API focused test + mock UI focused test | 병렬 가능 |
| Admin Moneybank Integrated Agent | 통합정보/이용상세 chart·grouping 대조 | `MoneybankIntegratedInfoPage.jsx`, `ManagementUsagePage.jsx`, `ManagementUsageDetailPage.jsx`, `management.py` | DB 집계 SQL 대조 + focused 화면 테스트 | 병렬 가능 |

## 병렬 진행 시 주의점

- `moneybank_contract.status`, `moneybank_contract_fee`, `moneybank_contract_document`는 상태/계약 Agent가 단독 소유한다.
- 상환/정산 Agent는 같은 금액 테이블을 읽더라도 상태 변경 API는 수정하지 않는다.
- Fintech Agent는 mock 저장과 결과정책 라벨까지만 다루고, 실이체 반영은 하지 않는다.
- 각 Agent는 전체 E2E를 실행하지 않고 변경 범위 focused 검증만 수행한다.
- Master Agent가 완료 보고를 취합해 전체 관리자단 milestone E2E 실행 여부를 최종 결정한다.

## 현재 보수 진행률

| 구분 | 완료율 |
|---|---:|
| Moneybank 운영 화면 표시 | 72~78% |
| Moneybank DB/API 연결 | 68~74% |
| 저장/상태변경 workflow | 58~66% |
| legacy 정책/산식 재현 | 52~60% |
| focused 검증 | 58~65% |
| Moneybank 운영 영역 전체 | 62~68% |

## 다음 액션

1. Master Agent가 전체 관리자단 inventory 문서에 이 Moneybank inventory를 병합한다.
2. Sub Agent 사용 가능 환경에서는 위 5개 Agent 중 `State Agent`를 제외한 4개를 병렬 실행한다.
3. `State Agent` 결과가 확정된 뒤 계약/해지 상태 관련 변경을 병합한다.
4. 모든 focused 검증 완료 후 관리자단 전체 E2E milestone을 1회 실행한다.

