# Cubici ADM Batch 2 - 통합정보·회원관리·머니뱅크 관리

## 작업 범위

| 코드 | 직접 메뉴 | Route | legacy 직접 캡처 |
| --- | --- | --- | --- |
| ADM-01A | 통합정보 > 큐빅아이 | `/admin/cubici/infoIntegrated/cubici_tab1` | 없음, 공통 규격 적용 |
| ADM-01B | 통합정보 > 머니뱅크 | `/admin/cubici/infoIntegrated/moneybank_tab1` | 없음, 공통 규격 적용 |
| ADM-02A | 회원관리 > 회원현황 | `/admin/cubici/manageMember/member_tab1` | `관리자화면01.png` |
| ADM-02B | 회원관리 > 결제관리 | `/admin/cubici/manageMember/payment_tab1` | 없음, 공통 규격 적용 |
| ADM-03A | 머니뱅크 관리 > 통합 현황 | `/admin/moneybank/cubici/management/info_tab1` | `관리자화면02.png` |
| ADM-03B | 머니뱅크 관리 > 이용상세 | `/admin/moneybank/management/usageList` | 없음, 공통 규격 적용 |

## 구현 내용

- 통합정보 본문의 중복 제목과 설명 제거
- 통합정보 2분할 legacy tab, 상태 정보, KPI, 검색, 추이표 반응형 적용
- 공통 활성 tab을 남색 배경과 흰색 글자로 수정
- 회원 KPI와 추이 영역의 모바일 줄바꿈 보정
- 머니뱅크 통합 현황의 기준 정보, KPI, 경고표, 추이표를 모바일 local scroll 구조로 보정
- 이용상세 합계 bar를 PC 흰색 글자, 모바일 2열 grid로 보정
- 결제관리와 이용상세 pagination을 Batch 4 기준으로 통일: 이전/다음 `#9fb2cf`, 현재 페이지 `#002e6e`, 동일 높이
- `/admin/moneybank/management/usageList`에서 Prism 관리 화면이 중복 렌더링되던 route prefix 충돌 수정
- Backend API/schema 변경 없음

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/pages/CubiciIntegratedInfoPage.jsx`
- `admin-web/src/pages/MoneybankIntegratedInfoPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-batch2-six-pages-responsive.spec.js`
- `docs/2026-08-09_ADM_BATCH1_COMMON_SHELL_RESPONSIVE.md`

## 후보 이미지

`docs/reference/lv-ui/admin/ADM-BATCH2-SIX-PAGES/candidate`에 화면별 PC/mobile 총 12개를 생성했다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| Vite production build | 성공, 73 modules transformed |
| 6개 route PC/mobile 표시 | 6/6 통과 |
| 검색/분석단위 query 반영 | 6/6 통과 |
| body horizontal overflow | PC/mobile 모두 1px 이하 |
| pagination 공통 색상·높이 | 결제관리/이용상세 PC/mobile 통과 |
| 이용상세 Prism 중복 렌더링 | 제거 및 회귀 조건 통과 |
| Backend endpoint payload/auth focused pytest | 8/8 통과, 1.48초 |
| 실제 DB/API E2E | 미수행 |
| legacy 산식 검산 | 미수행 |

Vite JavaScript chunk 약 560kB 경고는 잔여 리스크로 유지한다.

## 화면별 보수적 진행률

| 화면 | 후보 화면 복원율 | 기능 구현률 | 남은 핵심 항목 |
| --- | ---: | ---: | --- |
| ADM-01A 큐빅아이 통합정보 | 86% | 75% | 직접 캡처 승인, 실제 DB, 집계 산식 검산 |
| ADM-01B 머니뱅크 통합정보 | 86% | 75% | 직접 캡처 승인, 실제 DB, 잔액 산식 검산 |
| ADM-02A 회원현황 | 92% | 78% | 후보 승인, 실제 DB, legacy 회원 집계 검산 |
| ADM-02B 결제관리 | 82% | 75% | 직접 캡처 승인, 실제 DB, pagination/금액 검산 |
| ADM-03A 통합 현황 | 92% | 80% | 후보 승인, 실제 DB, 잔액/경고 산식 검산 |
| ADM-03B 이용상세 | 84% | 72% | 직접 캡처 승인, 실제 DB, 상세 route/Excel 검증 |

## 관리자 전체 진행 상태

| 기준 | 상태 |
| --- | --- |
| ADM-00 공통 기준 | 승인 완료 |
| ADM Batch 2 후보 작성 | 6/6 |
| legacy 직접 메뉴 최종 승인 | 6/24, Batch 2 사용자 승인 완료 |
| alias/detail 포함 React route | 33개, 전체 회귀 전 |
| React page 파일 | 32개, 전체 회귀 전 |
| JSP 물리 파일 후보 | 61개, 산식/업무 규칙 검산 전 |
| 관리자 전체 기능 migration | 기존 63~67% 유지, 실제 DB/CRUD/산식 재검증 전 |

## 다음 단계

ADM Batch 2의 6개 직접 메뉴는 사용자 승인에 따라 `승인 6/24`로 전환했다. 다음 작업은 ADM Batch 3의 머니뱅크 운영 6개 화면과 기존 Batch 11-5B focused smoke이다.

Git staging, commit, push, 운영 배포는 관리자 전체 milestone 전까지 수행하지 않는다.
