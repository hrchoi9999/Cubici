# Cubici A07-A09 브라우저 DB Lifecycle 회귀

## 범위

- 사용자 머니뱅크 신청 및 서류 2건 업로드
- A07 신청/승인에서 `REQUEST` 계약을 `PENDING_REVIEW`로 전환
- A08 심사 승인에서 지급율·한도·수수료 조건 저장 및 제시
- 사용자 이용조건 동의
- A09 계약/상환에서 계약 체결 및 `ACCOUNT_STANDBY` 전환

## 보완 내용

- 계약 목록 API가 최신 지급율뿐 아니라 건당 주문한도와 최대 미상환잔액을 함께 반환하도록 조회 SQL을 보완했다.
- 계약 목록의 최근 미상환잔액 조회에 필요한 lateral join을 복구했다.
- 기존 브라우저 lifecycle 테스트를 현재 LV 화면 구조와 A07-A09 분리 업무 흐름에 맞췄다.
- 개발 DB 전용 일회성 관리자·DB 역할을 생성하고 종료 시 정리하는 실행 스크립트를 추가했다.

## 검증 결과

- service-api 개발 DB write E2E: `5 passed`
- A07-A09 Playwright 개발 DB lifecycle: `1 passed (19.6s)`
- user-web production build: 통과
- admin-web production build: 통과
- API 응답: 신청, 파일 업로드, 상태 전환, 조건 저장, 계약 체결 모두 HTTP 200
- 최종 상태: `ACCOUNT_STANDBY`
- 임시 역할·사용자·상점·첨부파일 잔여: 모두 0건

## 실행 방법

```powershell
powershell -ExecutionPolicy Bypass -File admin-web/scripts/run_moneybank_full_lifecycle_db_e2e.ps1
```

운영 DB와 실제 운영 계정은 사용하지 않는다.
