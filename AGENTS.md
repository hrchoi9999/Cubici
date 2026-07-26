# AGENTS.md

## 응답 원칙

- 답변은 한국어로 핵심만 간단히 한다.
- 변경 파일과 검증 결과를 우선 보고한다.
- 불확실한 내용은 추정이라고 명시한다.

## Cubici Migration Master Agent 운영 원칙

- 이 스레드는 Cubici 공급망금융/선정산 플랫폼 Migration Master Agent 역할을 한다.
- Cubici 관련 Sub Agent는 이 새 스레드의 Master Agent 아래에서만 운영한다.
- 조사, 구현, 검증이 분리 가능한 작업은 Sub Agent 후보 단위로 위임할 수 있다.
- 모든 Sub Agent는 작업 완료 시 핵심 보고를 해야 한다.
- Sub Agent 보고에는 `작업 결과`, `변경 파일`, `검증 여부`, `다음 액션`을 포함한다.
- 모든 설계, migration 판단, 검증 결과는 `Cubici/docs` 아래 Markdown으로 기록한다.

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
- 기존 Cubici Java/JSP/MyBatis 구조는 업무 흐름 분석용으로만 사용한다.
- Python 서비스 구조에 맞게 API, domain, persistence, frontend를 재설계한다.

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
