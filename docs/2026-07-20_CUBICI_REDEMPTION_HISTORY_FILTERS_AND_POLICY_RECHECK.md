# Cubici 상환 작업 이력 필터 및 계산 정책 재확인 기록

## 작업 결과

- 상환 계산 로직과 정책 재확인 항목을 별도 문서로 정리했다.
- 관리자 상환 상세의 작업 이력 표에 프론트 필터를 추가했다.

## 변경 파일

- `Cubici/admin-web/src/pages/RedemptionManagementPage.jsx`
- `Cubici/admin-web/src/styles/admin-web.css`
- `Cubici/docs/2026-07-20_CUBICI_REDEMPTION_CALCULATION_POLICY_RECHECK.md`
- `Cubici/docs/2026-07-20_CUBICI_REDEMPTION_HISTORY_FILTERS_AND_POLICY_RECHECK.md`

## 구현 내용

- 작업 이력 필터
  - 시작일
  - 종료일
  - 최소금액
  - 최대금액
  - 상태: 전체, 정상, 취소됨, 취소이력
- 필터 금액은 operation의 누적 지급 변화량과 누적 상환 변화량 중 큰 값을 기준으로 한다.
- 필터는 현재 상세 화면에 로드된 최근 작업 이력 응답을 대상으로 프론트에서 적용한다.

## 계산 정책 재확인 항목

- 상환 취소는 최신 누적 상태 기준으로 재계산한다.
- 지급 취소도 최신 누적 상태 기준으로 재계산한다.
- 원장 row는 삭제하지 않고 operation history로 정정/취소를 남긴다.
- legacy 잔액 불일치 가능성은 개발 중 임의 보정하지 않고, 테스트 운영 단계에서 전체 DB로 점검한다.

## 검증 여부

- React production build 성공
  - `npm run build`
- FastAPI 테스트 성공
  - 결과: `18 passed, 1 skipped`

## 다음 액션

- 관리자 화면 Playwright E2E를 추가한다.
- 작업 이력 필터를 서버 API query filter로 확장할지 검토한다.
- 테스트 운영 단계에서 잔액 불일치 전체 점검 SQL을 작성한다.
