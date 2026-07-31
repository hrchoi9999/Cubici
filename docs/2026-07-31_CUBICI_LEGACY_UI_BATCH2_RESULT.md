# Cubici Legacy UI Batch 2 Result

Date: 2026-07-31

## Scope

Batch 2는 사용자 front 전체 legacy 복원을 위한 공통 포맷 컴포넌트화 작업으로 진행했다.

관리자 페이지는 이번 batch 범위에 포함하지 않았다.

## Changed Files

- `user-web/src/shared/UserCore.jsx`
- `user-web/src/pages/SupportPages.jsx`
- `user-web/src/styles/user-web.css`
- `dist-cloudflare/**`

## Implemented

### Common Legacy Components

`UserCore.jsx`에 다음 공통 컴포넌트를 추가했다.

- `LegacyPanel`
- `LegacySearchPanel`
- `LegacyDataTable`
- `LegacyBoardList`
- `LegacyFormPanel`
- `LegacyIntroSection`

### Tabs

- 기존 React `tabs` 구조를 legacy `s-tab` 구조로 변경했다.
- 머니뱅크, 마이페이지 등 기존 `Tabs` 사용 화면에 legacy 탭 톤이 적용된다.

### Board Format

- 고객지원 목록 화면을 `LegacyBoardList`로 연결했다.
- legacy `m-baordSet`, `boardTop`, `boardList`, `table.list` 포맷을 React 공통 컴포넌트로 사용할 수 있게 했다.

### Shared Styling

- 기존 `data-table-wrap`, `form-panel`, `terms-panel`에 legacy `subBox` 계열 header/content 톤을 적용했다.
- 검색/테이블/폼/게시판형 화면에 공통 header 색상, bullet icon, table header 색상, spacing을 맞췄다.

## Backend Impact

- `service-api` 변경 없음.
- DB schema 변경 없음.
- API contract 변경 없음.

## Verification

- `user-web` production build: PASS
- Playwright DOM smoke: PASS
  - `moneybank/intro/advpay`: legacy tab selector 확인
  - `board/notice/index`: legacy board selector 확인
  - `cubici/salesInfo/sales`: table wrapper selector 확인
  - `moneybank/request`: form panel selector 확인
- Cloudflare static bundle build: PASS
- Cloudflare static bundle smoke: PASS

## Progress Estimate

사용자 페이지 legacy UI 복원 전체 기준 보수적 진행률:

- Batch 1 완료 후: 약 20%
- Batch 2 완료 후: 약 35%

현재 완료:
- 공통 shell 1차 복원
- 메인/로그인 대표 복원
- legacy CSS/images 경로 정리
- 공통 포맷 컴포넌트 기반 마련
- 게시판형 대표 연결

남은 주요 단계:
- Batch 3: 소개형/게시판형 대표 페이지 확장
- Batch 4: 검색+테이블형, 폼/마이페이지형 전체 적용
- Batch 5: 모바일/미세 UI 조정, focused E2E, 운영 배포 준비

## Notes

- 기존 페이지 대부분이 아직 새 공통 컴포넌트로 완전히 치환된 것은 아니다.
- Batch 2는 이후 일괄 적용 속도를 높이기 위한 기반 작업이다.
- Vite `/resources/...` runtime 경고는 기존 운영 번들 복사 구조상 정상 경고로 판단한다.
