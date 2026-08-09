# Cubici 240130 UI Migration - Batch 6 Moneybank

## 범위

- 사용자 페이지 머니뱅크 서비스소개, 서비스신청, 검토/심사, 서비스현황 계열 UI를 240130 최종 UI 소스 기준으로 이식했다.
- 기존 React/FastAPI 구조, 신청 저장, 서류 업로드, 심사조건 동의, 현황 조회 로직은 유지했다.
- backend/API, 관리자 화면, 운영 배포는 이번 Batch 6 범위에서 수정하지 않았다.

## 참조 원본

- `240130_큐빅아이/c4p1.html`: 머니뱅크 서비스소개
- `240130_큐빅아이/c4p2_1.html`: 머니뱅크 서비스신청
- `240130_큐빅아이/c4p2_2.html`: 머니뱅크 검토 및 심사
- `240130_큐빅아이/c4p3.html`: 머니뱅크 서비스현황

## 변경 파일

- `user-web/src/pages/MoneybankPages.jsx`
  - 서비스소개 화면을 240130 `full-box`, `bank-info`, `wrap-type-1`, `icon-card` 구조로 재구성했다.
  - 머니뱅크 전용 3단 sub nav를 추가해 소개/신청/현황 active 표시를 맞췄다.
  - 신청 화면을 `content-wrap c4p2-1`, `app-step`, `full-box`, `form-panel` 구조로 재배치했다.
  - 심사 화면을 `content-wrap c4p2-2`, `app-step`, `step-list` 아이콘 진행상태 구조로 재배치했다.
  - 현황 화면을 `content-wrap c4p3`, `basic-table`, `table-r-border` 구조로 재배치했다.
- `user-web/src/styles/final-ui-foundation.css`
  - Batch 6 전용 머니뱅크 소개/step/form/table/mobile override를 추가했다.
- `docs/batch6_moneybank_smoke/`
  - focused smoke 결과 JSON과 PC/모바일 스크린샷을 저장했다.

## 검증

- `vite build`: 통과.
- focused smoke:
  - 대상 route: `/moneybank/intro/advpay`, `/moneybank/intro/advcalc`, `/moneybank/intro/creditpay`, `/moneybank/advPay/request`, `/moneybank/advcalc/request`, `/moneybank/advPay/evaluate`, `/moneybank/advcalc/evaluate`, `/moneybank/current`
  - PC 1440x960, Mobile 390x844에서 확인.
  - 모든 대상 route에서 `visual-wrap`, 머니뱅크 sub nav, `final-moneybank-page` 렌더링 확인.
  - 신청/심사/현황 route의 sub nav active 표시 확인.
  - 모바일 `documentElement.scrollWidth`: 390으로 확인.
  - `/final-ui/static` missing asset: 0건.
- 검증 중 `/v1/api` 요청은 UI 렌더링 확인 목적상 차단했다.

## 제한 사항

- 신청/심사/현황 화면은 기능 보존을 우선해 기존 React 로직을 240130 컨테이너에 재배치한 상태다. 원본 HTML의 모든 세부 폼 배열을 1:1로 재현한 것은 아니다.
- `c4p2_2`의 심사결과 상세 산식과 legacy 평가 산식 검산은 별도 잔여 작업이다.
- 계약 상세, 약관 상세, 입금 테스트 등 파생 화면은 이번 Batch 6의 핵심 c4 화면 범위 밖으로 남겨뒀다.
- 기존 legacy/global CSS의 `/resources/...` build warning은 남아 있다. 이번 Batch 6에서 추가한 final UI asset 누락은 없다.

## 보수적 진행률

- 사용자 페이지 전체 Batch 기준: 56%.
- 완료: Batch 1~6.
- 남은 주요 단계:
  - Batch 7: 고객지원/마이페이지/요금제/404 및 머니뱅크 파생 상세 화면 UI 이식.
  - Batch 8: 모바일 세부 polish 및 legacy 시각 차이 축소.
  - Batch 9: 사용자 페이지 회귀검증, API 연동 확인, 운영 배포 준비.
