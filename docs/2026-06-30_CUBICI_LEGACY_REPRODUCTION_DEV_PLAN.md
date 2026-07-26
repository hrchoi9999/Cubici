# Cubici Legacy Reproduction Development Plan

작성일: 2026-06-30

## 전제조건

- 목표는 기존 Cubici 서비스를 최대한 그대로 재현해 로컬 개발환경에서 운영 가능하게 만드는 것이다.
- Backend는 Python 3.14.5 기반 `.venv`를 사용한다.
- Frontend는 React를 기본으로 한다.
- DB는 기존 MySQL 구조를 PostgreSQL로 전환한다.
- 기존 DB 내용은 내부자료로 보고, 관리자 화면 재현을 위해 익명화하지 않고 로컬 개발 DB에 복원한다.
- 단, 원본 값은 코드, 문서, 로그, Git commit, 외부 서비스에 기록하지 않는다.

## 개발 기본 전략

1. 기존 Java/JSP/MyBatis 시스템을 기능 명세와 화면 명세의 기준으로 사용한다.
2. 기존 MyBatis Mapper와 DB 백업을 기준으로 PostgreSQL schema를 먼저 재구성한다.
3. Python API는 기존 Controller/Mapper 단위가 아니라 업무 도메인 단위로 재설계한다.
4. React User/Admin은 기존 JSP 화면의 메뉴, 검색조건, 목록, 상세, 상태 변경 흐름을 우선 재현한다.
5. 외부 쇼핑몰, 결제, SMS, 메일 연동은 adapter interface만 만들고 개발환경에서는 stub/mock으로 차단한다.
6. 원본 데이터는 로컬 PostgreSQL DB에서만 조회하고, 화면/로그/문서에 불필요한 원문 노출을 남기지 않는다.

## 권장 폴더 구조

```text
Cubici/
  src/                  # 기존 Java 원본, 현재 위치에서 legacy 기준 자료로 유지
  service-api/          # Python backend
  user-web/             # React 사용자용 페이지
  admin-web/            # React 관리자 페이지
  db/
    mysql_legacy/       # 기존 schema inventory, 원본 SQL 위치 기록
    postgres/           # PostgreSQL DDL, migration script
    migration/          # MySQL -> PostgreSQL 변환 도구
  data_local/           # Git 제외, 원본/변환 데이터 로컬 보관
  docs/
```

`data_local`, 원본 SQL, DB dump, export 파일은 Git 제외 대상으로 둔다.

## 단계별 실행 방안

### 1단계: 민감자료 격리와 실행 차단

- `참고자료.txt`, `backup_*.sql`, 설정 properties, DB dump는 Git 제외 여부를 먼저 확인한다.
- 운영 DB, SMS, 결제, 메일, 쇼핑몰 API 설정은 개발환경에서 비활성화한다.
- 모든 개발 실행은 `D:\Alt_CSM\Cubici` 내부와 로컬 DB만 사용한다.

### 2단계: Legacy Inventory

- JSP 184개를 메뉴/화면 단위로 분류한다.
- Mapper XML을 업무 도메인 단위로 분류한다.
- Java Controller/Service/Mapper를 URL, view, query 흐름으로 연결한다.
- 산출물은 `Cubici/docs`에 Markdown으로 기록한다.

초기 도메인:

- 회원/사업자
- 쇼핑몰 계정
- 매출
- 취소/반품
- 정산
- 선정산
- 계약/문서
- 상환/회수
- 과금
- 관리자 운영

### 3단계: PostgreSQL 전환

- 기존 MySQL DDL과 실제 table 목록을 추출한다.
- MySQL type, index, enum/status code, date handling을 PostgreSQL로 매핑한다.
- 우선순위 schema:
  - merchant
  - shop_account
  - sales_event
  - return_event
  - settlement
  - advance_application
  - contract
  - repayment
  - admin_user
  - audit_log
- 기존 ID/key를 최대한 보존해 화면 재현과 대사를 쉽게 한다.

### 4단계: 원본 데이터 복원

- 원본 SQL은 로컬 PostgreSQL 변환 DB에만 적재한다.
- 익명화는 하지 않되 외부 전송, 원격 업로드, 로그 출력은 금지한다.
- migration 검증은 row count, 금액 합계, 상태 코드별 건수, 기간별 건수로 수행한다.

### 5단계: Python API 구현

- Python 실행 기준: `D:\Alt_CSM\.venv\Scripts\python.exe`
- 버전 기준: Python 3.14.5
- API는 기존 화면 재현 순서대로 구현한다.
- 우선 API:
  - 로그인/관리자 세션
  - 업체 조회
  - 매출 조회
  - 정산 조회
  - 선정산 신청 조회
  - 계약 조회
  - 상환 조회
  - 상태 변경 이력

### 6단계: React User/Admin 재현

- 기존 JSP 화면을 1:1 복사하지 않고 기능 단위로 재구현한다.
- 사용자 우선 화면:
  - 로그인/회원가입
  - 마이페이지
  - 쇼핑몰 계정 연결 상태
  - 매출/정산 조회
  - 선정산 신청
  - 계약/상환 상태
- 관리자 우선 화면:
  - 관리자 로그인
  - 관리자 대시보드
  - 업체 관리
  - 매출/거래내역
  - 정산 예정금
  - 선정산 신청
  - 계약 관리
  - 상환/회수 현황
  - 위험/연체 알림

## 난점과 대응

| 난점 | 대응 |
|---|---|
| MySQL -> PostgreSQL SQL 문법 차이 | 자동 변환 후 수작업 검증 |
| MyBatis dynamic SQL 해석 | XML query inventory를 먼저 작성 |
| JSP와 서버 세션 결합 | React + Python API 세션/JWT 정책 재설계 |
| 외부 API 실호출 위험 | adapter stub 기본값 적용 |
| 원본 개인정보 로컬 사용 | 로컬 DB 한정, 로그/문서/커밋 금지 |
| 화면 수가 많음 | 사용자/관리자 핵심 workflow부터 단계 구현 |

## 우선순위

1. Git 제외/민감자료 격리 규칙 확정
2. DB schema inventory 작성
3. MySQL dump를 PostgreSQL로 변환하는 절차 설계
4. 사용자/관리자 핵심 화면 inventory 작성
5. Python API 골격 생성
6. React User/Admin 골격 생성
7. 사용자 신청과 관리자 심사/정산 조회부터 E2E 재현

## 검증 기준

- 기존 DB row count와 PostgreSQL row count 일치
- 주요 금액 합계 일치
- 상태 코드별 건수 일치
- 기존 JSP 메뉴별 대응 React User/Admin 화면 존재
- 사용자 화면에서 신청/조회 가능
- 관리자 화면에서 핵심 조회/상태 확인 가능
- 외부 API, 결제, SMS, 메일 실호출 없음
