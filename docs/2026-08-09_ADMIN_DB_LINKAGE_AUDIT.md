# Cubici 관리자 데이터/DB 연동 감사

> 2026-08-09 후속 복구: Cloudflare 관리자 route를 운영 배포 `418c4fe5.cubici.pages.dev`에서 복구했다. 이후 전체 33개 화면을 재검증해 33/33 데이터 조회 정상, 32/33 완전 정상으로 판정했다. 이메일 파생 route 1개는 제목 매핑 보완이 필요하다. 상세 내용은 `2026-08-09_ADMIN_ROUTE_PRODUCTION_RECOVERY.md`와 `2026-08-09_ADMIN_33_SCREEN_DATA_REGRESSION.md`를 참조한다.

## 최초 감사 판정 (route 복구 전)

**DB/API 조회 계층은 정상이나, 운영 관리자 화면의 데이터 출력은 정상 상태가 아니다.**

- 운영 API 목록/집계 31개와 데이터가 존재하는 상세 18개는 모두 HTTP 200이다.
- 주요 API total과 PostgreSQL 원본 행 수가 일치한다.
- 그러나 운영 `https://cubici.co.kr/admin/...` 요청은 Cloudflare에서 `HTTP 308 Location: /admin-spa`로 전환되어 원래 route가 소실된다.
- 인증 후 `/admin-spa`와 `/admin-spa?view=prism-*` 모두 현재 운영 번들에서는 `Route 점검 / 미구현 경로`로 표시된다.
- 따라서 직접 메뉴 24개와 상세/파생 9개는 현재 운영 도메인에서 화면별 DB 출력 여부를 검증할 수 없으며, **운영 화면 출력 실패**로 분류한다.
- 운영 JS/CSS 자산 해시가 로컬 배포 산출물과 달라 현재 운영에는 최신 관리자 소스가 배포되지 않았다.

## 범위

- 관리자 직접 메뉴: legacy 메뉴 기준 24개
- React 상세/파생 route: 9개, 총 React route 기준 33개
- 운영 API: 목록·집계 GET 31개, 상세 GET 18개
- 운영 DB: `cubici-postgres-prod`, 읽기 전용 집계
- 개인정보/계좌/전문 원문은 조회 결과에 기록하지 않음

## Preflight

| 항목 | 결과 |
|---|---|
| `cubici-api-prod` | healthy |
| `cubici-postgres-prod` | healthy |
| 운영 `/health` | HTTP 200 |
| 목록·집계 GET | 31/31 HTTP 200 |
| 데이터 존재 시 상세 GET | 18/18 HTTP 200 |

## 직접 메뉴 24개

아래 판정은 **DB/API 계층 판정**이다. 운영 화면은 24개 모두 공통 Cloudflare route 소실로 접근이 차단되어 별도 판정은 `출력 실패`다.

| ID | 화면 | 운영 DB/API | 주요 집계 | 판정 |
|---|---|---|---:|---|
| A01 | 통합정보/큐빅아이 | member-summary, member-payments | 회원 40, 결제 0 | 부분정상: 화면 0명 오류 별도 |
| A02 | 통합정보/머니뱅크 | management overview | 계약 7 | 정상 |
| A03 | 회원현황 | member-info | 회원 42 | 정상 |
| A04 | 결제관리 | member-payments | 0 | 연동 정상, 원본 0건 |
| A05 | 머니뱅크 통합 현황 | management overview | 계약 7, 정산 469 | 정상 |
| A06 | 이용상세 | management usage/detail | 7 | 정상 |
| A07 | 신청 접수 | contracts/detail/documents/notes | 7 | 정상 |
| A08 | 심사 승인 | contracts/detail | 7 | 정상 |
| A09 | 계약 관리 | contracts/detail | 7 | 정상 |
| A10 | 정산 관리 | settlements/detail | 469 | 조회 정상, 28건 차이 검산 필요 |
| A11 | 상환 관리 | redemptions/detail/history | 6 | 정상 |
| A12 | 프리즘 지표 관리 | risk-results | 8 | 부분정상: 3건 불완전 |
| A13 | 고객문의 | inquiries/detail | 1 | 정상 |
| A14 | 문자/이메일 | message templates/detail | 8 | DB 정상, 외부 실발송 미연동 |
| A15 | 고객 공지 관리 | notice/detail | 5 | 정상 |
| A16 | Error Log | error-logs | 0 | 연동 정상, 원본 0건 |
| A17 | 서버 관리 | server-status | metric 4개 | 내부 metric 정상, 외부 OS metric 미연동 |
| A18 | 펌뱅킹 전문 | fintech trade/detail | 4,142 | DB 정상, 실송금 비활성 |
| A19 | 관리자 등록 | admin-accounts | 0 | 연동 정상, `admin_account` 원본 0건 |
| A20 | 요금제 관리 | charges/detail | 5 | 정상 |
| A21 | 연계코드 관리 | promotions/detail/options | 1 | 정상 |
| A22 | 협력사 관리 | partners/detail | 4 | 부분정상: 담당자 누락 3건 |
| A23 | 머니뱅크 관리 설정 | products/detail | 0 | 연동 정상, 설정 원본 0건 |
| A24 | Prism System | config/detail/history | 항목 26 | 부분정상: 미완성 26, 이력 0 |

## 상세/파생 화면

아래 판정은 **DB/API 계층 판정**이다. 운영 화면 9개 역시 공통 Cloudflare route 소실로 별도 판정은 `출력 실패`다.

| 화면 | API/DB 결과 | 판정 |
|---|---:|---|
| 회원정보 tab2 | 42 | 정상 |
| 회원해지 tab3 | 상태 행 43 | 조회 정상, unique 회원 산식 검산 필요 |
| 결제 변경/환불 tab2 | 0 | 원본 0건 |
| 회원상세 userstatus | 상세 HTTP 200 | 정상 |
| 이용상세 detail | 상세 HTTP 200 | 정상 |
| 이메일 파생 route | 템플릿 8 | DB 정상, 실발송 미연동 |
| FAQ | 31 | 정상 |
| 머니뱅크 설정 tab2 | 0 | 원본 0건 |
| Prism RawData | 테이블 5, 산식 0 | 부분정상: 산식 미적재 |

## 독립 DB 대조

주요 원본 테이블 행 수와 API total이 일치했다.

- `users`: 전체 45, `USER` 42
- `moneybank_contract`: 7
- `settlement`: 469
- `charge`: 5, `promotion`: 1, `partner`: 4
- `admin_account`: 0
- `moneybank_partner`: 0, `moneybank_product_preference`: 0
- `prizm_items`: 26, 변경이력/RawData 산식: 0
- `qna`: 1, `message_template`: 8, `notice`: 5, `faq`: 31
- 펌뱅킹 전문: 4,142, firm request: 48, result inquiry: 2,073

## 확인된 문제

1. 운영 `/admin/...` 요청이 `HTTP 308 Location: /admin-spa`로 바뀌어 React가 원래 화면 route를 알 수 없다.
2. `/admin-spa?view=prism-management`와 `/admin-spa?view=prism-config`도 현재 운영 번들에서는 alias가 적용되지 않고 `미구현 경로`로 표시된다.
3. 운영 자산은 JS `index-DOqDS8uK.js`, CSS `index-DBEatKY1.css`지만 로컬 배포 산출물은 JS `index-C6lIJ7Mx.js`, CSS `index-iFO7i3G7.css`다.
4. 통합정보 화면은 회원 집계와 결제 집계를 `Promise.all`로 묶고 있어 한 요청만 실패해도 두 결과를 모두 `null`로 초기화한다.
5. 다수 화면이 API 실패/미조회 값을 `0`으로 포맷하므로 실제 0건과 조회 실패를 화면에서 구분하기 어렵다.
6. 운영 DB 기준 통합정보 회원 집계는 40명이므로 화면의 0명 표시는 DB 미연동이 아니라 Front route/API 오류 fallback 문제다.
7. 정산 차이 28건, Prism 불완전 3건, Prism 설정 미완성 26건, 협력사 담당자 누락 3건은 데이터 품질/legacy 산식 검산 잔여다.

## 후속 조치

1. Cloudflare의 `/admin/* -> /admin-spa` 외부 308 규칙을 제거하고, Worker/Pages의 내부 200 rewrite로 원래 URL을 보존한다.
2. 최신 관리자 번들을 운영에 배포한다.
3. 직접 메뉴 24개와 상세/파생 9개의 화면 표시 건수를 API total과 재대조한다.
4. 조회 실패를 0으로 표시하는 공통 fallback을 개선한다.
