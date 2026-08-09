# U24 요금/머니뱅크 상세 LV 복원 결과

기준일: 2026-08-09

## 작업 범위

- 대상: 나의 요금과 머니뱅크 계약 상세 PC/모바일
- Route/state: `/cubici/mypage/myCharge`, `/moneybank/current/:mbid`
- LV 기준: `240130_큐빅아이/c6p2.html`, `240130_큐빅아이/c4p3.html`
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- 나의 요금: 현재 요금제 3분할 요약, 4개 변경 요금제, 결제 미리보기, 서비스 이용내역 표 복원
- 머니뱅크 상세: LV `이용조건` 정보표를 계약 상세 상단에 복원
- 계약 상세의 이용조건 동의, 전자서명, 해지신청, 쇼핑몰, 수수료, 제출서류, 상환 요약과 이력 기능 유지
- 모바일에서 요금제 카드를 2열, 이용조건을 1열 정보표로 재배치하고 내부 표는 가로 스크롤 처리

## 기능 상태

- 운영 요금제 목록 조회 `GET /v1/api/preferences/charges` 유지
- 계약 상세, 문서, 지급·상환 이력 API 계약 유지
- 사용자별 현재 요금제, 결제·이용내역, 요금제 변경·결제 API는 미제공 상태로 명시
- 미제공 API를 임의 데이터로 가장하지 않고 화면에서 연동 전 상태와 비활성 결과를 표시

## 검증

- production build: 통과, 2.25초
- Playwright focused smoke: 4/4 통과, 9.3초
- 검증 항목: LV 원본 PC/모바일 렌더링, 요금제 선택, 미연동 결제 안내, 계약 이용조건과 기존 기능 섹션, PC/모바일 overflow
- 같은 Docker DB 환경 blocker에 대한 preflight 반복은 생략하고 API mock으로 화면 계약을 검증

## 기준 및 후보 이미지

- 요금 PC LV: `docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-PC/reference/lv-reference-rendered.png`
- 요금 PC 승인본: `docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-PC/approved/approved-react.png`
- 요금 Mobile LV: `docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-MOBILE/reference/lv-reference-rendered.png`
- 요금 Mobile 승인본: `docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-MOBILE/approved/approved-react.png`
- 머니뱅크 상세 PC LV: `docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-PC/reference/lv-reference-rendered.png`
- 머니뱅크 상세 PC 승인본: `docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-PC/approved/approved-react.png`
- 머니뱅크 상세 Mobile LV: `docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-MOBILE/reference/lv-reference-rendered.png`
- 머니뱅크 상세 Mobile 승인본: `docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-MOBILE/approved/approved-react.png`

## 진행률

- U24 화면 복원율: 100% (사용자 승인 완료)
- U24 기능 구현율: 80%
- 사용자 화면 평균 화면 복원율: 95.4% (U24 승인 시점)
- 사용자 화면 평균 기능 구현율: 82.3%
- 사용자 화면 시각 승인 완료: 24/26

## 미완료

- 사용자별 요금·결제·이용내역 Backend API 설계 및 연동
- Docker PostgreSQL 기동 후 실제 계약 상세와 지급·상환 데이터 재검증
- LV `c4p3`의 지급현황·상환현황 필터와 현재 계약 상세 파생 화면의 역할 경계 최종 확정
- 전체 사용자 회귀검증과 Git/운영 배포는 사용자 화면 전체 완료 후 수행

## 승인 상태

- U24 요금/머니뱅크 상세 PC·모바일 이미지 사용자 승인 완료
