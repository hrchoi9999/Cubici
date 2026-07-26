# Cubici 상환 관리 관리자 화면 연결

## 작업 결과

- 관리자 메뉴 `머니뱅크 운영 > 상환 관리`를 실제 React 화면에 연결했다.
- 신규 프론트 API 함수 `fetchRedemptions`를 추가했다.
- `/admin/moneybank/redemption` 경로 접근 시 상환 관리 목록 화면을 표시하도록 `App` 라우팅을 분기했다.
- 상환 관리 목록에는 지급, 상환, 입금, 판매, 미상환잔액, 최근 이력일을 표시한다.
- 계약 조건 조정 화면의 `지급율`과 `수수료율` 라벨에 `%` 단위를 반영했다.

## 연결 API

- `GET /v1/api/redemptions`
- 주요 응답:
  - `mbid`
  - `provision_count`
  - `total_provision_amount`
  - `repayment_count`
  - `total_repayment_amount`
  - `deposit_count`
  - `total_deposit_amount`
  - `sales_count`
  - `sales_payment_amount`
  - `latest_outstanding_balance`
  - `latest_history_date`

## 검증 결과

- redemptions API 직접 호출: 성공
  - total: `6`
  - first mbid: `MPK2723123`
- service-api pytest: `18 passed`
- admin-web production build: 성공

## 보류 사항

- 지급/상환 write 액션은 아직 구현하지 않았다.
- 사유: 실제 운영 반영 대상 테이블과 회계/상환 누적 계산 규칙을 legacy 기준으로 추가 확인해야 한다.

## 다음 액션

- 정산 목록 화면을 관리자 메뉴에 연결한다.
- 이후 지급/상환 등록, 입금 반영, 누적 잔액 재계산 액션을 legacy 규칙 기준으로 설계한다.
