# Cubici Fintech Result Policy Label

## 작업 결과

- `TRADE_REQUEST_BIN` API 응답에 결과정책 라벨을 추가했다.
- 관리자 펌뱅킹 전문 화면 목록/상세에 정책 배지를 표시했다.
- DB 코드표에서 확인된 하이픈/은행 결과코드명을 정책 사유에 반영했다.
- 관리자 펌뱅킹 전문 화면과 API 목록 조회에 결과정책 필터를 추가했다.
- 정책 라벨:
  - `정상`
  - `재조회 필요`
  - `실패·반려`
  - `관리자 확인`

## 변경 파일

- `service-api/src/cubici_service/fintech/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/fintech.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/pages/FintechTradeRequestPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `docs/2026-07-22_CUBICI_FINTECH_RESULT_POLICY_LABEL.md`

## 정책 계산 기준

- `RECV_FLAG = N`, `T`
  - `재조회 필요`
- `RECV_FLAG = C`, `F`
  - `관리자 확인`
- 은행응답코드 없음
  - `재조회 필요`
- 은행응답코드가 `0000` 아님
  - `실패·반려`
- 처리결과조회 응답 `0610101`에서 원거래 처리결과가 `0000` 아님
  - `실패·반려`
- 그 외 은행응답코드 `0000`
  - `정상`

## 검색 필터

API:

- `GET /v1/api/fintech/trade-requests?result_policy=정상`
- `GET /v1/api/fintech/trade-requests?result_policy=재조회 필요`
- `GET /v1/api/fintech/trade-requests?result_policy=실패·반려`
- `GET /v1/api/fintech/trade-requests?result_policy=관리자 확인`

관리자 화면:

- `/admin/cubici/adminMonitor/fintech_trade`
- 검색 영역에 `결과정책` select 추가
- 기존 `MBID`, `전문코드`, `전송`, `응답` 필터와 함께 사용 가능

## 결과코드명 반영

legacy DB `hyphen_bank_code` 기준으로 다음 코드명을 확인했다.

| 코드 | 표시명 |
|---|---|
| `0000` | 정상처리 |
| `0104` | 수취인계좌 잔액증명서 발급 |
| `0105` | 수취인계좌 통장정리후 거래가능 |
| `2002` | 자동이체미등록 |
| `2007` | 자동이체해지(영업점해지) |

`9011`, `9018`은 현재 복사된 하이픈 문서와 legacy DB 코드표에서 의미를 확인하지 못했다. API/관리자 화면에는 `코드명 미확인`으로 표시한다.

## 검증 결과

- service-api 테스트
  - `49 passed, 1 skipped`
- 실제 DB 결과정책 필터 조회
  - `정상`: 1301건
  - `재조회 필요`: 1건
  - `실패·반려`: 2840건
  - `관리자 확인`: 0건
- admin-web build
  - 성공
  - chunk size warning 1건 유지
- Playwright 브라우저 검증
  - `/admin/cubici/adminMonitor/fintech_trade`
  - 목록 20건 렌더링
  - 상세 parser 패널 렌더링
  - console error 없음
- 결과정책 필터 추가 후 브라우저 재검증
  - 로컬 `5174`, `8000` 서버 미기동으로 미실행
  - API repository DB 조회와 admin-web build로 1차 검증
- 실제 DB 첫 row 정책 확인
  - 전문코드: `0600101`
  - 정책: `실패·반려`
  - 사유: 원거래 처리결과 `0104` - 수취인계좌 잔액증명서 발급

## 다음 액션

1. `9011`, `9018` 의미를 하이픈/은행 코드표 원문에서 추가 확인한다.
2. mock 송금 요청을 `TRADE_REQUEST_BIN` insert까지 확장할지 결정한다.
3. 결과정책별 대사/후처리 화면을 분리할지 검토한다.
