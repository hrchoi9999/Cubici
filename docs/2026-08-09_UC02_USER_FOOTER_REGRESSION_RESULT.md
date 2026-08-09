# UC02 사용자 공통 Footer 회귀 결과

기준일: 2026-08-09

## 작업 범위

- PC 17개 상태·경로: 공개·인증 메인, 로그인, 회원가입, 통합정보, 매출, 정산, 머니뱅크, 고객지원, 마이페이지, 상세, 404
- 모바일 6개 대표 경로: Footer 숨김과 하단 GNB 대체 표시
- 기준: 사용자 승인 Footer 이미지와 `240130_큐빅아이/footer.html`
- Backend, DB schema, API contract 변경 없음

## 유지한 승인 디자인

- 배경색 `#002e6e`, 상하 padding `32px`, 좌측 정렬과 세로 구분선 유지
- `AI 기반의 공급망 금융 서비스 큐빅아이` 문구와 승인된 회사정보 5개 항목 유지
- Footer 로고, 서비스 소개, 통신판매업 신고번호, Copyright는 표시하지 않음
- 모바일에서는 PC Footer를 숨기고 고정 하단 GNB를 표시

## 검증

- production build: 통과, 2.65초
- Playwright focused regression: 2/2 통과, 9.6초
- PC 17개 상태·경로에서 색상, 높이, 정렬, 문구, 회사정보, 삭제 항목, 가로 overflow 검증
- 모바일 6개 경로에서 Footer 숨김, 하단 GNB 표시, 가로 overflow 검증

## 승인 이미지

- `docs/reference/lv-ui/work/USR-COMMON-FOOTER-PC/approved/approved-react.png`

## 진행률

- UC02 화면 복원율: 100%
- UC02 기능 구현율: 100%
- 사용자 직접 화면 승인: 26/26
- 공통 UI 완료: 2/4

## 다음 단일 Batch

- UC03 Mobile GNB/Menu 최종 검증 및 승인 후보 작성
