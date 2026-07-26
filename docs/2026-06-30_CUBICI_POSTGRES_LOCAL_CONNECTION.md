# Cubici PostgreSQL Local Connection

작성일: 2026-06-30

## 작업 결과

- 로컬 PostgreSQL 개발 접속 기준을 확정했다.
- 실제 비밀번호는 문서화하지 않고 `.env.example` 템플릿만 작성했다.
- PostgreSQL 17 설치 경로를 확인했다: `C:\PostgreSQL\17`
- `psql` 경로를 확인했다: `C:\PostgreSQL\17\pgsql\bin\psql.exe`
- PostgreSQL 서버를 `pg_ctl`로 기동했다.
- 현재 `127.0.0.1:5432` 포트는 열려 있다.
- `postgres`, `cubici_app` role을 생성했다.
- `cubici_local` DB를 생성했다.

## 확정 접속 기준

| 항목 | 값 |
|---|---|
| Host | `127.0.0.1` |
| Port | `5432` |
| Database | `cubici_local` |
| User | `cubici_app` |
| Schema | `public` |
| Password | `.env`에만 로컬 저장 |

## 환경변수 파일

- 템플릿: `Cubici/service-api/.env.example`
- 실제 파일: `Cubici/service-api/.env`
- `.env`는 Git 제외 대상이다.

## 운영 원칙

- 원본 DB 데이터는 `cubici_local` 로컬 PostgreSQL DB에만 적재한다.
- 원본 개인정보/결제/계좌/카드 값은 코드, 문서, 로그, Git commit에 기록하지 않는다.
- 외부 API, 결제, SMS, 메일은 local 환경에서 기본 비활성화한다.

## 다음 액션

1. `002_application_schema_draft.sql` DDL 수작업 검토
2. MySQL dump data를 애플리케이션 테이블 중심으로 PostgreSQL insert/copy 형식 변환
3. row count, 금액 합계, 상태 코드별 건수 검증
