# Cubici 해지/상환 잔액 정책 재확인

## 작업 결과

- legacy 머니뱅크 해지 상태와 관리자 회원 해지 처리 흐름을 재확인했다.
- 현재 Python API의 해지 처리와 legacy 상태 체계 차이를 정리했다.
- 해지와 상환/잔액 검산은 같은 이벤트로 묶지 않고, 별도 정책으로 검증해야 한다고 판단했다.

## 확인한 legacy 근거

### 머니뱅크 계약 상태

legacy `MbStatus.java`에는 해지 관련 상태가 여러 개로 분리되어 있다.

- `31`: 중도해지
- `71`: 해지신청
- `72`: 본인해지
- `73`: 강제해지
- `82`: 계좌해지

현재 Python API는 관리자 해지 액션을 `SELF_TERMINATION` 단일 상태로 처리한다. 따라서 legacy 상태와 1:1 대응은 아직 완료된 상태가 아니다.

### 관리자 회원 해지 확인

legacy 관리자 휴면/해지 화면의 해지 확인은 `CBCI_USER`만 갱신한다.

- `WITHDRAW_YN = 'Y'`
- `WITHDRAW_DATE = now()`
- `UPD_DATE = now()`

이 처리에서 `MONEYBANK_USER_REQUEST` 상태나 상환 잔액을 직접 변경하는 근거는 확인되지 않았다.

### 머니뱅크 상환 상세 상태 변경

legacy `RedemService.updateStatus`는 전달된 상태명을 `MbStatus` 코드로 변환해 `MONEYBANK_USER_REQUEST.mb_status`를 변경한다.

- 본인해지(`72`)와 강제해지(`73`)는 `mb_termi_date`를 기록한다.
- 강제해지(`73`)는 사용자 타입을 `97`로 변경한다.
- 이 함수 안에서 상환/잔액을 자동 재계산하는 처리는 확인되지 않았다.

## 현재 Python 구현 상태

- `contracts.repository.update_contract_status`는 `cancel` 액션을 `SELF_TERMINATION`으로 저장하고 `cancel_request_date`를 기록한다.
- 현재 `cancel` 액션은 계약 상태 제한 없이 허용된다.
- `redemptions.repository.cancel_redemption_operation`은 지급/상환 작업 취소 시 누적 지급액, 누적 상환액, 미상환잔액을 재계산한다.
- 계약 해지와 상환 작업 취소는 현재 별도 API로 분리되어 있다.

## 정책 판단

- 해지는 계약 상태 이벤트로 보고, 상환/잔액 이력은 별도 원장성 이력으로 유지하는 것이 현재 legacy 근거에 더 가깝다.
- 해지 실행만으로 미상환잔액을 0으로 만들거나 상환 이력을 자동 삭제/수정해서는 안 된다.
- 미상환잔액이 있는 계약의 해지를 허용할지, 차단할지, 강제해지 상태로 분리할지는 운영 정책 확정이 필요하다.

## 구현 보류/재확인 항목

- `SELF_TERMINATION`을 legacy `31`, `71`, `72`, `73`, `82` 중 어떤 상태와 대응할지 확정해야 한다.
- 신청 초기 상태(`REQUEST`, `PENDING_DOCUMENTS`, `CONDITIONS_ACCEPT`, `USE_AGREE`)에서 해지를 허용할지 제한할지 확정해야 한다.
- 미상환잔액이 있는 계약의 해지 처리 정책을 확정해야 한다.
- 강제해지 시 사용자 타입 또는 서비스 권한을 별도로 변경할지 확정해야 한다.

## 제안

- 1차 구현에서는 관리자 해지 가능 상태를 운영 단계 상태로 제한한다.
- 제한 후보: `ACCOUNT_STANDBY`, `CONTRACT`, legacy `06`, `81`
- 신청/심사/동의 전 상태는 해지 대신 반려, 서류보완, 조건거부, 동의거부 흐름을 사용한다.
- 미상환잔액이 있는 계약은 우선 해지 가능 여부를 화면에 경고로 표시하고, 실제 차단 여부는 운영 정책 확정 후 API에 반영한다.

## 변경 파일

- `Cubici/.docs/2026-07-25_CUBICI_TERMINATION_REDEMPTION_POLICY_REVIEW.md`

## 검증 여부

- legacy Java/JSP/MyBatis 파일 기준으로 수동 확인했다.
- 코드 변경은 하지 않았으므로 build/E2E는 실행하지 않았다.

## 다음 액션

- 해지 가능 상태 제한을 Python API에 반영한다.
- 관리자 해지 버튼도 같은 제한 규칙을 표시/적용한다.
- 미상환잔액이 있는 해지 케이스는 정책 확정 후 별도 E2E로 고정한다.

## 2026-07-25 구현 반영

### 작업 결과

- Python API의 `cancel` 액션을 계약 운영 단계 상태에서만 허용하도록 제한했다.
- 허용 상태는 `ACCOUNT_STANDBY`, `CONTRACT`, legacy `06`, `81`로 제한했다.
- 관리자 신청/상태 상세 화면의 `해지` 버튼도 같은 상태에서만 표시되도록 조정했다.
- 신청/심사/조건/동의 전 상태는 해지 대신 반려, 서류보완, 조건거부, 동의거부 흐름을 사용하도록 방어했다.

### 변경 파일

- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/tests/test_contract_lifecycle_db_e2e.py`
- `admin-web/src/utils/contractStatus.js`
- `admin-web/src/pages/AdminDashboardPage.jsx`
- `.docs/2026-07-25_CUBICI_TERMINATION_REDEMPTION_POLICY_REVIEW.md`

### 검증 여부

- `test_contract_cancel_rejects_pre_contract_status_with_real_db`: 통과
- `test_contract_lifecycle_db_e2e.py`: `2 passed`
- `admin-web` production build: 통과
- `moneybank-termination-status-db-e2e.spec.js`: `1 passed`

### 남은 확인 사항

- 미상환잔액이 있는 계약의 해지 허용/차단 정책은 아직 확정하지 않았다.
- legacy 강제해지(`73`)와 사용자 타입 `97` 전환은 별도 구현 범위로 남긴다.
