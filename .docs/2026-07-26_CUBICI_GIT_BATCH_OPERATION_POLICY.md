# Cubici Git Batch Operation Policy

## 목적

관리자단 일괄 개발 중 Git 정리, commit, push 때문에 시간이 늘어나는 일을 막기 위해 Git 운영 기준을 고정한다.

## 현재 기준

- 원격 저장소: `https://github.com/hrchoi9999/Cubici.git`
- GitHub 기준 브랜치: `origin/devCubici`
- GitHub `devCubici`는 service account JSON을 제외한 sanitized baseline이다.
- 로컬 `devCubici`는 기존 legacy history를 포함해 `origin/devCubici`와 갈라져 있다.
- 로컬 `devCubici`는 GitHub public push 기준으로 그대로 신뢰하지 않는다.

## 민감정보 이슈

- 기존 history에는 GitHub Push Protection이 차단한 Google Cloud service account JSON이 있었다.
- 차단 파일: `src/main/java/egovframework/azon/cmmn/service/cubicianalytics-8912962469e6.json`
- 이 파일은 로컬에 남아 있어도 Git 추적과 GitHub push 대상에서는 제외해야 한다.
- Push Protection unblock URL은 사용하지 않는다.

## 관리자단 일괄 개발 중 Git 원칙

1. 개발 중에는 기능 단위로 `git add`, `git commit`, `git push`를 반복하지 않는다.
2. Sub Agent 작업 결과도 개발 중에는 Git commit하지 않는다.
3. 변경 파일은 작업 완료 보고와 문서로만 추적한다.
4. 기능별 검증은 focused test로 수행한다.
5. 관리자단 전체 E2E는 1차 구현 완료 후 milestone에서 1회만 실행한다.
6. 개발, focused 검증, milestone E2E가 끝난 뒤 Git 정리를 1회 수행한다.

## 최종 Git 작업 순서

최종 Git 작업은 다음 순서로 1회만 수행한다.

1. `git status`로 변경 파일 전체 확인
2. `git check-ignore`로 DB dump, 원본자료, Hyphen/은행 문서, 첨부자료 제외 여부 확인
3. 민감정보 패턴 검색
4. 불필요한 `.DS_Store`, 로그, test result, cache 제외
5. sanitized 기준 브랜치에 최종 변경분 반영
6. build, focused 검증 결과, 관리자단 milestone E2E 결과 확인
7. 1회 staging
8. 1회 commit
9. 1회 push

## 최종 Push 전 필수 제외 대상

- `data_local/**`
- `reports/**`
- `.docs/hyphen-api-docs/**`
- `*.dump`
- `*.bak`
- `backup_*.sql`
- `db/mysql_legacy/*.sql`
- `db/mysql_legacy/*.dump`
- `db/postgres/*.dump`
- `service-api/.env`
- `.env`
- `.env.*`
- service account JSON
- 계좌정보, 카드정보, 결제 식별정보, 개인정보가 포함된 파일

## 작업 지연 방지 기준

- Git 충돌 해결은 개발 중에 반복하지 않는다.
- 전체 E2E 실패와 Git 정리를 동시에 처리하지 않는다.
- DB timeout 또는 E2E 환경 실패가 있으면 Git 작업을 보류한다.
- 최종 Git 정리는 기능 구현과 검증이 끝난 뒤 별도 단계로 수행한다.

## 다음 액션

- 관리자단 일괄 개발은 현재 Git 상태를 더 건드리지 않고 진행한다.
- 다음 실제 Git 작업은 관리자단 개발과 E2E 검증 완료 후 1회만 수행한다.
