# Cubici Fintech Mock Transfer Request Save

## 작업 결과

- mock 송금 전문 생성 기능을 `TRADE_REQUEST_BIN` 저장 흐름으로 확장했다.
- 외부 하이픈/은행 API 호출은 하지 않는다.
- 저장 row는 `SEND_FLAG=N`, `RECV_FLAG=N`, `PROCESS_STATUS=MOCK`로 생성한다.
- 동일 PK가 이미 있으면 legacy row를 덮어쓰지 않고 `created=false`로 반환한다.
- 관리자 `펌뱅킹 전문` 화면에 mock 송금요청 생성 UI를 추가했다.

## API

- `POST /v1/api/fintech/mock/transfer-message`
  - 300 byte 송금 요청 전문 생성만 수행
- `POST /v1/api/fintech/mock/transfer-request`
  - 300 byte 송금 요청 전문 생성
  - `TRADE_REQUEST_BIN`에 mock row 저장
  - 실송금/외부 호출 없음

## 관리자 화면

- 경로: `/admin/cubici/adminMonitor/fintech_trade`
- 추가 영역: `MOCK 송금요청 생성`
- 입력 항목:
  - `MBID`
  - `업체코드`
  - `출금은행`
  - `전문번호`
  - `금액`
  - `출금계좌`
  - `입금은행`
  - `입금계좌`
  - `입금적요`
  - `출금적요`
- 저장 성공 후 목록 필터를 `SEND_FLAG=N`, `RECV_FLAG=N`, `MSG_CODE=0100100`, `result_policy=재조회 필요`로 맞춰 mock row 확인이 가능하게 한다.

## 저장 테이블

- `TRADE_REQUEST_BIN`

저장 컬럼:

- `mbid`
- `REQ_TYPE`
- `REQ_DATE`
- `REQ_TIME`
- `SVC_TYPE`
- `BANK_CODE`
- `COMP_CODE`
- `SEQ_NO`
- `MSG_CODE`
- `SEND_FLAG`
- `RECV_FLAG`
- `SEND_MSG`
- `PROCESS_STATUS`
- `reg_date`
- `modified_date`

## 안전 원칙

- `on conflict ("REQ_DATE", "BANK_CODE", "COMP_CODE", "SEQ_NO") do nothing`을 사용한다.
- 기존 legacy 전문 row는 update/delete하지 않는다.
- 외부망 호출 flag는 계속 비활성 상태로 둔다.
- 실제 운영 adapter 연결은 별도 승인 전까지 구현하지 않는다.

## 변경 파일

- `service-api/src/cubici_service/fintech/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/fintech.py`
- `service-api/tests/test_domain_routes.py`
- `admin-web/src/api/fintech.js`
- `admin-web/src/pages/FintechTradeRequestPage.jsx`
- `admin-web/scripts/e2e-fintech-mock-ui.mjs`
- `admin-web/src/styles/admin-web.css`
- `scripts/start-admin-local.ps1`
- `docs/2026-07-22_CUBICI_FINTECH_MOCK_TRANSFER_REQUEST_SAVE.md`

## 검증 결과

- `service-api/tests/test_domain_routes.py`
  - `47 passed`
- `service-api` 전체 테스트
  - `50 passed, 1 skipped`
- PostgreSQL 저장/조회/정리 검증
  - `TRADE_REQUEST_BIN` mock row 1건 저장
  - 상세 조회 결과: `MSG_CODE=0100100`, `result_policy=재조회 필요`, `PROCESS_STATUS=MOCK`
  - 검증 후 mock row 1건 삭제
- `admin-web` build
  - 성공
  - 기존 chunk size warning 유지
- 관리자 UI 검증
  - Playwright E2E 성공
  - API/Vite 임시 기동 후 `MOCK 송금요청 생성` 폼 입력/저장 확인
  - 저장 결과: `created=true`, `PROCESS_STATUS=MOCK`
  - console error 없음
  - 검증 후 mock row 1건 삭제
- 로컬 시작 스크립트 검증
  - `scripts/start-admin-local.ps1`에서 API `--reload` 제거
  - Windows PowerShell 호환을 위해 `Start-Process -Environment` 의존 제거
  - `VITE_API_BASE_URL=http://127.0.0.1:8000` 명시
  - 최종 안내 URL을 `/admin/cubici/adminMonitor/fintech_trade`로 수정
  - API status HTTP 200 확인
  - admin 화면 HTTP 200 확인
  - sandbox 밖 승인 실행 후 서버 유지 확인
- 최종 상태 확인
  - API status HTTP 200
  - admin 화면 HTTP 200
  - `TRADE_REQUEST_BIN.PROCESS_STATUS=MOCK` 잔여 row 0건

## 다음 액션

1. 실제 하이픈/은행 응답 수신/결과조회 저장 흐름을 별도 설계한다.
2. mock row를 관리자 화면에서 별도 표시/삭제할지 정책을 정한다.
