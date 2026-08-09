# U05 회원가입 기본정보 화면 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: `USR-SIGNUP-INFO-PC`, `USR-SIGNUP-INFO-MOBILE`
- Route/state: `/mainSignUp` step2
- 직접 기준: `240130_큐빅아이/회원가입_기본정보.html`
- 유지 예외: 사용자 승인 완료된 현재 회사정보 Footer

## 구현 결과

- LV 회원가입 비주얼과 3단계 표시 중 기본정보 활성 상태 복원
- 회사명, 사업자등록번호, 대표자명, 설립연도, 사업자 유형, 업종 복원
- 우편번호, 주소, 상세주소 입력 구조 복원
- 아이디 중복확인, 이메일 인증, 암호확인, SMS 인증, 협력사 선택 UI 복원
- PC 2열 입력 구조와 360px 모바일 1열 반응형 구조 적용
- 이전 버튼으로 약관 단계 복귀 및 동의 상태 유지
- 필수 입력, 사업자번호 10자리, 암호 8자 이상, 암호 일치 검증
- 가입 API payload에서 화면 전용 인증번호와 암호확인 필드 제외

## 기능 경계

- 이메일/SMS/주소 찾기는 외부 연동이 없어 발송·조회 대신 입력 조건과 연동 전 상태를 표시한다.
- 주소는 현재 가입 API 계약에 없으므로 화면 상태만 유지하며 DB 저장은 후속 API 계약 검토 대상이다.
- 이메일 실제 중복 여부는 현재 가입 API의 최종 저장 시 409 응답으로 검증된다.

## 검증

- 사용자 Web production build: 통과
- Playwright PC/모바일 focused E2E: 2/2 통과
- 검증 항목: step2 전환, LV 필드, 이전 단계 복귀, 동의 상태 유지, 암호 불일치, 가입 API payload, 모바일 overflow
- preview 종료로 발생한 중간 접속 실패 1회는 환경 실패로 분류하고 서버 재기동 후 통과

## 후보 이미지

- PC: `docs/reference/lv-ui/work/USR-SIGNUP-INFO-PC/candidate/candidate-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-SIGNUP-INFO-MOBILE/candidate/candidate-react.png`

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-SIGNUP-INFO-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-SIGNUP-INFO-MOBILE/approved/approved-react.png`
- 사용자 승인일: 2026-08-08

## 진행률

- U05 화면 복원율: 100% (사용자 승인 완료)
- U05 기능 구현율: 80% (외부 인증, 주소 DB 저장, 실 DB 가입 검증 잔여)
- 사용자 화면 평균 화면 복원율: U06 후보 반영 후 52.3%
- 사용자 화면 평균 기능 구현율: U06 후보 반영 후 73.5%
- 사용자 화면 시각 승인 완료: 5/26

## 다음 단일 Batch

- U06 회원가입 완료(`/mainSignUp` complete) 후보 이미지 사용자 확인
