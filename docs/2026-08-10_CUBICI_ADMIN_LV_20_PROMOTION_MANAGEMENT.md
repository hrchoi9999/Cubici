# ADM-LV-20 환경설정 > 연계코드 관리

## 작업 범위

- Route: `/admin/cubici/adminPreference/managePromotion`
- React: `admin-web/src/pages/PromotionManagementPage.jsx`
- Backend: `service-api/src/cubici_service/preferences/repository.py`
- Legacy 기준:
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/managePromotion.jsp`
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/managePromotionModal.jsp`
- 직접 대응하는 LV 캡처는 없다. legacy JSP와 승인된 환경설정 공통 shell을 우선 기준으로 사용했다.

## 화면 복원

- legacy 13개 leaf column과 `혜택조건`, `무료기간` 2단 그룹 헤더를 복원했다.
- 연계코드·운영상태·협력사 검색과 보기기준, 연계코드 추가를 상단 검색 영역에 배치했다.
- 전체·운영·종료·현재 페이지 집계와 공통 페이지 번호 형식을 적용했다.
- PC와 모바일에서 넓은 표를 확인할 수 있도록 좌우 버튼과 슬라이더가 있는 명시적 가로 스크롤을 제공한다.
- 상세 편집 필드와 등록·수정·삭제 흐름은 목록 아래 LV 상세 패널에 보존했다.

## API와 DB 호환

- `GET /v1/api/preferences/promotions`
- `GET /v1/api/preferences/promotions/options`
- `GET /v1/api/preferences/promotions/{promo_code}`
- `POST /v1/api/preferences/promotions`
- `PUT /v1/api/preferences/promotions/{promo_code}`
- `DELETE /v1/api/preferences/promotions/{promo_code}`

개발 DB에는 프로모션 1건이 있고 `promotion_charge` 연결행은 0건이다. 기존 `promotion.charges`의 `B0101,B0301,B0601`을 fallback으로 읽어 각각 `1개월, 3개월, 6개월` 요금제로 반환하도록 repository를 보완했다. 등록·수정 시에는 기존대로 CSV와 관계 테이블을 함께 기록한다.

사용자 승인에 따라 `22NCUBI01`의 종료일을 기존 `2025-06-02`에서 3년 연장한 `2028-06-02`로 변경했다. 변경 후 상태 `Y`와 종료일은 현재일 기준 일치하며, 개발 DB의 `상태 Y + 종료일 경과` 데이터는 0건이다.

## 검증 결과

| 검증 | 결과 |
|---|---|
| Vite production build | 통과, 75 modules, 6.41초 |
| promotion API focused pytest | 1 passed, 77 deselected |
| preferences compileall | 통과 |
| ADM-LV-20 및 기존 promotion focused E2E | 4 passed, 9.0초 |
| Docker DB read-only fallback SQL | 코드·요금제명 3건 정상 복원 |
| 프로모션 종료일 정합화 | 2025-06-02 -> 2028-06-02, 1건 수정 |
| 운영상태·종료일 불일치 재조회 | 0건 |
| 후보 이미지 직접 점검 | PC/모바일 목록·상세, body overflow 없음 |
| Git·배포 | 미수행 |

## 승인 이미지

| 파일 | SHA-256 |
|---|---|
| `ADM-LV-20-LIST-PC.png` | `FBB2EA890D19638E67BE35CAEFE626CC3A7FAE7B465D82B4DF83E3E14B7F8054` |
| `ADM-LV-20-LIST-MOBILE.png` | `04ED6DEF8D900D12A6F76E1E2647D77D1B80FC8E4D81EA98D2BD7ED890D9C3E9` |
| `ADM-LV-20-DETAIL-PC.png` | `5A207D3B3CC4E467933EF05B87BD864DC3073ED18E37A2B9759F9250C212C819` |
| `ADM-LV-20-DETAIL-MOBILE.png` | `E7627A3D24353C856BC12E56AA9EE5068DD9DE2DA0315C58925F0C94AD0EB6A6` |

경로: `docs/reference/lv-ui/admin/ADM-LV-20-PROMOTION-MANAGEMENT/approved`

## 보수적 평가와 잔여

- 화면 복원율: 100%. 직접 LV 캡처는 없지만 legacy JSP와 승인 후보를 사용자가 확인했다.
- 내부 기능 구현율: 82%.
- 잔여: 실 DB 등록·수정·삭제 전체 회귀, 운영 배포 검증.
- 다음 승인 단위: `ADM-LV-21 환경설정 > 협력사 관리`.
