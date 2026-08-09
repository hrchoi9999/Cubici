# U13 정산 상세 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-SETTLEMENT-DETAIL-PC`, `USR-SETTLEMENT-DETAIL-MOBILE`
- Route: `/cubici/calculateInfo/details`
- PC 기준: `docs/reference/lv-ui/user/reference/pc/01_sub_7정산상세.jpg`
- 구조 기준: `240130_큐빅아이/c3p2.html`
- Mobile 기준: 직접 캡처가 없어 승인된 사용자 반응형 규칙 적용
- Backend와 DB schema/write 변경 없음

## 구현 결과

- LV의 정산정보 서브 비주얼과 정산 상세 활성 탭 복원
- 진행상태, 쇼핑몰, 제품명, 시작·종료일, 보기설정 검색 패널 복원
- LV 기준 14열 정산 표와 좌측 고정 4열 구현
- 주문번호 선택 시 정산 상세정보 modal 표시
- 정산상태 구분, 검색 API query, 정렬, 페이지 이동, CSV 다운로드 유지
- 총 주문건수와 현재 조회 페이지 정산입금액 합계 영역 복원
- 모바일은 서비스 메뉴와 하단 GNB를 유지하고 표/합계만 내부 가로 스크롤 적용
- API에 없는 주문·상품·구매자 필드는 임의 값으로 대체하지 않고 `-`로 표시

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 통과
- 검증 항목: 검색 query, 14열 표, 좌측 고정 열, 정산상태, 상세 modal, CSV 다운로드, 페이지 이동, 모바일 overflow, 후보 이미지
- 페이지 전체 가로 overflow 없음, 표 영역 내부 가로 overflow 확인

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-SETTLEMENT-DETAIL-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-SETTLEMENT-DETAIL-MOBILE/approved/approved-react.png`
- 기준 자료 보관: `docs/reference/lv-ui/work/USR-SETTLEMENT-DETAIL-PC/source/`
- 사용자 승인: 2026-08-08

## 진행률

- U13 화면 복원율: 100% (사용자 승인 완료)
- U13 기능 구현율: 75%
- 사용자 화면 평균 화면 복원율: 70.8% (U14 후보 포함)
- 사용자 화면 평균 기능 구현율: 76.7% (U14 구현 포함)
- 사용자 화면 시각 승인 완료: 13/26

## 미완료 항목

- 현재 정산 API가 제공하지 않는 실제 주문번호, 상품명·번호, 구매자, 판매수량 필드 매핑
- 전체 검색 결과 기준 누적 정산 입금액 aggregate endpoint 또는 검증
- 보기설정의 페이지 표시 수와 실제 표시 열 선택 기능
- 현재 CSV 다운로드를 legacy와 같은 실제 XLSX 형식으로 바꾸는 작업
- Docker 개발 DB 실제 데이터 focused 회귀검증

## 다음 단일 Batch

- U14 머니뱅크 서비스소개 화면군 후보 이미지 사용자 승인
