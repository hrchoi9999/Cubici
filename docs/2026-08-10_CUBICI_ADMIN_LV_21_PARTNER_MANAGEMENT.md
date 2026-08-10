# ADM-LV-21 환경설정 > 협력사 관리

## 작업 범위

- Route: `/admin/cubici/adminPreference/managePartner`
- React: `admin-web/src/pages/PartnerManagementPage.jsx`
- Backend: `service-api/src/cubici_service/preferences/repository.py`
- Legacy 기준:
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/managePartner.jsp`
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/managePartnerModal.jsp`
- 직접 대응하는 LV 캡처는 없다. legacy JSP와 승인된 환경설정 공통 shell을 우선 기준으로 사용했다.

## 화면 복원

- legacy 10개 leaf column과 `담당자` 이름·전화 2단 그룹 헤더를 복원했다.
- 회사명·운영상태·대표자·협력사코드 검색, 보기기준과 기업 추가를 상단 검색 영역에 배치했다.
- 전체·은행·B2B도매·마케팅·금융·제조·기타 집계와 공통 페이지 번호를 목록 하단에 적용했다.
- PC와 모바일에서 넓은 표를 확인할 수 있도록 좌우 버튼과 슬라이더가 있는 명시적 가로 스크롤을 제공한다.
- 상세를 기본정보·연락처 정보·연계내역으로 구분하고 등록·수정·삭제 및 중복검사 흐름을 유지했다.
- 업종 코드는 `은행`, `B2B도매`, `마케팅`, `금융`, `제조`, `기타`, `큐빅아이` 한글명으로 표시한다.

## 기능과 API

- `GET /v1/api/preferences/partners`
- `GET /v1/api/preferences/partners/id-check`
- `GET /v1/api/preferences/partners/code-check`
- `GET /v1/api/preferences/partners/{partner_id}`
- `POST /v1/api/preferences/partners`
- `PUT /v1/api/preferences/partners/{partner_id}`
- `DELETE /v1/api/preferences/partners/{partner_id}`

사업자번호 중복검사 전에 legacy와 같은 10자리 checksum 검사를 React에 추가했다. 책임자 `manager_type=00`과 담당자 `manager_type=01` 저장 구조 및 기존 CRUD payload는 변경하지 않았다.

## 개발 DB 확인

개인정보를 출력하지 않고 집계만 조회했다.

| 항목 | 결과 |
|---|---:|
| 협력사 | 전체 4 / 운영 4 / 종료 0건 |
| 업종 | BB(B2B도매) 1 / CB(큐빅아이) 1 / FI(금융) 2건 |
| 담당자 지정 | 1건 |
| 담당자 미지정 | 3건 |
| 주소 누락 | 0건 |

이번 batch에서는 개발 DB 데이터를 변경하지 않았다.

## 검증 결과

| 검증 | 결과 |
|---|---|
| Vite production build | 통과, 75 modules, 최종 6.18초 |
| partner API focused pytest | 1 passed, 77 deselected |
| preferences compileall | 통과 |
| ADM-LV-21 및 기존 partner focused E2E | 4 passed, 최종 9.5초 |
| 사업자번호 checksum E2E | 오류 번호 차단·유효 번호 중복검사 통과 |
| 후보 이미지 직접 점검 | PC/모바일 목록·상세, body overflow 없음 |
| Git·배포 | 미수행 |

## 승인 이미지

| 파일 | SHA-256 |
|---|---|
| `ADM-LV-21-LIST-PC.png` | `D404852B0D5B76FDCE6003D7B93C7DF675856C4CFA5D5450055E30A6C18401D4` |
| `ADM-LV-21-LIST-MOBILE.png` | `DB313649FB1E6757E11581884C52DD62F0B01D573E1CD813325C37A8E6A17AF3` |
| `ADM-LV-21-DETAIL-PC.png` | `735EFBD837E8AC758DCD791E8B3FF9A9EC9F9A77C23312B15E864ED8627A0AF8` |
| `ADM-LV-21-DETAIL-MOBILE.png` | `73E37918FCADC7D7ABC66B9A761FB7A6D8E6716564646010320D322FCBB8FA6F` |

경로: `docs/reference/lv-ui/admin/ADM-LV-21-PARTNER-MANAGEMENT/approved`

## 보수적 평가와 잔여

- 화면 복원율: 100%. 직접 LV 캡처는 없지만 legacy JSP와 승인 후보를 사용자가 확인했다.
- 내부 기능 구현율: 86%.
- 잔여: 외부 주소검색, API 직접호출 사업자번호 checksum 강제, 실 DB 등록·수정·삭제 전체 회귀, 운영 배포 검증.
- 다음 승인 단위: `ADM-LV-22 환경설정 > Prism System`.
