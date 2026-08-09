# U03 로그인 화면 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-LOGIN-PC`, `USR-LOGIN-MOBILE`
- Route: `/login`
- 직접 기준: `docs/reference/lv-ui/user/reference/pc/00_login.jpg`
- 보조 기준: `240130_큐빅아이/login.html`, `docs/reference/lv-ui/user/source-render/pc_login.png`
- 유지 예외: 사용자 승인 완료된 현재 회사정보 Footer

## 구현 결과

- 로그인 전용 PC 헤더의 우측 사용자 아이콘 복원
- 350px 로그인 폼, 55px 입력창, 60px 버튼과 LV 색상/간격 복원
- 아이디 저장, 찾기 링크, 구분선, 고객지원 영역 정렬 복원
- 아이디 저장 체크 시 `cubiciSavedLoginId`에 저장하고 해제 시 삭제
- 모바일 단일열 카드와 고정 하단 메뉴 대응
- 모바일 360px에서 가로 overflow 및 메뉴명 비정상 줄바꿈 제거

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 시각 및 로그인 기능 focused E2E: 3/3 통과
- 최종 CSS 보정 후 PC/모바일 시각 재검증: 2/2 통과
- 로그인 요청 payload, 인증 세션 저장, 아이디 저장 동작: 통과
- Python API 단위 테스트: 미실행
  - 저장소의 3개 Python 환경 모두 pytest 미설치
  - 새 패키지 설치 없이 환경 미구성으로 분류

## 후보 이미지

- PC: `docs/reference/lv-ui/work/USR-LOGIN-PC/candidate/candidate-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-LOGIN-MOBILE/candidate/candidate-react.png`

## 진행률

- U03 화면 복원율: 100% (사용자 승인 완료)
- U03 기능 구현율: 80% (실 API/운영 계정 검증 잔여)
- 사용자 화면 평균 화면 복원율: 43.1%
- 사용자 화면 평균 기능 구현율: 71.7%
- 사용자 화면 시각 승인 완료: 3/26

## 다음 단일 Batch

- U03 PC/모바일 승인본 확정 완료
- 다음 화면은 U04 회원가입 약관(`/mainSignUp` step1)
