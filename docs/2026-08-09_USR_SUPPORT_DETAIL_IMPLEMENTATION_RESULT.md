# U25 게시글 상세 LV 복원 결과

기준일: 2026-08-09

## 작업 범위

- 대상: 서비스 공지, Q&A, FAQ 상세 PC/모바일
- Route/state: `/board/notice/:id`, `/board/qa/:id`, `/board/faq/:id`
- LV 기준: `240130_큐빅아이/view.html`
- Q&A와 FAQ의 별도 상세 원본은 없어 공지 상세의 공통 포맷을 적용
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- LV의 상단 보라색 구분선, 제목, 작성자·등록일, 첨부영역, 본문 제목·내용, 목록 버튼 복원
- 공지·Q&A·FAQ 세 route가 같은 상세 포맷을 공유하도록 공통 React 컴포넌트 적용
- Q&A 답변도 동일 포맷으로 구분해 문의와 답변의 시각적 통일성 확보
- 모바일은 제목과 메타정보를 세로 배치하고 하단 고정 메뉴 안전 여백 적용
- 모바일 고객지원 메뉴는 5개 항목을 고정 위치에 균등 배치하고 활성 메뉴 자동 중앙 이동을 해제
- HTML 태그는 실행하지 않고 제거하되 원문 줄바꿈은 보존

## 기능 보존

- 공지·FAQ 상세 조회 API 유지
- Q&A 사용자 소유권 확인, 답변 표시, 무답변 문의 수정·삭제 조건 유지
- Q&A 수정 PUT payload와 수정 결과 상태 갱신 검증
- 첨부파일 다운로드 API는 현재 미제공이므로 API의 첨부상태 또는 제공된 메타정보만 표시

## 검증

- production build: 통과, 2.02초
- Playwright focused smoke: 4/4 통과, 10.5초
- 모바일 메뉴 위치 focused 재검증: 1/1 통과, 4.5초
- 검증 항목: LV 원본 PC/모바일 렌더링, 공지·FAQ 상세, Q&A 답변, 무답변 문의 수정 PUT, 목록 경로, 세 화면 모바일 overflow
- 공지·Q&A·FAQ 모바일의 활성 위치를 각각 2·3·4번째 메뉴에서 확인하고 전체 5개 메뉴가 360px 화면 안에 표시되는지 검증
- 같은 Docker DB 환경 blocker에 대한 preflight 반복은 생략하고 API mock으로 화면 계약을 검증

## 기준 및 후보 이미지

- 공지 PC LV: `docs/reference/lv-ui/work/USR-NOTICE-DETAIL-PC/reference/lv-reference-rendered.png`
- 공지 PC 후보: `docs/reference/lv-ui/work/USR-NOTICE-DETAIL-PC/candidate/candidate-react.png`
- 공지 Mobile 후보: `docs/reference/lv-ui/work/USR-NOTICE-DETAIL-MOBILE/candidate/candidate-react.png`
- Q&A PC 후보: `docs/reference/lv-ui/work/USR-QA-DETAIL-PC/candidate/candidate-react.png`
- Q&A Mobile 후보: `docs/reference/lv-ui/work/USR-QA-DETAIL-MOBILE/candidate/candidate-react.png`
- FAQ PC 후보: `docs/reference/lv-ui/work/USR-FAQ-DETAIL-PC/candidate/candidate-react.png`
- FAQ Mobile 후보: `docs/reference/lv-ui/work/USR-FAQ-DETAIL-MOBILE/candidate/candidate-react.png`
- LV HTML: `docs/reference/lv-ui/work/USR-NOTICE-DETAIL-PC/source/view.html`

## 진행률

- U25 화면 복원율: 100% (PC/모바일 사용자 승인 완료)
- U25 기능 구현율: 85%
- 사용자 화면 평균 화면 복원율: 99.2%
- 사용자 화면 평균 기능 구현율: 82.9%
- 사용자 화면 시각 승인 완료: 25/26

## 미완료

- 게시글 첨부파일 저장·다운로드 Backend API 설계 및 연동
- Docker PostgreSQL 기동 후 실제 게시글, 문의 수정·삭제와 답변 데이터 재검증
- 전체 사용자 회귀검증과 Git/운영 배포는 사용자 화면 전체 완료 후 수행

## 다음 단일 Batch

- U26 404 후보 이미지 사용자 승인
