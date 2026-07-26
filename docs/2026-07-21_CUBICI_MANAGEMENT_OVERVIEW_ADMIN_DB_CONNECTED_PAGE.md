# Cubici 머니뱅크 관리 통합 현황 관리자 화면 DB 연동 구현

## 작업 결과

- 관리자 `머니뱅크 관리 > 통합 현황` 화면을 React 페이지로 구현했다.
- 경로는 `/admin/moneybank/cubici/management/info_tab1`로 연결했다.
- FastAPI `GET /v1/api/management/overview`를 추가했다.
- PostgreSQL 실데이터 기준으로 상단 집계, 기간별 추이, 잔액 경고 목록을 표시한다.
- 기본 조회 기간은 이관 DB의 최신 업무일 기준 최근 30일로 산정한다.
- 기존 관리자 화면의 `m-tab`, `m-options`, `colorTxtBoxArea`, `stateTableArea`, `m-search`, `subBox`, `m-shadowTable` 구조를 재사용했다.
- 진행률, 난이도, 리스크 평가는 보수적으로 산정한다는 원칙을 `AGENTS.md`에 추가했다.

## 변경 파일

- `AGENTS.md`
- `service-api/src/cubici_service/management/__init__.py`
- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/src/cubici_service/api/v1/router.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/App.jsx`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/ManagementOverviewPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-21_CUBICI_MANAGEMENT_OVERVIEW_ADMIN_DB_CONNECTED_PAGE.md`

## 검증 여부

- PostgreSQL 실데이터 API 확인 완료
  - `GET /v1/api/management/overview?unit=day`
  - 기준일 `2024-05-01`
  - 조회기간 `2024-04-01 ~ 2024-05-01`
  - 계약 7건, 추이 31행, 경고 2건 확인
  - 미상환잔액 합계 `913,604` 확인
- 주 단위 필터 확인 완료
  - `GET /v1/api/management/overview?unit=week&from_date=2024-04-01&to_date=2024-05-01`
  - 추이 5행 확인
- FastAPI 테스트 완료
  - `19 passed, 1 skipped`
- React production build 완료
  - `npm run build`
- Playwright 화면 확인 완료
  - `/admin/moneybank/cubici/management/info_tab1`
  - 상단 화면명: `머니뱅크 관리 > 통합 현황`
  - 활성 메뉴: `통합 현황`
  - KPI 4개, 경고 2행, 추이 테이블 2개 표시
  - 가로 overflow 0
- 관리자 E2E 완료
  - `5 passed`

## 보수적 판단

- 현재 통합 현황 산식은 PostgreSQL 이관 테이블 기준의 신규 산식이다.
- legacy MyBatis `selectMainInfo`, `selectMemberGraphData`와 1:1 결과 검산은 아직 완료되지 않았다.
- 따라서 이 화면은 운영 대시보드 초안 구현 완료로 보고, legacy 산식 검산 및 정책 확정은 별도 후속 작업으로 둔다.

## 다음 액션

- `머니뱅크 관리 > 이용상세` 화면을 실제 DB/API 기반으로 구현한다.
- 이후 통합 현황 산식과 legacy 산식의 차이를 항목별로 검산한다.
