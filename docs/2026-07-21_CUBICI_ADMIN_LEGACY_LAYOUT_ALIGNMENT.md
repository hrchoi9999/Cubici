# Cubici 관리자 Legacy Layout 정렬

## 작업 결과

- React 관리자 화면을 legacy JSP의 공통 구조인 `subBox transparent > contentArea` wrapper 안에 배치했다.
- 정산/상환 목록 테이블에 legacy `m-shadowTable` class를 적용했다.
- React 전용 wrapper에 기본 font weight/size 기준을 지정해 legacy CSS 적용 기준과 맞췄다.
- 신청/정산/상환 검색 영역에 legacy `m-search` 스타일을 적용했다.
- 목록 영역을 `fixTable > overflowBox > m-shadowTable` 구조로 맞추고 하단 요약을 `fixBottom > tableTotal` 구조로 이동했다.
- React 목록에서는 legacy `overflowBox` 고정 높이 745px를 해제해 테이블과 하단 요약 사이의 과도한 공백을 제거했다.
- 검색폼은 4열 grid로 보정해 label 줄바꿈과 input 겹침을 방지했다.
- React 관리자 wrapper에서 legacy `#wrap`, `#header`의 1900px 고정 최소폭을 해제했다.
- 1440px 테스트 viewport에서 정산/상환 상세 패널의 가로 overflow를 제거했다.
- 상세 정보 테이블에 `detailInfoTable` class를 적용해 legacy 상세 블록처럼 흰색 배경과 약한 shadow를 사용하도록 정리했다.
- 상세 section 제목에 legacy bullet icon을 적용했다.
- 계약 조건, 서류 확인, 심사 메모, 상환 작업 폼의 입력/테두리/배경을 legacy `fwBox` 계열에 가깝게 조정했다.

## 변경 파일

- `admin-web/src/components/layout/AdminLayout.jsx`
- `admin-web/src/pages/SettlementManagementPage.jsx`
- `admin-web/src/pages/RedemptionManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-21_CUBICI_ADMIN_LEGACY_LAYOUT_ALIGNMENT.md`
- `reports/admin-legacy-align-request.png`
- `reports/admin-legacy-align-settlement.png`
- `reports/admin-legacy-align-redemption.png`
- `reports/admin-legacy-align-settlement-detail.png`
- `reports/admin-legacy-align-redemption-detail.png`

## 판단

- 기존 JSP는 다수 화면에서 `article.subBox`와 `div.contentArea`를 사용한다.
- React 화면이 이 wrapper 밖에 있으면 `style-sub.css`, `module.css`의 기존 spacing/font/table 규칙을 충분히 타지 못한다.
- 업무 로직은 유지하고, legacy CSS가 기대하는 markup 구조를 우선 맞춘다.
- 디자인/개발/테스트 시간을 줄이기 위해 신규 디자인 시스템을 만들지 않고 기존 Cubici 정적 자산과 class를 우선 재사용한다.
- React 전용 CSS는 기존 class로 해결되지 않는 간격, 버튼 동작, grid/form 보정에만 제한한다.
- 검색 영역은 `m-search`, 목록 영역은 `fixTable` + `m-shadowTable`, 본문 wrapper는 `subBox transparent` + `contentArea`를 기본으로 한다.
- 내부 구현은 React 상태/API 방식으로 유지하되, 외부 표시 DOM/class는 기존 JSP 구조에 최대한 맞춘다.

## 검증 항목

- React build: 통과
- FastAPI route/domain test: `18 passed, 1 skipped`
- Playwright E2E: `5 passed`
- Playwright screenshot: 신청/정산/상환 화면 캡처 생성
- 신청 화면 캡처 기준 테이블-하단요약 간격: `0px`
- 정산/상환 상세 클릭 후 1440px viewport 가로 overflow: `0px`
- 실제 DB API 응답 확인: 계약 `7건`, 정산 `469건`, 상환 `6건`
- React build: 통과
- Playwright E2E: `5 passed`

## 다음 액션

- 실제 브라우저 screenshot 기준으로 JSP 화면과 React 화면의 spacing/table/font를 비교한다.
- 필요 시 검색 영역과 상세 테이블을 legacy `m-baseTable`, `m-colorTable` 구조로 추가 정렬한다.
- 페이지별 신규 구현 시 기존 JSP의 화면명, 검색폼, 테이블 class를 먼저 확인한 뒤 React 컴포넌트에 반영한다.
