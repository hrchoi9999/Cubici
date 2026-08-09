# U07 통합정보 당월현황 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-INTEGRATED-CURRENT-PC`, `USR-INTEGRATED-CURRENT-MOBILE`
- Route: `/cubici/integratedInfo/tab1`
- PC 기준: `docs/reference/lv-ui/user/reference/pc/01_sub(최종).jpg`
- Mobile 기준: `docs/reference/lv-ui/user/reference/mobile/01_mobile_통합정보.jpg`
- 구조 기준: `240130_큐빅아이/c1p1.html`
- 차트 이미지: `user-web/public/final-ui/static/img/sub/chart-1.jpg`
- 유지 예외: 사용자 승인 완료된 현재 회사정보 Footer

## 구현 결과

- LV의 PC 헤더, 서브 비주얼, 3개 탭, 기준일, 당월 현황표, 차트 구조 복원
- 모바일 전용 4개 서비스 메뉴와 전치형 현황표, 가로 스크롤 차트, 하단 GNB 복원
- 현황표 행을 LV 기준 `당월/전월 동기/증감`으로 교정
- 로그인 사용자의 연결 쇼핑몰 범위로 당월 및 전월 동기 결제액, 주문건수, 정산입금액, 등록상품수 조회
- 기존 React/FastAPI 구조와 인증 흐름 유지, DB schema/write 변경 없음

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 통과
- 검증 항목: 인증, shop scope API 호출, 집계값/증감 표시, 모바일 헤더 전환, overflow, 후보 이미지
- Backend Python compileall: 통과
- Backend runtime/pytest: 로컬 환경의 `pytest` 및 PostgreSQL `libpq` wrapper 부재로 미실행
- SQL 정적 검증: placeholder 13개와 user parameter 13개 일치

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-INTEGRATED-CURRENT-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-INTEGRATED-CURRENT-MOBILE/approved/approved-react.png`
- 사용자 승인: 2026-08-08

## 진행률

- U07 화면 복원율: 100% (PC/모바일 후보 이미지 사용자 승인 완료)
- U07 기능 구현율: 80% (실 Docker DB 집계 및 산식 재검증 잔여)
- 사용자 화면 평균 화면 복원율: 56.9%
- 사용자 화면 평균 기능 구현율: 74.2%
- 사용자 화면 시각 승인 완료: 7/26

## 다음 단일 Batch

- U08 통합정보 매출분석(`/cubici/integratedInfo/tab2`) 후보 이미지 사용자 승인
