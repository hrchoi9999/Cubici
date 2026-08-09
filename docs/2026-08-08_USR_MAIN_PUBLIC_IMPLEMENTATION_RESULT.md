# USR-MAIN-PUBLIC 구현 결과

작업일: 2026-08-08

## 화면 범위

- PC 비로그인 메인: `USR-MAIN-PUBLIC-PC`
- 모바일 비로그인 메인: `USR-MAIN-PUBLIC-MOBILE`
- React route: `/`, `/main` public state

## 기준 자료

- PC: `docs/reference/lv-ui/work/USR-MAIN-PUBLIC-PC/reference/pc_index.png`
- 모바일: `docs/reference/lv-ui/work/USR-MAIN-PUBLIC-MOBILE/reference/00_mobile_로그아웃.jpg`
- 구조/동작: `240130_큐빅아이/index.html`
- `00_main(최종).jpg`는 로그인 후 화면이므로 U01 자료로 분류한다.

## 반영 내용

- PC 헤더를 LV 남색 메인 헤더와 흰색 로고/메뉴로 복원했다.
- PC 4컷 자동 슬라이드, 좌우 이동, 페이지 선택, 터치 스와이프를 유지했다.
- PC 주요 서비스 4개 카드와 사용자 승인 푸터를 유지했다.
- 모바일 상단 4개 서비스 탭, 소개 비주얼, 페이지 표시/정지 UI를 복원했다.
- 모바일 로그인 카드 폭, 입력칸, 버튼, 여백을 LV 캡처에 맞게 조정했다.
- 모바일 비로그인 화면에서는 PC용 주요 서비스 카드 본문을 숨기고 하단 메뉴를 한 화면에 배치했다.

## 승인 예외

- PC 헤더의 회원가입 링크는 이전 사용자 요청에 따라 유지한다.
- 푸터의 회사 정보, 색상, 축소 높이는 최근 사용자 승인본을 유지한다.

## 후보 이미지

- PC: `docs/reference/lv-ui/work/USR-MAIN-PUBLIC-PC/candidate/candidate-react.png`
- 모바일: `docs/reference/lv-ui/work/USR-MAIN-PUBLIC-MOBILE/candidate/candidate-react.png`

## 검증

- React production build: 통과
- U02 focused Playwright: 2/2 통과
- PC: 메인 슬라이드 4개, 페이지 버튼 4개, 주요 서비스 카드 4개 확인
- 모바일: 360x640 CSS px/DPR 2, 상단 탭 4개, 로그인 카드, 하단 메뉴 배치 확인
- 기존 LV CSS의 미해결 legacy asset 경고는 남아 있으나 U02 필수 자산은 정상 표시된다.

## 진행 판단

- U01 화면 복원율: 100%, 기능 구현율: 80%
- U02 화면 복원율: 80%, 기능 구현율: 80%
- U02 잔여: 후보 이미지 사용자 승인
- 다음 화면: U03 로그인 화면 비교 및 복원
