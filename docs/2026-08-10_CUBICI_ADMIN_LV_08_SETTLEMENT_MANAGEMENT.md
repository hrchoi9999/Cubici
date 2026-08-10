# Cubici 관리자 ADM-LV-08 정산 관리 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 정산 관리`
- route: `/admin/moneybank/settlement`
- 승인 단위: 정산 목록 PC/모바일 한 화면

## LV 기준과 제한

- 정산 관리 전용 LV 캡처는 확보되지 않았다.
- `관리자화면04.png`는 상환 현황, `관리자화면06.png`는 자금조달관리이므로 정산 화면 기준으로 전용하지 않았다.
- 승인된 ADM-LV 공통 헤더·좌측 메뉴·검색·표·페이지 규칙을 적용했다.
- 정산 필드와 검산 산식은 현재 PostgreSQL schema와 기존 FastAPI 구현을 기준으로 유지했다.

## 적용 결과

- 단일 정산 관리 탭, 기준일, 5개 검색 조건을 공통 LV 구조로 정리했다.
- 쇼핑몰과 상태를 선택형 제어로 변경하고 통합검색을 연결했다.
- 최근순·과거순·정산액순 정렬과 엑셀 호환 CSV 다운로드를 추가했다.
- 검산 상태, 전체, 일치, 차이, 원본산출, 절대차이를 6개 요약 밴드로 구성했다.
- 목록은 계좌정보를 제외하고 정산 판단에 필요한 13개 컬럼과 상세 버튼이 PC에서 모두 보이도록 조정했다.
- 계좌정보와 세부 정산 산식은 기존 상세 화면에서만 확인하도록 유지했다.
- 모바일은 검색 1열, 요약 2열과 표 내부 가로 스크롤을 적용했다.

## Backend/API 변경

- 기존 `GET /v1/api/settlements`에 하위 호환 `order_by` query를 추가했다.
- 값은 `date_desc|date_asc|amount_desc|amount_asc`이다.
- 기존 필터, 목록·상세 응답과 정산 검산 산식은 변경하지 않았다.

## DB 대조

개발 Docker PostgreSQL `cubici-postgres-dev`에서 개인정보를 출력하지 않고 읽기 전용 집계를 실행했다.

| 항목 | 값 |
|---|---:|
| 정산 원본 행 | 469건 |
| 정산액 합계 | 61,554,507원 |
| 정산일 존재 | 469건 |
| 상태 존재 | 469건 |

## 변경 파일

- `admin-web/src/pages/SettlementManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-08-settlement-management.spec.js`
- `admin-web/tests/e2e/settlement-management.spec.js`
- `service-api/src/cubici_service/settlements/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/settlements.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend endpoint focused pytest | 1 passed, 75 deselected |
| 정산 검산 산식 pytest | 3 passed |
| ADM-LV-08 PC/모바일 Playwright | 2 passed |
| 기존 정산 목록·상세 regression | 1 passed |
| 정렬·필터 query와 CSV 다운로드 | 통과 |
| 모바일 body overflow | 없음 |
| 개발 DB 비식별 집계 | 통과, 469건 |
| 운영 배포 | 미수행 |

## 후보 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-08-SETTLEMENT-MANAGEMENT/candidate/ADM-LV-08-SETTLEMENT-MANAGEMENT-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-08-SETTLEMENT-MANAGEMENT/candidate/ADM-LV-08-SETTLEMENT-MANAGEMENT-MOBILE.png`
- PC SHA256: `958D7AA1BC50AA93C65C08F50CC1ED4C01C69F4249A24E02EF6B72F01B1B2B98`
- 모바일 SHA256: `8291EE9D138B97FC979A02C16D86F64FC544BC21C9677A8F63F15CEF8E18A0EF`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 85%
- 전용 LV 캡처 부재로 화면 복원율 상한을 보수적으로 적용했다.
- 잔여 기능 검증: 운영 DB 검산 차이 재검산, 실제 API 상세 회귀, 운영 배포
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-08-SETTLEMENT-MANAGEMENT/approved`
- 다음 승인 단위: `ADM-LV-09 머니뱅크 운영 > 상환 관리`
