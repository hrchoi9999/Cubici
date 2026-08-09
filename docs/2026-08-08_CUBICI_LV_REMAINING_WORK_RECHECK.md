# Cubici LV 남은 작업 재점검

점검일: 2026-08-08

## 결론

기존 잔여 목록은 2026-08-07 작업 중단 시점의 관리자 Batch 11 기준으로는 맞다. 그러나 사용자 화면을 먼저 완료하는 현재 우선순위에는 사용자 LV 미완료 항목이 빠져 있어 순서를 조정해야 한다.

## 현재 확인 상태

- 사용자 LV Batch 1~9의 구현 및 mock route smoke 기록은 완료됐다.
- 사용자 release candidate smoke 기록: desktop 42개 route, mobile alias 17개 route 통과.
- 사용자 LV 완성도는 기존 문서 기준 약 78%이며 운영 실데이터 검증과 최종 배포 검증이 남아 있다.
- 로그인 후 메인에는 LV `index-login.html`의 매출/정산 및 머니뱅크 이용내역 대시보드가 아직 없다.
- 사용자 기능 화면은 LV CSS와 React/Rudicks 스타일이 혼합되어 있어 화면군별 최종 대조가 필요하다.
- 관리자 Batch 11-1~11-4와 11-5A는 완료 기록이 있다.
- 관리자 Batch 11-5B, 11-6, focused regression은 미완료다.
- 현재 작업 트리에는 사용자/관리자 변경과 LV 원본·검증 산출물이 함께 있어 Git 반영 전 범위 분리가 필요하다.

## 수정된 작업 순서

### 사용자 화면 우선

1. 로그인 후 메인 LV 대시보드 복원
2. 사용자 부분 적용 화면의 LV 구조/CSS 충돌 점검 및 화면군별 보정
3. 사용자 PC/태블릿/모바일 focused regression
4. 로그인, 대시보드, 매출, 정산, 머니뱅크 핵심 API 연동 smoke
5. 사용자 production build 및 Cloudflare 통합 정적 bundle smoke
6. Git 민감정보·원본자료·검증 산출물 점검 후 사용자 범위 commit/push
7. Cloudflare Pages 운영 배포 및 `cubici.co.kr` 사용자 route 확인

### 관리자 화면 후속

1. Batch 11-5B: 머니뱅크 운영 6개 route focused smoke
2. Batch 11-6: 환경설정/모니터링 UI
3. 관리자 전체 반응형 보정
4. 관리자 focused regression
5. 관리자 production build 및 smoke
6. Git 점검 후 관리자 범위 commit/push
7. Cloudflare Pages 운영 배포 및 관리자 운영 route 확인

### 최종 통합 확인

1. 사용자/관리자 통합 회귀검증
2. API Docker, PostgreSQL, Cloudflare Tunnel health 확인
3. 운영 URL에서 로그인 전/후 핵심 흐름 확인
4. legacy 산식 검산 잔여분을 별도 완료 처리

## 배포 구조 주의

- React 사용자/관리자 프론트 배포 대상은 Cloudflare Pages다.
- FastAPI/PostgreSQL/Cloudflare Tunnel은 Docker 운영 영역이다.
- UI만 수정한 경우 Docker image 재배포는 필수가 아니다. API 설정 또는 backend 코드 변경이 있을 때만 Docker 재배포 범위를 판단한다.

## 다음 Batch

- 관리자 Batch 11-5B는 보류한다.
- 다음 작업은 사용자 화면의 로그인 후 메인 LV 대시보드 복원으로 시작한다.
