# Cubici 관리자 ADM-LV-03 결제 관리 복원

## 작업 범위

- 화면: `쇼핑몰 통합 > 결제 관리 > 결제 현황`
- route: `/admin/cubici/manageMember/payment_tab1`
- 승인 단위: ADM-LV-03 한 화면
- Backend API와 DB schema는 변경하지 않았다.

## LV 기준

- 직접 화면 캡처는 남아 있지 않아 Legacy JSP 구조를 1차 기준으로 사용했다.
- 구조 기준: `D:\Cubici\src\main\webapp\WEB-INF\jsp\egovframework\azon\admin\cubici\manageMember\payment_tab1.jsp`
- 색상·간격·탭·표 기준: `docs/reference/lv-ui/admin/reference/관리자화면01.png`부터 `관리자화면10.png`
- 공통 헤더·좌측 메뉴는 승인된 ADM-LV-00을 유지했다.

## 적용 결과

- `결제 현황 / 요금변경 관리` 2개 LV 탭을 유지했다.
- 기준일, 회원명, 회사명, 회원ID, 회원구분, 결제 시작일·종료일 검색 구조를 복원했다.
- 보기기준, 엑셀 호환 CSV 다운로드, 항목 선택 기능을 구현했다.
- Legacy 고정컬럼 성격을 유지하면서 PC·모바일에서는 표 내부 가로 스크롤로 처리했다.
- 결제건수, 결제금액, 결제수수료, 부가가치세, 순수익을 남색 합계바로 복원했다.
- 기존 이전·현재 페이지·다음 버튼 높이와 색상 규칙을 유지했다.
- 기존 `/v1/api/management/member-payments` 조회·검색·합계 API contract를 변경하지 않았다.

## 변경 파일

- `admin-web/src/pages/MemberPaymentPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/member-payment-management.spec.js`
- `admin-web/tests/e2e/adm-lv-03-member-payment.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend member payment focused pytest | 1 passed, 74 deselected |
| ADM-LV-03 PC·모바일·DB 동일 빈 상태 Playwright | 3 passed |
| 기존 결제 관리 focused regression | 1 passed |
| 모바일 body overflow | 없음, 표 내부 스크롤 |
| PC·모바일 후보 이미지 | 생성 완료 |

첫 Playwright 묶음 실행은 테스트용 build의 관리자 이메일 환경값 누락으로 로그인 화면이 표시되어 3건 실패했다. 테스트용 build에 mock 관리자 이메일을 명시하고 파일별로 재실행해 ADM-LV-03 `2/2`, 기존 결제 회귀 `1/1`을 통과했다.

## DB 재검증

- 최초 `docker ps`는 Codex 격리 사용자의 Docker pipe 접근이 거부되어 실패했다. 사용자 승인 권한으로 재확인한 결과 `cubici-postgres-dev`는 healthy 상태였다.
- 개발 DB 컨테이너 내부 읽기 전용 SQL 결과는 결제 전체 0건, 결제완료 0건, 결제금액·수수료·부가세·순수익 모두 0원이다.
- 위 실제 DB 결과와 동일한 API payload로 React 빈 상태, 합계 0, 다운로드 비활성 상태를 focused Playwright에서 확인했다.
- 로컬 Python API 프로세스는 격리 환경에 DB 비밀번호가 전달되지 않아 실제 API 통합 E2E까지는 실행하지 않았다. 비밀번호를 열람하거나 복사하지 않았다.
- 2026-08-09 관리자 33개 화면 운영 데이터 회귀의 결제 원본 0건, API/UI 정상 빈 상태와 이번 개발 DB 결과가 일치한다.

## 승인 이미지

- PC: `docs/reference/lv-ui/admin/ADM-LV-03-MEMBER-PAYMENT/approved/ADM-LV-03-MEMBER-PAYMENT-PC.png`
- 모바일: `docs/reference/lv-ui/admin/ADM-LV-03-MEMBER-PAYMENT/approved/ADM-LV-03-MEMBER-PAYMENT-MOBILE.png`

## 보수 진행률

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 78%
- 운영 배포: 미수행
- 다음 단계: ADM-LV-04 `머니뱅크 운영 > 통합 현황`
