# Cubici 240130 Final UI Migration - Batch 7

## 범위

- 고객지원: 공지, Q&A, FAQ 목록/상세/문의 작성 화면을 final UI `content-wrap`, 탭, 표/폼 패턴으로 보정.
- 요금안내: 요금 목록/상세 화면을 final UI 카드, 표, 본문 폭 기준으로 보정.
- 마이페이지: 기존 React 6개 탭 구조를 유지한 상태로 회원정보, 회사정보, 사업정보, 인증정보, 요금정보, 회원탈퇴 화면을 final UI 패턴으로 보정.
- 머니뱅크 파생 화면: 진행상태 중간 route, 계약 상세, 약관 상세, 입금 테스트, 계약 callback 화면을 final UI 공통 구조로 보정.
- 404/준비중: legacy `notfound.html` 느낌에 맞춰 `content-wrap notfound` 구조로 변경.

## 변경 파일

- `user-web/src/pages/SupportPages.jsx`
- `user-web/src/pages/AccountPages.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/shared/UserCore.jsx`
- `user-web/src/styles/final-ui-foundation.css`
- `user-web/tests/e2e/batch7-final-ui-smoke.spec.js`

## 검증

- `vite build`: 통과.
- Batch 7 focused Playwright smoke: 17개 통과.
  - desktop route 렌더링: 16개 통과.
  - mobile 390px horizontal overflow: 4개 대표 화면 통과.
- 스크린샷 산출물: `docs/batch7_support_mypage_smoke/` 아래 16장 생성.

## 검증 조건

- API는 `**/v1/api/**`를 빈 응답으로 mock 처리했다.
- 목적은 이번 batch의 UI 구조, final UI 클래스, 자산 누락, 반응형 overflow 확인이다.
- 첫 Playwright 실행은 `D:\Cubici_Integration_20260730\.downloads\ms-playwright` 브라우저 캐시가 비어 실패했고, `C:\Users\User\AppData\Local\ms-playwright` 캐시로 재실행해 통과했다.

## 메뉴/구성 판단

- 마이페이지는 240130 legacy 최종본의 3개 대분류 느낌을 반영하되, 기존 React의 6개 탭을 유지했다.
- 이유: 현재 개발된 회사정보/사업정보/인증정보/요금정보/탈퇴 기능 접근성을 줄이지 않기 위해서다.
- 고객지원/요금/머니뱅크 route 명칭은 변경하지 않았다.

## 잔여 리스크

- 실제 API/DB 데이터가 있는 상태의 표 길이, 긴 텍스트, 파일 다운로드 흐름은 별도 검증 필요.
- 계약 상세의 이용조건 동의, 전자서명 mock, 해지신청은 UI 표시만 smoke 확인했고 legacy 산식/상태 전이는 미검산.
- 관리자 화면은 이번 Batch 7 범위에서 수정하지 않았다.
- 운영 배포, 전체 회귀검증, legacy 산식 검산은 아직 남아 있다.

## 진행률

- 사용자 페이지 final UI 복원: 약 66%.
- 전체 프로젝트 기준 보수 진행률: 약 49%.
- 다음 단계: Batch 8에서 모바일 세부 polish, 긴 데이터/빈 데이터 상태 보정, 사용자 페이지 회귀 후보 점검을 진행하는 것이 적절하다.
