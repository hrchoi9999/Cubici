# Cubici 관리자 화면 Playwright E2E 추가

## 작업 결과

- `admin-web`에 Playwright E2E 기반을 추가했다.
- 상환 관리 화면의 핵심 관리자 동작을 mock API 기반으로 검증한다.
- 실제 사용자 데이터, DB dump, 운영 API를 사용하지 않는다.

## 변경 파일

- `Cubici/admin-web/package.json`
- `Cubici/admin-web/package-lock.json`
- `Cubici/admin-web/playwright.config.js`
- `Cubici/admin-web/scripts/run-playwright-e2e.mjs`
- `Cubici/admin-web/tests/e2e/redemption-management.spec.js`
- `Cubici/admin-web/.gitignore`
- `Cubici/docs/2026-07-20_CUBICI_ADMIN_PLAYWRIGHT_E2E.md`

## 검증 시나리오

- `/admin/moneybank/redemption` 화면 진입
- 상환 목록 mock 데이터 표시
- 상환 상세 조회
- 작업 이력 표시
- 작업 이력 상태 필터 적용/초기화
- payload 상세 modal 열기/닫기
- 취소 modal 입력 및 취소 API mock 호출

## 실행 방법

```powershell
npm run build
npm run test:e2e
```

## 로컬 실행 조건

- Playwright 브라우저 바이너리는 `D:\Alt_CSM\.downloads\ms-playwright` 내부에 설치했다.
- npm cache는 `D:\Alt_CSM\.downloads\npm-cache` 내부를 사용했다.
- `node_modules`, `dist`, `test-results`, `playwright-report`는 커밋하지 않는다.

## 검증 여부

- React production build 성공
  - `npm run build`
- FastAPI 테스트 성공
  - 결과: `18 passed, 1 skipped`
- Playwright E2E 성공
  - 결과: `1 passed`

## 판단 사항

- 테스트는 public 저장소 원칙에 맞게 mock API만 사용한다.
- 실제 DB 연동 E2E는 `service-api`의 `CUBICI_RUN_DB_E2E=1` 테스트로 분리한다.
- Windows 환경에서 Playwright child process 종료가 지연되어 전용 runner에서 Vite preview와 Playwright child를 직접 정리한다.

## 다음 액션

- 계약/정산 화면도 mock 기반 E2E를 추가한다.
- 상환 작업 이력 필터를 서버 API query filter로 확장할지 검토한다.
- 테스트 운영 단계에서 실제 API + DB + 관리자 화면 통합 E2E를 별도 구성한다.
