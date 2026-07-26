# Cubici 사용자단 잔여 작업 일괄 처리 계획

## 범위 원칙

- 이번 1차 범위는 사용자 화면의 운영 재현을 높이는 내부 DB/API/UI 작업으로 제한한다.
- 다음 항목은 2차 개발 범위로 제외한다.
  - 요금/결제 이력 상세 재현
  - Hyphen, 공동인증, 이체 실연동
  - 쇼핑몰 외부 API 실연동
- 기능 개발 중 검증은 변경 기능 focused 검증으로 제한한다.
- 사용자단/관리자단 전체 E2E는 이번 개발 범위가 완료된 뒤 milestone에서 각각 1회만 실행한다.

## 병렬 처리 판단

- 계정/마이페이지 CRUD와 머니뱅크 상태/정책은 파일 책임 범위가 달라 병렬화 가능하다.
- Sub Agent에는 다음 범위를 분리 위임했다.
  - Account/Mypage: 회원가입 약관, 회사정보 저장, 쇼핑몰 계정 수정/삭제
  - Moneybank Status/Policy: 상태별 redirect, evaluate 화면, 해지/상환 정책 gap
- Master Agent는 Sub Agent 완료 전에도 중복되지 않는 범위의 통합 작업을 진행한다.
- Sub Agent 결과는 완료 보고 후 변경 파일과 검증 결과를 확인한 뒤 병합한다.

## 이번 반영

- 회사정보 수정 저장 API와 사용자 화면 연결을 반영했다.
- 쇼핑몰 계정 수정/비활성·활성/삭제 API와 사용자 화면 버튼 연결을 반영했다.
- 회사정보 저장 후 `biz_setup_date`, `biz_type`, `sectors`가 세션 사용자 정보에 유지되도록 응답 필드를 확인했다.
- Moneybank 상태별 redirect를 legacy `MoneybankCmmService.setUrlByMbStatus` 기준으로 보정했다.
- `/moneybank/advcalc/evaluate` 전용 심사 진행 화면을 복원했다.
- 상환 취소/잔액 재계산은 현재 API가 최신 원장 기준 역산, 중복 취소 방어, 음수 잔액 방어를 수행함을 확인했다.
- 회원가입 약관 `agree1~3.jsp` 원문 HTML을 `user-web/public/legacy-terms/*.html`로 반영했다.
- 해지신청 후 관리자 최종 처리와 외부 실이체/입금대사 연계는 2차 정책/관리자 처리 범위로 분리한다.
- 통합정보/매출/정산 산식 대조는 기존 CLI 기준으로 재검산했다.
- 상환 history 산식 불일치 1건을 개발 DB에서 보정했다.
  - 대상: `moneybank_redemption_history.id=144`, `mbid=MPH0823122`
  - 보정 전: 지급 3,616 / 상환 3,616 / 잔액 3,616
  - 보정 후: 지급 3,616 / 상환 3,616 / 잔액 0

## 검증 결과

- service-api route/domain focused test: `69 passed`
- Account/Mypage Sub Agent focused 검증:
  - API/domain focused `11 passed`
  - Front build 통과
  - DB preflight `127.0.0.1:55432/cubici_local` 통과
  - Account focused E2E `2 passed`
- 계정/마이페이지 DB focused 검증: 임시 사용자 생성, 회사정보 수정, 쇼핑몰 등록, 수정, 삭제, 정리 통과
- Moneybank Sub Agent focused 검증:
  - DB preflight 통과
  - JSX bundle parse 통과
  - user-web production build 통과
  - API/domain focused test `6 passed`
  - moneybank focused E2E `4 passed`
- Docker PostgreSQL 개발 DB 상태: `cubici-postgres-dev` healthy, `127.0.0.1:55432`
- 정산 산식 strict 재검산 통과:
  - `settlement_target_amount = total_sale - service_fee` 불일치 0건
- 상환 잔액 strict 재검산 통과:
  - history 산식 불일치 0건
  - 최신 history 산식 불일치 계약 0건
  - operation 산식 불일치 0건
- 사용자단 전체 E2E milestone 검증 통과:
  - DB preflight 통과
  - user-web production build 통과
  - 1차 실행: `5 passed`, `7 skipped`, 실패 0건
  - skip 원인: runner가 DB preflight는 수행했지만 `CUBICI_RUN_DB_E2E=1`을 Playwright 실행 환경에 전달하지 않아 DB E2E 7건이 skip됨
  - runner를 수정해 전체 사용자단 E2E 실행 시 `CUBICI_RUN_DB_E2E=1`을 기본 설정하도록 했다.
  - 수정 후 재실행: Playwright 전체 사용자단 suite `12 passed`, skip 0건, 실패 0건
  - 실행 후 `8000`, `4175` 포트 listen 프로세스 없음
  - build warning: legacy `/resources/...` 이미지 경로 일부가 build time에 resolve되지 않았으나 runtime 경로로 유지됨

### 1차 실행 Skip 7건 상세

- `commerce-sales-settlement-db-e2e.spec.js`: 판매/반품/정산/통합정보/상품재고 DB E2E 1건
- `mobile-legacy-routes-db-e2e.spec.js`: 모바일 legacy route DB E2E 1건
- `moneybank-request-db-e2e.spec.js`: 약관 상세, 신청 생성, legacy advcalc 신청 DB E2E 3건
- `moneybank-terms-db-e2e.spec.js`: 이용조건 동의 DB E2E 1건
- `moneybank-user-termination-db-e2e.spec.js`: 해지신청/상환이력 DB E2E 1건

## 보수적 진행률

- 2차 제외 범위 제거 후 사용자단 1차 운영 재현율: 약 96% 추정
- 이번 반영 후 계정/마이페이지 세부 완성도:
  - 회원가입/로그인/세션: 90%
  - 회원가입 약관 표시: 95%
  - 회사정보 수정 저장: 90%
  - 쇼핑몰 계정 등록/수정/비활성·활성/삭제: 90%
  - 쇼핑몰 외부 연동 검증: 2차 범위 제외
  - Moneybank 상태 redirect/evaluate 화면: 92%
  - 상환 취소/잔액 재계산 API 검산: 90%

## 남은 1차 작업

- 사용자단 1차 작업은 milestone E2E까지 완료했다.
- 관리자단 전체 E2E는 별도 milestone으로 실행한다.
- legacy `/resources/...` 이미지 경로 warning은 화면 미세 보정 단계에서 실제 asset 존재 여부를 재확인한다.
