# Cubici User Account/Mypage Implementation

## 작업 결과

- 회원가입 화면에 legacy `agree1.jsp`, `agree2.jsp`, `agree3.jsp` 원문 HTML을 정적 약관으로 반영했다.
- 회사정보 저장 API와 사용자단 저장 UI를 추가했다.
- 쇼핑몰 계정 수정, 비활성/활성 전환, soft delete API와 사용자단 관리 UI를 추가했다.

## 원문 근거

- `src/main/webapp/WEB-INF/jsp/egovframework/azon/cubici/home/agree1.jsp`
- `src/main/webapp/WEB-INF/jsp/egovframework/azon/cubici/home/agree2.jsp`
- `src/main/webapp/WEB-INF/jsp/egovframework/azon/cubici/home/agree3.jsp`

위 3개 파일 모두 `D:\Alt_CSM\Cubici` 내부에서 확인했다. JSP 지시자만 제거하고 본문 HTML은 `user-web/public/legacy-terms/*.html`로 복제했다.

## 변경 요약

- `PUT /v1/api/accounts/me/company`
- `PUT /v1/api/accounts/me/shops/{account_id}`
- `DELETE /v1/api/accounts/me/shops/{account_id}`
- 쇼핑몰 삭제는 `del_yn='Y'`, `status='N'` soft delete로 처리한다.
- 쇼핑몰 비활성은 `status='N'`, 재활성은 `status='Y'`로 처리한다.
- DB 개발 기본 포트와 E2E preflight 실패 안내를 Docker PostgreSQL 기준 `55432`로 맞췄다.

## 검증

- API/domain focused: `pytest test_domain_routes.py -k "account or domain_routes_registered"` 통과, 11 passed.
- Front build: 내부 Node/Vite `vite build` 통과.
- DB preflight: `127.0.0.1:55432/cubici_local` `select 1` 통과.
- Account focused E2E: `account-mypage-db-e2e.spec.js` 단일 실행 통과, 2 passed.

## 남은 보완

- 회사정보 변경 이력/audit table은 아직 없다.
- 쇼핑몰 credential 암호화/마스킹 정책은 기존 저장 구조 범위에서 유지했다.
