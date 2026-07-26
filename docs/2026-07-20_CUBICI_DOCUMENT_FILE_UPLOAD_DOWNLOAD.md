# Cubici 제출서류 파일 업로드/다운로드 구현 기록

## 작업 결과

- 관리자 신청 상세 화면의 제출서류 파일 목록, 업로드, 다운로드 기능을 신규 React/FastAPI 구조에 추가했다.
- legacy 파일 공통 구조는 `CBCI_FILE` 테이블 중심으로 확인했다.
- legacy 화면 `submissionState.jsp`의 제출서류 파일 유형은 `CBInfo`, `regNo`, `demand`, `main`으로 분류했다.
- 신규 업로드 파일은 `D:\Alt_CSM\Cubici\data_local\documents` 아래에만 저장한다.
- 파일 메타데이터는 PostgreSQL의 기존 migration 테이블 `"CBCI_FILE"`에 저장한다.

## Legacy 확인 내용

- 파일 다운로드는 `/file/download` POST 호출로 수행됐다.
- 다운로드 파라미터는 `uuid`, `enc_type`, `userKey`를 사용했다.
- 파일 메타데이터 조회/저장 mapper는 `FileMapper.xml`의 `CBCI_FILE` 쿼리를 사용했다.
- 기존 파일 검증 조건은 확장자 `jpg`, `jpeg`, `png`, `hwp`, `pdf` 및 최대 5MB였다.

## 신규 API

- `GET /v1/api/contracts/{mbid}/documents/files`
  - 계약별 제출서류 파일 목록 조회
- `POST /v1/api/contracts/{mbid}/documents/files`
  - multipart 업로드
  - form fields: `document_type`, `uploaded_by`, `file`
- `GET /v1/api/contracts/{mbid}/documents/files/{uuid}/download`
  - 계약별 파일 다운로드
- `POST /v1/api/contracts/{mbid}/documents/confirm`
  - 제출서류 최종 확인 처리
  - request body: `confirmed_by`
  - `"CBCI_FILE"`에 계약별 파일이 1건 이상 있어야 처리한다.

## 추가 연동

- 계약 목록/상세 응답에 `document_file_count`를 추가했다.
- 관리자 신청 접수 목록의 `서류` 컬럼은 `제출서류 완료 여부 (파일 건수)` 형식으로 표시한다.
- 관리자 상세 화면의 `서류 확인` 영역도 제출서류 완료 여부와 파일 건수를 함께 표시한다.
- 파일 업로드 시 `moneybank_contract.mbid`가 존재하지 않으면 저장하지 않고 404를 반환한다.
- 제출서류 최종 확인 시 `moneybank_contract_document.final_confirm_admin`을 갱신한다.
- 신규 PostgreSQL schema에는 legacy `sub_complete` 컬럼이 없으므로, `final_confirm_admin` 존재 여부를 `sub_complete = Y` 판정 기준으로 유지한다.

## 보안/운영 판단

- 실제 관리자 운영 재현을 위해 파일 업로드/다운로드 기능은 구현한다.
- 단, 신규 저장 파일의 저장 루트는 `D:\Alt_CSM\Cubici\data_local\documents`로 고정한다.
- URL의 `mbid`와 파일 UUID의 `file_division_pk`가 일치하는 경우만 다운로드한다.
- 작업공간 밖 파일 경로는 직접 다운로드하지 않는다.
- 신규 업로드 파일은 현재 암호화하지 않고 `enc_type = 'N'`으로 기록한다.
- legacy의 `enc_type = 'Y'` 파일 복호화는 별도 암호화 키/컴포넌트 migration 전까지 보류한다.

## 변경 파일

- `Cubici/service-api/pyproject.toml`
- `Cubici/service-api/src/cubici_service/core/config.py`
- `Cubici/service-api/src/cubici_service/api/v1/router.py`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/documents.py`
- `Cubici/service-api/src/cubici_service/contracts/repository.py`
- `Cubici/service-api/src/cubici_service/documents/repository.py`
- `Cubici/admin-web/src/api/contracts.js`
- `Cubici/admin-web/src/pages/AdminDashboardPage.jsx`
- `Cubici/admin-web/src/styles/admin-web.css`
- `Cubici/service-api/tests/test_domain_routes.py`

## 검증 여부

- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest D:\Alt_CSM\Cubici\service-api\tests`
  - 15 passed
- `D:\Alt_CSM\.tools\node-v22.13.1-win-x64\npm.cmd run build`
  - Vite production build 성공
- 실제 API E2E
  - 기존 계약 `MPK2723123` 기준 임시 PDF 업로드
  - 파일 목록 조회 확인
  - 계약 상세의 `document_file_count` 증가 확인
  - 다운로드 바이트 일치 확인
  - 임시 `"CBCI_FILE"` row와 저장 파일 정리 완료
- 제출서류 최종 확인 E2E
  - 기존 계약 `MPK2723123` 기준 임시 PDF 업로드
  - `POST /v1/api/contracts/{mbid}/documents/confirm` 호출
  - `final_confirm_admin = confirm-e2e` 반영 확인
  - 계약 상세의 `sub_complete = Y` 확인
  - 임시 `"CBCI_FILE"` row, 저장 파일, 확인자 값 원복 완료

## 다음 액션

- legacy 암호화 파일(`enc_type = 'Y'`) 복호화 방식 migration 여부 결정
- CB 점수/채무불이행/국세/지방세/건강보험 확인값을 관리자 화면에서 수정하는 API 구현
