# Cubici 환경설정 연계코드 관리 화면 Migration

## 작업 결과

- legacy `adminPreference/managePromotion` 화면을 React 관리자 화면으로 구현했다.
- legacy `CBCI_PROMOTION_CODE` + `CBCI_CHARGE_PROMOTION_CONNECTION` 흐름을 PostgreSQL `promotion` + `promotion_charge` 구조로 재구성했다.
- 연계코드 목록, 검색, 상세 조회, 옵션 조회, 등록, 수정, 삭제 API를 추가했다.
- legacy 화면의 다중 연계요금제 체크박스 흐름을 유지했다.

## 변경 파일

- `db/postgres/migrations/013_promotion_charge_connection.sql`
- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/preferences.js`
- `admin-web/src/pages/PromotionManagementPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/promotion-management.spec.js`
- `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`
- `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`

## Legacy 기준

- legacy 화면: `/admin/cubici/adminPreference/managePromotion`
- legacy Ajax/API:
  - `/admin/cubici/adminPreference/promotionlist`
  - `/admin/cubici/adminPreference/promotiondetail`
  - `/admin/cubici/adminPreference/promoCodeSelect`
  - `/admin/cubici/adminPreference/partnerCodeSelect`
  - `/admin/cubici/adminPreference/promotioninsert`
  - `/admin/cubici/adminPreference/promotionupdate`
  - `/admin/cubici/adminPreference/promotiondelete`
- legacy 테이블:
  - `CBCI_PROMOTION_CODE`
  - `CBCI_CHARGE_PROMOTION_CONNECTION`
  - `CBCI_PARTNER`
  - `CBCI_BILLING_CHARGE`
  - `CBCI_SELECT_CODE`
- PostgreSQL 전환 테이블:
  - `promotion`
  - `promotion_charge`
  - `partner`
  - `charge`

## 구현 범위

- 목록 컬럼:
  - 상태
  - 시작 일자
  - 협력사명
  - 연계이름
  - 연계코드
  - 주요대상
  - 연계요금제
  - % 할인
  - 금액할인
  - 무료기간
  - 단위
  - 제공ID수
  - 상세 보기
- 검색 조건:
  - 연계코드
  - 운영상태
  - 협력사
  - 보기기준
- write 기능:
  - 연계코드 등록
  - 상세 조회
  - 수정
  - 삭제
  - 다중 연계요금제 연결 저장

## 검증 여부

- Python API 테스트: `40 passed, 1 skipped`
- React build: 성공
- Playwright E2E: `promotion-management.spec.js` 성공
- PostgreSQL live DB 직접 저장/조회 검증: 미완료

## 보류/주의사항

- 현재 PostgreSQL 프로세스가 실행 중이 아니어서 live DB CRUD 검증은 하지 못했다.
- legacy `CBCI_SELECT_CODE` 테이블이 PostgreSQL schema에서 확인되지 않아 `promotionTarget` 라벨은 코드 매핑으로 처리했다.
- partner division 라벨은 현재 `partner.partner_type` 값을 그대로 사용한다. 운영 전 legacy `partnerType` 코드명과 대조해야 한다.
- legacy promo code 생성은 `promo_target + partner_code` 조합이다. 신규 화면도 기본값은 동일하게 잡지만, 중복 방지 정책은 live DB 검증 단계에서 재확인해야 한다.

## 다음 액션

- PostgreSQL 실행 후 `promotion`, `promotion_charge` migration 적용 및 live CRUD 검증.
- `CBCI_SELECT_CODE` 대응 테이블/데이터 존재 여부 재확인.
- 다음 환경설정 화면 후보:
  - 접근권한
  - 협력사 관리
  - 머니뱅크 관리
  - Prism System
