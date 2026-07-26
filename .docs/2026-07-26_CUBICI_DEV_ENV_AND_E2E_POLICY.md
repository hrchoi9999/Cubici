# Cubici 개발환경 및 E2E 검증 원칙

## 목적

- Cubici migration 개발 중 전체 E2E 반복으로 시간이 과도하게 소요되는 문제를 방지한다.
- PostgreSQL timeout이 기능 실패처럼 오인되어 같은 검증을 반복하는 문제를 막는다.
- 개발 중 검증과 milestone 검증을 분리해 속도와 신뢰도를 함께 확보한다.

## 개발 DB 원칙

- 개발 DB는 Docker PostgreSQL을 기본으로 한다.
- Docker compose 파일은 `docker-compose.dev.yml`을 사용한다.
- 컨테이너명은 `cubici-postgres-dev`를 기준으로 한다.
- host 접속 포트는 `55432`를 기본으로 한다.
- 기존 Windows PostgreSQL `5432`는 timeout과 서비스 상태 불안정이 반복됐으므로 기본 개발 DB로 사용하지 않는다.
- DB volume, dump 변환 CSV, 검증 산출물은 `data_local` 아래에만 둔다.
- `data_local`은 git 제외 경로이므로 원본/민감 데이터가 원격 저장소에 올라가지 않는다.

## DB 시작 및 확인 원칙

- 기능 개발, API 테스트, E2E 실행 전 Docker DB healthcheck를 먼저 확인한다.
- DB preflight가 실패하면 Playwright나 전체 E2E를 실행하지 않는다.
- DB 실패는 기능 실패가 아니라 환경 blocker로 분류한다.
- PostgreSQL `connection timeout expired`가 반복되면 즉시 DB 상태를 확인하고, 같은 E2E를 반복하지 않는다.

## 개발 중 검증 범위

- 개발 중에는 방금 수정한 기능과 직접 관련된 focused test만 실행한다.
- 1개 기능 또는 좁은 화면 수정 후 전체 사용자단 E2E 또는 전체 관리자단 E2E를 실행하지 않는다.
- 기본 1차 검증 범위는 다음으로 제한한다.
  - frontend build
  - service-api domain/unit test
  - 변경 기능 focused E2E 1~2개
- 사용자가 개발 기능을 2번 검증하라고 지시한 경우, 2차 검증은 전체 E2E 확대가 아니라 해당 기능 범위의 focused 재검증을 의미한다.
- 2차 focused 검증은 같은 기능을 다른 각도에서 확인한다.
  - API/domain test 후 해당 화면 focused E2E
  - migration 적용 후 row count/CRUD 검증
  - 화면 build 후 해당 저장/조회 흐름 focused E2E
- focused E2E 실패 시 먼저 실패 유형을 분류한다.
  - 기능 실패
  - fixture/data 실패
  - 환경/DB 실패

## 2차 전체 검증 원칙

- 2차 전체 검증은 중요한 milestone에서만 실행한다.
- 사용자단 전체 E2E와 관리자단 전체 E2E는 분리해서 실행한다.
- 사용자단+관리자단 통합 full lifecycle E2E는 1차 개발 완료, 대규모 병합, 배포 후보 단계에서만 실행한다.
- 전체 E2E는 실패 원인 분류 없이 반복 실행하지 않는다.

## 권장 실행 순서

1. Docker DB health 확인.
2. DB preflight 실행.
3. 변경 범위 build/API test 실행.
4. 변경 기능 focused E2E 실행.
5. milestone일 때만 사용자단 전체 E2E 실행.
6. milestone일 때만 관리자단 전체 E2E 실행.
7. 배포 후보일 때만 통합 full lifecycle E2E 실행.

## 현재 기준 상태

- Docker PostgreSQL `cubici-postgres-dev`: 정상 실행 확인.
- Docker DB 포트: `127.0.0.1:55432`.
- legacy dump 적재: `45`개 테이블, `2,052,607`행, mismatch `0`.
- service-api DB 연결, API test, 사용자단 focused E2E 통과 확인.
