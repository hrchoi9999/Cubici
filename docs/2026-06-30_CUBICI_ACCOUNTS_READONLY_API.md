# Cubici Accounts Read-only API

작성일: 2026-06-30

## 작업 결과

- 회원/쇼핑몰 계정 read-only 목록 API를 추가했다.
- Endpoint는 `GET /v1/api/accounts/users`로 정했다.
- 응답은 개인정보 원문을 제외한 운영 메타데이터 중심으로 구성했다.
- DB 조회는 `accounts.repository`로 분리했다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Cubici/service-api/src/cubici_service/accounts/repository.py` | 회원 목록 PostgreSQL 조회 |
| `Cubici/service-api/src/cubici_service/accounts/__init__.py` | accounts domain package |
| `Cubici/service-api/src/cubici_service/api/v1/endpoints/accounts.py` | `/accounts/users` endpoint |
| `Cubici/service-api/tests/test_domain_routes.py` | route 및 endpoint payload 테스트 |
| `Cubici/service-api/README.md` | accounts users endpoint 기록 |

## Endpoint

- `GET /v1/api/accounts/users?limit=20&offset=0`

응답 항목:

- `limit`
- `offset`
- `total`
- `items[].user_no`
- `items[].user_type`
- `items[].partner_code`
- `items[].fintech_id`
- `items[].shop_account_count`
- `items[].last_login_date`
- `items[].reg_date`
- `items[].modified_date`

## 판단

- 초기 API는 운영 재현을 위한 목록 뼈대를 우선 제공한다.
- 이메일, 이름, 전화번호, 사업자번호, 계좌정보 등 원문 민감 필드는 이번 목록 응답에서 제외했다.
- 관리자 화면에서 원문 확인이 필요한 항목은 권한/마스킹 정책 확정 후 별도 detail API로 분리한다.

## 검증 여부

- Python 3.14.5 `.venv` 기준 `pytest Cubici/service-api/tests`: 6 passed.
- 실제 PostgreSQL 조회 확인: total `45`, limit `5`, returned item count `5`.
- OpenAPI path 확인: `/v1/api/accounts/users`.
- 민감값/원본 INSERT 패턴 검색: 매칭 없음.

## 다음 액션

1. account detail API의 민감 필드 노출 정책을 정한다.
2. 판매/정산/계약 목록 API를 같은 pagination 규칙으로 확장한다.
