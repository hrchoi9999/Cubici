# Cubici Admin Inventory - Member/Payment/Preferences/Prism

## 작업 목적

- 관리자단 미완 기능 중 회원/결제/환경설정/Prism 영역의 1차 개발 범위를 확정한다.
- 사용자단 개발과 같은 방식으로, 기능별 focused 검증 후 마지막 milestone에서만 관리자단 전체 E2E를 실행한다.
- 전체 E2E는 이 문서 작성 단계에서 실행하지 않는다.

## 조사 범위

- 회원현황, 회원정보, 휴면/해지
- 결제현황, 요금변경
- 요금제, 관리자 계정, 프로모션, 제휴사, 금융상품
- Prism 설정, Raw data/평가항목

## 확인 근거

| 구분 | 확인 파일 |
|---|---|
| 관리자 route/menu | `admin-web/src/App.jsx`, `admin-web/src/components/layout/AdminLayout.jsx` |
| 회원/결제 API | `service-api/src/cubici_service/api/v1/endpoints/management.py`, `service-api/src/cubici_service/management/repository.py` |
| 환경설정/Prism API | `service-api/src/cubici_service/api/v1/endpoints/preferences.py`, `service-api/src/cubici_service/preferences/repository.py` |
| 관리자 화면 | `admin-web/src/pages/*Member*.jsx`, `AdminAccountManagementPage.jsx`, `ChargeManagementPage.jsx`, `PromotionManagementPage.jsx`, `PartnerManagementPage.jsx`, `MoneybankProductPreferencePage.jsx`, `PrizmConfigPage.jsx`, `RawDataConfigPage.jsx` |
| 기존 진행률 기준 | `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md` |
| legacy 차이 기록 | `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md` |

## Inventory

| 기능 | legacy 재현 수준 | DB/API 연결 | 저장/상태변경 | focused E2E | 남은 개발 내역 | 병렬 개발 |
|---|---:|---|---|---|---|---|
| 회원현황 `member_tab1` | 70% | `GET /management/member-summary` 연결 | 없음. 조회/통계 중심 | mock E2E 있음 | legacy 회원 추이/집계 SQL과 신규 집계 대조, 실데이터 row 기준 검산 | 가능. 회원 조회/집계 Agent |
| 회원정보 `member_tab2` | 68% | `GET /management/member-info` 연결 | 없음. 상세 이동 중심 | mock E2E 있음 | 회원명 클릭 상세와 목록 필터 실데이터 검증, 권한별 민감정보 노출 정책 | 가능. 회원 조회/상세 Agent |
| 회원 상세 `userstatus` | 66% | `GET /management/member-status/{user_no}` 연결 | 없음. 조회 중심 | mock E2E 있음 | 결제/머니뱅크/추가서류 탭의 legacy 항목 전체 대조, 수정/메모/audit 필요 여부 확정 | 가능. 회원 조회/상세 Agent |
| 휴면/해지 `member_tab3` | 60% | `GET /management/member-withdrawals` 연결 | 관리자 최종 처리 제한적. 사용자 해지 E2E와 일부 연결 | mock E2E 및 일부 DB E2E 있음 | 미상환잔액 보유 해지, 강제해지 `73`, 본인해지/계좌해지 처리 기준 확정 | 가능. 해지/상태 Agent |
| 결제현황 `payment_tab1` | 55% | `GET /management/member-payments` 연결 | 없음. 목록 중심 | mock E2E 있음 | 원천 결제 상세 데이터 부재/row count 확인, PG 결제취소/영수증/상태값은 2차 여부 결정 | 가능. 결제 Agent |
| 요금변경 `payment_tab2` | 60% | `GET /management/member-charge-changes`, 환불 상세/완료 API 연결 | 환불완료 API 구현 | mock E2E 있음 | 환불 상태값, 카드취소/차액환급 산식, 결제사 연동 제외 범위 문서화, live DB focused CRUD | 가능. 결제 Agent |
| 요금제 관리 `manageCharge` | 62% | `/preferences/charges` CRUD 연결 | 등록/수정/삭제 구현 | mock E2E 있음 | 참조 중인 요금제 삭제 정책, 운영 요금제 실데이터 CRUD, legacy 필드/상태 매핑 검증 | 가능. 환경설정 CRUD Agent |
| 관리자 계정 `adminRegister_tab1` | 62% | `/preferences/admin-accounts` CRUD/승인 연결 | 신청/승인/수정/삭제 구현 | mock E2E 있음 | 권한등급 `00/01/02`, 접근제어, audit, legacy 버그성 admin_type 처리 재확인 | 가능. 권한/계정 Agent |
| 프로모션 `managePromotion` | 60% | `/preferences/promotions`, options 연결 | 등록/수정/삭제 구현 | mock E2E 있음 | `CBCI_SELECT_CODE` 부재 대체값 검증, 다중 요금제 연결 live DB 검증, 프로모션 코드 생성 규칙 | 가능. 환경설정 CRUD Agent |
| 제휴사 `managePartner` | 60% | `/preferences/partners` CRUD/중복확인 연결 | 등록/수정/삭제 구현 | mock E2E 있음 | 업종/구분 코드 매핑, 주소검색/사업자번호 검증 정책, live DB CRUD | 가능. 환경설정 CRUD Agent |
| 금융상품 `manageMoneybank_tab1/2` | 55% | `/preferences/moneybank-products` 등록/수정 연결 | 등록/수정 구현. 삭제 제외 | mock E2E 있음, live CRUD 과거 검증 기록 있음 | `MONEYBANK_PRODUCT`, `MONEYBANK_PARTNER` 원천 row 미확보. 상품 master 적재/정합성, 삭제 정책 | 가능. 금융상품 Agent |
| Prism 설정 `prizmConfig` | 58% | `/preferences/prizm-config/items`, update-records 연결 | 항목 수정/이력 저장 구현 | mock E2E 있음 | legacy `CBCI_PRIZM_*` 정규화 구조와 `prizm_items` 대체 구조 대조, live DB 수정/이력 검증 | 가능. Prism Agent |
| Raw data/평가항목 `prizmRawData` | 55% | `/preferences/raw-data/*` 연결 | 계산식 등록/수정/삭제, preview 구현 | mock E2E 있음 | RawData Excel download 보류, 민감 데이터 대량 조회 권한/audit, legacy 동적 SQL 대조 | 가능. Prism Agent |

## 1차 개발 범위 확정

이번 관리자단 1차 개발에서는 아래를 우선 완료한다.

1. 회원/결제/환경설정/Prism 영역의 live DB focused 검증을 추가한다.
2. mock E2E만 있는 화면은 실제 Docker PostgreSQL 기준 CRUD 또는 조회 검증을 최소 1개씩 보강한다.
3. 결제/환불/요금변경은 실 결제사 연동 없이 DB 상태전이와 산식만 검증한다.
4. 휴면/해지는 미상환잔액, 본인해지, 강제해지, 계좌해지 정책 gap을 문서화하고 가능한 범위만 구현한다.
5. 금융상품 master는 현재 원천 row가 없으므로 CRUD와 계약별 금융조건 대조까지만 1차 범위로 둔다.
6. Prism/RawData는 설정 저장과 이력/preview까지 1차 범위로 보고, 평가 재산출과 외부 Alt_CSM score 연동은 별도 범위로 둔다.

## 1차 제외 또는 2차 범위

| 항목 | 처리 |
|---|---|
| 실제 PG/카드 결제 취소 연동 | 2차 |
| SMS/Email 실제 발송 | 2차 |
| RawData Excel 대량 다운로드 | 권한/audit 확정 후 |
| 금융상품 master 원천 row 적재 | 추가 덤프 확보 후 |
| Prism 평가 재산출 엔진 | Alt_CSM 연동 설계 후 |
| 관리자 전체 E2E | 위 기능 개발과 focused 검증 완료 후 milestone 1회 |

## 병렬 작업 분배안

| Sub Agent | 담당 범위 | 산출물 | 충돌 가능성 |
|---|---|---|---|
| Admin Inventory A | 머니뱅크 운영: 신청/심사/계약/정산/상환/해지 | 운영 workflow gap 문서, focused 검증 목록 | `contracts`, `redemptions`, 관리자 Moneybank 페이지 |
| Admin Inventory B | 회원/결제/환경설정/Prism | 본 문서, 회원/결제/설정 개발 범위 | `management`, `preferences`, 설정 페이지 |
| Admin Verification Agent | DB preflight, focused test runner, 실패 분류 | 기능별 검증 결과 문서 | 테스트 파일/runner |

병렬 개발은 가능하지만, 같은 파일을 동시에 수정하면 병합 비용이 커진다. 따라서 병렬 구현 시 파일 소유권을 아래처럼 제한한다.

- 회원/결제 Agent: `management` API와 `Member*Page.jsx`
- 환경설정 Agent: `preferences` API와 `*ManagementPage.jsx`, `*PreferencePage.jsx`
- Prism Agent: `PrizmConfigPage.jsx`, `RawDataConfigPage.jsx`, `preferences` 중 `prizm/raw-data` 함수
- Master Agent: 공통 route, 공통 CSS, 전체 문서, 최종 병합 검토

## 다음 개발 순서

1. 관리자단 미완 기능 inventory 전체 확정: A/B 문서 병합.
2. 회원/결제/환경설정/Prism focused DB 검증 추가.
3. 실패 또는 gap이 확인된 기능부터 작은 단위로 구현.
4. 기능별 focused test 1차, 필요 시 같은 범위 2차 focused 재검증.
5. 관리자 1차 개발 완료 후 관리자단 전체 E2E 1회.

## 검증 여부

- 전체 E2E: 실행하지 않음.
- DB 쓰기 검증: 실행하지 않음.
- 수행 검증: `rg`, 파일 읽기, 기존 문서 확인 기준 정적 inventory.

## 불확실한 내용

- 결제 상세 원천 row와 legacy 결제사 상태값은 현재 확인 자료만으로 부족하다.
- `MONEYBANK_PRODUCT`, `MONEYBANK_PARTNER` 원천 row는 현재 작업공간 자료에서 미확보 상태로 기록되어 있다.
- Prism legacy 정규화 테이블 전체 구조는 PostgreSQL 현행 `prizm_items`로 대체되어 있어 1:1 재현 여부는 추가 원천 확인이 필요하다.
