# Cubici 계정 서비스 역할 분리

## 목적

- 관리자 계정은 관리자 서비스에서만 로그인한다.
- 일반 사용자 계정은 사용자 서비스에서만 로그인한다.
- 역할이 다른 서비스의 세션과 토큰은 재사용할 수 없게 한다.

## 구현

- 사용자 로그인: `POST /v1/api/accounts/login`, `USER`만 허용
- 관리자 로그인: `POST /v1/api/accounts/admin-login`, 설정된 마스터 이메일과 `ADMIN_USER`만 허용
- 사용자 세션 확인: `GET /v1/api/accounts/me`, `USER`만 허용
- 관리자 세션 확인: `GET /v1/api/accounts/admin-me`, `ADMIN_USER`만 허용
- 인증 토큰에 `user` 또는 `admin` audience를 기록하고 현재 DB 역할과 일치하지 않으면 거부
- audience가 없는 기존 토큰은 무효화
- 사용자 Front는 `USER` 이외의 localStorage 세션을 즉시 삭제
- 관리자 Front는 관리자 전용 로그인과 세션 확인 API 사용

## 운영 데이터 조치

- 지정된 사용자 계정의 역할을 `USER`로 확인
- 기존 큐빅아이 사용자 중 최초 등록 계정의 사업자·업종·주소 속성으로 회사정보 통일
- 비밀번호는 평문을 기록하지 않고 운영 DB 내부의 검증된 암호 해시로 변경
- 사용자 이름과 전화번호는 변경하지 않음
- 운영 DB 기준 `USER` 42개 계정, 고객사명 36개, 큐빅아이 연결 계정 2개

## 검증

| 검증 | 결과 |
|---|---:|
| Backend 역할·route focused pytest | 85 passed |
| Backend 전체 비DB pytest | 125 passed, 6 deselected |
| 사용자 역할 경계 Playwright | 2/2 passed |
| user-web production build | 37 modules |
| admin-web production build | 73 modules |
| Cloudflare static bundle smoke | 통과 |
| 사용자 token -> 사용자 API | HTTP 200 |
| 사용자 token -> 관리자 API | HTTP 403 |
| 관리자 token -> 관리자 API | HTTP 200 |
| 관리자 token -> 사용자 API | HTTP 403 |
| 기존 audience 없는 token | HTTP 401 |
| 로컬/운영 API 및 DB health | 모두 HTTP 200 |

## 운영 배포

- Backend: `cubici-api-prod`만 상태 보존 재빌드
- PostgreSQL과 Cloudflare Tunnel 컨테이너는 재생성하지 않음
- Frontend Pages: `https://6552b7d6.cubici.pages.dev`
- 운영 `https://cubici.co.kr`의 user/admin asset hash가 신규 Pages와 일치
