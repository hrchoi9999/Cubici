# Cubici 운영 API 정식 image 재배포

## 범위

- 기준 source commit: `a58ee8a`
- 배포 기록 commit: `365d047`
- 저장소 밖 운영 env: `D:\Cubici_Runtime\production.env`
- 대상 서비스: `cubici-api` 단독
- PostgreSQL volume과 Cloudflare Tunnel은 유지

## 사전검증

- 외부 env 파일 존재 확인
- env 값을 출력하지 않고 `CHANGE_ME_` placeholder 부재 확인
- `docker compose config --quiet` 통과
- 기존 운영 API·DB healthy, Tunnel running 확인

## 결과

| 항목 | 결과 |
|---|---|
| API image build | 통과, 22.2초 |
| 새 image | `sha256:e0773a218b5d5ec840e0ed65ed04968e3072568e62c3299f2d9654f489a4f586` |
| API 단독 recreate | 통과 |
| 새 API health | healthy |
| DB health | healthy |
| Tunnel | running |
| Git source/container source SHA-256 | 일치 |
| hot patch 백업 파일의 image 포함 | 없음 |
| 운영 계약 목록 read-only 조회 | 정상, 7건 |
| API health·DB health·docs | 3/3 HTTP 200 |
| 사용자 root·관리자 root·A07·A08·A09 | 5/5 HTTP 200 |
| 무인증 계약 목록 | HTTP 401 |

이전 hot patch 상태는 정식 image 배포로 대체됐다. 컨테이너가 compose로 재생성돼도 `a58ee8a` 계약 목록 수정이 유지된다.

## 재사용 배포

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-production-api.ps1
```

스크립트는 외부 env preflight, API image 선행 build, API 단독 교체, health·source hash·공개 health 확인을 수행한다. 실패 시 배포 직전 image로 자동 rollback을 시도한다.
