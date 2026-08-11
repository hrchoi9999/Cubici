# M5 관리자 최종 회귀검증 결과

## 결론

- 관리자 직접 메뉴 24개와 상세·파생 화면 10개, 총 34개 route가 모두 공통 관리자 레이아웃으로 표시된다.
- route 34개와 좌측 메뉴 동작 1건을 합친 Playwright smoke는 최종 `35/35` 통과했다.
- D01·D02·D03·D04·D10 PC/mobile focused 회귀는 `10/10` 통과했다.
- 회귀 중 발견한 `환경설정 > 머니뱅크 관리` 메뉴 및 `manageMoneybank_tab1/tab2` 매핑 누락을 수정했다.
- 운영 배포는 M5 범위가 아니며 별도 승인 Batch로 남긴다.

## 검증 결과

| 검증 | 결과 | 시간/근거 |
|---|---|---:|
| Docker 개발 DB 컨테이너 | `healthy` | `cubici-postgres-dev` |
| 개발 DB 포트 | 연결 성공 | `127.0.0.1:55432` |
| 관리자 production build | 통과 | 75 modules, 12.93초 |
| 관리자 34 route + 좌측 메뉴 smoke | `35/35` 통과 | 48.1초 |
| D01·D02·D03·D04·D10 focused 회귀 | `10/10` 통과 | 31.7초 |
| preview 종료 | 완료 | 4174 포트 닫힘 확인 |

## 발견 및 수정

| 구분 | 발견 | 조치 |
|---|---|---|
| 제품 route | `manageMoneybank_tab1`이 `Route 점검/미구현 경로`로 표시됨 | `환경설정 > 머니뱅크 관리`로 연결 |
| 제품 route | `manageMoneybank_tab2`가 `자금조달 관리` 메뉴에 잘못 연결됨 | 상품 목록과 같은 환경설정 메뉴로 연결 |
| 공통 메뉴 | 환경설정 좌측 메뉴에서 `머니뱅크 관리` 누락 | 승인된 Batch 5B 구조에 맞게 항목 복원 |
| 회귀 테스트 | 32 route만 포함하고 과거 메뉴명을 고정 비교 | 누락 2 route 추가, 현재 상단 제목과 활성 메뉴 정합성 비교 |

## DB/API preflight 분류

- Docker와 FastAPI의 로컬 DB 설정을 루트 `.env`로 통일했다.
- 관리자 인증 누락 시 36개 API 호출 전에 즉시 중단하도록 fail-fast를 적용했다.
- 로컬 임시 관리자 계정으로 실제 `/accounts/admin-login`을 통과하고 Bearer Token을 발급했다.
- 기본 36건과 데이터 기반 상세 8건, 총 44건은 `fail=0`, `review=2`, `deferred=7`로 완료했다.
- 검토 2건은 기존 원장 차이 `-3,616원`이며 신규 장애가 아니다.
- 임시 관리자 계정은 종료 후 삭제되어 잔여 0건이다.
- 비밀번호, Token, row-level 개인정보는 출력하거나 문서에 기록하지 않았다.

## 진행률

| 범위 | 화면 복원율 | 내부 기능 구현율 |
|---|---:|---:|
| 사용자 26개 | 100% | 90.4% |
| 관리자 직접 메뉴 24개 | 100% | 84.5% |
| 관리자 상세·파생 10개 | 100% | 81.1% |
| 관리자 전체 34개 | 100% | 83.5% |

M5는 UI route 회귀를 완료했으며 내부 기능 잔여율은 변경하지 않는다. legacy 산식, RawData Excel·감사정책, 일부 실 DB CRUD, 외부 연동은 별도 기능 Batch다.

## 다음 Batch

1. M5 및 인증 preflight 변경 commit·push 완료: `dd785db`.
2. Cloudflare Pages 운영 배포와 운영 URL smoke 완료: `f9efb16f.cubici.pages.dev`.
3. 운영 API/DB health는 HTTP 200이며 Docker API image 재배포는 수행하지 않았다.
4. 상세 결과는 `docs/2026-08-11_CUBICI_M5_CLOUDFLARE_PRODUCTION_DEPLOYMENT.md`에 기록했다.
