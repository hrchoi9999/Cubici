# Cubici 상환 작업 이력 조회 연결

## 작업 결과

- 상환 지급/상환 write API가 남기는 `moneybank_redemption_operation_history` 조회 API를 추가했다.
- `/admin/moneybank/redemption` 상세 패널에 최근 작업 이력 표를 연결했다.
- 지급/상환 등록 성공 후 상세, 목록, 작업 이력을 함께 재조회하도록 정리했다.

## 변경 파일

- `Cubici/service-api/src/cubici_service/redemptions/repository.py`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/redemptions.py`
- `Cubici/service-api/tests/test_domain_routes.py`
- `Cubici/admin-web/src/api/redemptions.js`
- `Cubici/admin-web/src/pages/RedemptionManagementPage.jsx`
- `Cubici/admin-web/src/styles/admin-web.css`
- `Cubici/docs/2026-07-20_CUBICI_REDEMPTION_OPERATION_HISTORY_CONNECTION.md`

## API

- `GET /v1/api/redemptions/{mbid}/operation-history`
- query
  - `limit`: 기본 20, 최대 100
  - `offset`: 기본 0
- 응답 항목
  - 작업 유형, 작업 코드, 관련 테이블/ID
  - 이전 누적 지급액/상환액/잔액
  - 신규 누적 지급액/상환액/잔액
  - 처리자, 사유, 등록일시

## 검증 여부

- React production build 성공
  - `npm run build`
- FastAPI route/test 회귀 검증 성공
  - `pytest`
  - 결과: `18 passed`

## 판단 사항

- 이번 단계는 조회 연결만 구현했다.
- 취소, 정정, 역거래 처리는 원거래 보존 및 감사 추적 정책을 먼저 확정한 뒤 별도 구현한다.
- 작업 이력 payload 원문 표시는 관리자 화면 과밀을 피하기 위해 이번 1차 화면에서는 제외했다.

## 다음 액션

- 지급/상환 취소 또는 정정 workflow 설계
- 작업 이력 payload 상세 보기 추가
- 관리자 화면 Playwright E2E 추가
