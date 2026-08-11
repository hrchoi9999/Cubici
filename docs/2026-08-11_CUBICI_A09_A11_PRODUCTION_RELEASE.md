# Cubici A09-A11 운영 배포 및 focused smoke

## Batch 범위

- 기준 source commit: `9f6a094`
- Backend 대상: `b9aa9d2`의 계약 예외 상태 조회 정책
- Frontend 대상: 심사 거부 표시와 계약 관리 해지 UI
- 운영 DB 쓰기: 미실시

## API 배포

- 외부 운영 env와 compose preflight 통과
- `cubici-api` image만 재빌드·교체
- PostgreSQL volume과 Cloudflare Tunnel 유지
- 새 image: `sha256:2e26e4a55b7aafa7bd908d29975db4158fe7ead408c6bd27e5161921456ba06c`
- container source와 Git source SHA-256 일치
- 공개 API health: HTTP 200

## Frontend 배포

- 사용자 build: 42 modules 통과
- 관리자 build: 75 modules 통과
- 통합 Cloudflare bundle static smoke 통과
- 운영 API asset 2개, placeholder API asset 0개
- Cloudflare Pages production deployment: `https://07fcf137.cubici.pages.dev`
- 운영 도메인과 신규 배포 관리자 asset 경로 일치: `/admin/assets/index-BEYyT3AS.js`

## 운영 focused smoke

| 항목 | 결과 |
|---|---|
| 신규 Pages root/A09/A11 | 3/3 HTTP 200 |
| 운영 도메인 root/A09/A11 | 3/3 HTTP 200 |
| API/DB health | 2/2 HTTP 200, `cubici_prod`, application table 59개 |
| 무인증 계약 목록 | HTTP 401 |
| A09 계약 관리 | 운영 계약 4건 표시, 계약완료 상세와 해지 액션 표시 |
| A11 상환 관리 | 운영 상환 6건 표시, 잔액 검산 `일치 (0)`, 지급/상환 등록 UI 표시 |
| 운영 쓰기 | 실행하지 않음 |

현재 route에서 새 console 오류는 확인되지 않았다. Chrome에 남아 있던 확장 메시지 오류는 이전 관리자 route 시각의 브라우저 확장 로그이며 이번 A09/A11 요청과 무관하다.

## 진행률

- A09 계약 관리: UI 100%, 내부 기능 98%
- A11 상환 관리: UI 100%, 내부 기능 97%
- 관리자 직접 메뉴: UI 24/24, 100%
- 관리자 직접 메뉴 평균 내부 기능 구현율: 84.2%

## 잔여

- A09 강제해지/계좌해지 권한과 운영 정책 확정
- A11 legacy 상환 수수료·잔액 산식 최종 검산
- 실제 운영 상태 변경은 별도 통제 작업으로 수행
