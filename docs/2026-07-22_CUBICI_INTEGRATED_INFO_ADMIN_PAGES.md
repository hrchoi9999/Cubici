# Cubici 통합정보 관리자 화면 구현 기록

## 작업 결과

- `통합정보 > 큐빅아이` 화면을 placeholder에서 실제 React 화면으로 전환했다.
- `통합정보 > 머니뱅크` 화면을 placeholder에서 실제 React 화면으로 전환했다.
- 신규 backend API는 추가하지 않고 기존 관리 API를 재사용했다.

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/pages/CubiciIntegratedInfoPage.jsx`
- `admin-web/src/pages/MoneybankIntegratedInfoPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/integrated-info.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`
- `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`

## Legacy 기준

| 화면 | Legacy URL | Legacy 주요 내용 | 신규 구현 |
|---|---|---|---|
| 큐빅아이 통합정보 | `/admin/cubici/infoIntegrated/cubici_tab1` | 회원/매출/정산/SKU 요약과 chart | 회원 가입/머니뱅크 전환/해지/결제 요약, 회원 추이 |
| 머니뱅크 통합정보 | `/admin/cubici/infoIntegrated/moneybank_tab1` | `MoneyBankAccumulateValue`, chart | 계약/선정산/상환/정산/잔액 요약, 금액 추이 |

## 검증 여부

- Playwright E2E mock API 검증 대상:
  - `/admin/cubici/infoIntegrated/cubici_tab1`
  - `/admin/cubici/infoIntegrated/moneybank_tab1`
- PostgreSQL live DB 연결 확인은 timeout으로 실패했다.
- 현재 세션 권한상 `C:\PostgreSQL\17` 기동 명령은 실행하지 않았다.

## 차이/검증 필요

- 큐빅아이 legacy의 매출, 정산금액, SKU chart는 아직 1:1 구현하지 않았다.
- 머니뱅크 legacy `MoneyBankAccumulateValue` 산식은 기존 `/v1/api/management/overview` 산식을 재사용했으며 원 legacy SQL과 대조가 필요하다.
- 기간 단위/차트 UI는 legacy와 완전 동일하지 않고 React 관리자 공통 스타일로 재구성했다.

## 다음 액션

- PostgreSQL 실행 후 통합정보 두 화면의 실데이터 로딩을 확인한다.
- legacy chart 산식과 신규 API 집계값을 대조한다.
- 운영 우선순위가 높으면 Excel export보다 dashboard 산식 검산을 먼저 진행한다.
