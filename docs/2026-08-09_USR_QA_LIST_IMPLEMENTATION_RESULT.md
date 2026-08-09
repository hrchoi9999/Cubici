# U19 Q&A 목록 LV 복원 결과

기준일: 2026-08-09

## 작업 범위

- 대상: 고객지원 Q&A 목록 PC/모바일
- Route: `/board/qa/index`
- LV 기준: `01_sub_13QnA.jpg`, `240130_큐빅아이/c5p3.html`
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- 고객지원 비주얼과 5개 탭, Q&A 활성 상태 복원
- LV의 글쓰기 버튼, 검색 입력, `NO.·구분·작성자·제목·등록일·답변상태` 6열 목록 복원
- 기준 캡처와 같은 빈 목록 상태를 PC 승인 이미지로 확정
- 현재 목록 위의 요약 카드와 목록 내부 문의등록 폼 제거
- 모바일에서는 빈 상태와 데이터 행을 카드형으로 재배치하고 하단 메뉴 안전 여백 적용

## 기능 보존·보강

- 기존 사용자별 `GET /v1/api/support/inquiries` 조회 유지
- 제목, 구분, 작성자, 답변상태 대상 검색 구현
- 10건 단위 페이지 이동, 답변완료/대기 표시, 상세 route 연결 구현
- 기존 문의등록 기능은 `/board/qa/write` 상태로 분리해 보존
- Q&A 목록과 작성 화면을 구체적인 route 단위로 구분

## 검증

- production build: 통과
- Playwright focused E2E: 3/3 통과
- 검증 항목: 5개 탭, 6열 표, 빈 상태, 검색, 12건 페이지 이동, 답변상태, 상세 링크, 글쓰기 route, 모바일 overflow
- PC/모바일 페이지 전체 가로 overflow 없음
- preview 서버 종료 확인

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-QA-LIST-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-QA-LIST-MOBILE/approved/approved-react.png`
- LV 캡처: `docs/reference/lv-ui/work/USR-QA-LIST-PC/reference/lv-reference.jpg`
- LV HTML: `docs/reference/lv-ui/work/USR-QA-LIST-PC/source/c5p3.html`

## 진행률

- U19 화면 복원율: 100% (PC/모바일 사용자 승인 완료)
- U19 기능 구현율: 85%
- 사용자 화면 평균 화면 복원율: 84.6% (U20 후보 반영)
- 사용자 화면 평균 기능 구현율: 79.4% (U20 focused 검증 반영)
- 사용자 화면 시각 승인 완료: 19/26

## 미완료

- 운영 DB에서 사용자별 비공개 문의 격리, 답변상태, 상세 이동 회귀검증
- 현재 API는 최대 30건 조회 후 클라이언트 페이지네이션하므로 30건 초과 시 서버 페이지네이션 확장 필요
- Q&A 작성 화면의 LV 복원은 U21에서 수행
- 전체 사용자 회귀검증과 운영 배포는 사용자 화면 전체 완료 후 수행

## 다음 단일 Batch

- U20 FAQ 후보 이미지 사용자 승인
- 승인 후 U21 Q&A 작성 화면 복원
