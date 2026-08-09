# Cubici ADM Batch 4 - 고객관리 3개 화면

## 작업 범위

| 코드 | 직접 메뉴 | Route | legacy 시각 기준 |
| --- | --- | --- | --- |
| ADM-05A | 고객문의 | `/admin/cubici/supportMember/manageInquiry` | 관리자 공통 검색/목록/상세 규격 |
| ADM-05B | 문자/이메일 | `/admin/cubici/supportMember/manageSms` | 관리자 공통 tab/검색/목록 규격 |
| ADM-05C | 고객 공지 관리 | `/admin/cubici/supportMember/manageBoard_tab1` | `관리자화면08.png` |

직접 캡처가 없는 고객문의와 문자/이메일은 ADM-00 공통 shell 및 `관리자화면08.png`의 고객관리 정보 구조를 기준으로 보정했다.

## 구현 내용

- 고객문의·문자/이메일·고객 공지 관리의 목록 중심 초기 화면 적용
- 비어 있는 문의 상세, 템플릿 편집, 게시글 편집 영역 초기 비노출
- 문의 선택, `보기`, `글쓰기` 동작 시 기존 상세/등록/수정 기능 노출 유지
- 공통 pagination을 legacy 중앙 페이지 표시와 유사한 버튼 간격·크기로 보정
- 모바일 검색 폼 단일열, 요약 상태 줄바꿈, 긴 표의 본문 내부 horizontal scroll 적용 확인
- 고객 공지의 서비스 공지/FAQ tab과 활성 메뉴 위치 유지
- Batch 3 pagination 높이 통일 CSS의 공통 적용 및 Batch 4 회귀 확인
- Batch 4 pagination을 관리자 공통 기준으로 확정: 이전/다음 `#9fb2cf`, 현재 페이지 `#002e6e`
- Backend API/schema 변경 없음

## 변경 파일

- `admin-web/src/pages/CustomerInquiryPage.jsx`
- `admin-web/src/pages/MessageTemplatePage.jsx`
- `admin-web/src/pages/CustomerBoardPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/adm-batch4-customer-management-responsive.spec.js`
- `docs/2026-08-09_ADM_BATCH3_MONEYBANK_OPERATION_RESPONSIVE.md`
- `docs/reference/lv-ui/page-progress-register.md`
- `docs/2026-08-09_ADM_BATCH4_CUSTOMER_MANAGEMENT_RESPONSIVE.md`

## 후보 이미지

`docs/reference/lv-ui/admin/ADM-BATCH4-CUSTOMER-MANAGEMENT/candidate`에 화면별 PC/mobile 총 6개를 생성했다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| Vite production build | 성공, 73 modules transformed |
| 3개 route PC/mobile 표시 | 3/3 통과, 5.4초 |
| 검색 query 및 활성 메뉴 | 3/3 통과 |
| 초기 편집 영역 비노출·동작 후 노출 | 3/3 통과 |
| 이전/현재/다음 버튼 높이 차이 | PC/mobile 모두 1px 이하 |
| pagination 공통 색상 | 이전/다음 회색, 현재 페이지 남색 통과 |
| body horizontal overflow | PC/mobile 모두 1px 이하 |
| 고객문의/템플릿/공지 API payload 및 admin auth pytest | 15/15 통과, 1.33초 |
| 실제 DB CRUD E2E | 미수행 |
| SMS/메일 외부 발송 | 추가개발 기능으로 제외 |

Vite JavaScript chunk 약 560kB 경고는 잔여 리스크로 유지한다.

## 화면별 보수적 진행률

| 화면 | 후보 화면 복원율 | 기능 구현률 | 남은 핵심 항목 |
| --- | ---: | ---: | --- |
| ADM-05A 고객문의 | 84% | 78% | 승인 완료, 실제 DB 답변 CRUD, 알림 연동 |
| ADM-05B 문자/이메일 | 84% | 72% | 승인 완료, 이메일 파생 route, 실제 외부 발송 제외 |
| ADM-05C 고객 공지 관리 | 92% | 75% | 승인 완료, 첨부파일, FAQ 파생 route, 노출정책 |

Batch 4 평균 후보 화면 복원율은 약 87%, 기능 구현률은 75%로 산정한다.

## 관리자 전체 진행 상태

| 기준 | 상태 |
| --- | --- |
| ADM-00 공통 기준 | 승인 완료 |
| ADM Batch 2·3 직접 메뉴 | 승인 12/24 |
| ADM Batch 4 후보 작성 | 3/3 |
| legacy 직접 메뉴 후보 검증 | 15/24 |
| legacy 직접 메뉴 최종 승인 | 15/24, Batch 4 승인 완료 |
| 상세/alias 포함 React route | 33개, 전체 회귀 전 |
| React page 파일 | 32개, 전체 회귀 전 |
| legacy JSP 물리 파일 후보 | 61개, 업무 규칙 검산 전 |
| 관리자 전체 기능 migration | 기존 63~67% 유지, 실제 DB/CRUD/산식 재검증 전 |

## 다음 단계

ADM Batch 4의 3개 직접 메뉴는 사용자 승인으로 `승인 15/24`에 반영했다. 다음 작업은 ADM Batch 5의 모니터링 3개 화면이다.

Git staging, commit, push, 운영 배포는 관리자 전체 milestone 전까지 수행하지 않는다.
