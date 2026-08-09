# UC01 사용자 공통 Header 회귀 결과

기준일: 2026-08-09

## 작업 범위

- PC: 공개 메인, 로그인, 인증 메인, GNB 드롭다운
- 모바일: Header 닫힘 상태, 전체 메뉴 열기·닫기, 화면 크기 전환
- 경로: 직접 화면, 상세·파생 화면, `/m` legacy 별칭
- LV 기준: `240130_큐빅아이/header.html`과 사용자 승인 페이지 이미지
- Backend, DB schema, API contract 변경 없음

## 유지한 디자인

- 공개·인증 메인의 남색 Header와 서브·로그인 화면의 흰색 Header 유지
- 기존 승인된 로고, 메뉴 간격, 로그인·회원가입, 사용자명·로그아웃·마이페이지 배치 유지
- 모바일 60px Header의 로고, 사용자 아이콘, 전체 메뉴 아이콘 유지

## 수정한 기능

- 게시글·계약 상세 및 `/m` 별칭 경로에서도 올바른 상위 GNB가 활성화되도록 경로 판정 보완
- 모바일 전체 메뉴를 LV의 좌측 대메뉴·우측 세로 서브메뉴 구조로 복원
- 누락된 `블로그`를 legacy 운영 URL `https://blog.naver.com/cubici2020`으로 복원
- 모바일 메뉴 열림 상태에서 PC 폭으로 변경하면 메뉴와 `body.fixed` 상태를 정리
- 로그아웃 시 인증정보를 삭제하고 공개 메인 `/main`으로 이동
- 모바일 메뉴 버튼에 `aria-expanded`, `aria-controls`, 열기·닫기 레이블 추가

## 검증

- production build: 통과, 2.12초
- Playwright focused regression: 4/4 통과, 10.6초
- 검증 항목: PC 3개 인증 상태, GNB 5개와 블로그, 상세·파생 경로 활성화, 모바일 메뉴 가시성·세로 배치·overflow, 리사이즈 정리, 로그아웃 세션 삭제

## 승인 이미지

- PC 공개: `docs/reference/lv-ui/work/USR-COMMON-HEADER-PC-PUBLIC/approved/approved-react.png`
- PC 인증: `docs/reference/lv-ui/work/USR-COMMON-HEADER-PC-AUTH/approved/approved-react.png`
- PC GNB 열림: `docs/reference/lv-ui/work/USR-COMMON-HEADER-PC-OPEN/approved/approved-react.png`
- 모바일 닫힘: `docs/reference/lv-ui/work/USR-COMMON-HEADER-MOBILE-CLOSED/approved/approved-react.png`
- 모바일 전체 메뉴: `docs/reference/lv-ui/work/USR-COMMON-HEADER-MOBILE-DRAWER/approved/approved-react.png`

## 진행률

- UC01 화면 복원율: 100% (사용자 승인 완료)
- UC01 기능 구현율: 95% (운영 인증 회귀 잔여)
- 사용자 직접 화면 승인: 26/26

## 다음 단일 Batch

- UC02 Footer 전체 페이지 회귀 완료
- 다음 작업은 UC03 Mobile GNB/Menu 최종 검증
