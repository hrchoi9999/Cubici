# USR-LV-U09 상품분석 동적 그래프 보완

기준일: 2026-08-10

## 범위

- 사용자 Route: `/cubici/integratedInfo/tab3`
- LV 기준: `docs/reference/lv-ui/user/reference/pc/01_sub_3상품분석.jpg`
- Legacy 산식 기준: `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/cubici/infoIntegrated/tab3.jsp`
- DB schema와 저장 기능은 변경하지 않는다.

## 구현

- `GET /v1/api/sales/product-analysis` 읽기 전용 집계 API 추가
- 연결된 사용자 쇼핑몰 범위와 쇼핑몰/기간 필터 접근통제 적용
- 목록 API 100건 제한과 무관하게 DB 전체 대상 집계
- 쇼핑몰 결제 비중: `payment_amount` 합계 기반 doughnut
- 가격할인 및 판촉: `payment_amount`, `sales_amount`, 할인율 mixed chart
- 할인율: `discount_amount`를 우선하고 값이 없으면 `sales_amount - payment_amount` 사용
- TOP10 매출상품: 상품별 `payment_amount` 합계 내림차순
- Chart.js canvas 기반 PC/모바일 반응형 표시
- 데이터가 없을 때 임의 샘플 대신 빈 상태 표시

## 검증

- Backend: `83 passed`
- User Web production build: 통과
- Playwright PC: 통과
- Playwright Mobile: 통과
- 정적 차트 이미지 0개, 동적 canvas 3개, canvas 픽셀 생성 확인
- 필터 재조회 시 주문 API와 집계 API 모두 `shop_type`, `from_date`, `to_date` 전달 확인
- Docker: `cubici-postgres-dev` healthy, `127.0.0.1:55432`
- 개발 DB 집계 SQL: `sale` 2,390건, 쇼핑몰 유형 5개, 상품 572개 대상 실행 통과

## 잔여

- Legacy DB의 `PRODUCT_PRICE`, `ORDER_PRICE`, `CAL_PRICE`, `PROMOTION_RATE`와 현재 PostgreSQL 필드 의미를 업무 기준으로 최종 검산한다.
- 운영 배포와 운영 계정 데이터 확인은 전체 배포 Batch에서 수행한다.

## 진행률

- U09 화면 복원율: 100%
- U09 내부 기능 구현율: 95%
- 사용자 전체 평균 화면 복원율: 100%
- 사용자 전체 평균 내부 기능 구현율: 90.4%

## 승인

- 2026-08-10 사용자 승인 완료
- PC 승인본: `docs/reference/lv-ui/work/USR-INTEGRATED-PRODUCT-PC/approved/approved-react.png`
- Mobile 승인본: `docs/reference/lv-ui/work/USR-INTEGRATED-PRODUCT-MOBILE/approved/approved-react.png`
