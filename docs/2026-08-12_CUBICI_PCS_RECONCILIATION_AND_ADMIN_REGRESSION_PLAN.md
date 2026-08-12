# Cubici PCS 대조 및 관리자 최종 회귀검증 준비

## 이번 Batch 결론

- 대상: 계약과 연결되지 않는 PCS 결과 1건
- 판정: 계약 성립 전 또는 중단된 신청에서 보존된 정상 legacy 평가 결과
- 근거: 사용자 연결 정상, 같은 사용자의 다른 계약·PMS 존재, 동일 PCS `mbid`의 후속 계약·PMS·문서·쇼핑몰·상환 데이터 없음
- 처리: DB 변경 없음, 임의 계약 생성 없음, PCS 삭제 없음
- 개인정보 보호: 모든 확인은 건수와 관계 존재 여부만 집계했고 식별자는 출력·기록하지 않음

## 구조·legacy 근거

1. `D:/Cubici/src/main/java/egovframework/azon/admin/prizm/PrizmService.java`
   - `calcPrizmScore()`는 신청 상세를 조회해 PCS를 계산하고 결과를 먼저 저장한다.
2. `D:/Cubici/src/main/resources/egovframework/sqlmap/mappers/AdminJudgeMapper.xml`
   - legacy 관리자 신청·심사 조회는 신청 테이블에서 PCS를 LEFT JOIN한다.
3. `db/postgres/schema/002_application_schema_draft.sql`
   - PCS의 `mbid`, `user_no`는 nullable이다.
   - PMS의 `mbid`, `user_no`는 NOT NULL이다.
4. `db/postgres/migrations/003_core_indexes_and_constraints.sql`
   - PMS에는 계약 외래키가 있고 PCS에는 계약 외래키가 없다.

PCS와 계약의 미연결 자체를 무결성 실패로 취급하면 정상적인 계약 전 평가를 오탐한다. `scripts/audit_admin_data_quality.py`의 `PRI-01`은 PCS 사용자 연결 누락만 높은 심각도로 검사하도록 조정했다.

## 최종 관리자 회귀검증 실행안

각 단계는 별도 명령으로 실행하고 10분을 넘기지 않는다. 실패 시 전체를 반복하지 않고 `기능`, `fixture/data`, `환경/DB`로 먼저 분류한다.

| 순서 | 검증 단위 | 기준 |
| ---: | --- | --- |
| 1 | Docker DB preflight | `cubici-postgres-dev` healthy, PostgreSQL 접속 성공 |
| 2 | 데이터 품질 5개 도메인 | 31개 규칙 중 확정 이슈는 PMS 최신 쌍 3건과 협력사 담당자 3개만 유지 |
| 3 | Backend 관리자 API/domain | 인증·회원·계약·정산·상환·Prism·환경설정 focused test 통과 |
| 4 | 관리자 production build | TypeScript/Vite build 통과 |
| 5 | 직접 메뉴 responsive E2E | legacy 메뉴 기준 24/24, PC와 mobile 분리 확인 |
| 6 | 상세·파생 화면 E2E | React route 기준 추가 10/10 확인, 총 34개 route |
| 7 | PCS 불완전 결과 표시 | 계약 미성립 PCS가 오류 없이 표시되고 PMS 미산출 상태를 사실대로 표시 |
| 8 | 변경·저장 기능 | 로컬 disposable fixture만 사용하고 `finally` 정리, 원본 행 무변경 |
| 9 | 최종 보안·Git 사전점검 | `.env`, dump, 실제 개인정보, 계좌·결제자료가 추적·staging되지 않음 |

## 화면·기능 기준

| 산정 기준 | 현재 기준 | 이번 Batch 변화 |
| --- | ---: | --- |
| legacy 직접 메뉴 | 24개 | 화면 변경 없음 |
| 상세·파생 React route | 10개 | 화면 변경 없음 |
| 전체 React route | 34개 | PCS 불완전 상태 회귀 항목 추가 |
| legacy JSP 물리 파일 후보 | 61개 | 업무 흐름 참고 기준 유지 |

UI/LV 복원 승인 상태와 실제 기능 회귀 결과는 분리한다. 24개 직접 메뉴의 화면 승인은 유지되지만, 최종 회귀검증을 다시 실행하기 전에는 현재 실행 기준 통과로 재확정하지 않는다.

## 이번 Batch focused 검증

| 검증 | 결과 |
| --- | --- |
| Python 품질 스크립트 문법 | 통과 |
| 데이터 품질 5개 도메인 | 31개 규칙 중 29개 통과, 알려진 이슈 규칙 2개 |
| Prism 품질 규칙 | 6개 중 5개 통과, 최신 PCS/PMS 쌍 미완성 3건만 이슈 |
| 관리자 production build | 통과, 75 modules transformed |
| 기존 PCS/PMS 연결 화면 E2E | 통과 |
| 신규 PCS-only legacy 결과 E2E | 통과, 누락 상태·목록·상세 렌더링 확인 |
| diff 형식 검사 | 통과 |

Playwright browser bundle이 없는 로컬 환경에서도 이미 설치된 Chrome으로 focused 검증할 수 있도록 `admin-web/playwright.config.js`에 선택형 `CUBICI_PLAYWRIGHT_EXECUTABLE_PATH`를 추가했다. 환경변수를 지정하지 않으면 기존 기본 browser 동작을 그대로 사용한다.

## 잔여 제한

- PMS 최신 쌍 누락 3건과 PMS 등급 재판정 불일치 24건은 실거래·테스트 데이터 혼재 제한이다.
- 협력사 주담당자 누락 3개는 실제 담당자 원천 확인 전 임의 보정하지 않는다.
- 정산 보조 검산 28건과 통합 잔액 3,616원 차이는 별도 legacy 산식 replay 범위다.
- 2024-05-01 이후 핵심 거래 최신성 부족은 복원 snapshot의 운영 제한으로 유지한다.
- Git commit/push와 운영 배포는 이번 준비 Batch에 포함하지 않는다.
