# U18 서비스공지 목록 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: 고객지원 서비스공지 목록 PC/모바일
- Route: `/board/notice/index`
- LV 기준: `01_sub_12서비스공지.jpg`, `240130_큐빅아이/c5p2.html`
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- 고객지원 비주얼과 `요금안내·서비스 공지·Q&A·FAQ·블로그` 5개 탭 복원
- 서비스 공지 탭 활성 상태와 LV 검색 입력창 복원
- LV의 `NO.·구분·제목·등록일·공지사항` 5열 목록 및 공지보기 버튼 복원
- 현재 화면에 추가됐던 요약 카드, 공지 분류 패널, 작성자 열, 본문 미리보기 제거
- 5건 단위 페이지네이션 복원
- 모바일에서는 표를 카드형 행으로 재배치하고 고정 하단 메뉴와 페이지네이션 겹침 해소

## 기능 보존·보강

- 기존 `GET /v1/api/support/boards/notice` 조회 유지
- 제목, 구분, 본문 대상 클라이언트 검색 구현
- 5건 초과 공지의 페이지 이동 구현
- 제목과 공지보기 버튼 모두 기존 상세 route `/board/notice/:postId` 연결
- Q&A와 FAQ 기존 목록·등록·분류 기능에는 U18 전용 구조를 적용하지 않음

## 검증

- production build: 통과
- Playwright focused E2E: 3/3 통과
- 검증 항목: 5개 탭, 5열 표, 5건 기준 출력, 검색, 상세 링크, 7건 페이지 이동, 모바일 행 재배치, PC/모바일 overflow
- PC/모바일 페이지 전체 가로 overflow 없음
- 모바일 페이지네이션과 고정 하단 메뉴 겹침 없음
- preview 서버 종료 확인

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-NOTICE-LIST-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-NOTICE-LIST-MOBILE/approved/approved-react.png`
- LV 캡처: `docs/reference/lv-ui/work/USR-NOTICE-LIST-PC/reference/lv-reference.jpg`
- LV HTML: `docs/reference/lv-ui/work/USR-NOTICE-LIST-PC/source/c5p2.html`

## 진행률

- U18 화면 복원율: 100% (사용자 승인 완료)
- U18 기능 구현율: 85%
- 사용자 화면 평균 화면 복원율: 82.3% (U19 후보 반영)
- 사용자 화면 평균 기능 구현율: 79.0% (U19 focused 검증 반영)
- 사용자 화면 시각 승인 완료: 18/26

## 미완료

- 운영 DB 공지 데이터의 검색 결과 및 상세 이동 회귀검증
- 현재 API는 최대 30건을 한 번에 조회해 클라이언트 페이지네이션하므로 30건 초과 시 서버 페이지네이션 확장 필요
- 블로그 최종 URL이 LV 자료에 없어 현재 비활성 링크 유지
- 전체 사용자 회귀검증과 운영 배포는 사용자 화면 전체 완료 후 수행

## 다음 단일 Batch

- U19 Q&A 목록 후보 이미지 사용자 승인
- 승인 후 U20 FAQ 화면 복원
