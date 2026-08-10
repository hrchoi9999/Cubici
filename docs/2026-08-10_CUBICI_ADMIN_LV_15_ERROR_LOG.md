# Cubici 관리자 ADM-LV-15 Error Log 복원

## 작업 범위

- 화면: `모니터링 > Error Log`
- route: `/admin/cubici/adminMonitor/error_report`
- 직접 LV 기준: `docs/reference/lv-ui/admin/reference/관리자화면09.png`
- legacy JSP: `src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminMonitor/error_report.jsp`

## LV 대조와 적용

- 시작, 종료, 쇼핑몰, 상태, 검색과 두 번째 줄 시나리오 조건을 legacy 순서로 복원했다.
- migration 기술 요약 strip을 제거했다.
- legacy의 `쇼핑몰/ID/시나리오/시작일/실행시간/상태/에러로그` 7열을 적용했다.
- 직접 LV 기준의 밝은 파란색 표 헤더, 높은 로그 행, 상태 pill과 페이지 번호를 적용했다.
- 에러로그 선택 시 원본, 후속조치와 전체 오류 내용을 별도 상세 영역에서 확인하도록 기존 기능을 보존했다.
- 모바일은 검색 조건을 단일 열로 재배치하고 넓은 목록은 표 내부에서만 가로 스크롤한다.

## DB/API 대조

- 개발 Docker DB `cbci_err_report`: 0건
- 개발 Docker DB `cbci_scheduled_report`: 0건
- 목록: `GET /v1/api/monitoring/error-logs`
- 검색 조건: 기간, 쇼핑몰, 상태, 시나리오
- 실제 DB는 빈 상태이므로 후보 화면은 mock 성공·실패 로그 2건으로 UI와 상세 동작을 검증했다.

## 변경 파일

- `admin-web/src/pages/ErrorLogPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/error-log-monitoring.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| monitoring Error Log API contract pytest | 1 passed |
| 검색·7열 목록·상세 focused E2E | 2 passed |
| 개발 Docker DB 읽기 전용 대조 | 성공 0 / 실패 0 |
| PC/모바일 후보 생성 | 4장 |
| 모바일 body 가로 overflow | 없음 |
| 모바일 표 내부 가로 스크롤 | 통과 |
| 실제 개발 DB populated 목록 | 데이터 부재로 미검증 |
| 운영 배포 | 미수행 |

## 승인 이미지

- 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-15-ERROR-LOG/approved/ADM-LV-15-LIST-PC.png`
- 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-15-ERROR-LOG/approved/ADM-LV-15-LIST-MOBILE.png`
- 상세 PC: `docs/reference/lv-ui/admin/ADM-LV-15-ERROR-LOG/approved/ADM-LV-15-DETAIL-PC.png`
- 상세 모바일: `docs/reference/lv-ui/admin/ADM-LV-15-ERROR-LOG/approved/ADM-LV-15-DETAIL-MOBILE.png`

## 후보 SHA256

- 목록 PC: `10B117FEA2F8F36D15B6B3410AA47A7C1EEEF3989915B8F8A26D263769260B4A`
- 목록 모바일: `A2FCA4B988647E98F89C43327FD81122149224F657B60EEDC76021C9DB5A2241`
- 상세 PC: `5479E95ED6643AD12E4D30637066F790AC409E494E29AC5AAE65D4F2A8AB6030`
- 상세 모바일: `83FD6CB2D3320D7EEE57F8491B8B3D6C39A6E51E45E47220C236B7C912473A22`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 75%
- 실제 성공·실패 로그가 없어 운영 데이터의 시간·실행시간·오류본문 의미 검증이 남았다.
- 다음 승인 단위: `ADM-LV-16 모니터링 > 서버 관리`
