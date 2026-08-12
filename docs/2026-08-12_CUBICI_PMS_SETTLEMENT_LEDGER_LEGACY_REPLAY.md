# Cubici PMS·정산·통합원장 legacy 산식 replay

## 범위와 원칙

- 기준일: 2026-08-12 KST
- 대상: Docker 개발 PostgreSQL `cubici-postgres-dev`
- 실행 방식: 읽기 전용 transaction, 집계 결과만 출력
- 원본 변경: DB·API·화면·운영환경 변경 없음
- 식별자, 계좌정보, 개별 거래내역 출력 없음
- legacy 기준: `PmsService.java`, `PrizmService.operatorFunc`, `pmsMapper.xml`, `InfoCalculateMapper.xml`, `CoupangAPI.java`, `AdminMoneyBankMapper.xml`

## PMS replay

PostgreSQL에는 legacy `SHOP_SALES_API`와 쇼핑몰별 원천 거래 테이블이 없고 `prizm_raw_data_formula`도 0행이다. 따라서 거래 원천에서 BSV·BSQ 등 8개 입력값을 다시 만드는 1단계 replay는 불가능하다. 대신 `prizm_pms_result`에 저장된 8개 입력값과 `prizm_items` 평가구간·가중치로 Java `pmsFunction`의 2단계 점수 replay를 수행했다.

| 검증 | 원단위 | 100배 변환 |
| --- | ---: | ---: |
| 전체/입력 완전 행 | 44/44 | 44/44 |
| 매출 소계 일치 | 44 | 4 |
| 운영 소계 일치 | 44 | 15 |
| 저장 점수 정확 일치 | 20 | 1 |
| 저장 점수 반올림 후 일치 | 44 | 4 |
| 저장 등급 일치 | 20 | 20 |
| 평균 절대 점수차 | 0.23 | 9.70 |
| 최대 절대 점수차 | 0.5 | 27.0 |

판정:

- 현재 저장 8개 입력값은 100배 변환이 아닌 원단위로 평가해야 한다.
- 8개 가중 소계와 최종 반올림 점수는 44/44 재현됐다.
- 24개 저장 점수는 Java 최종 정수 반올림 전 소수점 값이며, 저장 등급 `E`도 replay 등급 `C`와 다르다.
- 이는 산식 계산 불능이 아니라 테스트 데이터 또는 다른 배치·버전의 최종 저장 정책 문제다. 원천 거래 데이터 없이 임의 보정하지 않는다.
- 신규 PMS 산출 엔진과 Alt_CSM 지표 반영은 별도 모델 거버넌스 범위다.

## 정산 replay

| 검증 | 결과 |
| --- | ---: |
| settlement 행 | 469 |
| `target = total_sale - service_fee` 불일치 | 0 |
| 현 공통 검산식 `DIFF` | 28 |
| legacy batch 저장값 | 441 |
| 원 쇼핑몰 source 테이블 | 0 |

`DIFF` 28건은 모두 쿠팡이다.

| 쿠팡 API 유형 | 행 | 70%식 정확 일치 | 1원 이내 일치 | 절대오차 합 | 최대오차 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `RESERVE` | 6 | 3 | 6 | 3원 | 1원 |
| `WEEKLY` | 22 | 18 | 22 | 4원 | 1원 |

legacy `CoupangAPI.getSettlementData()`는 쿠팡 응답의 유형·대상액·정산액을 별도 계산 없이 저장한다. 따라서 `RESERVE`를 legacy 화면의 잔여 30% 산식과 동일시할 근거는 없다. 28건 모두 대상액의 70%와 1원 이내로 일치하므로 저장값 오류가 아니라 FastAPI 공통 검산식이 쿠팡 source 규칙을 반영하지 못한 오탐으로 판정한다.

나머지 441건은 원 쇼핑몰 거래 테이블이 복원 DB에 없어 저장 batch 값을 넘어선 1:1 replay가 불가능하다. 이 값은 보정하지 않는다.

## 통합원장 replay

| 검증 | 결과 |
| --- | ---: |
| 계약 | 7 |
| 상환 history | 388 |
| history 내부 잔액식 불일치 | 0 |
| 지급 상세 합계 | 55,686,548원 |
| 상환 상세 합계 | 54,772,944원 |
| 지급-상환 replay 잔액 | 913,604원 |
| 최신 history 잔액 | 909,988원 |
| 차이 | -3,616원 |

계약별 범위를 분해한 결과 지급 누적 차이는 0건이다. 상환 누적은 1개 계약만 차이가 있으며, 해당 계약은 상세 상환행이 0건이고 최초 history 누적상환액이 3,616원이다. 따라서 3,616원은 산식 오류가 아니라 상세 원장 없이 이관된 초기 누적상환액으로 확정한다.

원본 근거 없이 상세 상환행을 생성하면 안 된다. 후속 Backend 수정에서는 이 3,616원을 상세 거래와 구분된 초기 이관 누적상환액으로 검산에 포함했다. 원본 상세 자료가 확보되기 전까지 DB 상세 상환행은 생성하지 않는다.

## 검증 결과

- 신규 replay 도구: `scripts/replay_legacy_financial_formulas.py`
- replay 단위 테스트: `3 passed`
- 동일 DB 연속 replay: 결과 일치
- 기존 settlement strict audit: 통과
- 기존 redemption strict audit: 통과
- Moneybank 데이터 품질: 11/11 통과
- Prism 데이터 품질: 6개 규칙 중 5개 통과, 기존 PMS 최신쌍 누락 3건만 유지

## 결론과 후속 분리

1. PMS 2단계 점수 산식은 재현 완료했다. 거래 원천 1단계 replay는 원천 테이블 부재로 제한된다.
2. 정산 target 산식은 완료다. 쿠팡 28건은 source-specific 검산 규칙이 필요한 Backend 표시 오탐으로 확인됐다.
3. 통합원장 3,616원 차이는 초기 이관 누적상환액으로 설명 완료했다.
4. 이 문서의 최초 replay Batch에서는 코드·DB·운영 배포를 변경하지 않았다.
5. 쿠팡 검산 표시 보완과 통합원장 opening repayment 표시는 각각 후속 Backend 수정 Batch에서 반영했다.

## 후속 수정: 쿠팡 source-specific 검산

사용자 승인 후 쿠팡 `RESERVE`·`WEEKLY` 행에 한해 `ROUND_HALF_UP(target * 0.7)`과 저장 정산액의 차이가 1원 이내이면 `SOURCE_RECONCILED`로 판정하도록 Backend 표시 검산을 보완했다. 이 규칙은 이상 표시만 교정하며 DB 원본 금액을 수정하지 않는다.

개발 DB 전체 469건 재검증 결과는 `SOURCE_RECONCILED` 28건, 기존 batch 보존 441건, 실제 `DIFF` 0건이다. 원 쇼핑몰 API 호출이나 신규 데이터 수집은 수행하지 않았다. 상세 구현·검증 기록은 `2026-08-12_CUBICI_COUPANG_SETTLEMENT_SOURCE_RECONCILIATION.md`를 따른다.

## 후속 수정: 통합원장 초기 이관 상환액

상세 상환행이 0건이고 최초·최신 history 누적값으로 완전히 설명되는 1개 계약의 3,616원을 `초기이관 상환액`으로 별도 집계했다. 일반 상환 누계 54,772,944원은 유지하고, 검산용 상환 누계에만 3,616원을 포함해 54,776,560원으로 계산한다. 이에 따라 지급 55,686,548원에서 차감한 검산 잔액과 최신 history 잔액은 모두 909,988원이며 차이는 0원이다.

DB 원본과 상세 상환행은 변경하지 않았고 관리자 통합 화면에는 `초기이관 상환: 3,616원`, `초기이관 포함 일치`로 표시한다. 상세 구현·검증 기록은 `2026-08-12_CUBICI_LEDGER_OPENING_REPAYMENT_RECONCILIATION.md`를 따른다.
