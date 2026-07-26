# Cubici Hyphen 300 Byte Trade Request Field Mapping

## 작업 결과

- 하이픈 자금이체대행 전문 V1.0.5 기준으로 `TRADE_REQUEST_BIN`과 300 byte 전문의 1차 매핑을 정리했다.
- Python mock 송금 전문 생성 로직을 문서의 바이트 offset 기준으로 조정했다.
- 실제 Hyphen 호출은 계속 비활성화한다.

## 기준 문서

- 내부 보관 위치: `.docs/hyphen-api-docs/실시간 출금대행/하이픈 자금이체대행 전문 V1.0.5.docx`
- 문서 성격: Hyphen/KSNET 계열 실시간 원화 펌뱅킹 300 byte 전문 설명서
- 전문 구성: 공통부 100 byte + 개별부 200 byte

## `TRADE_REQUEST_BIN` Lifecycle 매핑

| DB 컬럼 | 의미 | 300 byte 전문 대응 | 비고 |
|---|---|---|---|
| `mbid` | Cubici 계약/머니뱅크 식별자 | 없음 | 내부 업무 연결값 |
| `REQ_TYPE` | 요청 유형 | 없음 | 내부 분류값. 송금/결과조회/잔액조회 등으로 해석 |
| `REQ_DATE` | 요청 기준일 | 공통부 `전송일자` offset 33, len 8 | `YYYYMMDD` |
| `REQ_TIME` | 요청 기준시각 | 공통부 `전송시간` offset 41, len 6 | `HHMMSS` |
| `SVC_TYPE` | 통신모듈 routing 유형 | 없음 | `FirmBypassDB`에서 host/port 선택에 사용. 값 의미는 추가 확인 필요 |
| `BANK_CODE` | 은행코드 | 공통부 `은행코드3` offset 84, len 3 | 3자리 은행코드 |
| `COMP_CODE` | 업체코드 | 공통부 `업체코드` offset 9, len 8 | 하이픈/은행 부여 코드 |
| `SEQ_NO` | 전문번호 | 공통부 `전문번호` offset 27, len 6 | 업체코드+은행코드+일자 기준 unique key |
| `MSG_CODE` | 메시지+업무 코드 | 공통부 `메시지코드` offset 19 len 4 + `업무구분코드` offset 23 len 3 | 예: `0100100`, `0600101` |
| `SEND_FLAG` | 전송 상태 | 없음 | 초기 `N`, 전송 후 `Y` |
| `RECV_FLAG` | 응답 상태 | 없음 | 초기 `N`, 정상 `Y`, 접속실패 `C`, timeout `T`, 실패 `F` |
| `SEND_DATE` | 실제 모듈 전송일 | 없음 | 통신모듈 갱신 |
| `SEND_TIME` | 실제 모듈 전송시각 | 없음 | 통신모듈 갱신 |
| `RECV_DATE` | 응답 수신일 | 없음 | 통신모듈 갱신 |
| `RECV_TIME` | 응답 수신시각 | 없음 | 통신모듈 갱신 |
| `SEND_MSG` | 요청 전문 | 전체 300 byte | KSC5601/EUC-KR 기준 |
| `RECV_MSG` | 응답 전문 | 전체 300 byte | KSC5601/EUC-KR 기준 |
| `BIN_DATA` | 증빙/바이너리 | 일부 전문에서 사용 | 현재 우선순위 낮음 |
| `PROCESS_STATUS` | 업무 처리 상태 | 없음 | Cubici 내부 후처리 상태 |

## 공통부 100 byte

| 항목 | offset | length | 요청 설정 | DB 대응 |
|---|---:|---:|---|---|
| 식별코드 | 0 | 9 | 은행별 지정값 | 계약값 확인 필요 |
| 업체코드 | 9 | 8 | 필수 | `COMP_CODE` |
| 은행코드2 | 17 | 2 | 은행별 사용 | `BANK_CODE`의 2자리 파생 가능 |
| 메시지코드 | 19 | 4 | 필수 | `MSG_CODE[0:4]` |
| 업무구분코드 | 23 | 3 | 필수 | `MSG_CODE[4:7]` |
| 송신횟수 | 26 | 1 | 고정 `1` | 없음 |
| 전문번호 | 27 | 6 | 필수 | `SEQ_NO` |
| 전송일자 | 33 | 8 | 필수 | `REQ_DATE` |
| 전송시간 | 41 | 6 | 필수 | `REQ_TIME` |
| 응답코드 | 47 | 4 | 응답값 | `RECV_MSG` parsing |
| 은행 응답코드 | 51 | 4 | 응답값 | `RECV_MSG` parsing |
| 조회일자 | 55 | 8 | 처리결과 조회 시 사용 | 결과조회 요청 필드 |
| 조회번호 | 63 | 6 | 일부 조회/취소 시 사용 | 원거래 `SEQ_NO` 가능 |
| 은행전문번호 | 69 | 15 | 응답값 | `RECV_MSG` parsing |
| 은행코드3 | 84 | 3 | 필수 | `BANK_CODE` |
| 예비 | 87 | 13 | blank | 없음 |

## 송금이체/지급이체 개별부

- 요청/응답 코드: 요청 `0100/100`, 응답 `0110/100`
- DB `MSG_CODE`: `0100100` 형태로 저장하는 것으로 판단한다.

| 항목 | offset | length | 요청/응답 | 신규 구현 대응 |
|---|---:|---:|---|---|
| 출금 계좌번호 | 100 | 15 | 요청 | `withdrawal_account_number` |
| 통장 비밀번호 | 115 | 8 | 미사용/계약 확인 | blank |
| 복기부호 | 123 | 6 | 미사용/계약 확인 | blank |
| 출금 금액 | 129 | 13 | 요청 | `amount`, zero left pad |
| 출금 후 잔액부호 | 142 | 1 | 응답 | `RECV_MSG` parsing |
| 출금 후 잔액 | 143 | 13 | 응답 | `firm_request_bin.balance` 후보 |
| 입금 은행코드2 | 156 | 2 | 요청 | `deposit_bank_code` 2자리 |
| 입금 계좌번호 | 158 | 15 | 요청 | `deposit_account_number` |
| 수수료 | 173 | 9 | 응답 | `firm_request_bin.svc_charge` 후보 |
| 이체 시각 | 182 | 6 | 요청 | 현재시각 |
| 입금 계좌 적요 | 188 | 20 | 요청 | `deposit_summary` |
| CMS코드 | 208 | 16 | 조건부 | blank |
| 신원확인번호 | 224 | 13 | 계약 확인 | blank |
| 자동이체 구분 | 237 | 2 | 계약 확인 | blank |
| 출금 계좌 적요 | 239 | 20 | 요청 | `withdrawal_summary` |
| 입금 은행코드3 | 259 | 3 | 요청 | `deposit_bank_code` |
| 급여 구분 | 262 | 1 | 미사용 | blank |
| 예비 | 263 | 37 | blank | blank |

## 처리 결과 조회 개별부

- 요청/응답 코드: 요청 `0600/101`, 응답 `0610/101`
- DB `MSG_CODE`: `0600101` 형태로 저장하는 것으로 판단한다.

| 항목 | offset | length | 의미 | DB 후보 |
|---|---:|---:|---|---|
| 원거래 전문번호 | 100 | 6 | 조회 대상 송금 전문번호 | 원거래 `SEQ_NO` |
| 출금 계좌번호 | 106 | 15 | 응답 | `trade_result_inquiry.withdrawal_account_number` |
| 입금 계좌번호 | 121 | 15 | 응답 | `trade_result_inquiry.deposit_account_number` |
| 금액 | 136 | 13 | 응답 | `trade_result_inquiry.result_amount` |
| 수수료 | 149 | 9 | 응답 | `trade_result_inquiry.result_fee` |
| 지급번호 | 158 | 15 | 응답/옵션 | `payment_number` 후보 |
| 이체시각 | 173 | 6 | 원거래 처리시각 | `transfer_time` |
| 처리결과 | 179 | 4 | 원거래 처리코드 | `original_processing_result` |
| 은행코드2 | 183 | 2 | 은행코드 | 보조값 |
| 납부자번호 | 185 | 20 | 납부자/식별값 | `payer_number` 후보 |
| 거래구분 | 205 | 2 | 거래구분 | 추가 확인 |
| 은행코드3 | 207 | 3 | 은행코드 | withdrawal/deposit 구분 추가 확인 |

## 잔액 조회 개별부

- 요청/응답 코드: 요청 `0600/300`, 응답 `0610/300`

| 항목 | offset | length | 의미 | DB 후보 |
|---|---:|---:|---|---|
| 계좌번호 | 100 | 15 | 업체 계좌번호 | `out_account` 후보 |
| 잔액 부호 | 115 | 1 | 응답 | parsing |
| 계좌 잔액 | 116 | 13 | 응답 | `firm_request_bin.balance` 후보 |
| 지급 가능 금액 | 168 | 13 | 응답 | 별도 필드 필요 가능 |

## 계좌/예금주 조회 개별부

- 요청/응답 코드: 요청 `0600/400`, 응답 `0610/400`

| 항목 | offset | length | 의미 | DB 후보 |
|---|---:|---:|---|---|
| 거래 일자 | 100 | 4 | `MMDD` | 요청값 |
| 은행코드2 | 104 | 2 | 은행코드 | 보조값 |
| 계좌번호 | 106 | 16 | 조회 계좌 | 요청값 |
| 예금주명 | 122 | 22 | 응답 | 신규 저장 여부 결정 필요 |
| 업체 계좌번호 | 159 | 20 | PG/SUB 조건부 | 요청값 |
| 은행코드3 | 179 | 3 | 은행코드 | 요청값 |
| 금액 | 182 | 13 | 가상계좌 조회 시 | 요청값 |

## 가상계좌 입금통지 개별부

- 요청/응답 코드: 요청 `0200/300`, 응답 `0210/300`
- 하이픈에서 Cubici로 호출되는 inbound 성격이다.

| 항목 | offset | length | 의미 | DB 후보 |
|---|---:|---:|---|---|
| 계좌번호 | 100 | 15 | 입금 계좌 | 가상계좌번호/모계좌 |
| 거래구분 | 117 | 2 | 입금/취소 구분 | `trade_result_inquiry.business_class_code` 후보 |
| 금액 | 121 | 13 | 입금 금액 | `moneybank_redemption_deposit.deposit_amount` 연결 후보 |
| 적요 | 153 | 14 | 통장 적요 | 신규 저장 여부 결정 필요 |
| 가상계좌번호 | 216 | 16 | 가상계좌 | 계약/상환 연결 후보 |
| 거래일자 | 232 | 8 | 거래일자 | `send_date` 후보 |
| 거래시간 | 240 | 6 | 거래시간 | `send_time` 후보 |
| 거래은행코드3 | 252 | 3 | 거래은행 | 은행코드 |

## 구현 반영

- `POST /v1/api/fintech/mock/transfer-message`의 mock 송금 전문을 위 송금이체 offset 기준으로 조정했다.
- 아직 식별코드, 은행별 계약값, 실제 routing용 `SVC_TYPE` 값은 운영 전 확정 필요하다.
- `include_raw=false` 기본 정책은 유지한다.

## 불확실한 내용

- `SVC_TYPE` 값의 전체 의미는 문서에 직접 나오지 않아 legacy 통신모듈 설정과 DB 데이터로 추가 확인해야 한다.
- `BANK_CODE`가 모든 업무에서 공통부 `은행코드3`와 1:1인지, 일부 업무에서 조회 대상 은행인지 추가 확인이 필요하다.
- `firm_request_bin`은 송금 결과 summary 성격으로 보이나, `TRADE_REQUEST_BIN`과의 생성/갱신 owner가 현재 소스에는 없다.

## 다음 액션

1. 신규 API에 `TRADE_REQUEST_BIN` 상세 조회와 `RECV_MSG` parser를 추가한다.
2. 관리자 화면에 펌뱅킹 요청/응답 목록을 연결한다.
3. mock 송금 요청을 DB insert까지 확장할지 결정한다.
