# Cubici 정산/상환 산식 검산

## 작업 결과

- 관리자 기능 중 정산/상환 금액 산식을 로컬 PostgreSQL 기준으로 검산했다.
- 상환 잔액 산식은 기존 기준인 `outstanding_balance = cumulative_provision_amount - cumulative_repayment_amount`로 확인했다.
- 정산대상액 산식은 현재 DB 기준 `settlement_target_amount = total_sale - service_fee`로 확인했다.
- `settlement_amount`는 `total_sale`, `service_fee`, 각종 차감 필드로 재계산되는 값이 아니라 legacy 저장 정산액 성격으로 판단했다.
- 실제 DB row 보정은 수행하지 않았다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `scripts/audit_settlement_formulas.py` | 정산 산식 검산 CLI 추가 |
| `docs/2026-07-23_CUBICI_SETTLEMENT_REDEMPTION_FORMULA_AUDIT.md` | 정산/상환 산식 검산 결과 기록 |

## 검증 결과

### 정산

실행 명령:

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe D:\Alt_CSM\Cubici\scripts\audit_settlement_formulas.py --strict --limit 3
```

결과:

| 항목 | 값 |
| --- | ---: |
| settlement row | 469 |
| `settlement_target_amount = total_sale - service_fee` 불일치 | 0 |
| `settlement_amount = total_sale - service_fee` 일치 row | 0 |
| `settlement_amount = settlement_target_amount - service_fee` 일치 row | 0 |
| full deduction 후보 산식 일치 row | 0 |

정산 합계:

| 컬럼 | 합계 |
| --- | ---: |
| `total_sale` | 1,735,500 |
| `service_fee` | 181,063 |
| `settlement_target_amount` | 1,554,437 |
| `settlement_amount` | 61,554,507 |
| `pending_released_amount` | 0 |
| `seller_discount_coupon` | 0 |
| `downloadable_coupon` | 0 |
| `seller_service_fee` | 0 |
| `store_fee_discount` | 0 |
| `debt_of_last_week` | 0 |

정산 유형별 합계:

| settlement_type | status | row | total_sale | service_fee | settlement_target_amount | settlement_amount |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| ACCOUNT | DONE | 422 | 0 | 0 | 0 | 60,492,933 |
| CHARGE_AMT | DONE | 19 | 0 | 0 | 0 | -26,528 |
| RESERVE | DONE | 3 | 475,720 | 47,890 | 427,830 | 299,479 |
| RESERVE | SUBJECT | 3 | 52,000 | 5,264 | 46,736 | 32,715 |
| WEEKLY | DONE | 16 | 1,044,110 | 111,091 | 933,019 | 653,112 |
| WEEKLY | SUBJECT | 6 | 163,670 | 16,818 | 146,852 | 102,796 |

판단:

- 정산대상액 산식은 전체 row에서 불일치가 없다.
- `ACCOUNT`, `CHARGE_AMT` 유형은 `total_sale`, `service_fee`, `settlement_target_amount`가 0이어도 `settlement_amount`가 존재한다.
- 따라서 `settlement_amount`는 화면 표시와 운영 이력 보존을 위해 DB 저장값을 그대로 사용하는 것이 맞다.
- `settlement_amount` 산출 원천이 별도 sale 집계 또는 legacy 배치 로직인지 여부는 추가 확인 대상이다.

### 상환

실행 명령:

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe D:\Alt_CSM\Cubici\scripts\audit_redemption_balances.py --strict --limit 3
```

결과:

| 항목 | 값 |
| --- | ---: |
| history row | 388 |
| history contract | 6 |
| history 잔액 산식 불일치 | 0 |
| 계약별 최신 history 잔액 산식 불일치 | 0 |
| 음수 누적/잔액 row | 0 |
| operation history table 존재 | true |
| operation history row | 0 |
| operation 잔액 산식 불일치 | 0 |
| 취소 link 불일치 | 0 |

판단:

- 현재 이관 DB의 상환 history 잔액 산식은 정상이다.
- operation history table은 존재하지만 현재 row가 0건이므로, 신규 지급/상환/취소 입력 E2E에서 operation 누적 산식을 별도로 계속 검증해야 한다.

## 다음 액션

1. 사용자용 페이지 구현으로 넘어간다.
2. 정산 `settlement_amount`의 원천 산출 로직은 후속 작업에서 sale 집계/legacy 배치 기준으로 추가 확인한다.
3. 상환 operation history는 신규 입력/취소 테스트 데이터가 쌓이면 다시 검산한다.

