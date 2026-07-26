# Cubici Legacy 화면/CSS/Image Inventory

작성일: 2026-07-20

## 목적

Cubici 기존 웹사이트의 외부 화면을 React 전환 후에도 사용자가 구분하기 어렵게 재현하기 위한 화면, CSS, image, font, JS 의존성 inventory를 정리한다.

내부 구현은 React/FastAPI로 전환하되, 화면 구조, 메뉴, 색상, 폰트, 버튼, 테이블, 이미지 자산은 기존 리소스를 최대한 재사용한다.

## 조사 범위

- 기준 경로: `D:\Alt_CSM\Cubici`
- 화면 원본: `src\main\webapp\WEB-INF\jsp`
- 정적 리소스: `src\main\webapp\resources`
- 외부 `D:\Cubici` 및 `D:\Alt_CSM` 외부 경로는 참조하지 않았다.
- DB 데이터와 개인정보성 원본 데이터는 조회하지 않았다.

## 전체 집계

| 항목 | 수량/규모 | 비고 |
| --- | ---: | --- |
| `WEB-INF\jsp` JSP/HTML | 186개 | 관리자/사용자/모바일/공통 JSP |
| `src\main\webapp` JSP/HTML 전체 | 199개 | `resources` 하위 HTML 포함 |
| CSS | 141개 | legacy theme, admin, mobile, plugin CSS 포함 |
| 이미지 | 1,934개 | png/jpg/jpeg/gif/svg/webp/ico 기준 |
| `resources` 전체 파일 | 2,541개 | 약 91.43 MB |

## 화면 Inventory

### 공통 Frame

| 구분 | 대표 파일 | React 전환 기준 |
| --- | --- | --- |
| PC 사용자 공통 | `WEB-INF\jsp\egovframework\azon\cmmn\cubiciFrame.jsp` | `UserLayout` 기준 |
| 관리자 공통 | `WEB-INF\jsp\egovframework\azon\cmmn\cubiciAdminFrame.jsp` | `AdminLayout` 기준 |
| 모바일 공통 | `WEB-INF\jsp\egovframework\azon\cmmn\mobileFrame.jsp` | `MobileLayout` 기준 |
| Header/Footer | `cubiciHeader.jsp`, `adminHeader.jsp`, `mobileHeader.jsp`, `cubiciFooter.jsp`, `mobileFooter.jsp` | 메뉴, 로고, footer 문구 재현 기준 |

공통 로고는 `/resources/rudicks/img/logo-w.svg`, favicon은 `/resources/assets/images/favicon.png`를 사용한다.

### 관리자 화면

관리자 JSP는 71개다.

| 영역 | 대표 파일 | 전환 우선도 |
| --- | --- | --- |
| 선정산/상환 운영 | `admin\moneybank\operation\manageIndex.jsp`, `requestState.jsp`, `approval_tab1.jsp`, `approval_tab2.jsp`, `redemState.jsp`, `repayState.jsp` | 1순위 |
| 선정산/상환 상세 | `approvalDetail.jsp`, `evalDetail.jsp`, `pcsDetail.jsp`, `pmsDetail.jsp`, `redemDetail.jsp`, `repayDetail.jsp` | 1순위 |
| 이용/상태 관리 | `admin\moneybank\management\usageList.jsp`, `usageDetail.jsp`, `status_tab1.jsp`, `status_tab2.jsp` | 2순위 |
| 회원 관리 | `admin\cubici\manageMember\member_tab1.jsp` 등 | 2순위 |
| 통합 정보 | `admin\cubici\infoIntegrated\cubici_tab*.jsp`, `moneybank_tab*.jsp` | 2순위 |
| 환경/정책 관리 | `admin\cubici\adminPreference\*.jsp` | 3순위 |
| 고객지원 | `admin\cubici\supportMember\*.jsp` | 3순위 |

선정산/상환 운영 화면과 연결되는 legacy JS는 `resources\js\views\admin\advcal*.js` 묶음이다.

### PC 사용자 화면

PC 사용자 JSP는 57개다.

| 영역 | 대표 파일 | 전환 우선도 |
| --- | --- | --- |
| 메인/로그인/가입 | `cubici\home\main.jsp`, `login.jsp`, `mainSignUp.jsp` | 2순위 |
| 선정산 소개 | `cubici\moneybank\advPayIntro.jsp`, `advCalcIntro.jsp`, `creditIntro.jsp` | 2순위 |
| 선정산 신청/평가/계약 | `hellopayBiz\requestForm.jsp`, `evaluate.jsp`, `contractForm.jsp`, `viewCurrent.jsp` | 1순위 |
| 정산 캘린더형 선정산 | `hellopayCal\requestForm.jsp`, `evaluate.jsp`, `contract.jsp`, `viewCurrent.jsp` | 1순위 |
| 매출/반품 | `infoSales\sales.jsp`, `return.jsp` | 1순위 |
| 정산 조회 | `infoCalculate\calendar.jsp`, `details.jsp` | 1순위 |
| 마이페이지 | `myPage\companyInfo.jsp`, `businessInfo.jsp`, `myAuth.jsp`, `myCharge.jsp` | 2순위 |
| 고객지원 | `userSupport\*.jsp` | 3순위 |

### 모바일 화면

모바일 JSP는 40개다.

| 영역 | 대표 파일 | 전환 우선도 |
| --- | --- | --- |
| 메인/로그인/가입 | `mobile\home\m_main.jsp`, `m_login.jsp`, `m_register_step*.jsp` | 2순위 |
| 선정산 신청/평가 | `mobile\moneybank\hellopayBiz\m_helloBizRequest.jsp`, `m_helloBizEval.jsp`, `m_viewCurrent.jsp` | 1순위 |
| 매출/반품 | `mobile\infoSales\m_sales.jsp`, `m_return.jsp` | 1순위 |
| 정산 조회 | `mobile\infoCalculate\m_calendar.jsp`, `m_details.jsp` | 1순위 |
| 마이페이지/고객지원 | `mobile\myPage\*.jsp`, `mobile\userSupport\*.jsp` | 2순위 |

## CSS Inventory

### 핵심 재사용 CSS

| 구분 | 파일 | 용도 |
| --- | --- | --- |
| PC/Admin 공통 | `resources\rudicks\css\common.css` | reset, 공통 layout |
| PC/Admin module | `resources\rudicks\css\module.css` | 버튼, 테이블, 폼, modal 등 |
| PC main | `resources\rudicks\css\style-main.css` | 메인 화면 |
| PC sub | `resources\rudicks\css\style-sub.css` | 서브/업무 화면 |
| Mobile 공통 | `resources\rudicks\mobile\css\common.css` | 모바일 reset/layout |
| Mobile module | `resources\rudicks\mobile\css\module.css` | 모바일 UI 요소 |
| Mobile main/sub | `resources\rudicks\mobile\css\style-main.css`, `style-sub.css` | 모바일 화면 |
| 폰트 | `resources\rudicks\fonts\noto-sans-kr\notoSansKr.css`, `resources\rudicks\fonts\roboto\roboto.css` | 기존 typography |
| UI plugin | `jquery-ui.css`, `swiper.min.css`, `jquery.mCustomScrollbar.min.css` | datepicker/slider/scroll UI |

React에서는 위 CSS를 우선 `public/resources/...` 형태로 mirror 하거나, 동일 URL alias를 제공해 `/resources/...` 경로 의존성을 유지하는 방식을 우선 검토한다.

### 보조 CSS

| 경로 | 판단 |
| --- | --- |
| `resources\admin\assets\css\style.css` | legacy admin plugin 화면 확인용 |
| `resources\assets\css\style.css`, `main.css` | 구형 public theme 확인용 |
| `resources\bootstrap-ui\*.css` | 필요 화면 확인 후 제한 사용 |
| `resources\custom\css\style.css` | popup/event 화면 확인 후 제한 사용 |
| `resources\css\findIdPwd.css`, `layerPopup_220124.css` | 로그인/팝업 화면 확인 후 제한 사용 |

## Image/Font Inventory

| 경로 | 파일 수/규모 | 용도 |
| --- | ---: | --- |
| `resources\rudicks\img` | 266개 / 약 7.64 MB | Cubici 핵심 PC/Admin 이미지 |
| `resources\rudicks\img\main` | 62개 / 약 5.04 MB | 메인/랜딩 visual |
| `resources\rudicks\img\icon` | 106개 / 약 0.25 MB | 아이콘 |
| `resources\rudicks\img\partner-color` | 32개 / 약 0.06 MB | 제휴사 로고 |
| `resources\rudicks\mobile` | 181개 / 약 5.06 MB | 모바일 CSS/JS/img |
| `resources\rudicks\fonts` | 56개 / 약 5.75 MB | Noto Sans KR, Roboto |
| `resources\img` | 136개 / 약 1.62 MB | 구형 image set |
| `resources\assets\images` | 34개 / 약 23.93 MB | favicon 및 public theme 이미지 |
| `resources\custom\popup_image` | 일부 포함 | 이벤트/팝업 이미지 |

화면 재현 기준 이미지는 `resources\rudicks\img`와 `resources\rudicks\mobile`을 1차 기준으로 삼는다. `resources\assets`와 `resources\img`는 실제 JSP 참조 여부를 확인하면서 보조로 사용한다.

## JS/Plugin Inventory

| 구분 | 파일/라이브러리 | React 전환 판단 |
| --- | --- | --- |
| DOM 조작 | `jquery-3.3.1.min.js`, `jquery-ui.js`, `publishing.js` | React component state/effect로 재구현 |
| 공통 util | `resources\js\common\util.js`, `cubici.core.js` | API 호출/formatting 로직만 선별 이관 |
| 암호화 | `CryptoJS_v3.1.2` | 로그인/서명 흐름 확인 후 별도 구현 판단 |
| 차트 | `Chart.min.js`, `Chart.PieceLabel.js` | React chart 라이브러리 또는 Chart.js wrapper로 대체 |
| 테이블 | Toast UI Grid CDN, DataTables | 관리자 목록 화면에서 React table/grid로 대체 검토 |
| 슬라이더/스크롤 | Swiper, mCustomScrollbar | 필요한 화면만 React wrapper 또는 CSS 대체 |
| 에디터 | smart-editor `HuskyEZCreator.js` | 게시판/공지 작성 화면에서 별도 대체 필요 |
| 업무 JS | `resources\js\views\admin\advcal*.js` | 선정산/상환 화면 workflow 분석 자료 |

기존 JS는 그대로 실행 대상이 아니라 업무 흐름과 UI interaction 분석 자료로 사용한다.

## React 전환 적용 방안

1. `admin-web`와 `user-web`에 legacy asset mirror를 구성한다.
2. `/resources/...` URL을 유지하거나 alias로 매핑해 CSS 내부 이미지 경로 수정을 최소화한다.
3. `AdminLayout`, `UserLayout`, `MobileLayout`을 먼저 만들고 기존 header/footer/menu 구조를 반영한다.
4. 공통 UI는 기존 class명을 유지한 React component로 만든다.
5. 업무 화면은 관리자 선정산/상환 목록과 상세 화면부터 구현한다.
6. 화면별 구현 후 legacy JSP와 React 화면을 screenshot 기준으로 비교한다.

## 전환 우선순위

1. 관리자 선정산/상환 운영 화면
2. 관리자 계약/평가/상세 화면
3. 사용자 매출/반품/정산 조회 화면
4. 사용자 선정산 신청/평가/계약 화면
5. 모바일 핵심 업무 화면
6. 회원/마이페이지/고객지원/환경설정 화면

## 주요 판단

- 기존 CSS/image/font는 React에서도 재사용 가능하다.
- JSP/JSTL/inline script는 React에서 직접 재사용하지 않고 업무 흐름 분석용으로 사용한다.
- 사용자에게 보이는 화면은 기존과 최대한 동일하게 유지한다.
- 내부 API, state 관리, routing, validation은 React/FastAPI 구조에 맞게 재설계한다.
- 외부 CDN 의존성은 운영 단계에서 local vendor 또는 React package로 대체하는 것이 적절하다.

## 리스크

- CSS가 `/resources/...` 절대 경로를 많이 사용하므로 asset path 전략을 먼저 확정해야 한다.
- jQuery 기반 show/hide, modal, datepicker 동작은 React 컴포넌트로 재구현해야 한다.
- 관리자 table/grid 동작은 DataTables/Toast UI Grid 의존성이 있어 React grid 기준을 별도로 정해야 한다.
- PC와 모바일 JSP가 분리되어 있어 responsive 단일 화면으로 합칠지, 기존처럼 PC/Mobile route를 나눌지 결정이 필요하다.

## 검증

- `WEB-INF\jsp` JSP/HTML 파일 수를 `rg --files` 기준으로 확인했다.
- `resources` 하위 CSS/image/font/JS 규모를 PowerShell 집계로 확인했다.
- 공통 frame JSP에서 실제 참조되는 CSS, image, JS 경로를 `rg`로 확인했다.
- DB 및 민감 데이터는 조회하지 않았다.

## 다음 액션

1. `admin-web` legacy asset mirror 구조 확정
2. React `AdminLayout` 1차 구현
3. 관리자 선정산 운영 첫 화면 선정: `manageIndex.jsp` 또는 `requestState.jsp`
4. 해당 JSP/CSS/image 참조를 기준으로 첫 React 화면 구현
