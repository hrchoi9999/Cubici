# Cubici 환경설정 요금제 관리 화면 Migration

## 작업 결과

- legacy `adminPreference/manageCharge` 화면을 React 관리자 화면으로 구현했다.
- legacy `CBCI_BILLING_CHARGE` 기준 기능을 PostgreSQL `charge` 테이블 기준으로 재구성했다.
- 요금제 목록, 검색, 상세 조회, 등록, 수정, 삭제 API를 추가했다.
- React 화면은 기존 관리자 테이블/검색폼 CSS 톤을 재사용했다.

## 변경 파일

- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/preferences/__init__.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/src/cubici_service/api/v1/router.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/preferences.js`
- `admin-web/src/pages/ChargeManagementPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/charge-management.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`

## Legacy 기준

- legacy 화면: `/admin/cubici/adminPreference/manageCharge`
- legacy Ajax/API:
  - `/admin/cubici/adminPreference/chargeList`
  - `/admin/cubici/adminPreference/chargeDetail`
  - `/admin/cubici/adminPreference/chargeinsert`
  - `/admin/cubici/adminPreference/chargeupdate`
  - `/admin/cubici/adminPreference/chargedelete`
- legacy 테이블: `CBCI_BILLING_CHARGE`
- PostgreSQL 전환 테이블: `charge`

## 구현 범위

- 목록 컬럼:
  - No
  - 등록 일자
  - 요금코드
  - 요금제
  - 유형
  - 상태
  - 시작일
  - 종료일
  - 기준금액
  - 제공 ID
  - 거래 건수
  - 상품 수
  - 상세보기
- 검색 조건:
  - 운영구분
  - 요금코드
  - 요금제명
  - 보기기준
- write 기능:
  - 신규 등록
  - 상세 조회
  - 수정
  - 삭제

## 검증 여부

- Python API 테스트: `38 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `charge-management.spec.js` 성공
- PostgreSQL live DB 직접 조회/저장 검증: 미완료

## 보류/주의사항

- 현재 PostgreSQL 프로세스가 실행 중이 아니어서 live DB 기준 CRUD 검증은 하지 못했다.
- 삭제는 legacy 흐름을 따라 구현했지만, 운영 전에는 결제/회원 이력에서 참조 중인 요금제 삭제 정책을 확정해야 한다.
- 요금코드 생성 규칙은 legacy JS의 단순 조합 로직을 참고했으나, 운영 전 중복 방지 정책을 재확인해야 한다.

## 다음 액션

- PostgreSQL 실행 후 `charge` 실데이터 기준 목록/상세/write 검증.
- 다음 환경설정 화면 후보:
  - 관리자 등록
  - 연계코드 관리
  - 협력사 관리
  - 머니뱅크 관리
  - Prism System
