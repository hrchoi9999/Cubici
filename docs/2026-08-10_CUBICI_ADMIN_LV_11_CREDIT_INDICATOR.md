# Cubici 관리자 ADM-LV-11 신용평가지표 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 신용평가지표`
- 기준 route: `/admin/moneybank/manage`
- 보존 route: `/admin/moneybank/risk-results`
- 직접 LV 기준: `docs/reference/lv-ui/admin/reference/관리자화면07.png`
- legacy 구조: `src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/moneybank/operation/manageIndex.jsp`

## LV 대조와 적용

- 기존 `/admin/moneybank/manage`의 위험평가 결과 목록은 LV 기준 화면이 아니어서 별도 파생 route로 이동했다.
- LV의 `재조정` bar, PCS 지표, PCS 평가등급, PMS 지표, PMS 평가등급, 초기화·저장 순서를 복원했다.
- PCS 5개 차원과 PMS 3개 리스크 그룹을 legacy와 같은 순서로 묶었다.
- 정산계좌 변경여부와 정산입금 결손은 `NO(정상)`, `YES(경고/주의)`를 표시한다.
- 모바일은 열 순서를 바꾸지 않고 표 내부 가로 스크롤을 사용하며 좌측 메뉴는 기본 닫힘 상태다.

## DB/API 매핑

- 개발 DB `prizm_items` 26행을 사용한다.
- PCS: 지표 14행 + 평가등급 1행
- PMS: 지표 10행 + 평가등급 1행
- 목록은 `GET /v1/api/preferences/prizm-config/items`로 불러온다.
- 저장은 변경된 행만 기존 `PUT /v1/api/preferences/prizm-config/items/{division}/{subject_no}/{item_no}`로 전송한다.
- 초기화는 화면 최초 조회 또는 마지막 저장 상태로 되돌린다.

## 보존 기능

- 기존 PCS/PMS 위험평가 결과 목록·상세는 삭제하지 않았다.
- 파생 route `/admin/moneybank/risk-results`와 `view=prism-results`에서 기존 기능을 유지한다.

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/pages/CreditIndicatorManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/credit-indicator-management.spec.js`
- `admin-web/tests/e2e/prizm-management.spec.js`
- `admin-web/tests/e2e/adm-batch3-moneybank-operation-responsive.spec.js`
- `admin-web/tests/e2e/batch11-5-admin-moneybank-operation-smoke.spec.js`
- `admin-web/tests/e2e/admin-ui-focused.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| Prism API contract focused pytest | 1 passed |
| ADM-LV-11 조회·변경행 저장 mock E2E | 통과 |
| 기존 위험평가 결과 목록·상세 회귀 | 통과 |
| PC·모바일 focused E2E 합계 | 2 passed |
| 개발 Docker DB 읽기 전용 대조 | 26행, PCS 15 / PMS 11 |
| 모바일 좌측 메뉴 기본 닫힘 | 통과 |
| 모바일 표 내부 가로 스크롤 | 통과 |
| 실제 개발 DB write E2E | 미수행 |
| 운영 배포 | 미수행 |

## 승인 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-11-CREDIT-INDICATOR/approved/ADM-LV-11-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-11-CREDIT-INDICATOR/approved/ADM-LV-11-MOBILE.png`
- PC SHA256: `A1FBA5E69E31D303749BF95C3B2E2B20EBCEB133F98692EDCADEE92DA7E0A7BF`
- 모바일 SHA256: `D6CB3FFBE24E5F4CE06ADBF6E77CB650B03063EBDC9C48D4785DD4577D1A0206`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 78%
- 실제 DB 조회는 확인했으나 실제 PUT write E2E는 아직 수행하지 않았다.
- legacy `ITEM_SCORE`, `OPERATOR1/2` 정규화 구조는 현재 wide low/high 컬럼으로 대체되어 있다.
- 변경된 기준값을 PCS/PMS 재산출 및 Alt_CSM 평가에 반영하는 산식 연동은 별도 검산이 필요하다.
- 운영 배포는 전체 관리자 화면 복원과 회귀 완료 전까지 수행하지 않는다.
- 다음 승인 단위: `ADM-LV-12 고객관리 > 고객문의`
