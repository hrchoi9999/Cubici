# Cubici 240130 Final UI Migration - Batch 9

## 범위

- 사용자 페이지 배포 후보 route smoke 기준 추가.
- public/auth/auth-required/mobile legacy alias route 렌더링 확인.
- Batch 9 smoke에서 발견된 사용자 화면 UI 결함 보정.

## 변경 파일

- `user-web/src/pages/AccountPages.jsx`
- `user-web/src/pages/HomePages.jsx`
- `user-web/src/shared/UserCore.jsx`
- `user-web/src/styles/final-ui-foundation.css`
- `user-web/tests/e2e/batch9-user-release-candidate-smoke.spec.js`

## 수정 내용

- `idSearch`, `pwdReset` 화면을 `final-login-page` 기반 auth UI로 보정했다.
- `cubici/invento/index` 상품/재고현황 화면을 `final-core-page` 구조로 전환했다.
- 상품/재고현황 검색/목록 판넬과 표를 final UI 카드/표 스타일 범위에 포함했다.
- `DocumentNotice`의 깨진 `/rudicks/img/sub/moneybank-img02~05.png` 경로를 final asset 경로로 교체했다.
- Batch 9 release candidate smoke spec를 추가해 desktop 42개 route, mobile legacy alias 17개 route를 한 번에 확인한다.

## 검증

- `vite build`: 통과.
- Batch 9 release candidate smoke: 2개 통과.
  - desktop route loop: 42개 route 렌더링, broken image 없음, page overflow 없음.
  - mobile legacy alias loop: 17개 route 렌더링, broken image 없음, page overflow 없음.
- Batch 7/8 focused smoke 재검증: 19개 통과.
- 산출물: `docs/batch9_release_candidate_smoke/`

## 발견 및 조치한 결함

- 머니뱅크 소개/신청 준비서류 이미지가 runtime에서 깨지는 문제를 발견했다.
- 원인: 공통 `DocumentNotice`가 더 이상 존재하지 않는 `/rudicks/img/sub/moneybank-img02~05.png`를 참조.
- 조치: `/final-ui/static/img/sub/c4/circle-1~4.png`로 교체 후 재검증 통과.

## 잔여 리스크

- Batch 9 smoke는 API mock 기반 UI route 검증이다. 실제 Docker DB/API 데이터 검증은 아니다.
- legacy 산식 검산, 실제 계약 상태 전이, 결제/정산/상환 금액 검산은 남아 있다.
- 관리자 화면 final UI migration은 아직 본격 착수 전이다.
- 운영 배포, 운영 URL 기준 회귀검증은 아직 수행하지 않았다.
- build 시 legacy CSS의 `/resources...` runtime 경로 warning은 계속 남아 있다. 현재 smoke 기준 실제 렌더링 broken image는 없음.

## 진행률

- 사용자 페이지 final UI 복원: 약 78%.
- 전체 프로젝트 기준 보수 진행률: 약 56%.
- 다음 단계: Batch 10에서 사용자 페이지 운영 배포 전 체크리스트를 확정하고, 관리자 화면 final UI migration 착수 범위를 분리하는 것이 적절하다.
