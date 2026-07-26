# Cubici Submission Detail Panel

작성일: 2026-07-20

## 작업 결과

- legacy `submissionState.jsp`의 제출서류 확인 화면 구조를 분석했다.
- React Admin 상세 패널을 `회원정보`, `신용정보 입력`, `서류 확인` 섹션으로 확장했다.
- bit/flag 표시값을 화면에서 `Y`, `N`, `-`로 정규화하는 `formatFlag`를 추가했다.
- 개인정보 값은 검증 로그와 문서에 기록하지 않았다.

## Legacy 화면 구조

`submissionState.jsp`는 다음 업무 섹션으로 구성된다.

| 섹션 | 주요 항목 |
| --- | --- |
| 회원정보 | 신청서비스, MBID, 회원명, 회원ID, 회사명 |
| 신용정보 입력 | 현 CB 점수, CB 등수, 6개월 CB점수, 채무불이행, 금융질서문란, 공공정보, 연체정보, CB 확인자 |
| 서류 확인 | 사업자정보, 과세유형, 국세/지방세 완납, 건강보험 완납/납부총액, 정산계좌, 주거래계좌 |
| 안내 전화 | 제목, 담당자, 통화내역, 통화일시 |
| 완료 처리 | `sub_complete != Y`일 때 입력완료 |

## React 반영 범위

- `회원정보` 섹션 추가
- `신용정보 입력` 섹션 추가
- `서류 확인` 섹션 추가
- 안내 전화, 파일 업로드/다운로드, 입력완료 mutation은 아직 미구현

## Flag 표시 기준

| 원본 값 | 화면 표시 |
| --- | --- |
| `true`, `1`, `Y` | `Y` |
| `false`, `0`, `N` | `N` |
| null/empty | `-` |
| 기타 값 | 문자열 그대로 |

## 검증 결과

- Backend test: `13 passed`
- Frontend build: 성공, Vite `32 modules transformed`
- 상세 document 필드 존재 확인: 성공
- `sub_complete` 산출 확인: 성공

## 다음 액션

1. 안내 전화 이력 대응 테이블/API 확인
2. 제출서류 파일 업로드/다운로드는 보류하고 read-only 표시 기준 먼저 확정
3. `subComplete`에 해당하는 write API 설계 여부 결정
