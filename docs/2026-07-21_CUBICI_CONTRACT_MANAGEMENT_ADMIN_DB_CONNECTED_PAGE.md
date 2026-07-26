# Cubici 계약 관리 관리자 화면 DB 연동 구현

## 작업 결과

- 관리자 `머니뱅크 운영 > 계약 관리` 화면을 React 페이지로 구현했다.
- 경로는 `/admin/moneybank/approval_tab2`로 연결했다.
- 계약 목록은 FastAPI `GET /v1/api/contracts`와 PostgreSQL 실데이터를 기준으로 표시한다.
- 계약 상세는 FastAPI `GET /v1/api/contracts/{mbid}`와 PostgreSQL 실데이터를 기준으로 표시한다.
- 기존 Cubici 관리자 화면의 `m-search`, `m-shadowTable`, `fixTable`, `fixBottom`, 상세 테이블 구조를 재사용했다.
- 계약 목록에 최신 수수료율과 지급율을 표시하기 위해 계약 API 응답에 `latest_fee_rate`, `latest_payment_rate`를 추가했다.

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/components/layout/AdminLayout.jsx`
- `admin-web/src/pages/ContractManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `service-api/src/cubici_service/contracts/repository.py`
- `docs/2026-07-21_CUBICI_CONTRACT_MANAGEMENT_ADMIN_DB_CONNECTED_PAGE.md`

## 검증 여부

- PostgreSQL 실데이터 API 확인 완료
  - `GET /v1/api/contracts?limit=20&offset=0`
  - 계약 목록 7건 확인
  - 최신 수수료율/지급율 예시: `MPK2723123`, `0.92%`, `80%`
- FastAPI 테스트 완료
  - `18 passed, 1 skipped`
- React production build 완료
  - `npm run build`
- Playwright 화면 확인 완료
  - `/admin/moneybank/approval_tab2`
  - 상단 화면명: `머니뱅크 운영 > 계약 관리`
  - 활성 메뉴: `계약 관리`
  - 목록 7건 표시
  - 상세 패널 6개 행 표시
  - 가로 overflow 0
- 관리자 E2E 완료
  - `5 passed`

## 다음 액션

- `프리즘 지표 관리` 화면을 `prizm_pcs_result`, `prizm_pms_result` 실데이터 API와 연결한다.
- 이후 미세한 CSS, 간격, 폰트 크기 차이는 화면별 QA 단계에서 조정한다.
