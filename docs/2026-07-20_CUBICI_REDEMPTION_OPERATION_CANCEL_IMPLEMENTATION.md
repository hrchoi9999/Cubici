# Cubici 상환 지급/상환 취소 workflow 구현

## 작업 결과

- 지급/상환 작업 취소 API를 추가했다.
- 원거래 row를 삭제하지 않고 역거래 operation history를 추가하는 방식으로 구현했다.
- 취소된 원거래는 `canceled_by_operation_history_id`로 취소 이력을 참조한다.
- 관리자 상환 상세 화면의 작업 이력 표에 상태와 취소 버튼을 추가했다.

## 변경 파일

- `Cubici/db/postgres/migrations/008_redemption_operation_reversal.sql`
- `Cubici/service-api/src/cubici_service/redemptions/repository.py`
- `Cubici/service-api/src/cubici_service/api/v1/endpoints/redemptions.py`
- `Cubici/service-api/tests/test_domain_routes.py`
- `Cubici/admin-web/src/api/redemptions.js`
- `Cubici/admin-web/src/pages/RedemptionManagementPage.jsx`
- `Cubici/docs/2026-07-20_CUBICI_REDEMPTION_OPERATION_CANCEL_IMPLEMENTATION.md`

## API

- `POST /v1/api/redemptions/{mbid}/operations/{operation_history_id}/cancel`

요청:

```json
{
  "cancel_code": "optional",
  "operated_by": "local-admin",
  "reason": "취소 사유"
}
```

## 처리 원칙

- 원지급/원상환 row는 삭제하지 않는다.
- 취소 작업은 `PROVISION_CANCEL` 또는 `REPAYMENT_CANCEL` operation으로 기록한다.
- 취소 작업은 `is_reversal = true`로 표시한다.
- 하나의 원거래는 한 번만 취소 가능하다.
- 이미 취소된 거래, 취소 이력 자체, 지원하지 않는 operation type은 취소하지 않는다.
- 취소 결과 누적 지급액, 누적 상환액, 미상환잔액이 음수가 되면 거부한다.

## 검증 여부

- migration 008 로컬 PostgreSQL 적용 확인
  - `MIGRATION_008_COLUMNS 3`
- React production build 성공
  - `npm run build`
- FastAPI route/test 회귀 검증 성공
  - `pytest`
  - 결과: `18 passed`
- DB E2E 검증 성공
  - 지급 생성
  - 지급 취소
  - operation history 조회
  - 테스트 생성 row 삭제
  - 결과: `REDEMPTION_CANCEL_E2E_OK`

## 다음 액션

- 취소 사유 입력 UI를 modal/form 방식으로 개선한다.
- operation history payload 상세 보기를 추가한다.
- 상환 취소 케이스와 후속 지급/상환이 섞인 순서 검증을 테스트 케이스로 추가한다.
