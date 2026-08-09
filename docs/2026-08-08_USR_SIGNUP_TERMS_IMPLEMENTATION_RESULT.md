# U04 회원가입 약관 화면 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-SIGNUP-TERMS-PC`, `USR-SIGNUP-TERMS-MOBILE`
- Route/state: `/mainSignUp` step1
- 직접 기준: `240130_큐빅아이/회원가입_약관동의.html`
- 약관 기준: `user-web/public/legacy-terms/agree1.html`~`agree3.html`
- 유지 예외: 사용자 승인 완료된 현재 회사정보 Footer

## 구현 결과

- 기존 약관/기본정보 동시 노출 화면을 LV의 3단계 흐름으로 분리
- 회원가입 상단 비주얼과 약관동의/기본정보/가입완료 단계 표시 복원
- 무료 이용 안내문과 약관 3개 스크롤 영역 복원
- 임시 약관 문구를 보유 중인 legacy 약관 전문으로 교체
- 전체동의와 개별동의 상태 연동
- 필수 약관 전체동의 전 `다음` 비활성, 동의 후 기본정보 단계 전환
- 360px 모바일 단일열, 하단 메뉴, 가로 overflow 보정

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 통과
- 모바일 overflow 보정 후 focused 재검증: 1/1 통과
- 최종 CSS 반영 후 PC 후보 재캡처: 1/1 통과
- 검증 항목: 초기 step1, 약관 iframe 3개, 전체동의, 다음 버튼, step2 전환, 모바일 overflow

## 후보 이미지

- PC: `docs/reference/lv-ui/work/USR-SIGNUP-TERMS-PC/candidate/candidate-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-SIGNUP-TERMS-MOBILE/candidate/candidate-react.png`

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-SIGNUP-TERMS-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-SIGNUP-TERMS-MOBILE/approved/approved-react.png`
- 사용자 승인일: 2026-08-08

## 진행률

- U04 화면 복원율: 100% (사용자 승인 완료)
- U04 기능 구현율: 80% (최종 가입 저장 시 동의값 연계 재검증 잔여)
- 사용자 화면 평균 화면 복원율: U05 후보 반영 후 49.2%
- 사용자 화면 평균 기능 구현율: U05 후보 반영 후 72.7%
- 사용자 화면 시각 승인 완료: 4/26

## 다음 단일 Batch

- U05 회원가입 기본정보(`/mainSignUp` step2) 후보 이미지 사용자 확인
