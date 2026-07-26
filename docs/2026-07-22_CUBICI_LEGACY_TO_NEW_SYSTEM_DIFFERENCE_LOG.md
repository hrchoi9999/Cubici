# Cubici Legacy 시스템과 신규 Migration 시스템 차이 정리

## 작업 결과

- legacy Java/JSP/MyBatis 시스템과 신규 Python/React/PostgreSQL 시스템의 차이를 정리했다.
- 차이 유형을 `구조 변경`, `테이블/스키마 변경`, `의도적 로직 수정`, `생략/보류`, `검증 필요`로 분류했다.
- 이후 화면별 migration 완료 판단 시 이 문서를 차이 추적 기준으로 사용한다.

## 기본 전제

- migration 목표는 기존 cubici.co.kr 운영 흐름을 신규 Python/React 서비스에서 재현하는 것이다.
- 단, 기존 Java/JSP/MyBatis 코드는 업무 흐름 분석용으로만 사용하고 신규 서비스 구조에 맞게 재설계한다.
- 화면 외형은 legacy 자산(CSS/image/layout)을 최대한 재사용하되, 내부 구현은 React component/API 구조로 전환한다.
- DB는 개발 기준 PostgreSQL이며, 운영 DB는 추후 Cloudflare D1 가능성을 별도 검토한다.

## 전체 구조 차이

| 구분 | Legacy 시스템 | 신규 시스템 | 차이 유형 | 비고 |
|---|---|---|---|---|
| Backend | Java, Spring MVC, eGovFrame, MyBatis | Python, FastAPI | 구조 변경 | Controller/Mapper 직접 호출을 REST API로 분리 |
| Frontend | JSP, jQuery, legacy Ajax | React, Vite | 구조 변경 | legacy DOM 이벤트를 React state/form으로 재구성 |
| DB | MySQL 기준 legacy SQL | PostgreSQL 기준 SQL | 구조 변경 | MySQL 함수/문법을 PostgreSQL로 변환 |
| 화면 호출 | JSP page include + Ajax | React route + API helper | 구조 변경 | legacy URL은 유지하되 내부 렌더링은 React |
| 테스트 | 수동 확인 중심 | pytest + Playwright E2E | 구조 변경 | mock API E2E와 API unit test 추가 |
| 문서화 | 코드/SQL 중심 | `.docs` Markdown 기록 | 운영 원칙 | migration 판단과 검증 결과를 문서화 |

## 테이블/스키마 변경

| Legacy 기준 | 신규 기준 | 상태 | 차이/주의사항 |
|---|---|---|---|
| `CBCI_BILLING_CHARGE` | `charge` | 적용 | `regi_date` → `reg_date`, `sub_period` → `period`, `sub_unit` → `period_unit` 등 PostgreSQL schema 기준으로 정리 |
| `CBCI_ADMIN` | `admin_account` | 신규 정의 | legacy DDL이 local schema inventory에서 확인되지 않아 migration `012_admin_account_preferences.sql`로 신규 정의 |
| `CBCI_BILLING_PAYMENT_DETAIL` | `billing_payment_detail` | 일부 적용 | 원천 payment detail data 부재. 결제현황 row count가 0일 수 있음 |
| `CBCI_BILLING_REFUND` 추정 | `billing_refund` | 일부 적용 | 요금변경/환급 흐름 구현, PG 환불 연동은 미검증 |
| `CBCI_PROMOTION_CODE` | `promotion` | 적용 | `end_date` → `expire_date`, `input_date` → `reg_date`, `free_period` → `period`로 PostgreSQL schema 기준 매핑 |
| `CBCI_CHARGE_PROMOTION_CONNECTION` | `promotion_charge` | 신규 정의 | legacy 다중 요금제 연결을 유지하기 위해 migration `013_promotion_charge_connection.sql`로 신규 정의 |
| `CBCI_PARTNER` | `partner` | 적용 | `partner_nm` → `partner_name`, `rep_nm` → `rep_name`, `detail` → `memo`, `input_date` → `reg_date`로 매핑 |
| `CBCI_MANAGER_INFO` | `partner_manager` | 적용 | `manager_nm` → `manager_name`, `input_date` → `reg_date`로 매핑 |
| `MONEYBANK_PARTNER` | `moneybank_partner` | 신규 정의 | 현재 PostgreSQL schema에 legacy 대응 테이블이 없어 migration `014_moneybank_product_preferences.sql`로 신규 정의 |
| `MONEYBANK_PRODUCT` | `moneybank_product_preference` | 신규 정의 | legacy 상품 조건 필드를 PostgreSQL naming으로 재정리. `EXTENTION_YN`은 `extension_yn`으로 정리 |
| `CBCI_PRIZM_SUBJECT` | `prizm_items.subject_no` 기반 대체 | 부분 대체 | PostgreSQL schema에 subject 테이블이 없어 `주제 {subject_no}`로 표시 |
| `CBCI_PRIZM_ITEM` | `prizm_items` | 부분 적용 | `item_definition`, `item_weight`, `item_nm` 중심으로 적용 |
| `CBCI_PRIZM_ITEM_DETAIL` | `prizm_items.item_standard_low/high1~5` | 부분 대체 | legacy의 `ITEM_SCORE`, `OPERATOR1/2` 구조는 현재 wide 기준값 컬럼으로 대체 |
| `CBCI_PRIZM_UPD_RECORD` | `prizm_item_update_record` | 신규 정의 | 변경이력 record와 before/after JSONB 저장 |
| `CBCI_PRIZM_UPD_DETAIL` | `prizm_item_update_record.before_payload/after_payload` | 부분 대체 | 세부 변경항목은 JSONB payload로 보관 |
| `CBCI_RAW_DATA` | `prizm_raw_data_formula` | 신규 정의 | RawData 계산식 저장용. legacy 원천 DDL 부재로 migration `016_prizm_raw_data_formula.sql`로 정의 |
| `CBCI_SELECT_CODE` | 코드 매핑/추후 테이블 확인 | 부분 대체 | PostgreSQL schema에서 확인되지 않아 `promotionTarget` 라벨은 코드 매핑으로 처리 |
| legacy 게시판/문의/템플릿 테이블 | support domain repository | 일부 적용 | 목록/write/delete 구현. 첨부파일/발송 등 일부 보류 |

## 의도적으로 다르게 처리한 로직

| 화면/기능 | Legacy 동작 | 신규 동작 | 사유 |
|---|---|---|---|
| 관리자 등록 수정 | legacy JS에서 투게더/헬로펀딩 수정 시 `ADMIN_TYPE`을 모두 `00`으로 보내는 버그성 코드 존재 | 실제 선택/저장된 `admin_type` 값을 유지 | 명백한 버그성 로직으로 판단. 운영 전 재확인 필요 |
| 관리자 비밀번호 | JSP에서 `{AZON}` salt SHA-256 hash 생성 후 전송 | API에서 `{AZON}` salt SHA-256 hash 생성 후 저장 | raw/hash를 응답에 노출하지 않기 위해 서버 처리로 변경 |
| 관리자 등록 UI | modal 중심 승인/수정 | React 패널형 승인/수정 | 화면 흐름은 유지하되 React 상태관리로 단순화 |
| 요금제 관리 UI | modal 중심 상세/수정 | React 패널형 상세/수정 | legacy CSS 톤 유지, 내부 DOM은 재구성 |
| 요금제 삭제 | legacy는 직접 delete | 신규도 delete 구현, 단 참조 정책 검증 필요 | 결제이력 참조 중 삭제 정책은 운영 전 확인 필요 |
| API 구조 | 화면별 Ajax endpoint | RESTful `/v1/api/...` | 신규 서비스 운영/테스트/문서화를 위해 API domain 분리 |
| 연계코드 코드명 | `CBCI_SELECT_CODE`에서 target/division 라벨 조회 | target은 코드 매핑, partner division은 `partner.partner_type` 사용 | select-code 대응 테이블 부재. 운영 전 코드명 대조 필요 |
| 협력사 주소/사업자번호 확인 | 주소 검색 팝업과 legacy 사업자번호 형식검증 사용 | 우편번호/주소 수동 입력, 중복 확인 중심 | 주소 API와 checksum 검증은 운영 전 결정 필요 |
| 머니뱅크 상품 삭제 | legacy 화면에서 삭제 흐름이 명확하지 않음 | 목록/상세/등록/수정만 구현 | 삭제 정책은 운영 데이터 참조 관계 확인 후 결정 |
| Prism 설정 구조 | subject/item/detail/record/detail record 정규화 | `prizm_items` wide table + JSONB 이력 | 현재 이관된 PostgreSQL schema 기준으로 우선 구현. 원천 테이블 확보 시 재검토 |
| RawData Excel | 동적 SQL로 선택 컬럼 Excel 다운로드 | 선택 컬럼 preview까지만 구현 | 임의 SQL/대량 민감 데이터 반출 위험 때문에 권한 정책 확정 전 다운로드 보류 |
| 큐빅아이 통합정보 | 회원/매출/정산/SKU 요약과 chart | 회원/머니뱅크 전환/해지/결제 요약과 회원 추이 우선 구현 | 매출/정산/SKU chart는 legacy SQL 산식 대조 후 보강 |
| 머니뱅크 통합정보 | `MoneyBankAccumulateValue` 기반 누적값과 chart | 기존 `management/overview` API로 계약/선정산/상환/정산/잔액 요약과 추이 구현 | legacy 누적값 산식과 신규 집계 산식 검산 필요 |

## 생략 또는 보류된 부분

| 영역 | 생략/보류 내용 | 현재 상태 | 다음 확인 |
|---|---|---|---|
| PostgreSQL live CRUD | 일부 화면은 mock E2E/API unit test만 완료 | PG 미기동으로 live 검증 미완료 | PG 실행 후 실제 저장/조회/삭제 테스트 |
| 결제관리 | PG 결제 취소, 실제 결제사 연동 | 미구현/미검증 | 운영 정책과 PG API 확인 필요 |
| 환불/요금변경 | 환불완료 DB 처리 구현, 실제 PG 환불은 미검증 | 부분 구현 | 환불 상태값과 PG 결과 대조 |
| 상환 취소 | 취소 후 잔액 재계산/정합성 검산 | backlog 문서화 | 전체 DB 테스트 운영 중 검산 |
| SMS/Email | 실제 발송 | 제외 | 템플릿 관리만 구현. 발송 모듈은 별도 단계 |
| 서버 관리 | legacy 전용 JSP/Controller 미확인 | 신규 서버 상태 점검 화면으로 대체 | API/DB/배치 report 기준 상태 표시. OS metric은 제외 |
| 첨부파일 | 게시판 첨부파일 일부 | 보류 | 파일 저장 정책과 권한 확인 후 구현 |
| Excel export | legacy excel download | 대부분 미구현 | 관리자 운영 필요 화면부터 순차 구현 |
| 권한 체계 | legacy Spring Security role/grade 전체 | 미완성 | `adminRegister_tab2` 접근권한 구현 시 재검토 |
| 사용자용 페이지 | 사용자 frontend | 본격 migration 전 | 관리자 완료 후 진행 |

## 검증 필요 항목

| 항목 | 이유 | 우선순위 |
|---|---|---:|
| legacy SQL 산식과 신규 API 산식 대조 | 정산/상환/수수료/잔액은 금융 운영 핵심 | 높음 |
| PostgreSQL migration 적용 후 row count 비교 | 데이터 누락 여부 확인 필요 | 높음 |
| 결제/환불 상태값 매핑 | 관리자 화면 상태 표시와 실제 처리 불일치 방지 | 높음 |
| 상환 취소 후 잔액 재계산 | 잔액 불일치 가능성 존재 | 높음 |
| 관리자 권한 등급 `00/01/02` 의미 | 화면 접근권한과 보안 정책 연결 필요 | 높음 |
| 요금제 삭제 정책 | 결제이력 참조 데이터 보호 필요 | 중간 |
| 연계코드 중복/요금제 연결 | `promo_target + partner_code` 코드 생성과 다중 요금제 연결 정합성 확인 필요 | 중간 |
| 협력사 코드/업종 라벨 | `CBCI_SELECT_CODE` 기반 업종명 대조와 `partner_code` 생성 규칙 확인 필요 | 중간 |
| 머니뱅크 상품 상태/수수료 단위 | `MONEYBANK_PRODUCT` 실제 상태값과 수수료/이자 단위 대조 필요 | 중간 |
| Prism System subject/detail 구조 | legacy `CBCI_PRIZM_*` 원천 테이블과 신규 `prizm_items` 대체 구조 대조 필요 | 중간 |
| 서버 관리 운영 지표 | CPU/Memory/Disk/프로세스 상태 수집 방식 미정 | 중간 |
| RawData 다운로드/감사로그 | 민감 데이터 대량 조회 가능성이 있어 권한/로그 정책 필요 | 중간 |
| 통합정보 legacy chart 산식 | 큐빅아이 매출/SKU, 머니뱅크 누적값 chart가 신규 화면과 일부 다름 | 중간 |
| legacy CSS/Layout 세부 오차 | 사용자 인지 가능성 최소화 | 중간 |
| Excel/export/batch 작업 | 운영 편의 기능 | 중간 |

## 현재 판단

- 신규 시스템은 legacy 화면과 업무 흐름을 재현하는 방향으로 개발 중이나, 내부 구조는 이미 Python API/React/PostgreSQL 방식으로 상당 부분 달라졌다.
- 화면 목록/상세/write 흐름은 구현 중이지만, legacy 산식 1:1 검산과 live DB CRUD 검증 전까지는 100% migration 완료로 판단하지 않는다.
- 금융/정산/상환/결제 관련 로직은 구현 후 별도 검산 단계를 반드시 둔다.

## 다음 액션

- 신규 화면 구현 시 차이 발생 항목을 이 문서에 계속 추가한다.
- PostgreSQL 실행 후 `live DB 검증 결과` 섹션을 화면별 문서와 함께 보강한다.
- 다음 구현 후보는 `환경설정 > 연계코드 관리` 또는 `환경설정 > 접근권한`이다.
