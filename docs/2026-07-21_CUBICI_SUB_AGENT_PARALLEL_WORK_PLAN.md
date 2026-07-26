# Cubici Sub Agent 병렬 작업 계획

## 작업 결과

- 이 스레드를 Cubici Migration Master Agent로 두고 Sub Agent 병렬 작업 단위를 확정했다.
- 병렬 작업 기준은 역할명이 아니라 충돌 없는 산출물 단위로 정했다.
- 1차 병렬 대상은 관리자 `고객관리 > 고객문의` 화면이다.

## 운영 원칙

- 모든 Sub Agent는 `D:\Alt_CSM\Cubici` 내부에서만 작업한다.
- 같은 파일을 두 Agent가 동시에 수정하지 않는다.
- 공통 router, layout, CSS, commit은 Master Agent가 최종 처리한다.
- DB migration 적용, 실제 데이터 보정은 Master Agent가 직접 검토 후 처리한다.
- 모든 Sub Agent는 완료 시 `작업 결과`, `변경 파일`, `검증 여부`, `다음 액션`을 보고한다.

## 1차 Sub Agent 분배

| Agent | 작업 | 수정 허용 범위 |
|---|---|---|
| Legacy 조사 Agent | 고객문의 JSP/MyBatis/Controller/DB 흐름 조사 | `docs/2026-07-21_CUBICI_CUSTOMER_INQUIRY_LEGACY_INVENTORY.md` |
| 고객문의 API Agent | 고객문의 read-only repository/endpoint/test 초안 | `service-api/src/cubici_service/support/*`, `service-api/src/cubici_service/api/v1/endpoints/support.py`, `service-api/tests/test_support_routes.py`, 관련 docs |
| 고객문의 React Agent | 고객문의 React page/API client 초안 | `admin-web/src/api/support.js`, `admin-web/src/pages/CustomerInquiryPage.jsx`, 관련 docs |

## Master Agent 병합 책임

- FastAPI 공통 router 연결
- React `App.jsx` route 연결
- 필요 시 공통 CSS 최소 추가
- PostgreSQL 실데이터 API 확인
- `pytest`, frontend build, Playwright 검증
- 진행률 문서 갱신

## 병합 체크리스트

1. Sub Agent 변경 파일이 허용 범위를 벗어나지 않았는지 확인한다.
2. legacy 조사 결과와 API query가 같은 table/query 흐름을 기준으로 하는지 대조한다.
3. React page가 API 응답 field와 맞는지 확인한다.
4. Master Agent가 `router.py`와 `App.jsx`만 최소 수정해 연결한다.
5. PostgreSQL 실데이터 조회 결과를 확인한다.
6. `pytest`, `npm run build`, Playwright 순서로 검증한다.
7. `docs/2026-07-21_CUBICI_ADMIN_MIGRATION_PROGRESS_BASELINE.md`의 고객문의 완성도를 갱신한다.

## 진행률 보고 기준

- Legacy 좌측 메뉴 기준 전체 21개
- Legacy 후보 JSP 기준 61개
- React 실구현 화면 수
- legacy 메뉴 기준 완료/부분완료 수
- 주요 페이지별 보수적 완성도

## 다음 액션

- Sub Agent 결과를 수신한 뒤 Master Agent가 충돌 여부를 검토한다.
- 고객문의 화면을 API, React, route, 검증까지 통합한다.
