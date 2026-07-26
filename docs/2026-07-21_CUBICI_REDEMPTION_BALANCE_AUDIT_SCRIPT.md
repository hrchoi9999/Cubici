# Cubici 상환 잔액 검산 스크립트

## 작업 결과

- 이관 DB의 상환 잔액 산식 불일치를 반복 점검하는 읽기 전용 스크립트를 추가했다.
- 검산 대상은 `moneybank_redemption_history`와, 존재하는 경우 `moneybank_redemption_operation_history`이다.
- 기본 산식은 `outstanding_balance = cumulative_provision_amount - cumulative_repayment_amount`로 둔다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `scripts/audit_redemption_balances.py` | PostgreSQL 상환 잔액 검산 CLI |
| `db/postgres/migrations/009_reconcile_redemption_history_balance.sql` | 상환 history 잔액 산식 보정 SQL |
| `docs/2026-07-21_CUBICI_REDEMPTION_BALANCE_AUDIT_SCRIPT.md` | 개발 및 검증 기록 |

## 검산 항목

1. 전체 history row의 미상환잔액 산식 불일치
2. 계약별 최신 history의 미상환잔액 산식 불일치
3. 음수 누적 지급액, 누적 상환액, 미상환잔액
4. operation history의 신규 누적값 산식 불일치
5. 취소 operation link의 정합성

## 실행 결과

2026-07-21 로컬 PostgreSQL 기준:

| 항목 | 결과 |
|---|---:|
| `moneybank_redemption_history` row | 388 |
| history 보유 계약 수 | 6 |
| 전체 history 산식 불일치 row | 1 |
| 계약별 최신 history 산식 불일치 | 1 |
| 음수 누적/잔액 row | 0 |
| operation history table 존재 여부 | 존재 |
| operation history row | 0 |
| operation 산식 불일치 row | 0 |
| 취소 link 불일치 row | 0 |

확인된 불일치:

- `MPH0823122` 최신 history 1건에서 `cumulative_provision_amount=3616`, `cumulative_repayment_amount=3616`, `outstanding_balance=3616`이다.
- 산식 기준 계산 잔액은 `0`이므로 차이는 `3616`이다.
- 기존에 논의한 상환 잔액 산식 불일치 건으로 판단했다.

## 보정 결과

- `scripts/audit_redemption_balances.py --apply --limit 5`를 실행해 로컬 PostgreSQL 데이터를 보정했다.
- 보정 row 수: 1건
- 보정 후 전체 history 산식 불일치 row: 0건
- 보정 후 계약별 최신 history 산식 불일치: 0건
- 보정 SQL은 `db/postgres/migrations/009_reconcile_redemption_history_balance.sql`에 일반화해 기록했다.

## 실행 방법

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe scripts\audit_redemption_balances.py
```

JSON 출력:

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe scripts\audit_redemption_balances.py --json
```

불일치가 있으면 실패 코드로 종료:

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe scripts\audit_redemption_balances.py --strict
```

## 판단 기준

- 기존에 확인된 상환 잔액 산식 불일치는 로컬 개발 DB에서 보정했다.
- 신규 write API에서 생성하는 row는 산식 일치를 강제한다.
- 운영 전 테스트 DB 전체 reconciliation 단계에서 불일치 row를 업무 정책에 따라 보정하거나 별도 예외 처리한다.

## 다음 액션

- 이 스크립트를 테스트 운영 전후 반복 실행한다.
- 불일치 row가 남아 있으면 legacy 화면 표시값과 Python API 표시값의 차이를 계약별로 대조한다.
