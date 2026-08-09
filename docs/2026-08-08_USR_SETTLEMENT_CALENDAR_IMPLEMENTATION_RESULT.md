# U12 정산 캘린더 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-SETTLEMENT-CALENDAR-PC`, `USR-SETTLEMENT-CALENDAR-MOBILE`
- Route: `/cubici/calculateInfo/calendar`
- 직접 기준 화면 캡처는 없음
- 구조 및 반응형 기준: `240130_큐빅아이/c3p1.html`
- 보조 기준: 승인된 사용자 공통 header, mobile service nav, footer
- Backend와 DB schema/write 변경 없음

## 구현 결과

- LV의 정산정보 서브 비주얼과 정산 캘린더/정산 상세 탭 복원
- 이전 달, 다음 달, 오늘 이동과 연월·월 정산 총액 표시 구현
- 쇼핑몰 필터와 월 단위 API 조회 query 연계
- 일요일부터 토요일까지 고정 7열, 6주 캘린더 구현
- 일별 건수와 정산 금액 표시 및 날짜 선택 상세 modal 구현
- CSV 다운로드와 안내 tooltip 유지
- 모바일은 서비스 메뉴와 하단 GNB를 유지하고 7열 캘린더를 화면 폭 안에 배치

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 통과
- 검증 항목: 월 query, 월 이동, 쇼핑몰 필터, 합계, 7열 캘린더, 안내 tooltip, 상세 modal, CSV 다운로드, 모바일 overflow, 후보 이미지
- route HTTP 응답: 200
- PC/모바일 페이지 전체 가로 overflow 없음

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-SETTLEMENT-CALENDAR-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-SETTLEMENT-CALENDAR-MOBILE/approved/approved-react.png`
- 구조 원본 보관: `docs/reference/lv-ui/work/USR-SETTLEMENT-CALENDAR-PC/source/c3p1.html`
- 사용자 승인: 2026-08-08

## 진행률

- U12 화면 복원율: 100% (사용자 승인 완료)
- U12 기능 구현율: 80%
- 사용자 화면 평균 화면 복원율: 68.5% (U13 후보 포함)
- 사용자 화면 평균 기능 구현율: 76.5% (U13 구현 포함)
- 사용자 화면 시각 승인 완료: 12/26

## 미완료 항목

- 현재 API의 `limit=100` 상한으로 월 100건 초과 시 전체 집계가 잘릴 수 있어 집계 endpoint 또는 pagination 보완 필요
- Docker 개발 DB 실제 월 데이터 기준 합계와 일별 상세 회귀검증
- legacy 상세 modal 전체 필드와 API 필드 매핑 검증
- 현재 CSV 다운로드를 legacy와 같은 실제 XLSX 형식으로 바꾸는 작업
- 직접 기준 캡처가 없어 사용자 후보 이미지 승인 필요

## 다음 단일 Batch

- U13 정산 상세(`/cubici/calculateInfo/details`) 후보 이미지 사용자 승인
