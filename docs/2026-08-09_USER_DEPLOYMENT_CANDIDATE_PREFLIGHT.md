# 사용자 화면 배포 후보 사전점검

- 점검일: 2026-08-09
- 대상 브랜치: `fix/cloudflare-admin-spa-routing`
- 기준 HEAD: `c440248 Restore legacy Cubici user UI`
- 목적: 사용자 LV 복원 결과만 운영 배포할 수 있도록 Git 후보 범위를 고정한다.

## 결론

- 사용자 배포 후보는 준비 가능하다.
- 사용자 production build는 통과했다.
- 직전 사용자 전체 회귀 결과는 화면 route smoke 2/2, 공통/edge smoke 30/30, backend pytest 127/127, DB Playwright 10/10이다.
- 현재 관리자 소스에도 미커밋 변경이 있으므로 현 작업 폴더에서 Cloudflare 번들을 바로 만들면 관리자 변경이 섞인다.
- 다음 batch에서는 사용자 후보만 선별 커밋한 뒤 해당 커밋을 기준으로 별도 clean worktree에서 번들을 빌드해야 한다.

## Git 기준점

| 항목 | 결과 |
| --- | --- |
| 현재 브랜치 | `fix/cloudflare-admin-spa-routing` |
| upstream | `origin/fix/cloudflare-admin-spa-routing` |
| 로컬 추적 ref 기준 차이 | ahead 0 / behind 0 |
| staged 파일 | 0 |
| 전체 변경 항목 | 148 |

주의: upstream 결과는 로컬 추적 ref 기준이다. 실제 push 직전에 `fetch` 후 다시 확인한다.

## 배포 후보 포함 범위

### 사용자 런타임

- `user-web/src/App.jsx`
- `user-web/src/main.jsx`
- `user-web/src/pages/AccountPages.jsx`
- `user-web/src/pages/CommercePages.jsx`
- `user-web/src/pages/HomePages.jsx`
- `user-web/src/pages/MoneybankPages.jsx`
- `user-web/src/pages/SupportPages.jsx`
- `user-web/src/shared/UserCore.jsx`
- `user-web/src/styles/final-ui-foundation.css`
- `user-web/public/final-ui/static/css/*.css`
- `user-web/public/final-ui/static/fonts/`의 런타임 폰트와 라이선스 파일
- `user-web/public/final-ui/static/img/`

### 사용자 기능 연동과 회귀 검증

- `service-api/src/cubici_service/accounts/repository.py`
- `service-api/src/cubici_service/api/v1/endpoints/accounts.py`
- `service-api/src/cubici_service/contracts/repository.py`
- 이번 변경에 연결된 `service-api/tests/` 테스트 4개
- 수정된 사용자 DB E2E 7개
- `user-web/tests/e2e/batch7-*`, `batch8-*`, `batch9-*`
- `user-web/tests/e2e/m1-*`

### 배포 구성

- `scripts/build-cloudflare-static-bundle.mjs`
  - `/admin`, `/admin/*` 정적 라우팅 보정 포함
  - clean worktree에서 기존 관리자 기준 버전과 함께 빌드한다.

### 기록 문서

- 사용자 LV 화면별 구현 결과 문서
- UC01~UC04 공통 UI 회귀 문서
- 사용자 전체 회귀 및 외부연동 분류 문서
- 사용자 화면 진행률 register와 본 사전점검 문서

## 배포 후보 제외 범위

- `admin-web/` 변경 및 관리자 E2E: 관리자 후속 작업용
- `AGENTS.md`: 운영 규칙 변경으로 배포 코드와 분리
- `240130_큐빅아이/`: 외주 UI 원본
- `cubici LV admin capture/`: 관리자 참고 캡처
- `docs/reference/` 이미지 자료: 로컬 LV 기준 자료이며 공개 배포 커밋과 분리
- `docs/*_smoke/`, `docs/240130_render_check/`, `.vite/`, `test-results/`: 생성 산출물
- `user-web/public/final-ui/static/js/`: React 런타임에서 사용하지 않는 vendor JS
- `user-web/public/final-ui/static/scss/`, CSS source map: 원본/개발 산출물
- `service-api/uv.lock`: 이번 기능 변경과 무관하게 테스트 환경에서 생성된 파일
- `.env`, `data_local/`, DB dump, service account, 실제 계정·결제·개인정보 자료

## 민감정보 및 용량 점검

- private key, AWS/GitHub/Google/OpenAI 형식 key 서명은 후보 경로에서 발견되지 않았다.
- 환경변수명 검색은 `service-api/src/cubici_service/core/config.py`의 설정 키 정의만 탐지했으며 값 노출은 확인되지 않았다.
- `service-api/.env`와 `data_local/`은 기존 ignore 적용 상태다.
- 관리자 계정 설정 문서는 계정정보 가능성이 있어 사용자 배포 후보에서 제외한다.
- `final-ui` 전체는 287개, 약 23.23MB다. vendor JS, SCSS, source map 등 비실행 파일은 제외한다.
- 런타임 자산의 최대 단일 파일은 약 1.02MB로 GitHub 단일 파일 제한 위험은 없다.

## Build 및 smoke 근거

- 사용자 production build: 성공, Vite 6.4.3, 37 modules, 약 2.29초
- legacy CSS의 `/resources/...` 경고는 사용자 단독 dist에는 남지만 Cloudflare bundle script가 `src/main/webapp/resources`를 `/resources`로 복사한다.
- 사용자 CSS와 import된 legacy CSS의 `/resources` 참조 140개를 정적으로 대조했으며 원본 누락은 0개다.
- 사용자 소스 변경 후 실행한 직전 회귀 결과:
  - route smoke: 2/2, PC 42 route와 mobile 17 alias 포함
  - common/edge smoke: 30/30
  - backend pytest: 127/127
  - DB Playwright: 10/10
- 이번 사전점검에서는 소스 기능 변경이 없어 장시간 E2E를 반복하지 않았다.

## 다음 batch

1. 실제 remote 최신 상태를 fetch해 divergence를 재확인한다.
2. 위 포함 목록만 경로 단위로 staging한다.
3. staged diff와 민감정보를 다시 검사한다.
4. 사용자 배포 후보를 1회 commit/push한다.
5. 해당 commit으로 clean worktree를 만들고 Cloudflare bundle을 빌드한다.
6. Docker API 상태 확인 후 Cloudflare 배포와 운영 URL smoke를 수행한다.

본 문서 작성 시점에는 staging, commit, push, 운영 배포를 수행하지 않았다.
