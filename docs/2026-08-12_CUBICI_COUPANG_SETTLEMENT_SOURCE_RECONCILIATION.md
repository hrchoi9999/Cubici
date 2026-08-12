# Cubici 쿠팡 정산 source-specific 검산 보정

## 목적과 범위

- 기준일: 2026-08-12 KST
- 목적: 쿠팡 API 저장 정산액을 공통 검산식으로 비교해 발생한 28건의 오탐 제거
- 대상: 정산 조회 Backend와 관리자 정산관리 화면의 검산 상태 표시
- 제외: 쿠팡 실시간 API 연동, 신규 데이터 수집, DB 원본 금액 변경, 운영 배포

## 적용 규칙

다음 조건을 모두 만족하는 행만 쿠팡 source-specific 규칙을 적용한다.

1. 쇼핑몰 유형이 `COUPANG`
2. API 정산 유형이 `RESERVE` 또는 `WEEKLY`
3. 정산대상액이 0보다 크고 지급보류 해제액이 0
4. 저장 정산액과 `ROUND_HALF_UP(정산대상액 * 0.7)`의 차이가 1원 이내

조건을 만족하면 `SOURCE_RECONCILED`로 표시한다. 1원을 초과하면 기존과 같이 `DIFF`로 유지한다. 쿠팡 이외 쇼핑몰과 legacy batch 저장행의 판정은 변경하지 않는다.

## 변경 파일

- `service-api/src/cubici_service/settlements/repository.py`
  - source-specific 예상액 계산과 `SOURCE_RECONCILED` 집계 추가
- `admin-web/src/pages/SettlementManagementPage.jsx`
  - `원천일치` 상태와 집계 표시 추가
- `service-api/tests/test_settlement_amount_check.py`
  - 1원 허용, 초과 차이, 비쿠팡 미적용, 집계 검증 추가
- `admin-web/tests/e2e/settlement-source-reconcile.spec.js`
  - 관리자 정산관리 focused UI 검증 추가
- `scripts/replay_legacy_financial_formulas.py`
  - 수정 전 공통식 차이와 수정 후 source 검산 결과를 분리 출력

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| Backend 및 replay focused test | 9 passed |
| 관리자 production build | 성공, 75 modules transformed |
| 관리자 focused E2E | 1 passed |
| 개발 DB 전체 정산행 | 469건 |
| 쿠팡 source 일치 | 28건 |
| legacy batch 보존 | 441건 |
| 보정 후 실제 `DIFF` | 0건 |
| DB write | 없음 |

개발 DB의 쿠팡 28건은 모두 `SOURCE_RECONCILED`로 반환됐다. 실시간 쿠팡 API가 없어도 보존 DB의 원천 유형·대상액·정산액으로 표시 산식 replay가 가능하므로 이번 검증에는 외부 연동이 필요하지 않다.

## 배포 판단

Backend API 응답과 관리자 화면 표시가 함께 변경됐으므로 운영 반영에는 Backend Docker 재배포와 관리자 frontend 배포가 필요하다. 이번 Batch에서는 commit, push, 운영 배포를 수행하지 않았다.
