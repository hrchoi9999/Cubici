# Cubici 사용자단 Moneybank 상태/정책 보정

## 작업 결과

- legacy `MoneybankCmmService.setUrlByMbStatus` 기준으로 사용자단 진행 route를 재정렬했다.
- React에 `/moneybank/advcalc/evaluate` 전용 화면을 복원해 심사 진행 상태, 조건 제시, 다음 액션을 표시하도록 했다.
- 상환 취소/잔액 재계산과 해지신청 후 관리자 처리 연계는 현재 구현과 legacy 차이를 재확인했다.

## legacy 기준

- `ROLE_MB_REQUEST`: `/moneybank/advcalc/request`
- `ROLE_MB_EVALUATE`: `/moneybank/advcalc/evaluate`
- `ROLE_MB_CONTRACT`: `/moneybank/advcalc/contract`
- `ROLE_USER_MB`: 계약 완료 후 현황 화면에서 확인

상태 enum 기준으로는 `01`, `02`, `03`, `04`, `401`, `402`가 심사/evaluate 계열이고, `05`, `81`은 계약 체결 계열이다.

## React 반영

- `/moneybank/advcalc/evaluate`와 legacy mobile `/m/moneybank/advcalc/evaluate`를 전용 evaluate 화면으로 연결했다.
- `processContinue`는 최신 계약 상태에 따라 신청, 심사, 계약, 현황 화면으로 이동한다.
- evaluate 화면은 legacy JSP 수준의 다음 정보를 표시한다.
  - 심사진행상태 4단계
  - 최근 계약/현재상태/신청일/평가등급
  - 조건 제시 상태의 수수료율, 지급율, 매출인정 한도, 계약기간
  - 서류보완, 이용조건 동의, 계약 체결 등 다음 액션

## 상환/해지 정책 확인

- 현재 `redemptions.repository.cancel_redemption_operation`은 지급/상환 작업 취소 시 최신 원장 기준으로 누적 지급, 누적 상환, 미상환잔액을 역산한다.
- 중복 취소, 취소 이력 재취소, 음수 잔액은 API에서 방어한다.
- 사용자 해지신청은 `TERMINATION_REQUEST`로 저장하고 `cancel_request_date`를 기록한다.
- 해지신청 후 최종 본인해지, 강제해지, 계좌해지는 관리자 처리 정책과 연결되어야 한다.

## 운영 정책/TODO

- 외부 실이체 제외 기준에서는 해지신청만으로 미상환잔액을 0 처리하지 않는다.
- 관리자 최종 해지 처리 전 미상환잔액 검산 기준을 확정해야 한다.
- 강제해지(`73`) 처리 시 legacy의 사용자 타입 변경 정책 적용 여부를 확정해야 한다.
- 실이체/입금대사 연계가 들어오면 상환 취소 API와 외부 이체 취소/환불 상태를 별도 대사 테이블로 연결해야 한다.

## 변경 파일

- `user-web/src/App.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/tests/e2e/mobile-legacy-routes-db-e2e.spec.js`
- `user-web/tests/e2e/moneybank-request-db-e2e.spec.js`
- `.docs/2026-07-26_CUBICI_MONEYBANK_USER_STATUS_POLICY_REVIEW.md`

## 검증 여부

- DB preflight: `127.0.0.1:55432` 연결 통과
- JSX bundle parse: `esbuild src\App.jsx --bundle` 통과
- user-web production build: 통과
- API/domain focused test: `6 passed`
  - `test_contract_cancel_rejects_pre_contract_status_with_real_db`
  - `test_redemption_operation_cancel_e2e.py`
  - `test_domain_routes.py -k "redemptions_endpoint_payload or contract_status_update_endpoint_payload or contract_status_document_pending_endpoint_payload or contract_status_agree_terms_endpoint_payload"`
- moneybank focused E2E: `4 passed`
  - `mobile-legacy-routes-db-e2e.spec.js`
  - `moneybank-request-db-e2e.spec.js`

## 검증 제외

- 사용자단 전체 E2E는 실행하지 않았다.
- 관리자단 전체 E2E는 실행하지 않았다.
