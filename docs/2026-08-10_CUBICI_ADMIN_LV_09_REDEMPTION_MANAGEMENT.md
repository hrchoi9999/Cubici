# Cubici 관리자 ADM-LV-09 상환 관리 복원

## 작업 범위

- 화면: `머니뱅크 운영 > 계약/상환 > 상환 현황`
- route: `/admin/moneybank/redemption`
- 승인 단위: 상환 현황 PC/모바일 한 화면
- 직접 LV 기준: `docs/reference/lv-ui/admin/reference/관리자화면04.png`

## LV 대조와 적용

- 상단 제목을 `계약/상환`으로 맞추고 좌측 메뉴명 `상환 관리`는 유지했다.
- `계약 관리/상환 현황` 2개 탭과 상환 현황의 오른쪽 활성 위치를 복원했다.
- 기준일, 회원명·회사명·이용서비스·신청상태·신청일자 검색을 LV 구조로 재구성했다.
- 최근순·과거순·미상환금순·수수료순 정렬과 엑셀 호환 CSV 다운로드를 연결했다.
- 목록은 LV 직접 캡처와 같은 11개 열로 구성했다.
- MBID를 선택하면 기존 지급·상환 등록, 취소, 작업 이력 상세가 열리도록 기능을 보존했다.
- 모바일은 활성 탭을 가운데로 옮기지 않고 두 번째 원래 위치에 유지했으며 표는 내부 가로 스크롤을 사용한다.

## Backend/API 변경

- `GET /v1/api/redemptions` 목록 응답에 계약상태, 상품, 지급그룹사, 계약일, 회원·회사 정보, 최대 미상환금, 서비스 수수료를 추가했다.
- 회원명·회사명·이용서비스·계약단계·계약일 필터와 정렬 query를 추가했다.
- 서비스 수수료는 기존 redemption sales의 `usage_fee` 합계를 사용했다.
- 기존 지급·상환 등록, 취소, 상세 및 작업 이력 API는 변경하지 않았다.

## DB 대조

개발 Docker PostgreSQL `cubici-postgres-dev`에서 개인정보 값을 출력하지 않고 읽기 전용 집계를 실행했다.

| 항목 | 값 |
|---|---:|
| 상환 MBID | 6건 |
| 계약 결합 누락 | 0건 |
| 회원 결합 누락 | 0건 |
| 계약 수수료 결합 누락 | 0건 |
| 서비스 수수료 합계 | 358,346원 |
| 최신 미상환금 합계 | 909,988원 |
| 활성 계약 상환 건 | 4건 |

## 변경 파일

- `admin-web/src/components/layout/AdminLayout.jsx`
- `admin-web/src/pages/RedemptionManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-09-redemption-management.spec.js`
- `admin-web/tests/e2e/redemption-management.spec.js`
- `admin-web/tests/e2e/admin-operational-flow-focused.spec.js`
- `admin-web/tests/e2e/admin-ui-focused.spec.js`
- `admin-web/tests/e2e/batch11-5-admin-moneybank-operation-smoke.spec.js`
- `service-api/src/cubici_service/redemptions/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/redemptions.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| Python compile | 통과 |
| admin production build | 통과, 73 modules |
| backend endpoint focused pytest | 1 passed, 75 deselected |
| 실제 repository 조회 | 통과, 6건 |
| SQL 직접 합계와 repository 합계 | 일치 |
| ADM-LV-09 PC/모바일 bundle smoke | 2 passed |
| 목록 검색·정렬·CSV | 통과 |
| MBID 상세·지급/상환 form·이력 노출 | 통과 |
| 모바일 body overflow | 없음 |
| 실제 지급·상환·취소 write E2E 재실행 | 미수행 |
| 운영 배포 | 미수행 |

로컬 preview 포트는 실행 도구의 background 프로세스 정리 제한으로 유지되지 않았다. 동일 production `dist`와 public 자원을 Playwright route로 제공하는 무서버 bundle smoke로 대체했으며, Docker DB/API repository 검증은 별도로 수행했다.

## 승인 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-09-REDEMPTION-MANAGEMENT/approved/ADM-LV-09-REDEMPTION-MANAGEMENT-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-09-REDEMPTION-MANAGEMENT/approved/ADM-LV-09-REDEMPTION-MANAGEMENT-MOBILE.png`
- PC SHA256: `FCCAAE228C21604A83F5BAF3ED537EB6C1EC87B1305C08733638EAF33AA906D4`
- 모바일 SHA256: `390349C52F3A0628FF6AC443D482DCF3A5E24F2BCCA1BE5A18BB6D1F5725B8E3`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 90%
- 승인본: `docs/reference/lv-ui/admin/ADM-LV-09-REDEMPTION-MANAGEMENT/approved`
- 다음 승인 단위: `ADM-LV-10 머니뱅크 운영 > 자금조달 관리`
