# ADM-LV-01 회원관리 > 회원 현황

## 작업 범위

- 화면: `/admin/cubici/manageMember/member_tab1`
- LV 구조 기준: 회원 집계 카드, 조회 조건, 회원 현황 혼합 그래프
- 기능 기준: 실제 PostgreSQL 집계 API, 협력사/서비스 조회 조건, CSV 다운로드
- 승인 상태: 2026-08-09 사용자 승인 완료

## LV 근거

| 자료 | 적용 근거 |
|---|---|
| `D:/Cubici/src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/manageMember/member_tab1.jsp` | 지표 카드, 검색 영역, 그래프 패널 구조 |
| `D:/Cubici/src/main/webapp/resources/chart-admin/ac2p1-1.js` | 누적 큐빅아이 막대, 누적 머니뱅크/가입해지 선, 머니뱅크 비율 보조축 |
| `docs/reference/lv-ui/admin/reference` | 공통 헤더, 타이틀, 좌측 메뉴, 색상과 간격 |

## 구현 내역

- LV 카드형 회원 집계와 검색 폼을 React 컴포넌트로 복원했다.
- legacy Chart.js 자원을 사용해 막대/선 혼합 그래프와 좌우 축을 복원했다.
- 협력사와 서비스 구분은 실제 DB 값을 제공하는 `/v1/api/management/member-summary/options` API로 연결했다.
- 서비스 구분은 설정값이 없는 현재 DB 상태를 고려해 실제 머니뱅크 계약의 `product_code`를 중복 제거해 제공한다.
- 조회 결과를 CSV로 내려받는 `엑셀 다운로드` 동작을 유지했다.
- 모바일에서는 집계 카드 2열, 검색 조건 1열, 가로 넘침 없는 그래프로 재배치했다.

## 실제 DB/API 검증

| 항목 | 결과 |
|---|---:|
| 기준일 | 2026-08-09 |
| 큐빅아이 누적 | 40명 |
| 머니뱅크 누적 | 7명 |
| 가입해지 누적 | 2명 |
| 제휴 회원 누적 | 4개 |
| 그래프 시계열 | 31개 |
| 협력사 조회 옵션 | 4개 |
| 서비스 조회 옵션 | 1개 |
| 최종 시계열과 누적 집계 일치 | 일치 |

## 검증 결과

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 73 modules |
| backend focused pytest | 2 passed |
| mock-data PC/모바일 Playwright | 2 passed |
| actual Docker DB PC/모바일 Playwright | 2 passed |
| Chart canvas pixel 검증 | 통과 |
| 모바일 가로 overflow | 없음 |

## 승인 이미지

- `docs/reference/lv-ui/admin/ADM-LV-01-MEMBER-SUMMARY/approved/ADM-LV-01-MEMBER-SUMMARY-LIVE-PC.png`
- `docs/reference/lv-ui/admin/ADM-LV-01-MEMBER-SUMMARY/approved/ADM-LV-01-MEMBER-SUMMARY-LIVE-MOBILE.png`

## 미완료 경계

- 이번 변경은 commit, push, 운영 배포하지 않았다.
- 다음 관리자 화면은 `ADM-LV-02 쇼핑몰 통합 > 통합 현황`이다.
