# Cubici ADM Batch 7 - 관리자 릴리즈

## 승인 및 범위

- 사용자 직접 화면 승인: 26/26
- 관리자 직접 메뉴 승인: 24/24
- 관리자 직접 메뉴 responsive focused regression: 24/24
- 관리자 상세/파생 화면 운영 데이터 읽기: 9/9
- 알려진 legacy 산식과 외부연동 잔여는 완료 처리하지 않고 제한사항으로 유지한다.

## 릴리즈 후보 검증

| 검증 | 결과 |
|---|---|
| user-web production build | 37 modules 통과 |
| admin-web production build | 73 modules 통과 |
| Cloudflare 통합 bundle | `dist-cloudflare` 생성 완료 |
| Cloudflare static route/asset smoke | 통과 |
| 관리자 직접 메뉴 Playwright | 24/24 통과 |
| 환경설정 CRUD mock Playwright | 6/6 통과 |
| Backend 비DB pytest | 121 passed |
| Backend 개발 DB E2E | 6/6 통과 |

build 경고는 legacy 절대 `/resources/...` 경로의 runtime 해석과 admin JS chunk 500kB 초과다. 통합 bundle이 resources를 복사하며 static smoke에서 필수 asset과 user/admin deep route를 확인했다.

## Git 포함 범위

- 관리자 React source와 공통 CSS
- 관리자 focused/CRUD E2E와 mock 인증 helper
- Cloudflare static bundle build/smoke script
- 관리자 Batch 1~7 및 DB/API 회귀 문서
- 프로젝트 작업 원칙과 페이지별 진행표

## Git 제외 범위

- `docs/reference/lv-ui` 아래 원본·후보·승인 이미지
- `240130_큐빅아이`, 관리자 원본 capture, vendor 원본
- 계정 설정 문서, 실제 `.env`, DB dump, service-account JSON
- `service-api/scripts`, `service-api/uv.lock` 등 Backend 별도 작업 범위
- build output, Playwright output, 로컬 DB와 runtime 로그

## 알려진 제한사항

1. 정산 운영 데이터 28건 차이의 legacy batch 원인 검산
2. Prism 결과 불완전 3건, 설정 미완성 26건, RawData 산식 미적재
3. 요금제·연계코드·협력사 실 DB CRUD/삭제정책 E2E
4. 고객 알림·첨부, 외부 OS metric, 실제 펌뱅킹 송금은 외부연동/추가개발 범위

## 배포 결과

- Git commit/push: 선별된 57개 파일을 `fix/cloudflare-admin-spa-routing` 브랜치에 반영
- Cloudflare Pages: `https://208c8cf4.cubici.pages.dev` 배포 완료
- 신규 배포 URL 핵심 사용자·관리자 route: 5/5 HTTP 200
- `https://cubici.co.kr` 핵심 사용자·관리자 route: 5/5 HTTP 200
- 신규 배포 URL과 운영 도메인의 user/admin JS·CSS asset hash 일치
- `https://api.cubici.co.kr/v1/api/health`: HTTP 200, `status=ok`
- `https://api.cubici.co.kr/v1/api/health/db`: HTTP 200, `status=ok`
