# ADM-LV-23 통합정보 > 머니뱅크

## 작업 범위

- Route:
  - `/admin/cubici/infoIntegrated/moneybank_tab1`
  - `/admin/cubici/infoIntegrated/moneybank_tab2`
- 현재 관리자 shell 매핑: `머니뱅크 운영 > 서비스 현황`
- React: `admin-web/src/pages/MoneybankIntegratedInfoPage.jsx`
- Route alias: `admin-web/src/App.jsx`
- API: `GET /v1/api/management/overview`
- Legacy 기준:
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/infoIntegrated/moneybank_tab1.jsp`
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/infoIntegrated/moneybank_tab2.jsp`
- 직접 대응하는 LV 캡처는 없다. legacy JSP와 승인된 관리자 공통 shell 및 통합정보 디자인을 우선 기준으로 사용했다.

## 기존 화면과 차이

기존 React 화면은 머니뱅크 계약·선정산·상환·잔액 4개 카드와 금액 추이 표만 제공했다. legacy의 `현황 종합/운영지표` 탭, 탭별 KPI와 6개 그래프가 누락되어 있었다.

## 화면 복원

- 현황 종합:
  - 머니뱅크 가입승인, 서비스 원금, 상환 원금, 상환 원금잔액 KPI
  - 회원 현황, 이용 현황, 서비스 이용률 그래프
- 운영지표:
  - 신규 신청, 신규 심사, 신규 계약, 계약 종료 KPI
  - 신청/심사/계약, 계약/상환/잔액, 머니뱅크 수수료 그래프
- legacy의 파란 아이콘 카드, 남색 그래프 제목 bar와 그래프 색상 체계를 적용했다.
- 일·주·월 분석단위, 시작일·종료일 검색과 CSV 엑셀 다운로드를 유지했다.
- PC와 모바일에서 2열 KPI, 세로 그래프 배치와 본문 overflow 없음이 확인됐다.

## 기능과 산정 기준

기존 `management/overview` API가 반환하는 계약, 심사, 승인, 종료, 선정산, 상환, 수수료, 잔액 시계열을 사용한다. frontend에서 비율과 조회기간 누적값을 계산하며 backend 계약과 DB 데이터는 변경하지 않았다.

legacy와 완전히 동일하지 않은 항목은 다음과 같다.

- 별도 재이용자 필드가 없어 서비스 이용률 그래프에서는 누적회원·이용회원·이용률만 표시한다.
- API에 일자별 distinct 이용회원이 없어 현재 이용건수를 이용회원 지표로 사용한다.
- 운영지표 누적계약·누적상환은 선택한 조회기간 안의 누적값이며 기간 이전 baseline은 포함하지 않는다.

## 개발 DB 확인

개인정보와 개별 계약을 출력하지 않고 Docker PostgreSQL에서 집계만 읽기 전용으로 조회했다.

| 항목 | 결과 |
|---|---:|
| 계약 | 7건 |
| 선정산 | 538건 / 55,686,548원 |
| 상환 | 339건 / 54,772,944원 |
| 상환 수수료 | 566,016원 |
| 최신 잔액 | 계약 6건 / 909,988원 |
| 선정산-상환 계산액 | 913,604원 |
| 잔액 차이 | -3,616원 |

기존 API는 차이가 0이면 `검산일치`, 아니면 `검산차이`로 표시한다. 이번 batch에서는 원본 DB와 잔액 산식을 수정하지 않았다.

## 검증 결과

| 검증 | 결과 |
|---|---|
| Vite production build | 통과, 75 modules, 최종 6.16초 |
| management overview focused pytest | 1 passed, 77 deselected |
| ADM-LV-23 및 기존 integrated info focused E2E | 5 passed, 최종 10.1초 |
| 그래프 확인 | 2탭 6개 canvas 실제 pixel 출력 |
| 검색·엑셀 | 주 단위 API 요청 및 operations CSV 다운로드 통과 |
| 후보 이미지 직접 점검 | 현황 종합·운영지표 PC/모바일, body overflow 없음 |
| Git·배포 | 미수행 |

## 승인 이미지

| 파일 | SHA-256 |
|---|---|
| `ADM-LV-23-OVERVIEW-PC.png` | `7F3F67BA9E6604B8EC2D1CA013D3BD0045426F22B1059B81A3A5074561E639DC` |
| `ADM-LV-23-OVERVIEW-MOBILE.png` | `58DBCD61FABBAFA50A6ED4555DA1B0B76AED53C95B39A62D486C2FFF45249318` |
| `ADM-LV-23-OPERATIONS-PC.png` | `F06EEC1757D16C2482AC78AF7146E42F94C539E8424D1408A6989F9F55D6B9E3` |
| `ADM-LV-23-OPERATIONS-MOBILE.png` | `F2B404F87A5C55CF855877DFFB931D3B62BC2F17259656D8177342638526B9D5` |

경로: `docs/reference/lv-ui/admin/ADM-LV-23-MONEYBANK-INTEGRATED/approved`

## 보수적 평가와 잔여

- 화면 복원율: 100%. 직접 LV 캡처는 없지만 legacy JSP 기준 후보를 사용자가 승인했다.
- 내부 기능 구현율: 86%.
- 잔여: 재이용자·distinct 이용회원·기간 이전 누적 baseline API, 개발 DB 잔액 차이 정합화, 운영 배포 검증.
- 다음 승인 단위: `ADM-LV-24 머니뱅크 관리 > 이용상세`.
