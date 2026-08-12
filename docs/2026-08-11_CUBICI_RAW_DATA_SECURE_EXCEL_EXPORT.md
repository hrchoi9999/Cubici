# Cubici Prism RawData 안전 Excel 다운로드

## 범위

- 관리자 전용 RawData 화면에서 선택한 테이블·컬럼을 XLSX로 다운로드한다.
- 한 번에 최대 20개 컬럼, 5,000행, 날짜 범위 366일로 제한한다.
- 기존 Prism 계산식 CRUD와 Preview 기능은 유지한다.

## 보안·데이터 정책

- Master Admin Bearer 인증을 통과한 요청만 허용한다.
- DB에 실제 존재하고 RawData 화면에 허용된 테이블·컬럼만 조회한다.
- 주문자 식별값, 계좌정보, 비밀번호·토큰·연락처 계열 컬럼은 목록·Preview·Excel 대상에서 제외한다.
- Excel 수식으로 해석될 수 있는 `=`, `+`, `-`, `@` 시작 문자열은 텍스트로 강제한다.
- 감사 테이블에는 관리자 번호, 테이블명, 컬럼명, 기간, 제한·결과 행수, 파일 SHA-256만 기록한다. 원본 행 데이터와 인증정보는 기록하지 않는다.

## PMS 불일치 처리

- PMS는 실제 거래 데이터 기반 산출이 원칙이다.
- 현재 실거래 표본 부족과 테스트 데이터 혼재가 확인되어 기존 저장 등급과 legacy 경계 재판정의 차이는 코드 결함으로 확정하지 않는다.
- 실거래 데이터 축적 후 산식 검산 Batch에서 재검증한다.

## 검증 기준

- 요청 기간·행수 제한 및 Excel 수식 주입 방지 단위 테스트
- API route 등록 및 관리자 인증 회귀 테스트
- RawData PC 화면의 선택·Preview·Excel 다운로드 focused E2E
- 로컬 Docker PostgreSQL migration 및 감사기록 생성 확인

## 2026-08-11 검증 결과

- backend RawData 단위·route: 80 passed
- 관리자 API 인증·요청 사용자 전달 회귀: 5 passed
- React production build: 성공
- PC·모바일 RawData focused E2E: 각 1 passed, 총 2 passed
- Docker PostgreSQL preflight: healthy, `select 1` 성공
- migration 019: 적용 성공
- 실제 DB 3행 메모리 XLSX 생성, 민감 계좌 컬럼 차단, 감사행 생성·조회: 성공
- 검증용 감사행과 preview 서버: 검증 후 삭제·종료
