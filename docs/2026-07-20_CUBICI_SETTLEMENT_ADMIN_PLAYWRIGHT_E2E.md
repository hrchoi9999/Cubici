# Cubici 정산 관리자 Playwright E2E 추가

## 작업 결과

- 정산 관리자 화면에 대한 mock 기반 Playwright E2E 테스트를 추가했다.
- 테스트 대상은 정산 목록 표시, 검색 필터 입력/전송 후 목록 갱신, 상세 패널 표시다.
- 실제 DB 데이터와 민감정보는 사용하지 않고 Playwright route mock 응답만 사용한다.

## 변경 파일

- `admin-web/tests/e2e/settlement-management.spec.js`
- `docs/2026-07-20_CUBICI_SETTLEMENT_ADMIN_PLAYWRIGHT_E2E.md`

## 검증 항목

- React build: 통과
- FastAPI route/domain test: `18 passed, 1 skipped`
- Playwright E2E: `2 passed`

## 검증 메모

- `npm.cmd run build`는 현재 셸 PATH에서 `node`를 찾지 못해 실패했다.
- 동일한 로컬 Node 실행 파일로 Vite build를 직접 실행해 React build를 검증했다.

## 다음 액션

- 계약/선정산 신청 관리자 화면의 E2E 테스트를 추가한다.
- 이후 mock E2E 범위를 사용자용 페이지까지 확장한다.
