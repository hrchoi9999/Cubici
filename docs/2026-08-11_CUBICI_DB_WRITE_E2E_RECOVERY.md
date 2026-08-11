# Cubici 개발 DB 쓰기 E2E 인증 복구

## 범위

- Docker 개발 DB `cubici-postgres-dev`만 사용
- 기존 DB 비밀번호와 실제 관리자 계정은 조회하지 않음
- 일회성 DB 역할과 `.invalid` 가상 master 관리자로 쓰기 E2E 실행
- 테스트 완료 여부와 관계없이 일회성 역할과 사용자를 삭제

## 검증 대상

| 기능 | 테스트 |
|---|---|
| 관리자 계정 신청·승인·수정·중복 방지 | `test_admin_account_policy_db_e2e.py` |
| 계약 신청·수수료 조정·승인·계약·취소 제한 | `test_contract_lifecycle_db_e2e.py` |
| 펌뱅킹 제공자 등록·중복 방지 | `test_fintech_funding_provider_db_e2e.py` |
| 머니뱅크 상품 등록·수정·조회 | `test_moneybank_product_preference_db_e2e.py` |

## 결과

- 최초 재실행: DB 인증 복구 후 3 passed, 2 failed
- 실패 원인: 테스트용 master 관리자 식별자 미주입
- 가상 master 관리자 보완 후: 5 passed
- 재사용 스크립트 최종 재검증: 5 passed, 6.48초, pytest 경고 없음
- 일회성 역할, 가상 관리자, 사용자·상점·펌뱅킹·상품 테스트 잔여: 모두 0건
- 운영 DB와 외부 연동은 사용하지 않음

## 재실행

```powershell
powershell -ExecutionPolicy Bypass -File service-api/scripts/run_db_write_e2e.ps1
```

실행 스크립트는 개발 DB health를 먼저 확인하고 실제 비밀번호를 파일이나 로그에 기록하지 않는다.
