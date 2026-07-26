# Cubici 계약 승인/상태 변경 API 구현 기록

## 작업 결과

- 계약 상태 변경 API를 신규 FastAPI에 추가했다.
- 관리자 상태 상세 화면에 `승인`, `거부`, `해지` 버튼을 연결했다.
- 상태 변경 시 `moneybank_contract.status`를 갱신하고 `contract_status_history`에 변경 이력을 기록한다.

## Legacy 확인 내용

- legacy `MbStatus` 주요 코드
  - `03`: 심사대기
  - `04`: 조건
  - `05`: 동의
  - `06`: 계약체결
  - `31`: 중도해지
  - `41`: 조건거부
- legacy `AdminJudgeMapper.modifyAdjStatus`는 `mb_status`와 `mb_approval_date`를 갱신했다.
- 신규 PostgreSQL `moneybank_contract.status`는 문자열 상태값을 사용한다.
  - 현재 분포: `JOIN`, `CONTRACT`, `SELF_TERMINATION`

## 신규 상태 매핑

- `approve` -> `CONTRACT`
- `reject` -> `REJECTED`
- `cancel` -> `SELF_TERMINATION`

## DB 변경

- `db/postgres/migrations/005_contract_status_history.sql`
  - `contract_status_history`
  - 주요 컬럼: `mbid`, `previous_status`, `new_status`, `action`, `changed_by`, `reason`, `reg_date`

## 신규 API

- `PUT /v1/api/contracts/{mbid}/status`
  - request body: `action`, `changed_by`, `reason`
  - `approve` 시 `approval_date`가 비어 있으면 현재 시각 저장
  - `cancel` 시 `cancel_request_date`가 비어 있으면 현재 시각 저장

## 변경 파일

- `Cubici/db/postgres/migrations/005_contract_status_history.sql`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/contracts.py`
- `Cubici/service-api/src/cubici_service/contracts/repository.py`
- `Cubici/service-api/tests/test_domain_routes.py`
- `Cubici/admin-web/src/api/contracts.js`
- `Cubici/admin-web/src/pages/AdminDashboardPage.jsx`
- `Cubici/admin-web/src/styles/admin-web.css`

## 검증 여부

- migration 적용
  - `MIGRATION_005_OK`
- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest D:\Alt_CSM\Cubici\service-api\tests`
  - 18 passed
- `D:\Alt_CSM\.tools\node-v22.13.1-win-x64\npm.cmd run build`
  - Vite production build 성공
- 상태 변경 E2E
  - 기존 계약 `MPK2723123` 기준 `approve` 호출
  - 상세 조회에서 `CONTRACT` 반영 확인
  - `contract_status_history` row 생성 확인
  - 테스트 후 계약 상태/date와 이력 row 원복 완료

## 다음 액션

- legacy 계약 체결/동의/계좌대기 세부 상태 전이 추가 검토
- 선정산 계약 조건/수수료 조정 화면 migration
- legacy 암호화 파일(`enc_type = 'Y'`) 복호화 방식 migration 여부 결정
