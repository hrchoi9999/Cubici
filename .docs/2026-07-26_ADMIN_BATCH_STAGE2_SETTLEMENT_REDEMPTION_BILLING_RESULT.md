# 관리자단 2단계 정산/상환/결제 일괄작업 결과

## 범위

- 정산 관리: 정산액 검산 필드 및 화면 표시
- 상환 관리: 누적 지급/상환/미상환잔액 검산 필드 및 화면 표시
- 결제 현황: 결제 상태 코드/라벨 표시
- 요금변경 관리: 환급 상태 코드/라벨 표시

제외:

- legacy 정산 batch 원본 산출 procedure 재구현
- Hyphen/은행 실송금 연동
- 실제 PG 결제/환불 API 호출
- 정산/상환 원본 DB 값 덮어쓰기

## 작업 결과

### 정산

- `settlement_amount` 원본값은 보존했다.
- API 응답에 `settlement_check_amount`, `settlement_difference`, `settlement_check_status`를 추가했다.
- 화면 목록/상세에 검산 상태를 표시했다.
- `LEGACY_BATCH_VALUE`는 원본 정산액은 있으나 현재 보유 컬럼만으로 재계산되지 않는 legacy batch 산출값 후보로 분류한다.

### 상환

- API 응답에 `latest_balance_check_amount`, `latest_balance_difference`, `latest_balance_check_status`를 추가했다.
- 검산 기준은 `누적지급액 - 누적상환액 = 미상환잔액`이다.
- 화면 목록/상세에 잔액 검산 상태를 표시했다.

### 결제/요금변경

- 결제 현황 API에 `payment_status`, `payment_status_label`을 추가했다.
- 요금변경 API에 `payment_status`, `refund_status`, `refund_status_label`을 추가했다.
- 화면 목록에 결제상태/환급상태를 표시했다.
- 요금변경 조회 SQL의 `like '%F%'` placeholder 오인 버그를 `like '%%F%%'`로 수정했다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/settlements/repository.py` | 정산 검산 필드/계산 helper 추가 |
| `service-api/src/cubici_service/redemptions/repository.py` | 상환 잔액 검산 필드 추가 |
| `service-api/src/cubici_service/management/repository.py` | 결제/환급 상태 라벨 추가, 요금변경 SQL placeholder 수정 |
| `admin-web/src/pages/SettlementManagementPage.jsx` | 정산 검산 표시 |
| `admin-web/src/pages/RedemptionManagementPage.jsx` | 상환 잔액 검산 표시 |
| `admin-web/src/pages/MemberPaymentPage.jsx` | 결제상태 표시 |
| `admin-web/src/pages/MemberChargeChangePage.jsx` | 환급상태 표시 |
| `service-api/tests/test_settlement_amount_check.py` | 정산 검산 helper focused test 추가 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| backend focused test | 통과: 71 passed, 1 skipped |
| 실제 PostgreSQL API 조회 | 통과: 정산/상환/결제/요금변경 4개 endpoint 200 |
| admin focused Playwright E2E | 통과: 4 passed |
| admin-web production build | 통과: focused E2E runner 내 build 완료 |

실제 DB 조회 결과:

- 정산: 469건, 첫 샘플 `settlement_check_status=LEGACY_BATCH_VALUE`
- 상환: 6건, 첫 샘플 `latest_balance_check_status=OK`
- 결제: 현재 0건
- 요금변경: 현재 0건

## 보수적 완료율 갱신

| 메뉴 | 이전 보수 완료율 | 현재 보수 완료율 | 비고 |
| --- | ---: | ---: | --- |
| 정산 관리 | 62% | 67% | 원본값 보존 + 검산 표시 완료, legacy batch procedure 대조는 잔여 |
| 상환 관리 | 64% | 69% | 잔액 검산 표시 완료, 해지/강제해지 운영정책 반복 검수 잔여 |
| 결제현황 | 56% | 60% | 상태 라벨 표시 및 조회 버그 수정, 실 PG 연동 제외 |
| 요금변경 관리 | 56% | 61% | 환급상태 표시 및 환급완료 workflow 유지, 실 환불 연동 제외 |

관리자단 전체 운영 재현율은 보수적으로 68~73% 수준으로 본다.

## 다음 액션

1. 금융상품/협력사 master 데이터 정합성 검수
2. 관리자 권한등급/audit/민감정보 노출 정책 보강
3. Prism/Raw data 설정 반영 검증
4. 통합정보 shop grouping/legacy 통계 procedure 대조
5. 서버관리/오류로그/알림 workflow 보강
