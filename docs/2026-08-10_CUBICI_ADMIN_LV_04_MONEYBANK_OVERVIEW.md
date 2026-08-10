# Cubici 관리자 ADM-LV-04 머니뱅크 통합 현황 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 통합 현황`
- route: `/admin/moneybank/cubici/management/info_tab1`, `/admin/moneybank/cubici/management/info_tab2`
- 승인 단위: ADM-LV-04 한 화면의 `현황 종합 / 운영지표` 두 탭

## LV 기준

- 화면 캡처: `docs/reference/lv-ui/admin/reference/관리자화면02.png`, `관리자화면03.png`
- HTML/그래프 구조: legacy `admin/moneybank/management/info_tab1.jsp`, `info_tab2.jsp`
- 차트 정의: legacy `resources/chart-admin/ac3p1-*.js`
- 공통 헤더·좌측 메뉴: 사용자 승인된 ADM-LV-00 유지

## 적용 결과

- `info_tab2`를 React route로 연결하고 두 탭 모두 동일한 머니뱅크 통합 현황 제목과 활성 메뉴를 유지했다.
- 현황 종합에 LV 지표 4개, 잔액 경고표, 검색/CSV와 회원·이용·이용률 그래프를 적용했다.
- 운영지표에 LV 지표 8개와 신청·계약·상환·잔액·수수료 그래프를 적용했다.
- CSS 막대 표를 legacy Chart.js 막대/선 혼합 그래프로 교체했다.
- 모바일은 KPI 2열, 검색 1열, 차트 고정 높이로 구성하고 body overflow를 제거했다.

## Backend/API 변경

- 기존 `GET /v1/api/management/overview` endpoint는 유지했다.
- summary에 당일 심사·계약·종료, 누적 상환 수수료를 추가했다.
- series에 신청·심사·계약·종료 건수/금액, 선정산 건수, 상환 수수료를 추가했다.
- 기존 field를 삭제하거나 의미를 변경하지 않아 기존 관리자 화면 contract를 유지했다.

## DB 대조

개발 Docker PostgreSQL `cubici-postgres-dev`를 읽기 전용으로 확인했다.

| 항목 | 값 |
|---|---:|
| 전체 계약 | 7건 |
| 운영 계약 | 4건 |
| 종료 계약 | 2건 |
| 선정산 | 538건 / 55,686,548원 |
| 상환 | 339건 / 54,772,944원 |
| 상환 수수료 | 566,016원 |
| legacy 산식 원금잔액 | 913,604원 |
| 최신 history 저장잔액 | 909,988원 |

상단 원금잔액은 LV legacy 산식인 `선정산 - 상환`을 사용한다. 저장 잔액의 `-3,616원` 차이는 API 검산값으로 유지해 숨기지 않는다.

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/pages/ManagementOverviewPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-04-management-overview.spec.js`
- `service-api/src/cubici_service/management/repository.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| Python compile | 통과 |
| admin production build | 통과, 73 modules |
| backend endpoint focused pytest | 1 passed, 74 deselected |
| ADM-LV-04 PC/모바일 Playwright | 4 passed |
| 기존 통합 현황 focused regression | 1 passed |
| 두 탭 Chart.js canvas | 6개 nonblank |
| 모바일 body overflow | 없음 |

## 후보 이미지

- 현황 종합 PC: `docs/reference/lv-ui/admin/ADM-LV-04-MONEYBANK-OVERVIEW/candidate/ADM-LV-04-MONEYBANK-OVERVIEW-PC.png`
- 운영지표 PC: `docs/reference/lv-ui/admin/ADM-LV-04-MONEYBANK-OVERVIEW/candidate/ADM-LV-04-MONEYBANK-OPERATION-PC.png`
- 현황 종합 모바일: `docs/reference/lv-ui/admin/ADM-LV-04-MONEYBANK-OVERVIEW/candidate/ADM-LV-04-MONEYBANK-OVERVIEW-MOBILE.png`
- 운영지표 모바일: `docs/reference/lv-ui/admin/ADM-LV-04-MONEYBANK-OVERVIEW/candidate/ADM-LV-04-MONEYBANK-OPERATION-MOBILE.png`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 85%
- legacy 산식 검산: 부분 완료, 저장 잔액 3,616원 차이 추적 필요
- 운영 배포: 미수행

## 승인본

- `docs/reference/lv-ui/admin/ADM-LV-04-MONEYBANK-OVERVIEW/approved`
- 다음 승인 단위: `ADM-LV-05 머니뱅크 운영 > 신청 접수`
