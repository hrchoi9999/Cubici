# Cubici LV 자료 감사 및 페이지 단위 Milestone

점검일: 2026-08-08

## 변경 결과

- `docs/reference/lv-ui` reference 폴더를 생성했다.
- 사용자 LV 캡처, 240130 원본 렌더, 기존 React 출력, 관리자 LV 캡처를 분류했다.
- 이미지 97건의 출처, 해상도, SHA-256 manifest를 생성했다.
- 기능 구현과 화면 복원을 분리해 페이지 단위로 관리하는 기준을 확정했다.

## 자료 보유 현황

| 자료 | 보유 현황 | 판단 |
|---|---:|---|
| 사용자 실제 LV PC 캡처 | 13장 | 핵심 화면 시각 기준으로 사용 가능 |
| 사용자 실제 LV 모바일 캡처 | 4장 | 메인/메뉴/통합정보 기준으로 사용 가능 |
| 240130 사용자 HTML | root 31개 | 페이지 26개와 공통 UI/모달 구조 확인 가능 |
| 240130 이미지 | 196개 | main/sub/icon/common/logo 등 원본 보유 |
| 240130 원본 렌더 | 10장 | 캡처가 없는 화면의 보조 기준 |
| 기존 React 사용자 출력 | 59장 | 현재 구현과 LV 차이 비교 가능 |
| 관리자 LV 캡처 | 11장 | 기존 판단과 달리 관리자 시각 자료가 존재함 |
| legacy JSP 후보 | 관리자 61개 | 기능/필드/화면 파생 구조 참고 가능 |

## 추가 확인 결과

- `D:\Cubici`와 `D:\Alt_CSM\Cubici`의 핵심 Rudicks `common.css`, `style-main.css`는 현재 저장소 legacy 복사본과 SHA-256 기준 동일하다.
- `D:\Alt_CSM\Cubici`에는 node_modules, target, dist, Cloudflare bundle 중복 자원이 다수 존재한다.
- Hyphen/은행/계좌/계약 관련 PDF·ZIP과 `data_local`은 LV 화면 reference 대상에서 제외했다.
- 관리자 캡처 11장이 확인됐으므로 “관리자 LV 자료가 전혀 없다”는 이전 판단은 수정한다. 다만 11개 캡처와 현재 24개 메뉴/33개 파생 화면의 매핑은 별도 화면 감사가 필요하다.

## 페이지 수 기준

### 사용자

- 240130 LV 직접 페이지 기준: 26개
- 공통 UI 기준: header, footer, mobile GNB, modal 4개
- 현재 release candidate route 기준: desktop 42개
- mobile alias 기준: 17개
- alias는 별도 디자인 화면으로 중복 계산하지 않고 원본 화면의 모바일 검증 항목으로 관리한다.

### 관리자

- legacy 좌측 메뉴 기준: 21개
- 현재 React 직접 메뉴 기준: 24개
- 상세/파생 route 포함 기준: 33개
- React page 파일 기준: 32개
- legacy 후보 JSP 기준: 61개
- 진행률은 직접 메뉴 24개와 상세/파생 화면을 분리해 보고한다.

## 화면 복원율 계산

각 항목을 20점으로 계산한다.

1. LV 기준자료와 route 매핑 완료
2. 동일 viewport/상태의 현재 출력 이미지 확보
3. 구조·색상·글꼴·간격·상태 차이 검토 완료
4. 승인 목표에 맞춘 UI 구현 완료
5. 최종 출력 이미지 사용자 승인 완료

사용자 승인이 없으면 최대 80%이며 100%로 처리하지 않는다.

## 기능 구현율 계산

화면에 필요한 항목만 분모에 포함한다.

1. UI 표시와 기본 상호작용
2. API/DB 조회
3. 저장·변경·삭제
4. legacy 업무 산식/상태 전이 검산
5. focused E2E 또는 운영 smoke

기능이 없는 정적 화면은 불필요 항목을 N/A로 처리하고 나머지 항목으로 재계산한다.

## 초기 Baseline

- 사용자 화면 정식 시각 승인: 26개 중 0개. 기존 smoke 통과와 시각 승인을 구분한다.
- 사용자 기능: 42개 desktop route mock smoke 기록은 있으나 실제 API/DB 및 업무 흐름 기준 페이지별 재평가가 필요하다.
- 관리자 화면 정식 시각 승인: 24개 중 0개. Prism 2개 화면은 디자인 방향만 확인된 상태다.
- 관리자 기능: 기존 문서 기준 전체 약 63~67%이나 페이지별 산식/E2E 잔여분을 다시 표시해야 한다.

## Milestone

### M0 Reference Baseline - 완료

- 자료 위치/종류 감사
- 안전한 reference 폴더 생성
- 이미지 manifest 생성
- 화면/기능 이중 진행률 정의

### M1 사용자 페이지 Visual Audit

- 26개 LV 직접 페이지와 React route/state 매핑 확정
- PC/태블릿/모바일 현재 출력 생성
- 화면별 비교 이미지와 차이 목록 작성
- 페이지별 화면 복원율/기능 구현율 baseline 확정

### M2 사용자 페이지 단위 복원

- 한 번에 한 화면만 목표 이미지 승인
- 구현, focused 검증, 후보 이미지 생성
- 사용자 승인 후 다음 화면 진행
- 사용자 메인은 로그인 후 `pc_index_login.png` 화면부터 시작
- 비로그인 메인은 별도 화면으로 구분해 후속 진행

### M3 사용자 Release Candidate

- 사용자 전체 화면 승인 상태 확인
- 사용자 기능 focused regression
- production build/static bundle smoke
- Git 민감정보 점검, 사용자 범위 commit/push
- Cloudflare Pages 운영 배포 및 운영 URL 확인

### M4 관리자 페이지 Visual Audit

- 관리자 캡처 11장과 24개 메뉴/33개 파생 화면 매핑
- 캡처 없는 화면의 legacy JSP/Rudicks 기준 화면 정의
- 관리자 페이지별 이중 진행률 baseline 확정

### M5 관리자 페이지 단위 복원

- 관리자 직접 메뉴와 상세/파생 화면을 하나씩 복원
- PC/태블릿/모바일 출력 이미지 승인
- 기능/API/저장/산식/focused E2E를 별도 검증

### M6 통합 Release

- 사용자/관리자 전체 회귀검증
- API Docker, PostgreSQL, Cloudflare Tunnel health 확인
- Git 최종 점검 및 운영 배포
- 운영 URL 기준 최종 이미지/기능 확인

## 다음 작업

- 다음 Batch는 `M1-1: 사용자 메인(로그인 후) pc_index_login 화면 비교 이미지 작성`이다.
- 코드 수정 없이 reference/current/compare 이미지를 먼저 제시한다.
