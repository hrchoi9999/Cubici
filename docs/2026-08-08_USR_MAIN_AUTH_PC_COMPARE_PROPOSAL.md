# USR-MAIN-AUTH-PC 비교 및 수정 제안

점검일: 2026-08-08

## 화면 정의

| 항목 | 값 |
|---|---|
| 화면 ID | `USR-MAIN-AUTH-PC` |
| 화면명 | 사용자 메인(로그인 후/PC) |
| Route | `/`, `/main` authenticated state |
| 기준 이미지 | `docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/reference/pc_index_login.png` |
| 현재 이미지 | `docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/current/current-react.png` |
| 비교 이미지 | `docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/compare/reference-vs-current.png` |
| 기준 HTML | `240130_큐빅아이/index-login.html` |
| 현재 주요 구현 | `user-web/src/pages/HomePages.jsx` |

## 현재 출력 조건

- 최신 Cloudflare Pages 배포 bundle
- viewport 1920 x 1080
- 전체 페이지 screenshot
- 실제 개인정보/API를 사용하지 않고 가짜 로그인 세션만 주입
- 기준 이미지 1920 x 2354
- 현재 이미지 1920 x 1541

## 차이 분석

| 우선순위 | 영역 | LV 기준 | 현재 React | 판단 |
|---|---|---|---|---|
| P0 | 로그인 후 본문 전환 | 로그인 후 전용 dashboard 표시 | 로그인 Header만 표시되고 비로그인 본문 유지 | 핵심 구조 누락 |
| P0 | 매출/정산 | 매출총액·정산입금 카드 2개 | 전체 영역 없음 | 복원 필요 |
| P0 | 머니뱅크 현황 | 이용잔액, 총 이용원금, 총 상환원금, 최근 이용내역 | 전체 영역 없음 | 복원 필요 |
| P1 | Header | 진한 남색 배경, 흰색 logo/menu | 흰색 배경, 남색 logo/menu | 로그인 메인 전용 variant 필요 |
| P1 | Hero | LV 고정 폭·여백·모니터 크기 | 구성/이미지는 유사하나 크기와 위치 차이 | 현재 slider 동작을 유지하며 CSS 보정 |
| P1 | 주요 서비스 | dashboard 아래 배치 | dashboard 누락으로 바로 노출 | dashboard 복원 후 자연스럽게 원위치 |
| P2 | Footer | LV 구회사정보·회색 footer | 사용자 승인 최신 회사정보·남색 footer | 승인된 현재 footer를 예외로 유지 |

## 권장 구현안

### 1순위: LV 재현율

1. `MainPage`를 로그인 상태에 따라 `FinalMainAuthed`와 `FinalMainPublic`으로 분리한다.
2. 로그인 메인에는 `index-login.html`과 동일한 섹션 순서를 사용한다.
3. `Layout`에 로그인 메인 전용 Header variant를 추가해 다른 사용자 페이지 CSS에 영향을 주지 않는다.
4. Hero의 높이, inner 폭, 제목/본문 크기, 모니터 이미지 크기와 pagination 위치를 기준 이미지에 맞춘다.
5. 매출/정산 카드와 머니뱅크 현황을 별도 React 컴포넌트로 만들되 LV class 구조를 최대한 유지한다.
6. 현재 주요 서비스 4개 카드는 재사용하고 dashboard 아래로 이동한다.
7. Footer는 사용자가 승인한 최신 회사정보·높이·색상을 유지한다.

### 2순위: 기존 기능 유지

1. 인증은 기존 `readAuthSession`을 그대로 사용한다.
2. 쇼핑몰 권한 필터는 기존 `useAuthenticatedShopPairs`를 유지한다.
3. 계약/상환 기본 데이터는 기존 `useUserDashboardData`를 재사용한다.
4. 매출총액과 정산입금은 paginated 목록 일부를 프론트에서 합산하지 않는다.
5. 정확한 합계를 위해 인증 사용자 전용 read-only dashboard summary API를 추가하는 방식을 권장한다.
6. dashboard summary API는 기존 sale/settlement/contract/redemption 테이블을 조회하며 DB schema와 write 기능은 변경하지 않는다.
7. 상세보기 버튼은 기존 매출/정산/머니뱅크 route로 연결한다.
8. API 실패 시 기존 페이지 전체를 숨기지 않고 각 카드에 조회 실패/빈 상태를 독립적으로 표시한다.

## 권장하지 않는 방법

- 현재 API의 첫 5건 또는 최대 100건만 합산해 전체 매출·정산 금액으로 표시
- LV 화면을 하나의 배경 이미지로 만들어 기능 위에 덮기
- 로그인/비로그인 화면을 CSS `display`만으로 동시에 렌더링
- Header/Footer 전역 CSS를 변경해 다른 사용자 화면을 함께 흔드는 방식

## 예상 변경 파일

| 파일 | 변경 예상 |
|---|---|
| `user-web/src/pages/HomePages.jsx` | 인증 메인 분리, LV dashboard 컴포넌트 |
| `user-web/src/shared/UserCore.jsx` | Header variant와 dashboard data helper |
| `user-web/src/styles/final-ui-foundation.css` | 로그인 메인 전용 LV 스타일 |
| `service-api/src/cubici_service/api/v1/endpoints/*` | read-only dashboard summary endpoint 검토 |
| `service-api/src/cubici_service/*/repository.py` | 사용자 권한 범위 aggregate query 검토 |
| `user-web/tests/e2e/*` | 화면/기능 focused E2E와 승인 이미지 |

## 현재 진행률

- 화면 복원율: 60%
  - 기준 매핑, 현재 출력, 차이 검토 완료
  - 구현과 최종 사용자 승인 미완료
- 기능 구현율: 20%
  - 로그인 Header와 서비스 route는 동작
  - 로그인 후 dashboard 조회/표시는 미구현

## 다음 승인 항목

1. Header를 기준 이미지처럼 진한 남색으로 복원
2. 매출/정산 카드 2개를 기준 구조로 복원
3. 머니뱅크 현황/이용내역을 기준 구조로 복원
4. Footer는 현재 승인 버전을 유지
5. 정확한 합계를 위한 read-only summary API 추가 허용 여부

## 2026-08-08 구현 결과

- 승인된 5개 항목을 모두 구현했다.
- 후보 이미지: `docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/candidate/candidate-react.png`
- 로그인 메인 전용 남색 Header, 매출/정산 카드, 머니뱅크 요약/이용내역, 주요 서비스 순서를 복원했다.
- Footer는 사용자 승인 최신 회사정보/남색/높이를 그대로 유지했다.
- 사용자 전용 `GET /v1/api/accounts/me/dashboard-summary`를 추가했다.
- 화면 복원율은 사용자 최종 승인 전 80%, 기능 구현율은 운영 DB 집계 검증 전 80%로 보수적으로 기록한다.
