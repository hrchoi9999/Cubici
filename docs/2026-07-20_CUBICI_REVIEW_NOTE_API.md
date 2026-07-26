# Cubici 심사 메모/안내 전화 API 구현 기록

## 작업 결과

- legacy `addInfoCallDetail` 기능을 신규 FastAPI/React 관리자 화면에 구현했다.
- legacy는 `CBCI_EVALUATE`에 `division = '02'`, `object_no = mbid`, `eval_subject = '신청'`으로 안내 전화/심사 메모를 저장했다.
- 현재 PostgreSQL migration에는 `CBCI_EVALUATE` 테이블이 없어서 신규 테이블 `contract_review_note`를 추가했다.
- 관리자 상세 화면에 legacy `안내 전화` 영역과 유사한 메모 등록/목록 UI를 추가했다.

## DB 변경

- `db/postgres/migrations/004_contract_review_notes.sql`
  - `contract_review_note`
  - 주요 컬럼: `mbid`, `eval_subject`, `reviewer`, `title`, `detail`, `reg_date`
  - 조회 인덱스: `(mbid, reg_date desc, id desc)`

## 신규 API

- `GET /v1/api/contracts/{mbid}/review-notes`
  - 계약별 심사 메모 목록 조회
- `POST /v1/api/contracts/{mbid}/review-notes`
  - 심사 메모 등록
  - request body: `reviewer`, `title`, `detail`

## 변경 파일

- `Cubici/db/postgres/migrations/004_contract_review_notes.sql`
- `Cubici/service-api/src/cubici_service/api/v1/router.py`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/review_notes.py`
- `Cubici/service-api/src/cubici_service/review_notes/repository.py`
- `Cubici/service-api/tests/test_domain_routes.py`
- `Cubici/admin-web/src/api/contracts.js`
- `Cubici/admin-web/src/pages/AdminDashboardPage.jsx`
- `Cubici/admin-web/src/styles/admin-web.css`

## 검증 여부

- migration 적용
  - `MIGRATION_004_OK`
- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest D:\Alt_CSM\Cubici\service-api\tests`
  - 17 passed
- `D:\Alt_CSM\.tools\node-v22.13.1-win-x64\npm.cmd run build`
  - Vite production build 성공
- 심사 메모 E2E
  - 기존 계약 `MPK2723123` 기준 임시 메모 등록
  - 목록 조회에서 등록 메모 확인
  - 테스트 row 삭제 완료

## 다음 액션

- 신청 접수 목록에서 상태/서류/스코어 버튼별 상세 화면 분리
- 계약 승인/상태 변경 API migration
- legacy 암호화 파일(`enc_type = 'Y'`) 복호화 방식 migration 여부 결정
