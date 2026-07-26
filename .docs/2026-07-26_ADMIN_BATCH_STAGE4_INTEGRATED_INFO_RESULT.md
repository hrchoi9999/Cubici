# 관리자단 4단계 통합정보 집계/검산 일괄작업 결과

## 범위

- 큐빅아이 통합정보 집계 기준 상태 표시
- 머니뱅크 통합정보 집계 기준 상태 표시
- 머니뱅크 통합 현황 잔액 검산 상태 표시
- 실제 PostgreSQL API 응답 기준 검증

제외:

- legacy 통계 procedure 완전 대조
- shop grouping 원천 정책 확정
- 잔액 검산 차이 자동 보정
- 취소/해지/상환취소 재계산 정책 확정

## 작업 결과

- 통합정보 API 응답에 `data_source_label`, `aggregation_status_label`, `shop_grouping_status_label`을 추가했다.
- 머니뱅크 통합 현황 API 응답에 `balance_reconcile_amount`, `balance_reconcile_diff`, `balance_reconcile_status_label`을 추가했다.
- 큐빅아이 통합정보 화면에 PostgreSQL 직접집계/legacy procedure 대조 필요/shop grouping 대조 필요 상태를 표시했다.
- 머니뱅크 통합정보 화면에 PostgreSQL 직접집계/legacy procedure 대조 필요/잔액 검산 상태를 표시했다.
- 머니뱅크 관리 통합 현황 화면에 집계 상태와 잔액검산 상태를 표시했다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/management/repository.py` | 통합정보 집계/검산 상태 필드 추가 |
| `admin-web/src/pages/CubiciIntegratedInfoPage.jsx` | 큐빅아이 통합정보 집계 상태 표시 |
| `admin-web/src/pages/MoneybankIntegratedInfoPage.jsx` | 머니뱅크 통합정보 집계/잔액검산 상태 표시 |
| `admin-web/src/pages/ManagementOverviewPage.jsx` | 머니뱅크 관리 통합 현황 집계/잔액검산 상태 표시 |
| `admin-web/tests/e2e/integrated-info.spec.js` | 통합정보 상태 표시 focused E2E 보강 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| backend domain route focused test | 통과: 69 passed |
| admin focused Playwright E2E | 통과: integrated-info 2 passed |
| admin-web production build | 통과: focused E2E runner 내 build 완료 |
| 실제 PostgreSQL API 조회 | 통과: `/v1/api/management/overview`, `/v1/api/management/member-summary` 200 |

실제 DB 기준:

- `/v1/api/management/overview`: `balance_reconcile_status_label=검산차이`
- `balance_reconcile_diff=-43,050,505`
- 이 차이는 취소/해지/상환취소 또는 legacy batch/procedure 산식 차이 가능성이 있어 운영 검수 항목으로 유지한다.

## 보수적 완료율 갱신

| 메뉴 | 이전 보수 완료율 | 현재 보수 완료율 | 비고 |
| --- | ---: | ---: | --- |
| 통합정보 - 큐빅아이 | 62% | 66% | 집계 기준 상태 표시 보강, legacy procedure/shop grouping 대조 잔여 |
| 통합정보 - 머니뱅크 | 62% | 67% | 집계 기준/잔액검산 상태 표시 보강, 산식 대조 잔여 |
| 머니뱅크 관리 - 통합 현황 | 60% | 64% | 잔액검산 상태 표시 보강, 운영 지표 정의/통계 산식 대조 잔여 |

관리자단 전체 운영 재현율은 보수적으로 71~75% 수준으로 본다.

## 다음 액션

1. 서버관리/Error Log 처리 workflow 보강
2. 고객문의/공지/템플릿 후속 상태 workflow 점검
3. 정산/상환 취소·해지 재계산 정책 문서화 및 운영 검수 시나리오 반영
4. 잔여 작업 완료 후 관리자단 전체 E2E milestone 1회 실행
