# Cubici 계약 목록 필터 API 및 Admin 검색 연결

작성일: 2026-07-20

## 작업 결과

- `GET /v1/api/contracts`에 신청 접수 화면용 1차 필터를 추가했다.
- `admin-web` 신청 접수 skeleton의 검색 폼을 계약 목록 API query parameter와 연결했다.
- `users` join 기준으로 회원ID, 회원명, 회사명 검색을 추가했다.
- legacy `request_shop`에 대응하는 `request_shop` count 필드를 추가했다.
- legacy `sub_complete` 필드는 신규 schema의 `moneybank_contract_document` 기준으로 1차 산출한다.
- legacy `prizm_score`는 최신 PCS 결과의 `prizm_grade` 기준으로 1차 제공한다.
- Admin 화면에서 상태 버튼 클릭 시 `GET /v1/api/contracts/{mbid}` 상세 API를 조회하는 상세 패널을 추가했다.
- Vite dev server proxy는 기존대로 `/v1/api`를 `http://127.0.0.1:8000`으로 전달한다.

## 변경 파일

- `service-api\src\cubici_service\contracts\repository.py`
- `service-api\src\cubici_service\api\v1\endpoints\contracts.py`
- `service-api\tests\test_domain_routes.py`
- `admin-web\src\api\contracts.js`
- `admin-web\src\pages\AdminDashboardPage.jsx`
- `docs\2026-07-20_CUBICI_CONTRACT_FILTER_API_ADMIN_CONNECTION.md`

## 추가된 API Query

| 파라미터 | 기준 컬럼 | 비고 |
| --- | --- | --- |
| `user_id` | `users.email` | 부분 검색 |
| `user_name` | `users.name` | 부분 검색 |
| `firm_name` | `users.biz_name` | 부분 검색 |
| `status` | `moneybank_contract.status` | 정확 일치 |
| `product_code` | `moneybank_contract.product_code` | 정확 일치 |
| `min_sales_amount` | `moneybank_contract.sales_amount` | 이상 |
| `max_sales_amount` | `moneybank_contract.sales_amount` | 이하 |
| `from_date` | `moneybank_contract.request_date` | 해당일 00:00 이후 |
| `to_date` | `moneybank_contract.request_date` | 해당일 포함 |
| `order_by` | `request_date`, `sales_amount` | `request_date_desc`, `request_date_asc`, `sales_amount_desc`, `sales_amount_asc` |

## 추가된 목록 응답 필드

| 필드 | 기준 | 비고 |
| --- | --- | --- |
| `request_shop` | `moneybank_contract_shop` count | legacy `MONEYBANK_USER_REQUEST_SHOP` count 대응 |
| `sub_complete` | `moneybank_contract_document` | `final_confirm_admin` 또는 주요 확인 flag 기준 |
| `prizm_score` | 최신 `prizm_pcs_result.prizm_grade` | legacy 화면의 Prism Score 대응 |

## 제한 사항

- legacy `requestState.jsp`의 회원명, 회사명, 회원ID 검색은 `moneybank_contract.user_no -> users.user_no` 기준으로 1차 연결했다.
- `등록쇼핑몰` 표시는 `request_shop` count로 맞췄다.
- legacy `MONEYBANK_SUB_CHECK`는 신규 schema에서 `moneybank_contract_document`로 통합된 것으로 추정한다.
- `sub_complete` 산출식은 `final_confirm_admin` 존재 또는 주요 확인 flag가 모두 충족된 경우 `Y`로 본다.
- 사용자 승인 후 `C:\PostgreSQL` 설치본을 확인했고 PostgreSQL 17을 실행했다.
- `GET /v1/api/contracts` 실데이터 응답을 확인했다.
- `status=CONTRACT` 필터가 CONTRACT 상태만 반환하는 것을 확인했다.
- Vite proxy를 통한 `/v1/api/contracts` 호출도 HTTP 200으로 확인했다.

## 검증 여부

- Backend: `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest D:\Alt_CSM\Cubici\service-api\tests`
- 결과: `13 passed`
- Frontend: `npm run build`
- 결과: Vite build 성공, 32 modules transformed, built in 4.20s
- Runtime: PostgreSQL ready, API HTTP 200, Vite proxy HTTP 200
- 실데이터 repository 확인: total 7, `request_shop`, `sub_complete`, `prizm_score` 필드 확인
- 상세 API 확인: detail found, shops/fees/risk_result 구조 확인
- Vite proxy 확인: 목록/상세 API 모두 HTTP 200

## 다음 액션

1. `sub_complete` 산출식을 legacy 운영 데이터와 대조 검증
2. 신청 접수 상세 패널을 legacy `submissionState.jsp` 흐름에 맞게 확장
3. legacy 화면과 React 화면의 시각 차이 확인

추가 runtime 검증 기록: `docs\2026-07-20_CUBICI_LOCAL_RUNTIME_VERIFICATION.md`

추가 sub_complete 매핑 기록: `docs\2026-07-20_CUBICI_SUB_COMPLETE_MAPPING.md`
