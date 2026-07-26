# Cubici New Service Structure

작성일: 2026-06-30

## 작업 결과

- 기존 Java/JSP/MyBatis 원본은 `Cubici/src`에 그대로 두고 legacy 기준 자료로 유지한다.
- 신규 전환 개발용 폴더를 생성했다.
- 사용자용 React, 관리자용 React, Python API, PostgreSQL 전환 영역을 분리했다.
- 원본 내부 데이터는 `data_local`에만 보관하도록 Git 제외 구조를 추가했다.

## 적용 폴더 구조

```text
Cubici/
  src/                  # 기존 Java/JSP/MyBatis legacy 원본
  service-api/          # Python backend
    src/cubici_service/
    tests/
    pyproject.toml
  user-web/             # React 사용자용 페이지
    src/
    package.json
  admin-web/            # React 관리자 페이지
    src/
    package.json
  db/
    mysql_legacy/       # MySQL schema inventory
    postgres/
      schema/           # PostgreSQL schema drafts
      migrations/       # PostgreSQL migration files
    migration/          # MySQL -> PostgreSQL conversion tools
  data_local/           # Git 제외, 원본/변환 데이터 로컬 보관
  reports/              # Git 제외, 로컬 검증 리포트
  docs/
```

## 개발 기준

- Python 실행: `D:\Alt_CSM\.venv\Scripts\python.exe`
- Python 버전: 3.14.5
- Frontend: React
- DB: PostgreSQL
- 기존 DB 원본 데이터는 익명화하지 않고 로컬 PostgreSQL 재현에 사용한다.
- 원본 값은 코드, 문서, 로그, Git commit, 외부 서비스에 기록하지 않는다.

## 전환 순서

1. DB schema inventory
2. PostgreSQL 변환
3. 화면 inventory
   - 사용자용 페이지
   - 관리자 페이지
   - 모바일 페이지
4. Python API
5. React user/admin 구현
6. User/Admin E2E 검증

## 다음 작업

- MySQL backup에서 table/schema inventory를 추출한다.
- JSP 화면을 사용자/관리자/모바일로 분류한다.
- PostgreSQL DDL 초안을 `db/postgres/schema` 아래 작성한다.
- 사용자/관리자 공통 디자인 자산 이전 범위를 정한다.

