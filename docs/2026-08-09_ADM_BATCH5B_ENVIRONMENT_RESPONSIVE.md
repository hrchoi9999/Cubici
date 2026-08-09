# Cubici ADM Batch 5B - 환경설정 6개 화면

## 작업 범위

| ID | 화면 | Route | LV 기준 |
|---|---|---|---|
| ADM-07A | 관리자 등록 | `/admin/cubici/adminPreference/adminRegister_tab1` | 관리자 공통 UI 및 메뉴 구조 |
| ADM-07B | 요금제 관리 | `/admin/cubici/adminPreference/manageCharge` | 관리자 공통 UI 및 메뉴 구조 |
| ADM-07C | 연계코드 관리 | `/admin/cubici/adminPreference/managePromotion` | 관리자 공통 UI 및 메뉴 구조 |
| ADM-07D | 협력사 관리 | `/admin/cubici/adminPreference/managePartner` | `관리자화면10.png` 직접 기준 |
| ADM-07E | 머니뱅크 관리 | `/admin/cubici/adminPreference/manageMoneybank_tab1` | 승인된 관리자 공통 UI 기준 |
| ADM-07F | Prism System | `/admin/cubici/adminPreference/prizmConfig` | 승인된 Prism 관리자 방향 및 공통 UI 기준 |

## 구현 내용

- LV 협력사 화면처럼 첫 진입을 `검색 -> 요약 -> 목록 -> 페이지 번호` 중심으로 정리했다.
- 관리자 등록, 요금제, 연계코드, 협력사의 등록/수정 패널은 버튼 또는 상세 행 선택 후 표시한다.
- 머니뱅크 설정은 목록 route에서 편집 패널을 숨기고, 상세 선택 또는 상품등록 tab에서 표시한다.
- Prism System 설정 패널은 평가항목 선택 후 표시하고 최근 변경이력은 목록 화면에 유지한다.
- 6개 화면 pagination을 승인된 `pagingControls` 규격으로 통일했다.
- PC는 넓은 표를 화면 내부에서 스크롤하고, 모바일은 접힌 좌측 메뉴와 단일 열 검색 폼을 사용한다.
- 기존 API, 저장/수정/삭제 함수와 route 계약은 변경하지 않았다.
- Backend 소스, Git staging/commit/push, 운영 배포는 변경하지 않았다.

## 후보 이미지

경로: `docs/reference/lv-ui/admin/ADM-BATCH5B-ENVIRONMENT/candidate`

- `ADM-07A-ADMIN-ACCOUNT-PC.png`, `ADM-07A-ADMIN-ACCOUNT-MOBILE.png`
- `ADM-07B-CHARGE-PC.png`, `ADM-07B-CHARGE-MOBILE.png`
- `ADM-07C-PROMOTION-PC.png`, `ADM-07C-PROMOTION-MOBILE.png`
- `ADM-07D-PARTNER-PC.png`, `ADM-07D-PARTNER-MOBILE.png`
- `ADM-07E-MONEYBANK-PC.png`, `ADM-07E-MONEYBANK-MOBILE.png`
- `ADM-07F-PRIZM-SYSTEM-PC.png`, `ADM-07F-PRIZM-SYSTEM-MOBILE.png`

## 검증

| 검증 | 결과 |
|---|---|
| production build | 73 modules 통과, JS chunk 약 559.8kB 경고만 존재 |
| ADM Batch 5B focused Playwright | 6/6 통과, 11.4초 |
| PC/mobile body overflow | 6개 화면 모두 1px 이하 |
| 표 내부 스크롤 | PC/mobile 6개 화면 모두 통과 |
| pagination 색상/높이 | `#9fb2cf`/`#002e6e`, 높이 차이 1px 이하 |
| 목록 초기 상태/상세 열림 | 6개 화면 모두 통과 |
| 기존 개별 CRUD mock 테스트 | 인증 fixture 미주입으로 로그인 화면에서 0/6, 기능 실패 판정 제외 |

기존 개별 CRUD mock 테스트는 현재 관리자 인증 필수화 이전에 작성돼 `cubiciAdminAuth`를 주입하지 않는다. 이번 Batch의 focused 테스트는 동일 6개 화면에 인증을 주입해 목록 조회와 상세/등록 패널 열림까지 검증했다. 저장/삭제 및 실 DB E2E는 후속 관리자 기능 회귀에서 별도로 수행한다.

## 보수적 진행률

| 화면 | 화면 복원율 | 기능 구현율 | 주요 잔여 |
|---|---:|---:|---|
| ADM-07A 관리자 등록 | 100% | 55% | 화면 승인 완료, live CRUD/권한 E2E |
| ADM-07B 요금제 관리 | 100% | 55% | 화면 승인 완료, 삭제정책/실 DB E2E |
| ADM-07C 연계코드 관리 | 100% | 55% | 화면 승인 완료, 코드 매핑/실 DB E2E |
| ADM-07D 협력사 관리 | 100% | 55% | 화면 승인 완료, 주소검증/실 DB E2E |
| ADM-07E 머니뱅크 관리 | 100% | 50% | 화면 승인 완료, 상태/수수료 매핑 검산 |
| ADM-07F Prism System | 100% | 50% | 화면 승인 완료, RawData/Excel/legacy 산식 검산 |

사용자 승인에 따라 Batch 5B 화면 복원율은 100%로 확정했다. 내부 기능 구현률은 약 53%로 보수적으로 유지한다.

## 상태

- 관리자 직접 메뉴 최종 승인: 24/24
- 관리자 직접 메뉴 후보 검증: 24/24
- 관리자 상세/파생 화면: 9개 별도 관리
- legacy JSP 물리 파일 후보: 61개 별도 매핑
- Git staging/commit/push 및 운영 배포: 수행하지 않음
- 사용자 화면 승인: 2026-08-09 완료
- 다음 작업: 별도 승인 후 관리자 기능 회귀/잔여 상세 화면 계획 확정
