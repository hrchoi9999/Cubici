# Cubici Migration Thread Master Setup

작성일: 2026-06-30

## 작업 결과

- Cubici 공급망금융/선정산 플랫폼 Migration 전용 운영 원칙을 `Cubici/AGENTS.md`에 작성했다.
- Cubici migration 기록 위치를 `Cubici/docs`로 정했다.
- 이 스레드의 역할을 Cubici Migration Master Agent로 분리했다.
- Alt_CSM 본체는 사업리스크 score 제공 서비스로만 연동하고, Cubici 플랫폼은 선정산/정산/계약/상환 운영 서비스로 분리하는 원칙을 명시했다.

## 작업공간 구조 파악

현재 확인된 `Cubici` 상위 구조:

```text
Cubici/
  .git/
  .idea/
  .settings/
  .vscode/
  docs/
  src/
  target/
  AGENTS.md
  backup_20240508.sql
  cubici_redem.zip
  NEW_PC_CUBICI_WORK_REQUEST.md
  pom.xml
  README.md
  참고자료.txt
```

주요 legacy 구조:

```text
Cubici/src/main/java/egovframework/azon/
Cubici/src/main/resources/egovframework/sqlmap/mappers/
Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/
```

검증 결과:

- `Cubici` 폴더는 이미 존재하며 Java/Spring/JSP/MyBatis 기반 legacy 자료가 포함되어 있다.
- 외부 `D:\Cubici`는 조회하지 않았다.
- `Cubici/참고자료.txt`에는 계정/API/운영 관련 민감정보가 포함되어 있어 값은 문서에 재기록하지 않았다.
- `backup_20240508.sql`은 대용량 DB 백업 파일로 확인되며, 개인정보/민감정보 포함 가능성이 있어 직접 migration 입력으로 사용하기 전 익명화와 보안 검토가 필요하다.

## 운영 원칙

- 이 스레드는 Cubici 공급망금융/선정산 플랫폼 Migration Master Agent 역할을 한다.
- 작업 대상은 `D:\Alt_CSM` 내부의 `Cubici` 자료와 새로 만들 Cubici 서비스 폴더로 제한한다.
- `D:\Alt_CSM` 외부 폴더는 읽기, 검색, 수정, 복사, 실행을 모두 금지한다.
- 외부 `D:\Cubici`는 직접 참조하지 않는다.
- Cubici 관련 Sub Agent는 이 새 스레드의 Master Agent 아래에서만 운영한다.
- 모든 Sub Agent는 작업 완료 시 핵심 보고를 해야 한다.
- 보고에는 `작업 결과`, `변경 파일`, `검증 여부`, `다음 액션`을 포함한다.
- 개발 언어는 Python backend와 React frontend를 기본으로 한다.
- DB는 PostgreSQL을 기본으로 한다.
- Alt_CSM은 사업리스크 score 제공 서비스로만 연동한다.
- Cubici 플랫폼은 선정산/정산/계약/상환 운영 서비스로 분리한다.
- 모든 설계, migration 판단, 검증 결과는 `Cubici/docs` 아래 Markdown으로 기록한다.
- 실제 개인정보, 결제 식별정보, 계좌정보, 카드정보는 저장하지 않는다.
- 기존 Cubici Java/JSP/MyBatis 구조는 업무 흐름 분석용으로만 사용하고, Python 서비스 구조에 맞게 재설계한다.

## 초기 Sub Agent 후보

- Cubici Legacy 분석 Agent
- 선정산 Workflow Agent
- 정산/상환 Logic Agent
- Python API Migration Agent
- PostgreSQL Schema Agent
- React Admin Front Agent
- 테스트/검증 Agent

## Legacy 기능 목록

현재 파일명 기준으로 확인한 초기 기능 분류다. 세부 업무 규칙은 mapper와 controller 단위 추가 분석 전까지 추정이다.

| 영역 | 확인 근거 | 초기 기능 후보 | Migration 판단 |
|---|---|---|---|
| 회원/사업자 | `MemberMapper.xml`, `ManageMemberMapper.xml`, register JSP | 회원, 사업자, 업체 정보 관리 | Python core domain으로 분리 |
| 쇼핑몰 계정 | `AccountMapper.xml`, shop API component | 네이버, 쿠팡, 11번가, 인터파크, ESM 연동 계정 | 외부 API adapter로 분리 |
| 매출 | `SalesMapper.xml`, `InfoSalesMapper.xml`, sales JSP | 주문/매출 수집, 조회, 집계 | 정산/한도 산정의 원천 데이터 |
| 취소/반품 | `ReturnMapper.xml`, return JSP | 반품, 취소, 클레임 상태 | 매출 차감 이벤트로 정규화 |
| 정산 | `SettlementMapper.xml`, `InfoCalculateMapper.xml` | 정산 예정/확정, 달력/상세 조회 | PostgreSQL schema와 대사 로직 우선 |
| 선정산 | `AdvCalcMapper.xml`, `AdvCalcController.java`, moneybank JSP | 선정산 소개, 신청, 사전 계산, 심사 | Python API 우선 구현 |
| 계약/문서 | `MoneybankDocumentAPIMapper.xml`, `ClauseController.java` | 약관, 문서, 계약 연계 | 계약 domain으로 분리 |
| 상환/회수 | `AdminRedemMapper.xml`, `cubici_redem.zip` | 상환, 회수, 잔액, 운영 관리 | 정산 데이터와 연결 |
| 과금/결제 | `BillingMapper.xml`, admin billing mapper | 서비스 과금, 결제 이벤트 | 실제 결제정보 저장 금지, 후순위 |
| 관리자 | `Admin*Mapper.xml`, admin JSP 추정 | 심사, 운영, 회원/정산/상환 관리 | React Admin으로 재구성 |

## Workflow 분류

### 선정산 Workflow

1. 사업자/가맹점 식별
2. 쇼핑몰 계정 및 매출/정산 데이터 수집
3. Alt_CSM 사업리스크 score 조회
4. 선정산 가능 금액 산정
5. 신청 접수
6. 심사/승인
7. 계약/문서 생성
8. 지급 요청

### 정산 Workflow

1. 매출 이벤트 수집
2. 취소/반품/차감 반영
3. 정산 예정액 계산
4. 정산 확정
5. 선정산 지급액과 대사
6. 운영 리포트 생성

### 계약 Workflow

1. 선정산 승인 결과 기반 계약 초안 생성
2. 약정 조건 확정
3. 계약 상태 관리
4. 변경/해지/만기 처리
5. 계약 이력 및 감사 로그 기록

### 상환 Workflow

1. 지급 실행 내역 생성
2. 정산금 회수 예정 생성
3. 회수/상환 처리
4. 미회수/연체 상태 분류
5. 잔액과 계약 상태 갱신

## Python Migration 우선순위 제안

1. 민감정보 파일과 DB 백업의 사용 금지/격리 정책 확정
2. mapper/controller/JSP 기준 legacy 기능 inventory 작성
3. Cubici Python backend 서비스 폴더 생성
4. PostgreSQL 핵심 schema 초안 작성: merchant, shop_account, sales_event, settlement, advance_application, contract, repayment
5. 선정산 신청/상태 API 구현
6. 정산/상환 계산 domain service 구현
7. Alt_CSM score 조회 adapter 정의
8. React Admin 최소 화면 구현
9. 비식별 샘플 데이터 기반 E2E 검증

## 검증 여부

- `D:\Alt_CSM` 내부에서만 작업했다.
- 외부 `D:\Cubici`는 조회하지 않았다.
- 잘못 생성했던 `.Cubici` 폴더는 제거했다.
- 실제 개인정보, 결제 식별정보, 계좌정보, 카드정보를 새로 생성하거나 문서에 저장하지 않았다.
- 민감정보가 포함된 기존 파일은 값 없이 위험 항목으로만 기록했다.

## 다음 액션

- Cubici Legacy 분석 Agent가 mapper/controller/JSP 목록을 기준으로 기능 inventory를 상세화한다.
- 신규 Cubici 서비스 폴더명을 확정한 뒤 Python backend와 React frontend 골격을 생성한다.
- PostgreSQL schema 초안을 `Cubici/docs`에 먼저 기록한 뒤 구현한다.

