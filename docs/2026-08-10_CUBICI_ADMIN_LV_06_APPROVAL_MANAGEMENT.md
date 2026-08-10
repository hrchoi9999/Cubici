# Cubici 관리자 ADM-LV-06 심사 승인 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 심사 승인`
- route: `/admin/moneybank/approval_tab1`
- 승인 단위: 심사 승인 목록 PC/모바일 한 화면

## LV 기준

- 직접 화면 캡처: 심사 승인 전용 LV 캡처는 확보되지 않음
- HTML/업무 구조: legacy `admin/moneybank/operation/approval_tab1.jsp`
- 집계/필터 산식: legacy `AdminJudgeMapper.xml`
- 공통 헤더·좌측 메뉴: 사용자 승인된 ADM-LV-00 유지
- 표와 검색 밀도: 기존 관리자 LV 캡처 및 승인된 ADM-LV-03~05 공통 규칙 사용

## 적용 결과

- `심사 승인/계약 관리` 2개 탭과 기준일을 LV 구조로 유지했다.
- 회원명, 회사명, 회원 ID, 서비스, 승인상태, 신청일자 검색을 legacy 순서로 구성했다.
- 서비스와 승인상태를 선택형 제어로 변경하고 보기기준과 엑셀 호환 CSV 다운로드를 추가했다.
- 표에 사업기간, 월결제액 천원 단위, Prism 점수와 `승인/수수료/지급율` 2단 헤더를 복원했다.
- 하단 집계를 `총/심사대기/심사완료/승인/조정/거부/거부율` 7개로 복원했다.
- 기존 심사 상세, 수수료 조건 조정, 조건 제시 기능은 유지했다.
- 모바일은 검색 1열과 목록 내부 가로 스크롤로 구성하고 body 가로 이탈을 제거했다.

## Backend/API 변경

- 기존 `GET /v1/api/contracts` endpoint에 하위 호환 query와 응답 필드를 추가했다.
- `approval_scope=true`: legacy 심사 상태 03·04·05·41과 대응 named status만 조회한다.
- `approval_stage=wait|accept|adjust|refuse`: 심사 상태 필터를 제공한다.
- `approval_summary`: 전체, 대기, 완료, 승인, 조정, 거부, 거부율을 반환한다.
- 목록에 사업자 설립일, 숫자 Prism 점수, 조건 조정 여부를 추가했다.
- 기존 응답 필드는 삭제하거나 의미를 변경하지 않았다.

## Legacy 산식

- 심사대기: 상태 03
- 심사완료: 상태 04·05·41
- 승인: 상태 04·05이면서 조건 조정 이력 없음
- 조정: 상태 04·05이면서 조건 조정 이력 존재
- 거부: 상태 41
- 거부율: 거부 / 심사완료 × 100
- Prism 추천 승인: 숫자 점수 500 초과

## DB 대조

개발 Docker PostgreSQL `cubici-postgres-dev`에서 개인정보를 출력하지 않고 읽기 전용 집계 SQL을 실행했다.

| 항목 | 값 |
|---|---:|
| 심사 범위 전체 | 0건 |
| 대기 / 완료 | 0 / 0건 |
| 승인 / 조정 / 거부 | 0 / 0 / 0건 |
| 새 목록 필드 SQL | 정상 실행 |

현재 개발 DB에는 심사 상태 데이터가 없어 실제 행 표시 검증은 API 응답 contract와 동일한 mock 4건으로 수행했다.
운영 DB `cubici_prod`에는 `contract_fee_adjustment_history` 테이블이 존재함을 확인했다.

## 변경 파일

- `admin-web/src/pages/ApprovalManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-06-approval-management.spec.js`
- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/contracts.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| Python compile | 통과 |
| admin production build | 통과, 73 modules |
| backend endpoint/detail focused pytest | 2 passed, 74 deselected |
| ADM-LV-06 PC/모바일 Playwright | 2 passed |
| 검색 query 전달 | `approval_scope`, `approval_stage`, `product_code` 확인 |
| 정렬·CSV 다운로드 | 통과 |
| 모바일 body overflow | 없음 |
| 개발 DB 집계 SQL | 통과, 현재 0건 |
| 운영 DB migration preflight | 조정 이력 테이블 존재 |
| 운영 배포 | 미수행 |

## 후보 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-06-APPROVAL-MANAGEMENT/candidate/ADM-LV-06-APPROVAL-MANAGEMENT-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-06-APPROVAL-MANAGEMENT/candidate/ADM-LV-06-APPROVAL-MANAGEMENT-MOBILE.png`
- PC SHA256: `ECA2427B7642E72F1BF5785CCD1FB6EFD4ACF806186848986EA9D4BCDBEDFB30`
- 모바일 SHA256: `B4F0129D929AFA69F1FEE5DBCB8BB9E31828E75ACC199179DFF323BB42476D2A`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 82%
- legacy 산식 검산: 코드·SQL 대조 완료, 실데이터 0건으로 값 대조는 미완료
- 잔여 기능 검증: 실제 심사 데이터 기반 목록·집계, 상세 쓰기 회귀, 운영 DB 조회, 운영 배포

## 승인본

- `docs/reference/lv-ui/admin/ADM-LV-06-APPROVAL-MANAGEMENT/approved`
- 다음 승인 단위: `ADM-LV-07 머니뱅크 운영 > 계약 관리`
