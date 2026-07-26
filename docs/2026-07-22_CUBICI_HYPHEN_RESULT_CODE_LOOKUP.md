# Cubici Hyphen Result Code Lookup

## 작업 결과

- 복사된 하이픈 API 문서와 legacy DB 코드표에서 펌뱅킹 결과코드 의미를 확인했다.
- 확인된 코드명은 API 결과정책 사유에 반영했다.
- 확인되지 않은 코드는 성공/정상으로 추정하지 않고 `코드명 미확인`으로 유지한다.

## 확인 대상

- `0104`
- `0105`
- `2002`
- `2007`
- `9011`
- `9018`

## 확인 결과

| 코드 | 확인된 의미 | 출처 | 반영 정책 |
|---|---|---|---|
| `0104` | 수취인계좌 잔액증명서 발급 | PostgreSQL `hyphen_bank_code` | 실패·반려 |
| `0105` | 수취인계좌 통장정리후 거래가능 | PostgreSQL `hyphen_bank_code` | 실패·반려 |
| `2002` | 자동이체미등록 | PostgreSQL `hyphen_bank_code` | 실패·반려 |
| `2007` | 자동이체해지(영업점해지) | PostgreSQL `hyphen_bank_code` | 실패·반려 |
| `9011` | 미확인 | 내부 문서/DB 코드표 미확인 | 실패·반려, 코드명 미확인 |
| `9018` | 미확인 | 내부 문서/DB 코드표 미확인 | 실패·반려, 코드명 미확인 |

## 문서 확인 메모

- `하이픈_뱅킹_송금대행_API_(정의)_22.09.21.xlsx` 추출본에서 요청/응답 필드는 확인했다.
- 해당 Excel 정의서에는 `replyCode`, `failureCode`, `rtnCode`, `resultCode` 설명이 있으나 코드별 의미는 `응답코드집 참조`로만 되어 있다.
- 복사된 ZIP/소스/설정 파일 내에서 별도 응답코드집 원문은 확인하지 못했다.

## 변경 파일

- `service-api/src/cubici_service/fintech/repository.py`
- `service-api/tests/test_domain_routes.py`
- `docs/2026-07-22_CUBICI_HYPHEN_RECV_RESULT_POLICY.md`
- `docs/2026-07-22_CUBICI_FINTECH_RESULT_POLICY_LABEL.md`
- `docs/2026-07-22_CUBICI_HYPHEN_RESULT_CODE_LOOKUP.md`

## 다음 액션

1. 하이픈/은행 응답코드집 원문을 확보하면 `9011`, `9018` 의미를 보완한다.
2. 관리자 펌뱅킹 전문 화면에 정책 라벨 필터를 추가한다.
