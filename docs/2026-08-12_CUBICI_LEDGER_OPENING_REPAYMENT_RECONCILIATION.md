# Cubici 통합원장 초기 이관 상환액 검산 보정

## 목적과 범위

- 기준일: 2026-08-12 KST
- 목적: 상세 상환행 없이 history에 이관된 초기 누적상환액을 일반 거래와 분리해 원장 검산에 반영
- 대상: 머니뱅크 통합 현황 Backend 및 관리자 표시
- 제외: DB 원본 수정, 상세 상환행 생성, 실시간 외부 연동, 운영 배포

## 인정 조건

초기 이관액은 다음 조건을 모두 만족하는 계약만 집계한다.

1. 조회 기준일까지 상세 상환행이 0건
2. 최초 history 누적상환액이 0보다 큼
3. 최신 history 누적상환액과 상세 상환 합계의 차이가 최초 history 누적상환액과 정확히 일치

설명되지 않는 잔액 차이는 기존처럼 `검산차이`로 유지한다.

## 개발 DB 검산

| 항목 | 결과 |
| --- | ---: |
| 지급 상세 누계 | 55,686,548원 |
| 일반 상환 상세 누계 | 54,772,944원 |
| 초기 이관 상환 | 3,616원, 1계약 |
| 검산용 상환 누계 | 54,776,560원 |
| 최신 history 잔액 | 909,988원 |
| 초기 이관 반영 검산 잔액 | 909,988원 |
| 최종 차이 | 0원 |

관리자 화면에는 `초기이관 상환: 3,616원`과 `초기이관 포함 일치`를 표시한다. 일반 상환 거래 누계는 원본 의미를 보존하기 위해 54,772,944원으로 유지한다.

## 변경 파일

- `service-api/src/cubici_service/management/repository.py`
- `admin-web/src/pages/ManagementOverviewPage.jsx`
- `admin-web/src/pages/MoneybankIntegratedInfoPage.jsx`
- `service-api/tests/test_management_ledger_reconciliation.py`
- `admin-web/tests/e2e/ledger-opening-repayment.spec.js`
- `scripts/replay_legacy_financial_formulas.py`

## 검증 결과

- Backend focused test: `85 passed`
- 관리자 production build: 성공, 75 modules transformed
- 관리자 focused E2E: `1 passed`
- 개발 DB API 직접 조회: 초기 이관 3,616원·1계약, 잔액 차이 0원
- DB write: 없음
- preview 종료: 확인

## 배포 판단

Backend 응답과 관리자 frontend가 변경됐으므로 최종 운영 반영 시 Docker API와 Cloudflare Pages를 함께 배포해야 한다. 이번 Batch에서는 commit, push, 운영 배포를 수행하지 않았다.
