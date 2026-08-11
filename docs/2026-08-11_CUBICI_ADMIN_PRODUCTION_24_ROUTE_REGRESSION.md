# Cubici 운영 관리자 24 route 회귀 및 메뉴 전환 보완

## 범위

- 운영 관리자 직접 메뉴 24개 인증 후 회귀
- 공통 header, sub visual, sidebar, content 정렬 확인
- 실데이터 본문, table, canvas, route fallback과 화면 overflow 확인
- 메뉴 이동 시 반복되는 관리자 권한 확인 화면 보완

## 운영 24 route 결과

| 화면군 | 직접 메뉴 | 결과 |
|---|---:|---|
| 회원관리 | 1 | 통과 |
| 쇼핑몰 통합 | 2 | 통과 |
| 머니뱅크 운영 | 10 | 통과 |
| 고객관리 | 3 | 통과 |
| 모니터링 | 3 | 통과 |
| 환경설정 | 5 | 통과 |
| 합계 | 24 | 24/24 통과 |

모든 직접 메뉴에서 다음을 확인했다.

- 관리자 로그인 상태 유지
- LV 공통 shell의 좌측 메뉴와 본문 가로 정렬
- 대분류·화면명 매핑
- 본문 article과 table 표시
- 브라우저 body 가로 overflow 없음
- `미구현 경로`, `Route 점검` fallback 없음
- 화면상 조회·서버·네트워크 오류 문구 없음
- 회원 현황 1개, 쇼핑몰 통합 3개, 머니뱅크 통합 3개 canvas 존재
- 쇼핑몰 통합 전체 화면에서 선·막대·축을 포함한 그래프 렌더링 확인

## 발견 결함

- 관리자 sidebar 링크가 일반 `<a>` 이동을 사용해 메뉴를 바꿀 때마다 전체 HTML이 다시 로드됐다.
- 매 이동마다 master 관리자 API 검증이 반복되고 전체 화면에 `관리자 권한 확인 중입니다.`가 노출됐다.
- 운영 Chrome 측정에서 DOM 전환은 약 0.6초였지만 실제 화면 paint 완료까지 추가 지연이 확인됐다.

## 보완

- App이 현재 URL을 state로 관리하고 `popstate`에 반응하도록 변경했다.
- 관리자 공통 layout 내부의 동일 origin `/admin*` 링크는 `history.pushState`로 전환한다.
- 새 탭, 다운로드, modifier click, 외부 링크, 로그아웃은 기존 브라우저 동작을 유지한다.
- 페이지별 기존 `preventDefault` 탭 동작도 우선 적용되도록 유지한다.
- 뒤로가기는 `popstate`로 원래 관리자 화면을 복원한다.

## 검증

| 항목 | 결과 |
|---|---|
| admin production build | 통과, 75 modules, 3.67초 |
| SPA 이동 focused E2E | 1/1 통과 |
| 공통 shell focused E2E | 4/4 통과 |
| 세션 검증 횟수 | 최초 진입 1회, 내부 메뉴 이동·뒤로가기 추가 호출 없음 |
| 로그인/PC shell/mobile drawer | 통과 |

## 상태와 다음 단계

- 운영 24 route UI·실데이터 표시 회귀: 완료
- 메뉴 전환 UX source 보완: 완료
- 관리자 이메일의 frontend build-time 주입을 제거하고 Backend master 관리자 검증을 단일 권한 기준으로 유지했다.
- Git commit/push와 운영 배포: 미수행
- 사용자 승인 후 변경분을 배포하고 운영 메뉴 클릭에서 권한 확인 화면이 재노출되지 않는지 focused smoke한다.
