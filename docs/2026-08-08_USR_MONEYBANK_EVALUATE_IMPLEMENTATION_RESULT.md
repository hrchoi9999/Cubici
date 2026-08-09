# U16 머니뱅크 검토·심사 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: 구매자금 선지급, 매출 선정산 검토·심사 PC/모바일 4개 상태
- Routes: `/moneybank/advPay/evaluate`, `/moneybank/advcalc/evaluate`
- LV 기준: `240130_큐빅아이/c4p2_2.html`
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- LV 머니뱅크 비주얼, 서비스 신청 탭, `02 검토 및 심사` 활성 단계 복원
- 심사 설명문과 4단계 `신청자격→정보취합→신용평가→종합심사` 진행 표시 복원
- 기본정보 8개 항목과 선지급/선정산 대상 쇼핑몰 로고 복원
- 지급율, 주문 한도, 계약기간, 최대 미상환금액, 수수료율, 평가등급 심사결과 표 구현
- 심사결과 및 이용조건 안내와 동의/거절 행동을 LV 하단 구조로 정리
- PC 4열 심사 단계·3열 정보표, 모바일 2열 심사 단계·1열 정보표 적용

## 기능 보존·보강

- 기존 계약 목록 상태 조회와 새로고침 유지
- 계약 상세 API를 추가 활용해 실제 계약 쇼핑몰·수수료·한도 정보 표시
- 조건제시 상태의 이용조건 동의/거절 `PUT /v1/api/contracts/{mbid}/status` 로직 유지
- 동의 완료 후 상품별 계약체결 route로 전환
- 서류 보완, 진행 신청 없음, 계약 준비 상태의 다음 행동 유지

## 검증

- production build: 통과
- Playwright focused E2E: 2/2 통과
- 검증 항목: 2개 상품 route, LV 섹션·심사단계, 계약 상세, 쇼핑몰 로고, 심사결과, 조건동의 PUT payload, 계약체결 전환, PC/모바일 overflow
- 모바일 심사 단계·기본정보 간 겹침 보정 후 재검증 통과
- PC/모바일 페이지 전체 가로 overflow 없음
- preview 서버 종료 확인

## 승인 이미지

- 구매자금 선지급 PC: `docs/reference/lv-ui/work/USR-MONEYBANK-EVALUATE-ADVPAY-PC/approved/approved-react.png`
- 구매자금 선지급 Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-EVALUATE-ADVPAY-MOBILE/approved/approved-react.png`
- 매출 선정산 PC: `docs/reference/lv-ui/work/USR-MONEYBANK-EVALUATE-ADVCALC-PC/approved/approved-react.png`
- 매출 선정산 Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-EVALUATE-ADVCALC-MOBILE/approved/approved-react.png`
- LV 기준 보관: `docs/reference/lv-ui/work/USR-MONEYBANK-EVALUATE-ADVPAY-PC/source/c4p2_2.html`

## 진행률

- U16 화면 복원율: 100% (사용자 승인 완료)
- U16 기능 구현율: 85%
- 사용자 화면 평균 화면 복원율: 77.7% (U17 후보 반영)
- 사용자 화면 평균 기능 구현율: 78.1% (U17 focused 검증 반영)
- 사용자 화면 시각 승인 완료: 16/26

## 미완료

- 실 운영 DB의 신청→심사결과 제시→사용자 동의→계약체결 lifecycle E2E
- 심사 상태별 운영 데이터 지급율·한도·수수료 산식 검산
- 신용대출 심사 workflow는 서비스 준비 전이므로 제외

## 다음 단일 Batch

- U17 머니뱅크 서비스현황 후보 이미지 사용자 승인
- 승인 후 U18 서비스공지 목록 화면 복원
