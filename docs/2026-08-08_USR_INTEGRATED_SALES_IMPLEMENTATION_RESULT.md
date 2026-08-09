# U08 통합정보 매출분석 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-INTEGRATED-SALES-PC`, `USR-INTEGRATED-SALES-MOBILE`
- Route: `/cubici/integratedInfo/tab2`
- PC 기준: `docs/reference/lv-ui/user/reference/pc/01_sub_2매출분석.jpg`
- 구조 기준: `240130_큐빅아이/c1p2.html`
- 차트 이미지: `user-web/public/final-ui/static/img/sub/chart-2.jpg`
- Mobile 기준: 직접 캡처가 없어 승인된 U07 반응형 규칙 적용
- 유지 예외: 사용자 승인 완료된 현재 회사정보 Footer

## 구현 결과

- LV의 PC 헤더, 서브 비주얼, 3개 탭, 기준일, 검색 조건, 차트 구조 복원
- 현재 React에 추가되어 있던 LV 비대응 요약 테이블 제거
- 쇼핑몰, 시작일, 종료일 검색 조건을 기존 판매 주문 API 쿼리에 반영
- 연결된 쇼핑몰만 선택 목록에 노출하고 기존 사용자 인증/shop scope 유지
- 모바일에서 서비스 메뉴, 2열 검색 조건, 가로 스크롤 차트, 하단 GNB 적용
- Backend와 DB schema/write 변경 없음

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 통과
- 검증 항목: 인증 화면, 활성 탭, LV 검색 폼, 불필요한 표 제거, 필터 API query, 모바일 overflow, 후보 이미지
- 검색 쿼리 검증: `shop_type`, `from_date`, `to_date` 반영 확인

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-INTEGRATED-SALES-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-INTEGRATED-SALES-MOBILE/approved/approved-react.png`
- 사용자 승인: 2026-08-08

## 진행률

- U08 화면 복원율: 100% (PC/모바일 후보 이미지 사용자 승인 완료)
- U08 기능 구현율: 75% (필터 API 연동 완료, 실 데이터 기반 차트 생성 잔여)
- 사용자 화면 평균 화면 복원율: 59.2%
- 사용자 화면 평균 기능 구현율: 74.8%
- 사용자 화면 시각 승인 완료: 8/26

## 다음 단일 Batch

- U09 통합정보 상품분석(`/cubici/integratedInfo/tab3`) 후보 이미지 사용자 승인
