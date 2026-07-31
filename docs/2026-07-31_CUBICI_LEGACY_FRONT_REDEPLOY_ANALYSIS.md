# Cubici Legacy Front Redeploy Analysis

## 배포 완료 상태 정정

- 다른 task `019fb104-5c3e-7e52-b2ee-9202ade8ca43`의 최신 완료 보고를 확인했다.
- 해당 task 최종 판정:
  - `PRODUCTION_GO_LIVE: SUCCESS`
  - 배포 commit: `18137d4fbe0c469c077f6e02799f7cb6a0249680`
  - Pages production deployment: `fcb3cfd6-364f-4cb3-986a-d745d49e6606`
  - `api.cubici.co.kr -> cubici-production-api` 전환 완료
  - production containers 실행 중으로 보고됨
- 따라서 이전에 이 스레드에서 “운영 배포 미완료”라고 본 것은 현재 폴더의 문서와 git 상태만 보고 판단한 불완전한 결론이다.
- 현재 기준 결론은 “운영 배포는 완료, 단 현재 폴더에는 `.wrangler/`, `dist-cloudflare/` untracked 산출물이 남아 있고 Git 정리는 별도”가 맞다.

## 현재 운영 응답 확인

- `https://cubici.co.kr` 직접 응답:
  - HTTP 200
  - title: `Cubici User Web`
  - React asset `/assets/index-*.js`, `/assets/index-*.css` 로딩
  - legacy `mainSlideArea` HTML은 없음
- `https://api.cubici.co.kr/v1/api/health` 직접 응답:
  - 현재 확인 시 Cloudflare `1033`
  - 어제 task 최종 보고와 다르므로 Tunnel/container 상태 재확인이 필요하다.

## D:\Cubici Legacy Front 구조

- `D:\Cubici`는 원 운영 Java/JSP/eGov 웹사이트 소스다.
- 사용자 PC JSP 주요 범위:
  - `cubici/home/main.jsp`
  - `cubici/home/login.jsp`
  - `cubici/home/mainSignUp.jsp`
  - `cubici/infoIntegrated/tab1~3.jsp`
  - `cubici/infoSales/sales.jsp`, `return.jsp`
  - `cubici/infoCalculate/calendar.jsp`, `details.jsp`
  - `cubici/invento/inventoIndex.jsp`
  - `cubici/moneybank/**`
  - `cubici/myPage/**`
  - `cubici/userSupport/**`
- 공통 프레임:
  - `cmmn/cubiciFrame.jsp`
  - `cmmn/cubiciHeader.jsp`
  - `cmmn/cubiciFooter.jsp`
- 디자인 핵심 리소스:
  - `/resources/rudicks/css/common.css`
  - `/resources/rudicks/css/module.css`
  - `/resources/rudicks/css/style-main.css`
  - `/resources/rudicks/css/style-sub.css`
  - `/resources/rudicks/css/swiper.min.css`
  - `/resources/rudicks/js/jquery-3.3.1.min.js`
  - `/resources/rudicks/js/swiper.min.js`
  - `/resources/rudicks/js/publishing.js`
  - `/resources/rudicks/js/publishing-main.js`
  - `/resources/rudicks/img/main/**`
  - `/resources/rudicks/img/sub/**`

## 현재 React Front와 차이

- 현재 `user-web/src/pages/HomePages.jsx`는 legacy 메인을 축약해 React 기능형 화면으로 재작성했다.
- `user-web/src/styles/user-web.css`는 `/rudicks/css/common.css`, `/rudicks/css/module.css`만 import한다.
- 현재 `user-web/public/rudicks/css`에는 `common.css`, `module.css`만 확인된다.
- legacy 메인의 품질을 만드는 `style-main.css`, `style-sub.css`, `swiper`, `publishing-main.js`, 다수 main animation asset은 현재 사용자 React 화면에 충분히 반영되지 않았다.
- 따라서 디자인 품질 차이는 기능 개발 실패라기보다 “legacy 퍼블리싱 HTML/CSS/JS 구조를 버리고 단순 React UI로 재구성한 결과”로 보는 것이 맞다.

## 그대로 D:\Cubici Front를 배포할 수 있는가

### 정적 front로는 불가

- `D:\Cubici` front는 JSP, JSTL, Spring Security tag, eGov include, jQuery AJAX에 의존한다.
- Cloudflare Pages는 JSP를 실행할 수 없다.
- JSP 파일을 그대로 올리면 서버 렌더링, 세션, `<c:choose>`, `<sec:authorize>`, `<jsp:include>`가 동작하지 않는다.

### Java legacy 전체를 운영에 되돌리는 것도 고위험

- Tomcat/eGov/MyBatis/legacy config/legacy DB 연결/secret/SMS/Hyphen 연동을 다시 운영해야 한다.
- 현재 운영 구조인 React + FastAPI + PostgreSQL + Cloudflare Tunnel과 충돌한다.
- 새 API ownership/auth/security 보강을 우회할 가능성이 크다.
- 단기 디자인 개선 목적이면 과한 rollback이다.

## 권장 방향

- 기존 운영 JSP를 그대로 배포하지 말고, legacy 퍼블리싱을 React에 이식한다.
- 현재 FastAPI/API/DB/인증 구조는 유지한다.
- React 컴포넌트의 HTML class 구조를 legacy JSP와 최대한 맞춘다.
- `/resources/rudicks/**` asset path를 운영 bundle에 포함해 기존 CSS가 그대로 먹게 한다.
- jQuery legacy JS는 최소 범위로만 사용하거나, Swiper/animation은 React에서 재구현한다.

## 권장 작업 순서

1. 루트/마케팅 메인 복원
   - `main.jsp`의 `mainContents`, `mainSlideArea`, `actionVisual`, `partnerArea`, footer 구조를 React 컴포넌트로 이식
   - `style-main.css`, `swiper.min.css`, `publishing-main.js`, 관련 이미지 경로 포함
   - API 의존이 적어 가장 빠르게 품질 개선 가능

2. 공통 프레임 복원
   - `cubiciHeader.jsp`, `cubiciFooter.jsp`, `cubiciFrame.jsp`의 header/footer/subVisual/snb 구조를 React Layout에 반영
   - 현재 `user-header`, `gnb` 자체 스타일은 legacy class 기반으로 교체

3. 서브 페이지 시각 복원
   - moneybank intro/request/current
   - login/signup/mypage
   - support/charge/board
   - sales/settlement/integrated info
   - 기능 로직은 현재 React API 호출 유지

4. 배포 후보 검증
   - build
   - 루트/로그인/머니뱅크/마이페이지 focused visual smoke
   - 주요 route 404/asset missing 확인
   - 실제 도메인 전 배포 preview smoke

## 1차 작업 범위 제안

- Batch 1은 `루트 메인 + 공통 header/footer + asset path 정리`만 한다.
- 이 범위는 API/DB 변경 없이 front 품질을 가장 크게 개선한다.
- 그 다음 사용자가 화면을 확인한 뒤 서브 페이지를 순차 이식하는 것이 안전하다.

## 리스크

- legacy CSS는 특정 HTML depth/class에 강하게 묶여 있어 일부만 import하면 깨진다.
- legacy JS는 jQuery 전역, DOM 직접 조작, modal/cookie/Swiper 초기화에 의존한다.
- React가 DOM을 다시 렌더링하면 legacy JS와 충돌할 수 있다.
- `/resources/img/...`와 `/resources/rudicks/img/...` 양쪽 asset 경로가 섞여 있어 누락 점검이 필요하다.
- 운영 API tunnel은 현재 직접 확인에서 1033이 발생했으므로 배포 전 재확인 필요.

## 결론

- 원 운영 디자인을 새 cubici.co.kr front에 적용하는 방향은 타당하다.
- 단, `D:\Cubici` JSP를 그대로 배포하는 방식은 부적합하다.
- 현재 React 앱을 유지하면서 legacy JSP의 HTML 구조와 `rudicks` CSS/이미지를 React로 이식하는 방식이 가장 안전하다.
