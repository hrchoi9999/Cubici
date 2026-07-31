# Cubici Legacy UI Batch 1 Ready Plan

## 목표

- React/FastAPI 구조는 유지한다.
- Backend 변경 없이 사용자 front의 legacy UI/UX 체감을 먼저 회복한다.
- 1차 batch는 공통 shell과 메인/로그인 중심으로 제한한다.

## 현재 준비 상태

- 운영 배포는 다른 task 기준 `PRODUCTION_GO_LIVE: SUCCESS`로 확인했다.
- 현재 운영 `https://cubici.co.kr`은 React bundle로 응답한다.
- 현재 `api.cubici.co.kr/v1/api/health` 직접 확인은 Cloudflare `1033`이므로, API 상태는 다음 배포 전 별도 재확인한다.
- 현재 Git 상태:
  - `.wrangler/` untracked
  - `dist-cloudflare/` untracked
  - 신규 분석 문서 untracked

## Legacy Asset 상태

현재 저장소 내부에도 핵심 legacy asset이 있다.

- `src/main/webapp/resources/rudicks/css/common.css`
- `src/main/webapp/resources/rudicks/css/module.css`
- `src/main/webapp/resources/rudicks/css/style-main.css`
- `src/main/webapp/resources/rudicks/css/style-sub.css`
- `src/main/webapp/resources/rudicks/css/swiper.min.css`
- `src/main/webapp/resources/rudicks/js/jquery-3.3.1.min.js`
- `src/main/webapp/resources/rudicks/js/swiper.min.js`
- `src/main/webapp/resources/rudicks/js/publishing.js`
- `src/main/webapp/resources/rudicks/js/publishing-main.js`
- `src/main/webapp/resources/rudicks/img/main/**`
- `src/main/webapp/resources/img/main/**`

`scripts/build-cloudflare-static-bundle.mjs`는 최종 `dist-cloudflare/resources`에 `src/main/webapp/resources`를 복사한다.

주의:

- `user-web/public`에는 legacy asset 일부만 있다.
- 따라서 local Vite dev/preview에서 `/resources/...` 경로를 안정적으로 쓰려면 `user-web/public/resources`를 보강하거나 Vite dev middleware/static copy 전략이 필요하다.

## Batch 1 범위

### 포함

1. Legacy CSS import 정리
   - `user-web/src/styles/user-web.css`
   - `style-main.css`, `style-sub.css`, `swiper.min.css` import 추가
   - 기존 React 자체 스타일은 legacy와 충돌하는 부분부터 축소

2. Legacy shell React 컴포넌트 준비
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

3. MainPage legacy 구조 이식
   - `main.jsp`의 `mainContents`, `mainSlideArea`, `actionVisual`, `partnerArea` JSX 변환
   - Swiper는 1차에서 정적/간단 동작으로 시작하고, 필요 시 React effect로 보강

4. LoginPage legacy 구조 이식
   - `login-box`, `login-inner`, `input-box`, `big-btn` 구조 적용
   - API 호출 로직은 현재 React 구현 유지

5. Local asset 경로 보강
   - 최종 Cloudflare bundle은 이미 `resources` 복사 경로가 있음
   - 로컬 개발/검증용으로 `user-web/public/resources` 보강 또는 Vite 설정 조정

### 제외

- `service-api` 변경
- DB migration/seed
- 운영 API/Tunnel 조작
- 관리자 화면 변경
- 매출/정산/마이페이지 전체 포맷 이식
- 모바일 1:1 복원
- jQuery 플러그인 전체 재사용

## 수정 예상 파일

- `user-web/src/shared/UserCore.jsx`
- `user-web/src/pages/HomePages.jsx`
- `user-web/src/pages/AccountPages.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/vite.config.js` 또는 `user-web/public/resources/**`
- `docs/*.md`

## 검증 계획

1. Build
   - `user-web` production build

2. Focused visual smoke
   - `/`
   - `/login`
   - `/moneybank/intro/advpay`

3. Asset 확인
   - `/resources/rudicks/css/style-main.css`
   - `/resources/rudicks/css/style-sub.css`
   - `/resources/rudicks/js/swiper.min.js`
   - 대표 main image 3~5개

4. 회귀 확인
   - 로그인 form 렌더링
   - header menu link
   - root deep route fallback

## 성공 기준

- Backend 변경 없음.
- 사용자 root 첫 화면이 legacy 메인처럼 보인다.
- header/footer/GNB가 legacy 톤으로 바뀐다.
- 로그인 화면이 legacy `login-box` 톤으로 바뀐다.
- 주요 asset 404가 없다.
- build 통과.

## 보수적 예상 효과

- Batch 1 완료 시 체감 복원도: 60~70%
- 이후 공통 업무 포맷까지 적용하면 75~85%
- 주요 서브 페이지까지 적용하면 85~90%

## 다음 실행 판단

- 다음 사용자 승인 후 Batch 1만 구현한다.
- Batch 1 완료 전에는 매출/정산/마이페이지/게시판 이식으로 범위를 넓히지 않는다.
