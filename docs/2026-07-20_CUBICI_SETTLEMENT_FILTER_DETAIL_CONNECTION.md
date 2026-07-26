# Cubici 정산 검색 필터/상세 연결

## 작업 결과

- 정산 목록 API에 검색 필터를 추가했다.
- 정산 상세 API `GET /v1/api/settlements/{settlements_id}`를 추가했다.
- 관리자 정산 관리 화면에 검색 영역을 추가했다.
- 정산 목록의 `상세` 버튼으로 정산 상세 패널을 조회하도록 연결했다.

## 추가 API

- `GET /v1/api/settlements`
  - 추가 필터:
    - `shop_type`
    - `shop_id`
    - `status`
    - `from_date`
    - `to_date`
- `GET /v1/api/settlements/{settlements_id}`
  - 정산 단건 상세 조회

## 관리자 화면

- `/admin/moneybank/settlement`
- 검색 조건:
  - 쇼핑몰
  - 상점ID
  - 상태
  - 시작일
  - 종료일
- 상세 표시:
  - 정산ID, 상태, 쇼핑몰, 상점ID
  - 정산구분, 정산일
  - 총매출, 서비스수수료, 정산대상액, 정산액
  - 쿠폰/수수료/보류/채무 관련 금액
  - 은행, 예금주, 계좌번호

## 검증 결과

- 필터 API 직접 호출: 성공
  - 요청: `GET /v1/api/settlements?limit=3&offset=0&shop_type=NAVER`
  - total: `381`
  - count: `3`
- 상세 API 직접 호출: 성공
  - `settlements_id=796`
- service-api pytest: `18 passed`
- admin-web production build: 성공

## 보류 사항

- 정산 수정/확정/재계산 write 액션은 아직 구현하지 않았다.
- 사유: 정산 금액 산식과 상환 누적 반영 규칙을 legacy 기준으로 확인한 뒤 적용해야 한다.

## 다음 액션

- 상환 관리 검색 필터와 상세 조회를 추가한다.
- 이후 지급/상환 등록 write 액션 설계로 넘어간다.
