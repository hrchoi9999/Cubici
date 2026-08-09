# 화면 단위 커뮤니케이션 기준

## 기본 원칙

- `메인화면`은 사용자 로그인 후 PC 메인을 의미한다.
- 기준 파일은 `user/source-render/pc_index_login.png`다.
- 로그인 전 화면은 `비로그인 메인`으로 부른다.
- 사용자/관리자, 로그인 상태, viewport가 다르면 별도 화면으로 구분한다.
- 작업 요청과 완료 보고에는 화면 ID, route, 기준 파일, 구현 파일, 기능 범위를 함께 표시한다.

## 사용자 메인 화면 정의

| 항목 | 값 |
|---|---|
| 화면 ID | `USR-MAIN-AUTH-PC` |
| 화면명 | 사용자 메인(로그인 후/PC) |
| Route | `/`, `/main` authenticated state |
| 기준 이미지 | `docs/reference/lv-ui/user/source-render/pc_index_login.png` |
| 기준 HTML | `240130_큐빅아이/index-login.html` |
| 주요 구현 파일 | `user-web/src/pages/HomePages.jsx` |
| 공통 구현 파일 | `user-web/src/shared/UserCore.jsx` |
| 주요 스타일 | `user-web/src/styles/final-ui-foundation.css` |

## 화면 구성 기준

1. 로그인 상태 PC Header
2. 메인 visual/slider
3. 매출/정산 한눈에 보기
4. 머니뱅크 서비스 이용잔액
5. 총 이용원금/총 상환원금
6. 머니뱅크 이용내역
7. 큐빅아이 주요 서비스 4개 영역
8. Footer

## 기능 범위

- 로그인 상태에 따른 Header와 본문 전환
- 매출총액/정산입금 조회와 상세 이동
- 머니뱅크 잔액/원금/상환금/이용내역 조회
- 주요 서비스 route 이동
- PC/태블릿/모바일 반응형 전환

## 보고 형식

```text
화면 ID:
화면명/상태/viewport:
Route:
기준 이미지:
수정 파일:
화면 복원율:
기능 구현율:
검증 결과:
남은 차이:
```
