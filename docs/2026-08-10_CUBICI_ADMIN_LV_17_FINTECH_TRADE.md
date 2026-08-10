# Cubici 관리자 ADM-LV-17 펌뱅킹 전문 복원

## 작업 범위

- 화면: `모니터링 > 펌뱅킹 전문`
- route: `/admin/cubici/adminMonitor/fintech_trade`
- 직접 LV 기준: 없음
- legacy JSP: 없음. `adminMonitor`에는 `error_report.jsp`만 남아 있다.
- 대체 기준: 승인된 관리자 공통 shell, ADM-LV-15 모니터링 목록, ADM-LV-16 운영 요약 구조

## LV 대조와 적용

- 개발용 pill을 제거하고 조회 결과, 페이지, 실송금 연동 상태와 테스트 전문 생성 버튼을 운영 도구막대로 정리했다.
- MBID, 전문코드, 전송, 응답, 결과정책 검색과 초기화 기능을 유지했다.
- 요청일시부터 처리상태까지 12열 전문 목록을 밝은 파란색 LV 헤더와 동일 높이 행으로 통일했다.
- 목록 선택 시 전문 기본정보, 송수신 요약과 300-byte 분석 필드를 표시한다.
- PC와 모바일의 넓은 전문 목록에는 항상 식별 가능한 전용 가로 스크롤바를 표시한다.
- `MOCK` 표현은 운영자가 이해하기 쉬운 `테스트 전문`으로 변경했으며 저장 API 동작은 유지했다.
- 모바일은 검색 단일 열, 목록 내부 가로 스크롤, 상세 기본정보 2열 재배치를 적용했다.

## DB/API 대조

- 상태: `GET /v1/api/fintech/status`
- 목록: `GET /v1/api/fintech/trade-requests`
- 상세: `GET /v1/api/fintech/trade-requests/{req_date}/{bank_code}/{comp_code}/{seq_no}`
- 테스트 저장: `POST /v1/api/fintech/mock/transfer-request`
- Docker 개발 DB `TRADE_REQUEST_BIN`: 전체 4,142건
- 전송 완료: 4,142건
- 정상 응답: 4,141건
- `firm_request_bin`: 48건
- `trade_result_inquiry`: 2,073건
- 실제 은행 송금 adapter는 비활성화 상태이며 별도 승인 후 추가개발 범위다.

## 변경 파일

- `admin-web/src/pages/FintechTradeRequestPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-batch5-monitoring-responsive.spec.js`
- `admin-web/tests/e2e/adm-lv-17-fintech-trade.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| fintech API·parser focused pytest | 9 passed |
| 목록·검색·상세·테스트 저장·기존 회귀 E2E | 4 passed |
| 모바일 상세 최종 재검증 | 1 passed |
| Docker 개발 DB 읽기 전용 대조 | 통과 |
| 모바일 body 가로 overflow | 없음 |
| 목록 전용 가로 스크롤바·좌우 버튼·드래그 동기화 | 통과 |
| 운영 배포 | 미수행 |

## 승인 이미지

- 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-17-FINTECH-TRADE/approved/ADM-LV-17-LIST-PC.png`
- 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-17-FINTECH-TRADE/approved/ADM-LV-17-LIST-MOBILE.png`
- 상세 PC: `docs/reference/lv-ui/admin/ADM-LV-17-FINTECH-TRADE/approved/ADM-LV-17-DETAIL-PC.png`
- 상세 모바일: `docs/reference/lv-ui/admin/ADM-LV-17-FINTECH-TRADE/approved/ADM-LV-17-DETAIL-MOBILE.png`

## 후보 SHA256

- 목록 PC: `17136E20FE7EE21D0F9D018FB32A1D535FD7F36D2A5D6B17C77FC1D587661D20`
- 목록 모바일: `CE8FA352C73384F31C0FC19912CE0AE52DA37AD3F769761F402C2CBED7204C70`
- 상세 PC: `8C37DD15CA96FAC3E60BBD25C33493BD24B630CEDBCDBC90D13267333F0BFBAC`
- 상세 모바일: `4ACBC193899F84CDB019F58A310ABC505545BF1F2C8538FB0ED402D0C10BB56D`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 72%
- 직접 LV 화면이 없어 승인된 공통 LV 규칙으로 복원했다.
- 실제 은행 송금 adapter와 운영 인증환경의 실제 데이터 화면 회귀가 남았다.
- 다음 승인 단위: `ADM-LV-18 환경설정 > 관리자 등록`
