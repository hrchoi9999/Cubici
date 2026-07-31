# Cubici Website Progress Review

## 검토 범위

- 현재 작업 폴더: `D:\Cubici_Integration_20260730`
- Legacy 원본 참고: `D:\Cubici`
- 이전 통합 작업 참고: `D:\Alt_CSM\Cubici`
- `.codex` 아래 JSONL은 열람하지 않았다.

## 현재 폴더 상태

- Git branch: `fix/cloudflare-admin-spa-routing`
- Git 상태: `dist-cloudflare/`, `.wrangler/` untracked
- 웹앱 구조:
  - `user-web`: cubici.co.kr 사용자 React/Vite 앱
  - `admin-web`: cubici.co.kr/admin 관리자 React/Vite 앱
  - `service-api`: FastAPI/PostgreSQL API
  - `dist-cloudflare`: 사용자 root와 관리자 `/admin` 통합 정적 배포 산출물
  - `wrangler.toml`: Cloudflare Pages output `dist-cloudflare`

## D:\Cubici 확인 결과

- legacy Java/JSP 원본 중심 폴더다.
- `src/main/webapp/WEB-INF/jsp/egovframework/azon` 기준 JSP:
  - PC/비모바일 JSP: 145개
  - 모바일 JSP: 38개
- 사용자 Cubici PC JSP는 55개 확인:
  - home/login/signup/약관
  - 통합정보/매출/정산/재고
  - 머니뱅크 소개/신청/심사/계약/현황/약관
  - 마이페이지
  - 고객지원/요금안내
- D:\Cubici는 현재 React/Python 개발 폴더가 아니라 legacy 업무 흐름/화면 참조용으로 보는 것이 맞다.

## D:\Alt_CSM\Cubici 확인 결과

- `devCubici` 브랜치, `origin/devCubici` 대비 ahead/behind 상태와 다수 미정리 변경이 있었다.
- handoff 기준 목표 구조:
  - `cubici.co.kr`: 사용자 React 앱
  - `cubici.co.kr/admin/*`: 관리자 React 앱
  - `api.cubici.co.kr`: FastAPI API
  - 단기 운영: Cloudflare Pages + 이 PC Docker FastAPI/PostgreSQL + Cloudflare Tunnel
- 완료 기록:
  - 사용자 주요 화면 구현
  - 관리자 주요 화면 구현
  - 관리자 마스터 인증/접근 차단
  - 사용자/관리자 API ownership 검증 보강
  - Cloudflare 정적 번들 build/smoke 준비
  - prod Docker compose/Dockerfile/운영 env sample 준비
- 미완료 기록:
  - Cloudflare 실제 Pages 배포
  - custom domain 연결 확인
  - Cloudflare Tunnel token 및 `api.cubici.co.kr` 연결
  - prod Docker image build/up 검증
  - 실제 도메인 smoke/E2E
  - Git 최종 정리/민감정보 검사/commit/push

## 사용자 웹 진행상황

- 구현 범위:
  - 로그인/회원가입/약관
  - 마이페이지 회사정보/쇼핑몰 계정 CRUD
  - 통합정보/매출/반품/정산/재고 조회
  - 머니뱅크 소개/신청/서류 업로드/현황/계약 상세
  - 이용조건 동의, 전자서명 mock, 해지신청
  - 고객지원 공지/FAQ/Q&A/요금안내
  - 모바일 legacy 주요 route alias
- 테스트 파일: `user-web/tests/e2e` 9개
- 문서상 최신 milestone:
  - user-web production build 통과
  - 사용자단 전체 DB E2E `12 passed`, skip 0, 실패 0
  - 정산 strict 재검산 불일치 0
  - 상환 strict 재검산 불일치 0
- 보수 평가:
  - 1차 제외 범위 제거 후 사용자단 운영 재현율 약 96% 추정
  - 전체 운영 재현 관점에서는 Hyphen/공동인증/외부 쇼핑몰/실결제 연동 제외 때문에 더 낮게 봐야 한다.

## 관리자 웹 진행상황

- legacy 메뉴 기준:
  - legacy 좌측 메뉴 기준 21개
  - 상세/파생 포함 React 구현 화면 29개
  - legacy 관리자 후보 JSP 기준 61개 중 29개 기능 재구성 중
- 2026-07-26 inventory 기준:
  - 관리자단 전체 운영 재현: 77~81%
  - 1차 제외 항목 제외 관리자 운영 재현: 88~91%
  - 관리자단 전체 E2E milestone: 34 passed
- 주요 잔여:
  - legacy 산식/procedure/shop grouping 대조
  - 운영 audit/권한 고도화
  - Hyphen/은행 실연동
  - SMS/Email 실발송
  - 외부 서버 metric
  - 게시판 첨부/팝업/노출정책
  - Prism/RawData 산식 재계산/Alt_CSM 실연동

## 배포 진행상황

- 현재 폴더에 `dist-cloudflare` 산출물과 Cloudflare Worker fallback이 존재한다.
- `/admin` SPA routing fallback도 `_worker.js`에 반영되어 있다.
- `docker-compose.prod.yml`, `service-api/Dockerfile`, `ops/production.env.sample` 존재.
- 확정 상태는 배포 준비 단계다.
- 실제 운영 배포 완료로 볼 수 없는 이유:
  - `dist-cloudflare`가 현재 git untracked
  - `.wrangler/`도 untracked
  - Cloudflare Pages 실제 배포 기록 미확인
  - Tunnel token/연결 미확인
  - 실제 도메인 smoke/E2E 미확인

## 보수적 결론

- 사용자 웹 1차 기능 개발: 완료에 가까움, 문서상 milestone E2E 통과.
- 관리자 웹 1차 기능 개발: 주요 메뉴는 구현됐고 milestone E2E 통과 기록 있음.
- 사이트 운영 배포: 준비 완료 단계, 실제 운영 반영은 미완료.
- 전체 cubici.co.kr 운영 재현: 1차 제외 범위를 제외하면 높지만, 실제 외부 연동/운영 배포/도메인 검증 전이므로 전체 기준은 약 70~80%로 보는 것이 보수적이다.

## 다음 작업 권장

1. 현재 폴더 기준 `dist-cloudflare`, `.wrangler` 추적/ignore 정책 확정.
2. DB preflight 후 사용자단/관리자단 배포 후보 focused smoke 실행.
3. Cloudflare Pages 배포 및 custom domain 연결.
4. Cloudflare Tunnel로 `api.cubici.co.kr` 연결.
5. 실제 도메인 smoke/E2E 실행.
6. 민감정보/DB dump/git ignore 점검 후 sanitized commit/push.
