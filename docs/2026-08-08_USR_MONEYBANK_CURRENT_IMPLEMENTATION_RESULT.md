# U17 머니뱅크 서비스현황 LV 복원 결과

기준일: 2026-08-08

## 작업 범위

- 대상: 머니뱅크 서비스현황 PC/모바일
- Route: `/moneybank/current`
- LV 기준: `240130_큐빅아이/c4p3.html`
- 직접 화면 캡처가 없어 최종 HTML/CSS를 1차 시각 기준으로 사용
- Backend, DB schema, API contract 변경 없음

## 화면 복원

- LV 머니뱅크 비주얼, 서비스 현황 탭 활성 상태 유지
- `이용조건 -> 지급현황 -> 상환현황` 섹션 순서 복원
- 수수료율, 지급율, 한도, 계좌, 계약기간, 누적 지급·상환·수수료 조건표 구현
- 신청 쇼핑몰 로고, 계약 상세 이동, 지급·상환 검색 조건과 표 구현
- PC 3열 조건표, 태블릿 2열, 모바일 1열 반응형 적용
- 모바일 지급·상환 표는 페이지 전체가 아닌 표 영역만 가로 스크롤 적용
- 계약 완료 상태에서 중복되던 이용조건 확인 패널 제거

## 기능 보존·보강

- 기존 계약 목록과 계약 상세 API 조회 유지
- 정산 목록을 지급현황으로, 상환 집계 목록을 상환현황으로 연결
- 지급 쇼핑몰/기간 필터와 상환 기간 필터를 화면 내 즉시 적용
- 인증서/계약 관리 및 계약별 상세 route 이동 유지
- 조건 제시 상태의 이용조건 동의 기능과 서류 보완 업로드 기능 유지

## 검증

- production build: 통과
- Playwright focused E2E: 2/2 통과
- 검증 항목: LV 섹션 순서, 조건 15항목, 쇼핑몰 3개 로고, 지급 3건, 상환 2건, 쇼핑몰·기간 필터, 상세 route, PC/모바일 overflow
- PC/모바일 페이지 전체 가로 overflow 없음
- 모바일 상환 표 독립 가로 스크롤 확인
- preview 서버 종료 확인

## 승인 이미지

- PC: `docs/reference/lv-ui/work/USR-MONEYBANK-CURRENT-PC/approved/approved-react.png`
- Mobile: `docs/reference/lv-ui/work/USR-MONEYBANK-CURRENT-MOBILE/approved/approved-react.png`
- LV 기준 보관: `docs/reference/lv-ui/work/USR-MONEYBANK-CURRENT-PC/source/c4p3.html`

## 진행률

- U17 화면 복원율: 100% (사용자 승인 완료)
- U17 기능 구현율: 85%
- 사용자 화면 평균 화면 복원율: 80.0% (U18 후보 반영)
- 사용자 화면 평균 기능 구현율: 78.5% (U18 focused 검증 반영)
- 사용자 화면 시각 승인 완료: 17/26

## 미완료

- 운영 DB의 개별 지급·상환 이력과 legacy 산식 대조
- 현재 상환 API는 개별 거래가 아닌 계약별 집계이므로 개별 상환 원장 API 확정 필요
- 전체 사용자 회귀검증과 운영 배포는 사용자 화면 전체 완료 후 수행

## 다음 단일 Batch

- U18 서비스공지 목록 후보 이미지 사용자 승인
- 승인 후 U19 Q&A 목록 화면 복원
