# D02 휴면/해지 화면 복원 후보

## 범위

- Route: `/admin/cubici/manageMember/member_tab3`
- legacy 기준: `cubici/manageMember/member_tab3.jsp`
- React: `admin-web/src/pages/MemberWithdrawalPage.jsx`
- 실제 개인정보를 사용하지 않고 검증용 가상 데이터로 렌더링했다.

## 보완

- 12열 표에 공통 좌우 버튼과 가로 슬라이더를 추가했다.
- PC 1920px과 모바일 390px에서 body overflow가 발생하지 않는다.
- 모바일 활성 탭 `휴면/해지`는 세 번째 원래 위치를 유지한다.
- 해지, 해지 신청, 휴면 후보의 상태 색상과 집계값을 함께 표시한다.

## 검증

| 항목 | 결과 |
|---|---|
| 관리자 production build | 통과, 75 modules |
| D02 focused Playwright | 2/2 통과, 7.7초 |
| 검색·상태 집계·행 표시 | 통과 |
| 모바일 좌우 버튼·슬라이더 | 이동·원복 통과 |
| 모바일 body overflow | 없음 |

## 후보 이미지

- `docs/reference/lv-ui/admin/ADM-D02-MEMBER-WITHDRAWAL/candidate/ADM-D02-MEMBER-WITHDRAWAL-PC.png`
- `docs/reference/lv-ui/admin/ADM-D02-MEMBER-WITHDRAWAL/candidate/ADM-D02-MEMBER-WITHDRAWAL-MOBILE.png`

## 승인

- 2026-08-11 사용자 승인 완료.
- 화면 복원율: 100%.
- 승인본: `docs/reference/lv-ui/admin/ADM-D02-MEMBER-WITHDRAWAL/approved`
- PC SHA-256: `A69938ADB6D31A960667740FF17E8A047E0256C62A1DDCD695060B81BB9E7DE4`
- 모바일 SHA-256: `51708BC92E3A65D722C4CA09595000F4645E95B70CFA4460269F20F1FE72AAFE`
