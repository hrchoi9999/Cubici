# Cubici 관리자 ADM-LV-14 고객 공지 관리 복원

## 작업 범위

- 화면: `고객관리 > 고객 공지 관리`
- 서비스 공지 route: `/admin/cubici/supportMember/manageBoard_tab1`
- FAQ route: `/admin/cubici/supportMember/manageBoard_tab2`
- legacy 목록: `manageBoard_tab1.jsp`, `manageBoard_tab2.jsp`
- legacy 편집: `manageBoard_tab1_Write.jsp`, `manageBoard_tab2_Write.jsp`, `manageBoard_tab2_Detail.jsp`
- 시각 기준: `docs/reference/lv-ui/admin/reference/관리자화면08.png`

`관리자화면08.png`가 서비스 공지 목록의 직접 LV 기준이다. FAQ와 편집 화면은 같은 탭·표·폼 계열의 legacy JSP를 함께 적용했다.

## LV 대조와 적용

- `서비스 공지/FAQ` 2개 탭을 동일 폭으로 복원했다.
- 초기 화면의 migration 기술 배지와 노출·첨부 상태 요약을 제거했다.
- 서비스 공지는 legacy의 `No/제목/등록일/공지사항` 4열 목록을 적용했다.
- FAQ는 legacy의 `No/제목/답변` 3열 목록을 적용했다.
- 글쓰기와 우측 단일 키워드 검색, 남색 번호 및 회색 이전·다음 페이지 버튼을 적용했다.
- 목록과 편집 폼은 한 화면에 중첩하지 않고 전환되도록 정리했다.
- 편집 폼은 작성자, 구분, 제목, 내용 순서와 등록·수정·삭제·목록 기능을 유지했다.
- 모바일은 좌측 메뉴 기본 닫힘, 표 내부 가로 스크롤, 단일 열 편집 폼을 사용한다.

## DB/API 대조

- 개발 Docker DB: `notice` 5건, `faq` 31건
- 목록: `GET /v1/api/support/boards/{notice|faq}`
- 상세: `GET /v1/api/support/boards/{notice|faq}/{post_id}`
- 등록, 수정, 삭제 API와 React 동작을 유지했다.
- 공지 첨부파일은 현재 PostgreSQL/API 계약에 없어 잔여 기능으로 분리했다.

## 변경 파일

- `admin-web/src/pages/CustomerBoardPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/customer-board-management.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| support board API contract pytest | 2 passed |
| 공지·FAQ 목록·편집·삭제 focused E2E | 2 passed |
| 개발 Docker DB 읽기 전용 대조 | 공지 5 / FAQ 31 |
| PC/모바일 후보 생성 | 8장 |
| 모바일 body 가로 overflow | 없음 |
| 모바일 표 내부 가로 스크롤 | 통과 |
| 실제 개발 DB write E2E | 이번 배치 미수행, 기존 cleanup 검증 기록 존재 |
| 공지 첨부파일 | 미구현 |
| 운영 배포 | 미수행 |

## 승인 이미지

- 공지 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-NOTICE-LIST-PC.png`
- 공지 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-NOTICE-LIST-MOBILE.png`
- 공지 편집 PC: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-NOTICE-EDITOR-PC.png`
- 공지 편집 모바일: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-NOTICE-EDITOR-MOBILE.png`
- FAQ 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-FAQ-LIST-PC.png`
- FAQ 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-FAQ-LIST-MOBILE.png`
- FAQ 편집 PC: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-FAQ-EDITOR-PC.png`
- FAQ 편집 모바일: `docs/reference/lv-ui/admin/ADM-LV-14-CUSTOMER-BOARD/approved/ADM-LV-14-FAQ-EDITOR-MOBILE.png`

## 후보 SHA256

- 공지 목록 PC: `41469F7EE9D103169ED7EF7F806B4D5839C1DFA534CD77E398406BECC027264A`
- 공지 목록 모바일: `D5EEB1352DA4F3535763A40F7EF69C6EC7DDF7D2B8E3A63B837BC6A25C902C49`
- 공지 편집 PC: `03824749B7761B59636D23EB4028D6FFC00B740FDD67CC1C7F5B7FECBEBC1A93`
- 공지 편집 모바일: `45B1A3A8383A423614F9FDAE6BE6081FD8A48616BF2CEB2AD3B2F3660A537016`
- FAQ 목록 PC: `A0DC8174E8D1F278472CC494867FAE624ED32F96A42E89E77F22CB624E2A96D8`
- FAQ 목록 모바일: `583C7B9F15B25C92D62AA3421CE48F15CE697EF684F64A59634460F1A1D1B7A0`
- FAQ 편집 PC: `7C2382806B2FBCB98AEDC52B44C42CAFFCD8CA29128B5F7234CF8BEF087FAC27`
- FAQ 편집 모바일: `9E917EABFEB81F71A9663F365B81B4F125D8C2A72CFD9EC3FE0233091A585106`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 86%
- 공지 첨부파일, SmartEditor 수준 HTML 편집, legacy 구분 코드명 1:1 검산이 남았다.
- 다음 승인 단위: `ADM-LV-15 모니터링 > Error Log`
