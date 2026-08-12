# Cubici 9daf76f 운영 배포 결과

## 배포 기준

- 소스 커밋: `9daf76f5a5d0b8da69f95f723eed8c8305ea8144`
- Cloudflare Pages 프로젝트/브랜치: `cubici` / `main`
- Pages 배포 URL: `https://a29330ee.cubici.pages.dev`
- 운영 URL: `https://cubici.co.kr`
- 운영 API: `https://api.cubici.co.kr`

## DB/API 배포

- 운영 PostgreSQL migration `019_raw_data_export_audit.sql` 적용 완료
- `raw_data_export_audit` 테이블과 인덱스 3개 확인
- 검증 과정에서 export를 실행하지 않았으며 감사 행은 `0`건 유지
- 운영 API 컨테이너 `healthy`
- 운영 DB 컨테이너 `healthy`
- Cloudflare Tunnel 컨테이너 실행 상태 확인
- 배포 핵심 소스 3개 파일의 host/container SHA-256 일치
- 공개 API Health, DB Health, Docs 모두 HTTP `200`
- OpenAPI에서 `/v1/api/preferences/raw-data/export` 경로 확인
- 비인증 export 요청은 HTTP `401`로 차단

## Pages 배포 및 검증

- 사용자/관리자 번들 생성 완료
- 정적 번들 smoke 통과
- `api.example.com` 참조 `0`건
- `api.cubici.co.kr` 참조 번들 `2`개
- Pages 배포 URL과 운영 도메인에서 사용자/관리자 주요 7개 경로 모두 HTTP `200`
- 사용자/관리자 JavaScript 자산이 로컬 배포 번들과 각각 SHA-256 일치
- 사용자/관리자 legacy CSS 경로가 HTTP `200`, `text/css`로 응답
- 운영 관리자 focused Chrome smoke: `35/35 passed`

## 운영 포트 보완

- Windows TCP 제외 범위 `7988-8087`에 기존 운영 API host port `8000`이 포함되어 컨테이너 재기동이 차단되었다.
- Docker 내부 API port `8000`은 유지하고 host binding 기본값만 `18000`으로 변경했다.
- Cloudflare Tunnel은 Docker 내부 네트워크로 연결하므로 공개 API URL과 서비스 계약은 변경되지 않는다.
- `deploy-production-api.ps1`에 `ApiPublicPort` 기본값 `18000`을 추가해 외부 env의 과거 `8000` 값보다 명시적으로 우선하도록 했다.

## 잔여 및 주의사항

- Vite의 runtime legacy asset 경고와 500 kB 초과 chunk 경고는 기존 알려진 경고이며 배포 실패 항목은 아니다.
- 사용자 운영 브라우저 전체 회귀는 이번 배포 batch에서 반복하지 않았고, HTTP route 및 배포 자산 일치로 focused 검증했다.
- 실제 RawData export 실행은 개인정보/원본 데이터 노출 방지를 위해 운영 smoke에서 제외했다.
