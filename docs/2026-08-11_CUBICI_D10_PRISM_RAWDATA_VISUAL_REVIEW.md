# D10 Prism RawData 화면 복원 후보

## 범위

- Route: `/admin/cubici/adminPreference/prizmRawData`
- legacy 기준: `adminPreference/prizmRawData.jsp`
- React: `admin-web/src/pages/RawDataConfigPage.jsx`
- 승인된 ADM-LV-22 Prism System 공통 탭과 선택 패널 스타일을 기준으로 구성했다.
- 운영 DB나 실제 RawData를 사용하지 않고 검증용 가상 데이터로 렌더링했다.

## 보완

- `Prizm`, `CRA Index`, `RawData` 3개 탭의 공통 위치와 색상을 맞췄다.
- legacy의 테이블·시작일·종료일·Excel 검색행을 복원했다.
- 컬럼 선택, 타입 선택, 계산식 선택의 3단 작업 흐름을 복원했다.
- 계산식 등록·수정·삭제 폼과 안전한 Preview 기능을 유지했다.
- Preview 표에 공통 좌우 버튼과 가로 슬라이더를 적용했다.
- 모바일에서는 3단 패널을 원래 순서대로 세로 배치한다.

## 검증

| 항목 | 결과 |
|---|---|
| 관리자 production build | 통과, 75 modules |
| D10 focused Playwright | 최종 2/2 통과, 6.7초 |
| PC·모바일 RawData 세 번째 탭 위치 | 통과 |
| 테이블·컬럼·타입·계산식 표시 | 통과 |
| 계산식 수정·Preview | 통과 |
| 모바일 Preview 좌우 이동·원복 | 통과 |
| PC·모바일 body overflow | 없음 |

## 후보 이미지

- `docs/reference/lv-ui/admin/ADM-D10-PRISM-RAWDATA/candidate/ADM-D10-PRISM-RAWDATA-PC.png`
- `docs/reference/lv-ui/admin/ADM-D10-PRISM-RAWDATA/candidate/ADM-D10-PRISM-RAWDATA-MOBILE.png`

## 기능 경계

- Excel 다운로드는 권한·감사로그·민감정보 반출 정책 확정 전까지 비활성 상태다.
- RawData legacy 산식 검산과 운영 산식 적재는 별도 기능 작업이다.
- 이번 Batch에서는 backend와 산식을 변경하지 않았다.

## 승인

- 2026-08-11 사용자 승인 완료.
- 화면 복원율: 100%.
- 승인본: `docs/reference/lv-ui/admin/ADM-D10-PRISM-RAWDATA/approved`
- M5에서 승인된 `환경설정 > 머니뱅크 관리` 좌측 메뉴 복원을 PC 승인본에 반영했다.
- PC SHA-256: `27EE2EB9611B483BFE0330EFD4A25F5D796EE3A963D13BE5AA36E7EBF4F42012`
- 모바일 SHA-256: `DFF7BBCACCB86863FB707D103ECAE608E768E96DE3AA36770465B4E6914A8D29`
