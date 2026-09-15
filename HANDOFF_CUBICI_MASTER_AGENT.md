# CUBICI Master Agent 인계

## 현재 상태: 2026-09-15

이번 보안·배포 보완 범위는 구현, 집중 검증, 운영 배포까지 완료했습니다. 전체 legacy 기능 완성 판정은 아닙니다.

- 실제 운영 작업본: `D:\Cubici_Integration_20260730`
- 이전 검토 작업본: `D:\Alt_CSM\Cubici` (더 오래된 버전이므로 통째로 배포하지 않습니다.)
- 기준 Git: `fix/cloudflare-admin-spa-routing`, 기반 `4e7704f` + 이 인계 문서와 함께 커밋되는 보완 수정
- 사용자 서비스: https://cubici.co.kr/
- 관리자 서비스: https://cubici.co.kr/admin/
- API: https://api.cubici.co.kr/v1/api/health
- Pages 배포: `4b4b21d5-23a2-40f4-acd2-47fb31359202`
- 상세 변경·검증·복구 기록: [배포 결과](docs/2026-09-15_ASTRA_PRODUCTION_HARDENING_DEPLOYMENT.md)

## 완료 작업

- 계약 owner가 실행할 수 있는 상태변경 제한, 정산·문의 ID 표현 우회 방지, 정산 SQL 소유권 범위 분리.
- 인증이 필요한 계약문서 Blob 다운로드, 오류·재시도·URL 정리, 관리자 로그아웃 링크 보완.
- CORS·JSON 입력·DB 연결 재시도·conninfo·운영 secret 검증 보완.
- Docker import 검사·빌드 context 제한, 누락된 관리자 아이콘 경로 수정.
- 운영 API와 Cloudflare Pages 배포, 실제 도메인 내용 검증.
- 기존 운영 UI/후속 기능, dirty E2E 7개와 이미지·문서 변경 보존. DB·Tunnel 유지.

## 검증 결과

- 백엔드 집중 테스트 336건 통과, 프론트 단위 24건 통과.
- 실제 Chromium 컴포넌트 harness 8건 통과. API mock 기반이며 전체 업무 E2E가 아닙니다.
- 개발 PostgreSQL 합성 검사 15건 + 연결 대역 검사 5건, 두 차례 통과. 트랜잭션 롤백·임시테이블 소멸 확인.
- 후보 이미지의 실제 psycopg 운영 DB 연결: 읽기 전용 SELECT 1 통과.
- Docker smoke 3건, 운영 API GET/CORS 5건, 운영 정적 경로·파일 해시 23건 통과.
- CSS 참조 228건 존재, 운영 Python 소스 56개 해시 일치, git diff --check 통과.
- 사용자 직접 로그인 후 실제 운영 대시보드, 정산 목록·상세, 머니뱅크 현황, 판매현황 조회 완료를 확인했습니다. 업무 쓰기나 금액·데이터 최신성 검산은 하지 않았습니다.

## 실행·배포

작업 디렉터리는 실제 운영 작업본입니다. Node는 `D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe`를 사용했습니다.

```powershell
$Node = 'D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe'
$env:VITE_API_BASE_URL = 'https://api.cubici.co.kr'
& $Node scripts/build-cloudflare-static-bundle.mjs
& $Node scripts/smoke-cloudflare-static-bundle.mjs
& $Node scripts/verify-astra-deployment.mjs https://cubici.co.kr
./scripts/deploy-production-api.ps1 -PreflightOnly
```

실제 API 배포는 `scripts/deploy-production-api.ps1`, Pages는 Wrangler의 `cubici` 프로젝트 `main` branch에 `dist-cloudflare`만 업로드합니다. 구체적인 Wrangler 환경 격리와 복구 방법은 상세 기록을 따릅니다.

## 미완료·주의사항

- 후속 사용자 요청으로 이번 보완 파일만 `fix/cloudflare-admin-spa-routing`에 커밋·푸시하는 범위입니다. `main` 병합은 별도이며, 운영 자동 배포 전 이번 커밋을 포함해야 합니다.
- 실계정 로그인, 실제 계약 변경·결제·SMS·메일, 전체 업무 lifecycle은 운영에서 실행하지 않았습니다.
- 기존 optional DB E2E fixture/selector 문제와 legacy 산식·전체 화면 완성도는 이번 범위에서 재판정하지 않았습니다.
- 이번 사용자 승인은 운영 폴더 및 외부 runtime env의 배포 도구 사용에 한정됩니다. 외부 경로 접근을 영구적으로 허용한 것으로 해석하지 않습니다.
- 인증값을 출력·복사·문서화하지 않습니다. Wrangler 도구 인증정보와 테스트 산출물은 ignored `data_local` 아래에 있습니다.
- Docker PostgreSQL 볼륨과 운영 파일을 삭제하지 않습니다. 다른 프로젝트와 포트가 겹치는 옛 staging compose를 무조건 시작하지 않습니다.
- API rollback tag: `cubici_integration_20260730-cubici-api:rollback-20260915183617`
- 이전 Pages 배포: `32bb7dba-86fd-45de-9a21-76e1a8bfa247`

## 푸시 전 집중 재검증

- API Python은 `service-api\.venv\Scripts\python.exe`를 사용합니다. 루트 `.venv`와 Alt_CSM 환경에는 운영본의 openpyxl 의존성이 없어 이번 API 검사에 맞지 않습니다.
- env 로더를 비활성화한 백엔드 권한·배포·기존 인증 검사 214건 통과, 프론트 단위 24건 통과.
- 프론트 단위 테스트의 esbuild 로더를 Vite 의존성 기준으로 바꿔 pnpm 설치에서도 별도 경로 지정 없이 실행되도록 했습니다. 운영 소스·배포 번들은 바뀌지 않았습니다.
- 기존 E2E 7개, 이미지 2개, 과거 미추적 문서는 이번 커밋에서 제외하고 작업본에 보존합니다.
