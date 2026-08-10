# Cubici 관리자 ADM-LV-18 관리자 등록 복원

## 작업 범위

- 화면: `환경설정 > 관리자 등록`
- route: `/admin/cubici/adminPreference/adminRegister_tab1`
- 직접 LV 기준: 전용 캡처 없음
- legacy 구조 기준: `adminRegister_tab1.jsp`
- 보조 시각 기준: `docs/reference/lv-ui/admin/reference/관리자화면10.png`, 승인된 관리자 공통 shell

## LV 대조와 적용

- legacy 목록의 번호, 회사명, 부서명, 이름, 핸드폰, 이메일, 신청일자, 승인일자, 접근권한, 상태, 수정 11열을 복원했다.
- 검색 영역, 밝은 파란색 목록 헤더, 남색 집계·페이지 영역을 환경설정 화면의 공통 형식으로 적용했다.
- 권한범위와 Audit 정보는 넓은 목록에 추가하지 않고 승인·수정 상세 영역으로 이동했다.
- 신청 등록, 아이디 중복확인, 승인, 수정, 해지 기능은 기존 React/API 흐름을 유지했다.
- 모바일은 검색 조건과 상세 폼을 한 열로 재배치하고, 넓은 목록에 좌우 버튼·슬라이더가 있는 명시적 가로 스크롤을 적용했다.

## DB/API 대조

- 목록: `GET /v1/api/preferences/admin-accounts`
- 상세: `GET /v1/api/preferences/admin-accounts/{id}`
- 아이디 확인: `GET /v1/api/preferences/admin-accounts/id-check`
- 신청: `POST /v1/api/preferences/admin-accounts/request`
- 승인: `POST /v1/api/preferences/admin-accounts/{id}/approve`
- 수정: `PUT /v1/api/preferences/admin-accounts/{id}`
- 해지: `DELETE /v1/api/preferences/admin-accounts/{id}`
- Docker 개발 DB 현재 집계: 전체 0건, 승인대기 0건, 승인완료 0건
- 이전 실 DB CRUD E2E 근거는 유지되지만 이번 batch의 현재 DB에는 표시할 실데이터가 없어 재검증하지 않았다.

## 변경 파일

- `admin-web/src/pages/AdminAccountManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-18-admin-account.spec.js`
- `admin-web/tests/e2e/admin-account-management.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| admin-account API contract pytest | 2 passed |
| 목록·승인 상세·신청·승인·수정·해지 focused E2E | 4 passed, 8.8초 |
| 모바일 body 가로 overflow | 없음 |
| 목록 전용 가로 스크롤바·좌우 버튼·드래그 동기화 | 통과 |
| Docker 개발 DB 읽기 전용 집계 | 통과, 0건 |
| 운영 배포 | 미수행 |

## 승인 이미지

- 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-18-ADMIN-ACCOUNT/approved/ADM-LV-18-LIST-PC.png`
- 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-18-ADMIN-ACCOUNT/approved/ADM-LV-18-LIST-MOBILE.png`
- 승인 상세 PC: `docs/reference/lv-ui/admin/ADM-LV-18-ADMIN-ACCOUNT/approved/ADM-LV-18-APPROVAL-PC.png`
- 승인 상세 모바일: `docs/reference/lv-ui/admin/ADM-LV-18-ADMIN-ACCOUNT/approved/ADM-LV-18-APPROVAL-MOBILE.png`

## 후보 SHA256

- 목록 PC: `DA31B743B6833D5259615E0F2A76F936FFFFD0036391BAFC741510C09FAACCF3`
- 목록 모바일: `4B78FD8DF7A46297853AA587420619D254A945B7D97FAD99962CAEDFC4F8FFC8`
- 승인 상세 PC: `6600634E001CFD7B7CA4F4796E779398687EE2B468A6AF84DE1402C338420F05`
- 승인 상세 모바일: `7009974A6E83B844D749C0A5FE42C8B3427D9D8AE5547A21D3506121AF99C414`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 82%
- 전용 LV 캡처가 없어 legacy JSP 구조와 같은 환경설정 계열 화면을 조합해 복원했다.
- 현재 개발 DB가 0건이므로 실제 populated 목록·상세의 DB 화면 회귀가 남았다.
- 접근권한 탭의 legacy 필드·역할 매핑 최종 대조가 남았다.
- 다음 승인 단위: `ADM-LV-19 환경설정 > 요금제 관리`
