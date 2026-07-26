# Cubici 서류 확인값/심사메모 Playwright E2E 추가

## 작업 결과

- 신청 접수 상세의 서류 확인값 저장과 심사메모 등록 E2E 테스트를 추가했다.
- 테스트 대상은 `documents/checks` 저장 요청, 상세 재조회 반영, `review-notes` 등록 요청, 메모 목록 갱신이다.
- 실제 DB 데이터와 민감정보는 사용하지 않고 Playwright route mock 응답만 사용한다.

## 변경 파일

- `admin-web/tests/e2e/contract-document-review-management.spec.js`
- `docs/2026-07-20_CUBICI_CONTRACT_DOCUMENT_CHECK_REVIEW_NOTE_E2E.md`

## 검증 항목

- React build: 통과
- FastAPI route/domain test: `18 passed, 1 skipped`
- Playwright E2E: `5 passed`

## 검증 메모

- 최초 build 명령은 Vite/Rollup의 절대 경로 처리 오류로 실패했다.
- 동일 코드에서 Vite CLI를 상대 경로로 재실행해 React build 통과를 확인했다.

## 다음 액션

- 오늘 관리자 화면 마감 전 전체 E2E를 계속 유지한다.
- 내일 사용자용 페이지 inventory와 전환 범위를 정리한다.
