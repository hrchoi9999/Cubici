# U21 Q&A 작성 LV 복원 결과

기준일: 2026-08-09

## 작업 범위

- 대상: 고객지원 Q&A 작성 PC/모바일
- Route: `/board/qa/write`
- LV 기준: `240130_큐빅아이/QnA-write.html`, 원본 HTML PC/모바일 직접 렌더링
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- 고객지원 비주얼과 5개 탭, Q&A 활성 상태 복원
- LV의 작성자·구분·제목·내용 4개 입력 행과 상·하단 경계선 복원
- LV의 회색 등록 버튼과 파란 취소 버튼 배치 복원
- 현재 React의 별도 문의등록 패널 제목과 공개 여부 필드 제거
- 작성자는 로그인 사용자 이름을 읽기 전용으로 표시
- LV 원본의 9개 문의 구분 선택지 복원
- 모바일 입력 비율, 300px 내용 입력 영역, 하단 GNB 안전 여백 적용

## 기능 보존·보강

- 기존 `POST /v1/api/support/inquiries` 계약 유지
- 공개 여부는 화면에서 제거하되 기존 기본값 `private`로 API에 전달
- 제목 50자, 내용 20,000자 제한과 필수 입력 적용
- 제목·내용 앞뒤 공백 제거 후 등록
- 등록 성공 시 `/board/qa/:qnaId` 상세 route 이동 유지
- 등록 실패 시 현재 작성 화면 유지와 재시도 상태 복구
- 취소 시 `/board/qa/index` 이동
- 작성 화면에서는 불필요한 Q&A 목록 조회를 수행하지 않도록 분리

## 검증

- production build: 통과
- DB preflight: 실패 (`127.0.0.1:55432` 미기동)
- LV 원본 렌더링+API mock Playwright focused E2E: 4/4 통과
- 검증 항목: LV 원본 PC/모바일 구조, Q&A 활성 탭, 4개 입력 행, 9개 구분, 길이 제한, 비공개 payload, 등록 성공·상세 이동, 실패 후 재시도, 모바일 overflow
- PC/모바일 페이지 전체 가로 overflow 없음
- React preview와 LV 원본 정적 서버 종료 확인

## 기준 및 승인 이미지

- PC LV 렌더링: `docs/reference/lv-ui/work/USR-QA-WRITE-PC/reference/lv-reference-rendered.png`
- PC React 승인본: `docs/reference/lv-ui/work/USR-QA-WRITE-PC/approved/approved-react.png`
- Mobile LV 렌더링: `docs/reference/lv-ui/work/USR-QA-WRITE-MOBILE/reference/lv-reference-rendered.png`
- Mobile React 승인본: `docs/reference/lv-ui/work/USR-QA-WRITE-MOBILE/approved/approved-react.png`
- LV HTML: `docs/reference/lv-ui/work/USR-QA-WRITE-PC/source/QnA-write.html`

## 진행률

- U21 화면 복원율: 100% (사용자 승인 완료)
- U21 기능 구현율: 90%
- 사용자 화면 평균 화면 복원율: 90.0%
- 사용자 화면 평균 기능 구현율: 81.0%
- 사용자 화면 시각 승인 완료: 21/26

## 미완료

- Docker PostgreSQL 기동 후 실제 Q&A 등록·상세 조회·삭제 cleanup 재검증
- 전체 사용자 회귀검증과 운영 배포는 사용자 화면 전체 완료 후 수행

## 다음 단일 Batch

- U22 마이페이지 가입정보 후보 이미지 사용자 승인
