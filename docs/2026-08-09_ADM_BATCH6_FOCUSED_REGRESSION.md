# Cubici ADM Batch 6 - 관리자 focused regression

## 범위

- 관리자 직접 메뉴 24개 PC/mobile focused regression
- 환경설정 6개 화면의 목록/상세/등록·수정·삭제 mock 회귀
- Backend API, 권한, 상태전이, 정산 산식 focused test
- 개발 PostgreSQL 기반 관리자 계정, 계약 lifecycle, 머니뱅크 상품, 지급·상환 취소 DB E2E
- 이미 완료된 운영 데이터 읽기 33개 route 회귀는 중복 실행하지 않음

## 변경 내용

- 기존 환경설정 CRUD 테스트 6개에 공통 mock 관리자 인증 helper를 추가했다.
- 관리자 인증 필수화 이전 테스트가 로그인 화면에서 중단되던 문제를 테스트 fixture에서 해결했다.
- production React/FastAPI 소스와 API schema는 변경하지 않았다.
- DB 계정정보는 출력·파일 기록하지 않고 개발 컨테이너의 실행환경을 테스트 프로세스에만 일시 전달했다.

## 검증 결과

| 구분 | 결과 | 비고 |
|---|---:|---|
| 환경설정 CRUD mock Playwright | 6/6 통과 | 관리자 승인, 요금제, 연계코드, 협력사, 머니뱅크 상품, Prism 수정 흐름 |
| 관리자 직접 메뉴 responsive Playwright | 24/24 통과 | PC/mobile, 검색·상세, pagination, body overflow |
| Backend 비DB pytest | 121 passed, 6 skipped | API 계약, 권한, 상태정책, 정산 산식 포함 |
| Backend 실 DB E2E | 6/6 통과 | 개발 PostgreSQL `55432`, 관리자 계정 1·계약 2·상품 1·지급/상환 취소 2 |
| 개발 DB preflight | healthy | `cubici-postgres-dev`만 사용 |

첫 DB 실행은 비밀번호 미주입으로 `2 failed, 4 skipped`, 두 번째는 master 관리자 미설정으로 `4 failed`였다. 모두 환경/fixture 실패로 분류했으며 개발 DB의 기존 환경을 값 출력 없이 주입한 최종 focused 실행에서 6건이 통과했다.

## 화면군별 판정

| 화면군 | 직접 메뉴 | 이번 검증 | 기능 판정 |
|---|---:|---|---|
| 통합정보·회원·머니뱅크 관리 | A01~A06 | responsive 6/6, API/domain 통과 | 조회·검색 정상, 집계/잔액/Excel 검산 잔여 |
| 머니뱅크 운영 | A07~A12 | responsive 6/6, 계약·상환 DB E2E 및 상태/정산 test 통과 | 핵심 lifecycle 정상, 정산 28건과 Prism legacy 산식 잔여 |
| 고객관리 | A13~A15 | responsive 3/3, API CRUD contract 통과 | 내부 CRUD 정상, 알림·첨부·노출정책 잔여 |
| 모니터링 | A16~A18 | responsive 3/3, monitoring/fintech API contract 통과 | 내부 조회 정상, OS metric·실송금 제외 |
| 환경설정 | A19~A24 | responsive 6/6, CRUD mock 6/6, 실 DB 2개 기능 통과 | 관리자 계정·머니뱅크 상품 DB 정상, 나머지 실 DB CRUD와 RawData 산식 잔여 |

## 보수적 진행률

- 관리자 직접 메뉴 화면 후보 검증: 24/24
- 관리자 직접 메뉴 화면 승인: 24/24
- 관리자 직접 메뉴 평균 기능 구현율: 74.2%
- 운영 데이터 읽기: 직접 메뉴 24/24, 상세/파생 9/9
- 상세/파생 route 기준: 33개
- legacy JSP 물리 파일 후보: 61개

기능 구현율은 UI/API/저장·변경/legacy 산식/E2E를 분리해 산정했다. test 통과만으로 미적재 데이터나 legacy 산식 검산을 완료 처리하지 않았다.

## 남은 기능·산식

1. 통합정보와 머니뱅크 현황의 chart·잔액 legacy 산식 대조
2. 회원 상태 unique 집계와 결제 취소 원천 검증
3. 정산 관리 28건 차이의 legacy batch 원인 검산
4. Prism 결과 불완전 3건, 설정 미완성 26건, RawData 산식 0건 보완
5. 요금제·연계코드·협력사의 실 DB CRUD/삭제정책 E2E
6. 고객 알림·첨부, 서버 OS metric, 실제 펌뱅킹 송금은 외부연동/추가개발 범위 유지

## 상태

- Batch 6 focused regression: 완료
- production source defect: 발견 없음
- Git staging/commit/push: 수행하지 않음
- 운영 배포: 수행하지 않음
- 다음 단계: 사용자 승인 후 Batch 7 production build, Git 점검, commit/push 및 운영 배포
