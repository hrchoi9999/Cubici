# Cubici QNA-1 사용자 문의 수정 소유권 보정

## 범위

- 대상: `PUT /v1/api/support/inquiries/{qna_id}`
- 목적: 사용자 Q&A 수정 요청의 본문 `user_no`를 소유권 검사에 반영
- 제외: DB fixture lifecycle, 30건 초과 pagination, 첨부파일, 외부 알림, 운영 배포

## 원인과 수정

사용자 React는 문의 수정 시 `user_no`를 JSON 본문으로 보낸다. 기존 middleware는 문의 상세 경로에서 query의 `user_no`만 읽어 정상 소유자 요청도 `403 resource owner required`로 차단했다.

문의 상세 경로의 PUT 요청에 한해 JSON 본문의 `user_no`를 읽어 `require_master_admin_or_same_user`에 전달하도록 수정했다. GET·DELETE의 query 검사, 관리자 답변 전용 권한, repository의 실제 문의 소유자·답변 존재 여부 검사는 유지했다.

## 권한 검증

| 요청 | 결과 |
| --- | --- |
| 동일 사용자 Bearer + 동일 본문 `user_no` | HTTP 200 |
| 다른 사용자 본문 `user_no` | HTTP 403 |
| query는 동일 사용자, 본문은 다른 사용자 | HTTP 403 |
| Bearer 없음 | HTTP 401 |
| 관리자 답변 POST·PUT 경로 | master admin 보호 유지 |

## 변경 파일

- `service-api/src/cubici_service/core/access_control.py`
- `service-api/tests/test_access_control.py`
- `service-api/tests/test_admin_api_auth.py`

## 검증 결과

- 소유권 focused test: `10 passed`
- Q&A API 계약 focused test: `6 passed`
- 소유권·관리자 인증·Q&A API 통합 focused test: `21 passed`
- diff 형식 검사: 통과
- DB write: 없음
- frontend 변경: 없음

## 배포 판단

Backend middleware가 변경됐으므로 최종 운영 반영 시 Docker API 재배포가 필요하다. 현재 정산·원장·Q&A 변경을 묶어 최종 배포하기 위해 이번 Batch에서는 commit, push, 운영 배포를 수행하지 않았다.

## 다음 Batch

QNA-2에서 disposable fixture를 이용해 사용자 문의 등록·수정·삭제, 관리자 답변 등록·수정, 답변 후 사용자 변경 차단, 타 사용자 비공개 문의 격리를 실제 개발 DB로 검증한다.
