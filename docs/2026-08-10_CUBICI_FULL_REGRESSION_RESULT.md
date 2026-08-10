# Cubici 사용자·관리자 전체 회귀검증 결과

## 범위

- 사용자 React 화면 전체 LV 및 공통 UI 회귀
- 관리자 React 직접 메뉴 24개 LV 회귀
- 사용자·관리자 production build
- FastAPI 단위·API contract 회귀
- Docker PostgreSQL preflight와 DB 의존 테스트 가용성 확인

## 최종 판정

| 구분 | 결과 | 판정 |
|---|---:|---|
| Docker PostgreSQL preflight | connection 수락, `cubici_local` public base table 59개 | 통과 |
| 사용자 production build | 42 modules, 17.54초 | 통과 |
| 관리자 production build | 75 modules, 15.08초 | 통과 |
| FastAPI 비DB 회귀 | 132 passed, 7 skipped | 통과 |
| 사용자 Playwright | 102/102 시나리오 통과 | 통과 |
| 관리자 현재 LV 직접 메뉴 | 55/55 시나리오 통과 | 통과 |
| DB 쓰기 E2E | 132 passed, 4 skipped, 3 failed | 환경 미완료 |
| 구형 관리자 Batch/기능 테스트 | 현재 LV DOM·제목·검색 요청과 불일치 다수 | 테스트 부채 |

## 사용자 회귀

- Batch 7·8·9 회귀 23개와 M1 화면·공통 UI 회귀 79개를 모두 검증했다.
- 과거 fixture의 `GENERAL` 역할을 현재 사용자 서비스 권한인 `USER`로 통일했다.
- 로그인 mock 응답도 `USER` 역할을 포함하도록 수정했다.
- Q&A 목록에서 쓰기 화면으로 이동한 뒤 승인된 LV 쓰기 폼 구조를 확인하도록 오래된 제목 assertion을 교정했다.
- 외부 Pages URL 대신 로컬 `4310` preview를 사용하고, `240130_큐빅아이` 원본 HTML은 로컬 `4311`에서 제공해 기준 렌더링을 검증했다.

## 관리자 회귀

- `ADM-LV-01~10`: 23/23 통과했다.
- `ADM-LV-11~15`: 8/8 통과했다.
- `ADM-LV-16~24`: 24/24 통과했다.
- `ADM-LV-05~10`의 fixture만 다른 관리자 이메일을 사용해 로그인 화면으로 전환되던 문제를 테스트용 마스터 계정 기준으로 통일했다.
- 직접 메뉴 24개의 PC·모바일 렌더링, 표 overflow, 검색·상세·저장 mock 흐름과 그래프 canvas 검증은 모두 통과했다.

## 미완료·리스크

1. DB 쓰기 E2E 3건은 PostgreSQL 인증정보가 테스트 프로세스에 주입되지 않아 `fe_sendauth: no password supplied`로 실패했다. 제품 기능 실패로 판정하지 않았으며 보안상 자격증명을 자동 추출하지 않았다.
2. 구형 관리자 Batch 테스트에는 현재 LV에서 변경된 제목, DOM class, 탭 구조, 검색 요청 조건을 기대하는 항목이 남아 있다. 현재 승인 기준 테스트는 통과했지만, 릴리즈 전 구형 테스트 삭제·갱신 범위를 별도 Batch로 정리해야 한다.
3. Python 3.14 환경에서 pytest 종료 뒤 access violation 메시지가 발생했다. 테스트 assertion은 통과했으나 Python·psycopg/FastAPI 조합의 런타임 호환성 점검이 필요하다.
4. 결제, SMS, 메일, 실송금 등 외부 연동은 추가개발 범위이며 이번 회귀의 정상 동작 판정에서 제외했다.
5. 운영 배포와 운영 URL smoke는 이번 Batch 범위에 포함하지 않았다.

## 다음 단계

- 실제 DB 쓰기 E2E 인증환경 정비 및 3건 재검증
- 구형 관리자 회귀 테스트 정리
- 민감정보 점검 후 사용자·관리자 release candidate Git 작업
- Docker 운영 배포 및 Cloudflare 운영 URL smoke
