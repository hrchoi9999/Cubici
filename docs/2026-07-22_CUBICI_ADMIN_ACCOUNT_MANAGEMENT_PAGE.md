# Cubici 환경설정 관리자 등록 화면 Migration

## 작업 결과

- legacy `adminPreference/adminRegister_tab1` 화면을 React 관리자 화면으로 구현했다.
- legacy `CBCI_ADMIN` 흐름을 PostgreSQL 서비스용 `admin_account` 테이블로 재설계했다.
- 관리자 목록, 검색, 상세 조회, 신청 등록, 승인, 수정, 삭제 API를 추가했다.
- 승인/수정 시 비밀번호는 legacy salt(`{AZON}`) 기준 SHA-256 hash로 저장하고, API 응답에는 비밀번호/hash를 반환하지 않는다.

## 변경 파일

- `db/postgres/migrations/012_admin_account_preferences.sql`
- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/preferences.js`
- `admin-web/src/pages/AdminAccountManagementPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/admin-account-management.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`

## Legacy 기준

- legacy 화면: `/admin/cubici/adminPreference/adminRegister_tab1`
- legacy Ajax/API:
  - `/admin/cubici/adminPreference/adminRegister_tab1/getAdminList`
  - `/admin/cubici/adminPreference/adminRegister_tab1/adminIdCheck`
  - `/admin/cubici/adminPreference/adminRegister_tab1/approvalAdmin`
  - `/admin/cubici/adminPreference/adminRegister_tab1/updateAdmin`
  - `/admin/cubici/adminPreference/adminRegister_tab1/deleteAdmin`
- legacy 테이블: `CBCI_ADMIN`
- PostgreSQL 전환 테이블: `admin_account`

## 구현 범위

- 목록 컬럼:
  - #
  - 회사명
  - 부서명
  - 이름
  - 핸드폰
  - 이메일
  - 신청일자
  - 승인일자
  - 접근권한
  - 상태
  - 수정
- 검색 조건:
  - 회사명
  - 접근권한
  - 상태
  - 이름
  - 보기기준
- write 기능:
  - 관리자 신청 등록
  - 관리자 ID 중복 확인
  - 관리자 등록 승인
  - 관리자 정보 수정
  - 관리자 등록 해지

## 검증 여부

- Python API 테스트: `39 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `admin-account-management.spec.js` 성공
- PostgreSQL live DB 직접 저장/조회 검증: 미완료

## 보류/주의사항

- 현재 PostgreSQL 프로세스가 실행 중이 아니어서 live DB CRUD 검증은 하지 못했다.
- legacy schema inventory에서 `CBCI_ADMIN` DDL이 확인되지 않아, 서비스용 `admin_account` migration을 새로 정의했다.
- legacy `updateAdmin` JS에는 투게더/헬로펀딩 수정 시 `ADMIN_TYPE`을 모두 `00`으로 보내는 버그성 로직이 있어 Python/React에서는 정상 코드값을 유지하도록 구현했다.
- 운영 전 권한 등급 `00/01/02`의 실제 역할 범위와 접근권한 탭(`adminRegister_tab2`) 연동을 재확인해야 한다.

## 다음 액션

- PostgreSQL 실행 후 `admin_account` migration 적용 및 live CRUD 검증.
- 다음 환경설정 화면 후보:
  - 접근권한
  - 연계코드 관리
  - 협력사 관리
  - 머니뱅크 관리
  - Prism System
