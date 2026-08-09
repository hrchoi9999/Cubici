# Cubici 240130 Final UI Migration - Batch 3 Common Shell

## 범위

- 대상: 사용자 웹 공통 shell
- 원본: `240130_큐빅아이/header.html`, `footer.html`, `mobile-gnb.html`
- React 적용:
  - PC header
  - mobile header
  - mobile drawer navigation
  - footer
  - mobile bottom GNB
- Backend/API 변경 없음.
- 관리자 화면 변경 없음.

## 변경 파일

- `user-web/src/shared/UserCore.jsx`
  - 기존 rudicks `#header/#footer` 구조를 240130 최종 UI class 구조로 교체.
  - `Header`, `Footer`, `MobileGnb` React 컴포넌트 구성.
  - PC GNB hover/focus 확장 상태를 React state로 처리.
  - 모바일 메뉴 열림/닫힘과 body fixed 상태를 React state로 처리.
  - 기존 `readAuthSession`, `clearAuthSession` 기반 로그인/로그아웃 표시 유지.
- `user-web/src/styles/final-ui-foundation.css`
  - 240130 CSS가 기존 `user-web.css`에 덮이는 문제를 피하기 위한 common shell 전용 보정 추가.
  - PC header 90px, mobile header 60px 기준 padding 보정.
  - header logo는 sub-logo, footer logo는 main-logo로 고정.
  - mobile drawer와 mobile bottom GNB 표시 상태 보정.
- `docs/batch3_shell_smoke/*`
  - desktop/mobile smoke 스크린샷 산출물.

## 검증 결과

- `vite build`: 통과.
- desktop smoke:
  - `/`, `/login`, `/moneybank/intro/advpay`, `/board/notice/index`
  - PC header display `block`, mobile header `none`, footer `block`, mobile bottom GNB `none`
  - top padding `90px`
- mobile smoke:
  - `/`, `/moneybank/intro/advpay`
  - PC header `none`, mobile header `block`, footer `none`, mobile bottom GNB `block`
  - top padding `60px`
  - mobile drawer open 후 `.m-nav` top `0px`
- `/final-ui/static` asset 누락: 0건.

## 남은 리스크

- 기존 rudicks 본문 asset 404는 42건 확인됨. Batch 3 범위 밖이며, 본문 페이지를 240130 source로 교체하는 Batch 4 이후 줄어들 항목이다.
- 공통 shell은 적용됐지만 각 페이지 본문은 아직 240130 최종 HTML 구조가 아니다.
- 모바일 drawer 세부 animation과 포커스 이동은 smoke 수준만 검증했다.

## 진행률

- 사용자 페이지 전체 Batch 기준 보수적 진행률: 26%.
- 완료:
  - Batch 1: route/component map
  - Batch 2: asset/style foundation
  - Batch 3: common shell
- 다음 단계:
  - Batch 4: 메인/로그인/회원가입 계열 240130 본문 UI 이식
  - Batch 5 이후: 통합정보/매출정보/정산정보/머니뱅크/고객지원 본문 페이지 순차 이식
