# Cubici 회원현황 회원 정보 관리자 화면 DB 연결 구현

## 작업 결과

- legacy `회원관리 > 회원현황 > 회원 정보(member_tab2)` 화면을 React 관리자 화면으로 1차 migration했다.
- 신규 API는 `/v1/api/management/member-info`이다.
- `users`, `shop_accounts`, `moneybank_contract` 기준으로 회원 목록, 검색, 이용서비스 구분, 운영몰 수, 집계값을 조회한다.

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/management.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/management.js`
- `admin-web/src/pages/MemberInfoPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/member-info-management.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`

## 검증 여부

- API pytest: `32 passed, 1 skipped`.
- 실제 DB 조회: 통과.
  - 총 회원: 42명.
  - 큐빅아이 회원: 36명.
  - 머니뱅크 회원: 6명.
- React build: 통과.
- 회원 정보 E2E: 통과.

## 보수적 완성도

- `회원관리 > 회원현황`: 60~65%.
- `member_tab1` 회원 종합과 `member_tab2` 회원 정보는 DB/API/화면/E2E까지 구현했다.
- `member_tab3` 휴면/해지, 회원 상세 상태 페이지, legacy 결제요금 정보 대조는 미완료다.

## 다음 액션

- `회원관리 > 회원현황 > 휴면/해지(member_tab3)`를 구현한다.
- 회원명 클릭 상세 화면 `/admin/cubici/manageMember/userstatus`는 별도 상세 migration으로 진행한다.
