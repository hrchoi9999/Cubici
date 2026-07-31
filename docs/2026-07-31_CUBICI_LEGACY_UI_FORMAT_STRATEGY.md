# Cubici Legacy UI Format Strategy

## 목적

- 기존 운영 웹사이트 UI/UX를 React/FastAPI 구조 위에 효율적으로 복원한다.
- 100% 동일 재현보다, 공통 포맷을 먼저 맞춰 전체 화면의 통일감을 회복하는 것을 우선한다.

## 확인 결과

Legacy 사용자 JSP는 대부분 아래 공통 포맷을 공유한다.

| 포맷 | Legacy class | 확인 페이지 | React 현재 대응 |
| --- | --- | --- | --- |
| 메인 랜딩 | `mainContents`, `mainSlideArea`, `actionVisual`, `partnerArea` | `home/main.jsp` | `hero`, `feature-tabs`로 축약 구현 |
| 공통 frame | `subVisualArea`, `subContainer`, `snbArea`, `subContents` | `cmmn/cubiciFrame.jsp` | `Layout`, `PageTitle`, `sub-page`로 재구성 |
| 소개/콘텐츠 | `contentGrid`, `conArticle`, `descriptionBox`, `s-tab`, `halfImg`, `dot-line` | moneybank intro, charge, myCharge, 약관 | `intro-split`, `form-panel` 등으로 재구성 |
| 검색+업무 테이블 | `m-search`, `tableSet`, `fixTable`, `m-shadowTable`, `m-paging` | sales, return, settlement, inventory, integrated tabs | `data-table-wrap`, 일반 `table` |
| 게시판 | `m-baordSet`, `boardTop`, `boardList`, `table.list`, `m-paging` | notice, faq, qna | `data-table-wrap`, 일반 `table` |
| 폼/마이페이지 | `m-tab`, `subBox`, `m-modalGrid`, `fwBox`, `input`, `subContentsBtns` | signup, companyInfo, businessInfo, request/current | `form-panel`, `field-grid`, `mypage-grid` |
| 로그인 | `login-box`, `login-inner`, `input-box`, `big-btn` | login | `auth-page`, `auth-card` |
| 모달 | `modal-container`, `modal-wrapper`, `mInner`, `mArticleArea` | userModal, detail modal, shopApiModal | React inline panels 또는 일부 modal 미재현 |

## 핵심 판단

- 현재 React는 기능은 구현했지만 공통 포맷 class 체계를 새로 만들었다.
- 그래서 legacy CSS 일부를 import해도 원래 운영 사이트의 통일감이 살아나지 않는다.
- 가장 효율적인 개선은 페이지별 픽셀 조정이 아니라 `공통 포맷 컴포넌트`를 legacy class 구조로 먼저 만드는 것이다.

## 효율 우선 전략

### 1단계: 공통 shell 복원

- `Layout`을 legacy frame 구조로 전환한다.
- 대상:
  - `#wrap`
  - `#header`
  - `.topLine`
  - `.gnbArea`
  - `.container`
  - `.subVisualArea`
  - `.subContainer`
  - `.snbArea`
  - `.subContents`
  - `#footer`
- 기대 효과:
  - 거의 모든 서브 페이지의 첫인상과 통일감 회복
  - 개별 페이지 수정량 감소

### 2단계: 공통 UI 컴포넌트 5개 작성

- `LegacyContentGrid`
- `LegacySearchPanel`
- `LegacyDataTable`
- `LegacyBoardList`
- `LegacyFormGrid`
- 추가로 `LegacyTabs`, `LegacyModal`, `LegacyPaging`을 보조 컴포넌트로 둔다.

### 3단계: 페이지별 이식 순서

1. MainPage
2. Header/Footer/Sub layout
3. Moneybank intro/charge/약관 같은 정적 콘텐츠
4. Login/Signup
5. Board/support
6. Sales/Settlement/Integrated/Inventory
7. MyPage/Moneybank request/current/detail

## 시간 절약 기준

- legacy HTML class/depth를 최대한 유지한다.
- legacy CSS를 고치기보다 React JSX를 CSS에 맞춘다.
- jQuery 플러그인은 그대로 붙이지 않고, 필요한 동작만 React로 대체한다.
- 페이지별 미세조정은 공통 컴포넌트 적용 후 남는 10~20%만 한다.

## 예상 재현도

- 공통 shell + 메인만 먼저 적용: 체감 60~70% 회복
- 공통 UI 컴포넌트 5개 적용: 체감 75~85% 회복
- 주요 서브 페이지까지 적용: 체감 85~90% 회복
- 픽셀 단위 100% 재현은 비효율적이므로 목표로 두지 않는다.

## 리스크

- `style-main.css`, `style-sub.css` 누락 시 핵심 포맷이 깨진다.
- 현재 user-web public에는 `common.css`, `module.css` 중심으로만 확인된다.
- `/resources/rudicks/**`와 `/rudicks/**` 경로가 혼재되어 asset 경로 정리가 필요하다.
- 업무 테이블의 legacy `fixTable`/custom scrollbar를 그대로 재현하면 시간이 증가한다.

## 권장 첫 batch

- 구현 범위:
  - legacy CSS/이미지 경로 정리
  - React `Layout`을 legacy shell로 전환
  - `MainPage`를 `main.jsp` 구조 기반으로 전환
  - `LoginPage`는 `login-box` 구조로 전환
- 검증:
  - user-web build
  - root/login/moneybank intro focused visual smoke
  - asset 404 확인

## 결론

- 페이지별로 무작정 미세 조정하면 시간이 많이 든다.
- 먼저 legacy 공통 포맷을 React 컴포넌트로 만들면 같은 작업량으로 더 많은 화면의 품질을 회복할 수 있다.
