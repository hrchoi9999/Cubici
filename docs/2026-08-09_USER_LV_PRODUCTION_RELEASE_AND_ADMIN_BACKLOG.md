# 사용자 LV 운영 릴리즈 및 관리자 후속 작업

- 완료일: 2026-08-09
- 릴리즈 commit: `9dd5b7e66cbb6ecab9073ebd245fcff63f665ceb`
- Git 브랜치: `fix/cloudflare-admin-spa-routing`
- Cloudflare Pages 배포: `https://25e547d5.cubici.pages.dev`
- 운영 도메인: `https://cubici.co.kr`

## 사용자 화면 완료 판정

| 구분 | 결과 |
| --- | --- |
| LV 화면 복원 | 26/26 직접 화면, 공통 UI 4/4 승인 기준 완료 |
| production build | 사용자 37 modules, 관리자 73 modules 통과 |
| Git | 사용자 후보 376개 파일 단일 commit 및 push 완료 |
| Pages | clean worktree의 commit 기준 production 배포 완료 |
| 운영 메인 | final UI shell, 주요 서비스, footer 확인 |
| 운영 주요 route | 메인, 머니뱅크 소개, 공지, 인증 보호 route 통과 |
| 이미지 | 점검 route broken image 0 |
| 브라우저 오류 | console error 0 |
| API Docker | `cubici-api-prod`만 재빌드/교체, healthy |
| API 코드 | 변경 source 3개 운영 컨테이너 해시 일치 |
| PostgreSQL/Tunnel | 기존 컨테이너와 volume 유지, 정상 |
| 외부 API health | health/DB/docs 7/7 HTTP 200 |

사용자 화면 LV 복원과 현재 구현 범위의 운영 배포는 완료로 판정한다. SMS, 결제, 쇼핑몰 외부 API 등은 별도 추가개발 범위로 유지한다.

## 관리자 현황 기준

| 기준 | 수량/판정 |
| --- | --- |
| legacy 직접 메뉴 기준 | 24개 |
| alias/detail 포함 React route | 33개 |
| React page 파일 기준 | 32개 |
| JSP 물리 파일 후보 기준 | 61개 |
| 최종 화면 승인 | 0/24 |
| 기존 UI 선행 작업 | shell/common CSS, 대표 route smoke, Prism 2개 샘플 방향 |
| 기능 migration | 기존 문서 기준 63~67%, 전체 DB/CRUD/산식 재검증 전 |

관리자 화면은 240130 사용자 LV 원본에 직접 대응하는 관리자 디자인이 없다. 따라서 현재 rudicks 관리자 자원과 승인된 Prism 기본 방향을 이용해 관리자 대체 LV 기준을 페이지별로 확정한다.

## 관리자 화면 작업 트리

### ADM-00 공통 기준

- 로그인
- Header
- 좌측 메뉴
- Sub visual
- 본문 wrapper
- table/search/form/modal 공통 규격
- PC, tablet, mobile 반응형 기준

### ADM-01 통합정보 2개

- 큐빅아이
- 머니뱅크

### ADM-02 회원관리 2개

- 회원현황
- 결제관리

### ADM-03 머니뱅크 관리 2개

- 통합 현황
- 이용상세

### ADM-04 머니뱅크 운영 6개

- 신청 접수
- 심사 승인
- 계약 관리
- 정산 관리
- 상환 관리
- 프리즘 지표 관리

### ADM-05 고객관리 3개

- 고객문의
- 문자/이메일
- 고객 공지 관리

### ADM-06 모니터링 3개

- Error Log
- 서버 관리
- 펌뱅킹 전문

### ADM-07 환경설정 6개

- 관리자 등록
- 요금제 관리
- 연계코드 관리
- 협력사 관리
- 머니뱅크 관리
- Prism System

## 화면별 완료 조건

각 직접 메뉴는 다음 항목을 분리해 관리한다.

1. PC/mobile 기준 후보 이미지 작성
2. 사용자 화면 승인
3. 조회 API와 DB 데이터 검증
4. 저장/변경/삭제 기능 검증
5. legacy 산식 또는 업무 규칙 검산
6. focused E2E 통과
7. 운영 배포 준비 판정

## 관리자 Batch 순서

1. ADM Batch 1: 공통 shell/login/table/form과 반응형 기준 확정
2. ADM Batch 2: 통합정보, 회원관리, 머니뱅크 관리 6개 화면
3. ADM Batch 3: 머니뱅크 운영 6개 화면 및 기존 Batch 11-5B smoke
4. ADM Batch 4: 고객관리 3개 화면
5. ADM Batch 5: 모니터링, 환경설정 9개 화면
6. ADM Batch 6: 24개 화면 focused regression과 기능/산식 보완
7. ADM Batch 7: production build, Git 점검, commit/push, 운영 배포
8. Final: 사용자/관리자 통합 회귀검증

다음 작업은 `ADM Batch 1`이며, 기존 관리자 변경을 기준으로 공통 shell과 대표 화면의 PC/mobile 후보 이미지를 먼저 확정한다.
