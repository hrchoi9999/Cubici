# Cubici 관리자 ADM-LV-13 문자/이메일 복원

## 작업 범위

- 화면: `고객관리 > 문자/이메일`
- 문자 route: `/admin/cubici/supportMember/manageSms`
- 이메일 route: `/admin/cubici/supportMember/manageEmail`
- legacy 목록: `manageSms.jsp`, `manageEmail.jsp`
- legacy 편집: `manageSms_Write.jsp`
- 시각 보조 기준: `docs/reference/lv-ui/admin/reference/관리자화면08.png`

문자/이메일 전용 LV 캡처는 없다. legacy JSP의 정보 구조와 같은 고객관리 계열 캡처의 탭, 표, 검색, 페이지 규격을 결합했다.

## LV 대조와 적용

- `문자 공지/이메일` 2개 탭을 동일 폭으로 복원했다.
- 초기 화면의 migration 기술 배지와 10열 기술 상태 표를 제거했다.
- legacy와 동일한 `메뉴/구분/항목/요약 또는 제목/코드/보기` 6열 목록을 적용했다.
- 글쓰기와 우측 단일 키워드 검색, 남색 번호 및 회색 이전·다음 페이지 버튼을 적용했다.
- 목록과 편집 폼은 한 화면에 중첩하지 않고 전환되도록 정리했다.
- 편집 폼은 legacy 순서인 작성자, 분류, 메뉴, 구분, 코드, 항목, 제목, 내용으로 구성했다.
- 이메일의 `상세 화면`은 격리된 iframe 미리보기로 유지해 HTML 템플릿을 확인할 수 있다.
- 모바일은 좌측 메뉴 기본 닫힘, 표 내부 가로 스크롤, 단일 열 편집 폼을 사용한다.

## DB/API 대조

- 개발 Docker DB `message_template`: 문자 6건, 이메일 2건
- 목록: `GET /v1/api/support/message-templates`
- 상세: `GET /v1/api/support/message-templates/{message_no}`
- 등록, 수정, 삭제 API와 React 동작을 유지했다.
- 실제 SMS/이메일 발송은 외부 연동 추가개발 범위로 유지한다.

## 변경 파일

- `admin-web/src/pages/MessageTemplatePage.jsx`
- `admin-web/src/styles/admin-web.css`
- `admin-web/tests/e2e/message-template-management.spec.js`

## 검증

| 검증 | 결과 |
|---|---:|
| admin production build | 통과, 75 modules |
| support message-template API contract pytest | 2 passed |
| 목록·편집·삭제·이메일 상세 focused E2E | 2 passed |
| 개발 Docker DB 읽기 전용 대조 | 문자 6 / 이메일 2 |
| PC/모바일 후보 생성 | 6장 |
| 모바일 body 가로 overflow | 없음 |
| 모바일 표 내부 가로 스크롤 | 통과 |
| 실제 개발 DB write E2E | 미수행 |
| 실제 SMS/이메일 발송 | 추가개발 범위 |
| 운영 배포 | 미수행 |

## 승인 이미지

- 문자 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-13-MESSAGE-TEMPLATE/approved/ADM-LV-13-SMS-LIST-PC.png`
- 문자 목록 모바일: `docs/reference/lv-ui/admin/ADM-LV-13-MESSAGE-TEMPLATE/approved/ADM-LV-13-SMS-LIST-MOBILE.png`
- 이메일 목록 PC: `docs/reference/lv-ui/admin/ADM-LV-13-MESSAGE-TEMPLATE/approved/ADM-LV-13-EMAIL-LIST-PC.png`
- 이메일 상세 PC: `docs/reference/lv-ui/admin/ADM-LV-13-MESSAGE-TEMPLATE/approved/ADM-LV-13-EMAIL-PREVIEW-PC.png`
- 편집 PC: `docs/reference/lv-ui/admin/ADM-LV-13-MESSAGE-TEMPLATE/approved/ADM-LV-13-EDITOR-PC.png`
- 편집 모바일: `docs/reference/lv-ui/admin/ADM-LV-13-MESSAGE-TEMPLATE/approved/ADM-LV-13-EDITOR-MOBILE.png`

## 후보 SHA256

- 문자 목록 PC: `530A6CB7583BD7B1ED22E680DE9AA1E45CD2DDBD545E369F4E1FF23341EE0FD2`
- 문자 목록 모바일: `A634987155B77A5181FE96FE53FC8D26D90395EABBF94027B9B6DDF39DBB1ECD`
- 이메일 목록 PC: `FFC04BF15D2D27B309C8786B6ED0B16710F9A9E875F91F125A86657BDFFA6DC7`
- 이메일 상세 PC: `BDEF53BB3D691F11DF087C299EB8218678C39DCA4E788845634CDE57BF4968D7`
- 편집 PC: `B800182E1BE0A75B85E3C39860E83281FBE121E3E5C3C269CA64A81E4000CC7D`
- 편집 모바일: `2968CD2EB85B50E3EA61999CA92AD6ADCFD5F2D9CB882EFB50D271EDADC831A9`

## 보수 진행률과 잔여

- 화면 복원율: 100%, 2026-08-10 사용자 승인 완료
- 내부 기능 구현율: 88%
- 실제 개발 DB 등록·수정·삭제 복구 E2E와 legacy 코드·변수 치환 정책의 최종 대조가 남았다.
- 실제 SMS/이메일 발송은 추가개발 범위이며 위 내부 기능 구현율에서 제외한다.
- 다음 승인 단위: `ADM-LV-14 고객관리 > 고객 공지 관리`
