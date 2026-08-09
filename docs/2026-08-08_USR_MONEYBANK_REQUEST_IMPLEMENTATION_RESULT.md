# U15 머니뱅크 서비스신청 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: 구매자금 선지급, 매출 선정산 신청 화면의 PC/모바일 4개 상태
- Routes: `/moneybank/advPay/request`, `/moneybank/advcalc/request`
- LV 기준: `240130_큐빅아이/c4p2_1.html`
- 직접 화면 캡처는 없으며 LV HTML, CSS, 이미지 자산을 1차 기준으로 사용
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- LV 머니뱅크 비주얼, 서비스 신청 탭, 3단계 신청 progress 유지
- `유지 정보`, `서비스 소개`, `대상 쇼핑몰`, `희망한도/계좌`, `동의서`, `신청서류` 순으로 LV 섹션 구조 복원
- 선지급의 B2B몰·희망한도와 선정산의 약관 상세 link를 상품별로 분리
- 쇼핑몰 로고를 LV 실제 자산 경로로 교체
- PC 3열 입력·서류 구조와 모바일 1열 구조 적용
- 신규 신청에서 빈 최근 계약 상태줄은 숨기고, 기존 계약 또는 API 오류가 있을 때만 표시

## 기능 보존

- 로그인 session과 연결 쇼핑몰 API 조회
- 계약 요약 API 조회 및 상태 새로고침
- 쇼핑몰 선택, B2B몰, 희망한도, 정산/주거래 계좌 입력
- 본인확인 mock, 약관 동의, 파일 형식·용량 검증
- 신청 저장 `/v1/api/contracts/requests` 및 신청 후 문서 업로드 로직 유지

## 검증

- production build: 통과
- Playwright focused E2E: 2/2 통과
- 검증 항목: 2개 상품 route, LV 섹션 구조, 상품별 field, 로고 로딩, 본인확인 mock, 약관, 신청 유효성 검사, PC/모바일 overflow
- PC/모바일 페이지 전체 가로 overflow 없음
- preview 서버 종료 확인

## 승인 이미지

- 구매자금 선지급 PC: `docs/reference/lv-ui/work/USR-MONEYBANK-REQUEST-ADVPAY-PC/approved/approved-react.png`
- 구매자금 선지급 Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-REQUEST-ADVPAY-MOBILE/approved/approved-react.png`
- 매출 선정산 PC: `docs/reference/lv-ui/work/USR-MONEYBANK-REQUEST-ADVCALC-PC/approved/approved-react.png`
- 매출 선정산 Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-REQUEST-ADVCALC-MOBILE/approved/approved-react.png`
- LV 기준 보관: `docs/reference/lv-ui/work/USR-MONEYBANK-REQUEST-ADVPAY-PC/source/c4p2_1.html`

## 진행률

- U15 화면 복원율: 100% (사용자 승인 완료)
- U15 기능 구현율: 85%
- 사용자 화면 평균 화면 복원율: 75.4% (U16 후보 반영)
- 사용자 화면 평균 기능 구현율: 77.7% (U16 focused 검증 반영)
- 사용자 화면 시각 승인 완료: 15/26

## 미완료

- 실제 본인확인 외부 API 연동
- 실 운영 DB를 사용한 신청 저장→문서 업로드→관리자 심사 E2E
- 신용대출 신청 workflow는 서비스 준비 전이므로 이 배치 대상에서 제외

## 다음 단일 Batch

- U16 머니뱅크 검토·심사 PC/모바일 후보 이미지 사용자 승인
