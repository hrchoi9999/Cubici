# UC03 모바일 GNB/전체 메뉴 회귀 결과

기준일: 2026-08-09

## 작업 범위

- 하단 GNB 6개 항목의 LV 순서, 링크, 활성 위치 및 반응형 배치 검증
- 홈 `/main`과 legacy 통합정보 `/m/cubici/infoIntegrated/*` 활성 경로 보완
- 모바일 전체 메뉴의 6개 그룹, 경로별 활성 그룹, 하위 메뉴 및 블로그 링크 검증
- Backend, DB schema, API contract 변경 없음

## 유지한 LV 디자인

- 홈, 통합정보, 매출정보, 정산정보, 머니뱅크, 고객정보의 6개 순서 유지
- 활성 메뉴는 원래 항목 위치에서만 남색 아이콘 배경으로 표시
- 화면별 승인된 GNB 높이와 아이콘 크기 보정 CSS 유지
- 전체 메뉴의 좌측 6개 그룹과 우측 세부 메뉴 구조 유지
- 활성 그룹 배지는 좌측 110px 메뉴 영역 안에 고정하여 우측 세부 메뉴와 겹치지 않음

## 검증

- production build: 통과, 2.13초
- Playwright focused regression: 3/3 통과, 7.0초
- 전체 메뉴 안정 프레임 재캡처: 1/1 통과, 3.1초
- 360px: 7개 대표 경로 활성 위치, 6개 링크, 가로 overflow 검증
- 768px: 머니뱅크 활성 위치와 6개 항목 배치 검증
- 전체 메뉴: 6개 그룹, 고객지원 5개 링크, 정산정보 2개 링크, 블로그 URL 검증

## 승인 이미지

- `docs/reference/lv-ui/work/USR-COMMON-MOBILE-GNB-HOME/approved/approved-react.png`
- `docs/reference/lv-ui/work/USR-COMMON-MOBILE-GNB-CUSTOMER/approved/approved-react.png`
- `docs/reference/lv-ui/work/USR-COMMON-MOBILE-MENU/approved/approved-react.png`

## 진행률

- UC03 화면 복원율: 100% (사용자 승인 완료)
- UC03 기능 구현율: 95% (운영 인증·데이터 상태 최종 회귀 잔여)
- 사용자 직접 화면 승인: 26/26
- 공통 UI 완료: 3/4

## 다음 단일 Batch

- UC04 Modal 목록화 및 승인 후보 작성
