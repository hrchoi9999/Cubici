# Cubici A07-A09 운영 API 반영 및 smoke

## 배포 범위

- 기준 commit: `a58ee8a`
- 변경 runtime: `service-api/src/cubici_service/contracts/repository.py`
- 사용자·관리자 frontend runtime 변경 없음
- 운영 PostgreSQL volume과 Cloudflare Tunnel은 변경하지 않음

## 배포 방식

정상 compose 재빌드를 먼저 시도했으나 현재 작업 폴더와 시스템 환경에 운영 필수 변수가 없었다. 비밀값을 실행 중인 컨테이너에서 추출하거나 재기록하지 않고 다음 방식으로 전환했다.

1. 운영 컨테이너 기존 파일을 `repository.py.pre-a58ee8a`로 백업했다.
2. 검증 완료한 repository 파일만 `cubici-api-prod`에 반영했다.
3. 컨테이너 내부 `py_compile`을 통과한 뒤 API 컨테이너만 재시작했다.
4. DB와 Tunnel 컨테이너는 재생성하거나 재시작하지 않았다.

현재 컨테이너 재시작과 PC 재부팅에는 반영 상태가 유지된다. 다만 향후 compose recreate 또는 image rebuild 시에는 source commit과 운영 env 파일을 사용한 정식 image 배포가 필요하다.

## 검증 결과

| 항목 | 결과 |
|---|---|
| `cubici-api-prod` | healthy |
| `cubici-postgres-prod` | healthy |
| `cubici-cloudflared-prod` | running |
| host/container repository SHA-256 | 일치 |
| 운영 계약 목록 read-only 조회 | 정상, 7건 |
| 최신 주문한도 projection | 정상 |
| 최신 미상환잔액 projection | 정상 |
| API health·DB health·docs | 3/3 HTTP 200 |
| 사용자 root·관리자 root·A07·A08·A09 | 5/5 HTTP 200 |
| 무인증 계약 목록 | HTTP 401, 접근 보호 정상 |

## 잔여

- `.env.production.local` 또는 동등한 안전한 운영 환경변수 공급 경로를 복구한다.
- 다음 운영 image 교체 시 `a58ee8a` 이상 source로 API를 재빌드하고 container source hash를 다시 확인한다.
- 실제 운영 계약 상태 변경은 이번 smoke에서 수행하지 않았다.
