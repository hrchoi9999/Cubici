# Cubici 환경설정 협력사 관리 화면 Migration

## 작업 결과

- legacy `adminPreference/managePartner` 화면을 React 관리자 화면으로 구현했다.
- legacy `CBCI_PARTNER` + `CBCI_MANAGER_INFO` 흐름을 PostgreSQL `partner` + `partner_manager` 구조로 재구성했다.
- 협력사 목록, 검색, 상세 조회, 사업자번호/협력사코드 중복 확인, 등록, 수정, 삭제 API를 추가했다.
- 책임자(`manager_type=00`)와 담당자(`manager_type=01`) 정보를 함께 저장하도록 구현했다.

## 변경 파일

- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/preferences.js`
- `admin-web/src/pages/PartnerManagementPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/partner-management.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`
- `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`

## Legacy 기준

- legacy 화면: `/admin/cubici/adminPreference/managePartner`
- legacy Ajax/API:
  - `/admin/cubici/adminPreference/partnerList`
  - `/admin/cubici/adminPreference/partnerdetail`
  - `/admin/cubici/adminPreference/partnerinsert`
  - `/admin/cubici/adminPreference/partnerupdate`
  - `/admin/cubici/adminPreference/partnerdelete`
  - `/admin/cubici/adminPreference/divisionCodeAuth`
- legacy 테이블:
  - `CBCI_PARTNER`
  - `CBCI_MANAGER_INFO`
  - `CBCI_SELECT_CODE`
- PostgreSQL 전환 테이블:
  - `partner`
  - `partner_manager`

## 구현 범위

- 목록 컬럼:
  - 상태
  - 등록 일자
  - 업종
  - 회사명
  - 협력사 코드
  - 대표이사
  - 사업자 번호
  - 담당자
  - 담당자 전화
  - 상세 보기
- 검색 조건:
  - 회사명
  - 운영상태
  - 대표자
  - 협력사코드
  - 보기기준
- write 기능:
  - 협력사 등록
  - 협력사 상세 조회
  - 협력사 수정
  - 협력사 삭제
  - 사업자번호 중복 확인
  - 협력사코드 중복 확인
  - 책임자/담당자 정보 upsert

## 검증 여부

- Python API 테스트: `41 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `partner-management.spec.js` 성공
- PostgreSQL live DB 직접 저장/조회 검증: 미완료

## 보류/주의사항

- 현재 PostgreSQL 프로세스가 실행 중이 아니어서 live DB CRUD 검증은 하지 못했다.
- legacy `CBCI_SELECT_CODE` 테이블이 PostgreSQL schema에서 확인되지 않아 업종 라벨은 현재 `partner.partner_type` 코드값으로 표시한다.
- legacy 주소 검색 팝업(`/addrSearch`)은 신규 화면에서 직접 구현하지 않고 우편번호/주소 수동 입력으로 대체했다.
- legacy 사업자번호 검증(`ckBisNo`)은 현재 중복 확인 중심으로 구현했다. 사업자번호 checksum 검증은 운영 전 추가 여부를 결정해야 한다.
- 기존 `partner_id`는 primary key로 보고 상세 수정 시 변경하지 않도록 처리했다.

## 다음 액션

- PostgreSQL 실행 후 `partner`, `partner_manager` live CRUD 검증.
- `CBCI_SELECT_CODE` 대응 테이블/데이터 존재 여부 재확인.
- 주소 검색 팝업 또는 주소 API 연동 필요 여부 확인.
- 다음 환경설정 화면 후보:
  - 접근권한
  - 머니뱅크 관리
  - Prism System
