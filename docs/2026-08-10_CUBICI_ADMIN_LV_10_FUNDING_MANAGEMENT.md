# Cubici 관리자 ADM-LV-10 자금조달 관리 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 자금조달 관리`
- route: `/admin/moneybank/funding`
- 승인 단위: 자금조달 관리 PC/모바일 한 화면
- 직접 LV 기준: `docs/reference/lv-ui/admin/reference/관리자화면06.png`

## LV 대조와 적용

- 상단 제목 `자금조달관리`, 좌측 메뉴 활성 위치, 우측 `자금조달등록` 버튼을 복원했다.
- LV 기준 8개 열 `No/자금조달사명/등록일자/상환주기/수익률/자금조달금/상환금/미상환금`을 그대로 구성했다.
- 자금조달사명을 선택하면 조달사별 신청건수와 금액 상세를 확인할 수 있다.
- `자금조달등록`은 별도 상품 화면으로 이동하지 않고 자금조달사명·상환주기·수익률 기본등록 패널을 연다.
- 상세에는 요청 연결건수와 `검산일치/이력범위 확인/조달내역 없음` 상태를 표시한다.
- 모바일은 열 순서를 바꾸지 않고 표 내부 가로 스크롤을 사용한다.
- 기존 상품 설정 화면은 삭제하지 않고 `/admin/cubici/adminPreference/manageMoneybank_tab1`, `tab2`에 보존했다.

## Backend/API 변경

- `GET /v1/api/fintech/funding-summary`를 추가했다.
- `POST /v1/api/fintech/funding-providers` 전용 기본등록 API를 추가했다.
- `fintech_request`를 자금조달사별로 집계하고 `fintech`의 상환주기·수익률을 결합했다.
- 상환 이력은 `fintech_request.request_code → moneybank_redemption_provision → MBID → moneybank_redemption_repayment` 순서로 연결했다.
- 원본 상환합계가 조달금을 초과하는 경우 화면 상환금은 조달금 한도로 제한하고 연결건수·원본 상환금·초과분·검산상태를 API에 별도 보존한다.
- 기본등록은 계좌·펌뱅킹 정보를 받지 않으며 해당 보안 설정은 별도 절차로 분리했다.

## DB 대조

개발 Docker PostgreSQL `cubici-postgres-dev`에서 개인정보를 출력하지 않고 읽기 전용 repository 검증을 실행했다.

| 항목 | 값 |
|---|---:|
| 자금조달사 | 2곳 |
| 자금조달 신청 | 159건 |
| 자금조달금 | 21,318,788원 |
| 화면 상환금 | 20,676,676원 |
| 미상환금 | 642,112원 |
| 요청코드 연결 | 158/159건 |
| 원본 상환 초과분 | 33,585,564원 |

큐빅아이는 17/17건 연결·초과분 0원으로 `검산일치`다. 헬로페이는 141/142건이 연결되지만 상환 이력이 자금조달 요청보다 약 4개월 먼저 시작되어 `이력범위 확인`이다. 현재 DB에는 요청별 상환 배분키가 없어 초과분을 임의 배분하지 않는다.

## 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/api/fintech.js`
- `admin-web/src/components/layout/AdminLayout.jsx`
- `admin-web/src/pages/FundingManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-10-funding-management.spec.js`
- `service-api/src/cubici_service/api/v1/endpoints/fintech.py`
- `service-api/src/cubici_service/fintech/repository.py`
- `service-api/tests/test_fintech_funding_provider_db_e2e.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| Python compile | 통과 |
| admin production build | 통과, 74 modules |
| backend route focused pytest | 78 passed |
| 실제 Docker DB repository 조회 | 통과, 2곳 |
| 자금조달사 실제 DB 등록·중복차단·정리 | 1 passed |
| ADM-LV-10 PC/모바일 bundle smoke | 2 passed |
| 조달사 상세 표시 | 통과 |
| 모바일 body overflow | 없음 |
| 기존 상품 CRUD route 회귀 | 1 passed |
| 전용 자금조달사 기본등록 write | 통과 |
| legacy 상환 초과분 산식 검산 | 연결키·기간 대조 완료, 요청별 배분키 부재 확인 |
| 운영 배포 | 미수행 |

## 승인 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-10-FUNDING-MANAGEMENT/approved/ADM-LV-10-FUNDING-MANAGEMENT-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-10-FUNDING-MANAGEMENT/approved/ADM-LV-10-FUNDING-MANAGEMENT-MOBILE.png`
- 등록 PC: `docs/reference/lv-ui/admin/ADM-LV-10-FUNDING-MANAGEMENT/approved/ADM-LV-10-FUNDING-REGISTRATION-PC.png`
- 등록 모바일: `docs/reference/lv-ui/admin/ADM-LV-10-FUNDING-MANAGEMENT/approved/ADM-LV-10-FUNDING-REGISTRATION-MOBILE.png`
- 목록 PC SHA256: `9A715F32A89AE7299CC4BE6DC91432CE4E8C54F36B6CABBB173ABE6370E0CEDF`
- 목록 모바일 SHA256: `7A8ECEF29054822B81D8DC3014969001EB7B33331AC45F8084D716293DC131A3`
- 등록 PC SHA256: `90FAD7ACED0FD45C900060BE66A88B6A4C4808C43C69884DFC3E2A1E80AC45C6`
- 등록 모바일 SHA256: `9C874202BEAECFE61F1AB825F264D64679DCFB1EBD44B9B16FFAFB3FBFE1CEC2`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 90%
- 데이터 한계: 요청별 상환 배분키 부재, 헬로페이 1건 미연결
- 별도 보안설정: 펌뱅킹·계좌 설정
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-10-FUNDING-MANAGEMENT/approved`
- 다음 승인 단위: `ADM-LV-11 머니뱅크 운영 > 신용평가지표`
