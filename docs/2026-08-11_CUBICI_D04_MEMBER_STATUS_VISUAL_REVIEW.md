# D04 회원상세 화면 복원 후보

## 범위

- Route: `/admin/cubici/manageMember/userstatus?code={user_no}`
- legacy 기준: `manageMember/member_status.jsp`, `cmmn/userInfo.jsp`, `paymentInfo.jsp`, `mbInfo.jsp`, `documentInfo.jsp`
- React: `admin-web/src/pages/MemberStatusPage.jsx`
- 실제 개인정보와 운영 DB를 사용하지 않고 검증용 가상 데이터로 렌더링했다.

## 보완

- legacy 내부 탭 순서인 `기본정보`, `결제현황`, `머니뱅크`, `추가서류` 4개를 복원했다.
- 운영 쇼핑몰은 기본정보 탭, 최근 상환 이력은 머니뱅크 탭 안으로 재배치했다.
- 회원 정보는 PC 4열, 모바일 1열 배치로 표시한다.
- 각 표에 공통 좌우 버튼과 가로 슬라이더를 적용했다.
- 내부 탭 전환에도 회원 상세 API 조회 결과를 그대로 사용한다.

## 검증

| 항목 | 결과 |
|---|---|
| 관리자 production build | 통과, 75 modules |
| D04 focused Playwright | 2/2 통과, 9.6초 |
| legacy 4탭 순서·활성 위치 | PC·모바일 통과 |
| 기본·결제·머니뱅크·추가서류 데이터 표시 | 통과 |
| 모바일 좌우 버튼·슬라이더 | 이동·원복 통과 |
| PC·모바일 body overflow | 없음 |

## 후보 이미지

- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-BASIC-PC.png`
- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-PAYMENT-PC.png`
- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-MONEYBANK-PC.png`
- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-DOCUMENTS-PC.png`
- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-BASIC-MOBILE.png`
- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-PAYMENT-MOBILE.png`
- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-MONEYBANK-MOBILE.png`
- `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate/ADM-D04-MEMBER-STATUS-DOCUMENTS-MOBILE.png`

## 기능 경계

- 기존 상세 API 조회와 화면 표시 기능은 유지했다.
- legacy 결제 원본 테이블, 회원평가 저장, 증빙 파일 다운로드는 기능 추가개발 잔여다.

## 승인

- 2026-08-11 사용자 승인 완료.
- 화면 복원율: 100%.
- 승인본: `docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/approved`
- 기본정보 PC: `4738103EC9AC20A573737E726A3CDB2EFE3A3B635E9A05E70D8DB2F1EB3D0C5B`
- 기본정보 모바일: `A4FACF275565EC4BD02C1EC60C87B87674966EBAAECE78F1F54B629F8A45A637`
- 결제현황 PC: `D6EA4CF650C7BD33A7FF7447976EA1B4E3B3168D927AB5DD1AE5895CD7C41875`
- 결제현황 모바일: `43FCA82B39141E08C0385D42312C59DD6EF765FB78E4668F888077B8938BEEB0`
- 머니뱅크 PC: `A47EFD454D73A8F14031072E3009434CBF86223A01E7CAA7418F4A966163B458`
- 머니뱅크 모바일: `6CC170C0219F499EDC8F965813D7326D04E6CF73150C746D500262584FC5E28B`
- 추가서류 PC: `6C2E454D9419F4130C5B2AC2254046303730428A0FC0929E144EB1391DC2ECBE`
- 추가서류 모바일: `D7BF5D841A2DACB6AB2D566249173CB6F2B0BBDCB991D0BFEB745EA7C91CB615`
