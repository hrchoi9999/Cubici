# Cubici 관리자 화면 Migration 진행률 기준

## 작업 결과

- 관리자 화면 migration 진행률 산정 기준을 정리했다.
- 앞으로 작업 완료 보고에는 legacy 전체 화면 수, migration 완료/부분완료 수, 페이지별 완성도를 함께 표시한다.
- 진행률 산정 원칙은 `AGENTS.md`에 반영했다.

## 화면 수 기준

| 기준 | 수량 | 설명 |
|---|---:|---|
| Legacy 좌측 메뉴 기준 | 21개 | `cubiciAdminFrame.jsp` 좌측 메뉴 기준. `서버 관리`처럼 URL 미확정 메뉴도 포함 |
| Legacy 관리자 JSP 전체 | 72개 | `src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/**/*.jsp` 전체 |
| Legacy 후보 화면 JSP | 61개 | 전체 JSP 72개에서 공통 include 4개, test 4개, modal 3개를 제외한 후보 |
| React 실제 구현 화면 | 29개 | 현재 별도 React page/API로 구현된 관리자 화면 |

## 현재 Migration 현황

| 구분 | 화면 | Legacy 경로 | 상태 | 보수적 완성도 |
|---|---|---|---|---:|
| 통합정보 | 큐빅아이 | `/admin/cubici/infoIntegrated/cubici_tab1` | 기존 management API 재사용, 회원/전환/해지/결제 요약과 추이 화면/E2E 구현. legacy 매출/정산/SKU chart 미구현 | 50% |
| 통합정보 | 머니뱅크 | `/admin/cubici/infoIntegrated/moneybank_tab1` | 기존 management overview API 재사용, 계약/선정산/상환/정산/잔액 요약과 추이 화면/E2E 구현. legacy chart 산식 검산 필요 | 55% |
| 회원관리 | 회원현황 | `/admin/cubici/manageMember/member_tab1` | `member_tab1/2/3` 및 회원 상세 DB/API/화면/E2E 구현, 결제이력/평가메모/해지확인 write 미구현 | 75% |
| 회원관리 | 결제관리 | `/admin/cubici/manageMember/payment_tab1` | `payment_tab1/2` legacy 컬럼/API/화면/E2E 구현, 결제상세 원천 데이터 미이관, PG 취소 연동 미검증 | 50% |
| 머니뱅크 관리 | 통합 현황 | `/admin/moneybank/cubici/management/info_tab1` | DB/API/화면 구현, legacy 산식 미검산 | 70% |
| 머니뱅크 관리 | 이용상세 목록 | `/admin/moneybank/management/usageList` | DB/API/화면 구현, legacy 산식 미검산 | 75% |
| 머니뱅크 관리 | 이용상세 상세 | `/admin/moneybank/management/usageDetail` | DB/API/탭 화면 구현, legacy 항목 검산 미완료 | 65% |
| 머니뱅크 운영 | 신청 접수 | `/admin/moneybank/request` | DB/API/서류/메모/E2E 구현 | 80% |
| 머니뱅크 운영 | 심사 승인 | `/admin/moneybank/approval_tab1` | DB/API/화면 구현 | 75% |
| 머니뱅크 운영 | 계약 관리 | `/admin/moneybank/approval_tab2` | DB/API/화면 구현 | 70% |
| 머니뱅크 운영 | 정산 관리 | `/admin/moneybank/settlement` | DB/API/화면 구현 | 70% |
| 머니뱅크 운영 | 상환 관리 | `/admin/moneybank/redemption` | DB/API/상환작업/취소/E2E 구현, 산식 재검산 필요 | 75% |
| 머니뱅크 운영 | 프리즘 지표 관리 | `/admin/moneybank/manage` | DB/API/화면 구현 | 70% |
| 고객관리 | 고객문의 | `/admin/cubici/supportMember/manageInquiry` | DB/API/목록/상세/답변 write/E2E 구현, legacy 코드 매핑 검산 남음 | 70% |
| 고객관리 | 문자/이메일 | `/admin/cubici/supportMember/manageSms` | DB/API/목록/상세/write/delete/E2E 구현, 실제 발송 제외 | 65% |
| 고객관리 | 고객 공지 관리 | `/admin/cubici/supportMember/manageBoard_tab1` | DB/API/공지/FAQ/write/delete/E2E 구현, 첨부파일 보류 | 65% |
| 모니터링 | Error Log | `/admin/cubici/adminMonitor/error_report` | DB/API/화면/E2E 구현, legacy 운영 로그 데이터 미포함 | 55% |
| 모니터링 | 서버 관리 | `/admin/cubici/adminMonitor/server_monitor` | legacy 전용 JSP 부재. 신규 서버 상태/API/DB/배치 성공·실패 점검 화면/E2E 구현, OS metric 미구현 | 45% |
| 환경설정 | 관리자 등록 | `/admin/cubici/adminPreference/adminRegister_tab1` | DB migration/API/목록/상세/승인/write/delete/E2E 구현, live DB CRUD 및 접근권한 연동 검증 필요 | 55% |
| 환경설정 | 요금제 관리 | `/admin/cubici/adminPreference/manageCharge` | DB/API/목록/상세/write/delete/E2E 구현, live DB CRUD 검증 및 삭제 정책 확인 필요 | 55% |
| 환경설정 | 연계코드 관리 | `/admin/cubici/adminPreference/managePromotion` | DB migration/API/목록/상세/옵션/write/delete/E2E 구현, live DB CRUD 및 select-code 매핑 검증 필요 | 55% |
| 환경설정 | 협력사 관리 | `/admin/cubici/adminPreference/managePartner` | DB/API/목록/상세/중복확인/write/delete/E2E 구현, live DB CRUD 및 select-code/주소검증 확인 필요 | 55% |
| 환경설정 | 머니뱅크 관리 | `/admin/cubici/adminPreference/manageMoneybank_tab1` | DB migration/API/목록/상세/write/E2E 구현, live DB CRUD 및 legacy 상태/수수료 매핑 검증 필요 | 50% |
| 환경설정 | Prism System | `/admin/cubici/adminPreference/prizmConfig` | `prizm_items` 기준 DB/API/목록/상세/write/이력/E2E 구현, RawData 계산식/preview 구현, legacy 정규화 테이블 및 Excel download 검증 필요 | 50% |

## 현재 진행률 산정

- Legacy 최종 Depth 메뉴 기준: 21개 중 21개 메뉴가 실구현 또는 부분실구현 상태
  - 큐빅아이 통합정보, 머니뱅크 통합정보, 회원현황, 결제관리, 통합 현황, 이용상세, 신청 접수, 심사 승인, 상환 관리, 프리즘 지표 관리, 고객문의, 문자/이메일, 고객 공지 관리, Error Log, 서버 관리, 관리자 등록, 요금제 관리, 연계코드 관리, 협력사 관리, 머니뱅크 관리, Prism System
- 상세/파생 화면 포함 기준: 현재 React 실구현 화면 29개
  - 큐빅아이 통합정보, 머니뱅크 통합정보, 회원 종합, 회원 정보, 휴면/해지, 회원 상세, 결제 현황, 요금변경 관리, 통합 현황, 이용상세 목록, 이용상세 상세, 신청 접수, 심사 승인, 계약 관리, 정산 관리, 상환 관리, 프리즘 지표 관리, 고객문의, 문자/이메일, 고객 공지 관리, Error Log, 서버 관리, 관리자 등록, 요금제 관리, 연계코드 관리, 협력사 관리, 머니뱅크 관리, Prism System, RawData
- Legacy 후보 JSP 기준: 61개 중 29개 화면에 해당하는 기능을 Python/React로 재구성 중

## 보수적 진행률

- 전체 관리자 메뉴 기준: 약 `63~67%`
- 관리자 핵심 머니뱅크 운영/관리 기준: 약 `62~67%`
- 전체 프로젝트 기준: 약 `61~65%`

## 보수적 판단 기준

- 화면이 보이는 것만으로 완료 처리하지 않는다.
- DB/API 실데이터 연동, 저장/변경 기능, legacy 산식 검산, E2E, 운영 배포 준비가 모두 확인되어야 높은 완성도로 본다.
- 현재 구현된 화면 중 상당수는 legacy 산식 1:1 검산이 남아 있으므로 70~80% 이상으로 보지 않는다.
- legacy와 신규 시스템의 차이는 `docs/2026-07-22_CUBICI_LEGACY_TO_NEW_SYSTEM_DIFFERENCE_LOG.md`에 계속 누적 기록한다.

## 다음 액션

- 이후 모든 작업 완료 보고에 이 기준표를 반영한다.
- 다음 개발 작업은 PostgreSQL 실행 승인 후 통합정보/환경설정 계열 실데이터 검증을 하거나, legacy chart 산식 대조를 진행한다.
