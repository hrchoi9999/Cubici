# Cubici REG-1 최신 변경 전체 회귀검증

## 범위

- 기준일: 2026-08-12 KST
- Backend, 사용자 React, 관리자 React를 분리 검증했다.
- Git staging, commit, push, 운영 배포는 수행하지 않았다.
- 단일 실행이 10분을 넘지 않도록 E2E를 화면군별로 분할했다.

## 결과

| 구분 | 결과 | 판정 |
| --- | --- | --- |
| Docker PostgreSQL preflight | `cubici_local`, 60 tables | 통과 |
| Backend pytest | 150 passed, 8 skipped | 통과 |
| 사용자 production build | Vite build 성공 | 통과 |
| 사용자 E2E | 105 passed, 13 skipped, fail 0 | 통과 |
| 관리자 production build | Vite build 성공 | 통과 |
| 관리자 정식 E2E | 147 passed, 24 skipped, fail 0 | 통과 |
| 구형 관리자 반응형 E2E 강제 실행 | 12 passed, 12 failed | 테스트 부채 |
| `git diff --check` | 오류 없음 | 통과 |

Backend 8건과 사용자 13건, 관리자 24건의 skip은 `CUBICI_RUN_DB_E2E=1` 전용 항목이다. 관련 Q&A, 정산, 계약, 상환, 환경설정 CRUD는 선행 focused DB E2E 결과를 유지하며 이번 정식 회귀에서는 중복 실DB fixture 실행을 제외했다.

## 회귀 중 보정

- 사용자 라우트 smoke에 API mock을 추가해 임의 토큰의 인증 만료 영향을 제거했다.
- 사용자 실DB 전용 테스트는 다른 DB E2E와 동일한 skip 정책을 적용했다.
- 관리자 테스트의 메뉴명, LV selector, 테이블 단위, 다운로드 헤더 노출을 현재 승인 UI 계약에 맞췄다.
- 제품 화면과 API 코드는 REG-1에서 변경하지 않았다.

## 구형 반응형 테스트

기본 Playwright 설정에서 제외된 다음 5개 파일을 추가로 강제 실행했다.

- `adm-batch2-six-pages-responsive.spec.js`
- `adm-batch3-moneybank-operation-responsive.spec.js`
- `adm-batch4-customer-management-responsive.spec.js`
- `adm-batch5-monitoring-responsive.spec.js`
- `adm-batch5b-environment-responsive.spec.js`

총 24건 중 12건은 통과했고 12건은 현재 LV DOM·라우트 계약과 불일치했다. 정식 회귀 실패에는 포함하지 않으며, 삭제하지 않고 역사 테스트 부채로 유지한다.

## 정리 검증

- 임시 관리자 fixture: 0건
- 사용자 가입 fixture: 0건
- Q&A fixture: 0건
- 테스트 storage state: 삭제 확인
- 테스트 포트 listener: 0건
- LV reference: 백업 587개와 현재 587개, SHA-256 불일치 0건
- 회귀 중 변경된 reference 59개를 REG-1 시작 직전 승인본으로 복원

## 진행률

| 구분 | 화면 복원 | 내부 기능 |
| --- | ---: | ---: |
| 사용자 직접 화면 | 26/26, 100% | 90.4% 보수치 유지 |
| 사용자 공통 UI | 4/4, 100% | 회귀 통과 |
| 관리자 직접 메뉴 | 24/24, 100% | 84.5% 보수치 유지 |
| 관리자 상세·파생 | 10/10, 100% | 81.1% 보수치 유지 |
| 관리자 전체 | 34/34, 100% | 83.5% 보수치 유지 |

## 다음 Batch

`REL-1 릴리즈 준비 및 민감정보 점검`을 진행한다.

1. 변경 파일 소유권과 배포 포함 범위를 확정한다.
2. `.env`, DB dump, 계정정보, service account, 첨부 원본의 추적 여부를 점검한다.
3. 릴리즈 대상만 staging 후보로 정리하고 diff를 검토한다.
4. 사용자 승인 후에만 1회 commit/push와 운영 배포를 진행한다.
