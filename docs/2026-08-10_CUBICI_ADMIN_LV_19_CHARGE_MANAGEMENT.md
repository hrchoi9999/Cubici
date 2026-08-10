# Cubici 관리자 ADM-LV-19 요금제 관리 복원

## 작업 범위

- 화면: `환경설정 > 요금제 관리`
- route: `/admin/cubici/adminPreference/manageCharge`
- 직접 LV 기준: 전용 캡처 없음
- legacy 구조 기준: `manageCharge.jsp`, `manageChargeModal.jsp`
- 보조 시각 기준: `docs/reference/lv-ui/admin/reference/관리자화면10.png`, 승인된 환경설정 공통 shell

## LV 대조와 적용

- 현재 React 13열 목록을 legacy의 상태, 등록 일자, 요금제, 기준금액, 제공 ID 수, 거래 건수, 상세 보기 7열로 복원했다.
- legacy 검색 조건인 요금제 유형, 운영상태, 요금제명과 별도 보기설정을 복원했다.
- 밝은 파란색 표 헤더, 남색 전체·운영·종료·현재 페이지 집계와 공통 페이지 번호를 적용했다.
- 모바일 목록은 열을 축소하지 않고 좌우 버튼·슬라이더가 있는 명시적 가로 스크롤을 제공한다.
- 요금코드, 유형, 시작·종료일, ID·거래·상품 수, 금액, 기간과 설명은 등록·수정 상세 영역에 보존했다.
- 등록·수정·삭제 API 흐름은 유지하고, legacy 요금제 유형 검색을 위한 `charge_type` API 필터를 추가했다.

## DB/API 대조

- 목록: `GET /v1/api/preferences/charges`
- 상세: `GET /v1/api/preferences/charges/{charge_code}`
- 등록: `POST /v1/api/preferences/charges`
- 수정: `PUT /v1/api/preferences/charges/{charge_code}`
- 삭제: `DELETE /v1/api/preferences/charges/{charge_code}`
- Docker 개발 DB `charge`: 전체 5건, 운영 1건, 종료 4건
- 유형별: 기본요금(B) 4건, 무료요금(F) 1건
- 실 DB 데이터는 읽기 전용으로 대조했으며 이번 batch에서 생성·수정·삭제하지 않았다.

## 변경 파일

- `admin-web/src/pages/ChargeManagementPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-lv-19-charge-management.spec.js`
- `admin-web/tests/e2e/charge-management.spec.js`
- `service-api/src/cubici_service/preferences/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/preferences.py`
- `service-api/tests/test_domain_routes.py`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| charge API contract pytest | 1 passed |
| Python compileall | 통과 |
| 목록·상세·유형검색·CRUD focused E2E | 최종 4 passed, 8.4초 |
| Docker 개발 DB 읽기 전용 대조 | 통과, 5건 |
| PC/모바일 body overflow | 없음 |
| 모바일 목록 전용 가로 스크롤 | 통과 |
| 운영 배포 | 미수행 |

## 승인 이미지

- 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-19-CHARGE-MANAGEMENT/approved/ADM-LV-19-LIST-PC.png`
- 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-19-CHARGE-MANAGEMENT/approved/ADM-LV-19-LIST-MOBILE.png`
- 상세 PC: `docs/reference/lv-ui/admin/ADM-LV-19-CHARGE-MANAGEMENT/approved/ADM-LV-19-DETAIL-PC.png`
- 상세 모바일: `docs/reference/lv-ui/admin/ADM-LV-19-CHARGE-MANAGEMENT/approved/ADM-LV-19-DETAIL-MOBILE.png`

## 후보 SHA256

- 목록 PC: `22515A28233DBDD9A0F36A92C2FBB15D61846EBC5E39E1EC1A5A323002A32077`
- 목록 모바일: `8773601097B0A95A6D2EBAEF0A50BC057FEA4AE8E7E8E6DEA274BA5A5E8F626B`
- 상세 PC: `05898C9EB8C50473A09AB162444A18652C9CF9CE01FA622A657C4032260345A8`
- 상세 모바일: `869D97D743ED2A680B952E49353CC4890B1BA67B0C99FBAF56D2A1B3F6062630`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 78%
- 전용 LV 캡처가 없어 legacy JSP 구조와 같은 환경설정 계열 화면을 조합해 복원했다.
- 실제 DB 등록·수정·삭제 E2E와 사용 중인 요금제 삭제 제한 정책 검증이 남았다.
- 운영 인증환경·실데이터 화면 회귀와 운영 배포는 수행하지 않았다.
- 다음 승인 단위: `ADM-LV-20 환경설정 > 연계코드 관리`
