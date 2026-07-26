# Cubici 사용자 웹 초기 구현

## 작업 결과

- `user-web`을 React/Vite 사용자 서비스 앱으로 초기 구성했다.
- legacy 사용자 화면의 PC 헤더/메뉴 흐름을 기준으로 메인, 로그인, 회원가입, 머니뱅크 소개, 신청, 현황, 마이페이지, 매출/정산 조회 골격을 구현했다.
- legacy 이미지/CSS 자산은 복사하지 않고 `src/main/webapp/resources`를 Vite `publicDir`로 연결해 재사용하도록 구성했다.
- 메인/머니뱅크 현황/매출/정산 화면은 기존 FastAPI 목록 API를 조회해 로컬 DB 연결 상태와 요약값을 표시한다.
- 로그인, 회원가입, 머니뱅크 신청 저장은 아직 실제 저장 API가 붙지 않은 UI 준비 상태다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `user-web/package.json` | React/Vite 의존성 기준 추가 |
| `user-web/index.html` | Vite entry HTML 추가 |
| `user-web/vite.config.js` | user-web dev/preview port 및 legacy resources publicDir 설정 |
| `user-web/src/main.jsx` | React entry 추가 |
| `user-web/src/App.jsx` | 사용자 라우트/페이지/DB API 조회 UI 구현 |
| `user-web/src/styles/user-web.css` | 사용자 화면 기본 스타일 추가 |

## 구현된 초기 라우트

| 라우트 | 상태 |
| --- | --- |
| `/`, `/main` | 메인 화면, DB 요약 조회 |
| `/login` | 로그인 UI |
| `/mainSignUp` | 회원가입 UI |
| `/moneybank/intro/advpay` | 구매자금 선지급 소개 |
| `/moneybank/intro/advcalc` | 매출 선정산 소개 |
| `/moneybank/intro/creditpay` | 신용대출 소개 |
| `/moneybank/request` | 머니뱅크 신청 UI |
| `/moneybank/current` | 머니뱅크 상환 현황 DB 조회 |
| `/cubici/salesInfo/sales` | 매출 목록 DB 조회 |
| `/cubici/calculateInfo/details` | 정산 목록 DB 조회 |
| `/cubici/calculateInfo/calendar` | 정산 목록 DB 조회 기반 임시 화면 |
| `/cubici/mypage/*` | 마이페이지 기본 골격 |

## 검증 결과

실행:

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe - <asset-check>
```

결과:

| 항목 | 결과 |
| --- | --- |
| `user-web/src/App.jsx` legacy asset 참조 | 누락 0 |
| `user-web/src/styles/user-web.css` legacy asset 참조 | 누락 0 |

빌드 검증:

- `npm`은 현재 셸 PATH에 없어 실행하지 못했다.
- Codex 번들 `pnpm` 실행은 `D:\Alt_CSM` 외부 실행 금지 원칙 때문에 승인되지 않았다.
- 따라서 `npm install`, `npm run build`, Playwright 화면 검증은 아직 미수행이다.

## 다음 액션

1. 사용자가 Node/npm 실행 예외를 승인하면 `user-web` 의존성 설치와 build 검증을 수행한다.
2. 사용자 화면 중 DB 저장이 필요한 로그인/회원가입/머니뱅크 신청 API를 순차 구현한다.
3. 모바일 legacy JSP 기준으로 반응형 세부 layout을 보강한다.

## 2026-07-23 추가 진행

### 작업 결과

- 사용자 화면의 DB 조회 범위를 확대했다.
- 메인 대시보드에 회원, 계약, 매출, 반품/교환, 정산, 상환 API 조회를 연결했다.
- `/moneybank/current`에 계약/신청 현황과 상환 현황 테이블을 함께 표시했다.
- `/moneybank/request`에 실제 계정/계약 조회 기반 최근 신청 상태 요약을 추가했다.
- `/cubici/salesInfo/return` 반품/교환 목록 화면을 DB 조회 기반으로 추가했다.
- `/cubici/mypage/*`에 회원 계정 요약 정보를 DB 조회 기반으로 표시했다.
- `scripts/start-user-local.ps1`을 추가해 API와 사용자 웹을 함께 실행할 수 있게 했다.
- `user-web`은 별도 `node_modules` 설치 없이 `D:\Alt_CSM` 내부 `admin-web/node_modules`와 `.tools/node`를 재사용해 build 가능하도록 설정했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `user-web/src/App.jsx` | 계약, 계정, 반품/교환 API 연결 및 사용자 화면 확장 |
| `user-web/src/styles/user-web.css` | 계약 상태, 프로필 요약 UI 스타일 추가 |
| `user-web/vite.config.js` | legacy `/resources` public root 및 내부 dependency alias 설정 |
| `scripts/start-user-local.ps1` | 사용자 웹/API 로컬 실행 스크립트 추가 |

### 검증 결과

DB repository 직접 검증:

| 데이터셋 | total |
| --- | ---: |
| accounts | 45 |
| contracts | 7 |
| sales | 2,390 |
| returns | 775 |
| settlements | 469 |
| redemptions | 6 |

asset 검증:

| 항목 | 결과 |
| --- | --- |
| `/resources/...` asset 참조 | 누락 0 |

build 검증:

```powershell
D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe D:\Alt_CSM\Cubici\admin-web\node_modules\vite\bin\vite.js build
```

결과:

- Vite build 성공
- 변환 모듈: 29
- output: `user-web/dist`

HTTP 검증:

| URL | 결과 |
| --- | --- |
| `http://127.0.0.1:5175/` | 200 |
| `http://127.0.0.1:5175/moneybank/current` | 200 |
| `http://127.0.0.1:8000/v1/api/contracts?limit=1&offset=0` | 200 |
| `http://127.0.0.1:8000/v1/api/sales/returns?limit=1&offset=0` | 200 |

### 다음 액션

1. 사용자 신청 저장 API를 구현한다.
2. 로그인/회원가입은 실제 인증 정책 확정 전까지 local mock submit 상태로 유지한다.
3. 사용자 화면을 legacy PC/mobile JSP 기준으로 세부 보정한다.

## 2026-07-23 신청 저장 API 진행

### 작업 결과

- 사용자 머니뱅크 신청 저장 API를 구현했다.
- 신규 endpoint는 `POST /v1/api/contracts/requests`이다.
- 저장 대상은 `moneybank_contract`, `moneybank_contract_shop`, `contract_status_history`이다.
- legacy `MONEYBANK_USER_REQUEST`의 신청 상태 `00`은 신규 DB에서 `REQUEST`로 매핑했다.
- `mbid`는 legacy 형식인 `상품코드 + 월문자 + 일년 + 3자리 일련번호`로 생성한다.
- 신청 쇼핑몰은 선택값 중 실제 `shop_accounts`에 연결된 쇼핑몰만 `moneybank_contract_shop`에 저장한다.
- 동일 사용자/상품에 `REQUEST`, `PENDING_REVIEW` 상태 신청이 이미 있으면 중복 신청으로 거부한다.
- 사용자 신청 화면의 `서비스 신청` 버튼을 실제 POST API에 연결했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/contracts/repository.py` | 신청 저장 모델/로직 추가 |
| `service-api/src/cubici_service/api/v1/endpoints/contracts.py` | 신청 저장 endpoint 추가 |
| `service-api/tests/test_domain_routes.py` | 신규 endpoint 등록/응답 테스트 추가 |
| `user-web/src/App.jsx` | 머니뱅크 신청 버튼 POST 연결 |
| `user-web/src/styles/user-web.css` | 신청 버튼/결과 메시지 스타일 추가 |

### 검증 결과

단위 테스트:

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe -m pytest D:\Alt_CSM\Cubici\service-api\tests\test_domain_routes.py -q
```

결과:

- 50 passed

DB 저장 검증:

| 항목 | 결과 |
| --- | --- |
| 테스트 user | `user_no=72` |
| 신청 쇼핑몰 | `NAVER`, `COUPANG` |
| 생성 mbid | `MPG2326124` |
| 생성 contract row | 1 |
| 생성 shop row | 2 |
| 테스트 데이터 정리 | 완료 |

HTTP endpoint 검증:

| 항목 | 결과 |
| --- | --- |
| `POST /v1/api/contracts/requests` | 200 |
| 응답 `insert_code` | 0 |
| 응답 `status` | `REQUEST` |
| 테스트 데이터 정리 | 완료 |

user-web build:

```powershell
D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe D:\Alt_CSM\Cubici\admin-web\node_modules\vite\bin\vite.js build
```

결과:

- Vite build 성공
- asset 누락 0
- `user-web/dist`에 `WEB-INF`, `META-INF`가 복사되지 않음을 확인했다.
- legacy CSS 내부의 `/resources/...` 절대경로 경고는 남아 있으나 build 실패는 아니며, 운영 배포 정적 자산 경로 정책에서 후속 정리한다.

### 다음 액션

1. 신청서류 파일 업로드를 사용자 신청 완료 흐름에 연결한다.
2. 사용자 `머니뱅크 현황`에서 방금 신청한 `REQUEST` 상태가 바로 보이도록 화면 새로고침/상태 반영을 보강한다.
3. legacy 신청 조건 체크를 신규 API에 단계적으로 반영한다.

## 2026-07-23 신청서류 업로드 연결

### 작업 결과

- 사용자 머니뱅크 신청 완료 후 신청서류 파일을 같은 `mbid`로 업로드하도록 연결했다.
- 기존 `POST /v1/api/contracts/{mbid}/documents/files` API를 재사용했다.
- 사용자 화면 파일 매핑은 다음과 같이 적용했다.

| 사용자 입력 | API `document_type` |
| --- | --- |
| 사업자등록증 | `regNo` |
| 대표자 신분증 | `CBInfo` |

- 업로드 허용 확장자는 기존 API 기준 `jpg`, `jpeg`, `png`, `hwp`, `pdf`이다.
- 파일 크기 제한은 기존 API 기준 5MB이다.
- 저장 위치는 `D:\Alt_CSM\Cubici\data_local\documents` 하위로 확인했다.
- user-web dev port `5175`가 FastAPI CORS 기본 허용 origin에 포함되도록 보강했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `user-web/src/App.jsx` | 신청 성공 후 파일 업로드 연결, 업로드 결과 표시 |
| `user-web/src/styles/user-web.css` | 파일 안내/업로드 목록 스타일 추가 |
| `service-api/src/cubici_service/core/config.py` | CORS 기본 허용 origin에 `http://127.0.0.1:5175` 추가 |

### 검증 결과

신청 + 업로드 흐름 TestClient 검증:

| 항목 | 결과 |
| --- | --- |
| 신청 생성 | 200 |
| 생성 mbid | `MPG2326124` |
| 사업자등록증 업로드 `regNo` | 200 |
| 대표자 신분증 업로드 `CBInfo` | 200 |
| 파일 목록 조회 | 200, total 2 |
| 테스트 DB row 정리 | 완료 |
| 테스트 저장 파일 정리 | 완료 |

반복 검증:

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 50 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |

주의:

- build 중 legacy CSS 내부의 `/resources/...` 절대경로 경고가 남아 있다.
- 이 경고는 build 실패는 아니며, 운영 배포 정적 자산 경로 정책에서 후속 정리한다.

### 다음 액션

1. 신청 완료 후 사용자 현황 화면에서 새 `REQUEST` 신청이 바로 보이도록 상태 갱신을 보강한다.
2. legacy 신청 조건 체크를 신규 API에 반영한다.
3. 사용자 로그인/회원가입 실제 저장 및 인증 정책을 확정한다.

## 2026-07-23 신청 후 현황 반영 보강

### 작업 결과

- 사용자 공통 대시보드 조회 훅에 `refresh()`를 추가했다.
- 머니뱅크 신청 저장 및 신청서류 업로드 완료 후 계약/신청 목록을 즉시 재조회하도록 연결했다.
- 머니뱅크 신청 화면과 현황 화면의 상단 상태 영역에 수동 새로고침 버튼을 추가했다.
- 신청 성공 메시지에서 `서비스 현황 보기` 링크로 이동해 새 `REQUEST` 상태를 확인할 수 있게 했다.
- 머니뱅크 현황 화면 상단에 최신 계약/신청 상태 strip을 추가했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `user-web/src/App.jsx` | 대시보드 데이터 `refresh()` 추가, 신청 성공 후 재조회, 현황 화면 최신 상태 표시 |
| `user-web/src/styles/user-web.css` | 현황 링크, 새로고침 버튼 스타일 추가 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 50 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 신청 생성 후 계약 목록 조회 | 200, 생성 `mbid` 조회 확인 |
| 테스트 DB row 정리 | 완료 |

주의:

- build 중 legacy CSS 내부의 `/resources/...` 절대경로 경고가 남아 있다.
- 위 신청 생성 후 목록 조회 검증은 테스트용 product code `ZZ`로 생성한 뒤 관련 row를 삭제했다.

### 다음 액션

1. legacy 신청 조건 체크를 신규 신청 API에 반영한다.
2. 사용자 로그인/회원가입 저장 및 인증 정책을 확정한다.
3. 사용자 화면별 DB API 연결 누락 항목을 계속 축소한다.

## 2026-07-23 legacy 신청 조건 체크 반영

### 작업 결과

- legacy `AdvCalcMapper.advanceRequest`의 신청 가능 조건을 신규 `POST /v1/api/contracts/requests`에 반영했다.
- 신규 API는 신청 row 생성 전에 다음 조건을 확인한다.

| legacy 조건 | 신규 적용 |
| --- | --- |
| `user_type != '02'`, `user_type = '01'` | `users.user_type = 'USER'`만 허용 |
| 사업자번호 존재 | `users.biz_num` 필수 |
| 사업기간 1년 이상 | `users.biz_setup_date` 기준 1년 이상 |
| 제외 업종 아님 | legacy numeric sector `13` 차단 |
| 개인사업자 | `users.biz_type = 'CORPORATE'` 차단, `GENERAL/SIMPLE/TAXFREE`는 개인사업자 계열로 추정 적용 |
| 대표자 나이 20세 이상 | `representative_age` 입력 시 20세 이상 확인 |
| 신청 중복 방지 | 동일 사용자/상품의 `REQUEST`, `PENDING_REVIEW` 중복 차단 |
| 신청 쇼핑몰 존재 | 선택 쇼핑몰이 모두 `shop_accounts`에 연결되어 있어야 함 |

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/contracts/repository.py` | 신청 조건 검증 helper 추가, 선택 쇼핑몰 누락 차단, `representative_age` 선택 입력 추가 |
| `service-api/tests/test_domain_routes.py` | 신청 조건 차단/통과 단위 테스트 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | legacy 조건 매핑 및 검증 기록 추가 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 52 passed |
| 신청 생성 후 계약 목록 조회 | 200, 생성 `mbid` 조회 확인 |
| 테스트 DB row 정리 | 완료 |

### 보류/추정

- legacy의 신분증/운전면허 본인확인 외부 API 호출은 현재 실제 호출하지 않기로 한 내부 테스트 원칙에 따라 제외했다.
- `users.biz_type`의 `GENERAL/SIMPLE/TAXFREE`를 개인사업자 계열로 보는 것은 신규 DB 코드값 기준 추정이다. 운영 전 코드 정의를 재확인해야 한다.
- legacy `sectors != '13'`의 `13` 코드명은 현재 PostgreSQL 이관 DB에 코드 테이블이 없어 명칭 확인이 필요하다.

### 다음 액션

1. 사용자 로그인/회원가입 저장 및 인증 정책을 확정한다.
2. 사용자 화면별 DB API 연결 누락 항목을 계속 축소한다.
3. 본인확인/약관동의/신청서류 필수 여부를 운영 정책으로 분리해 확정한다.

## 2026-07-23 사용자 회원가입/로그인 기본 구현

### 작업 결과

- 사용자 회원가입 저장 API를 추가했다.
- 사용자 로그인 API와 내 정보 조회 API를 추가했다.
- 신규 가입 비밀번호는 `pbkdf2_sha256` 해시로 `users.password`에 저장한다.
- 인증은 로컬 migration 개발용 서명 토큰 방식으로 우선 구현했다.
- user-web 로그인/회원가입 화면을 실제 API에 연결했다.
- 로그인/가입 성공 시 user-web localStorage에 토큰과 사용자 정보를 저장하고 마이페이지로 이동한다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/core/config.py` | `CUBICI_AUTH_SECRET` 설정 추가 |
| `service-api/src/cubici_service/accounts/repository.py` | 회원가입, 로그인, 토큰 생성/검증, 내 정보 조회 구현 |
| `service-api/src/cubici_service/api/v1/endpoints/accounts.py` | `/accounts/signup`, `/accounts/login`, `/accounts/me` 추가 |
| `service-api/tests/test_domain_routes.py` | 계정 endpoint route/payload 테스트 추가 |
| `user-web/src/App.jsx` | 로그인/회원가입 form API 연결, localStorage 인증 상태 표시 |
| `user-web/src/styles/user-web.css` | 인증 메시지, 버튼, select 스타일 추가 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 55 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB 회원가입 | 200 |
| 실제 DB 로그인 | 200 |
| 실제 DB `/accounts/me` 조회 | 200 |
| 테스트 DB row 정리 | 완료 |

### 보류/추정

- legacy 기존 사용자 비밀번호 형식은 아직 확정하지 않았다. 신규 해시 형식이 아닌 기존 password 값은 현재 로그인 대상에서 제외한다.
- 운영용 인증은 access/refresh token, 세션 저장, 비밀번호 재설정, 계정 잠금, 감사 로그 정책을 별도 확정해야 한다.
- 현재 토큰 방식은 로컬 migration 검증용이다.

### 다음 액션

1. 사용자 화면별 DB API 연결 누락 항목을 계속 축소한다.
2. 회원가입 후 쇼핑몰 계정 연결 UI/API를 구현한다.
3. 본인확인/약관동의/신청서류 필수 여부를 운영 정책으로 분리해 확정한다.

## 2026-07-23 쇼핑몰 계정 연결 UI/API 구현

### 작업 결과

- 로그인 사용자 기준 쇼핑몰 계정 조회 API를 추가했다.
- 로그인 사용자 기준 쇼핑몰 계정 등록 API를 추가했다.
- user-web 마이페이지에 쇼핑몰 계정 연결 form과 연결 목록 table을 추가했다.
- 회원가입/로그인 후 저장된 local token을 사용해 `/accounts/me/shops`를 호출하도록 연결했다.
- 신규 연결 쇼핑몰은 `shop_accounts`에 `status='Y'`, `del_yn='N'`으로 저장한다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/accounts/repository.py` | `shop_accounts` 조회/등록 모델과 repository 추가 |
| `service-api/src/cubici_service/api/v1/endpoints/accounts.py` | `/accounts/me/shops` GET/POST 추가 |
| `service-api/tests/test_domain_routes.py` | 쇼핑몰 계정 endpoint route/payload 테스트 추가 |
| `user-web/src/App.jsx` | 마이페이지 쇼핑몰 연결 form/list 추가, 인증 fetch helper 추가 |
| `user-web/src/styles/user-web.css` | 연결 목록 compact table 스타일 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 57 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB 회원가입 | 200 |
| 실제 DB 로그인 | 200 |
| 실제 DB 쇼핑몰 계정 등록 | 200 |
| 실제 DB 쇼핑몰 계정 목록 조회 | 200, total 1 |
| 테스트 DB row 정리 | 완료 |

### 보류/추정

- 실제 쇼핑몰 API 연결 검증은 아직 하지 않았다. 현재는 계정정보 저장/조회까지만 구현했다.
- `shop_account_password`, `api_key`, `api_secret_key`는 DB 저장 대상이다. 운영 전 암호화 저장 정책을 확정해야 한다.
- legacy의 numeric `SHOP_TYPE`과 신규 string `shop_type` 매핑은 운영 전 정리해야 한다.

### 다음 액션

1. 사용자 신청 화면이 로그인 사용자의 계정/쇼핑몰을 기준으로 동작하도록 전환한다.
2. 본인확인/약관동의/신청서류 필수 여부를 운영 정책으로 분리해 확정한다.
3. 사용자 화면별 DB API 연결 누락 항목을 계속 축소한다.

## 2026-07-23 로그인 사용자 기준 머니뱅크 신청 전환

### 작업 결과

- 계약 목록 API에 `user_no` 필터를 추가했다.
- 사용자 공통 대시보드 조회 훅이 `userNo`를 받으면 해당 사용자의 계약만 조회하도록 보강했다.
- 머니뱅크 신청 화면은 전체 회원 목록의 첫 계정을 쓰지 않고 local token의 로그인 사용자 정보를 사용하도록 전환했다.
- 신청 화면의 운영 쇼핑몰은 `/accounts/me/shops` 기준 연결 쇼핑몰만 표시하도록 전환했다.
- 연결 쇼핑몰이 없거나 미로그인 상태에서는 신청 버튼을 비활성화한다.
- 사용자 머니뱅크 현황 화면도 로그인 사용자의 계약 목록만 조회하도록 전환했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/contracts/repository.py` | 계약 목록 `user_no` 필터 추가 |
| `service-api/src/cubici_service/api/v1/endpoints/contracts.py` | `/contracts?user_no=` query 추가 |
| `service-api/tests/test_domain_routes.py` | 계약 목록 `user_no` 전달 테스트 추가 |
| `user-web/src/App.jsx` | 신청/현황 화면을 로그인 사용자 및 연결 쇼핑몰 기준으로 전환 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 57 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB 회원가입 | 200 |
| 실제 DB 로그인 | 200 |
| 실제 DB 쇼핑몰 계정 등록 | 200 |
| 실제 DB 머니뱅크 신청 | 200 |
| 실제 DB `user_no` 계약 목록 조회 | 200, 생성 `mbid` 조회 확인 |
| 테스트 DB row 정리 | 완료 |

### 보류/추정

- 기존 legacy 사용자 비밀번호 로그인이 아직 지원되지 않아, 현재 흐름은 신규 가입/로그인 사용자 기준으로 검증했다.
- 기존 이관 `shop_accounts.shop_type` 값이 numeric code인 경우 신규 string code와의 매핑 보정이 필요할 수 있다.
- 신청서류 필수 여부, 본인확인, 약관동의는 아직 저장 전 필수조건으로 강제하지 않았다.

### 다음 액션

1. 본인확인/약관동의/신청서류 필수 여부를 운영 정책으로 분리해 확정한다.
2. 사용자 매출/정산/반품 화면도 로그인 사용자 쇼핑몰 기준 필터링으로 전환한다.
3. legacy numeric `SHOP_TYPE`과 신규 string `shop_type` 매핑 정책을 정리한다.

## 2026-07-23 로그인 사용자 쇼핑몰 기준 매출/정산/반품 필터링

### 작업 결과

- 매출 목록 API에 `shop_pairs` 필터를 추가했다.
- 반품/클레임 목록 API에 `shop_pairs` 필터를 추가했다.
- 정산 목록 API에 `shop_pairs` 필터를 추가했다.
- user-web 매출/반품/정산 화면이 로그인 사용자의 `/accounts/me/shops` 연결 쇼핑몰 기준으로 데이터를 조회하도록 전환했다.
- 로그인 상태에서 연결 쇼핑몰 조회 전이거나 연결 쇼핑몰이 없으면 `shop_pairs=__none__`을 전달해 전체 데이터가 노출되지 않도록 했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/sales/repository.py` | 매출/반품 `shop_pairs` 조건 생성 및 조회 필터 적용 |
| `service-api/src/cubici_service/api/v1/endpoints/sales.py` | `/sales/orders`, `/sales/returns` query에 `shop_pairs` 추가 |
| `service-api/src/cubici_service/settlements/repository.py` | 정산 `shop_pairs` 조건 생성 및 기존 `shop_type` 비교 보정 |
| `service-api/src/cubici_service/api/v1/endpoints/settlements.py` | `/settlements` query에 `shop_pairs` 추가 |
| `service-api/tests/test_domain_routes.py` | sales/returns/settlements `shop_pairs` 전달 테스트 보강 |
| `user-web/src/App.jsx` | 로그인 사용자 연결 쇼핑몰 기반 매출/반품/정산 조회 전환 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| PostgreSQL 기동 | `C:\PostgreSQL\17\pgsql\bin\pg_ctl.exe`, DB ready 확인 |
| DB 연결 확인 | `cubici_local/public`, application table 53개 |
| `service-api/tests/test_domain_routes.py` | 57 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB `/sales/orders?shop_pairs=__none__` | 200, total 0 |
| 실제 DB `/sales/returns?shop_pairs=__none__` | 200, total 0 |
| 실제 DB `/settlements?shop_pairs=__none__` | 200, total 0 |
| 실제 DB `/sales/orders?shop_pairs=NAVER:socialinker` | 200, total 2113, 반환 pair 일치 |
| 실제 DB `/sales/returns?shop_pairs=NAVER:socialinker` | 200, total 646, 반환 pair 일치 |
| 실제 DB `/settlements?shop_pairs=NAVER:socialinker` | 200, total 355, 반환 pair 일치 |

### 보류/추정

- legacy numeric `SHOP_TYPE`과 신규 string `shop_type` 매핑 정책은 아직 최종 확정 전이다.
- 현재 필터는 `shop_type + shop_id` exact match 기준이다. legacy에서 동일 판매자를 여러 쇼핑몰 ID 패턴으로 묶는 정책이 있으면 별도 매핑 테이블이 필요할 수 있다.
- 기존 legacy 사용자 비밀번호 로그인은 아직 지원하지 않아, 현 검증은 신규 token session 기준 사용자 화면 흐름에 대한 검증이다.

### 다음 액션

1. 본인확인/약관동의/신청서류 필수 여부를 운영 정책으로 분리하고 API 저장 전 검증 여부를 확정한다.
2. legacy numeric `SHOP_TYPE`과 신규 string `shop_type` 매핑 정책을 정리한다.
3. 사용자 화면에서 잔여 정적/샘플 데이터 영역을 실제 API 데이터로 계속 전환한다.

## 2026-07-23 머니뱅크 신청 정책 확인값 적용

### 작업 결과

- 머니뱅크 신청 생성 API에 본인확인 여부, 약관동의 여부, 제출 예정 필수서류 유형을 추가했다.
- 신청 API는 `identity_confirmed`, `terms_agreed`, 필수서류 `regNo`, `CBInfo`가 충족되지 않으면 422로 거절한다.
- 사용자 신청 화면은 본인확인/약관동의 체크와 사업자등록증/대표자 신분증 파일 선택이 없으면 신청 API를 호출하지 않도록 보강했다.
- 기존 파일 업로드 API는 유지하며, 신청 생성 후 선택된 필수서류를 기존 document upload flow로 업로드한다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/contracts/repository.py` | 신청 정책 필드 및 `_validate_contract_request_policy` 추가 |
| `service-api/tests/test_domain_routes.py` | 정책 미충족/충족 테스트 및 신청 payload 테스트 보강 |
| `user-web/src/App.jsx` | 본인확인/약관동의/필수 파일 선택 검증 추가 |
| `user-web/src/styles/user-web.css` | 정책 체크 UI 스타일 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 59 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB 회원가입 | 200 |
| 실제 DB 쇼핑몰 연결 | 200 |
| 실제 DB 정책 미충족 신청 | 422 |
| 실제 DB 정책 충족 신청 | 200, `mbid` 생성 확인 |
| 테스트 DB row 정리 | 완료 |

### 보류/추정

- 신청 생성과 파일 업로드는 현재 별도 API 호출이다. 사용자가 파일을 선택했는지는 user-web에서 강제하고, API는 제출 예정 서류 유형을 검증한다.
- 신청 생성 후 파일 업로드가 실패하면 계약 row는 이미 생성될 수 있다. 운영 전에는 신청 생성+파일 업로드를 하나의 workflow 상태로 관리하거나, 미업로드 상태를 관리자 보완요청 대상으로 분리해야 한다.
- 본인확인은 현재 체크값 저장 전 검증 수준이다. 외부 본인확인 서비스 연동 여부는 별도 정책 확정이 필요하다.

### 다음 액션

1. legacy numeric `SHOP_TYPE`과 신규 string `shop_type` 매핑 정책을 정리한다.
2. 신청 생성 후 파일 업로드 실패 시 상태/재시도/보완요청 정책을 구현한다.
3. 사용자 화면 잔여 정적/샘플 데이터 영역을 실제 API 데이터로 계속 전환한다.

## 2026-07-23 legacy SHOP_TYPE 매핑 정책 적용

### 작업 결과

- legacy numeric `SHOP_TYPE`을 신규 Python API의 문자열 `shop_type`으로 변환하는 공통 normalizer를 추가했다.
- 신규 DB 저장/조회 기준은 문자열 코드로 유지한다.
- API 입력은 legacy numeric code와 신규 문자열 code를 모두 허용한다.
- 쇼핑몰 계정 등록, 머니뱅크 신청, 매출/반품/정산 `shop_pairs`, 정산 `shop_type` 필터가 공통 매핑을 사용하도록 전환했다.
- 실제 PostgreSQL 이관 데이터는 현재 `NAVER`, `COUPANG`, `GMARKET`, `STREET11`, `AUCTION` 문자열로 정규화되어 있음을 확인했다.

### 매핑 기준

| legacy code | 신규 code | 비고 |
| --- | --- | --- |
| `1` | `INTERPARK` | legacy 흔적은 있으나 현재 user-web 1차 대상에서는 제외 |
| `2` | `GMARKET` | 지마켓 |
| `3` | `AUCTION` | 옥션 |
| `4` | `STREET11` | 11번가 |
| `11` | `COUPANG` | 쿠팡 |
| `14` | `NAVER` | 네이버 |

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/core/shop_types.py` | legacy numeric/string shop type 공통 normalizer 추가 |
| `service-api/src/cubici_service/accounts/repository.py` | 쇼핑몰 계정 등록 시 공통 normalizer 사용 |
| `service-api/src/cubici_service/contracts/repository.py` | 신청 쇼핑몰 type 정규화 공통화 |
| `service-api/src/cubici_service/sales/repository.py` | 매출/반품 `shop_pairs` 공통 parser 사용 |
| `service-api/src/cubici_service/settlements/repository.py` | 정산 `shop_pairs`, `shop_type` 공통 parser 사용 |
| `service-api/tests/test_domain_routes.py` | legacy numeric code 매핑 테스트 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 매핑 정책/검증 결과 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 60 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB `shop_pairs=NAVER:socialinker` 매출 조회 | 200, total 2113 |
| 실제 DB `shop_pairs=14:socialinker` 매출 조회 | 200, total 2113 |
| 실제 DB `shop_pairs=NAVER:socialinker` 반품 조회 | 200, total 646 |
| 실제 DB `shop_pairs=14:socialinker` 반품 조회 | 200, total 646 |
| 실제 DB `shop_pairs=NAVER:socialinker` 정산 조회 | 200, total 355 |
| 실제 DB `shop_pairs=14:socialinker` 정산 조회 | 200, total 355 |
| 실제 DB `shop_type=14` 정산 조회 | 200, total 381 |
| 실제 DB 쇼핑몰 등록 `shop_type=14` | 200, `NAVER` 저장 확인 |
| 실제 DB 신청 `request_shop_types=['14']` | 200, `NAVER` 저장 확인 |
| 테스트 DB row 정리 | 완료 |

### 보류/추정

- `INTERPARK`는 legacy code `1`로 확인되지만 현재 이관 데이터와 user-web 주요 화면에는 없다. 운영 대상 포함 여부는 후속 확정이 필요하다.
- legacy 일부 workflow는 `SHOP_ID REGEXP` 방식으로 여러 계정을 묶는다. 현재 신규 사용자 화면의 매출/반품/정산 필터는 exact `shop_id` 기준이다.
- 동일 사업자 기준 여러 쇼핑몰 ID를 그룹핑하는 정책이 필요하면 별도 seller mapping table을 추가해야 한다.

### 다음 액션

1. 신청 생성 후 파일 업로드 실패 시 상태/재시도/보완요청 정책을 구현한다.
2. legacy `SHOP_ID REGEXP` 기반 그룹핑 로직이 필요한 화면을 분류한다.
3. 사용자 화면 잔여 정적/샘플 데이터 영역을 실제 API 데이터로 계속 전환한다.

## 2026-07-23 신청서류 업로드 실패 보완요청 처리

### 작업 결과

- 계약 상태 변경 action에 `document_pending`, `document_ready`를 추가했다.
- 신청 생성 후 서류 업로드가 실패하면 user-web이 기존 `mbid`를 `PENDING_DOCUMENTS` 상태로 변경하도록 했다.
- `PENDING_DOCUMENTS` 상태의 신청건은 중복 신청 방지 대상에 포함했다.
- 사용자 현황 화면에서 `PENDING_DOCUMENTS` 신청건에 대해 사업자등록증/대표자 신분증을 재업로드할 수 있도록 보완서류 제출 UI를 추가했다.
- 보완서류 업로드 성공 시 기존 `mbid`를 `REQUEST` 상태로 복귀시키고 상태 이력을 남긴다.
- 사용자 화면의 계약 상태 표시는 raw code 대신 주요 한글 label로 표시하도록 보강했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/contracts/repository.py` | `document_pending`, `document_ready` 상태 action 및 중복 신청 방지 조건 추가 |
| `service-api/tests/test_domain_routes.py` | `document_pending` 상태변경 payload 테스트 추가 |
| `user-web/src/App.jsx` | 신청 업로드 실패 시 보완요청 상태 처리, 현황 화면 보완서류 재업로드 UI 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 61 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB 회원가입 | 200 |
| 실제 DB 쇼핑몰 연결 | 200 |
| 실제 DB 머니뱅크 신청 | 200 |
| 실제 DB `document_pending` 상태 변경 | 200, `PENDING_DOCUMENTS` |
| `PENDING_DOCUMENTS` 상태 중복 신청 | 409 |
| 실제 DB 보완서류 `regNo`, `CBInfo` 업로드 | 각 200 |
| 실제 DB `document_ready` 상태 변경 | 200, `REQUEST` |
| 실제 DB 파일 목록 | 200, total 2 |
| 상태 이력 | `document_pending`, `document_ready` 2건 확인 |
| 테스트 DB row 및 파일 정리 | 완료 |

### 보류/추정

- 현재 보완서류 재업로드는 사용자 현황 화면의 최신 계약 1건 기준이다. 여러 보완요청 건을 동시에 처리해야 하면 계약별 상세/업로드 화면이 필요하다.
- `document_ready`는 심사 재진입을 의미하므로 현재 `REQUEST`로 복귀시킨다. 운영 상태 체계가 더 세분화되면 별도 `DOCUMENT_READY` 상태를 둘지 재검토한다.
- 실제 외부 본인확인/전자약관 보관 연동은 아직 구현하지 않았다.

### 다음 액션

1. legacy `SHOP_ID REGEXP` 기반 그룹핑 로직이 필요한 화면을 분류한다.
2. 사용자 화면 잔여 정적/샘플 데이터 영역을 실제 API 데이터로 계속 전환한다.
3. 사용자 계약 상세/서류 목록 화면 분리 필요성을 검토한다.

## 2026-07-23 legacy SHOP_ID 그룹핑 로직 분류

### 작업 결과

- legacy `SHOP_ID REGEXP` 사용 위치를 조사했다.
- 그룹핑 로직은 `InfoSales`, `InfoCalculate`, `InfoIntegrated`, `Invento` 영역에 집중되어 있음을 확인했다.
- 현재 PostgreSQL 이관 데이터에서는 동일 `user_no + shop_type`에 여러 `shop_id`가 묶인 사례가 0건임을 확인했다.
- 현 단계 사용자 매출/반품/정산 목록 API는 exact `shop_type + shop_id` pair 방식을 유지하기로 했다.
- 산식/통합정보/재고 화면 migration 시에는 regexp 직접 이식 대신 seller group table 기반 재설계를 후속 과제로 분리했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `docs/2026-07-23_CUBICI_SHOP_ID_GROUPING_POLICY.md` | legacy `SHOP_ID REGEXP` 사용 영역, 신규 적용 정책, 후속 구현 후보 기록 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/다음 액션 요약 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| legacy `SHOP_ID REGEXP` 검색 | 완료 |
| `shopInfoMap` controller/JSP 전달 구조 확인 | 완료 |
| mapper별 주요 사용 영역 분류 | 완료 |
| PostgreSQL 다중 `shop_id` 그룹 확인 | 0건 |
| 신규 API 변경 | 없음 |

### 보류/추정

- 현 DB에는 다중 그룹 사례가 없지만 운영 데이터 전체에서는 발생 가능성이 있다.
- 정산 산식 migration 때 `seller_shop_groups`, `seller_shop_group_members` 같은 명시적 매핑 table을 검토해야 한다.
- 쿠팡은 legacy 일부 mapper에서 regexp가 아니라 exact `SHOP_ID = #{COUPANG_ID}`를 사용하므로 쇼핑몰별 정책 차이를 유지해야 한다.

### 다음 액션

1. 사용자 화면 잔여 정적/샘플 데이터 영역을 실제 API 데이터로 계속 전환한다.
2. 사용자 계약 상세/서류 목록 화면 분리 필요성을 검토한다.
3. 선정산 산식 migration 착수 시 seller group table 설계를 먼저 확정한다.

## 2026-07-23 사용자 대시보드 전체 DB 조회 제거

### 작업 결과

- user-web 공통 대시보드 hook에 `enabled` 옵션을 추가해 미로그인 또는 사용자 식별값이 없으면 DB 조회를 하지 않도록 했다.
- 사용자 대시보드에서 전체 회원 목록 `/accounts/users` 조회를 제거했다.
- 사용자 계약/상환 조회는 로그인 사용자의 `user_no` 기준으로만 호출하도록 전환했다.
- 사용자 매출/반품/정산 조회는 로그인 사용자의 연결 쇼핑몰 `shop_pairs` 기준을 유지한다.
- 마이페이지는 전체 회원 목록의 첫 row를 사용하지 않고 local auth session과 `/accounts/me/shops`만 사용하도록 전환했다.
- 상환 목록 API에 `user_no` 필터를 추가해 사용자 현황 화면에서 전체 상환 데이터가 섞이지 않도록 했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/redemptions/repository.py` | 상환 목록 `user_no` 필터 추가 |
| `service-api/src/cubici_service/api/v1/endpoints/redemptions.py` | `/redemptions?user_no=` query 추가 |
| `service-api/tests/test_domain_routes.py` | 상환 목록 `user_no` 전달 테스트 보강 |
| `user-web/src/App.jsx` | 대시보드 미로그인 조회 차단, Main/Request/Current/Sales/MyPage 사용자 기준 조회 전환 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 61 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| `useUserDashboardData()` 무인자 호출 검색 | 0건 |
| user-web 전체 회원 목록 직접 조회 검색 | 0건 |
| 실제 DB 상환 전체 조회 | 200, total 6 |
| 실제 DB `redemptions?user_no=36` | 200, total 2 |
| 실제 DB `redemptions?user_no=999999999` | 200, total 0 |

### 보류/추정

- API 자체는 관리자/개발 검증을 위해 전체 조회 endpoint를 유지한다. 사용자 화면에서만 전체 조회를 차단했다.
- 마이페이지의 등록일은 `/accounts/me` 응답에 없어서 현재 `-`로 표시한다. 필요하면 `/accounts/me` schema에 `reg_date`를 추가한다.
- 사용자 화면의 요금/공지/Q&A/FAQ는 아직 실제 API 화면으로 완전히 전환하지 않았다.

### 다음 액션

1. 사용자 계약 상세/서류 목록 화면을 분리해 보완서류/업로드 파일 확인성을 높인다.
2. 사용자 고객지원 화면인 공지/Q&A/FAQ를 실제 API 데이터로 전환한다.
3. 선정산 산식 migration 착수 시 seller group table 설계를 먼저 확정한다.

## 2026-07-23 사용자 계약 상세/서류 목록 화면 분리

### 작업 결과

- 사용자 머니뱅크 현황의 계약번호를 상세 화면 링크로 전환했다.
- `/moneybank/current/{mbid}` 사용자 계약 상세 화면을 추가했다.
- 상세 화면에서 계약 기본정보, 연결 쇼핑몰, 수수료 조건, 제출서류 목록, 상환 요약을 조회한다.
- 계약 상세 API에 선택적 `user_no` 검증 query를 추가했다.
- 문서 목록/다운로드 API에 선택적 `user_no` 검증 query를 추가했다.
- user-web 상세 화면은 로그인 사용자 `user_no`를 포함해 계약/문서 정보를 조회한다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/contracts/repository.py` | 계약 상세 `user_no` 소유자 필터 추가 |
| `service-api/src/cubici_service/api/v1/endpoints/contracts.py` | `/contracts/{mbid}?user_no=` query 추가 |
| `service-api/src/cubici_service/documents/repository.py` | 문서 목록/다운로드 `user_no` 소유자 검증 추가 |
| `service-api/src/cubici_service/api/v1/endpoints/documents.py` | 문서 목록/다운로드 `user_no` query 추가 |
| `service-api/tests/test_domain_routes.py` | 계약 상세/문서 목록 `user_no` 전달 테스트 보강 |
| `user-web/src/App.jsx` | 계약 상세 route/page, 계약번호 링크, 문서 다운로드 링크 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 61 passed |
| user-web Vite build | 성공 |
| 앱 직접 참조 asset 누락 | 0 |
| 실제 DB 회원가입/쇼핑몰 연결/신청/서류 업로드 | 각 200 |
| 실제 DB 계약 상세 본인 `user_no` 조회 | 200 |
| 실제 DB 계약 상세 타 `user_no` 조회 | 404 |
| 실제 DB 문서 목록 본인 `user_no` 조회 | 200, total 1 |
| 실제 DB 문서 목록 타 `user_no` 조회 | 404 |
| 테스트 DB row 및 파일 정리 | 완료 |

### 보류/추정

- 현재 소유자 검증은 query `user_no` 기준이다. 운영 전에는 bearer token 기반 서버-side 인증으로 대체해야 한다.
- 상세 화면의 수수료/상환 항목은 현재 API가 제공하는 핵심 요약만 표시한다. legacy 상세 항목 전체 재현은 후속 화면 정밀화 때 확장한다.
- 다운로드 링크도 현재 `user_no` query 방식이다. 운영 인증 전환 시 signed URL 또는 token 검증 방식으로 변경해야 한다.

### 다음 액션

1. 사용자 고객지원 화면인 공지/Q&A/FAQ를 실제 API 데이터로 전환한다.
2. 사용자 계약 상세 화면에 보완서류 재업로드 기능을 통합할지 검토한다.
3. 선정산 산식 migration 착수 시 seller group table 설계를 먼저 확정한다.

## 2026-07-23 사용자 고객지원 공지/Q&A/FAQ API 연결

### 작업 결과

- 사용자 고객지원 메뉴의 `/board/notice/index`, `/board/qa/index`, `/board/faq/index` route를 React 화면에 연결했다.
- 공지와 FAQ는 기존 support board API인 `/v1/api/support/boards/{notice|faq}` 데이터를 표시한다.
- Q&A는 `/v1/api/support/inquiries` 데이터를 사용하되, 로그인 사용자 `user_no`로 조회 범위를 제한한다.
- Q&A 목록/상세 API에 선택적 `user_no` query 필터를 추가했다.
- 실제 DB 검증 중 support board 목록 정렬이 `notice_id/faq_id` 원본 컬럼명을 참조해 실패하던 문제를 `post_id` 기준 정렬로 수정했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/support/repository.py` | Q&A `user_no` 필터, board 목록 정렬 버그 수정 |
| `service-api/src/cubici_service/api/v1/endpoints/support.py` | Q&A 목록/상세 `user_no` query 추가 |
| `service-api/tests/test_domain_routes.py` | Q&A `user_no` 전달 테스트 보강 |
| `user-web/src/App.jsx` | 고객지원 공지/Q&A/FAQ 실제 API 목록 화면 추가 |
| `user-web/src/styles/user-web.css` | 고객지원 요약/목록 표시 스타일 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 61 passed |
| user-web Vite build | 성공 |
| 실제 DB 공지 목록 조회 | total 5 |
| 실제 DB FAQ 목록 조회 | total 31 |
| 실제 DB Q&A `user_no=36` 조회 | total 1 |
| 실제 DB Q&A 미존재 `user_no=999999999` 조회 | total 0 |

### 보류/추정

- Q&A 작성/상세 열람 UI는 아직 목록 중심 구현이다. legacy 수준 재현 시 작성, 수정, 답변 상세 펼침을 추가해야 한다.
- 현재 사용자 제한은 query `user_no` 기준이다. 운영 전에는 bearer token 기반 서버-side 인증으로 대체해야 한다.
- 공지/FAQ 상세 페이지는 아직 별도 route로 분리하지 않았다. 목록에서 본문 요약을 먼저 표시하는 단계다.

### 다음 액션

1. 사용자 Q&A 작성/상세 보기 화면을 구현한다.
2. 사용자 요금안내 `/chargeInfo` 화면을 실제 요금/상품 데이터와 연결한다.
3. 사용자 화면 E2E에서 로그인 후 고객지원 메뉴 이동과 Q&A 사용자 필터를 확인한다.

## 2026-07-23 사용자 Q&A 작성/상세 보기 구현

### 작업 결과

- 사용자 Q&A 목록 화면에 문의 등록 폼을 추가했다.
- `POST /v1/api/support/inquiries` 문의 생성 API를 추가했다.
- 문의 생성 시 `qna` 테이블에 `user_no`, `type`, `title`, `content`, `visibility`, 작성자/수정자, 등록/수정일을 저장한다.
- Q&A 목록 제목을 `/board/qa/{qna_id}` 상세 화면 링크로 연결했다.
- Q&A 상세 화면에서 문의 기본정보, 본문, 답변 목록을 조회한다.
- 상세 조회는 기존 `user_no` query 필터를 사용해 타 사용자 문의 접근을 차단한다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/support/repository.py` | 문의 생성 request/response와 `qna` insert 처리 추가 |
| `service-api/src/cubici_service/api/v1/endpoints/support.py` | `POST /support/inquiries` endpoint 추가 |
| `service-api/tests/test_domain_routes.py` | 문의 생성 endpoint payload 테스트 추가 |
| `user-web/src/App.jsx` | Q&A 작성 폼, 상세 route/page, 상세 조회 API client 추가 |
| `user-web/src/styles/user-web.css` | Q&A 작성/상세 표시 스타일 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 62 passed |
| user-web Vite build | 성공 |
| 실제 DB 임시 Q&A 생성 | `created_qna_id 2` |
| 실제 DB 본인 상세 조회 | `True` |
| 실제 DB 타 사용자 상세 조회 | `False` |
| 실제 DB 본인 목록 검색 | `listed_count 1` |
| 임시 Q&A row 정리 | 완료 |

### 보류/추정

- 현재 문의 작성은 query/token 인증이 아닌 프론트 로그인 세션의 `user_no`를 payload로 보내는 구조다. 운영 전 bearer token 기반 서버-side 사용자 식별로 바꿔야 한다.
- 본문은 HTML 렌더링하지 않고 텍스트 요약/표시로 처리했다. legacy HTML 표시를 재현하려면 sanitize 정책을 먼저 확정해야 한다.
- 사용자 Q&A 수정/삭제 기능은 아직 구현하지 않았다. legacy 사용자 화면에 해당 기능이 있었는지는 추가 확인이 필요하다.

### 다음 액션

1. 사용자 요금안내 `/chargeInfo` 화면을 실제 요금/상품 데이터와 연결한다.
2. 사용자 화면 E2E에서 로그인 후 Q&A 작성/상세 조회 흐름을 검증한다.
3. 운영 인증 전환 시 Q&A `user_no` payload/query 의존을 제거한다.

## 2026-07-23 사용자 요금안내 실제 요금 데이터 연결

### 작업 결과

- 사용자 고객지원 메뉴의 `/chargeInfo` route를 React 화면에 연결했다.
- 기존 `GET /v1/api/preferences/charges` API를 사용해 PostgreSQL `charge` 테이블의 실제 요금 데이터를 표시한다.
- 요금제 요약 카드와 전체 요금제 테이블을 추가했다.
- 요금 구분 코드는 `B/A/M/O/F`를 각각 기본/부가/조건부/기타/무료 요금으로 표시한다.
- 요금 기간은 `period`, `period_unit` 값을 조합해 사용자 화면에 표시한다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `user-web/src/App.jsx` | `/chargeInfo` route/page, 요금 API client, 요금 표시 formatter 추가 |
| `user-web/src/styles/user-web.css` | 요금제 카드/표시 스타일 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 62 passed |
| user-web Vite build | 성공 |
| 실제 DB 요금 목록 조회 | total 5 |
| 실제 DB 운영중 요금 | 1 |
| 실제 DB 종료 요금 | 4 |
| 실제 DB 확인 요금코드 | `B0101,B0301,B0601,B1201,F0301` |

### 보류/추정

- 현재 요금안내는 `charge` 테이블 기반이다. legacy 사용자 화면의 문구/프로모션 조합까지 완전히 재현한 것은 아니다.
- `moneybank-products` API는 실제 DB에 `moneybank_partner` 테이블이 없어 조회가 실패한다. 이관 DB에 해당 원천 테이블이 없는 상태로 확인되며, 별도 테이블 매핑 보정이 필요하다.
- 운영중 요금만 카드 상단에 우선 노출하고, 전체 요금은 표에 표시한다. 운영 정책상 종료 요금을 숨겨야 하면 화면 조건을 조정한다.

### 다음 액션

1. 사용자 화면 E2E에서 로그인 후 Q&A 작성/상세 조회와 `/chargeInfo` 표시를 검증한다.
2. `moneybank-products` API의 legacy 테이블 매핑 누락을 재확인한다.
3. 사용자 마이페이지 요금정보를 실제 가입/결제 상태와 연결한다.

## 2026-07-23 사용자 Q&A/요금안내 Playwright E2E

### 작업 결과

- user-web 전용 Playwright 설정을 추가했다.
- user-web E2E 실행 스크립트를 추가했다.
- 실행 스크립트는 필요 시 service-api와 user-web preview를 로컬에서 띄우고, 실제 PostgreSQL 연결 상태에서 테스트한다.
- Q&A 작성, 상세 조회, 목록 재조회, `/chargeInfo` 요금안내 표시를 하나의 E2E 시나리오로 검증했다.
- E2E에서 생성한 임시 `qna` row는 테스트 종료 후 제목 기준으로 삭제한다.
- user-web/admin-web Playwright 산출물과 user-web build/runtime 산출물이 git에 올라가지 않도록 `.gitignore`를 보강했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `Cubici/.gitignore` | user-web/admin-web test/build/runtime 산출물 제외 추가 |
| `user-web/package.json` | `test:e2e` script 추가 |
| `user-web/playwright.config.js` | user-web Playwright 설정 추가 |
| `user-web/scripts/run-playwright-e2e.mjs` | service-api/user-web preview 기동 및 Playwright 실행 스크립트 추가 |
| `user-web/tests/e2e/support-and-charge.spec.js` | Q&A 작성/상세/요금안내 실제 DB E2E 추가 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| `service-api/tests/test_domain_routes.py` | 62 passed |
| user-web Vite build | 성공 |
| user-web Playwright E2E | 1 passed |
| E2E 실제 API 호출 | Q&A 목록/등록/상세, 요금목록 모두 200 |
| E2E 임시 Q&A cleanup | `leftover_e2e_qna 0` |

### 보류/추정

- E2E 로그인은 실제 로그인 API가 아니라 localStorage 세션 주입 방식이다. 현재 사용자 Q&A API가 `user_no` query/payload 기반이라 가능한 방식이며, 운영 인증 전환 후 실제 로그인 흐름으로 바꿔야 한다.
- user-web dev server는 `react-refresh` resolution 문제로 E2E에 사용하지 않고, build 후 preview 방식으로 검증한다.
- build warning의 `/resources/...` 참조는 기존 legacy CSS runtime asset 경로이며, 이번 테스트 실패 요인은 아니었다.

### 다음 액션

1. legacy `MONEYBANK_PARTNER`, `MONEYBANK_PRODUCT` 원천 데이터가 Cubici 자료 안에 남아 있는지 재검색한다.
2. 사용자 마이페이지 요금정보를 실제 가입/결제 상태와 연결한다.
3. 사용자용 남은 준비 화면 3개를 최종 Depth 기준으로 재점검한다.

### 2026-07-23 후속 확인

- `moneybank-products` API 실패 원인은 테이블 매핑 코드 오류가 아니라 `014_moneybank_product_preferences.sql` migration 미적용이었다.
- 실제 DB에 `moneybank_partner`, `moneybank_product_preference`를 생성했고 live DB CRUD 검증을 완료했다.
- 상세 결과는 `docs/2026-07-22_CUBICI_MONEYBANK_PRODUCT_PREFERENCE_ADMIN_PAGE.md`에 기록했다.

## 2026-07-23 사용자 마이페이지 머니뱅크 금융조건/상환 연결

### 작업 결과

- 관리자 금융상품 master(`MONEYBANK_PRODUCT`, `MONEYBANK_PARTNER`)는 관리자단 미완성 작업으로 후순위 전환했다.
- 사용자 마이페이지와 머니뱅크 현황/상세 화면은 현재 이관 완료된 계약별 실데이터 기준으로 보강했다.
- `/cubici/mypage/profile`에 최근 계약, 적용 금융조건, 상환 요약 카드를 추가했다.
- `/moneybank/current` 계약/신청 현황에 지급율, 평균 수수료율을 추가했다.
- `/moneybank/current` 상환 현황에 이용수수료, 상환수수료, 최근 이력일을 추가했다.
- `/moneybank/current/{mbid}` 상세의 수수료 조건에 쇼핑몰별 수수료율을 표시했다.
- user-web Vite build에서 로컬 API 기본값 `http://127.0.0.1:8000`을 명시 주입하도록 보강했다.

### 변경 파일

| 파일 | 내용 |
| --- | --- |
| `user-web/src/App.jsx` | 마이페이지/머니뱅크 현황/계약상세에 계약별 금융조건, 수수료율, 상환 요약 표시 추가 |
| `user-web/src/styles/user-web.css` | 금융조건 요약 카드, 쇼핑몰별 수수료율 표시 스타일 추가 |
| `user-web/tests/e2e/support-and-charge.spec.js` | 마이페이지/머니뱅크 현황/계약상세 실제 DB E2E 추가 |
| `user-web/vite.config.js` | `VITE_API_BASE_URL` 기본 로컬 API URL 주입 |
| `docs/2026-07-23_CUBICI_USER_WEB_INITIAL_SCAFFOLD.md` | 작업/검증/보류사항 기록 |

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| service-api unit test | `65 passed, 1 skipped` |
| user-web Vite build | 성공 |
| user-web Playwright E2E | `2 passed` |
| 실제 DB 계약 조회 | `user_no=36`, 계약 2건 |
| 실제 DB 수수료 조건 | `payment_rate=80`, 평균 수수료 `0.92/0.60` 확인 |
| 실제 DB 쇼핑몰별 수수료율 | `COUPANG 1.60`, `NAVER 0.60`, `STREET11/GMARKET/AUCTION 0.80` 확인 |
| 실제 DB 상환 요약 | `MPK2723122` 지급/상환/미상환 요약 표시 확인 |

### 보류/추정

- E2E 로그인은 기존과 동일하게 localStorage 세션 주입 방식이다.
- `accounts/me/shops`는 fake token으로 401이 발생하지만, 현재 테스트 범위인 계약/수수료/상환 표시는 `user_no` 기반 API로 정상 검증했다.
- 실제 로그인 API와 사용자 권한 검증을 붙이면 쇼핑몰 연결 조회도 운영 인증 방식으로 재검증해야 한다.
- user-web build warning의 `/resources/...` runtime asset 경로는 기존 legacy CSS 자산 참조이며 이번 기능 실패 요인은 아니다.

### 다음 액션

1. 사용자 신청/계약 흐름에서 신청 상태, 계약 동의, 제출서류, 계좌정보 표시/수정 범위를 계속 구현한다.
2. 사용자 정산/상환 화면에서 지급 요청/지급 결과, 상환 예정/상환 완료, 반품/취소 반영 상태를 세분화한다.
3. 관리자 금융상품 master는 관리자단 잔여 작업 시 `MONEYBANK_PRODUCT`, `MONEYBANK_PARTNER` 원천 확보 여부와 함께 재개한다.
