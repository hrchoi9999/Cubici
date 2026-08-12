# Cubici 관리자 과거 Playwright 스펙 분리

## 결론

- 초기 관리자 반응형 Batch 2·3·4·5·5B 스펙 5개를 기본 Playwright 회귀 대상에서 제외했다.
- 파일은 삭제하거나 이동하지 않고 역사 검증 자료로 보존했다.
- Batch 1 공통 shell 스펙은 현재 관리자 구조와 충돌하지 않아 기본 회귀에 유지했다.
- 최신 LV A01~A24와 상세·파생 스펙이 현재 제품 회귀 기준이다.

## 기본 제외 파일

1. `adm-batch2-six-pages-responsive.spec.js`
2. `adm-batch3-moneybank-operation-responsive.spec.js`
3. `adm-batch4-customer-management-responsive.spec.js`
4. `adm-batch5-monitoring-responsive.spec.js`
5. `adm-batch5b-environment-responsive.spec.js`

이 스펙들은 후속 LV 복원 이전의 selector, 검색 파라미터, 공통 table 구조와 편집 패널 정책을 검사한다. 2026-08-12 참고 실행에서 `12/24`만 통과했으나, 동일 화면의 최신 승인본 회귀는 `55/55` 통과했다. 따라서 제품 실패가 아니라 노후 테스트로 분류한다.

## 실행 정책

- 기본 실행: 위 5개 스펙 제외
- 역사 스펙 조사: 실행 환경에 `CUBICI_INCLUDE_LEGACY_RESPONSIVE_SPECS=1` 지정
- 역사 스펙 실패는 현재 제품 회귀 실패율에 합산하지 않는다.
- 역사 스펙을 다시 활성화해도 최신 LV 스펙을 대체하지 않는다.

설정은 `admin-web/playwright.config.js`의 `legacyResponsiveSpecs` 목록에서 관리한다. 숨은 파일명 규칙 대신 명시적 목록을 사용해 제외 범위를 고정했다.

## 검증 기준

1. 기본 `--list` 결과에 5개 역사 스펙이 0건이어야 한다.
2. opt-in `--list` 결과에는 역사 스펙 24개 테스트가 다시 나타나야 한다.
3. Batch 1 공통 shell 스펙은 기본 목록에 남아 있어야 한다.
4. 최신 관리자 route 34개와 최신 LV 스펙은 기본 목록에 남아 있어야 한다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| 기본 Playwright 수집 | 168 tests / 67 files |
| 기본 목록의 역사 스펙 | 0건 |
| 기본 목록의 Batch 1 공통 shell | 4건 유지 |
| 기본 목록의 관리자 route·메뉴 | 35건 유지 |
| opt-in 역사 스펙 수집 | 24 tests / 5 files |
| Batch 1 + 관리자 route 실제 실행 | 39/39 통과 |
| preview 종료 | 4178 포트 종료 확인 |

기본 목록과 opt-in 목록을 각각 실제 Playwright `--list`로 검증했다. 제외 목록이 최신 회귀 수집을 침범하지 않는지 공통 shell과 관리자 34 route를 실제 브라우저로 재실행해 확인했다.

## 진행률 영향

- 관리자 화면 복원율: 34/34, 100% 유지
- 관리자 내부 기능 구현율: 83.5% 유지
- 이번 작업은 테스트 기준 정리이며 제품 기능과 운영 배포 상태는 변경하지 않는다.
- Git commit/push와 운영 배포는 수행하지 않는다.
