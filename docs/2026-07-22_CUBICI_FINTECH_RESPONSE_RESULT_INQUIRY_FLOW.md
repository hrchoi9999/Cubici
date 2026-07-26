# Cubici Fintech Response and Result Inquiry Flow

## 작업 결과

- 하이픈/은행 실통신 없이 내부 mock 기준의 응답 수신/결과조회 저장 흐름을 구현했다.
- 송금요청 생성 후 다음 단계를 로컬 DB에서 재현할 수 있게 했다.
- 실제 외부 API 호출은 계속 비활성 상태로 유지한다.

## 신규 API

- `POST /v1/api/fintech/mock/transfer-response`
  - 대상: 기존 `TRADE_REQUEST_BIN` 송금 요청 row
  - 처리:
    - `SEND_MSG` 기반 `0110100` 응답 전문 생성
    - `RECV_MSG` 저장
    - `SEND_FLAG=Y`, `RECV_FLAG=Y`
    - `PROCESS_STATUS=MOCK`
  - 원거래 미존재 시 404

- `POST /v1/api/fintech/mock/result-inquiry`
  - 대상: 기존 `TRADE_REQUEST_BIN` 송금 요청 row
  - 처리:
    - 원 송금요청의 parsed field 기반으로 `trade_result_inquiry` row 저장
    - `message_code=0610`
    - `business_class_code=101`
    - `processing_status=MOCK`
  - 원거래 미존재 시 404

## 저장 흐름

1. `POST /v1/api/fintech/mock/transfer-request`
   - `TRADE_REQUEST_BIN`에 `0100100` 송금요청 mock 저장
2. `POST /v1/api/fintech/mock/transfer-response`
   - 같은 PK의 `TRADE_REQUEST_BIN` row에 `0110100` 응답 mock 저장
3. `POST /v1/api/fintech/mock/result-inquiry`
   - `trade_result_inquiry`에 `0610101` 결과조회 응답 의미의 parsed row 저장

## 안전 원칙

- 외부 하이픈/은행 호출 없음.
- 기존 legacy row는 mock API 검증에서 update/delete하지 않는다.
- 테스트 row는 `PROCESS_STATUS=MOCK` 조건으로만 정리한다.
- 실제 금액 반영/상환 반영은 아직 연결하지 않는다.
- 결과조회 성공이 확인되더라도 현재 단계에서는 회계/잔액 변경을 수행하지 않는다.

## 변경 파일

- `service-api/src/cubici_service/fintech/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/fintech.py`
- `service-api/tests/test_domain_routes.py`
- `docs/2026-07-22_CUBICI_FINTECH_RESPONSE_RESULT_INQUIRY_FLOW.md`

## 검증 결과

- `service-api/tests/test_domain_routes.py`
  - `49 passed`
- `service-api` 전체 테스트
  - `52 passed, 1 skipped`
- PostgreSQL mock flow 검증
  - `TRADE_REQUEST_BIN` mock 송금요청 1건 저장
  - `TRADE_REQUEST_BIN` mock 송금응답 수신 업데이트
  - `trade_result_inquiry` mock 결과조회 row 1건 저장
  - 상세 조회 결과: `RECV_FLAG=Y`, `result_policy=정상`, `PROCESS_STATUS=MOCK`
  - 검증 후 mock row 2건 삭제
- HTTP API flow 검증
  - `/mock/transfer-request`: `created=true`
  - `/mock/transfer-response`: `updated=true`, `result_policy=정상`
  - `/mock/result-inquiry`: `created=true`, `processing_status=MOCK`
  - 검증 후 mock row 2건 삭제
- 로컬 서버 상태
  - `http://127.0.0.1:8000/openapi.json`에 신규 endpoint 반영 확인
  - `http://127.0.0.1:5174/admin/cubici/adminMonitor/fintech_trade` HTTP 200 확인

## 다음 액션

1. 결과조회 성공 row를 선정산/상환 운영 상태에 반영하는 정책을 설계한다.
2. 실패/반려 결과코드별 후처리 queue 또는 관리자 대사 화면을 설계한다.
3. 실제 하이픈 adapter 연결은 운영 승인 전까지 보류한다.
