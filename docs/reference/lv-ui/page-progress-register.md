# LV 페이지별 진행표

기준일: 2026-08-09

- 화면 복원율: 기준 매핑/현재 출력/차이 검토/구현/사용자 승인 각 20점
- 기능 구현율: UI/API/저장/산식/E2E 중 해당 항목 기준
- 기능 구현율은 외부 사업자 연동을 제외한 내부 구현 기준이며 외부 연동은 `2026-08-09_USER_FULL_REGRESSION_AND_EXTERNAL_INTEGRATION.md`에서 별도 관리한다.
- 화면 승인 100%와 기능 구현 100%를 각각 충족해야 해당 화면을 완료 처리한다.

## 사용자 LV 직접 페이지 26개

| ID | LV 화면 | 주요 React route/state | Reference | 화면 복원율 | 기능 구현율 | 다음 확인 |
|---|---|---|---|---:|---:|---|
| U01 | 사용자 메인(로그인 후) | `/`, `/main` authenticated | `pc_index_login.png`+`index-login.html`+`approved-react.png` | 100% | 80% | 화면 승인 완료/운영 DB 집계 검증 |
| U02 | 비로그인 메인 | `/`, `/main` public | `pc_index.png`+모바일 로그아웃 캡처+`index.html`+`approved-react.png` | 100% | 80% | 화면 승인 완료/운영 연동 검증 |
| U03 | 로그인 | `/login` | PC 캡처+HTML+PC/모바일 승인 이미지 | 100% | 80% | 화면 승인 완료/실 API 재검증 |
| U04 | 회원가입 약관 | `/mainSignUp` step1 | 최종 HTML+PC/모바일 승인 이미지 | 100% | 90% | DB 가입 흐름 회귀 완료 |
| U05 | 회원가입 기본정보 | `/mainSignUp` step2 | 최종 HTML+PC/모바일 승인 이미지 | 100% | 90% | DB 저장 완료/외부 인증은 ADD-EXT-01~04 |
| U06 | 회원가입 완료 | `/mainSignUp` step3 | 최종 HTML+PC/모바일 승인 이미지 | 100% | 95% | 실 DB 가입 완료 회귀 완료 |
| U07 | 통합정보 당월현황 | `/cubici/integratedInfo/tab1` | PC/모바일 캡처+HTML+승인 이미지 | 100% | 90% | 실 DB 월 집계 회귀 완료/legacy 산식 대조 잔여 |
| U08 | 통합정보 매출분석 | `/cubici/integratedInfo/tab2` | PC 캡처+HTML+PC/모바일 승인 이미지 | 100% | 80% | 실 API 차트 표시 회귀 완료/운영 산식 대조 잔여 |
| U09 | 통합정보 상품분석 | `/cubici/integratedInfo/tab3` | PC 캡처+HTML+PC/모바일 승인 이미지 | 100% | 80% | 실 API 차트 표시 회귀 완료/운영 산식 대조 잔여 |
| U10 | 판매현황 | `/cubici/salesInfo/sales` | PC 캡처+HTML+PC/모바일 승인 이미지 | 100% | 95% | 실 DB 필터·페이지·상세·내보내기 회귀 완료 |
| U11 | 반품/교환 | `/cubici/salesInfo/return` | PC 캡처+HTML+PC/모바일 승인 이미지 | 100% | 90% | 실 DB 상세 회귀 완료/API 미제공 열 잔여 |
| U12 | 정산캘린더 | `/cubici/calculateInfo/calendar` | `c3p1.html`+PC/모바일 승인 이미지 | 100% | 90% | 실 DB 월 이동·금액 회귀 완료/100건 초과 집계 잔여 |
| U13 | 정산상세 | `/cubici/calculateInfo/details` | PC 캡처+`c3p2.html`+PC/모바일 승인 이미지 | 100% | 85% | 실 DB 상세 회귀 완료/API 미제공 주문 필드 잔여 |
| U14 | 머니뱅크 서비스소개 | `/moneybank/intro/*` | PC 캡처+`c4p1.html`+3상태 PC/모바일 승인 이미지 | 100% | 90% | 화면 승인 완료/신용대출은 의도된 준비 중 상태 |
| U15 | 머니뱅크 서비스신청 | `/moneybank/*/request` | `c4p2_1.html`+2상품 PC/모바일 승인 이미지 | 100% | 95% | 신청·문서 DB lifecycle 완료/본인확인은 ADD-EXT-04 |
| U16 | 머니뱅크 검토·심사 | `/moneybank/*/evaluate` | `c4p2_2.html`+2상품 PC/모바일 승인 이미지 | 100% | 95% | 조건동의·전자서명 mock DB lifecycle 완료 |
| U17 | 머니뱅크 서비스현황 | `/moneybank/current` | `c4p3.html`+PC/모바일 승인 이미지 | 100% | 90% | 약관·해지·상환 회귀 완료/legacy 산식 검산 잔여 |
| U18 | 서비스공지 목록 | `/board/notice/index` | PC 캡처+`c5p2.html`+PC/모바일 승인 이미지 | 100% | 95% | 실 DB 등록·목록·상세 회귀 완료 |
| U19 | Q&A 목록 | `/board/qa/index` | PC 캡처+`c5p3.html`+PC/모바일 승인 이미지 | 100% | 85% | 화면 승인 완료/운영 데이터 목록·답변상태 회귀검증 |
| U20 | FAQ | `/board/faq/index` | PC 캡처+`c5p4.html`+PC/모바일 승인 이미지 | 100% | 95% | 실 DB 목록·인라인 상세·텍스트 보안 회귀 완료 |
| U21 | Q&A 작성 | `/board/qa/write` | `QnA-write.html`+PC/모바일 원본 렌더링+승인 이미지 | 100% | 90% | 화면 승인 완료/실 DB 등록·상세 이동 재검증 |
| U22 | 마이페이지 가입정보 | `/cubici/mypage/profile`, `companyInfo` | `01_sub_16가입정보.jpg`+`c6p1.html`+PC/모바일 원본 렌더링+승인 이미지 | 100% | 95% | 실 DB 수정 회귀 완료/SMS·주소는 ADD-EXT-01·03 |
| U23 | 쇼핑몰/API 정보 | `/cubici/mypage/businessInfo`, `myAuth` | `c6p1.html`+PC/모바일 원본 렌더링+승인 이미지 | 100% | 95% | 내부 CRUD 완료/쇼핑몰 실연동은 ADD-EXT-05 |
| U24 | 요금/머니뱅크 상세 | `/cubici/mypage/myCharge`, `/moneybank/current/:mbid` | `c6p2.html`+`c4p3.html`+PC/모바일 원본 렌더링+승인 이미지 | 100% | 85% | 계약 상세 회귀 완료/사용자 결제이력 API 잔여 |
| U25 | 게시글 상세 | `/board/*/:id` | `view.html`+공지/Q&A/FAQ PC/모바일 원본 렌더링+승인 이미지 | 100% | 90% | 공지·FAQ 상세 완료/첨부·Q&A 수정·답변 잔여 |
| U26 | 404 | fallback route | `notfound.html`+PC/모바일 원본 렌더링+승인 이미지 | 100% | 100% | 화면 승인 완료 |

### 사용자 공통 UI 4개

| ID | 공통 UI | Reference | 화면 복원율 | 기능 구현율 | 상태 |
|---|---|---|---:|---:|---|
| UC01 | PC/모바일 Header | 승인 페이지 캡처+`header.html`+상태별 승인 이미지 | 100% | 95% | 화면 승인 완료/운영 인증 회귀 |
| UC02 | Footer | 사용자 승인 캡처+`footer.html`+승인 이미지 | 100% | 100% | PC 17개·모바일 6개 경로 회귀 완료 |
| UC03 | Mobile GNB/Menu | 모바일 캡처+HTML+상태별 승인 이미지 | 100% | 95% | 화면 승인 완료/운영 인증 회귀 |
| UC04 | Modal | `modal_view.html`+활성 3종+승인 이미지 | 100% | 90% | 화면 승인 완료/업무 기능 잔여 별도 관리 |

## 관리자 직접 메뉴 24개

관리자 캡처 11장과 route를 배치별로 매핑하고 있다. 관리자 직접 메뉴 24개는 PC/mobile 후보 검증과 사용자 승인을 완료했다. 운영 DB/API 읽기 회귀도 직접 메뉴 24/24에서 통과했다.

| ID | 메뉴/화면 | Route | 화면 복원율 | 기능 구현율 | 주요 잔여 |
|---|---|---|---:|---:|---|
| A01 | 통합정보/큐빅아이 | `/admin/cubici/infoIntegrated/cubici_tab1` | 86% | 75% | 승인 완료, 운영 DB 조회 통과/chart 산식 |
| A02 | 통합정보/머니뱅크 | `/admin/cubici/infoIntegrated/moneybank_tab1` | 86% | 75% | 승인 완료, 운영 DB 조회 통과/잔액 산식 |
| A03 | 회원관리/회원현황 | `/admin/cubici/manageMember/member_tab1` | 92% | 78% | 승인 완료, 운영 DB 조회 통과/회원 집계 검산 |
| A04 | 회원관리/결제관리 | `/admin/cubici/manageMember/payment_tab1` | 82% | 75% | 승인 완료, 결제 원천/취소 검증 |
| A05 | 머니뱅크 관리/통합 현황 | `/admin/moneybank/cubici/management/info_tab1` | 92% | 80% | 승인 완료, 운영 DB 조회 통과/잔액 산식 |
| A06 | 머니뱅크 관리/이용상세 | `/admin/moneybank/management/usageList` | 84% | 72% | 승인 완료, 상세 route 조회 통과/Excel 검증 |
| A07 | 신청 접수 | `/admin/moneybank/request` | 86% | 80% | 승인 완료, 계약 신청 DB lifecycle 통과 |
| A08 | 심사 승인 | `/admin/moneybank/approval_tab1` | 88% | 78% | 승인 완료, 상태정책 test 통과/수수료 검산 |
| A09 | 계약 관리 | `/admin/moneybank/approval_tab2` | 90% | 82% | 승인 완료, 계약 lifecycle DB E2E 통과 |
| A10 | 정산 관리 | `/admin/moneybank/settlement` | 84% | 78% | 승인 완료, 정산 산식 test 통과/28건 차이 검산 |
| A11 | 상환 관리 | `/admin/moneybank/redemption` | 88% | 85% | 승인 완료, 지급/상환/취소 DB E2E 통과 |
| A12 | 프리즘 지표 관리 | `/admin/moneybank/manage` | 80% | 70% | 승인 완료, legacy 산식 매트릭스/Alt_CSM 재계산 |
| A13 | 고객문의 | `/admin/cubici/supportMember/manageInquiry` | 84% | 82% | 승인 완료, API CRUD contract 통과/알림 연동 |
| A14 | 문자/이메일 | `/admin/cubici/supportMember/manageSms` | 84% | 75% | 승인 완료, API CRUD contract 통과/실제 외부 발송 제외 |
| A15 | 고객 공지 관리 | `/admin/cubici/supportMember/manageBoard_tab1` | 92% | 78% | 승인 완료, API CRUD contract 통과/첨부·노출정책 |
| A16 | Error Log | `/admin/cubici/adminMonitor/error_report` | 100% | 70% | 화면 승인 완료, 운영 로그 DB 0건 확인 |
| A17 | 서버 관리 | `/admin/cubici/adminMonitor/server_monitor` | 100% | 60% | 화면 승인 완료, 외부 OS metric 잔여 |
| A18 | 펌뱅킹 전문 | `/admin/cubici/adminMonitor/fintech_trade` | 100% | 68% | 화면 승인 완료, 실송금 제외/DB MOCK E2E |
| A19 | 관리자 등록 | `/admin/cubici/adminPreference/adminRegister_tab1` | 100% | 80% | 화면 승인 완료, 승인·수정·해지 DB E2E 통과 |
| A20 | 요금제 관리 | `/admin/cubici/adminPreference/manageCharge` | 100% | 65% | 화면 승인 완료, mock CRUD 통과/실 DB·삭제정책 E2E |
| A21 | 연계코드 관리 | `/admin/cubici/adminPreference/managePromotion` | 100% | 65% | 화면 승인 완료, mock CRUD 통과/실 DB 코드 매핑 E2E |
| A22 | 협력사 관리 | `/admin/cubici/adminPreference/managePartner` | 100% | 65% | 화면 승인 완료, mock CRUD 통과/실 DB 주소검증 E2E |
| A23 | 머니뱅크 관리 설정 | `/admin/cubici/adminPreference/manageMoneybank_tab1` | 100% | 80% | 화면 승인 완료, 상품 create/update/list DB E2E 통과 |
| A24 | Prism System | `/admin/cubici/adminPreference/prizmConfig` | 100% | 65% | 화면 승인 완료, mock update 통과/RawData·Excel 검증 |

## 관리자 상세/파생 화면

- 직접 메뉴 외 회원 tab2/tab3/userstatus, 결제 tab2, 이용상세 detail, 게시판 FAQ, 이메일, 머니뱅크 설정 tab2, Prism RawData 등을 포함해 현재 React route 기준 33개다.
- 상세/파생 9/9는 운영 DB/API 조회를 통과했다. 이메일 파생 route의 상단 제목 alias는 로컬 후보에서 보완했으며 운영 배포 전이다.
- M4에서 직접 메뉴 진행표와 별도로 상세/파생 화면 진행표를 확정한다.
- legacy 후보 JSP 61개와의 대응 여부도 M4에서 각 화면에 기록한다.

## 현재 전체 기준

- 사용자 화면 시각 승인 완료: 26/26
- 사용자 화면 평균 화면 복원율: 100%
- 사용자 화면 평균 내부 기능 구현율: 89.8%
- 외부 연동 7개 항목은 추가개발 목록으로 분리했으며 위 구현율에서 제외한다.
- 관리자 직접 메뉴 시각 승인 완료: 24/24
- 관리자 직접 메뉴 후보 검증 완료: 24/24
- 관리자 운영 데이터 조회: 직접 메뉴 24/24, 상세/파생 9/9 통과
- 관리자 route·제목·데이터 완전 정상: 32/33
- 관리자 로컬 배포 후보 route·제목·데이터 완전 정상: 33/33
- 관리자 직접 메뉴 평균 내부 기능 구현율: 74.2%
- 기능 구현율은 사용자 페이지 M1, 관리자 페이지 M4 감사 후 확정값으로 갱신한다.
- 현재 수치는 기존 문서와 테스트 파일을 근거로 한 초기 추정치이며 운영 완료율이 아니다.
