# D03 요금변경 관리 화면 복원 후보

## 범위

- Route: `/admin/cubici/manageMember/payment_tab2`
- legacy 기준: `cubici/manageMember/payment_tab2.jsp`
- React: `admin-web/src/pages/MemberChargeChangePage.jsx`
- 실제 개인정보를 사용하지 않고 검증용 가상 데이터로 렌더링했다.

## 보완

- 20열 표에 공통 좌우 버튼과 가로 슬라이더를 추가했다.
- PC 1920px과 모바일 390px에서 body overflow가 발생하지 않는다.
- 모바일 활성 탭 `요금변경 관리`는 두 번째 원래 위치를 유지한다.
- 표시용 상태 배지 축소와 구분해 환급 액션 버튼의 기존 크기와 동작을 유지했다.
- 환급 상세 조회와 환급 완료 동작을 focused E2E로 확인했다.

## 검증

| 항목 | 결과 |
|---|---|
| 관리자 production build | 통과, 75 modules |
| D03 focused Playwright | 2/2 통과, 7.7초 |
| 목록·집계·환급 상세·환급 완료 | 통과 |
| 모바일 좌우 버튼·슬라이더 | 이동·원복 통과 |
| 모바일 body overflow | 없음 |

## 후보 이미지

- `docs/reference/lv-ui/admin/ADM-D03-MEMBER-CHARGE-CHANGE/candidate/ADM-D03-MEMBER-CHARGE-CHANGE-PC.png`
- `docs/reference/lv-ui/admin/ADM-D03-MEMBER-CHARGE-CHANGE/candidate/ADM-D03-MEMBER-CHARGE-CHANGE-MOBILE.png`

## 승인

- 2026-08-11 사용자 승인 완료.
- 화면 복원율: 100%.
- 승인본: `docs/reference/lv-ui/admin/ADM-D03-MEMBER-CHARGE-CHANGE/approved`
- PC SHA-256: `981F4952A4D9D9CFC0AB10495B4EDEEF599679265CCBBE91EBAE6DADB756064E`
- 모바일 SHA-256: `9DFA0349CB4E9B0F7CAAC9D3DB6035B8B5F433F89C673E9C29938C2EC82C775F`
