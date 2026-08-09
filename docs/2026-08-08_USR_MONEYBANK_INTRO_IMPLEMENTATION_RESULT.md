# U14 머니뱅크 서비스소개 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: 구매자금 선지급, 매출 선정산, 신용대출 3개 상품 상태의 PC/모바일 화면
- Routes: `/moneybank/intro/advpay`, `/moneybank/intro/advcalc`, `/moneybank/intro/creditpay`
- PC 기준: `docs/reference/lv-ui/user/reference/pc/4 머니뱅크_1 서비스소개.jpg`
- 전체 상태와 구조 기준: `240130_큐빅아이/c4p1.html`
- Mobile 기준: 직접 캡처가 없어 LV 원본 반응형 CSS와 승인된 사용자 공통 규칙 적용
- Backend와 DB schema/write 변경 없음

## 구현 결과

- LV 머니뱅크 서브 비주얼과 서비스 소개 활성 메뉴 복원
- 소개 문구 좌측, 인물 이미지 우측의 PC 배치와 모바일 세로 배치 복원
- 신청, 평가 및 심사, 계약 체결, 서비스 이용의 원형 4단계 복원
- 구매자금 선지급, 매출 선정산, 신용대출 3개 route 상태와 활성 탭 구현
- 상품별 원문 제목, 설명, 특장점, 신청대상, 준비서류 복원
- 매출 선정산의 선정산 가능 쇼핑몰 카드와 11번가·스마트스토어·쿠팡 로고 복원
- 상품별 신청 link를 기존 React 신청 route에 연결
- 모바일 하단 GNB를 6열 고정 구조로 보정

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 시나리오 통과
- 검증 화면: 3개 상품 상태 × PC/모바일 = 6개
- 검증 항목: 상품별 활성 탭, 원문 콘텐츠, 카드 수, 쇼핑몰 로고, 신청 경로, 이미지 로딩, 모바일 GNB, 전체 페이지 overflow
- PC/모바일 페이지 전체 가로 overflow 없음

## 승인 이미지

- 구매자금 선지급 PC: `docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-ADVPAY-PC/approved/approved-react.png`
- 구매자금 선지급 Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-ADVPAY-MOBILE/approved/approved-react.png`
- 매출 선정산 PC: `docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-ADVCALC-PC/approved/approved-react.png`
- 매출 선정산 Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-ADVCALC-MOBILE/approved/approved-react.png`
- 신용대출 PC: `docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-CREDIT-PC/approved/approved-react.png`
- 신용대출 Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-CREDIT-MOBILE/approved/approved-react.png`
- 기준 자료 보관: `docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-ADVPAY-PC/source/`

## 진행률

- U14 화면 복원율: 100% (사용자 승인 완료)
- U14 기능 구현율: 90%
- 사용자 화면 평균 화면 복원율: 73.1% (U15 후보 반영)
- 사용자 화면 평균 기능 구현율: 77.1% (U15 focused 검증 반영)
- 사용자 화면 시각 승인 완료: 14/26

## 미완료 항목

- 신용대출은 서비스 준비 전으로, 사용자 확인에 따라 의도된 미완료 상태로 유지
- 실제 본인확인 외부 API와 운영 DB 신청 lifecycle은 운영 통합 검증 잔여

## 다음 단일 Batch

- U15 머니뱅크 서비스신청 PC/모바일 후보 이미지 사용자 승인
