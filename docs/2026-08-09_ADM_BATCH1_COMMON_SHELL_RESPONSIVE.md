# Cubici ADM Batch 1 - 관리자 공통 셸 및 반응형 기준

## 작업 범위

- 관리자 로그인, Header, 좌측 메뉴, sub visual, 본문 wrapper 공통 기준
- PC 기존 좌측 메뉴 구조 유지
- 680px 이하 모바일 메뉴 버튼, 드로어, backdrop, ESC 닫기 적용
- 모바일 로그인, 검색 폼, 입력 요소 폭 보정
- 개별 업무 화면 기능 및 Backend 변경 제외

## 기준 자료

- `cubici LV admin capture/관리자화면01.png` ~ `관리자화면10.png`
- 공통 특징: 짙은 남색 Header, 파란 sub visual, 좌측 메뉴, 흰색 본문, 조밀한 표/검색 UI
- 240130 사용자 LV 원본에는 관리자 전용 최종 디자인 소스가 없으므로 기존 rudicks 관리자 자원과 승인된 Prism 방향을 공통 기준으로 사용

## 변경 파일

- `admin-web/src/components/layout/AdminLayout.jsx`
  - 모바일 내비게이션 토글과 접근성 상태 추가
  - route 변경, backdrop 클릭, ESC 입력 시 닫기
  - 메뉴 열림 중 body scroll 잠금
- `admin-web/src/styles/admin-web.css`
  - 데스크톱 기존 셸 유지
  - 모바일 드로어, overlay, 헤더/로그인/폼 반응형 보정
  - legacy `#wrap` 상단 padding과 모바일 relative header 충돌 제거
- `admin-web/tests/e2e/adm-batch1-common-shell-responsive.spec.js`
  - API/인증 mock 기반 공통 셸 focused smoke
  - PC/모바일 overflow, 메뉴 전체 노출, ESC 닫기 검증

## 후보 이미지

- `docs/reference/lv-ui/admin/ADM-00-COMMON-SHELL/candidate/admin-login-pc.png`
- `docs/reference/lv-ui/admin/ADM-00-COMMON-SHELL/candidate/admin-login-mobile.png`
- `docs/reference/lv-ui/admin/ADM-00-COMMON-SHELL/candidate/admin-shell-pc.png`
- `docs/reference/lv-ui/admin/ADM-00-COMMON-SHELL/candidate/admin-shell-mobile.png`
- `docs/reference/lv-ui/admin/ADM-00-COMMON-SHELL/candidate/admin-shell-mobile-navigation.png`

## 검증

| 검증 | 결과 |
| --- | --- |
| Vite production build | 성공, 73 modules transformed |
| focused Playwright | 3/3 통과, 4.7초 |
| PC body horizontal overflow | 1px 이하 |
| 모바일 body horizontal overflow | 1px 이하 |
| 모바일 메뉴 | 폭 300px 이상, x >= -1px, y >= 67px |
| 모바일 닫기 | backdrop 및 ESC 동작 |
| 시각 점검 | Header 공백, 메뉴 애니메이션 중간 캡처 문제 수정 후 재검증 |

잔여 경고는 Vite의 JavaScript chunk 크기 약 560kB이며 이번 공통 UI 동작 실패는 아니다.

## 보수적 진행률

| 기준 | 현재 상태 |
| --- | --- |
| ADM-00 공통 기준 후보 구현 | 90% |
| ADM-00 사용자 최종 승인 | 2026-08-09 승인 |
| legacy 직접 메뉴 화면 승인 | 0/24 |
| alias/detail 포함 React route | 33개, 화면별 재검증 전 |
| React page 파일 | 32개, 화면별 재검증 전 |
| JSP 물리 파일 후보 | 61개, 산식/업무 규칙 검산 전 |
| 관리자 기능 migration | 기존 문서 기준 63~67%, 이번 Batch에서 변동 없음 |

## 다음 단계

ADM Batch 1 후보 승인 후 `ADM Batch 2`에서 통합정보 2개, 회원관리 2개, 머니뱅크 관리 2개를 페이지별로 PC/모바일 화면 복원과 기능 검증으로 진행한다.

Git staging, commit, push, 운영 배포는 관리자 전체 milestone 전까지 수행하지 않는다.

Batch 4에서 확정한 공통 pagination 형식을 역적용 검토했으나 ADM Batch 1의 로그인/공통 shell에는 pagination 구성요소가 없어 변경 대상이 없다.
