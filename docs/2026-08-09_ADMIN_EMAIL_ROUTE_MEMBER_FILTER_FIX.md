# 관리자 이메일 route 및 회원정보 기본 필터 보완

## 범위

- 이메일 파생 route의 관리자 메뉴/제목 alias 보완
- 회원정보 tab2 초기 조회의 최근 10년 날짜 제한 제거
- Backend/API/DB schema 변경 없음
- 운영 배포는 관리자 전체 완료 시점까지 보류

## 변경

### 이메일 파생 route

`/admin/cubici/supportMember/manageEmail`을 고객관리의 `문자/이메일` 메뉴에 매핑했다. 이메일 데이터 조회 기능은 기존 구현을 유지하고 `Route 점검 / 미구현 경로`로 표시되던 상단 제목만 정상화했다.

### 회원정보 초기 조회

초기 `from_date`, `to_date`를 빈 값으로 변경했다. 검색기간을 사용자가 지정하지 않으면 API에 날짜 파라미터를 보내지 않으므로 DB 전체 42건을 조회한다. 기존 최근 10년 필터의 40건 표시는 제거된다.

## 검증

| 항목 | 결과 |
|---|---|
| 관리자 production build | 성공, 73 modules |
| 이메일 route mapped layout | Playwright 통과 |
| 회원정보 초기 날짜 입력 | 빈 값 확인 |
| 초기 API 요청 날짜 파라미터 | `from_date`, `to_date` 없음 확인 |
| focused Playwright | 2/2 통과 |
| preview 서버 종료 | 확인 |

## 판정

- 로컬 관리자 후보: route·제목·데이터 기준 33/33 정상
- 현재 운영 관리자: 이전 배포 기준 32/33 정상
- Git commit/push 및 운영 배포: 수행하지 않음
