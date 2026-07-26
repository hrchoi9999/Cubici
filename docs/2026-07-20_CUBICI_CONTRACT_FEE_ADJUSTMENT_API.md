# Cubici 계약 조건/수수료 조정 API 구현

## 작업 결과

- legacy `MONEYBANK_MONEYPLUS.adj_*` 조건 조정 흐름을 신규 PostgreSQL 구조에 맞게 재설계했다.
- 신규 API `PUT /v1/api/contracts/{mbid}/fees/adjust`를 추가했다.
- 조정 대상은 `moneybank_contract_fee`와 `moneybank_contract_fee_rates`이다.
- 조건 변경 전/후 값은 `contract_fee_adjustment_history`에 저장한다.
- 관리자 React 화면의 상태 상세 영역에 `계약 조건 조정` 폼을 추가했다.

## Legacy 근거

- legacy 조정 필드는 `adj_yn`, `adj_fee_rate`, `adj_payment_rate`, `adj_sales_limit_per_case`, `adj_reason` 구조였다.
- legacy 저장은 `MONEYBANK_MONEYPLUS`의 조정 필드를 갱신하는 방식이었다.
- 신규 스키마에는 `adj_*` 필드가 없으므로 운영 조건 row를 직접 갱신하고 변경 이력을 별도 테이블에 남기는 방식으로 전환했다.

## API

- Method: `PUT`
- Path: `/v1/api/contracts/{mbid}/fees/adjust`
- 주요 입력:
  - `adjusted_by`
  - `reason`
  - `payment_rate`
  - `sales_limit_per_order`
  - `max_outstanding_balance`
  - `fee_rates[]`
- 응답:
  - `mbid`
  - `contract_fee_id`
  - `history_id`
  - 변경 후 `fee`

## DB 변경

- 추가 migration: `006_contract_fee_adjustments.sql`
- 추가 테이블: `contract_fee_adjustment_history`
- 저장 내용:
  - 이전 지급율, 주문한도, 최대 미상환잔액
  - 신규 지급율, 주문한도, 최대 미상환잔액
  - 이전/신규 수수료율 JSON
  - 조정자, 조정 사유, 조정일시

## 관리자 화면

- 신청 상태 상세 아래 `계약 조건 조정` 섹션을 추가했다.
- 지급율, 건당 주문한도, 최대 미상환잔액, 조정사유를 입력할 수 있다.
- 기존 수수료율 항목은 `fee_type`별로 수정할 수 있다.
- 저장 후 계약 상세를 다시 조회해 화면 값을 갱신한다.

## 검증 결과

- DB migration 적용: 성공
- API route 등록 테스트: 성공
- service-api pytest: `18 passed`
- admin-web production build: 성공
- 실제 DB E2E:
  - 대상 MBID: `MPK2022119`
  - `payment_rate` 변경 API 호출 성공
  - 이력 row 생성 확인
  - 테스트 변경값과 이력 row 원복 완료

## 남은 이슈

- 신규 테이블은 local migration으로 적용했다. 운영 배포 전 migration 실행 순서에 포함해야 한다.
- 수수료율 단위와 표시 포맷은 기존 관리자 화면 기준을 추가 확인해야 한다.

## 다음 액션

- 계약 체결 이후 정산/상환 운영 액션 화면을 API와 React 화면으로 연결한다.
