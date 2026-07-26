# Cubici Fintech Admin Trade Request Page

## 작업 결과

- 관리자 화면에 Hyphen/KSNET 펌뱅킹 전문 조회 페이지를 추가했다.
- 화면 경로:
  - `/admin/cubici/adminMonitor/fintech_trade`
- 메뉴 위치:
  - 모니터링 > 펌뱅킹 전문
- 실제 Hyphen 호출은 하지 않고, 로컬 API/DB 조회 결과만 표시한다.

## 변경 파일

- `admin-web/src/api/fintech.js`
- `admin-web/src/pages/FintechTradeRequestPage.jsx`
- `admin-web/src/App.jsx`
- `admin-web/src/components/layout/AdminLayout.jsx`
- `admin-web/src/pages/ErrorLogPage.jsx`
- `admin-web/src/pages/ServerMonitorPage.jsx`
- `admin-web/src/styles/admin-web.css`

## 구현 내용

- `TRADE_REQUEST_BIN` 목록 조회
  - MBID
  - 전문코드
  - 전송상태
  - 응답상태
- 선택 row 상세 조회
  - 복합키: `REQ_DATE`, `BANK_CODE`, `COMP_CODE`, `SEQ_NO`
  - `SEND_MSG` parser 결과
  - `RECV_MSG` parser 결과
- 원문 전문은 기본 비노출
  - 관리자 화면에는 parser 결과만 표시
- 모니터링 탭 연결
  - Error Log
  - 서버 관리
  - 펌뱅킹 전문

## 검증 결과

- service-api 테스트
  - `48 passed, 1 skipped`
- admin-web production build
  - Vite build 성공
  - 70 modules transformed
  - chunk size warning 1건 존재

## 보수적 판단

- 이 화면은 조회/해석 화면이며, 송금 실행 화면이 아니다.
- 실송금/재송신/취소 기능은 아직 구현하지 않았다.
- parser 결과코드와 Cubici 업무 후처리 상태 매핑은 다음 단계에서 추가 검증해야 한다.

## 다음 액션

1. 관리자 화면에서 실제 브라우저 표시 확인
2. `RECV_MSG` 결과코드별 성공/실패/재조회 정책 정리
3. mock 송금 요청을 DB insert까지 확장할지 결정
