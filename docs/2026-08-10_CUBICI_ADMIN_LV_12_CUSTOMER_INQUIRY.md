# Cubici 관리자 ADM-LV-12 고객문의 복원

## 작업 범위

- 화면: `고객관리 > 고객문의`
- route: `/admin/cubici/supportMember/manageInquiry`
- legacy 목록: `src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageInquiry.jsp`
- legacy 상세: `src/main/webapp/WEB-INF/jsp/egovframework/azon/admin/cubici/supportMember/manageInquiry_detail.jsp`
- 시각 보조 기준: `docs/reference/lv-ui/admin/reference/관리자화면08.png`

고객문의 전용 LV 캡처는 없다. 따라서 legacy 고객문의 JSP의 정보 구조와 같은 고객관리 계열 `관리자화면08.png`의 표·검색·페이지 규격을 결합했다.

## LV 대조와 적용

- 초기 화면에서 migration 기술 배지와 요약 strip을 제거했다.
- legacy와 동일한 `No/공개여부/구분/작성자/제목/등록일자/답변일자/답변상태` 8열 목록을 적용했다.
- 검색창은 우측 상단의 단일 키워드 검색으로 정리했다.
- 페이지 번호는 남색 활성 버튼과 동일 높이의 회색 이전·다음 버튼으로 통일했다.
- 제목 선택 시 목록 아래에 상세를 겹쳐 표시하지 않고 상세 화면으로 전환한다.
- 상세 제목, 작성자, 회원번호, 구분, 공개여부, 작성일, 문의 내용과 답변을 legacy 순서로 구성했다.
- 목록 버튼으로 같은 페이지 위치에 복귀하며 답변 등록·수정 기능을 유지한다.
- 모바일은 좌측 메뉴 기본 닫힘과 목록 표 내부 가로 스크롤을 사용한다.

## DB/API 대조

- 개발 Docker DB: `qna` 1건, `qna_reply` 1건, 답변 연결 1건
- 목록: `GET /v1/api/support/inquiries`
- 상세: `GET /v1/api/support/inquiries/{qna_id}`
- 답변 등록·수정 API는 기존 구현을 유지했다.
- 후속상태와 알림상태는 목록에서 제거하지 않고 상세 workflow 영역에 보존했다.

## 변경 파일

- `admin-web/src/pages/CustomerInquiryPage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/customer-inquiry-management.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| support inquiry API contract pytest | 7 passed |
| 목록 검색·상세·답변수정·목록복귀 E2E | 1 passed |
| PC/모바일 후보 생성 | 목록·상세 4장 |
| 개발 Docker DB 읽기 전용 대조 | qna 1 / reply 1 / 연결 1 |
| 모바일 좌측 메뉴 기본 닫힘 | 통과 |
| 모바일 표 내부 가로 스크롤 | 통과 |
| 실제 개발 DB 답변 write E2E | 미수행 |
| 외부 답변 알림 발송 | 추가개발 범위 |
| 운영 배포 | 미수행 |

## 승인 이미지

- 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-12-CUSTOMER-INQUIRY/approved/ADM-LV-12-LIST-PC.png`
- 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-12-CUSTOMER-INQUIRY/approved/ADM-LV-12-LIST-MOBILE.png`
- 상세 PC: `docs/reference/lv-ui/admin/ADM-LV-12-CUSTOMER-INQUIRY/approved/ADM-LV-12-DETAIL-PC.png`
- 상세 모바일: `docs/reference/lv-ui/admin/ADM-LV-12-CUSTOMER-INQUIRY/approved/ADM-LV-12-DETAIL-MOBILE.png`
- 목록 PC SHA256: `2062A3BEA0C6DA275AD8CEAFB33EDB0CB8FA030C3DBF04FC29F9CF239CABE789`
- 목록 모바일 SHA256: `9DDB257AC075A5D28DD56A9F3F70F9AB89016A0C1A79897A0F9D050DED7C8980`
- 상세 PC SHA256: `63904D4E96A35ECF14D0E93DC209DC5215A2C04E26391C593664CA6DF7BD6652`
- 상세 모바일 SHA256: `1BCEC5BF483D517A4F454456C92D866A7E81E9350FA0CB240078DC106E89D015`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 86%
- 전용 LV 캡처가 없어 목록의 정확한 색상·여백은 legacy JSP와 같은 계열 캡처를 기준으로 재구성했다.
- 실제 개발 DB 답변 등록·수정·복구 E2E와 첨부파일은 미검증이다.
- 외부 답변 알림 발송은 추가개발 범위로 유지한다.
- 다음 승인 단위: `ADM-LV-13 고객관리 > 문자/이메일`
