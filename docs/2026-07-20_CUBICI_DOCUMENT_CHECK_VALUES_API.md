# Cubici 서류 확인값 저장 API 구현 기록

## 작업 결과

- 관리자 신청 상세 화면에서 CB 점수, 채무불이행, 금융질서문란, 공공정보, 연체정보, 국세/지방세/건강보험 확인값을 수정할 수 있게 했다.
- legacy `addCBInfo`의 CB 확인 저장 흐름을 신규 FastAPI API로 분리했다.
- PostgreSQL `bit(1)` 컬럼은 API에서 `1`, `0`, `null`로 받고 DB에는 `bit(1)`로 저장한다.
- 저장 후 계약 상세를 다시 조회해 화면 표시값을 갱신한다.

## 신규 API

- `PUT /v1/api/contracts/{mbid}/documents/checks`
  - `moneybank_contract_document` upsert
  - `cb_check = B'1'`
  - `cb_confirm_admin = updated_by`
  - CB 점수/등수/6개월 점수 및 각 확인 플래그 저장

## 변경 파일

- `Cubici/service-api/src/cubici_service/api/v1/endpoints/documents.py`
- `Cubici/service-api/src/cubici_service/documents/repository.py`
- `Cubici/service-api/tests/test_domain_routes.py`
- `Cubici/admin-web/src/api/contracts.js`
- `Cubici/admin-web/src/pages/AdminDashboardPage.jsx`
- `Cubici/admin-web/src/styles/admin-web.css`

## 검증 여부

- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest D:\Alt_CSM\Cubici\service-api\tests`
  - 16 passed
- `D:\Alt_CSM\.tools\node-v22.13.1-win-x64\npm.cmd run build`
  - Vite production build 성공
- 확인값 저장 E2E
  - 기존 계약 `MPK2723123` 기준 확인값 저장
  - 계약 상세에서 CB 점수, bit flag, 건강보험 납부총액 반영 확인
  - 테스트 후 원래 `moneybank_contract_document` 값으로 원복 완료

## 다음 액션

- 신청 접수 목록에서 상태/서류/스코어 버튼별 상세 화면 분리
- legacy `addInfoCallDetail` 심사 메모/평가 의견 기능 migration
- legacy 암호화 파일(`enc_type = 'Y'`) 복호화 방식 migration 여부 결정
