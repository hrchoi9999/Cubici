# USR-MAIN-AUTH-PC 복원 구현 결과

작업일: 2026-08-08

## 범위

- 화면: 사용자 메인(로그인 후/PC)
- Route: `/`, `/main` authenticated state
- 기준: `240130_큐빅아이/index-login.html`, `pc_index_login.png`
- 후보: `docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/candidate/candidate-react.png`
- 예외: 사용자가 승인한 현재 Footer 회사정보/색상/높이 유지

## 구현

- 인증 상태에서만 LV 로그인 메인 dashboard를 렌더링한다.
- 로그인 메인 Header만 남색/흰색 logo/menu 변형을 사용한다.
- 매출총액, 정산입금, 머니뱅크 서비스 이용잔액, 총 이용원금, 총 상환원금, 최근 이용내역을 복원했다.
- 주요 서비스 4개와 기존 상세 route를 유지했다.
- read-only API `GET /v1/api/accounts/me/dashboard-summary`를 추가했다.

## 데이터 기준

| 표시 | 집계 기준 |
|---|---|
| 매출총액 | 인증 사용자의 활성 쇼핑몰과 연결된 `sale.sales_amount` 합계 |
| 정산입금 | 인증 사용자의 활성 쇼핑몰과 연결된 `settlement.settlement_amount` 합계 |
| 서비스 이용잔액 | 사용자 계약별 최신 `moneybank_redemption_history.outstanding_balance` 합계 |
| 총 이용원금 | 사용자 계약의 `moneybank_redemption_provision.total_provision_amount` 합계 |
| 총 상환원금 | 사용자 계약의 `moneybank_redemption_repayment.repayment_amount` 합계 |
| 최근 이용내역 | 지급/상환 발생일 기준 최근 5건 중 화면에는 2건 표시 |

## 검증

- FastAPI focused route test: 1 passed
- React production build: 성공
- Playwright PC focused test: 1 passed
- 검증 항목: 인증 전용 구조, Header 색상, LV 핵심 제목/금액, 서비스 카드 4개, 카드 여백, hero 높이
- 후보 이미지 크기: 1920 x 2207

## 잔여

- 운영 PostgreSQL 실제 데이터로 집계 결과를 대조하지 않았다.
- 사용자 후보 이미지 승인이 남았다.
- 따라서 화면 복원율 80%, 기능 구현율 80%로 기록한다.
