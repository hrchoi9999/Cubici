# AGENTS.md

## 응답 원칙

- 답변은 한국어로 핵심만 간단히 한다.
- 변경 파일과 검증 결과를 우선 보고한다.
- 불확실한 내용은 추정이라고 명시한다.
- 진행률, 난이도, 리스크 평가는 보수적으로 산정한다.
- 진행률 산정 시 관리자 화면뿐 아니라 사용자 화면, 운영 배포, 전체 회귀검증, legacy 산식 검산 잔여분을 함께 반영한다.
- 관리자 화면 진행률 보고 시 legacy 메뉴 기준 전체 화면 수, 현재 migration 완료/부분완료 화면 수, 주요 페이지별 완성도를 함께 표시한다.
- 관리자 화면 수는 `legacy 메뉴 기준`, `상세/파생 화면 포함 기준`, `JSP 물리 파일 기준`을 구분해 보고한다.

## Cubici Migration Master Agent 운영 원칙

- 이 스레드는 Cubici 공급망금융/선정산 플랫폼 Migration Master Agent 역할을 한다.
- Cubici 관련 Sub Agent는 이 새 스레드의 Master Agent 아래에서만 운영한다.
- 조사, 구현, 검증이 분리 가능한 작업은 Sub Agent 후보 단위로 위임할 수 있다.
- 모든 Sub Agent는 작업 완료 시 핵심 보고를 해야 한다.
- Sub Agent 보고에는 `작업 결과`, `변경 파일`, `검증 여부`, `다음 액션`을 포함한다.
- 모든 설계, migration 판단, 검증 결과는 `Cubici/docs` 아래 Markdown으로 기록한다.
- 작업 관련 평가와 분석은 미검증 항목과 남은 작업을 명시해 보수적으로 보고한다.
- 화면별 완성도는 UI 표시, DB/API 연동, 저장/변경 기능, legacy 산식 검산, E2E 검증, 운영 배포 준비 여부를 분리해 보수적으로 산정한다.

## 작업공간 경계 원칙

- 작업 대상은 `D:\Alt_CSM` 내부의 `Cubici` 자료와 새로 만들 Cubici 서비스 폴더로 제한한다.
- `D:\Alt_CSM` 외부 폴더는 읽기, 검색, 수정, 복사, 실행을 모두 금지한다.
- 외부 `D:\Cubici`는 직접 참조하지 않는다.
- 필요한 legacy 자료는 사용자가 `D:\Alt_CSM\Cubici` 아래에 제공한 경우에만 참조한다.
- 예외가 필요하면 작업 전 사용자에게 명시적으로 확인받는다.

## 서비스 분리 원칙

- Alt_CSM은 사업리스크 score 제공 서비스로만 연동한다.
- Cubici 플랫폼은 선정산, 정산, 계약, 상환 운영 서비스로 분리한다.
- 대외/운영 기능은 Cubici 서비스 폴더에서 독립적으로 구현한다.

## 기술 원칙

- 개발 언어는 Python backend와 React frontend를 기본으로 한다.
- DB는 PostgreSQL을 기본으로 한다.
- 개발 DB는 Docker PostgreSQL을 기본으로 사용한다.
- Cubici 개발용 Docker PostgreSQL은 `docker-compose.dev.yml`의 `cubici-postgres-dev`를 기준으로 한다.
- Docker DB host port는 기존 Windows PostgreSQL `5432` 충돌과 timeout 회피를 위해 `55432`를 기본으로 한다.
- DB volume, 변환 CSV, 검증 산출물, 로그는 `D:\Alt_CSM\Cubici\data_local` 아래에만 둔다.
- `service-api/.env`의 로컬 개발 DB 포트는 Docker DB 기준 `CUBICI_DB_PORT=55432`를 기본으로 한다.
- Windows 설치 PostgreSQL은 명시적 사유가 있을 때만 사용하고, 기본 개발/E2E 기준으로 삼지 않는다.
- 기존 Cubici Java/JSP/MyBatis 구조는 업무 흐름 분석용으로만 사용한다.
- Python 서비스 구조에 맞게 API, domain, persistence, frontend를 재설계한다.

## 개발 검증 원칙

- 개발 중 검증은 해당 시점에 수정한 기능이 정확히 작동하는지 확인하는 focused test를 기본으로 한다.
- 기능 1개 또는 좁은 화면 수정 후 사용자단/관리자단 전체 E2E를 반복 실행하지 않는다.
- 1차 검증은 `build`, API/domain test, 변경 범위 focused E2E로 제한한다.
- 사용자가 개발 기능을 2번 검증하라고 지시한 경우, 2차 검증은 전체 E2E 확대가 아니라 해당 기능 범위의 focused 재검증을 의미한다.
- 2차 focused 검증은 같은 기능을 다른 각도에서 확인한다. 예: API/domain test 후 해당 화면 focused E2E, migration 적용 후 row count/CRUD 검증.
- 2차 전체 검증은 중요한 milestone, 릴리즈 후보, 대규모 병합 직후에만 실행한다.
- 2차 전체 검증은 사용자단 전체 E2E와 관리자단 전체 E2E를 분리해 각각 1회씩 실행한다.
- 사용자단+관리자단 통합 full lifecycle E2E는 1차 개발 완료 또는 배포 후보 단계에서만 실행한다.
- E2E 실행 전에는 반드시 DB preflight를 먼저 수행한다.
- DB preflight 실패, Docker DB unhealthy, PostgreSQL connection timeout이 발생하면 기능 디버깅을 중단하고 환경 blocker로 분류한다.
- 같은 PostgreSQL timeout 상태에서 Playwright 전체 E2E를 반복 실행하지 않는다.
- E2E 실패는 `기능 실패`, `fixture/data 실패`, `환경/DB 실패`로 먼저 분류한 뒤 다음 작업을 정한다.

## Git 운영 원칙

- 원격 저장소는 `https://github.com/hrchoi9999/Cubici.git`를 기준으로 한다.
- GitHub 공개 저장소에는 sanitized baseline과 검증 완료 코드만 올린다.
- 기존 legacy history에 포함된 service account JSON, DB dump, 원본 데이터, Hyphen/은행 문서, 계좌/결제/개인정보 파일은 commit/push하지 않는다.
- 관리자단 일괄 개발 중에는 기능 단위로 `git add`, `git commit`, `git push`를 반복하지 않는다.
- 관리자단 개발, focused 검증, milestone E2E가 모두 끝난 뒤 변경 파일을 최종 검토하고 1회만 staging, commit, push한다.
- 최종 Git 작업 전에는 `git status`, `git check-ignore`, 민감정보 패턴 검색, DB dump/첨부자료 추적 여부를 확인한다.
- Push Protection이 감지한 secret은 unblock으로 우회하지 않고 history 또는 staging 대상에서 제거한다.
- 현재 GitHub `devCubici`는 민감 JSON을 제외한 sanitized baseline 기준으로 관리한다.
- 로컬 기존 `devCubici` history는 GitHub public push 기준으로 신뢰하지 않고, 최종 반영 시 sanitized 기준으로 정리한다.

## 개인정보/결제정보 원칙

- 기존 서비스 재현 목적의 내부 원본 데이터는 로컬 개발 PostgreSQL DB에서만 제한적으로 사용한다.
- 실제 개인정보, 결제 식별정보, 계좌정보, 카드정보는 코드, 문서, 로그, Git commit에 기록하지 않는다.
- 원본 DB 백업, 복원 DB, export 산출물은 `D:\Alt_CSM\Cubici` 내부에서만 보관하고 외부 전송, 원격 업로드, 공개 배포를 금지한다.
- 계정정보, API key, 운영 DB 접속정보, 결제/SMS/메일 인증정보는 참조, 복사, 커밋, 재기록하지 않는다.
- 외부 API, 결제, SMS, 메일 발송은 개발환경에서 기본 비활성화한다.

## 초기 Sub Agent 후보

- Cubici Legacy 분석 Agent
- 선정산 Workflow Agent
- 정산/상환 Logic Agent
- Python API Migration Agent
- PostgreSQL Schema Agent
- React Admin Front Agent
- 테스트/검증 Agent
