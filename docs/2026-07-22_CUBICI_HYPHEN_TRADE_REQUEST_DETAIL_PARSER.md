# Cubici Hyphen Trade Request Detail Parser

## 작업 결과

- `TRADE_REQUEST_BIN` 상세 조회 API를 추가했다.
- `SEND_MSG`, `RECV_MSG` 300 byte 전문 parser를 추가했다.
- 실제 Hyphen 호출은 하지 않고, 로컬 PostgreSQL에 저장된 legacy 전문만 해석한다.

## 변경 파일

- `service-api/src/cubici_service/fintech/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/fintech.py`
- `service-api/tests/test_domain_routes.py`

## 신규 API

- `GET /v1/api/fintech/trade-requests/{req_date}/{bank_code}/{comp_code}/{seq_no}`

Query:

- `include_raw=false`
  - 기본값은 원문 `SEND_MSG`, `RECV_MSG` 비노출
- `include_parsed=true`
  - 기본값은 parser 결과 포함

## Parser 범위

공통부:

- 식별코드
- 업체코드
- 은행코드2
- 메시지코드
- 업무구분코드
- 송신횟수
- 전문번호
- 전송일자
- 전송시간
- 응답코드
- 은행응답코드
- 조회일자
- 조회번호
- 은행전문번호
- 은행코드3

개별부:

- 송금이체/지급이체: `0100100`, `0110100`
- 처리결과조회: `0600101`, `0610101`
- 잔액조회: `0600300`, `0610300`
- 계좌/예금주조회: `0600400`, `0610400`
- 가상계좌 입금통지: `0200300`, `0210300`

## 검증 결과

- service-api 전체 테스트
  - `48 passed, 1 skipped`
- 실제 PostgreSQL 상세 조회 확인
  - 조회 row: `REQ_DATE=20240507`, `BANK_CODE=039`, `COMP_CODE=NKPAY002`, `SEQ_NO=200005`
  - `SEND_MSG` parser 결과: `0600101`
  - `RECV_MSG` parser 결과: `0610101`

## 보수적 판단

- parser는 문서 offset 기준 1차 구현이다.
- 실제 운영 적용 전에는 업무별 `RECV_MSG` 결과코드와 Cubici 후처리 상태값의 매핑을 추가로 검증해야 한다.
- 계좌번호/전문 원문은 기본 API 응답에서 raw 비노출로 둔다.

## 다음 액션

1. 관리자 화면에 펌뱅킹 요청/응답 목록과 상세 parser 패널을 연결한다.
2. `RECV_MSG` 결과코드별 성공/실패/재조회 정책을 정리한다.
3. mock 송금 요청을 DB insert까지 확장할지 결정한다.
