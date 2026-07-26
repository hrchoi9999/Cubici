# Cubici 제출서류 관리자 Playwright E2E 추가

## 작업 결과

- 신청 접수 상세의 제출서류 화면에 대한 mock 기반 Playwright E2E 테스트를 추가했다.
- 테스트 대상은 서류 상세 진입, 파일 업로드, 파일 목록 갱신, 다운로드 링크 표시, 입력완료 처리다.
- 실제 파일 저장소와 DB는 사용하지 않고 Playwright route mock 응답만 사용한다.

## 변경 파일

- `admin-web/tests/e2e/contract-documents-management.spec.js`
- `docs/2026-07-20_CUBICI_CONTRACT_DOCUMENTS_ADMIN_PLAYWRIGHT_E2E.md`

## 검증 항목

- React build: 통과
- FastAPI route/domain test: `18 passed, 1 skipped`
- Playwright E2E: `4 passed`

## 검증 메모

- 제출서류 단독 E2E는 출력상 `1 passed`였으나, 현 E2E 래퍼가 단독 실행에서 종료코드 1을 반환했다.
- 전체 E2E 재실행은 정상 종료코드 0과 함께 `4 passed`로 통과했다.

## 다음 액션

- 사용자용 신청 페이지 inventory를 정리한다.
- 관리자 서류 확인값 저장과 심사 메모 등록 E2E를 필요 시 추가한다.
