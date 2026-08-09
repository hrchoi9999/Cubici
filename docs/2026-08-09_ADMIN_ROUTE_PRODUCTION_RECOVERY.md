# 관리자 route 운영 복구

## 범위

- 대상: Cloudflare Pages 관리자 SPA route
- 운영 소스 기준: `9dd5b7e9a43b92c2a2bc7e1458c4aa0d81eb0418`
- 사용자/관리자 JS, CSS, 이미지 자산은 기존 운영 배포본을 그대로 유지
- 변경 파일: `_worker.js`, `_redirects`, 라우팅 생성기와 smoke 테스트
- DB/API, 관리자 화면 컴포넌트, 사용자 화면 컴포넌트는 변경하지 않음

## 원인

Worker가 관리자 SPA를 제공할 때 `/admin-spa.html` 정적 파일을 내부 요청했다. Cloudflare Pages의 HTML canonical 처리로 이 요청이 `HTTP 308 Location: /admin-spa`가 되었고, 원래 `/admin/...` route가 브라우저에서 소실되었다.

## 수정

- 관리자 SPA 내부 fetch 대상을 `/admin/` 디렉터리 index로 변경
- `/admin`, `/admin/*`, `/admin-spa`를 `/admin/` index에 내부 200 rewrite
- 기존 관리자 호환 URL `/admin-spa` 유지

## 검증

| 단계 | 결과 |
|---|---|
| Node 구문 검사 | build/smoke/worker 통과 |
| 정적 번들 smoke | 통과 |
| Preview | `59435091-1e8c-4e63-a402-c83940528776` |
| Preview 대표 URL | 사용자 2개, 관리자 4개 모두 HTTP 200, Location 없음 |
| Production | `418c4fe5.cubici.pages.dev` |
| 운영 대표 URL | 사용자 2개, 관리자 4개, API health 모두 HTTP 200 |
| 운영 관리자 브라우저 | 인증 세션에서 원래 route 유지 및 DB 집계 표시 확인 |

운영 화면 표시값:

- 회원현황 누적: 큐빅아이 40명, 머니뱅크 7명, 해지 2명, 제휴 4개
- 머니뱅크 통합 현황: 회원 7명, 정산 538건
- 프리즘 지표 관리: 전체 8건, PCS 8건, PMS 5건, 연결 5건

## 주의사항

기존 308은 영구 redirect이므로 이미 해당 관리자 route를 방문한 브라우저에는 이전 redirect가 캐시되어 있을 수 있다. 서버는 쿼리 없는 직접 요청에서도 HTTP 200으로 복구되었다. 기존 브라우저에서만 `/admin-spa`로 이동하면 강력 새로고침 또는 해당 사이트 캐시 삭제 후 다시 접속한다.

## 다음 Batch

- 직접 메뉴 24개와 상세/파생 9개, 총 33개 화면의 표시 건수와 API total 대조
- 화면별 API 실패 메시지와 실제 0건 표시 구분
- DB 조회 외 저장/변경/삭제, legacy 산식 검산은 별도 상태로 기록

이번 복구에서는 Git commit/push를 수행하지 않았다. 관리자 전체 완료 후 기존 원칙에 따라 한 번에 반영한다.
