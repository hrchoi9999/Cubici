# D01 회원정보 화면 복원 후보

## 범위

- Route: `/admin/cubici/manageMember/member_tab2`
- legacy 기준: `cubici/manageMember/member_tab2.jsp`
- React: `admin-web/src/pages/MemberInfoPage.jsx`
- 실제 개인정보를 사용하지 않고 검증용 가상 데이터로 렌더링했다.

## 확인과 보완

- 최초 후보에서 PC 우측 열과 모바일 회원ID 이후 열이 잘렸다.
- 회원정보 표에 공통 좌우 버튼과 가로 슬라이더를 추가했다.
- PC 1920px에서는 9개 열을 한 화면에 표시한다.
- 모바일 390px에서는 body overflow 없이 표 내부만 좌우 이동한다.
- 활성 탭 `회원 정보`는 PC·모바일 모두 세 탭 중 원래 두 번째 위치를 유지한다.

## 검증

| 항목 | 결과 |
|---|---|
| 관리자 production build | 통과, 75 modules |
| D01 focused Playwright | 2/2 통과, 7.4초 |
| 검색·집계·행 표시 | 통과 |
| 모바일 좌우 버튼·슬라이더 | 이동·원복 통과 |
| 모바일 body overflow | 없음 |

## 후보 이미지

- `docs/reference/lv-ui/admin/ADM-D01-MEMBER-INFO/candidate/ADM-D01-MEMBER-INFO-PC.png`
- `docs/reference/lv-ui/admin/ADM-D01-MEMBER-INFO/candidate/ADM-D01-MEMBER-INFO-MOBILE.png`

## 승인

- 2026-08-11 사용자 승인 완료.
- 화면 복원율: 100%.
- 승인본: `docs/reference/lv-ui/admin/ADM-D01-MEMBER-INFO/approved`
- 전역 상태 배지 10% 축소를 반영해 승인 이미지를 재생성했다.
- PC SHA-256: `D81484DA5805BA1A59149AFAA7E62BB5DEE14ADF5D2CA11BB315511C73FA198D`
- 모바일 SHA-256: `61550B9955204D21140F9B2AE95EE3722C8925040380F8C758EFC9FA32606409`
