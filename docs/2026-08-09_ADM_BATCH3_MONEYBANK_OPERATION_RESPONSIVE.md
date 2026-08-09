# Cubici ADM Batch 3 - 머니뱅크 운영 6개 화면

## 작업 범위

| 코드 | 직접 메뉴 | Route | legacy 시각 기준 |
| --- | --- | --- | --- |
| ADM-04A | 신청 접수 | `/admin/moneybank/request` | 관리자 공통 검색/목록 규격 |
| ADM-04B | 심사 승인 | `/admin/moneybank/approval_tab1` | `관리자화면04.png`, `관리자화면05.png` 계열 |
| ADM-04C | 계약 관리 | `/admin/moneybank/approval_tab2` | `관리자화면04.png`, `관리자화면05.png` 계열 |
| ADM-04D | 정산 관리 | `/admin/moneybank/settlement` | 관리자 공통 검색/목록 규격 |
| ADM-04E | 상환 관리 | `/admin/moneybank/redemption` | `관리자화면04.png`, `관리자화면05.png` 계열 |
| ADM-04F | 프리즘 지표 관리 | `/admin/moneybank/manage` | `관리자화면07.png` 및 승인된 Prism 방향 |

## 구현·확인 내용

- ADM Batch 1 공통 Header, 좌측 메뉴, sub visual, 본문 shell 적용 확인
- 6개 직접 route의 활성 메뉴, 검색 조건, 목록, 요약 bar 반응형 확인
- 모바일 검색 폼 단일열, 요약 bar 2열, 긴 표의 본문 내부 horizontal scroll 확인
- 신청/심사/계약 tab 활성 상태와 route 분리 확인
- 프리즘 목록의 PC/mobile 정보 밀도와 검색 영역 보정 상태 확인
- Backend API/schema 변경 없음

## 사용자 재수정 반영

- 남색 합계/페이지 bar의 desktop padding을 15px에서 12px로 조정하고 React 상단 padding을 함께 줄여 높이를 약 20% 축소
- 모바일 합계 bar의 외곽 padding을 6px로 조정해 행 수에 따라 약 16~25% 축소
- legacy `overflowBox::before`의 파란 bar 폭을 90%에서 100%로 변경해 컬럼 영역과 동일 폭 적용
- `이전`, `다음`은 Batch 4와 같은 회색 `#9fb2cf`, 현재 페이지는 남색 `#002e6e`로 통일
- pagination 높이를 desktop 38px, mobile 36px로 통일
- Batch 3 후보 이미지 PC/mobile 12개 재생성

## 변경 파일

- `admin-web/tests/e2e/adm-batch3-moneybank-operation-responsive.spec.js`
- `docs/2026-08-09_ADM_BATCH2_SIX_PAGES_RESPONSIVE.md`
- `docs/reference/lv-ui/page-progress-register.md`
- `docs/2026-08-09_ADM_BATCH3_MONEYBANK_OPERATION_RESPONSIVE.md`

기존 페이지 구현과 공통 CSS를 재사용했으며 이번 Batch에서 업무 페이지 소스/API 계약은 변경하지 않았다.

## 후보 이미지

`docs/reference/lv-ui/admin/ADM-BATCH3-MONEYBANK-OPERATION/candidate`에 화면별 PC/mobile 총 12개를 생성했다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| Vite production build | 성공, 73 modules transformed |
| 6개 route PC/mobile 표시 | 6/6 통과, 10.5초 |
| 검색 query 및 활성 메뉴 | 6/6 통과 |
| body horizontal overflow | PC/mobile 모두 1px 이하 |
| 파란 bar/table 폭 차이 | PC/mobile 모두 1px 이하 |
| 이전/현재/다음 버튼 높이 차이 | PC/mobile 모두 1px 이하 |
| pagination 공통 색상 | 이전/다음 회색, 현재 페이지 남색 통과 |
| 계약 정책/정산 산식/API payload focused pytest | 53/53 통과, 1.22초 |
| 실제 DB/API lifecycle E2E | 미수행 |
| legacy 산식/Alt_CSM 재계산 검산 | 미수행 |

Vite JavaScript chunk 약 560kB 경고는 잔여 리스크로 유지한다.

## 화면별 보수적 진행률

| 화면 | 후보 화면 복원율 | 기능 구현률 | 남은 핵심 항목 |
| --- | ---: | ---: | --- |
| ADM-04A 신청 접수 | 86% | 72% | 후보 승인, 실제 DB, 상세/서류/write E2E |
| ADM-04B 심사 승인 | 88% | 70% | 후보 승인, 실제 DB, 수수료/상태 변경 E2E |
| ADM-04C 계약 관리 | 90% | 72% | 후보 승인, 계약 lifecycle DB E2E |
| ADM-04D 정산 관리 | 84% | 72% | 후보 승인, 실제 DB, 정산 산식 검산 |
| ADM-04E 상환 관리 | 88% | 75% | 후보 승인, 지급/상환/취소 DB E2E |
| ADM-04F 프리즘 지표 관리 | 80% | 70% | 후보 승인, legacy 산식 매트릭스, Alt_CSM 재계산 |

프리즘 화면은 현재 결과 목록/상세 중심이다. `관리자화면07.png`의 산식 매트릭스와 정보 구조가 달라 다른 5개 화면보다 복원율을 낮게 산정했다.

## 관리자 전체 진행 상태

| 기준 | 상태 |
| --- | --- |
| ADM-00 공통 기준 | 승인 완료 |
| ADM Batch 2 직접 메뉴 | 승인 6/24 |
| ADM Batch 3 직접 메뉴 | 승인 12/24에 포함 |
| legacy 직접 메뉴 후보 검증 | 12/24 |
| legacy 직접 메뉴 최종 승인 | 12/24, Batch 3 사용자 승인 완료 |
| alias/detail 포함 React route | 33개, 전체 회귀 전 |
| React page 파일 | 32개, 전체 회귀 전 |
| JSP 물리 파일 후보 | 61개, 산식/업무 규칙 검산 전 |
| 관리자 전체 기능 migration | 기존 63~67% 유지, 실제 DB/CRUD/산식 재검증 전 |

## 다음 단계

ADM Batch 3의 6개 직접 메뉴는 사용자 승인에 따라 `승인 12/24`로 전환했다. 다음 작업은 ADM Batch 4의 고객관리 3개 화면이다.

Git staging, commit, push, 운영 배포는 관리자 전체 milestone 전까지 수행하지 않는다.
