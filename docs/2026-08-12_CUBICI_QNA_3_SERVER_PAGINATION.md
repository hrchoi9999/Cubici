# Cubici QNA-3 사용자 Q&A 서버 페이지네이션

## 범위

- 사용자 Q&A 목록 `/board/qa/index`
- API `total`, `limit`, `offset`, `keyword`, `user_no` 기반 서버 조회
- 10건 단위 첫·이전·번호·다음·마지막 페이지 이동
- 검색 시 첫 페이지로 이동하고 서버에서 검색
- 31건 이상 실DB fixture 및 타 사용자 문의 격리 검증

공지·FAQ 페이지네이션, 첨부파일, 외부 알림, commit·push·운영 배포는 이번 Batch에서 제외했다.

## 변경 내용

기존 React는 문의를 최대 30건만 요청한 뒤 브라우저에서 10건씩 나눴다. 31번째 이후 문의는 목록과 검색 결과에 표시될 수 없었다.

Q&A 목록을 페이지당 10건만 API로 요청하도록 변경했다. 페이지 버튼 수와 행 번호는 API `total`을 기준으로 계산하고, 검색어는 `keyword`로 전달하며 검색 시 `offset=0`으로 초기화한다. API와 backend repository는 기존에 이 계약을 지원하므로 backend 구현 변경은 필요하지 않았다.

## 페이지별 진행

| 화면 | 화면 복원율 | 기능 구현율 | 판정 |
| --- | ---: | ---: | --- |
| U19 Q&A 목록 | 100% | 95% | 31건 이상 목록·검색·페이지·소유자 격리 실DB E2E 완료 |

사용자 직접 화면은 26/26, 화면 복원율 100%다. 사용자 전체 기능 구현율은 기존 보수적 90.4%를 유지한다.

## 변경 파일

- `user-web/src/pages/SupportPages.jsx`
- `user-web/tests/e2e/m1-19-usr-qa-list-candidate.spec.js`
- `user-web/tests/e2e/qna-server-pagination-db-e2e.spec.js`
- `docs/reference/lv-ui/page-progress-register.md`
- `docs/2026-08-09_USR_QA_LIST_IMPLEMENTATION_RESULT.md`
- `docs/2026-08-12_CUBICI_LV_REMAINING_WORK_REBASE.md`

## 검증 결과

- 개발 DB health: `cubici_local`, application table 60개, 정상
- 사용자 production build: 통과
- 서버 페이지네이션 mock focused E2E: `1 passed`
- 31건 실DB React E2E: `1 passed`, 7.2초
- 확인 범위: 첫 페이지 10건, 2페이지 offset 10, 마지막 4페이지 offset 30·1건, 검색 offset 0
- 타 사용자 fixture 5건: 사용자 목록에서 미노출
- QNA-2 backend focused 회귀: `16 passed`
- 외부 재확인 fixture: 사용자 0, 문의 0
- 테스트 서버 종료: API·사용자 포트 listener 없음
- `git diff --check`: 통과

## 다음 Batch

`REG-1 최신 변경 전체 회귀검증`을 진행한다. DB preflight 후 backend, 사용자, 관리자 검증을 분리해 각 1회 실행하고, 실패를 기능·fixture/data·환경/DB로 분류한다.
