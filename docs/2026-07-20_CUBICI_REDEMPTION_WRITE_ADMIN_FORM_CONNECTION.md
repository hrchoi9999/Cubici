# Cubici 상환 지급/상환 등록 관리자 화면 연결

## 작업 결과

- `/admin/moneybank/redemption` 상세 패널에 지급 등록 폼과 상환 등록 폼을 추가했다.
- 프론트에서 기존 FastAPI write API를 호출하도록 연결했다.
  - `POST /v1/api/redemptions/{mbid}/provisions`
  - `POST /v1/api/redemptions/{mbid}/repayments`
- 등록 성공 후 상환 상세와 현재 목록을 다시 조회하도록 처리했다.
- 화면 구성은 기존 관리자 레거시 UI의 표/입력 폼 톤을 유지하는 범위에서 최소 확장했다.

## 변경 파일

- `Cubici/admin-web/src/api/redemptions.js`
- `Cubici/admin-web/src/pages/RedemptionManagementPage.jsx`
- `Cubici/admin-web/src/styles/admin-web.css`
- `Cubici/docs/2026-07-20_CUBICI_REDEMPTION_WRITE_ADMIN_FORM_CONNECTION.md`

## 구현 내용

- `createRedemptionProvision`, `createRedemptionRepayment` API 함수를 추가했다.
- 지급 등록 폼 입력값을 `RedemptionProvisionCreateRequest` 형식으로 변환한다.
- 상환 등록 폼 입력값을 `RedemptionRepaymentCreateRequest` 형식으로 변환한다.
- 지급 등록 시 선택 판매코드가 입력되면 단일 판매 지급 항목을 함께 전송한다.
- 상환 등록 시 입금코드가 입력되면 단일 입금 항목을 함께 전송한다.
- 오류 응답의 `detail` 메시지를 관리자 화면에 표시한다.

## 검증 여부

- React production build 성공
  - `npm run build`
- FastAPI route/test 회귀 검증 성공
  - `pytest`
  - 결과: `18 passed`

## 판단 사항

- 지급/상환 취소 또는 역거래 처리는 이번 화면 연결 범위에서 제외했다.
- 현재 등록 폼은 관리자 수기 입력 재현을 위한 1차 구현이며, 다중 판매/다중 입금 입력 UI는 후속 개선 대상으로 둔다.
- 실제 운영 단계에서는 등록 권한, 이중 확인, 작업 이력 조회, 취소/정정 정책을 별도 설계해야 한다.

## 다음 액션

- 상환 작업 이력 조회 화면을 추가한다.
- 지급/상환 취소 또는 정정 workflow를 legacy 기준으로 재점검한다.
- Playwright 기반 관리자 화면 E2E를 추가한다.
