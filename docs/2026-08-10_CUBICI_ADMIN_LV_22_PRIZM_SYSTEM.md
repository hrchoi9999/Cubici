# ADM-LV-22 환경설정 > Prism System

## 작업 범위

- Route: `/admin/cubici/adminPreference/prizmConfig`
- 파생 route 연결 확인: `/admin/cubici/adminPreference/prizmRawData`
- React: `admin-web/src/pages/PrizmConfigPage.jsx`
- Backend: `service-api/src/cubici_service/preferences/repository.py`
- Legacy 기준:
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/prizmConfig.jsp`
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/craConfig.jsp`
  - `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/prizmRawData.jsp`
- 직접 대응하는 LV 캡처는 없다. legacy JSP와 승인된 환경설정 공통 shell을 우선 기준으로 사용했다.

## 화면 복원

- `Prizm`, `CRA Index`, `RawData` 3개 탭을 복원했다.
- 차원 List, 평가지표, 세부지표 설정의 3단 선택 구조로 평면 목록을 교체했다.
- 세부지표 설정에는 지표 정의, 가중치, 5개 하한·상한 구간, 변경메모와 수정 기능을 배치했다.
- 종합 지표 현황과 지표 변경 이력관리 구역을 하단에 복원했다.
- PC와 모바일에서 넓은 종합 지표 표를 확인할 수 있도록 좌우 버튼과 슬라이더가 있는 명시적 가로 스크롤을 제공한다.
- 모바일에서는 3단 패널을 순차 배치하며 본문 전체의 가로 넘침이 발생하지 않는다.

## 기능과 API

- `GET /v1/api/preferences/prizm-config/items`
- `GET /v1/api/preferences/prizm-config/items/{division}/{subject_no}/{item_no}`
- `PUT /v1/api/preferences/prizm-config/items/{division}/{subject_no}/{item_no}`
- `GET /v1/api/preferences/prizm-config/update-records`

legacy 데이터는 첫 구간 하한과 마지막 구간 상한을 빈 값으로 저장해 개방 구간을 표현한다. 이를 미완성으로 오인하지 않도록 지표 정의가 없거나 가중치와 10개 구간값이 모두 없을 때만 미완성으로 판정하도록 API 집계를 정합화했다. 산식·가중치·구간값 자체는 변경하지 않았다.

## 개발 DB 확인

개별 산식과 개인정보를 출력하지 않고 집계만 읽기 전용으로 조회했다.

| 항목 | 결과 |
|---|---:|
| 전체 지표 | 26건 |
| Prizm | 15건 |
| CRA Index | 11건 |
| 수정된 기준의 미완성 | 0건 |
| 변경 이력 | 0건 |
| RawData 산식 | 0건 |

이번 batch에서는 개발 DB와 기존 PCS/PMS 관련 산식 값을 변경하지 않았다.

## 검증 결과

| 검증 | 결과 |
|---|---|
| Vite production build | 통과, 75 modules, 최종 4.85초 |
| Prism API focused pytest | 1 passed, 77 deselected |
| preferences compileall | 통과 |
| ADM-LV-22 및 기존 Prism focused E2E | 4 passed, 최종 10.0초 |
| 후보 이미지 직접 점검 | Prizm·CRA PC/모바일, body overflow 없음 |
| RawData route 연결 | 링크 경로 유지 확인 |
| Git·배포 | 미수행 |

## 승인 이미지

| 파일 | SHA-256 |
|---|---|
| `ADM-LV-22-PRIZM-PC.png` | `17AB6CAA118A4B73E9DE484BDB7191CB12AD3BD245877F957386139ED61EEE7B` |
| `ADM-LV-22-PRIZM-MOBILE.png` | `8116655914D3AD2AE106649C8660B17065478999A1B3D895FB5E862755264917` |
| `ADM-LV-22-CRA-PC.png` | `FEB9B59231BE8C67B43DFD97E798BE4C7A9061089AD046EC1C27CCE1C2E7EF51` |
| `ADM-LV-22-CRA-MOBILE.png` | `2CCDEF51DACEBC63C886A7B2AB9A0EBD1220D280D111DFD14EF67997CA16B9D9` |

경로: `docs/reference/lv-ui/admin/ADM-LV-22-PRIZM-SYSTEM/approved`

## 보수적 평가와 잔여

- 화면 복원율: 100%. 직접 LV 캡처는 없지만 legacy JSP 기준 후보를 사용자가 승인했다.
- 내부 기능 구현율: 92%.
- 개발 DB 수정·API 재조회·변경이력 생성·원복 회귀는 `2026-08-11_CUBICI_A24_PRISM_DB_WRITE_E2E.md` 기준으로 통과했다.
- 잔여: Excel 기능 복원, 운영 배포 검증.
- PCS/PMS와 RawData 산식 검산은 사용자 결정에 따라 운영 중 지표관리 단계로 분리했다.
- 다음 승인 단위: `ADM-LV-23 통합정보 > 머니뱅크`.
