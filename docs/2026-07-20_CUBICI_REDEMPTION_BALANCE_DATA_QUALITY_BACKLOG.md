# Cubici 상환 잔액 데이터 품질 점검 Backlog

## 작업 결과

- legacy `moneybank_redemption_history` 잔액 불일치 가능성을 후속 점검 항목으로 기록한다.
- 현재 개발 단계에서는 기존 DB 값을 임의 보정하지 않는다.
- 개발 완료 후 테스트 운영 단계에서 전체 DB 점검을 수행한다.

## 점검 대상

- `moneybank_redemption_history`
- 기준식:
  - `outstanding_balance = cumulative_provision_amount - cumulative_repayment_amount`

## 점검 시점

- 선정산/정산/계약/상환 핵심 개발 완료 후
- 테스트 운영 DB로 관리자 화면과 주요 batch/API를 반복 검증하는 단계

## 점검 방법

1. 전체 `moneybank_redemption_history` row에서 기준식 불일치 건수를 산출한다.
2. MBID별 최신 history 기준 불일치 건수를 별도 산출한다.
3. 불일치 row를 발생 시점, 이전/이후 history, 지급/상환 원천 테이블과 대조한다.
4. legacy 보정값인지, migration 오류인지, 과거 수기 처리인지 분류한다.
5. 보정 정책이 확정되기 전까지 원천값은 수정하지 않는다.

## 검증 여부

- 현재는 backlog 기록만 수행했다.
- 전체 DB 점검 SQL과 결과 산출은 후속 작업으로 남긴다.

## 다음 액션

- 테스트 운영 단계에서 전체 불일치 점검 SQL을 작성한다.
- 점검 결과를 별도 Markdown 문서로 기록한다.
- 필요 시 보정 migration 또는 운영 reconciliation 절차를 별도 설계한다.
