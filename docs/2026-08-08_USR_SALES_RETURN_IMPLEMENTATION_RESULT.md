# U11 반품/교환 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-SALES-RETURN-PC`, `USR-SALES-RETURN-MOBILE`
- Route: `/cubici/salesInfo/return`
- PC 기준: `docs/reference/lv-ui/user/reference/pc/01_sub_5반품교환.jpg`
- 구조 기준: `240130_큐빅아이/c2p2.html`
- Mobile 기준: 직접 캡처가 없어 승인된 U07 반응형 규칙 적용
- Backend와 DB schema/write 변경 없음

## 구현 결과

- LV의 매출정보 서브 비주얼과 반품/교환 활성 탭 복원
- 진행상태, 쇼핑몰, 제품명, 기간, 신청일자 검색 패널 복원
- LV 기준 고정 4열과 이동 12열에 해당하는 16열 반품/교환 표 구현
- 주문번호 선택 시 기존 반품/교환 상세 정보 열기 기능 유지
- 반품/교환 상태 구분, 검색 API query, 정렬, 페이지 이동, CSV 다운로드 유지
- 주문건수, 반품금액, 교환금액 합계 영역 복원
- 모바일은 서비스 메뉴와 하단 GNB를 유지하고 표/합계만 내부 가로 스크롤 적용

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 통과
- 검증 항목: 검색 query, 16열 표, 반품/교환 상태, 주문 상세, CSV 다운로드, 페이지 이동, 모바일 overflow, 후보 이미지
- route HTTP 응답: 200
- 페이지 전체 가로 overflow 없음, 표 영역 내부 가로 overflow 확인

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-SALES-RETURN-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-SALES-RETURN-MOBILE/approved/approved-react.png`
- 사용자 승인: 2026-08-08

## 진행률

- U11 화면 복원율: 100% (사용자 승인 완료)
- U11 기능 구현율: 80%
- 사용자 화면 평균 화면 복원율: 66.2% (U12 후보 포함)
- 사용자 화면 평균 기능 구현율: 76.3% (U12 구현 포함)
- 사용자 화면 시각 승인 완료: 11/26

## 미완료 항목

- 현재 `/sales/returns` API가 제공하지 않는 상품명, 구매자, 수령자, 재배송 정보의 실제 데이터 매핑
- 보기설정의 실제 표시 열 선택 기능
- 전체 검색 결과 기준 반품/교환 건수와 금액 합계 API 검증
- Docker 개발 DB 실제 데이터 focused 회귀검증

## 다음 단일 Batch

- U12 정산 캘린더(`/cubici/calculateInfo/calendar`) 후보 이미지 사용자 승인
