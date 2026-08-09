# U23 쇼핑몰/API 정보 LV 복원 결과

기준일: 2026-08-09

## 작업 범위

- 대상: 마이페이지 쇼핑몰 등록·정보와 API 인증 요청 PC/모바일
- Route/state: `/cubici/mypage/businessInfo`, `/cubici/mypage/myAuth`, 쇼핑몰 정보의 `연결` 모달
- LV 기준: `240130_큐빅아이/c6p1.html`, 원본 HTML PC/모바일 직접 렌더링
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- LV의 `쇼핑몰 등록` 2개 입력 행과 등록 버튼 복원
- `쇼핑몰 정보`의 운영 쇼핑몰, 쇼핑몰 ID, 선정산 대상, API 연결, 정보수정 5열 표 복원
- 목록 페이지네이션과 하단 취소·수정 확인 버튼 복원
- API 인증 요청의 파란 헤더, 쇼핑몰 연동 버튼, 핵심 인증정보 3개 입력 행, 연동 버튼 복원
- 모바일 목록은 같은 정보를 행 카드로 재배치하고 API 모달 내부 스크롤과 하단 GNB 안전 여백 적용

## 기능 보존·보강

- 기존 `GET/POST /v1/api/accounts/me/shops` 계약 유지
- 기존 `PUT/DELETE /v1/api/accounts/me/shops/{account_id}` 계약 유지
- 쇼핑몰 등록, 기본정보 수정, 활성·비활성, 삭제, API 인증정보 갱신을 LV UI에 연결
- API Key, 비밀번호, API Secret은 읽기 응답에 원문 표시하지 않고 입력 시에만 전송
- Vendor ID, API Secret, 선정산 설정, 연결 상태는 접을 수 있는 추가 연동정보에 유지
- 선정산 대상 표시는 현재 API의 `settlement` 값 존재 여부를 사용하므로 legacy 산식 검산은 별도 필요

## 검증

- production build: 통과
- DB preflight: 10초 이내 응답 없음으로 환경 blocker 분류 (`127.0.0.1:55432`)
- LV 원본 렌더링+API mock Playwright focused E2E: 4/4 통과
- 검증 항목: LV 등록·목록·API 모달, 조회·등록·수정·상태변경·삭제, 인증정보 PUT payload, `/myAuth` 직접 진입, PC/모바일 overflow
- PC/모바일 페이지 전체 가로 overflow 없음

## 기준 및 후보 이미지

- 쇼핑몰 PC LV 렌더링: `docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-PC/reference/lv-reference-rendered.png`
- 쇼핑몰 PC React 승인본: `docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-PC/approved/approved-react.png`
- 쇼핑몰 Mobile LV 렌더링: `docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-MOBILE/reference/lv-reference-rendered.png`
- 쇼핑몰 Mobile React 승인본: `docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-MOBILE/approved/approved-react.png`
- API modal PC LV 렌더링: `docs/reference/lv-ui/work/USR-MYPAGE-API-PC/reference/lv-reference-rendered.png`
- API modal PC React 승인본: `docs/reference/lv-ui/work/USR-MYPAGE-API-PC/approved/approved-react.png`
- API modal Mobile React 승인본: `docs/reference/lv-ui/work/USR-MYPAGE-API-MOBILE/approved/approved-react.png`
- LV HTML: `docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-PC/source/c6p1.html`

## 진행률

- U23 화면 복원율: 100% (사용자 승인 완료)
- U23 기능 구현율: 90%
- 사용자 화면 평균 화면 복원율: 93.1% (U23 승인 시점)
- 사용자 화면 평균 기능 구현율: 81.7%
- 사용자 화면 시각 승인 완료: 23/26

## 미완료

- Docker PostgreSQL 기동 후 실제 쇼핑몰 계정 CRUD 재검증
- 외부 쇼핑몰 API 인증 성공과 실제 데이터 수집 lifecycle 검증
- `settlement`와 legacy 선정산 대상 산식의 의미 검산
- 전체 사용자 회귀검증과 운영 배포는 사용자 화면 전체 완료 후 수행

## 승인 상태

- U23 PC/모바일 쇼핑몰 및 API 모달 이미지 사용자 승인 완료
