# Cubici 계약/선정산 신청 관리자 Playwright E2E 추가

## 작업 결과

- 신청 접수 관리자 화면에 대한 mock 기반 Playwright E2E 테스트를 추가했다.
- 테스트 대상은 신청 목록 표시, 검색 필터 입력, 상세 패널 표시, 승인 상태 변경이다.
- 실제 DB 데이터와 민감정보는 사용하지 않고 Playwright route mock 응답만 사용한다.

## 변경 파일

- `admin-web/tests/e2e/contract-request-management.spec.js`
- `docs/2026-07-20_CUBICI_CONTRACT_REQUEST_ADMIN_PLAYWRIGHT_E2E.md`

## 검증 항목

- React build: 통과
- FastAPI route/domain test: `18 passed, 1 skipped`
- Playwright E2E: `3 passed`

## 다음 액션

- 제출서류 업로드/확인 화면 E2E를 별도 시나리오로 확장한다.
- 사용자용 페이지 inventory와 전환 우선순위를 정리한다.
