# Cubici 관리자 LV 복원 Milestone

## 목적

- 관리자 화면을 LV 기준 이미지와 화면별로 대조하여 복원한다.
- UI 표시와 기능 구현을 분리해 진행률을 관리한다.
- 각 화면은 실제 DB/API 데이터, 조회 조건, 저장 기능, 그래프 산출값을 검증한 뒤 승인 후보로 제시한다.
- 한 화면의 사용자 승인 전에는 다음 화면으로 넘어가지 않는다.

## 기준 자료

| 자료 | 용도 |
|---|---|
| `docs/reference/lv-ui/admin/reference/관리자메뉴구조.png` | LV 관리자 메뉴명과 기본 화면 구조 |
| `docs/reference/lv-ui/admin/reference/관리자화면01.png` ~ `관리자화면10.png` | 헤더, 타이틀, 좌측 메뉴, 표, 검색, 그래프의 시각 기준 |
| `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/cmmn/cubiciAdminFrame.jsp` | legacy 공통 HTML 구조와 route 흐름 참고 |
| `D:/Cubici/src/main/webapp/resources/rudicks` | legacy 공통 CSS, 이미지, Chart.js 자원 참고 |
| `admin-web/public/resources/rudicks` | React에 복제된 legacy 디자인 자원 |

## 최초 재점검 결과

- React 관리자 공통 레이아웃에 LV 기준과 다른 그라데이션 헤더, 과도한 그림자와 여백, 흰색 중심 좌측 메뉴가 추가되어 있다.
- React 메뉴 분류는 LV 메뉴 구조와 다르다. 특히 `통합정보`, `머니뱅크 관리`, `머니뱅크 운영`의 분류와 상단 제목을 다시 매핑해야 한다.
- LV 기준의 핵심 메뉴는 `회원관리`, `쇼핑몰 통합`, `머니뱅크 운영`, `고객관리`, `모니터링`, `환경설정`이다.
- 현재 React의 추가 기능은 삭제하지 않고 LV 메뉴 아래에 재배치한다. 최종 메뉴 매핑은 공통 레이아웃 후보 승인 후 확정한다.
- `머니뱅크 운영 > 통합 현황`의 현재 React 화면은 DB/API 시계열을 표와 CSS 막대로 표시한다. LV의 실제 그래프 복원 상태가 아니다.

## 화면별 완료 조건

| 검증축 | 완료 조건 |
|---|---|
| LV UI | 기준 이미지와 공통 레이아웃, 색상, 폰트, 간격, 표 밀도 비교 완료 |
| DB/API 조회 | 운영과 동일한 PostgreSQL schema의 실제 API 응답으로 목록, 합계, 빈 상태 확인 |
| 저장/변경 | 쓰기 기능이 있는 화면은 focused API test와 화면 focused E2E 통과 |
| 산식 | legacy 산식 또는 SQL 근거와 신규 응답값 대조 |
| 그래프 | API 시계열과 차트 label/value/합계가 일치하고 PC/모바일에서 비어 있지 않음 |
| 승인 | PC/모바일 후보 이미지를 사용자가 확인하고 승인 |

## 진행 순서

| 순서 | 승인 단위 | DB/그래프 범위 |
|---:|---|---|
| 0 | 공통 헤더, 타이틀, 좌측 메뉴, 본문 레이아웃 | 기능 변경 없음 |
| 1 | 회원관리 > 회원 현황 | 회원 집계와 목록 DB 대조 |
| 2 | 쇼핑몰 통합 > 통합 현황 | 쇼핑몰/매출 집계 DB 대조, LV 그래프 복원 |
| 3 | 쇼핑몰 통합 > 결제 관리 | 결제 목록과 합계 DB 대조 |
| 4 | 머니뱅크 운영 > 통합 현황 | 계약/선정산/상환 시계열 DB 대조, LV 그래프 복원 |
| 5 | 머니뱅크 운영 개별 화면 | 신청, 승인, 계약, 정산, 상환, Prism 순차 검증 |
| 6 | 고객관리 | 문의, 공지, 메시지 순차 검증 |
| 7 | 모니터링 | Error Log, 서버, 펌뱅킹 순차 검증 |
| 8 | 환경설정 | 관리자, 요금제, 코드, 협력사, 머니뱅크, Prism 순차 검증 |

## 진행률 산정

- `화면 복원율`: LV 비교와 사용자 승인이 끝난 화면만 완료로 계산한다.
- `기능 구현율`: DB/API 조회, 저장, 산식, E2E 검증이 끝난 화면만 완료로 계산한다.
- route가 존재하거나 후보 이미지만 생성된 상태는 완료로 계산하지 않는다.

## ADM-LV-00 공통 레이아웃 후보

### 적용

- 헤더를 LV의 진남색 단색, 65px 높이, 30px 로고 기준으로 복원했다.
- 타이틀 영역을 Rudicks 원본 배경 이미지, 168px 높이, 축소된 화면명 기준으로 정리했다.
- 좌측 메뉴를 LV의 회색 기본/진남색 활성 상태로 복원했다.
- LV 메뉴 구조의 6개 대분류로 재배치했다.
- 현재 React의 추가 route는 삭제하지 않고 관련 LV 대분류 아래에 유지했다.
- 데스크톱 본문 폭과 상단 여백을 LV 캡처 비율에 맞게 축소했다.
- 모바일에서는 동일한 색상과 메뉴 계층을 drawer 방식으로 유지했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| 공통 shell focused Playwright | 3 passed |
| PC 가로 overflow | 없음 |
| 모바일 drawer 열기/닫기와 body lock | 통과 |
| DB/API 실데이터 | 공통 shell 범위가 아니므로 미검증. 화면별 작업부터 적용 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-09 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-00-COMMON-SHELL/approved`
- 다음 승인 단위: `ADM-LV-01 회원관리 > 회원 현황`

## ADM-LV-01 회원관리 > 회원 현황 후보

### 적용

- LV 회원 집계 카드, 조회 조건, 혼합 그래프 구조를 복원했다.
- 실제 PostgreSQL 집계값과 협력사/서비스 조회 옵션을 API로 연결했다.
- legacy Chart.js 기준의 막대/선 혼합 그래프와 보조축을 적용했다.
- PC와 모바일 후보 이미지를 실제 Docker 개발 DB 데이터로 생성했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend focused pytest | 2 passed |
| mock-data PC/모바일 Playwright | 2 passed |
| actual Docker DB PC/모바일 Playwright | 2 passed |
| DB 누적 집계와 최종 시계열 | 일치 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-09 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-01-MEMBER-SUMMARY/approved`
- 상세 기록: `docs/2026-08-09_CUBICI_ADMIN_LV_01_MEMBER_SUMMARY.md`
- 다음 승인 단위: `ADM-LV-02 쇼핑몰 통합 > 통합 현황`

## ADM-LV-02 쇼핑몰 통합 > 통합 현황 후보

### 적용

- LV 탭 4개, 지표 카드 12개와 legacy 아이콘을 복원했다.
- 회원가입, 가입 기간, 가입 채널 Chart.js 그래프 3개를 복원했다.
- 전용 PostgreSQL API와 협력사/서비스/기간 필터, CSV 다운로드를 연결했다.
- `site_visitor` 방문자 원본을 포함해 실제 Docker 개발 DB로 PC/모바일 후보를 생성했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend focused pytest | 3 passed |
| mock-data PC/모바일 Playwright | 2 passed |
| actual Docker DB PC/모바일 Playwright | 2 passed |
| 기존 관련 focused regression | 3 passed |
| 협력사/서비스/주 단위 실데이터 필터 | 정상 |
| 운영 배포 | 미수행 |

### 제한

- migrated `users`에 legacy 탈퇴일이 없어 해지회원은 계약 종료 이벤트로 대체 집계한다.
- 상품 마스터 부재로 SKU는 기간 내 매출 상품 식별자를 중복 제거해 집계한다.
- 최대동시 접속과 평균 이용시간은 원본 데이터가 없어 `미집계`로 표시한다.

### 승인 상태

- 2026-08-09 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-02-CUBICI-INTEGRATED/approved`
- 상세 기록: `docs/2026-08-09_CUBICI_ADMIN_LV_02_CUBICI_INTEGRATED.md`
- 다음 화면은 후속 사용자 승인 시 시작

## ADM-LV-03 쇼핑몰 통합 > 결제 관리 후보

### 적용

- Legacy `payment_tab1.jsp`의 탭, 기준일, 검색, 보기설정, 항목선택, 표, 합계바 구조를 React로 복원했다.
- 기존 결제 목록·합계 API contract를 유지했다.
- 엑셀 호환 CSV 다운로드와 표 항목 선택을 연결했다.
- PC와 모바일에서 넓은 결제 표는 본문이 아니라 표 내부에서만 가로 스크롤되도록 처리했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend focused pytest | 1 passed |
| ADM-LV-03 PC/모바일/DB 동일 빈 상태 Playwright | 3 passed |
| 기존 결제 focused regression | 1 passed |
| actual Docker DB | 개발 DB 0건·합계 0 확인, 기존 운영 회귀와 일치 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-03-MEMBER-PAYMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_03_MEMBER_PAYMENT.md`
- 다음 승인 단위: `ADM-LV-04 머니뱅크 운영 > 통합 현황`

## ADM-LV-04 머니뱅크 운영 > 통합 현황 후보

### 적용

- LV `관리자화면02·03`과 legacy `info_tab1.jsp`, `info_tab2.jsp`를 기준으로 `현황 종합 / 운영지표` 두 탭을 복원했다.
- 현황 종합의 지표 4개, 잔액 경고표, 검색 조건과 실제 Chart.js 그래프 3개를 복원했다.
- 운영지표의 지표 8개, 검색 조건과 `신청/심사/계약`, `계약/상환/잔액`, `머니뱅크 수수료` 그래프 3개를 복원했다.
- `/management/overview`에 상태·금액·수수료 시계열을 하위 호환 필드로 추가하고 `info_tab2` route alias를 연결했다.

### DB 검증

| 원본 항목 | 개발 PostgreSQL |
|---|---:|
| 계약 / 운영 / 종료 | 7 / 4 / 2건 |
| 선정산 | 538건 / 55,686,548원 |
| 상환 | 339건 / 54,772,944원 |
| 상환 수수료 | 566,016원 |
| legacy 산식 원금잔액 | 913,604원 |
| 최신 history 저장잔액 | 909,988원 |
| 저장잔액 - 산식잔액 | -3,616원 |

### 제한 및 판단

- LV의 원금잔액은 legacy 방식인 `누적 선정산 - 누적 상환` 913,604원을 표시한다.
- 경고 목록과 상세 검산에는 최신 `moneybank_redemption_history` 저장잔액 909,988원을 유지한다.
- 두 값의 3,616원 차이는 숨기지 않고 API의 `balance_reconcile_diff`, `검산차이` 상태로 보존한다.
- migration DB에는 legacy의 별도 심사일이 없어 심사 시계열은 `신청일 + approval_date 존재` 기준으로 대체했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend focused pytest | 1 passed |
| ADM-LV-04 PC/모바일 Playwright | 4 passed |
| 기존 통합 현황 focused regression | 1 passed |
| PC/모바일 body overflow | 없음 |
| 차트 canvas pixel 검증 | 두 탭 6개 모두 nonblank |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-04-MONEYBANK-OVERVIEW/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_04_MONEYBANK_OVERVIEW.md`
- 다음 승인 단위: `ADM-LV-05 머니뱅크 운영 > 신청 접수`

## ADM-LV-05 머니뱅크 운영 > 신청 접수 후보

### 적용

- legacy `requestState.jsp`, `AdminReqMapper.xml`을 기준으로 신청 현황 탭, 기준일, 검색, 보기기준, 목록과 3개 집계를 복원했다.
- 신청 접수 범위, 신청/완료 구분, 재이용 횟수를 기존 계약 목록 API에 하위 호환 필드로 추가했다.
- 엑셀 호환 CSV 다운로드를 연결하고 PC/모바일 후보 이미지를 생성했다.
- 기존 상태·서류·Prism 상세 기능은 유지했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend endpoint/detail focused pytest | 2 passed |
| ADM-LV-05 PC/모바일 Playwright | 2 passed |
| 개발 DB 읽기 전용 집계 | 총 4 / 진행 0 / 완료 4건 |
| 모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-05-REQUEST-INTAKE/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_05_REQUEST_INTAKE.md`
- 다음 승인 단위: `ADM-LV-06 머니뱅크 운영 > 심사 승인`

## ADM-LV-06 머니뱅크 운영 > 심사 승인 후보

### 적용

- legacy `approval_tab1.jsp`, `AdminJudgeMapper.xml`을 기준으로 탭, 검색, 보기기준, Prism 추천 2단 표와 7개 집계를 복원했다.
- 심사 범위·단계 필터, 전체 DB 집계, 사업기간, 숫자 Prism 점수와 조정 이력을 계약 목록 API에 하위 호환으로 추가했다.
- 엑셀 호환 CSV 다운로드를 연결하고 PC/모바일 후보 이미지를 생성했다.
- 기존 심사 상세, 조건 조정, 조건 제시 기능은 유지했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend endpoint focused pytest | 1 passed |
| ADM-LV-06 PC/모바일 Playwright | 2 passed |
| 개발 DB 읽기 전용 집계 | 심사 상태 0건, SQL 정상 실행 |
| 운영 DB migration preflight | 조정 이력 테이블 존재 |
| 모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-06-APPROVAL-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_06_APPROVAL_MANAGEMENT.md`
- 다음 승인 단위: `ADM-LV-07 머니뱅크 운영 > 계약 관리`

## ADM-LV-07 머니뱅크 운영 > 계약 관리 후보

### 적용

- 직접 LV 캡처 `관리자화면05.png`를 우선 기준으로 `계약 관리/상환 관리` 탭과 계약 목록 12개 컬럼을 복원했다.
- 계약 범위·단계 필터, 지급그룹사, 주문 한도, 최대·최신 미상환금을 계약 목록 API에 하위 호환으로 추가했다.
- MBID 상세 연결, 상태 변경, 정렬과 엑셀 호환 CSV 다운로드를 유지·보완했다.
- PC 전체 컬럼 표시와 모바일 내부 가로 스크롤 후보 이미지를 생성했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend endpoint/detail focused pytest | 2 passed |
| ADM-LV-07 PC/모바일 Playwright | 2 passed |
| 개발 DB 읽기 전용 집계 | 총 4 / 대기 0 / 계약 4 / 종료 0건 |
| 모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-07-CONTRACT-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_07_CONTRACT_MANAGEMENT.md`
- 승인 후 다음 단위: `ADM-LV-08 머니뱅크 운영 > 정산 관리`

## ADM-LV-08 머니뱅크 운영 > 정산 관리 후보

### 적용

- 전용 LV 캡처 부재를 확인하고 승인된 공통 LV 셸·검색·표·페이지 규칙으로 정산 화면을 재구성했다.
- 쇼핑몰·상태 선택 검색, 통합검색, 날짜·정산액 정렬과 CSV 다운로드를 연결했다.
- 검산 요약 6개와 정산 핵심 13개 컬럼을 구성하고, 계좌정보는 기존 상세 화면에만 유지했다.
- 기존 정산 검산 산식과 상세 조회 기능은 변경하지 않았다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend endpoint·산식 pytest | 4 passed |
| ADM-LV-08 PC/모바일 Playwright | 2 passed |
| 기존 정산 상세 regression | 1 passed |
| 개발 DB 읽기 전용 집계 | 469건 / 정산액 61,554,507원 |
| 모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-08-SETTLEMENT-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_08_SETTLEMENT_MANAGEMENT.md`
- 승인 후 다음 단위: `ADM-LV-09 머니뱅크 운영 > 상환 관리`

## ADM-LV-09 머니뱅크 운영 > 상환 관리 후보

### 적용

- 직접 LV 기준 `관리자화면04.png`의 `계약 관리/상환 현황` 탭, 기준일, 검색, 11개 목록 열을 복원했다.
- 상단 제목은 `계약/상환`, 좌측 메뉴는 `상환 관리`로 역할을 구분했다.
- 계약·회원·수수료 DB 결합을 API 목록에 추가하고 검색·정렬·CSV를 연결했다.
- 기존 지급·상환 등록, 취소, 작업 이력 기능은 MBID 상세 영역에 유지했다.
- 모바일 활성 탭은 두 번째 원래 위치를 유지하고 표 내부 가로 스크롤을 적용했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend endpoint focused pytest | 1 passed |
| 실제 repository/SQL 합계 대조 | 6건, 결합 누락 0건, 합계 일치 |
| ADM-LV-09 PC/모바일 bundle smoke | 2 passed |
| 검색·정렬·CSV·상세 form 노출 | 통과 |
| 모바일 body overflow | 없음 |
| 실제 write E2E 재실행 | 미수행 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 90%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-09-REDEMPTION-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_09_REDEMPTION_MANAGEMENT.md`
- 승인 후 다음 단위: `ADM-LV-10 머니뱅크 운영 > 자금조달 관리`

## ADM-LV-10 머니뱅크 운영 > 자금조달 관리 후보

### 적용

- 직접 LV 기준 `관리자화면06.png`의 상단 제목, 우측 등록 버튼, 8개 열 목록과 페이지 번호를 복원했다.
- 잘못 연결됐던 환경설정용 머니뱅크 상품 화면과 자금조달 관리 route를 분리했다.
- `fintech_request`, `fintech`, 계약별 상환 이력을 조달사 단위로 집계하는 API를 추가했다.
- 기존 상품 list/create/update 화면은 기존 tab1/tab2 route에 보존했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 74 modules |
| backend route focused pytest | 77 passed |
| 개발 DB 읽기 전용 repository | 2곳 / 조달금 21,318,788원 / 미상환금 642,112원 |
| ADM-LV-10 PC/모바일 bundle smoke | 2 passed |
| 기존 머니뱅크 상품 CRUD 회귀 | 1 passed |
| 모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 90%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-10-FUNDING-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_10_FUNDING_MANAGEMENT.md`
- 보완 Batch: 전용 기본등록 API·반응형 입력 패널·DB write E2E 완료. 요청 연결은 158/159건이며 요청별 상환 배분키 부재를 검산상태로 노출.
- 다음 승인 단위: `ADM-LV-11 머니뱅크 운영 > 신용평가지표`

## ADM-LV-11 머니뱅크 운영 > 신용평가지표

### 적용

- 직접 LV 기준 `관리자화면07.png`와 legacy `manageIndex.jsp`의 PCS/PMS 지표·평가등급 설정표를 복원했다.
- `/admin/moneybank/manage`는 LV 설정표로 교체하고 기존 위험평가 결과 목록·상세는 `/admin/moneybank/risk-results`에 보존했다.
- 실제 개발 DB `prizm_items` 26행을 화면 구조에 매핑하고 변경된 행만 기존 update API로 저장한다.
- 모바일은 좌측 메뉴 기본 닫힘과 표 내부 가로 스크롤을 확인했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| 개발 DB 읽기 전용 대조 | PCS 15 / PMS 11, 합계 26행 |
| Prism API contract focused pytest | 1 passed |
| ADM-LV-11 + 기존 결과조회 focused E2E | 2 passed |
| 실제 개발 DB write E2E | 미수행 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 78%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-11-CREDIT-INDICATOR/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_11_CREDIT_INDICATOR.md`
- 잔여: 실제 DB write E2E, legacy operator/score 정규화, PCS/PMS·Alt_CSM 재산출 연동 검산
- 다음 승인 단위: `ADM-LV-12 고객관리 > 고객문의`

## ADM-LV-12 고객관리 > 고객문의

### 적용

- 고객문의 전용 LV 캡처가 없어 legacy `manageInquiry.jsp`, 상세 JSP와 같은 고객관리 계열 `관리자화면08.png`를 결합했다.
- 초기 화면을 키워드 검색, legacy 8열 목록, 페이지 번호로 복원했다.
- 제목 선택 시 목록 아래에 상세를 중첩하지 않고 상세 화면으로 전환한다.
- 답변 조회·등록·수정과 후속상태·알림상태 데이터는 상세 화면에 보존했다.
- 모바일은 메뉴 기본 닫힘과 목록 표 내부 가로 스크롤을 적용했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| support inquiry API contract pytest | 7 passed |
| 목록·상세·답변수정 focused E2E | 1 passed |
| 개발 DB 읽기 전용 대조 | qna 1 / reply 1 / 연결 1 |
| 실제 개발 DB 답변 write E2E | 미수행 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 86%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-12-CUSTOMER-INQUIRY/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_12_CUSTOMER_INQUIRY.md`
- 다음 승인 단위: `ADM-LV-13 고객관리 > 문자/이메일`

## ADM-LV-13 고객관리 > 문자/이메일 후보

### 적용

- 전용 LV 캡처가 없어 legacy `manageSms.jsp`, `manageEmail.jsp`, `manageSms_Write.jsp`와 고객관리 계열 `관리자화면08.png`를 결합했다.
- `문자 공지/이메일` 2개 탭, legacy 6열 목록, 글쓰기, 우측 검색, 페이지 번호를 복원했다.
- 목록과 편집 폼을 화면 전환 구조로 정리하고 등록·수정·삭제 API를 유지했다.
- 이메일 HTML 상세 화면을 격리된 미리보기로 복원했다.
- 모바일은 메뉴 기본 닫힘, 표 내부 가로 스크롤, 단일 열 편집 폼을 적용했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| support message-template API contract pytest | 2 passed |
| 목록·편집·삭제·이메일 상세 focused E2E | 2 passed |
| 개발 DB 읽기 전용 대조 | 문자 6 / 이메일 2 |
| 모바일 body overflow / 표 내부 스크롤 | 없음 / 통과 |
| 실제 개발 DB write E2E | 미수행 |
| 실제 외부 발송 | 추가개발 범위 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 88%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-13-MESSAGE-TEMPLATE/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_13_MESSAGE_TEMPLATE.md`
- 다음 승인 단위: `ADM-LV-14 고객관리 > 고객 공지 관리`

## ADM-LV-14 고객관리 > 고객 공지 관리 후보

### 적용

- 직접 LV 기준 `관리자화면08.png`와 legacy 공지·FAQ 목록 및 편집 JSP 5개를 대조했다.
- `서비스 공지/FAQ` 2개 탭, 공지 4열·FAQ 3열 목록, 글쓰기, 우측 검색, 페이지 번호를 복원했다.
- 목록과 편집 폼을 화면 전환 구조로 정리하고 공지·FAQ 등록·수정·삭제 API를 유지했다.
- 모바일은 메뉴 기본 닫힘, 표 내부 가로 스크롤, 단일 열 편집 폼을 적용했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| support board API contract pytest | 2 passed |
| 공지·FAQ 목록·편집·삭제 focused E2E | 2 passed |
| 개발 DB 읽기 전용 대조 | 공지 5 / FAQ 31 |
| 모바일 body overflow / 표 내부 스크롤 | 없음 / 통과 |
| 실제 개발 DB write E2E | 이번 배치 미수행 |
| 공지 첨부파일 | 미구현 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 86%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_14_CUSTOMER_BOARD.md`
- 다음 승인 단위: `ADM-LV-15 모니터링 > Error Log`

## ADM-LV-15 모니터링 > Error Log 승인

### 적용

- 직접 LV 기준 `관리자화면09.png`와 legacy `error_report.jsp`를 대조했다.
- 기간, 쇼핑몰, 상태, 시나리오 검색과 legacy 7열 목록을 복원했다.
- 직접 LV의 밝은 파란색 표 헤더, 상태 pill, 높은 로그 행과 페이지 번호를 적용했다.
- 원본·후속조치·전체 오류본문은 선택 상세 영역에 보존했다.
- 모바일은 검색 조건 단일 열과 표 내부 가로 스크롤을 적용했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| monitoring Error Log API contract pytest | 1 passed |
| 검색·7열 목록·상세 focused E2E | 2 passed |
| 개발 DB 읽기 전용 대조 | 성공 0 / 실패 0 |
| 모바일 body overflow / 표 내부 스크롤 | 없음 / 통과 |
| 실제 populated 목록 | 데이터 부재로 미검증 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 75%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-15-ERROR-LOG/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_15_ERROR_LOG.md`
- 다음 승인 단위: `ADM-LV-16 모니터링 > 서버 관리`

## ADM-LV-16 모니터링 > 서버 관리 승인

### 적용

- 전용 LV 캡처와 legacy JSP가 남아 있지 않아 승인된 관리자 공통 shell과 모니터링 화면의 LV 색상·간격을 기준으로 복원했다.
- 조회범위와 새로고침을 유지하고 종합 상태, 정상 처리, 실패 발생, 최종 확인을 운영 요약으로 정리했다.
- API 서버, PostgreSQL, 배치 성공, 배치 실패 4개 상태 카드와 점검 기준 표를 PC·모바일에 맞게 재배치했다.
- 외부 OS metric 미연동 등 개발용 문구는 화면에서 제거하고 추가개발 잔여로 문서화했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| monitoring server-status API contract pytest | 1 passed |
| 상태 카드·조회범위·새로고침 focused E2E | 3 passed |
| 최종 PC/모바일 후보 재검증 | 1 passed |
| Docker 개발 DB | healthy, 성공 0 / 실패 0 |
| PC/모바일 body overflow | 없음 |
| 외부 OS metric | 미연동, 추가개발 잔여 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 65%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-16-SERVER-MONITOR/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_16_SERVER_MONITOR.md`
- 다음 승인 단위: `ADM-LV-17 모니터링 > 펌뱅킹 전문`

## ADM-LV-17 모니터링 > 펌뱅킹 전문 승인

### 적용

- 전용 LV 캡처와 legacy JSP가 남아 있지 않아 승인된 관리자 공통 shell과 모니터링 LV 표·검색 구조를 기준으로 복원했다.
- 조회 결과와 실송금 연동 상태, 테스트 전문 생성 기능을 한 줄 운영 도구막대로 정리했다.
- 12열 전문 목록에 밝은 파란색 LV 헤더, 선택 상태, 내부 가로 스크롤과 공통 페이지 번호를 적용했다.
- 전문 상세, 송수신 요약과 300-byte 필드 분석을 별도 상세 영역으로 보존했다.
- 모바일 상세 기본정보를 항목·값 2열로 재배치해 날짜와 코드의 글자 단위 줄바꿈을 제거했다.
- 외부 송금은 기존대로 차단하고 테스트 전문만 개발 DB에 저장한다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| fintech API·parser focused pytest | 9 passed |
| 목록·검색·상세·테스트 저장·기존 회귀 E2E | 4 passed |
| 모바일 상세 최종 재검증 | 1 passed |
| Docker 개발 DB 전문 | 전체 4,142 / 전송 4,142 / 정상 응답 4,141건 |
| 관련 DB | firm request 48 / result inquiry 2,073건 |
| PC/모바일 body overflow | 없음 |
| 실송금 adapter | 비활성, 추가개발 잔여 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 72%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-17-FINTECH-TRADE/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_17_FINTECH_TRADE.md`
- 다음 승인 단위: `ADM-LV-18 환경설정 > 관리자 등록`

## ADM-LV-18 환경설정 > 관리자 등록 승인

### 적용

- 전용 LV 캡처가 없어 legacy `adminRegister_tab1.jsp`, 동일 환경설정 계열 기준 화면과 승인된 관리자 공통 shell을 조합했다.
- legacy 관리자 목록의 11열과 검색, 신청 등록, 승인·수정·해지 상세 흐름을 복원했다.
- 권한범위와 Audit 정보는 목록 폭을 늘리지 않고 상세 영역에 보존했다.
- 모바일 넓은 목록에는 좌우 버튼과 슬라이더가 있는 명시적 가로 스크롤을 적용했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| admin-account API contract pytest | 2 passed |
| 목록·상세·CRUD focused E2E | 4 passed, 8.8초 |
| 개발 DB 관리자 계정 | 전체 0 / 승인대기 0 / 승인완료 0건 |
| PC/모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 82%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-18-ADMIN-ACCOUNT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_18_ADMIN_ACCOUNT.md`
- 다음 승인 단위: `ADM-LV-19 환경설정 > 요금제 관리`

## ADM-LV-19 환경설정 > 요금제 관리 승인

### 적용

- 전용 LV 캡처가 없어 legacy `manageCharge.jsp`, `manageChargeModal.jsp`와 승인된 환경설정 공통 shell을 조합했다.
- 현재 13열 목록을 legacy의 상태·등록일자·요금제·금액·ID·거래·상세 7열로 복원했다.
- 요금제 유형·운영상태·요금제명 검색, 보기설정, 전체·운영·종료 집계와 페이지 번호를 적용했다.
- 상세 필드는 등록·수정 패널에 보존하고, 모바일 넓은 목록에는 명시적 가로 스크롤을 적용했다.
- legacy 유형 검색을 실제로 수행하는 `charge_type` backend 필터를 추가했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| charge API contract pytest | 1 passed |
| 목록·상세·유형검색·CRUD focused E2E | 최종 4 passed, 8.4초 |
| 개발 DB 요금제 | 전체 5 / 운영 1 / 종료 4건 |
| PC/모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 78%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-19-CHARGE-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_19_CHARGE_MANAGEMENT.md`
- 다음 승인 단위: `ADM-LV-20 환경설정 > 연계코드 관리`

## ADM-LV-20 환경설정 > 연계코드 관리 승인

### 적용

- 전용 LV 캡처가 없어 legacy `managePromotion.jsp`, `managePromotionModal.jsp`와 승인된 환경설정 공통 shell을 조합했다.
- 상태·시작일자·협력사·연계이름·연계코드·주요대상·연계요금제와 혜택조건·무료기간 그룹을 포함한 legacy 13열 목록을 복원했다.
- 연계코드·운영상태·협력사 검색, 보기기준, 추가, 전체·운영·종료 집계와 페이지 번호를 적용했다.
- 상세 등록·수정·삭제 패널을 유지하고 모바일 넓은 목록에는 명시적 가로 스크롤을 적용했다.
- `promotion_charge`가 비어 있는 기존 데이터는 `promotion.charges` CSV를 읽어 요금제 코드와 이름을 복원하도록 API 호환 처리를 추가했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| promotion API contract pytest | 1 passed |
| Python compileall | 통과 |
| 목록·상세·검색·CRUD focused E2E | 4 passed, 9.0초 |
| 개발 DB 프로모션 | 전체 1 / 상태 Y 1건 / 종료일 경과 불일치 0건 |
| legacy 요금제 연결 호환 | B0101·B0301·B0601 -> 1개월·3개월·6개월 |
| 종료일 정합화 | 2025-06-02 -> 2028-06-02, 1건 수정 |
| PC/모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 82%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-20-PROMOTION-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_20_PROMOTION_MANAGEMENT.md`
- 기존 데이터의 상태 `Y`와 종료일 불일치는 종료일을 3년 연장해 해소했다.
- 다음 승인 단위는 `ADM-LV-21 환경설정 > 협력사 관리`다.

## ADM-LV-21 환경설정 > 협력사 관리 승인

### 적용

- 전용 LV 캡처가 없어 legacy `managePartner.jsp`, `managePartnerModal.jsp`와 승인된 환경설정 공통 shell을 조합했다.
- 상태·등록일자·구분·회사명·협력사코드·대표자·사업자번호와 담당자 이름·전화를 포함한 legacy 10열 및 2단 그룹 헤더를 복원했다.
- 회사명·운영상태·대표자·협력사코드 검색, 보기기준, 기업 추가와 6개 업종별 집계를 적용했다.
- 기본정보·연락처 정보·연계내역 상세 구역, 사업자번호·협력사코드 중복검사와 CRUD 흐름을 보존했다.
- legacy 업종명을 API에서 한글로 반환하고, 등록 전 10자리 사업자번호 checksum 검사를 추가했다.
- 모바일 넓은 목록에 명시적 가로 스크롤을 적용하고 상세 진입 시 첫 열로 복귀시킨다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules, 최종 6.18초 |
| partner API contract pytest | 1 passed |
| Python compileall | 통과 |
| 목록·상세·검색·중복검사·CRUD focused E2E | 4 passed, 최종 9.5초 |
| 개발 DB 협력사 | 전체 4 / 운영 4 / 종료 0건 |
| 개발 DB 업종 | B2B도매 1 / 큐빅아이 1 / 금융 2건 |
| 개발 DB 담당자 | 담당자 지정 1 / 미지정 3건 |
| 주소 누락 | 0건 |
| PC/모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 86%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-21-PARTNER-MANAGEMENT/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_21_PARTNER_MANAGEMENT.md`
- 외부 주소검색, API 직접호출 checksum 강제와 실 DB 전체 CRUD는 잔여다.
- 다음 승인 단위는 `ADM-LV-22 환경설정 > Prism System`이다.

## ADM-LV-22 환경설정 > Prism System 승인

### 적용

- 직접 LV 캡처가 없어 legacy `prizmConfig.jsp`, `craConfig.jsp`, `prizmRawData.jsp`와 승인된 환경설정 공통 shell을 조합했다.
- `Prizm`, `CRA Index`, `RawData` 탭과 차원 List, 평가지표, 세부지표 설정의 legacy 3단 선택 구조를 복원했다.
- 세부지표 정의·가중치·5개 구간·변경메모 수정 흐름과 종합 지표 현황, 지표 변경 이력관리 구역을 통합했다.
- PC와 모바일의 넓은 종합 지표 표에 명시적 가로 스크롤을 적용했다.
- 빈 첫 하한·마지막 상한을 정상적인 개방 구간으로 인정하도록 미완성 판정을 정합화했다. 기존 산식 값은 변경하지 않았다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules, 최종 4.85초 |
| Prism API contract pytest | 1 passed, 77 deselected |
| Python compileall | 통과 |
| Prizm·CRA·검색·수정 focused E2E | 4 passed, 10.0초 |
| 개발 DB Prism 지표 | 전체 26 / Prizm 15 / CRA 11 / 미완성 0건 |
| 개발 DB 변경이력·RawData 산식 | 각각 0건 |
| PC/모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 84%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-22-PRIZM-SYSTEM/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_22_PRIZM_SYSTEM.md`
- PCS/PMS 및 RawData 산식 검산은 운영 중 지표관리 단계로 분리했다. Excel과 실 DB 수정·변경이력 생성 검증은 잔여다.
- 다음 승인 단위는 `ADM-LV-23 통합정보 > 머니뱅크`다.

## ADM-LV-23 통합정보 > 머니뱅크 승인

### 적용

- 직접 LV 캡처가 없어 legacy `moneybank_tab1.jsp`, `moneybank_tab2.jsp`와 승인된 관리자 공통 shell·통합정보 화면을 조합했다.
- 기존의 단일 요약·표 화면을 `현황 종합`, `운영지표` 2개 탭으로 복원했다.
- 현황 종합의 가입승인·서비스 원금·상환 원금·상환 원금잔액 KPI와 회원 현황·이용 현황·서비스 이용률 그래프를 적용했다.
- 운영지표의 신규 신청·신규 심사·신규 계약·계약 종료 KPI와 신청/심사/계약·계약/상환/잔액·머니뱅크 수수료 그래프를 적용했다.
- 일·주·월 분석, 기간 검색, CSV 엑셀 다운로드와 기존 management overview API를 유지했다.
- `moneybank_tab2`를 동일한 `머니뱅크 운영 > 서비스 현황` route로 매핑했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules, 최종 6.16초 |
| management overview API contract pytest | 1 passed, 77 deselected |
| 두 탭·PC/모바일·그래프·검색·엑셀 focused E2E | 5 passed, 10.1초 |
| canvas 실제 출력 | 6개 그래프 픽셀 확인 |
| 개발 DB | 계약 7 / 선정산 538 / 상환 339 / 최신잔액 계약 6건 |
| 개발 DB 잔액 정합성 | 선정산-상환 대비 최신잔액 3,616원 차이 |
| PC/모바일 body overflow | 없음 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 86%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-23-MONEYBANK-INTEGRATED/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_23_MONEYBANK_INTEGRATED.md`
- legacy 재이용자 집계, 기간 이전 누적 기준과 개발 DB 잔액 차이 정합화는 잔여다.
- 다음 승인 단위는 `ADM-LV-24 머니뱅크 관리 > 이용상세`다.

## ADM-LV-24 머니뱅크 관리 > 이용상세 승인

### 적용

- legacy `usageList.jsp`, `usageDetail.jsp`와 승인된 관리자 공통 shell을 기준으로 목록·상세 화면을 복원했다.
- 회원명·회사명·회원ID·서비스·상태·신청기간 검색과 보기기준을 유지했다.
- legacy 항목 선택을 복원하고 지급율을 포함한 React 확장 컬럼은 선택 항목으로 유지했다.
- 기존 비동작 엑셀 링크를 전체 필터 결과 CSV 다운로드로 교체했다.
- PC·모바일 넓은 목록에 명시적 가로 스크롤을 적용했다.
- 상세의 회원정보, 기본정보, 머니뱅크, 추가서류를 LV 남색 section 구조로 통일하고 기존 상환이력 탭을 유지했다.

### 검증

| 항목 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules, 최종 6.19초 |
| management usage list/detail API contract pytest | 2 passed, 1.29초 |
| 목록·상세·검색·항목선택·CSV focused E2E | 2 passed, 최종 7.0초 |
| 개발 DB | 계약 7 / 회원 연결 7 / 쇼핑몰 12 / 증빙 6 / 상환이력 388건 |
| PC/모바일 body overflow | 없음 |
| 후보 이미지 직접 점검 | 목록·상세 PC/모바일 정상 |
| 운영 배포 | 미수행 |

### 승인 상태

- 2026-08-10 사용자 승인 완료
- 화면 복원율 100%, 내부 기능 구현율 88%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-24-MANAGEMENT-USAGE/approved`
- 상세 기록: `docs/2026-08-10_CUBICI_ADMIN_LV_24_MANAGEMENT_USAGE.md`
- 엄격한 LV 직접 메뉴 승인은 24/24, 100%로 마감했다.
- 다음 단계는 사용자·관리자 전체 회귀검증이다.
