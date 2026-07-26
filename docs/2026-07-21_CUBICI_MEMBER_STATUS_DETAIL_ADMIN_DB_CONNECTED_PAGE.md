# Cubici 회원 상세 상태 화면 DB 연결 구현

## 작업 결과

- legacy `/admin/cubici/manageMember/userstatus` 회원명 클릭 상세 화면을 React 관리자 화면으로 1차 migration했다.
- 신규 API는 `/v1/api/management/member-status/{user_no}`이다.
- 사용자 기본정보, 운영 쇼핑몰, 요금/수수료 정보, 머니뱅크 계약/상환, 추가서류 확인, 최근 상환 이력을 DB에서 조회한다.
- legacy 결제 이력 테이블은 현재 PostgreSQL migration DB에 없어 `moneybank_contract_fee` 기반 요금/수수료 정보로 대체했다.

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/MemberStatusPage.jsx`
- `admin-web/src/pages/MemberInfoPage.jsx`
- `admin-web/src/pages/MemberWithdrawalPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/member-status-detail.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`

## 검증 여부

- API pytest: `34 passed, 1 skipped`.
- 실제 DB 상세 조회: 통과.
  - 테스트 사용자 `user_no=36`.
  - 운영 쇼핑몰 5건, fee 2건, 계약 2건, 최근 상환 이력 18건 조회.
- React build: 통과.
- 회원 상세 E2E: 통과.

## 보수적 완성도

- `회원관리 > 회원현황`: 75~80%.
- 회원 종합, 회원 정보, 휴면/해지, 회원 상세 조회는 DB/API/화면/E2E까지 구현했다.
- legacy 결제 이력 원본 테이블, 평가메모 write, 해지확인 write는 아직 미구현이다.

## 다음 액션

- `회원관리 > 결제관리(payment_tab1)` 구현으로 넘어간다.
- legacy 결제 이력 테이블이 추가 제공되면 회원 상세의 결제현황 탭을 1:1 재구성한다.
