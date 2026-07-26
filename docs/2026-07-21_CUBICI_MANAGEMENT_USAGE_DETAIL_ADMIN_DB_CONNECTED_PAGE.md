# Cubici 머니뱅크 관리 이용상세 상세 화면 DB 연동 구현

## 작업 결과

- 관리자 `머니뱅크 관리 > 이용상세 > 회원 상세정보` 화면을 React 페이지로 구현했다.
- 경로는 `/admin/moneybank/management/usageDetail?mbid={MBID}`로 연결했다.
- FastAPI `GET /v1/api/management/usage/{mbid}`를 추가했다.
- PostgreSQL 실데이터 기준으로 회원 요약, 기본정보, 머니뱅크 이용 현황, 추가서류 확인값, 계약 이력, 상환 이력을 표시한다.
- 이용상세 목록의 `보기` 버튼은 상세 화면으로 이동하도록 변경했다.
- 상세 화면 탭은 `기본정보`, `머니뱅크`, `추가서류`, `상환이력`으로 구성했다.

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/App.jsx`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/ManagementUsagePage.jsx`
- `admin-web/src/pages/ManagementUsageDetailPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-21_CUBICI_MANAGEMENT_USAGE_DETAIL_ADMIN_DB_CONNECTED_PAGE.md`

## 검증 여부

- PostgreSQL 실데이터 API 확인 완료
  - `GET /v1/api/management/usage/MPK2723123`
  - 회원명 `최형락`
  - 쇼핑몰 1건
  - 추가서류 정보 있음
  - 계약 이력 1건
  - 상환 이력 17건
  - 상환잔액 `909,988`
- FastAPI 테스트 완료
  - `21 passed, 1 skipped`
- React production build 완료
  - `npm run build`
- Playwright 화면 확인 완료
  - `/admin/moneybank/management/usageDetail?mbid=MPK2723123`
  - 상단 화면명: `머니뱅크 관리 > 이용상세`
  - 활성 메뉴: `이용상세`
  - 탭: `기본정보`, `머니뱅크`, `추가서류`, `상환이력`
  - 머니뱅크 계약 이력 1행
  - 상환 이력 17행
  - 가로 overflow 0
- 목록에서 상세 이동 확인 완료
  - `/admin/moneybank/management/usageList` `보기` 클릭
  - `/admin/moneybank/management/usageDetail?mbid=MPK2723123` 이동 확인
- 관리자 E2E 완료
  - `5 passed`

## 보수적 판단

- 현재 상세 화면은 PostgreSQL 이관 테이블 기준으로 재구성한 화면이다.
- legacy `userStatusDetail`, `findMbTab`, `findFileCheck`, `findHistoryList`와 항목별 1:1 검산은 아직 완료되지 않았다.
- 계좌 원문과 민감 식별정보는 상세 화면에 직접 노출하지 않고, 계약 상세 화면에서 별도 관리하는 것으로 유지했다.

## 다음 액션

- 이용상세 상세 화면의 legacy 산식/항목명 검산을 진행한다.
- 또는 고객관리/환경설정 등 남은 관리자 메뉴 중 우선순위 화면을 구현한다.
