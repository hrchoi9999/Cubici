# Cubici SHOP_ID 그룹핑 로직 분류 및 적용 정책

## 작업 결과

- legacy `SHOP_ID REGEXP` 사용 위치를 조사했다.
- 신규 API의 현재 exact `shop_type + shop_id` 필터와 legacy 그룹핑 방식의 차이를 정리했다.
- 사용자 매출/반품/정산 목록에는 현 단계에서 exact pair 방식을 유지하기로 했다.
- 정산 산식, 통합정보, 재고/매칭 화면은 후속 migration 시 그룹핑 정책을 별도 구현해야 하는 대상으로 분류했다.

## legacy 동작 요약

legacy는 `selectShopInfo(principal)`로 사용자 쇼핑몰 정보를 만들고, 화면/JSP가 아래 값을 mapper에 전달한다.

| parameter | 의미 |
| --- | --- |
| `SHOP_TYPE_LIST` | 사용자가 선택/보유한 쇼핑몰 code 목록 |
| `INTERPARK_ID` | 인터파크 shop id regexp |
| `GMARKET_ID` | 지마켓 shop id regexp |
| `AUCTION_ID` | 옥션 shop id regexp |
| `ELEVEN_ID` | 11번가 shop id regexp |
| `COUPANG_ID` | 쿠팡 shop id, legacy 일부는 exact match |
| `NAVER_ID` | 네이버 shop id regexp |

## 주요 사용 위치

| 영역 | legacy 파일 | 사용 방식 | 신규 적용 판단 |
| --- | --- | --- | --- |
| 매출현황 | `InfoSalesMapper.xml`, `infoSales/*.jsp` | 쇼핑몰별 sales/return table을 `SHOP_ID REGEXP`로 묶어 조회 | 사용자 목록 API는 현재 exact pair 유지. 그룹 매출 집계 API 구현 시 반영 |
| 정산/선정산 계산 | `InfoCalculateMapper.xml`, `infoCalculate/*.jsp` | 쇼핑몰별 매출/정산 table을 묶고 정산예정/정산완료 산식 계산 | 최우선 후속 대상. 산식 migration 시 seller group table 필요 |
| 통합정보 | `InfoIntegratedMapper.xml`, `infoIntegrated/*.jsp` | sales/settlement procedure 및 통합 summary에 그룹 ID 전달 | 관리자/사용자 통합 dashboard 고도화 시 반영 |
| 재고/매칭 | `InventoMapper.xml`, `invento/*.jsp` | 상품/재고/매칭 조회에서 쇼핑몰 ID 묶음 사용 | 공급망금융 핵심 1차 범위 밖. 후순위 |
| 관리자 통계 일부 | `AdminCubiciMapper.xml` | 일부 고정 regexp 또는 partner/product filter와 혼재 | 화면별 상세 migration 때 재검토 |

## 현재 DB 확인

PostgreSQL `shop_accounts` 기준 확인 결과:

| 항목 | 결과 |
| --- | --- |
| 동일 `user_no + shop_type`에 여러 `shop_id` 보유 그룹 | 0건 |
| 주요 이관 `shop_type` 값 | `NAVER`, `COUPANG`, `GMARKET`, `STREET11`, `AUCTION` |

따라서 현재 사용자 매출/반품/정산 목록 API는 `shop_pairs=SHOP_TYPE:SHOP_ID` exact OR 조건으로도 이관 데이터 재현에 문제가 확인되지 않았다.

## 신규 구현 정책

1. 목록 조회
   - 사용자 매출/반품/정산 목록은 현 단계에서 exact `shop_type + shop_id` 기준을 유지한다.
   - 연결 쇼핑몰이 여러 개인 경우 `shop_pairs`에 여러 pair를 전달해 OR 조건으로 조회한다.

2. 산식/집계 조회
   - 선정산 가능금액, 정산예정액, 통합정보, 재고 매칭처럼 여러 계정을 하나의 seller group으로 묶는 화면은 별도 group model을 도입한다.
   - 임의 regexp 문자열을 그대로 API 입력으로 받지 않는다.
   - PostgreSQL 구현은 regex 우선이 아니라 `seller_shop_group` 또는 normalized mapping table 기반 exact join을 우선 검토한다.

3. legacy compatibility
   - legacy numeric `SHOP_TYPE`은 이미 공통 normalizer에서 신규 문자열 code로 변환한다.
   - legacy `SHOP_ID REGEXP`는 업무 흐름 분석용으로만 보존하고, 신규 Python API에서는 명시적인 pair/group relation으로 재설계한다.

## 구현 필요 후보

| 후보 | 목적 | 우선순위 |
| --- | --- | --- |
| `seller_shop_groups` | 사용자/사업자 단위 쇼핑몰 계정 묶음 | 중 |
| `seller_shop_group_members` | group과 `shop_type + shop_id` 매핑 | 중 |
| `GET /accounts/me/shop-groups` | 로그인 사용자 기준 그룹 조회 | 중 |
| 산식 전용 API group filter | 정산/선정산 계산 API에서 group 기준 조회 | 높음, 산식 migration 착수 시 |

## 보류/추정

- `SHOP_ID REGEXP`는 legacy MySQL/MariaDB 방식이므로 PostgreSQL에 그대로 이식하지 않는다.
- 현재 이관 DB에는 다중 shop id 그룹 사례가 없어 실제 운영 케이스 재확인이 필요하다.
- 쿠팡은 legacy 일부 mapper에서 exact `SHOP_ID = #{COUPANG_ID}`를 사용한다. 다른 쇼핑몰과 동일한 regexp 정책을 일괄 적용하지 않는다.

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| legacy `SHOP_ID REGEXP` 사용 위치 검색 | 완료 |
| `shopInfoMap` 생성/전달 controller 확인 | 완료 |
| PostgreSQL 동일 사용자/쇼핑몰 다중 ID 그룹 확인 | 0건 |
| 신규 API 변경 | 없음 |

## 다음 액션

1. 선정산 산식 migration 착수 시 seller group table 설계를 먼저 확정한다.
2. 사용자 화면 잔여 정적/샘플 데이터 영역을 실제 API 데이터로 계속 전환한다.
3. 사용자 계약 상세/서류 목록 화면 분리 필요성을 검토한다.
