# Cubici M5 Cloudflare Pages 운영 배포

## 배포 범위

- 기준 source commit: `dd785db`.
- 사용자 React, 관리자 React, legacy 정적 resource를 통합한 `dist-cloudflare` bundle을 배포했다.
- Pages 프로젝트: `cubici`, production branch: `main`.
- 운영 API base URL: `https://api.cubici.co.kr`.
- 운영 DB 쓰기와 Docker API image 재배포는 수행하지 않았다.

## 빌드 및 정적 검증

| 항목 | 결과 |
|---|---|
| 사용자 production build | 42 modules 통과 |
| 관리자 production build | 75 modules 통과 |
| Cloudflare static bundle smoke | 통과 |
| 운영 API asset | 2개 |
| placeholder API asset | 0개 |
| 사용자 JS | `/assets/index-DwEM-uTR.js` |
| 관리자 JS | `/admin/assets/index-CycoDF-d.js` |

Vite의 정적 resource 경고는 bundle 생성 후 실제 `/resources/**` 복사와 static smoke로 확인했다.

## 배포

- Cloudflare Pages deployment: `https://f9efb16f.cubici.pages.dev`.
- 신규 업로드 6개, 기존 asset 재사용 3,751개.
- `_headers`, `_redirects`, Worker bundle, `_routes.json` 배포 완료.

## 운영 smoke

| 검증 | 신규 Pages URL | `cubici.co.kr` |
|---|---:|---:|
| 사용자 `/` | HTTP 200 | HTTP 200 |
| 사용자 `/moneybank/current` | HTTP 200 | HTTP 200 |
| 관리자 `/admin` | HTTP 200 | HTTP 200 |
| 환경설정 상품 목록 route | HTTP 200 | HTTP 200 |
| Prism RawData route | HTTP 200 | HTTP 200 |
| 이용상세 파생 route | HTTP 200 | HTTP 200 |
| 공유 CSS | `text/css` | `text/css` |
| `/admin/resources/**` alias | `text/css` | `text/css` |
| 사용자 JS SHA-256 | local bundle 일치 | local bundle 일치 |
| 관리자 JS SHA-256 | local bundle 일치 | local bundle 일치 |

## 브라우저 회귀

- 사용자 메인: 렌더링 성공, 깨진 이미지 0, body overflow 0, console error 0.
- 관리자 미인증 상세 route: 관리자 로그인 화면으로 보호, fallback 0, 깨진 이미지 0, console error 0.
- 운영 관리자 mock 인증 route smoke: 34개 route와 좌측 메뉴 동작을 합쳐 `35/35` 통과, 44.1초.

## API 상태

- `https://api.cubici.co.kr/v1/api/health`: HTTP 200.
- `https://api.cubici.co.kr/v1/api/health/db`: HTTP 200.
- 현재 frontend 변경에 운영 API image 교체가 필요하지 않아 Docker 재배포는 생략했다.

## 완료 상태

- 사용자 화면 LV 복원: 26/26, 100%, 운영 반영 완료.
- 관리자 화면 LV 복원: 직접 24개와 상세·파생 10개, 34/34, 100%, 운영 반영 완료.
- 관리자 내부 기능 구현률: 83.5% 유지.
- 회원상세 결제이력·평가 저장·증빙 다운로드와 외부 연동은 추가개발 범위다.
