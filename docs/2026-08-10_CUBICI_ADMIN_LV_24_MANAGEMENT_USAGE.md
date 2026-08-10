# ADM-LV-24 머니뱅크 관리 > 이용상세

## 작업 범위

- 목록 Route: `/admin/moneybank/management/usageList`
- 상세 Route: `/admin/moneybank/management/usageDetail?mbid=...`
- 현재 관리자 shell 매핑: `머니뱅크 운영 > 이용 상세`
- React:
  - `admin-web/src/pages/ManagementUsagePage.jsx`
  - `admin-web/src/pages/ManagementUsageDetailPage.jsx`
- API:
  - `GET /v1/api/management/usage`
  - `GET /v1/api/management/usage/{mbid}`
- Legacy 기준:
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/moneybank/management/usageList.jsp`
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/moneybank/management/usageDetail.jsp`
- 직접 대응하는 LV 캡처는 없다. legacy JSP와 승인된 관리자 공통 shell을 우선 기준으로 사용했다.

## 기존 화면과 차이

기존 React 목록은 검색·목록·합계와 상세 route가 있었지만 legacy의 항목 선택이 빠졌고 엑셀 링크가 동작하지 않았다. 넓은 표는 브라우저 기본 스크롤에 의존해 좌우 이동이 명확하지 않았다. 상세 데이터와 4개 탭은 구현되어 있었지만 공통 LV section 구성이 약했다.

## 화면 복원

- 목록 검색, 보기기준, 상태 badge, 합계 bar와 pagination을 유지했다.
- legacy 고정 8개 항목과 선택 항목 구조를 복원했다.
- 지급율은 React/API에 존재하는 유효 항목이므로 선택 컬럼으로 보존했다.
- 전체 필터 결과를 UTF-8 BOM CSV로 내려받도록 구현했다.
- 15열 표에 버튼·range 방식의 명시적 가로 스크롤을 추가했다.
- 상세의 회원 정보와 탭별 내용을 남색 section title, 흰색 정보표로 통일했다.
- 회원정보는 modal table 의존성을 제거하고 PC 2열·모바일 1열의 독립 정보 grid로 재배치했다.
- 모바일은 상세 정보표를 1쌍씩 세로 배치하고 4개 탭을 2열로 배치했다.

## 기능과 산정 기준

- 목록 검색, 정렬, pagination, 합계는 기존 API를 그대로 사용한다.
- 상세는 회원, 쇼핑몰, 증빙, 계약 이력, 상환 이력을 기존 detail API에서 조회한다.
- Backend 코드와 DB schema는 변경하지 않았다.
- legacy 화면에 없던 상환이력 탭은 기존 React 기능이므로 삭제하지 않았다.
- dead state와 더 이상 사용하지 않는 인라인 상세 panel만 제거했다.

## 개발 DB 확인

개인정보와 개별 계약값을 출력하지 않고 Docker PostgreSQL에서 건수만 읽기 전용으로 확인했다.

| 항목 | 결과 |
|---|---:|
| 이용계약 | 7건 |
| 계약-회원 연결 | 7건 |
| 계약 쇼핑몰 | 12건 |
| 계약 증빙 | 6건 |
| 상환 이력 | 388건 |

## 검증 결과

| 검증 | 결과 |
|---|---|
| Docker DB preflight | `cubici-postgres-dev` healthy |
| Vite production build | 통과, 75 modules, 최종 6.19초 |
| management usage list/detail focused pytest | 2 passed, 1.29초 |
| ADM-LV-24 focused E2E | 2 passed, 최종 7.0초 |
| 목록 기능 | 검색 query, 항목 선택, 전체 CSV, 명시적 가로 스크롤 통과 |
| 상세 기능 | 4개 탭 전환, 목록 복귀, PC/모바일 통과 |
| 화면 확인 | 목록·상세 PC/모바일 body overflow 없음 |
| Git·배포 | 미수행 |

## 승인 이미지

| 파일 | SHA-256 |
|---|---|
| `ADM-LV-24-LIST-PC.png` | `ECF66A923CA07852099B73F715EE8DADE4E51D49794A0551916345BD37C18810` |
| `ADM-LV-24-LIST-MOBILE.png` | `CD91D0475480D7A7A11AD5D9318A40273DFC42A7B44C11CE401389AEF5C11F4D` |
| `ADM-LV-24-DETAIL-PC.png` | `BEF23AB1A17A11FE179A365D3E162413F2CF1D42C295ECC9CDD2DF19FD13DFFD` |
| `ADM-LV-24-DETAIL-MOBILE.png` | `BED7A8EB164C5EA9C4367B35490CFE67D895DC8B9FF26C8B884F2959D988FC5A` |

경로: `docs/reference/lv-ui/admin/ADM-LV-24-MANAGEMENT-USAGE/approved`

## 보수적 평가와 잔여

- 화면 복원율: 100%. legacy JSP 기준 구현과 PC·모바일 결과를 사용자가 승인했다.
- 내부 기능 구현율: 88%.
- 잔여: legacy 이용금액·상환잔액·PCS 대응값 검산, 실제 DB 대량 CSV 및 운영 인증 회귀, 운영 배포 검증.
- 엄격한 LV 직접 메뉴 24/24 승인을 마감하고 사용자·관리자 전체 회귀검증으로 전환한다.
