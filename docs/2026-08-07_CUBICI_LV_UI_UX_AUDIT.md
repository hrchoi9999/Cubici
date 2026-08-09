# Cubici LV UI/UX 적용 현황 점검

점검일: 2026-08-07  
대상: `240130_큐빅아이` 최종버전(LV) 리소스와 현재 React 사용자/관리자 화면

## 1. 점검 기준

- LV 기준: `240130_큐빅아이`의 HTML, `static/css`, `static/img`, 폰트 및 공통 header/footer/mobile GNB 구조
- 현재 사용자단: `user-web/src/App.jsx`, `user-web/src/pages`, `user-web/src/shared/UserCore.jsx`, `user-web/src/styles`
- 현재 관리자단: `admin-web/src/components/layout/AdminLayout.jsx`, `admin-web/src/pages`, `admin-web/src/styles/admin-web.css`
- 판정은 다음 세 단계로 보수적으로 구분했다.
  - **LV 적용**: LV 공통 구조와 스타일 리소스가 직접 적용된 화면
  - **부분 적용/혼합**: LV 리소스 또는 공통 레이아웃은 적용됐지만 React 전용 마크업/API 화면 또는 Rudicks CSS가 함께 사용되는 화면
  - **LV 미적용**: 현재 화면에서 LV 240130 스타일 리소스와 구조를 사용하지 않는 화면

## 2. 핵심 결론

1. 현재 메인 화면의 로그아웃 상태 hero와 `큐빅아이 주요 서비스` 4개 카드 구성은 LV 원본 `index.html`과 일치한다. 4개 카드만 보이는 것이 LV와 다른 것은 아니다.
2. LV 로그인 상태 원본 `index-login.html`에 있는 `매출/정산 한눈에 보기`, `머니뱅크/선정산 이용내역` 대시보드 영역은 현재 React `MainPage`에서 확인되지 않는다. 따라서 메인 화면 전체 기준은 **부분 적용/미완료**다.
3. 사용자단은 `final-ui-foundation.css`로 LV CSS를 불러오지만, 이후 `user-web.css`에서 Rudicks CSS를 다시 불러온다. 화면별 우선순위에 따라 LV와 legacy 스타일이 섞일 수 있으므로 전 페이지가 100% LV라고 판정할 수 없다.
4. 관리자단 `admin-web/src/main.jsx`는 `admin-web.css`만 불러오며 LV 240130 CSS를 불러오지 않는다. 따라서 관리자 24개 논리 메뉴 화면은 LV 미적용으로 판정한다. 관리자 기능이 React로 이식됐는지와 LV 디자인 적용 여부는 별개다.

## 3. 사용자 페이지 판정

| 화면/라우트 | LV 기준 화면 | 판정 | 확인 내용 |
|---|---|---|---|
| `/`, `/main` 로그아웃 상태 | `index.html` | **부분 적용/혼합** | LV hero 4종, 좌우 이동/자동재생/터치, 주요 서비스 4개 카드가 적용됨. |
| `/`, `/main` 로그인 상태 | `index-login.html` | **LV 미완료** | LV 로그인 대시보드 2개 영역이 현재 `MainPage`에서 누락됨. |
| 공통 header/footer/mobile GNB | `header.html`, `footer.html`, `mobile-gnb.html` | **LV 적용** | `/final-ui/static` 이미지·폰트와 공통 shell을 사용함. 최근 footer 문구 수정도 반영된 상태. |
| `/login` | `login.html`, `index-login.html` 로그인 영역 | **LV 적용** | final login 전용 scope와 LV 공통 visual을 사용함. |
| `/mainSignUp` | `회원가입_약관동의.html`, `회원가입_기본정보.html`, `회원가입_가입완료.html` | **부분 적용/혼합** | 3단계 React 흐름과 LV auth 스타일은 적용됐으나 원본 HTML과의 세부 마크업 동일성은 별도 검증 필요. |
| `/idSearch`, `/pwdReset` | LV auth/sub 공통 구조 | **부분 적용/혼합** | LV 공통 visual은 사용하지만 React 전용 폼 구성이다. |
| `/cubici/integratedInfo/tab1-3` | `c1p1.html`, `c1p2.html`, `c1p3.html` | **부분 적용/혼합** | LV visual, 탭, panel scope를 사용한다. API 데이터와 React table 마크업은 별도 구현이다. |
| `/cubici/invento/index` | LV sub/core 구조 | **부분 적용/혼합** | LV 공통 구조를 기반으로 한 재고 전용 React 화면이며, LV 원본과 1:1 대응 HTML은 확인되지 않는다. |
| `/cubici/salesInfo/sales`, `/cubici/salesInfo/return` | `c2p1.html`, `c2p2.html` | **부분 적용/혼합** | LV commerce scope와 공통 layout은 사용하지만 상세 표/데이터 화면은 React 구현이다. |
| `/cubici/calculateInfo/calendar`, `/cubici/calculateInfo/details` | `c3p1.html`, `c3p2.html` | **부분 적용/혼합** | LV 기준 화면군에 매핑되지만 calendar/details 동작과 markup은 React 전용이다. |
| `/moneybank/intro/*` | `c4p1.html`, `c4p2_1.html`, `c4p2_2.html`, `c4p3.html` | **부분 적용/혼합** | LV moneybank scope와 asset을 사용하지만 서비스 화면은 React 구성이다. |
| `/moneybank/request`, `/moneybank/evaluate`, `/moneybank/contract`, `/moneybank/current`, 관련 clause/deposit | LV moneybank 파생 구조 | **부분 적용/혼합** | LV 공통 visual을 사용하나 기능·API·상세 form은 현재 서비스 전용 React 구현이다. |
| `/board/notice/*`, `/board/faq/*`, `/board/qa/*` | `c5p2.html`, `c5p3.html`, `c5p4.html`, `QnA-write.html`, `view.html`, `url.html` | **부분 적용/혼합** | LV support board visual과 공통 panel을 사용하지만 목록/상세/검색은 React/API markup이다. |
| `/chargeInfo*` | LV 고객지원/요금 영역 | **부분 적용/혼합** | LV charge scope를 사용하나 요금 표시 구조는 React 구성이다. |
| `/cubici/mypage/*` | `c6p1.html`, `c6p2.html`, `c6p3.html` | **부분 적용/혼합** | LV mypage scope를 사용하지만 사용자 정보·변경 form은 React/API 구현이다. |
| `/notfound` | `notfound.html` | **LV 적용** | LV notfound scope가 적용돼 있다. |

### 사용자단 요약

- **LV 적용**: 공통 header/footer/mobile GNB, 로그인, notfound
- **부분 적용/혼합**: 메인 로그아웃 상태, 회원가입, ID/PW 도움 화면, 통합정보, 재고, 매출, 정산, 머니뱅크, 고객지원, 요금, 마이페이지
- **LV 미완료 핵심**: 로그인 후 메인 대시보드 콘텐츠
- **LV 미적용으로 단정할 수 있는 사용자 화면**: 현재 소스 기준으로는 별도 없음. 다만 부분 적용/혼합 화면은 pixel-level 동일성을 보장하지 않는다.

## 4. 관리자 페이지 판정

현재 관리자 layout은 Rudicks 기반 `#wrap`, `#header`, `subVisualArea`, `snbArea`, `subBox` 구조와 `admin-web.css`를 사용한다. `final-ui-foundation.css` 또는 LV `static/css`를 관리자단에서 불러오는 구조는 확인되지 않았다.

| 관리자 메뉴군 | 논리 화면 수 | 판정 |
|---|---:|---|
| 통합정보: 큐빅아이, 머니뱅크 | 2 | **LV 미적용** |
| 회원관리: 회원현황, 결제관리 | 2 | **LV 미적용** |
| 머니뱅크 관리: 통합 현황, 이용상세 | 2 | **LV 미적용** |
| 머니뱅크 운영: 신청 접수, 심사 승인, 계약 관리, 정산 관리, 상환 관리, 프리즘 지표 관리 | 6 | **LV 미적용** |
| 고객관리: 고객문의, 문자/이메일, 고객 공지 관리 | 3 | **LV 미적용** |
| 모니터링: Error Log, 서버 관리, 펌뱅킹 전문 | 3 | **LV 미적용** |
| 환경설정: 관리자 등록, 요금제 관리, 연계코드 관리, 협력사 관리, 머니뱅크 관리, Prism System | 6 | **LV 미적용** |
| **합계** | **24** | **LV 미적용** |

관리자단은 화면 기능 이식과 메뉴 구성은 진행되어 있지만, 현재 LV 사용자용 240130 디자인이 적용된 상태는 아니다. LV 기준으로 관리자 화면까지 동일한 UI/UX를 요구한다면 관리자 전용 LV 디자인 리소스 또는 사용자 LV를 관리자 정보 구조에 맞춰 별도로 이식하는 작업이 필요하다.

## 5. 화면 캡처 검증 한계

현재 로컬에서 확인 가능한 `C:\Users\User\Desktop\문서`의 캡처 파일 중 메인 전체 화면용 Cubici LV 캡처는 확인되지 않았다. 확인된 일부 캡처는 footer 비교본 또는 Cubici와 무관한 화면이었다. 따라서 이번 결과는 LV 원본 HTML/CSS/이미지와 현재 React 소스 대조에 기반한 **구조·리소스 감사**다. 모든 페이지의 실제 브라우저 pixel-level 비교는 아직 완료되지 않았다.

## 6. 우선 보완 순서

1. `MainPage`에 LV 로그인 상태의 매출/정산 및 머니뱅크 이용내역 영역을 복원한다.
2. 사용자단에서 Rudicks CSS import와 LV CSS의 충돌 selector를 화면군별로 정리한다.
3. 사용자단 부분 적용 화면을 LV 원본 캡처와 route별로 비교한다.
4. 관리자단을 LV 적용 대상으로 포함할지 결정한 뒤, 포함할 경우 별도 관리자 LV migration 범위를 정의한다.
