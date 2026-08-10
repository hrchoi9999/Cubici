# Cubici 관리자 ADM-LV-07 계약 관리 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 계약/상환 > 계약 관리`
- route: `/admin/moneybank/approval_tab2`
- 승인 단위: 계약 관리 목록 PC/모바일 한 화면

## LV 기준

- 직접 화면 캡처: `docs/reference/lv-ui/admin/reference/관리자화면05.png`
- 업무 구조와 상태 산식: legacy `approval_tab2.jsp`, `AdminJudgeMapper.xml`
- 공통 헤더·좌측 메뉴: 사용자 승인된 ADM-LV-00 유지
- 최종 컬럼과 배치는 직접 LV 캡처를 우선 적용했다.

## 적용 결과

- 상단 탭을 LV와 같은 `계약 관리/상환 관리`로 구성했다.
- 회원명, 회사명, 이용서비스, 상태, 신청일자 검색과 기준일을 복원했다.
- 표를 `상태/MBID/이용서비스/지급그룹사/계약일자/아이디/회사명/회원명/지급율/주문건당한도/최대 미상환금/미상환금` 12개 컬럼으로 복원했다.
- MBID 클릭 시 기존 계약 상세와 상태 변경 화면을 열도록 기능을 유지했다.
- 보기기준 즉시 정렬과 엑셀 호환 CSV 다운로드를 추가했다.
- PC에서는 전체 컬럼이 한 화면에 보이고 모바일에서는 표 내부만 가로 스크롤되도록 구성했다.

## Backend/API 변경

- 기존 `GET /v1/api/contracts`에 하위 호환 query와 응답 필드를 추가했다.
- `contract_scope=true`: legacy 계약 관리 상태 04~07, 81과 대응 named status만 조회한다.
- `contract_stage=wait|contract|end`: 대기, 계약, 종료 단계 필터를 제공한다.
- `contract_summary`: 전체, 대기, 계약, 종료 집계를 반환한다.
- 목록에 지급그룹사, 주문건당한도, 최대 미상환금, 최신 미상환금을 추가했다.
- 기존 응답 필드와 상세·상태 변경 API는 삭제하거나 의미를 변경하지 않았다.

## Legacy 산식

- 계약 관리 범위: 상태 04, 05, 06, 07, 81
- 대기: 상태 04, 05, 81
- 계약: 상태 06
- 종료: 상태 07
- 미상환금: 계약별 최신 `moneybank_redemption_history.outstanding_balance`

## DB 대조

개발 Docker PostgreSQL `cubici-postgres-dev`에서 개인정보를 출력하지 않고 읽기 전용 집계 SQL을 실행했다.

| 항목 | 값 |
|---|---:|
| 계약 관리 범위 전체 | 4건 |
| 대기 / 계약 / 종료 | 0 / 4 / 0건 |
| fintech·최신 상환 lateral join | 정상 실행 |

## 변경 파일

- `admin-web/src/pages/ContractManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-07-contract-management.spec.js`
- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/contracts.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| Python compile | 통과 |
| admin production build | 통과, 73 modules |
| backend endpoint/detail focused pytest | 2 passed, 74 deselected |
| ADM-LV-07 PC/모바일 Playwright | 2 passed |
| 검색 query 전달 | `contract_scope`, `contract_stage`, `product_code` 확인 |
| 정렬·CSV 다운로드 | 통과 |
| 모바일 body overflow | 없음 |
| 개발 DB 집계 SQL | 통과, 4건 |
| 운영 배포 | 미수행 |

## 후보 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-07-CONTRACT-MANAGEMENT/candidate/ADM-LV-07-CONTRACT-MANAGEMENT-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-07-CONTRACT-MANAGEMENT/candidate/ADM-LV-07-CONTRACT-MANAGEMENT-MOBILE.png`
- PC SHA256: `07E628380333DB005958D28C15866DF480415AE7B0C5D541E2D65890E8719487`
- 모바일 SHA256: `751C73879FB4B527198F2F9F77F8FB7388A3F6117CE06D8B64B17AD817DB232A`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 85%
- legacy 산식 검산: 상태 집계와 최신 미상환금 SQL 대조 완료
- 잔여 기능 검증: 실제 API 응답 기반 상세·상태 변경 회귀, 운영 DB 조회, 운영 배포
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-07-CONTRACT-MANAGEMENT/approved`
- 다음 승인 단위: `ADM-LV-08 머니뱅크 운영 > 정산 관리`
