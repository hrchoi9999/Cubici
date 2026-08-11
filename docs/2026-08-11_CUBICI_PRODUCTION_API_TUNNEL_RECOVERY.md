# Cubici 운영 API·Tunnel 복구 및 smoke

## 범위

- 전일 관리자 공용 자원 경로 보완 배포 상태 확인
- 운영 정적 route와 Rudicks CSS 응답 확인
- `api.cubici.co.kr` health 장애 원인 분리
- 기존 Docker 운영 컨테이너 재기동과 Cloudflare Tunnel 복구

## 최초 확인

| 항목 | 결과 |
|---|---|
| `https://cubici.co.kr/` | HTTP 200 |
| `https://cubici.co.kr/admin` | HTTP 200 |
| `https://cubici.co.kr/admin-spa` | HTTP 200 |
| `/resources/rudicks/css/style-sub.css` | HTTP 200, `text/css` |
| API health | HTTP 530, Cloudflare 1033 |
| DB health | HTTP 530, Cloudflare 1033 |
| Docker engine | 미기동 |

정적 Pages 배포와 관리자 공용 CSS는 정상이며, API 장애는 frontend 코드가 아니라 PC 종료 후 Docker Desktop과 운영 컨테이너가 내려간 상태로 분류했다.

## 복구

- Docker Desktop을 시작했다.
- 운영 DB volume과 설정 파일은 변경하지 않았다.
- `restart: unless-stopped` 정책으로 기존 운영 컨테이너가 자동 재기동됐다.
- 별도 build, compose recreate, DB migration은 수행하지 않았다.

## 최종 검증

| 항목 | 결과 |
|---|---|
| `cubici-postgres-prod` | healthy |
| `cubici-api-prod` | healthy |
| `cubici-cloudflared-prod` | running |
| API health | HTTP 200, `status=ok` |
| DB health | HTTP 200, `cubici_prod`, public application table 59개 |
| 관리자 로그인 화면 | 정상 렌더링, 사이트 console error 없음 |

## 잔여

- 현재 점검 브라우저에는 관리자 인증 세션이 없어 로그인 이후 24개 직접 메뉴의 운영 실데이터 렌더링은 미검증이다.
- 관리자 인증 후 운영 직접 메뉴를 화면군별로 나눠 focused regression한다.
- PC가 꺼지면 Docker 기반 운영 API와 Tunnel도 함께 중단된다. 상시 운영을 위해서는 Docker Desktop 자동 시작을 유지하거나 별도 상시 서버로 이전해야 한다.
