# Cubici 프리즘 지표 관리 관리자 화면 DB 연동 구현

## 작업 결과

- 관리자 `머니뱅크 운영 > 프리즘 지표 관리` 화면을 React 페이지로 구현했다.
- 경로는 `/admin/moneybank/manage`로 연결했다.
- 평가결과 목록은 FastAPI `GET /v1/api/risk-results`와 PostgreSQL 실데이터를 기준으로 표시한다.
- `prizm_pcs_result`, `prizm_pms_result`의 최신 결과를 MBID/회원번호 기준으로 결합해 표시한다.
- 검색 조건으로 `MBID`, `회원번호`, `PCS 등급`, `PMS 등급`, `평가일자 범위`를 추가했다.
- 목록에서 `보기` 선택 시 PCS/PMS 상세 지표를 같은 화면 하단에 표시한다.
- 기존 관리자 화면의 `m-search`, `m-shadowTable`, `fixTable`, `fixBottom`, 상세 테이블 구조를 재사용했다.

## 변경 파일

- `service-api/src/cubici_service/risk_results/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/risk_results.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/App.jsx`
- `admin-web/src/api/riskResults.js`
- `admin-web/src/pages/PrizmManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-21_CUBICI_PRIZM_MANAGEMENT_ADMIN_DB_CONNECTED_PAGE.md`

## 검증 여부

- PostgreSQL 실데이터 API 확인 완료
  - `GET /v1/api/risk-results?limit=20&offset=0`
  - 전체 8건 확인
  - 예시: `MPK2723123`, PCS `C / 635.8`, PMS `E / 111.5`
- 검색 조건 확인 완료
  - `prizm_grade=C`
  - 필터 결과 5건 확인
- FastAPI 테스트 완료
  - `18 passed, 1 skipped`
- React production build 완료
  - `npm run build`
- Playwright 화면 확인 완료
  - `/admin/moneybank/manage`
  - 상단 화면명: `머니뱅크 운영 > 프리즘 지표 관리`
  - 활성 메뉴: `프리즘 지표 관리`
  - 목록 8건 표시
  - 상세 패널: `PCS 평가 결과`, `PMS 평가 결과`
  - 가로 overflow 0
- 관리자 E2E 완료
  - `5 passed`

## 다음 액션

- `머니뱅크 관리 > 통합 현황` 화면을 실제 DB/API 기반으로 구현한다.
- 진행률은 전체 관리자/사용자/운영 배포 범위를 포함해 보수적으로 다시 산정한다.
