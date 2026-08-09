# Cubici 240130 UI Migration - Batch 4 Main/Auth

## 범위

- 사용자 페이지 메인, 로그인, 회원가입 본문 UI를 240130 최종 UI 소스 기준으로 이식했다.
- React/FastAPI 구조는 유지했고 backend/API는 수정하지 않았다.
- 관리자 화면은 이번 Batch 4 범위에 포함하지 않았다.

## 참조 원본

- `240130_큐빅아이/index.html`
- `240130_큐빅아이/index-login.html`
- `240130_큐빅아이/login.html`
- `240130_큐빅아이/회원가입_약관동의.html`
- `240130_큐빅아이/회원가입_기본정보.html`
- `240130_큐빅아이/회원가입_가입완료.html`

## 변경 파일

- `user-web/src/pages/HomePages.jsx`
  - 메인 hero, 모바일 비로그인 메인 블록, CTA 영역을 240130 이미지/HTML 구조 기준으로 재구성했다.
  - 기존 업무 섹션은 유지하되 final UI shell과 충돌하지 않도록 class를 조정했다.
- `user-web/src/pages/AccountPages.jsx`
  - 로그인 화면을 240130 `login.html`의 `login-box`, 아이콘 입력, 버튼 구조에 맞췄다.
  - 회원가입 화면을 240130 약관/기본정보 step UI 느낌으로 재구성했다.
  - 기존 React signup API flow는 유지했다.
- `user-web/src/styles/final-ui-foundation.css`
  - Batch 4 전용 main/login/signup 반응형 override를 추가했다.
  - 모바일 회원가입 화면의 global `min-width`/`.sec-1` 충돌을 보정했다.
- `docs/batch4_main_auth_smoke/`
  - PC/모바일 focused smoke screenshot 6장을 생성했다.

## 검증

- `vite build`: 통과.
- focused smoke route:
  - PC 1440x960: `/`, `/login`, `/mainSignUp`
  - Mobile 390x844: `/`, `/login`, `/mainSignUp`
- `/final-ui/static` asset missing: 0건.
- legacy/global CSS에서 참조하는 기존 `/resources/...` 계열 누락 경고는 남아 있다.
  - 이번 Batch 4에서 새로 이식한 final UI asset 누락은 아니다.

## 제한 사항

- 메인 슬라이드는 Batch 4에서 정적 대표 slide 중심으로 이식했다. 240130 원본 수준의 Swiper 동작/모션은 후속 polish 대상이다.
- 회원가입 약관 본문은 UI 구조 확인용 요약 문구로 구성했다. 실제 법무/운영 약관 원문은 아직 migration 및 검산 대상이다.
- 240130 원본의 가입 완료 단계는 현재 React의 단일 signup/API flow와 충돌을 피하기 위해 별도 독립 화면으로 분리하지 않았다.

## 보수적 진행률

- 사용자 페이지 전체 Batch 기준: 34%.
- 완료: Batch 1 route/component map, Batch 2 asset/style foundation, Batch 3 common shell, Batch 4 main/auth body.
- 남은 주요 단계:
  - Batch 5: 통합정보/매출정보/정산정보 계열 본문 UI 이식.
  - Batch 6: 정산계좌/서비스관리/내정보 계열 본문 UI 이식.
  - Batch 7: 고객센터/공지/문의 등 보조 페이지 UI 이식.
  - Batch 8: 모바일 세부 polish 및 legacy 시각 차이 축소.
  - Batch 9: 사용자 페이지 회귀검증 및 운영 배포 준비.
