# Cubici sub_complete Mapping

작성일: 2026-07-20

## 작업 결과

- legacy `MONEYBANK_SUB_CHECK.sub_complete` 대응 기준을 확인했다.
- PostgreSQL 신규 schema에는 `MONEYBANK_SUB_CHECK` 테이블이 없고, 관련 서류/확인 필드는 `moneybank_contract_document`에 통합된 것으로 판단했다.
- `GET /v1/api/contracts` 목록과 `GET /v1/api/contracts/{mbid}` 상세에서 `sub_complete`를 실제 document 기준으로 산출하도록 변경했다.
- Admin 상세 패널에 제출서류, CB 확인, 국세/지방세/건강보험 완납, 최종 확인자 항목을 추가했다.
- React 상세 패널을 legacy `submissionState.jsp` 기준 `회원정보`, `신용정보 입력`, `서류 확인` 섹션으로 확장했다.
- bit/flag 값을 `Y/N/-`로 표시하는 `formatFlag`를 추가했다.

## Legacy 기준

legacy `AdminReqMapper.xml`:

- 목록: `IFNULL(MSC.sub_complete, 'N') AS sub_complete`
- join: `LEFT JOIN MONEYBANK_SUB_CHECK MSC ON MUR.mbid = MSC.mbid`
- 완료 처리: `UPDATE MONEYBANK_SUB_CHECK SET sub_complete = 'Y', final_confirm_admin = #{userId}`

## 신규 기준

신규 PostgreSQL 기준:

- 대응 테이블: `moneybank_contract_document`
- join 기준: `moneybank_contract.mbid = moneybank_contract_document.mbid`
- 산출식:
  - `final_confirm_admin`이 있으면 `Y`
  - 또는 `cb_check`, `national_tax_full_payment`, `local_tax_full_payment`, `health_insurance_full_payment`가 모두 충족되면 `Y`
  - 그 외 `N`

## 검증 결과

- Backend test: `13 passed`
- Frontend build: 성공, Vite `32 modules transformed`
- PostgreSQL ready: `127.0.0.1:5432 - accepting connections`
- 실데이터 목록 확인: total 7, `sub_complete` 분포 `Y=6`, `N=1`
- 상세 확인: detail found, document found, `final_confirm_admin` 존재 케이스 확인
- 상세 document 필드 존재 확인: 성공

## 제한 사항

- `MONEYBANK_SUB_CHECK` 원본 테이블 자체는 신규 schema에 없다.
- `cb_check` 등 bit 계열 값은 Python 응답에서 문자열/bytes 표현 가능성이 있어 화면 표시 형식은 후속 정리가 필요하다.
- 현재 산출식은 legacy intent에 맞춘 1차 추정이며, 운영 화면 대조 후 보정 가능하다.

## 다음 액션

1. 안내 전화 이력 대응 테이블/API 확인
2. 제출서류 파일 업로드/다운로드는 보류하고 read-only 표시 기준 먼저 확정
3. `subComplete`에 해당하는 write API 설계 여부 결정

추가 상세 패널 기록: `docs\2026-07-20_CUBICI_SUBMISSION_DETAIL_PANEL.md`
