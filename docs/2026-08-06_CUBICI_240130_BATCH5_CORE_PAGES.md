# Cubici 240130 UI Migration - Batch 5 Core Pages

## 범위

- 사용자 페이지 통합정보, 매출정보, 정산정보 본문 UI를 240130 최종 UI 소스 기준으로 이식했다.
- React/FastAPI 구조와 기존 API 조회/집계 로직은 유지했다.
- backend/API, 관리자 화면, 운영 배포는 이번 Batch 5 범위에서 수정하지 않았다.

## 참조 원본

- `240130_큐빅아이/c1p1.html`: 통합정보 당월현황
- `240130_큐빅아이/c1p2.html`: 통합정보 매출분석
- `240130_큐빅아이/c1p3.html`: 통합정보 상품분석
- `240130_큐빅아이/c2p1.html`: 매출정보 판매현황
- `240130_큐빅아이/c2p2.html`: 매출정보 반품/교환
- `240130_큐빅아이/c3p1.html`: 정산정보 정산캘린더
- `240130_큐빅아이/c3p2.html`: 정산정보 정산상세

## 변경 파일

- `user-web/src/shared/UserCore.jsx`
  - `PageTitle`을 240130 `visual-wrap` 구조로 변경했다.
  - `Tabs`를 240130 `sub-nav-wrap/sub-nav` 구조로 변경했다.
- `user-web/src/pages/HomePages.jsx`
  - 통합정보 `tab1/tab2/tab3` 본문을 `content-wrap c1p*`, `table-wrap`, `trans-table/basic-table`, `chart-wrap` 구조로 변경했다.
  - 기존 API 집계 값은 유지하고 240130 차트 이미지를 시각 기준으로 배치했다.
- `user-web/src/pages/CommercePages.jsx`
  - 매출/반품/정산 상세 화면을 240130 `top-form-wrap`, `basic-table`, `table-top` 구조로 변경했다.
  - 정산 캘린더에 240130 `calendar-wrap` 형식의 월간 그리드를 추가했다.
  - CSV 다운로드, 필터, 페이지네이션, 상세 펼침 로직은 유지했다.
- `user-web/src/styles/final-ui-foundation.css`
  - Batch 5 대상 화면의 PC/모바일 레이아웃 보정 CSS를 추가했다.
  - 모바일에서 240130 PC 폭이 남아 생기는 1120px horizontal overflow를 보정했다.
- `docs/batch5_core_pages_smoke/`
  - focused smoke 결과 JSON과 주요 스크린샷을 저장했다.

## 검증

- `vite build`: 통과.
- focused smoke:
  - 대상 route: `/cubici/integratedInfo/tab1`, `/cubici/integratedInfo/tab2`, `/cubici/integratedInfo/tab3`, `/cubici/salesInfo/sales`, `/cubici/salesInfo/return`, `/cubici/calculateInfo/calendar`, `/cubici/calculateInfo/details`
  - PC 1440x960, Mobile 390x844에서 확인.
  - 모든 대상 route에서 `visual-wrap`, `sub-nav`, `final-core-page`, table/calendar 본문 class 렌더링 확인.
  - 모바일 `documentElement.scrollWidth`: 390으로 확인.
  - `/final-ui/static` missing asset: 0건.
- 검증 중 `/v1/api` 요청은 UI 렌더링 확인 목적상 차단했다.

## 제한 사항

- 통합정보 차트는 실제 chart engine migration이 아니라 240130 최종본 이미지 기반 시각 재현이다.
- 통합정보의 비교 산식은 현재 React 집계 기준이며 legacy 산식 검산은 별도 잔여 작업이다.
- 정산 캘린더는 기존 정산 API 결과를 날짜별로 묶어 월간 grid에 표시한다. 240130의 jQuery calendar behavior를 그대로 이식한 것은 아니다.
- 기존 legacy/global CSS의 `/resources/...` build warning은 남아 있다. 이번 Batch 5에서 추가한 final UI asset 누락은 없다.

## 보수적 진행률

- 사용자 페이지 전체 Batch 기준: 45%.
- 완료: Batch 1~5.
- 남은 주요 단계:
  - Batch 6: 머니뱅크 서비스소개/신청/심사/현황 계열 UI 이식.
  - Batch 7: 고객지원/마이페이지/요금제/404 등 보조 페이지 UI 이식.
  - Batch 8: 모바일 세부 polish 및 legacy 시각 차이 축소.
  - Batch 9: 사용자 페이지 회귀검증, API 연동 확인, 운영 배포 준비.
