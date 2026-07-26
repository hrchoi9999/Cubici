# Cubici 상환 검색 필터/상세 연결

## 작업 결과

- 상환 목록 API에 검색 필터를 추가했다.
- 상환 상세 API `GET /v1/api/redemptions/{mbid}`를 추가했다.
- 관리자 상환 관리 화면에 검색 영역을 추가했다.
- 상환 목록의 `상세` 버튼으로 MBID별 집계 상세 패널을 조회하도록 연결했다.

## 추가 API

- `GET /v1/api/redemptions`
  - 추가 필터:
    - `mbid`
    - `outstanding_only`
    - `from_date`
    - `to_date`
- `GET /v1/api/redemptions/{mbid}`
  - MBID별 지급/상환/입금/판매/잔액 집계 단건 조회

## 관리자 화면

- `/admin/moneybank/redemption`
- 검색 조건:
  - MBID
  - 시작일
  - 종료일
  - 미상환잔액 있음
- 상세 표시:
  - 지급건수, 지급총액, 결제총액, 이용료총액
  - 상환건수, 상환총액, 상환이용료, 송금수수료
  - 입금건수, 입금총액
  - 판매건수, 판매결제액
  - 누적지급액, 누적상환액, 미상환잔액

## 검증 결과

- 필터 API 직접 호출: 성공
  - 요청: `GET /v1/api/redemptions?limit=3&offset=0&mbid=MPK&outstanding_only=true`
  - total: `1`
  - count: `1`
- 상세 API 직접 호출: 성공
  - MBID: `MPK2723123`
- service-api pytest: `18 passed`
- admin-web production build: 성공

## 보류 사항

- 지급/상환/입금 등록 write 액션은 아직 구현하지 않았다.
- 사유: 상환 누적잔액 계산과 정산 반영 규칙을 legacy 기준으로 추가 확인해야 한다.

## 다음 액션

- 지급/상환 등록 write 액션의 legacy 업무 규칙을 분석한다.
- 분석 후 API transaction 설계와 이력/원복 정책을 먼저 문서화한다.
