# Cubici 관리자단 미완 기능 Inventory 및 병렬 개발 준비

## 목적

- 관리자단 전체 E2E 전에 미완 기능 inventory를 먼저 확정한다.
- 기능 구현이 덜 된 상태에서 전체 E2E를 먼저 실행하지 않는다.
- 사용자단 개발 방식처럼 조사/구현/검증이 분리 가능한 단위는 Sub Agent에 맡길 수 있도록 작업 경계를 고정한다.

## 적용 원칙

- 작업 범위는 `D:\Alt_CSM` 내부로 제한한다.
- 전체 관리자단 E2E는 관리자단 1차 구현 범위가 완료된 뒤 milestone에서 1회 실행한다.
- 개발 중 검증은 변경 기능 focused test 또는 focused E2E로 제한한다.
- DB 작업 전에는 Docker PostgreSQL preflight를 먼저 수행한다.
- `DB timeout`, `Docker unhealthy`, `fixture 부족`은 기능 실패와 분리해 기록한다.
- 불확실한 legacy 정책은 추정으로 표시하고 구현보다 문서화를 먼저 한다.

## 1차 개발 범위

| 영역 | 포함 범위 | 1차 목표 |
|---|---|---|
| Moneybank 운영 | 신청/심사/계약/서류/정산/상환/송금요청/통합정보 | 운영 workflow와 금액 검산 중심 보강 |
| 회원/결제 관리 | 회원현황, 회원정보, 휴면/해지, 결제현황, 요금변경 | 조회/처리 workflow와 상태값 검수 |
| 환경설정 | 요금제, 프로모션, 제휴사, 금융상품 | master CRUD와 연결 정책 보강 |
| Prism/Raw Data | 평가결과, 설정, raw data 항목 | Alt_CSM 연동 경계와 설정 반영 검수 |
| 고객/모니터링 | 고객문의, 게시판, 템플릿, 오류로그, 서버관리 | 운영 보조 기능 검수, 실제 발송/metric은 2차 |

## 2차 제외 범위

- Hyphen/경남은행 실 API 호출
- 실제 계좌 이체 실행, 자동 입금대사 반영
- 공동인증/전자서명 실연동
- 쇼핑몰 외부 API 실연동
- 결제 PG 실취소/환불 실연동
- 운영 서버 metric 직접 수집

## Sub Agent 분배안

| Agent | 담당 | 주요 산출물 | 병렬 가능 여부 |
|---|---|---|---|
| Admin Inventory Sub Agent A | Moneybank 운영 | `2026-07-26_ADMIN_INVENTORY_MONEYBANK.md` | 완료 |
| Admin Inventory Sub Agent B | 회원/결제/환경설정/Prism | `2026-07-26_ADMIN_INVENTORY_MEMBER_PREFERENCES.md` | 완료 |
| Admin Inventory Sub Agent C | 고객/모니터링/공통/E2E | `2026-07-26_ADMIN_INVENTORY_SUPPORT_MONITORING_E2E.md` | 완료 |
| Master Agent | 병합/우선순위/충돌 관리 | `2026-07-26_ADMIN_UNFINISHED_INVENTORY_AND_PARALLEL_PLAN.md` | 완료 |

## 구현 병렬화 판단

| 작업군 | 판단 |
|---|---|
| Moneybank 신청/심사/계약/해지 상태 | 병렬 구현 비추천. 같은 계약 상태 로직을 공유한다. |
| 정산 산식/상환 산식 | 병렬 가능. 단, 잔액 정책 문서는 공유해야 한다. |
| Fintech mock/대사 UI | 병렬 가능. 실이체 반영은 제외한다. |
| 회원/결제 관리 | Moneybank 상태 로직과 직접 충돌이 적어 병렬 가능하다. |
| 환경설정 master CRUD | 독립성이 높아 병렬 가능하다. |
| Prism/Raw Data | Alt_CSM 연동 경계만 지키면 병렬 가능하다. |
| 고객/모니터링 | 운영 보조 기능이므로 병렬 가능하다. |

## 다음 실행 순서

1. Moneybank 상태 공통 로직은 단독 작업으로 먼저 정리한다.
2. 정산 산식, 상환 산식, Fintech mock, 통합정보 집계는 파일 충돌을 피해서 병렬 작업한다.
3. 회원/결제, 환경설정/Prism, 고객/모니터링은 독립 작업군으로 병렬 처리한다.
4. 각 기능은 focused 검증만 수행한다.
5. 관리자단 1차 구현 범위 완료 후 전체 관리자단 E2E milestone을 1회 실행한다.
