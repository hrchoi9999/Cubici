# 관리자단 1단계 Moneybank 상태 Workflow 반영 결과

## 범위

- 대상: 신청 접수, 심사 승인, 계약 관리의 계약 상태 workflow
- 제외: 정산 산식, 상환 잔액 재계산, Hyphen/은행 실연동, 상품 master 정책
- 기준: legacy `MbStatus` 흐름의 신청/서류확인/심사대기/조건/동의/계좌대기/계약/해지 상태

## 작업 결과

- `approve` 액션이 바로 계약완료로 이동하던 동작을 `PENDING_REVIEW` 전환으로 수정했다.
- `document_ready` 액션도 신청접수 복귀가 아니라 `PENDING_REVIEW` 전환으로 수정했다.
- 계약 체결은 `contract_ready` 또는 전자서명 흐름에서만 `ACCOUNT_STANDBY`로 이동하도록 분리했다.
- 상태 전이 허용 조건을 backend 공통 정책 함수로 정리했다.
- 관리자 신청 접수, 심사 승인, 계약 관리 화면의 상태 판정 기준을 frontend 공통 유틸로 통합했다.
- 신청 접수 상세의 상태 버튼은 현재 상태에서 가능한 액션만 표시하도록 변경했다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/contracts/repository.py` | 계약 상태 action map, legacy alias, 전이 검증 정책 보강 |
| `service-api/tests/test_contract_status_policy.py` | 상태 전이 정책 focused test 추가 |
| `service-api/tests/test_domain_routes.py` | `approve` 기대 상태를 `PENDING_REVIEW`로 수정 |
| `admin-web/src/utils/contractStatus.js` | 상태 label/판정 공통 유틸 확장 |
| `admin-web/src/pages/AdminDashboardPage.jsx` | 상태 액션 버튼 조건부 표시 및 label 수정 |
| `admin-web/src/pages/ApprovalManagementPage.jsx` | 심사 상태 판정 공통화 |
| `admin-web/src/pages/ContractManagementPage.jsx` | 계약 가능 상태 판정 공통화 |
| `admin-web/tests/e2e/contract-request-management.spec.js` | 신청 상태 변경 mock E2E 기대값 수정 |

## 검증 여부

| 검증 | 결과 |
| --- | --- |
| backend 상태 정책/라우트 focused test | 통과: 75 passed |
| 계약 lifecycle PostgreSQL DB E2E | 통과: 2 passed |
| 관리자 신청 접수 focused Playwright E2E | 통과: 1 passed |
| admin-web production build | 통과: focused E2E runner 내 build 완료 |

## 보수적 완료율 갱신

| 메뉴 | 이전 보수 완료율 | 현재 보수 완료율 | 비고 |
| --- | ---: | ---: | --- |
| 신청 접수 | 72% | 76% | 상태 버튼/예외 흐름 일부 보강 |
| 심사 승인 | 72% | 75% | 조건 제시 전 단계 판정 공통화 |
| 계약 관리 | 70% | 73% | 체결 가능 상태 판정 공통화 |

관리자단 전체 운영 재현율은 아직 66~72% 수준으로 본다. 이번 작업은 Moneybank 상태 workflow의 일부 gap 해소이며, 전체 관리자단 완료율을 크게 올릴 단계는 아니다.

## 다음 액션

1. 정산 `settlement_amount` 원천 산식과 legacy batch/procedure 대조
2. 상환/해지/강제해지/미상환잔액 정책 검산
3. 결제현황/요금변경/환불 상태전이 보강
4. 각 기능은 focused test로 검증하고, 관리자단 전체 E2E는 milestone에서 1회 실행
