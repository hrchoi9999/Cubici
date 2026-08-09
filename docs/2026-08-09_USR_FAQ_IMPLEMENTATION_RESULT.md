# U20 FAQ LV 복원 결과

기준일: 2026-08-09

## 작업 범위

- 대상: 고객지원 FAQ PC/모바일
- Route: `/board/faq/index`
- LV 기준: `01_sub_14FAQ.jpg`, `240130_큐빅아이/c5p4.html`
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- 고객지원 비주얼과 5개 탭, FAQ 활성 상태 복원
- LV의 검색 입력과 `NO.·구분·제목·답변` 4열 목록 복원
- LV 기준 31번부터 22번까지 10개 행의 간격과 파란 보기 버튼 배치 재현
- 기존 요약 카드와 FAQ 구분 필터 폼 제거
- 모바일에서는 활성 FAQ 탭을 초기 화면 중앙에 표시하고, FAQ 행을 카드형으로 재배치하며 하단 GNB 안전 여백 적용

## 기능 보존·보강

- 기존 `GET /v1/api/support/boards/faq` 조회 유지
- 제목, 구분, 답변 내용 대상 검색 구현
- 10건 단위 페이지 이동 구현
- 보기 버튼으로 답변 1개를 펼치거나 닫는 accordion 구현
- API 답변 HTML은 `plainText`로 정리해 안전한 텍스트로 표시

## 검증

- production build: 통과
- 표준 E2E runner DB preflight: 실패 (`127.0.0.1:55432` 미기동)
- API mock 기반 Playwright focused E2E: 3/3 통과
- 검증 항목: 5개 탭, 모바일 활성 탭 노출, 4열 표, 10개 행, 검색, 12건 페이지 이동, accordion 열기·닫기, HTML 문자열 정리, PC/모바일 overflow
- PC/모바일 페이지 전체 가로 overflow 없음
- preview 서버 종료 확인

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-FAQ-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-FAQ-MOBILE/approved/approved-react.png`
- LV 캡처: `docs/reference/lv-ui/work/USR-FAQ-PC/reference/lv-reference.jpg`
- LV HTML: `docs/reference/lv-ui/work/USR-FAQ-PC/source/c5p4.html`

## 진행률

- U20 화면 복원율: 100% (PC/모바일 사용자 승인 완료)
- U20 기능 구현율: 85%
- 사용자 화면 평균 화면 복원율: 87.7% (U21 후보 반영)
- 사용자 화면 평균 기능 구현율: 80.6% (U21 focused 검증 반영)
- 사용자 화면 시각 승인 완료: 20/26

## 미완료

- 운영 DB FAQ 데이터의 구분, 정렬, 답변 내용 회귀검증
- 전체 사용자 회귀검증과 운영 배포는 사용자 화면 전체 완료 후 수행

## 다음 단일 Batch

- U21 Q&A 작성 후보 이미지 사용자 승인
- 승인 후 U22 마이페이지 가입정보 화면 복원
