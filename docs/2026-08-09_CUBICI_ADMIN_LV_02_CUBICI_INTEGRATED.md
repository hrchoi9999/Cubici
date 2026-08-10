# ADM-LV-02 쇼핑몰 통합 > 통합 현황

## 작업 범위

- 화면: `/admin/cubici/infoIntegrated/cubici_tab1`
- LV 구조: 종합/매출/활동/이용료 탭, 지표 카드 12개, 조회 조건, 그래프 3개
- 기능: 실제 PostgreSQL 집계 API, 협력사/서비스 필터, 분석단위, CSV 다운로드
- 승인 상태: 2026-08-09 사용자 승인 완료

## LV 근거

| 자료 | 적용 근거 |
|---|---|
| `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/infoIntegrated/cubici_tab1.jsp` | 탭, 카드 12개, 검색 조건, 그래프 패널 구조 |
| `D:/Cubici/src/main/webapp/resources/chart-admin/cubici_tab1_chart.js` | 회원가입, 가입 기간, 가입 채널 Chart.js 구성 |
| `D:/Cubici/src/main/java/egovframework/azon/admin/cubici/service/AdminCubiciService.java` | 금일/당월/전월 집계 흐름 |
| `D:/Cubici/src/main/resources/egovframework/sqlmap/mappers/AdminCubiciMapper.xml` | legacy 회원, 매출, 정산, SKU, 가입 채널 산식 |

## 구현 내역

- legacy 아이콘 12개를 React public 자원으로 복제하고 카드 12개 구조를 복원했다.
- 전용 `/v1/api/management/cubici-integrated` API를 추가했다.
- 회원가입, 가입 기간, 가입 채널 그래프를 실제 Chart.js canvas로 복원했다.
- 협력사, 서비스, 일/주/월, 조회 기간 필터와 CSV 다운로드를 연결했다.
- 모바일에서 탭 2열, 카드 2열, 검색 조건 1열과 가로 넘침 없는 그래프를 적용했다.

## DB 산식 매핑

| 지표 | PostgreSQL 근거 | 상태 |
|---|---|---|
| 신규가입 | `users.reg_date` | 직접 집계 |
| 해지회원 | `moneybank_contract` 종료 상태와 종료 이벤트 일자 | migrated `users`에 legacy 탈퇴일이 없어 대체 집계 |
| 이용료 수입 | `billing_payment_detail.amount` | 직접 집계, 현재 0건 |
| 휴면회원 | 마지막 로그인 또는 가입일 + 365일 | 현재 휴면 기준 적용 |
| 매출금액/판매수량 | `sale.payment_amount`, `sale.quantity` | 직접 집계 |
| 정산금액 | `settlement.settlement_amount` | 직접 집계 |
| 등록 SKU | 기간 내 `sale`의 쇼핑몰/상품 식별자 중복 제거 | migrated 상품 마스터 부재에 따른 대체 집계 |
| 방문자 | `site_visitor` 최신 기준일 스냅샷 | 직접 연결 |
| 최대동시 접속 | 원본 테이블/컬럼 없음 | `미집계` 표시 |
| 평균 이용시간 | 원본 테이블/컬럼 없음 | `미집계` 표시 |
| 평균등록 쇼핑몰 | 활성 `shop_accounts` / 가입 회원 | 직접 집계 |

## 실제 DB 검증

| 항목 | 결과 |
|---|---:|
| 기준일 | 2024-05-05 |
| 사용자 원본 | 45건 |
| 활성 쇼핑몰 계정 | 19건 |
| 매출 원본 | 2,390건 |
| 정산 원본 | 469건 |
| 방문자 원본 | 253건 |
| 기본 일 시계열 | 31개 |
| 협력사 옵션 | 4개 |
| 서비스 옵션 | 1개 |
| 가입 채널 | 5개 |
| 협력사+서비스 주 단위 필터 | 5개 구간, 정상 적용 |

## 검증 결과

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend focused pytest | 3 passed |
| mock-data PC/모바일 Playwright | 2 passed |
| actual Docker DB PC/모바일 Playwright | 2 passed |
| 기존 관련 focused regression | 3 passed |
| Chart canvas pixel 검증 | 그래프 3개 통과 |
| 모바일 가로 overflow | 없음 |

## 승인 이미지

- `docs/reference/lv-ui/admin/ADM-LV-02-CUBICI-INTEGRATED/approved/ADM-LV-02-CUBICI-INTEGRATED-LIVE-PC.png`
- `docs/reference/lv-ui/admin/ADM-LV-02-CUBICI-INTEGRATED/approved/ADM-LV-02-CUBICI-INTEGRATED-LIVE-MOBILE.png`

## 미완료 경계

- legacy 사용자 탈퇴일과 상품 마스터가 migrated PostgreSQL에 없어 두 지표는 대체 산식을 사용한다.
- 최대동시 접속과 평균 이용시간은 원본 데이터 추가 복구가 필요하다.
- 이번 변경은 commit, push, 운영 배포하지 않았다.
- 다음 관리자 화면은 후속 승인 시 진행한다.
