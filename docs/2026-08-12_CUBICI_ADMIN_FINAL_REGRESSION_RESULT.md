# Cubici 관리자 최종 회귀검증 결과

## 결론

- 현재 승인된 LV 기준 관리자 직접 메뉴 24개와 상세·파생 10개, 총 34개 route에서 제품 회귀 결함은 확인되지 않았다.
- 관리자 route 34개와 좌측 메뉴 1건은 `35/35` 통과했다.
- 최신 승인본 A01~A24 PC·모바일 및 기능 검증은 `55/55` 통과했다.
- 상세·파생 화면과 PCS-only Prism 결과 focused 검증은 `13/13` 통과했다.
- Backend는 `138 passed, 7 skipped`, 실제 Docker DB 쓰기 E2E는 `5/5` 통과했다.
- DB/API 운영 preflight는 44건 중 `fail=0`, 기존 REVIEW 2건, 추가개발 DEFERRED 7건이다.
- Git commit/push와 운영 배포는 이번 회귀검증 Batch에서 수행하지 않았다.

## 검증 환경

| 항목 | 결과 |
| --- | --- |
| Docker DB | `cubici-postgres-dev` healthy |
| PostgreSQL | `127.0.0.1:55432`, `select 1` 성공 |
| 관리자 build | 통과, 75 modules transformed |
| 브라우저 | 설치된 Google Chrome을 Playwright 실행 경로로 사용 |
| preview | 검증 후 4178 포트 종료 확인 |

## 자동 검증 결과

| 구분 | 결과 | 판정 |
| --- | ---: | --- |
| Backend 전체 pytest | 138 passed, 7 skipped | 통과 |
| 관리자 route + 좌측 메뉴 | 35/35 | 통과 |
| 최신 LV A01~A10 | 23/23 | 통과 |
| 최신 LV A11~A17 | 13/13 | 통과 |
| 최신 LV A18~A24 | 19/19 | 통과 |
| 상세·파생 및 PCS-only | 13/13 | 통과 |
| 실제 Docker DB 쓰기 E2E | 5/5 | 통과 |
| 데이터 품질 규칙 | 31개 중 29개 통과 | 알려진 이슈 2개 유지 |
| 운영 DB/API preflight | 44건, fail 0 | REVIEW 2, DEFERRED 7 |
| Git 보안 사전점검 | staging 0, 비밀키 서명 0 | 실제 `.env`·`data_local` 추적 0 |

중복 검증을 포함한 현재 승인본 Playwright 실행은 총 `103/103` 통과했다. DB 쓰기 E2E는 임시 사용자와 PostgreSQL 역할을 생성한 뒤 `finally` 정리했고, 종료 후 잔여 건수는 사용자 0건·역할 0건이다.

## 데이터 판정

| 항목 | 결과 | 분류 |
| --- | ---: | --- |
| 최신 PCS/PMS 쌍 미완성 | 3건 | 실거래·테스트 데이터 혼재 제한 |
| 활성 협력사 주담당자 누락 | 3개 | 실제 원천 확인 전 보완 금지 |
| 통합 원장 차이 | -3,616원, 2개 화면에서 동일 노출 | 기존 REVIEW, 신규 장애 아님 |
| 펌뱅킹 실연동 | 4개 검사 | DEFERRED, 외부연동 추가개발 |
| 금융상품 기준데이터 | 1개 검사 | DEFERRED |
| RawData 정밀 산식 | 2개 검사 | DEFERRED |

## 과거 Batch 스펙 분류

초기 반응형 Batch 2·3·4·5·5B 스펙을 참고 실행한 결과는 `12/24` 통과, 12건 실패였다. 실패 원인은 다음과 같이 후속 LV 복원으로 변경된 화면을 과거 selector와 정책으로 검사한 데 있다.

- 현재 그래프 화면을 과거 `.integratedPanel tbody`로 검사
- 현재 전용 계약·상환 테이블을 과거 공통 table chrome selector로 검사
- 현재 검색 파라미터와 다른 과거 요청 조건을 대기
- 화면 폭에 맞는 테이블도 무조건 가로 overflow가 있어야 한다고 판정
- 현재 정상 표시되는 Prism 편집 패널이 없어야 한다고 판정

같은 화면은 최신 승인본 A01~A24 스펙에서 모두 PC·모바일과 주요 기능을 재검증해 `55/55` 통과했다. 따라서 과거 Batch 스펙 실패는 제품 실패가 아니라 테스트 노후화로 분류한다. 다만 기본 전체 E2E에서 혼동되지 않도록 역사 스펙을 archive하거나 최신 구조에 맞게 제거하는 작업은 별도 테스트 유지보수 Batch로 남긴다.

## 진행률

| 기준 | 화면 복원율 | 내부 기능 구현율 |
| --- | ---: | ---: |
| 사용자 26개 | 100% | 90.4% |
| 관리자 직접 메뉴 24개 | 100% | 84.5% |
| 관리자 상세·파생 10개 | 100% | 81.1% |
| 관리자 전체 34개 | 100% | 83.5% |

관리자 화면 수는 React 직접 메뉴 24개, 상세·파생 10개, 전체 34개다. legacy 기준은 좌측 메뉴 21개, JSP 물리 파일 72개, 감사 대상 JSP 61개로 구분한다.

## 잔여 작업

1. 과거 Batch Playwright 스펙 5개 기본 회귀 분리: 완료. 별도 기록은 `2026-08-12_CUBICI_ADMIN_LEGACY_PLAYWRIGHT_ARCHIVE.md` 참조.
2. PMS·정산·통합 원장의 legacy 산식 replay와 검산은 별도 산식 Batch로 유지한다.
3. 협력사 담당자는 실제 원천 확인 후 입력한다.
4. Git 민감정보 점검, staging 범위 확정, commit/push는 별도 승인 후 수행한다.
5. 운영 배포와 운영 URL smoke는 Git 반영 이후 별도 승인 Batch로 수행한다.

이번 Batch에서 Git 보안 사전점검은 통과했다. 파일명 탐지 1건은 값이 없는 배포 예시 파일 `service-api/.env.example`이며, 실제 루트 `.env`와 `data_local`은 `.gitignore` 적용 및 Git 추적 0건을 확인했다. 아직 staging하지 않았으므로 최종 staging 대상 검토와 commit/push는 다음 승인 범위로 유지한다.
