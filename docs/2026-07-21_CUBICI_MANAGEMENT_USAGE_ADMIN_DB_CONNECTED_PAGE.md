# Cubici 머니뱅크 관리 이용상세 관리자 화면 DB 연동 구현

## 작업 결과

- 관리자 `머니뱅크 관리 > 이용상세` 화면을 React 페이지로 구현했다.
- 경로는 `/admin/moneybank/management/usageList`로 연결했다.
- FastAPI `GET /v1/api/management/usage`를 추가했다.
- PostgreSQL 실데이터 기준으로 계약, 회원, 수수료, 상환잔액, PCS 결과를 결합해 표시한다.
- 검색 조건으로 `회원명`, `회사명`, `회원ID`, `서비스`, `이용상태`, `신청일자 범위`, `보기기준`을 추가했다.
- 목록 하단에 총 건수, 상태별 건수, 이용금액, 상환잔액 합계를 표시한다.
- 목록에서 `보기` 선택 시 이용상세 패널을 표시한다.
- 기존 관리자 화면의 `m-options`, `m-search`, `fixTable`, `m-shadowTable`, `fixBottom`, `m-paging` 구조를 재사용했다.

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/App.jsx`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/ManagementUsagePage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-21_CUBICI_MANAGEMENT_USAGE_ADMIN_DB_CONNECTED_PAGE.md`

## 검증 여부

- PostgreSQL 실데이터 API 확인 완료
  - `GET /v1/api/management/usage?limit=20&offset=0`
  - 전체 7건 확인
  - 상태별: 심사 1건, 상환 4건, 만료 2건
  - 이용금액 합계 `55,686,548`
  - 상환잔액 합계 `913,604`
- 상태 필터 확인 완료
  - `status=repayment`
  - 필터 결과 4건 확인
- FastAPI 테스트 완료
  - `20 passed, 1 skipped`
- React production build 완료
  - `npm run build`
- Playwright 화면 확인 완료
  - `/admin/moneybank/management/usageList`
  - 상단 화면명: `머니뱅크 관리 > 이용상세`
  - 활성 메뉴: `이용상세`
  - 목록 7건 표시
  - 상세 패널 7개 행 표시
  - 가로 overflow 0
- 관리자 E2E 완료
  - `5 passed`

## 보수적 판단

- 현재 이용상태는 PostgreSQL 이관 테이블 기준으로 `moneybank_contract.status`와 최신 `moneybank_redemption_history.outstanding_balance`를 조합해 산정했다.
- legacy `ManageMemberMapper.selectMoneybankDetail`의 `mb_status`, `calculate_deposit_amount`, `act_principal`, `repayment_balance`와 1:1 산식 검산은 아직 완료되지 않았다.
- 따라서 이 화면은 이용상세 목록 초안 구현 완료로 보고, legacy 산식 검산과 상태 정책 확정은 후속 작업으로 둔다.

## 다음 액션

- `머니뱅크 관리 > 이용상세`의 상세 탭/이력 화면을 구현한다.
- 이후 통합 현황 및 이용상세 산식을 legacy MyBatis 결과와 항목별로 검산한다.
