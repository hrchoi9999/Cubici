# Cubici Legacy Design Restoration Stages

Date: 2026-07-31

## Objective

현재 React/FastAPI 구조를 유지하면서 legacy JSP 사이트의 UI/UX 통일감을 최대한 재현한다.

## Three Unity Methods

1. 공통 레이아웃 복원
   - header, footer, GNB, sub visual, left navigation, content wrapper를 legacy 구조에 맞춘다.
   - 페이지별 개별 디자인보다 먼저 사이트 전체의 외곽 인상을 맞춘다.

2. 공통 콘텐츠 포맷 복원
   - legacy에서 반복되던 4~5개 주요 포맷을 React 공통 컴포넌트로 만든다.
   - 소개형 페이지, 검색+테이블형 페이지, 게시판형 페이지, 폼/마이페이지형 페이지, 로그인형 페이지를 우선 대상으로 한다.

3. legacy CSS/images 우선 재사용
   - rudicks CSS와 legacy 이미지를 최대한 그대로 사용한다.
   - React 전용 CSS는 보정용으로만 두고, 새 디자인을 덧씌우는 방식은 피한다.

## Restoration Stages

### Stage 0. 기준 고정

목표:
- legacy와 현재 React의 차이를 비교할 기준을 고정한다.
- backend 변경 없이 front 복원 중심으로 범위를 제한한다.

작업:
- legacy 대표 JSP와 현재 React 페이지 매핑 확정
- 공통 포맷 목록 확정
- 사용할 CSS/image 경로 확정
- `/`, `/login`, 주요 소개 페이지를 1차 기준 화면으로 선정

산출물:
- 페이지 매핑표
- legacy class/component 매핑표

### Stage 1. 공통 레이아웃 복원

목표:
- 사이트에 들어갔을 때 첫인상이 legacy와 비슷하게 느껴지도록 만든다.

작업:
- React `UserCore` 또는 공통 layout에 legacy header/footer 구조 반영
- GNB, top area, footer, container 폭, 여백, 배경 톤 복원
- rudicks `common.css`, `module.css`, `style-main.css`, `style-sub.css` 적용 경로 정리
- local Vite와 Cloudflare bundle 양쪽에서 이미지 경로가 깨지지 않게 정리

우선 검증:
- `/`
- `/login`
- asset 404
- user-web build

### Stage 2. 핵심 포맷 컴포넌트화

목표:
- 페이지별로 하나씩 새로 꾸미지 않고 legacy 통일감을 반복 적용할 수 있게 한다.

작업:
- `LegacySubLayout`
- `LegacyIntroSection`
- `LegacySearchTable`
- `LegacyBoardList`
- `LegacyFormPanel`
- `LegacyAuthPanel`

적용 기준:
- 기존 React API 호출, 상태 관리, route는 유지
- markup/class 구조만 legacy에 가깝게 교체
- 페이지별 세부 튜닝은 최소화

### Stage 3. 대표 페이지 이식

목표:
- 사용자가 자주 보는 화면에서 legacy 느낌을 먼저 확보한다.

작업:
- 메인 페이지 legacy hero/slide/partner 영역 복원
- 로그인 페이지 legacy login-box 구조 복원
- 머니뱅크 소개형 페이지 1~2개 복원
- 공지/고객지원 게시판형 페이지 1개 복원

판정:
- 이 단계가 끝나면 전체 톤은 70~80% 수준까지 올라갈 것으로 추정한다.

### Stage 4. 나머지 사용자 화면 일괄 적용

목표:
- 공통 포맷을 전체 사용자 화면에 확장한다.

작업:
- 소개형 페이지 일괄 적용
- 검색+테이블형 페이지 일괄 적용
- 게시판형 페이지 일괄 적용
- 마이페이지/폼형 페이지 일괄 적용

판정:
- 이 단계가 끝나면 legacy와 유사한 체감은 80~90% 수준이 현실적 목표다.

### Stage 5. 미세 조정과 회귀 검증

목표:
- 어색한 부분을 줄이고 운영 배포 전 리스크를 확인한다.

작업:
- 모바일/반응형 보정
- 폰트 크기, 행간, 여백, 버튼 높이, 테이블 폭 조정
- 주요 사용자 흐름 focused E2E
- 운영 배포 전 API/Tunnel preflight

판정:
- 90% 이상은 페이지별 미세 조정과 실제 브라우저 검증 시간이 크게 좌우한다.
- 100% 동일 복원은 목표에서 제외한다.

## Recommended Batch Order

Batch 1:
- Stage 1 + Stage 3 일부
- 공통 shell, 메인, 로그인, asset 경로

Batch 2:
- Stage 2
- 공통 포맷 컴포넌트 확정

Batch 3:
- Stage 4 일부
- 소개형/게시판형 먼저 적용

Batch 4:
- Stage 4 나머지
- 검색+테이블형, 폼/마이페이지형 적용

Batch 5:
- Stage 5
- 미세 조정, focused E2E, 운영 배포 준비

## Current Conservative Estimate

- 기술 난이도: 중간
- backend 변경 필요성: 낮음
- 시간 리스크: 페이지별 미세 조정
- 가장 효율적인 시작점: 공통 layout과 대표 2~3개 화면 복원
- 현실적 목표: 전체 사용자 화면 기준 80~90% 유사 체감
