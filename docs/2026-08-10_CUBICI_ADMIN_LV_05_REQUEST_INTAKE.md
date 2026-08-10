# Cubici 관리자 ADM-LV-05 신청 접수 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 신청/승인 > 신청 접수`
- route: `/admin/moneybank/request`
- 승인 단위: 신청 접수 목록 PC/모바일 한 화면

## LV 기준

- 직접 화면 캡처: 신청 접수 전용 LV 캡처는 확보되지 않음
- HTML/업무 구조: legacy `admin/moneybank/operation/requestState.jsp`
- 집계/필터 산식: legacy `AdminReqMapper.xml`
- 공통 헤더·좌측 메뉴: 사용자 승인된 ADM-LV-00 유지
- 표와 검색 밀도: 기존 관리자 LV 캡처 및 승인된 ADM-LV-03·04 공통 규칙 사용

## 적용 결과

- 탭명을 legacy와 같은 `신청 현황`으로 정리하고 기준일을 추가했다.
- 회원명, 회사명, 회원ID, 서비스, 신청상태, 월결제액, 신청일자 검색 조건을 LV형 4열 구조로 구성했다.
- 보기기준과 엑셀 호환 CSV 다운로드를 목록 위 별도 도구 영역으로 분리했다.
- 표 열을 `상태/재이용/신청일자/회원ID/회원명/월결제액(천원)/등록쇼핑몰/제출서류 확인/프리즘 점수`로 복원했다.
- 하단 집계를 `총 신청 접수/신청 진행/신청 완료`로 복원했다.
- 모바일은 검색 조건 1열, 목록 내부 가로 스크롤로 구성하고 body 가로 이탈을 제거했다.
- 기존 상태 상세, 서류 확인, Prism 점수 상세 기능은 유지했다.

## Backend/API 변경

- 기존 `GET /v1/api/contracts` endpoint에 하위 호환 query를 추가했다.
- `request_scope=true`: legacy 신청 접수 범위인 상태 01~07과 대응 named status만 조회한다.
- `request_stage=progress|complete`: 신청/완료 목록 필터를 제공한다.
- `request_summary`: 전체, 진행, 완료 집계를 반환한다.
- `use_count`: 동일 회원의 이전 만료 계약 수를 반환한다.
- 기존 응답 필드는 삭제하거나 의미를 변경하지 않았다.

## DB 대조

개발 Docker PostgreSQL `cubici-postgres-dev`에서 민감정보를 출력하지 않고 읽기 전용 집계 SQL을 실행했다.

| 항목 | 값 |
|---|---:|
| 신청 접수 범위 전체 | 4건 |
| 신청 진행 | 0건 |
| 신청 완료 | 4건 |
| 표본 재이용 | 0건 |

Docker 상태는 `cubici-postgres-dev`, `cubici-postgres-prod`, `cubici-api-prod` 모두 healthy였다.

## 변경 파일

- `admin-web/src/pages/AdminDashboardPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-05-request-intake.spec.js`
- `service-api/src/cubici_service/contracts/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/contracts.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| Python compile | 통과 |
| admin production build | 통과, 73 modules |
| backend endpoint focused pytest | 1 passed, 75 deselected |
| ADM-LV-05 PC/모바일 Playwright | 2 passed |
| 검색 query 전달 | `request_scope`, `request_stage`, `product_code` 확인 |
| CSV 다운로드 | 파일명과 완료 상태 확인 |
| 모바일 body overflow | 없음 |
| 개발 DB 집계 SQL | 통과, 4 / 0 / 4건 |
| 운영 배포 | 미수행 |

## 후보 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-05-REQUEST-INTAKE/candidate/ADM-LV-05-REQUEST-INTAKE-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-05-REQUEST-INTAKE/candidate/ADM-LV-05-REQUEST-INTAKE-MOBILE.png`
- PC SHA256: `938E31BEBCBF8559B044A7E5EE229A40C19870ED84AA456DD46CDAAB3FBA9CCE`
- 모바일 SHA256: `56473915CB97BD13548B68173C4A85A5CB3A0C4871900C5CFEC55E083D9E12B7`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 85%
- legacy 산식 검산: 신청/완료와 재이용 집계 대조 완료
- 잔여 기능 검증: 실제 API 프로세스에서 상세 쓰기 회귀, 운영 DB 조회, 운영 배포

## 승인본

- `docs/reference/lv-ui/admin/ADM-LV-05-REQUEST-INTAKE/approved`
- 다음 승인 단위: `ADM-LV-06 머니뱅크 운영 > 심사 승인`
