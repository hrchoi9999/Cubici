# Cubici 상환 취소 순서 검증 E2E 테스트

## 작업 결과

- 상환 취소와 후속 지급/상환이 섞인 순서 검증 테스트를 추가했다.
- 테스트는 기본 실행에서는 skip되고, `CUBICI_RUN_DB_E2E=1`일 때만 로컬 PostgreSQL에 대해 실행된다.
- 테스트에서 생성한 지급, 상환, history, operation history row는 `finally`에서 삭제한다.

## 변경 파일

- `Cubici/service-api/pyproject.toml`
- `Cubici/service-api/tests/test_redemption_operation_cancel_e2e.py`
- `Cubici/docs/2026-07-20_CUBICI_REDEMPTION_CANCEL_SEQUENCE_E2E_TEST.md`

## 검증 시나리오

1. DB에서 테스트 가능한 계약 MBID를 1건 선택한다.
2. 지급 1차를 생성한다.
3. 상환을 생성한다.
4. 후속 지급을 추가 생성한다.
5. 앞선 상환 operation을 취소한다.
6. 취소 결과가 최신 누적 지급/상환 기준으로 반영되는지 검증한다.
7. 같은 operation을 중복 취소하면 `409`로 거부되는지 검증한다.
8. 생성한 테스트 row를 삭제한다.

## 검증 여부

- 기본 테스트 성공
  - 결과: `18 passed, 1 skipped`
- DB E2E 테스트 성공
  - 결과: `1 passed`
- 테스트 row 잔여 확인
  - 결과: `REDEMPTION_E2E_LEFTOVER 0`

## 판단 사항

- 기존 legacy history 중 `outstanding_balance`가 `cumulative_provision_amount - cumulative_repayment_amount`와 일치하지 않는 케이스가 있었다.
- 따라서 이번 테스트는 기존 잔액값 델타가 아니라, 취소 후 신규 누적 지급액/상환액과 결과 잔액의 일관성을 검증하도록 구성했다.
- 이 불일치 가능성은 현재 개발 중 즉시 보정하지 않는다.
- 신규 기능 개발을 먼저 완료한 뒤, 테스트 운영 단계에서 전체 DB를 대상으로 불일치 건수와 원인을 점검한다.
- 점검 전까지 legacy 원천값은 임의 수정하지 않는다.
- public 저장소 원칙에 따라 실제 사용자 row나 DB dump는 커밋 대상에 포함하지 않는다.

## 다음 액션

- 관리자 화면 Playwright E2E를 추가한다.
- 작업 이력 목록의 날짜/금액/상태 필터를 추가한다.
- 개발 완료 후 테스트 운영 단계에서 legacy outstanding balance 전체 불일치 점검을 실행한다.
