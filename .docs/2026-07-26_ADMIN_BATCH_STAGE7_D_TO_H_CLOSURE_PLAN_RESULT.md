# 관리자단 D~H 마무리 일괄작업 결과

## 기준

사용자가 1차 범위에서 제외하기로 한 항목은 관리자단 1차 완료율 산정에서 제외한다.
제외 항목을 제외한 범위에서 화면, DB/API, 저장/상태변경, 검산 표시, focused 검증, 전체 E2E를 기준으로 마무리한다.

## 1차 범위 제외 항목

| 항목 | 처리 |
| --- | --- |
| Hyphen/경남은행 실송금 연동 | 2차 개발 |
| 외부 쇼핑몰 API 실연동 | 2차 개발 |
| SMS/Email/Alert 실제 발송 | 2차 개발 |
| 외부 서버 metric 수집 | 2차 개발 |
| 첨부파일 고도화, 팝업, 상단고정, 노출기간 | 후순위 정책 |
| 금융상품 master 실데이터 확정/seed 생성 | 2차 개발. 단, DB 기준 조회/등록/수정 운영 화면은 1차 범위 |
| Prism/RawData 실제 산식 운영 연동 | 2차 개발. 단, PCS/PMS 결과 조회, 계약/심사 화면 참조, RawData 공식 관리/preview는 1차 범위 |

## D. Route/Fallback 오판 방지

### 작업 결과

- 미구현 route가 `신청 접수` 등 구현 메뉴로 자동 매핑되던 fallback을 제거했다.
- 알 수 없는 route는 `Route 점검 / 미구현 경로` 화면으로 표시한다.
- 해당 화면은 구현 완료율 산정에서 `제외`로 표시한다.
- route fallback focused E2E를 추가했다.

### 변경 파일

- `admin-web/src/App.jsx`
- `admin-web/src/components/layout/AdminLayout.jsx`
- `admin-web/src/pages/MigrationRouteStatusPage.jsx`
- `admin-web/tests/e2e/route-fallback.spec.js`

### 검증

- backend focused test: 69 passed
- route fallback focused E2E: 1 passed

## E. 정산/상환/해지/취소 재계산 정책

### 현재 1차 완료 기준

- 정산 원본값은 덮어쓰지 않고 검산 상태만 표시한다.
- 상환/지급 작업 취소는 원장성 작업 취소로 보고 후속 이력을 재계산한다.
- 해지는 계약 상태 이벤트로 보고, 해지 자체가 상환잔액을 자동 0원 처리하지 않는다.
- 미상환잔액이 있는 해지, 강제해지, 사용자 타입 변경은 운영 정책 확정 전까지 자동 처리하지 않는다.

### 운영 검수 유지 항목

- 실제 DB 통합 현황 잔액 검산 차이: `-43,050,505`
- 가능 원인: legacy batch/procedure 산식 차이, 취소/해지/상환취소 후속 원장 반영 차이, 마이그레이션 원천 데이터 범위 차이
- 1차 완료 기준에서는 차이를 숨기지 않고 화면/문서에 표시하며, 자동 보정하지 않는다.

## F. 제외/후순위 항목 분리

### 화면 반영 상태

- Hyphen/은행 실연동: mock/2차 범위로 표시
- SMS/Email 실발송: `실발송 미연동`으로 표시
- 외부 서버 metric: `외부 서버 metric 미연동`으로 표시
- 게시판 첨부/노출정책: `첨부 미연동`, `노출정책 확인`으로 표시
- 금융상품/Prism/RawData: 조회/관리/상태 표시를 1차 범위로 유지하고, seed 확정/산식 재계산/Alt_CSM 실연동만 2차로 분리

### 판단

위 항목 중 외부 실연동과 정책 미확정 항목은 1차 관리자단 마무리의 실패 항목이 아니라 2차 또는 운영 데이터 확정 항목으로 분리한다.
금융상품 master 조회/관리와 Prism/RawData 결과 조회/참조는 1차 운영 재현에 포함한다.

## G. 관리자단 전체 E2E

관리자단 전체 E2E는 D~F 반영 후 milestone 1회로 실행했다.

### 실행 결과

- 명령: `D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe D:\Alt_CSM\Cubici\admin-web\scripts\run-playwright-e2e.mjs`
- 결과: 34 passed
- 보정 내역:
  - E2E runner가 stale API/user/admin server를 재사용하지 않도록 실행별 동적 포트를 사용한다.
  - Playwright `baseURL`은 `CUBICI_ADMIN_BASE_URL`을 우선 사용한다.
  - 보완서류 재제출 시 `PENDING_DOCUMENTS -> REQUEST` 복귀와 상태 이력을 남긴다.
  - 신청 완료 메시지는 대시보드 refresh와 분리해 사용자에게 즉시 표시한다.

## H. Git 일괄작업

전체 E2E 통과 후 Cubici 저장소 기준으로만 commit/push한다.
`D:\Alt_CSM`의 Alt_CSM 변경사항은 Cubici 작업 commit에 포함하지 않는다.

## 보수적 완료율

1차 제외 항목을 제외한 관리자단 운영 재현율은 정산/상환 반복검수 반영 후 88~91%로 본다.
금융상품 master 조회/관리, Prism/RawData 결과 조회/참조는 1차 범위에 포함해 보완했다.
남은 항목은 legacy batch/procedure 추가 확보 시 재대조, 운영 데이터 반복 검수, 2차 외부 연동이다.
