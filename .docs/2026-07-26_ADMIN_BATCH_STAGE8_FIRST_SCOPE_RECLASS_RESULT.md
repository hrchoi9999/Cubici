# 관리자단 8단계 1차/2차 범위 재분류 및 1차 보완 결과

## 범위 재분류

사용자 지시에 따라 금융상품 기준데이터와 Prism/RawData를 전부 2차로 미루지 않고 다음처럼 분리한다.

| 항목 | 1차 개발 범위 | 2차 개발 범위 |
| --- | --- | --- |
| 금융상품/제휴사 master | DB 기준 조회, 등록, 수정, 조건 미완성 상태 표시 | 실제 운영 상품조건 확정, seed 생성, 변경 이력 고도화 |
| Prism 평가결과 | `prizm_pcs_result`, `prizm_pms_result` 조회, 상세 표시, 계약/심사 화면 참조 | 평가 산식 재계산, Alt_CSM score 실연동, 정밀 산식 검산 |
| RawData | 대상 테이블/컬럼 조회, 공식 CRUD, preview | 공식 자동 실행/검증, Excel 대량 다운로드 권한/감사 정책 |

## 작업 결과

- `risk-results` API에 PCS/PMS 연결 상태 counts를 추가했다.
- 프리즘 지표 관리 화면에 PCS/PMS 건수, 연결 상태, 정책 상태, 2차 실연동 범위를 표시했다.
- 프리즘 지표 관리 focused E2E를 추가해 목록, 상태 표시, 상세 화면을 직접 검증했다.
- D~H 결과 문서와 관리자단 inventory 문서에서 1차/2차 범위와 완료율을 정정했다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/risk_results/repository.py` | `RiskResultCounts` 추가, PCS/PMS 연결 상태 집계 |
| `service-api/tests/test_domain_routes.py` | `risk-results` counts 응답 검증 |
| `admin-web/src/pages/PrizmManagementPage.jsx` | 프리즘 평가결과 조회/참조 상태 표시 |
| `admin-web/tests/e2e/prizm-management.spec.js` | 프리즘 지표 관리 focused E2E 추가 |
| `.docs/2026-07-26_ADMIN_BATCH_STAGE7_D_TO_H_CLOSURE_PLAN_RESULT.md` | 1차/2차 분리 기준 및 E2E 결과 갱신 |
| `.docs/2026-07-26_ADMIN_UNFINISHED_INVENTORY_AND_PARALLEL_PLAN.md` | 메뉴별 완료율/E2E 상태 갱신 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| backend focused test | 통과: 69 passed |
| 프리즘 지표 관리 focused E2E | 통과: 1 passed |
| 관리자단 전체 E2E milestone | 통과: 34 passed |

## 보수적 완료율

| 구분 | 완료율 |
| --- | ---: |
| 관리자단 전체 운영 재현 | 75~79% |
| 1차 제외 항목 제외 관리자단 운영 재현 | 86~90% |
| 프리즘 지표 관리 | 70% |
| 머니뱅크 금융상품 관리 | 70% |
| Prism System/RawData | 72% |

## 남은 1차 검수 항목

- legacy 세부 산식/정책 대조
- 정산/상환 잔액 불일치 운영 데이터 반복 검수
- 실제 운영 데이터로 화면별 저장/수정/삭제 반복 검수
- 미세 UI/레이아웃 보정

## 2차 유지 항목

- Hyphen/은행 실송금 연동
- 외부 쇼핑몰 API 실연동
- SMS/Email/Alert 실제 발송
- 외부 서버 metric 수집
- 금융상품 실운영 조건 확정/seed 생성
- Prism/RawData 산식 재계산 및 Alt_CSM 실연동
