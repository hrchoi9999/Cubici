# Cubici legacy 산식 카탈로그

## 목적과 판정 기준

- PCS/PMS, 쇼핑몰 정산, 지급·상환, 머니뱅크 통합 집계의 legacy 계산 로직을 코드 근거로 보존한다.
- `확정`은 tracked legacy Java/MyBatis 원문에서 계산 순서까지 확인된 경우다.
- `DB 검증`은 로컬 PostgreSQL의 현재 값으로 재검산한 경우다.
- 원문 데이터나 write batch가 없으면 추정으로 채우지 않고 `미확인`으로 남긴다.
- 이 문서는 legacy 동작을 기록한 것이며, 발견된 경계값 오류나 비정상 계산을 정정한 신규 정책이 아니다.

## 근거 파일

| 구분 | legacy 근거 | 현재 구현 |
| --- | --- | --- |
| PCS | `PrizmService.java`, `PrizmMapper.xml`, `PreferencesMapper.xml` | `risk_results/repository.py`, `prizm_items` |
| PMS | `PmsService.java`, `pmsMapper.xml`, `PrizmService.operatorFunc` | `risk_results/repository.py`, `prizm_items` |
| 정산 | `InfoCalculateMapper.xml`, `SettlementMapper.xml`, `CoupangAPI.java` | `settlements/repository.py`, `audit_settlement_formulas.py` |
| 지급·상환 | `AdminRedemMapper.xml` | `redemptions/repository.py`, `audit_redemption_balances.py` |
| 통합 집계 | `AdminMoneyBankMapper.xml` | `management/repository.py` |

쇼핑몰 코드는 `1=인터파크`, `2=지마켓`, `3=옥션`, `4=11번가`, `11=쿠팡`, `14=네이버`다.

## 1. PCS 산식

### 1.1 평가 입력값

평가 대상 쇼핑몰은 코드상 `2,3,4,11,14`이며 인터파크는 제외한다. 최근 1개월 구간은 `오늘-1개월+1일`부터 오늘까지다.

| 값 | legacy 산식 |
| --- | --- |
| `BUSINESS_PERIOD` | 사업자 설립일부터 평가일까지 개월 수 |
| `OPERATING_PERIOD` | 등록 쇼핑몰 중 가장 오래된 등록일부터 평가일까지 개월 수 |
| `SHOP_COUNT` | 평가 대상 등록 쇼핑몰 수 |
| `MSQ` | 쇼핑몰별 최근 1개월 `COUNT(ORDER_NO)`의 합 |
| `MSV` | 타입 2·3은 `SUM(ORDER_AMOUNT)`, 그 외는 `SUM(PAYMENT_AMOUNT)`의 합 |
| `MSVW_i` | `shop_MSV_i / total_MSV` |
| `MSA` | 타입 11은 정산 API의 `SUM(SETTLEMENT_AMOUNT)`, 그 외는 판매 API의 `SUM(SETTLE_ESTIMATE_AMOUNT)` |
| `MSP_i` | 쇼핑몰별 `MSP_SUM / MSP_COUNT` |
| `MSP` | `SUM(MSP_i * MSVW_i)` |
| `MSTSR` | `SUM(shop_MSA_i / shop_MSV_i)`; 매출 비중을 곱하지 않는 단순합 |
| `MPR` | `SUM(shop_MPR_i * MSVW_i)` |
| `MDP` | `SUM(shop_MDP_i * MSVW_i)` |
| `MRR` | 원천 컬럼 부재로 `1.0` 고정 |
| `CB_SCORE_CHANGE_RATE` | `(current_score - past_score) / past_score` |

`NaN` 또는 무한대가 발생한 `MSP`, `MSTSR`, `MPR`, `MDP` 항목은 0으로 바꾼다. 신용점수 변화율에는 과거 점수 0 방어가 없다.

### 1.2 쇼핑몰별 PCS 세부식

- `MSP_SUM`
  - 지마켓: `SUM(DATEDIFF(settle_estimate_date, delivered_date + 1일))`
  - 옥션: `SUM(DATEDIFF(settle_estimate_date, delivered_date + 2일))`
  - 11번가·네이버: `SUM(DATEDIFF(confirm_date, delivered_date + 2일))`
  - 그 외: `SUM(DATEDIFF(settle_complete_date, delivered_date + 2일))`
- `MPR`
  - 지마켓·옥션: `SUM(seller_discounts + shopping_mall_discount) / SUM(order_amount)`
  - 11번가: 같은 할인액 합계 `/ SUM(payment_amount)`
  - 네이버: 7개 상품·판매자 할인 필드 합계 `/ SUM(payment_amount)`
  - 그 외: `SUM(discount_amount) / SUM(payment_amount)`
- `MDP`: `SUM(DATEDIFF(delivered_date, paid_date + 1일)) / COUNT(shop_id)`

### 1.3 구간 점수와 최종 점수

각 지표는 설정 DB의 `ITEM_STANDARD1/2`, `OPERATOR1/2`, `ITEM_SCORE`, `ITEM_WEIGHT`를 사용한다.

```text
indicator_score = matched_ITEM_SCORE * ITEM_WEIGHT
PCS_raw = SUM(round(indicator_score, 1))
PCS_score = round(PCS_raw, 0)
```

구간 연산은 하한 `이상`, 상한 `미만` 방식이다. 현재 PostgreSQL `prizm_items`에는 PCS 14개 지표와 등급 1개가 있고, legacy 상세행은 5개 low/high 구간으로 정규화되어 있다. 원본 `ITEM_SCORE`·연산자 상세행이 tracked 데이터로 남아 있지 않아 `구간 1~5 = 점수 1~5` 매핑은 점수 범위상 유력하지만 원본 row 기준 확정은 아니다.

현재 보존된 PCS 가중치는 다음과 같다.

| 영역 | 지표와 가중치 |
| --- | --- |
| 기업개요 | 사업기간 21.2, 온라인 운영기간 6.4, 쇼핑몰 수 8.5 |
| 매출 | 월매출액 29.4, 월매출건 20.6 |
| 정산 | 월정산액 15.0, 회수기간 10.5, 정산율 10.5 |
| 운영 | 판촉비율 7.0, 배송기간 11.7, 구매거부율 9.3 |
| 금융 | 신용평점 23.8, 전체순위 11.9, 변화율 14.3 |

현재 PostgreSQL에 보존된 5개 평가구간은 다음과 같다. 구간 번호와 원본 `ITEM_SCORE`의 대응은 원본 상세 row가 없어 확정하지 않는다.

| PCS 지표 | 구간 1 | 구간 2 | 구간 3 | 구간 4 | 구간 5 |
| --- | --- | --- | --- | --- | --- |
| 사업기간 | `<24` | `24~<36` | `36~<48` | `48~<60` | `>=60` |
| 온라인 운영기간 | `<12` | `12~<24` | `24~<36` | `36~<48` | `>=48` |
| 쇼핑몰 수 | `<3` | `3~<4` | `4~<5` | `5~<6` | `>=6` |
| 월매출액 | `<11,000,000` | `11,000,000~<20,000,000` | `20,000,000~<30,000,000` | `30,000,000~<50,000,000` | `>=50,000,000` |
| 월매출건 | `<400` | `400~<1,000` | `1,000~<2,000` | `2,000~<3,000` | `>=3,000` |
| 월정산액 | `<6,000,000` | `6,000,000~<15,000,000` | `15,000,000~<30,000,000` | `30,000,000~<50,000,000` | `>=50,000,000` |
| 정산회수기간 | `>=28` | `21~<28` | `16~<21` | `11~<16` | `<10` |
| 정산율 | `<60` | `60~<75` | `75~<88` | `88~<93` | `>=93` |
| 판촉비율 | `>=33` | `27~<33` | `21~<27` | `15~<21` | `<15` |
| 배송기간 | `>=3.9` | `3.3~<3.9` | `2.8~<3.3` | `2.2~<2.8` | `<2.2` |
| 구매거부율 | `>=5` | `4~<5` | `2.5~<4` | `1.2~<2.5` | `<1.2` |
| 신용평점 | `<501` | `501~<561` | `561~<631` | `631~<691` | `>=691` |
| 신용순위 | `>=94` | `87~<94` | `69~<87` | `49~<69` | `<49` |
| 신용점수 변화율 | `<-7` | `-7~<-3` | `-3~<3` | `3~<7` | `>=7` |

정산회수기간은 현재 정규화 값에 `10~<11` 공백이 있다. 정산율·변화율 등은 설정값이 퍼센트 단위처럼 보이지만 Java는 계산한 비율에 100을 곱하지 않고 그대로 비교한다. 단위 변환이 다른 배치에 있었는지는 미확인이다.

### 1.4 PCS 등급의 실제 legacy 경계

| 등급 | 코드상 조건 |
| --- | --- |
| A | `880 < score <= 1000` |
| B | `700 < score <= 879` |
| C | `501 < score <= 699` |
| D | `321 < score <= 500` |
| E | `200 < score <= 320` |
| N | 나머지 |

따라서 정확히 `200, 321, 501, 700, 880`인 점수와 1000 초과는 `N`이 된다. 이는 legacy 원문 동작이며 신규 정책에서는 경계 정정 여부를 별도로 승인해야 한다.

## 2. PMS 산식

### 2.1 원천 구간

- 이전 구간: `오늘-4주`부터 `오늘-2주`
- 최근 구간: `오늘-2주`부터 오늘
- SQL `BETWEEN`이 양 끝을 포함하므로 `오늘-2주` 경계일은 두 구간에 중복 포함될 수 있다.
- `BSV`는 지마켓·옥션이 `SUM(PAYMENT_AMOUNT)`, 그 외가 `SUM(ORDER_AMOUNT)`다. PCS의 `MSV` 분기와 반대다.
- `BSQ`는 `COUNT(ORDER_NO)`, `BDS`는 `COUNT(ORDERER)`다. 이름과 달리 동일 구매자 distinct 수가 아니다.

쇼핑몰별 `BPR`, `BSTS`, `BDLT` 원천식은 PCS와 같은 할인 필드 분기를 사용한다. `BSTS`는 쿠팡이 정산 API 금액, 지마켓·옥션이 정산예정일 기준 판매 API 금액, 11번가·네이버가 결제일 기준 정산예정금액이다. `BDLT`는 `AVG(DATEDIFF(delivered_date, paid_date + 1일))` 성격이다.

### 2.2 8개 평가 변수

`w_i = BSV_1W_i / SUM(BSV_1W)`, `q_i = BSQ_1W_i / SUM(BSQ_1W)`로 둔다.

| 변수 | legacy 산식 |
| --- | --- |
| `BSVC` | `SUM(((BSV_1W_i-BSV_2W_i)/BSV_2W_i) * w_i)` |
| `BSQC` | `SUM(((BSQ_2W_i-BSQ_1W_i)/q_i) * q_i)` |
| `BAUPC` | `SUM((((BSV_1W_i/BSQ_1W_i)-(BSV_2W_i/BSQ_2W_i))/(BSV_2W_i/BSQ_2W_i)) * w_i)` |
| `BDSR` | `SUM(((BDS_2W_i/BSQ_2W_i)-(BDS_1W_i/BSQ_1W_i)) * w_i)` |
| `BPRC` | `SUM((BPR_1W_i-BPR_2W_i) * w_i)` |
| `BRRC` | 원천 반품 계산 없이 `13` 고정 |
| `BSTSC` | `SUM(((BSTS_1W_i/BSV_1W_i)-(BSTS_2W_i/BSV_2W_i)) * w_i)` |
| `BDLTC` | `((BDLT_1W_i-BDLT_2W_i)/BDLT_2W_i) * w_i` |

`NaN`과 무한대는 0으로 바꾼다. `BSQC`는 식이 상쇄되어 정상 분모에서는 사실상 `BSQ_2W-BSQ_1W`가 된다. `BDLTC`는 `+=`가 아니라 `=`로 대입하므로 여러 쇼핑몰 중 마지막 반복값만 남는다.

### 2.3 PMS 점수와 등급

```text
PMS_raw = SUM(round(each_of_8_weighted_scores, 1))
PMS_score = round(PMS_raw, 0)
sales_total = SUM(round(BSVC, BSQC, BAUPC, BDSR weighted scores, 1))
manage_total = SUM(round(BPRC, BRRC, BSTSC, BDLTC weighted scores, 1))
```

현재 보존된 8개 가중치는 각각 `4.0, 4.0, 5.3, 6.7, 4.3, 3.6, 5.0, 7.1`이며 합계는 40.0이다. 별도 core risk 지표 `정산계좌 변경여부(77)`, `정산입금 결손(23)`는 화면 판정에는 쓰이지만 `pmsFunction`의 8개 점수 합산에는 포함되지 않는다.

현재 PostgreSQL의 PMS 평가구간도 원본 점수 대응을 확정하지 않은 상태로 다음과 같이 보존되어 있다.

| PMS 지표 | 구간 1 | 구간 2 | 구간 3 | 구간 4 | 구간 5 |
| --- | --- | --- | --- | --- | --- |
| BSVC | `>=10` | `3~<10` | `-3~<3` | `-15~<-3` | `<-15` |
| BSQC | `>=10` | `3~<10` | `-3~<3` | `-15~<-3` | `<-15` |
| BAUPC | `>=10` | `3~<10` | `-3~<3` | `-15~<-3` | `<-15` |
| BDSR | `<-5` | `-5~<-1` | `-1~<5` | `5~<10` | `>=10` |
| BPRC | `<5` | `5~<8` | `8~<12` | `12~<17` | `>=17` |
| BRRC | `<-3` | `-3~<0` | `0~<5` | `5~<12` | `>=12` |
| BSTSC | `>=10` | `3~<10` | `-5~<3` | `-15~<-5` | `<-15` |
| BDLTC | `<-3` | `-3~<0` | `0~<5` | `5~<12` | `>=12` |

PMS도 설정은 퍼센트형 구간으로 보이지만 Java 입력은 대부분 비율 차이 원값이다. 이 단위 불일치는 재산출 시 우선 검산해야 한다.

| 등급 | 코드상 조건 |
| --- | --- |
| A | `40 < score <= 59` |
| B | `60 < score <= 90` |
| C | `91 < score <= 149` |
| D | `150 < score <= 179` |
| E | `180 < score <= 200` |
| N | 나머지 |

정확히 `40, 60, 91, 150, 180`은 `N`이다. 표시용 위험 class도 `75 < score < 89`는 주의, `90 <= score`는 경고라서 89에는 class가 없다.

### 2.4 PCS/PMS 재산출 상태

- 현재 FastAPI는 `prizm_pcs_result`, `prizm_pms_result`의 저장 결과를 조회하며 PCS/PMS 재계산 엔진은 없다.
- 현재 DB의 PMS 점수는 `111.5~123.0`처럼 소수값을 포함하지만 확인한 Java는 최종 점수를 정수 반올림한다.
- 저장 등급을 위 Java 경계로 읽기 전용 재판정한 결과 PCS는 536건 중 불일치 0건이다.
- PMS는 44건 중 24건이 불일치했다. 일치 20건은 저장 `C`/코드 `C`, 불일치 24건은 저장 `E`/코드 `C`다. 소수 점수 row도 24건이다.
- 사용자 확인(2026-08-11): PMS는 실제 거래 데이터로 산출해야 하나 현재 실거래 표본이 적어 테스트 데이터가 혼재되어 있다. 따라서 위 24건의 불일치는 현 단계에서 산식 코드 결함으로 판정하지 않고, 실거래 데이터가 충분히 축적된 뒤 별도 검산할 데이터 품질 사유로 기록한다.
- 따라서 현재 결과가 이 tracked Java 버전으로 생성됐다고 단정할 수 없다. 다른 배포 버전, 배치 또는 수동 적재 여부 확인 전에는 1:1 재산출 완료로 처리하지 않는다.
- Alt_CSM 지표 반영과 산식 변경은 별도 모델 거버넌스 작업이다.

2026-08-12 2단계 score replay에서 저장된 8개 PMS 입력값과 현재 `prizm_items` 구간을 원단위로 적용한 결과, 매출·운영 소계와 최종 반올림 점수는 44/44 일치했다. 정확한 저장 점수는 20/44만 일치했고 나머지 24건은 최종 반올림 전 소수점 값이었다. 저장 등급은 20/44만 Java 경계와 일치했으며 나머지 24건은 저장 `E`, replay `C`였다. 100배 비율 변환은 점수 1/44만 일치해 배제했다. 원천 `SHOP_SALES_API` 계열 테이블이 PostgreSQL에 없어 1단계 거래 원천 replay는 수행할 수 없다.

## 3. 쇼핑몰 정산 산식

### 3.1 정산예정 금액

| 쇼핑몰 | legacy 표시 산식 |
| --- | --- |
| 인터파크 | `ROUND(settlement_amount + shipping_price_total*0.967 - creditcard_discount)` |
| 지마켓 | `settlement_amount + shipping_price_total*0.9668` |
| 옥션 | `settlement_amount` |
| 11번가 | `정산금액 + IF(정산금액 >= 선결제배송비+도서산간배송비, 0, 도서산간배송비) - 반품보험료` |
| 네이버 | `settlement_amount` |
| 쿠팡 주정산 70% | 금액이 없으면 `ROUND(order_price*0.9*0.7)`, 있으면 `ROUND(settlement_amount*0.7)` |
| 쿠팡 주정산 잔여 30% | `ROUND(settlement_amount*0.3)` |
| 쿠팡 월정산 | 금액이 없으면 `ROUND(order_price*0.9)`, 있으면 `settlement_amount` |

### 3.2 정산입금 금액

| 쇼핑몰 | legacy 표시 산식 |
| --- | --- |
| 인터파크 | `ROUND(settlement_amount + shipping_price_total*0.967)` |
| 지마켓 | `IF(settlement_shipping_amount < 0, 0, settlement_amount) + IFNULL(settlement_shipping_amount,0)` |
| 옥션 | `settlement_amount` |
| 11번가 | `정산금액 + IF(정산금액 > 선결제배송비+도서산간배송비, 도서산간배송비, 0) - 반품보험료` |
| 네이버 | `settlement_amount` |
| 쿠팡 주정산 70% | `ROUND(settlement_amount*0.7)` |
| 쿠팡 주정산 30% | `ROUND(settlement_amount*0.3)` |
| 쿠팡 월정산 | `settlement_amount` |

11번가의 예정식은 `>=`, 입금식은 `>`를 사용한다. 쿠팡 예정일은 주정산·월정산과 구매확정/배송완료 여부에 따라 별도 영업일 보정 로직을 거친다.

### 3.3 PostgreSQL 저장값 검산

2026-08-11 로컬 DB 읽기 전용 strict audit 결과:

| 항목 | 결과 |
| --- | ---: |
| settlement row | 469 |
| `settlement_target_amount = total_sale - service_fee` 불일치 | 0 |
| `settlement_amount = total_sale - service_fee` 일치 | 0 |
| `settlement_amount = target - service_fee` 일치 | 0 |
| 전체 차감 후보식 일치 | 0 |

따라서 `settlement_target_amount = total_sale - service_fee`만 DB 값으로 확정된다. `settlement_amount`는 쇼핑몰 API/legacy batch가 저장한 결과값으로 보존하며 공통식으로 재계산하지 않는다.

현재 FastAPI의 화면 검산식은 우선 `check_amount = settlement_target_amount - pending_released_amount`를 사용한다. target과 pending이 모두 0인 일부 행에만 할인·수수료 필드 기반 보조식을 사용한다. 이 보조식은 legacy 공통 산식으로 확정된 것이 아니라 이상값 탐지용이므로 지급/회계 원장값을 변경하는 데 사용하면 안 된다.

2026-08-12 replay에서 위 검산식의 `DIFF` 28건은 모두 쿠팡 API 저장행이었다. `RESERVE` 6건과 `WEEKLY` 22건 모두 `ROUND(settlement_target_amount*0.7)`과 1원 이내로 일치했고, 정확 일치는 21건, 전체 절대오차는 7원이었다. legacy `CoupangAPI.getSettlementData()`가 API의 `settlementType`, `settlementTargetAmount`, `settlementAmount`를 그대로 저장하므로 `RESERVE`를 화면용 잔여 30% 산식으로 재해석하면 안 된다. 이 28건은 저장 데이터 오류가 아니라 source-specific 규칙 미반영 오탐으로 확정했고, 후속 Backend 수정에서 쿠팡 `RESERVE`·`WEEKLY`의 70% 값을 1원 허용오차로 검산해 `SOURCE_RECONCILED`로 분리했다. 나머지 441건은 원 쇼핑몰 source 테이블이 없어 batch 저장값을 보존한다.

## 4. 지급·상환 산식

### 4.1 legacy 조회 산식

legacy 상세는 지급 row와 상환 row를 시간순으로 합친다.

```text
cal_balance(t)
  = cumulative SUM(calculate_deposit_amount up to t)
  - cumulative SUM(act_principal up to t)
```

같은 날짜의 지급은 `00:59:59`, 상환은 `23:59:59`로 강제해 지급 후 상환 순서로 표시한다. 상환 수수료는 `SUM(usage_fee)`, 지급 합계는 `SUM(calculate_deposit_amount)`, 상환 원금 합계는 `SUM(act_principal)`이다.

### 4.2 현재 PostgreSQL write 규칙

지급:

```text
new_cumulative_provision = previous_cumulative_provision + total_provision_amount
new_cumulative_repayment = previous_cumulative_repayment
new_outstanding_balance = new_cumulative_provision - new_cumulative_repayment
```

상환:

```text
new_cumulative_provision = previous_cumulative_provision
new_cumulative_repayment = previous_cumulative_repayment + repayment_amount
new_outstanding_balance = new_cumulative_provision - new_cumulative_repayment
```

취소는 대상 operation의 provision/repayment delta를 최신 누적값에서 역산해 reverse entry를 추가한다. 모든 신규 누적값과 잔액은 음수가 될 수 없다.

검증 규칙은 `total_provision_amount <= total_payment_amount`, 판매별 지급 합계가 있으면 `SUM(sales.provision_amount) = total_provision_amount`, 입금내역이 있으면 `SUM(deposit_amount) >= repayment_amount`다.

### 4.3 DB 검증과 미확인 항목

2026-08-11 strict audit 결과는 history 388행, 계약 6건, 잔액식 불일치 0건, 음수 0건이다. operation history 테이블은 존재하지만 row가 0건이므로 실제 운영 operation 누적 검산 근거는 아직 없다.

legacy 관리자 소스에는 지급·상환 원장 write가 없고 조회만 있다. 따라서 `deposit_amount`, `repayment_amount`, `repayment_usage_fee`, `remittance_fee`, `balance_provision_amount` 사이의 정확한 외부 batch 업무식은 미확인이다. 현재 FastAPI의 write 규칙은 원장 일관성을 위한 신규 정책이며 legacy batch 1:1 복원으로 간주하지 않는다.

## 5. 머니뱅크 통합 집계

### 5.1 legacy `MoneyBankAccumulateValue`

| 지표 | legacy 집계 |
| --- | --- |
| 당일/누적 이용자 | `TOGETHER_REQUEST_INFO`, 승인상태 `02`, 승인일 기준 `COUNT(*)` |
| 당일/누적 서비스 금액 | 같은 조건의 `SUM(TOTAL_PAYMENT)` |
| 당일/누적 서비스 건수 | 같은 조건의 `COUNT(TOTAL_PAYMENT)` |
| 당일/누적 상환원금 | `TOGETHER_REPAYMENT`의 `SUM(ORIGINAL_AMOUNT)` |
| 상환 건수 | 상환일 범위 내 `SEQ`별 최종 상환일 수 |
| 누적 원금잔액 | 기준일까지 `SEQ`별 최신 `ORIGINAL_REMAINING_AMOUNT`의 합 |
| 잔액 건수 | 위 최신 잔액 중 0 초과 건수 |

### 5.2 현재 FastAPI 집계

- 계약: `moneybank_contract` 건수와 신청·승인·해지일 기준 집계
- 지급: `SUM(moneybank_redemption_provision.total_provision_amount)`
- 상환: `SUM(moneybank_redemption_repayment.repayment_amount)`
- 수수료: `SUM(repayment_usage_fee)`
- 미상환잔액: 계약별 최신 history의 `SUM(outstanding_balance)`
- 정산: `SUM(settlement.settlement_amount)`
- 잔액 검산: `provision_total - repayment_total`
- 차이: `latest_history_outstanding_total - (provision_total - repayment_total)`

legacy는 `TOGETHER_*` 원장을, 현재 시스템은 `moneybank_*` 원장을 사용하므로 이름이 같은 지표라도 데이터 모델과 기준일이 다르다. 현재 화면의 `PostgreSQL 직접집계`, `legacy procedure 대조 필요` 표시는 이 차이를 의도적으로 노출한 것이다.

2026-08-11 현재 직접집계는 지급 55,686,548원, 상환 54,772,944원, 원장 차감 잔액 913,604원이다. 계약별 최신 history 합계는 909,988원으로 3,616원 작다. 개별 history 388행은 모두 `지급누적-상환누적=잔액`을 만족한다. 2026-08-12 계약별 replay 결과, 지급 누적은 전 계약에서 일치했고 상환 누적은 1개 계약만 3,616원 차이가 났다. 해당 계약은 상세 상환행이 0건이고 최초 history의 누적상환액이 정확히 3,616원이므로, 차이는 history 내부식 오류가 아니라 상세 원장 없이 이관된 초기 누적상환액이다. 후속 Backend 수정은 일반 상환 누계와 초기 이관액을 분리 노출하고 검산용 상환 누계에만 3,616원을 포함한다. 결과 잔액은 909,988원, 최신 history와의 차이는 0원이다.

## 6. 완료·잔여 판정

| 범위 | 원문 로직 기록 | DB 값 검증 | 현재 재계산 엔진 | 판정 |
| --- | --- | --- | --- | --- |
| PCS | 완료 | 저장 결과 존재 | 없음 | 부분완료 |
| PMS | 완료 | 저장 결과 존재, Java 반올림과 불일치 | 없음 | 부분완료 |
| 쇼핑몰 정산 표시식 | 완료 | 원 쇼핑몰 원천별 replay 미수행 | 없음 | 부분완료 |
| settlement target | 완료 | 469/469 일치 | 검사식 있음 | 완료 |
| 지급·상환 잔액 | 완료 | 388/388 일치 | write 규칙 있음 | 완료 |
| 외부 batch 수수료·입금 배분 | 원문 write 부재 | 미검증 | 신규 방어규칙만 있음 | 미확인 |
| 통합 집계 | 완료 | 현재 DB 직접집계 | 있음 | legacy 1:1은 부분완료 |

다음 산식 작업은 이 기록을 기준으로 `legacy 그대로 재현`, `legacy 결함을 정정`, `Alt_CSM 모델로 교체` 세 범위를 먼저 분리한 뒤 진행해야 한다.
