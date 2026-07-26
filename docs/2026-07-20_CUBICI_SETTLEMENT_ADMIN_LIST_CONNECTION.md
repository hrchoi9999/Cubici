# Cubici 정산 관리 관리자 화면 연결

## 작업 결과

- 관리자 메뉴 `머니뱅크 운영 > 정산 관리`를 추가했다.
- `/admin/moneybank/settlement` 경로 접근 시 정산 관리 React 화면을 표시하도록 연결했다.
- 신규 프론트 API 함수 `fetchSettlements`를 추가했다.
- 정산 목록에는 쇼핑몰, 정산구분, 정산일, 총매출, 서비스수수료, 정산대상액, 정산액, 보류해제액, 은행/계좌 식별정보, 상태를 표시한다.

## 연결 API

- `GET /v1/api/settlements`
- 주요 응답:
  - `settlements_id`
  - `shop_type`
  - `shop_id`
  - `settlement_type`
  - `settlement_date`
  - `total_sale`
  - `service_fee`
  - `settlement_target_amount`
  - `settlement_amount`
  - `pending_released_amount`
  - `bank_name`
  - `bank_account_holder`
  - `bank_account`
  - `status`

## 검증 결과

- settlements API 직접 호출: 성공
  - total: `469`
  - first settlements_id: `796`
- service-api pytest: `18 passed`
- admin-web production build: 성공

## 보류 사항

- 정산 확정/수정/재계산 write 액션은 아직 구현하지 않았다.
- 사유: 정산 상태 전이, 금액 재계산, 지급/상환 누적 반영 규칙을 legacy 기준으로 추가 확인해야 한다.

## 다음 액션

- 정산 상세/검색 필터를 추가한다.
- 이후 지급/상환 등록과 정산 확정 write 액션을 legacy 규칙 기준으로 설계한다.
