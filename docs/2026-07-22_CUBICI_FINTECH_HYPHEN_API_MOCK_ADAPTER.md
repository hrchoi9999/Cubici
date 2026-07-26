# Cubici Fintech/Hyphen API Mock Adapter

## 작업 결과

- Hyphen/KSNET 펌뱅킹 연동의 첫 Python API 구현을 추가했다.
- 실송금 기능은 비활성화하고, legacy DB 조회와 mock 전문 생성만 제공한다.
- 신규 API prefix:
  - `/v1/api/fintech`

## 변경 파일

- `service-api/src/cubici_service/fintech/__init__.py`
- `service-api/src/cubici_service/fintech/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/fintech.py`
- `service-api/src/cubici_service/api/v1/router.py`
- `service-api/tests/test_domain_routes.py`

## 구현 API

- `GET /v1/api/fintech/status`
  - Hyphen/펌뱅킹 adapter 상태 확인
  - `live_transfer_enabled=false`
- `GET /v1/api/fintech/trade-requests`
  - `TRADE_REQUEST_BIN` 조회
  - `include_raw=false` 기본값으로 `SEND_MSG`, `RECV_MSG` 원문은 기본 비노출
  - 개발 검증 시 `include_raw=true`로 원문 확인 가능
- `GET /v1/api/fintech/firm-requests`
  - `firm_request_bin` 조회
- `GET /v1/api/fintech/result-inquiries`
  - `trade_result_inquiry` 조회
- `POST /v1/api/fintech/mock/transfer-message`
  - 300 byte mock 송금 전문 생성
  - 실송금 사용 금지

## 검증 결과

- `pytest service-api/tests/test_domain_routes.py -q`
  - 44 passed
- 실제 PostgreSQL 연결 조회 확인
  - `TRADE_REQUEST_BIN`: 4142건
  - `firm_request_bin`: 48건
  - `trade_result_inquiry`: 2073건

## 보수적 판단

- 현재 구현은 실송금 adapter가 아니다.
- `mock/transfer-message`는 migration 개발용 envelope이며, 하이픈 최종 300 byte 전문 레이아웃 확정 전까지 실거래에 사용하면 안 된다.
- 실송금 연결은 다음 조건 충족 후 별도 작업으로 진행한다.
  - 하이픈/경남은행 현재 계약 상태 확인
  - 접속 IP/port/firewall 확인
  - 운영/테스트 환경 분리
  - 전문 필드 단위 테스트
  - 송금 중복 방지 idempotency 정책
  - 취소/결과조회/응답 미수신 재조회 정책

## 다음 액션

1. `TRADE_REQUEST_BIN` 컬럼과 하이픈 300 byte 전문 필드 매핑표 작성
2. legacy 테스트 JSP의 `/fintech/api/*` 흐름을 신규 `/v1/api/fintech/*`로 재분류
3. 관리자 화면에 펌뱅킹 요청/응답 조회 화면 연결
4. mock 송금 요청을 실제 DB insert까지 확장할지 별도 결정
