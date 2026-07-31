# Cubici Legacy UI Batch 1 Result

Date: 2026-07-31

## Scope

Batch 1은 React/FastAPI 구조를 유지하고 사용자 front의 legacy UI 첫인상을 복원하는 작업으로 진행했다.

## Changed Files

- `user-web/src/shared/UserCore.jsx`
- `user-web/src/pages/HomePages.jsx`
- `user-web/src/pages/AccountPages.jsx`
- `user-web/src/styles/user-web.css`
- `user-web/vite.config.js`

## Implemented

### Common Shell

- React header를 legacy `#header`, `topLine`, `gnbArea`, `#gnb` 구조에 맞췄다.
- React footer를 legacy `#footer`, `inner`, `logo`, `infoList` 구조에 맞췄다.
- sub page title을 legacy `subVisualArea`, `subVisual`, `txtBox` 구조로 변경했다.

### Main Page

- 기존 React hero/dashboard 카드 중심 화면을 legacy `mainContents`, `mainSlideArea`, `mainSlide`, `visualBox`, `pcMockup` 구조로 변경했다.
- legacy `actionVisual` 탭 느낌을 정적 섹션으로 복원했다.
- legacy `partnerArea` 로고 리스트 구조를 복원했다.
- Swiper/jQuery 동작은 이번 batch 범위에서 제외하고 정적 첫 화면 기준으로 처리했다.

### Login Page

- 기존 React `auth-card` 구조를 legacy `login-box`, `login-inner`, `input-box`, `big-btn`, `cs-box` 구조로 변경했다.
- 로그인 API 호출과 session 저장 로직은 유지했다.

### Assets / Local Dev

- legacy rudicks CSS import를 추가했다.
  - `common.css`
  - `module.css`
  - `style-main.css`
  - `style-sub.css`
- local Vite dev/preview에서 `/resources/**` 요청을 `src/main/webapp/resources`에서 직접 서빙하도록 설정했다.
- Cloudflare static bundle은 기존 스크립트가 `src/main/webapp/resources`를 `dist-cloudflare/resources`로 복사하는 구조를 유지했다.

## Backend Impact

- `service-api` 변경 없음.
- DB schema 변경 없음.
- API contract 변경 없음.

## Verification

- `user-web` production build: PASS
- Cloudflare static bundle build: PASS
- Cloudflare static bundle smoke: PASS
- Local dev HTTP smoke:
  - `/`: 200
  - `/login`: 200
  - `/resources/rudicks/img/main/main-slide01-bg.jpg`: 200
  - `/resources/img/icon/login-logo.png`: 200
- Playwright DOM smoke:
  - main legacy selector found: PASS
  - hero image loaded: PASS
  - login legacy selector found: PASS
  - footer legacy selector found: PASS
  - browser 4xx/5xx/pageerror: none

## Notes

- Vite build 경고로 `/resources/...` 이미지가 build 시점에 resolve되지 않는다는 메시지가 나온다. 이는 운영 번들에서 `/resources` 디렉터리를 복사해 runtime에 제공하는 구조라 현재 기준 정상 경고로 판단한다.
- admin bundle chunk size warning은 기존 admin bundle 특성으로, Batch 1 변경 범위 밖이다.
- mobile은 깨짐 방지 수준으로만 보정했다. 세부 모바일 UI 조정은 Batch 5 범위로 남긴다.

## Local Preview

- Dev server: `http://127.0.0.1:5175/`
