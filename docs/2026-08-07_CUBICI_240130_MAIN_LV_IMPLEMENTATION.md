# Cubici 240130 최종버전(LV) 메인 적용

## 범위

- React/FastAPI 구조와 기존 API 계약은 유지하고 사용자 메인 화면의 UI/UX만 240130 LV 기준으로 교체했다.
- 원본 참고자료는 `240130_큐빅아이`의 메인 이미지와 구조를 기준으로 했다.

## 구현 내용

- LV 메인 히어로 4개 슬라이드와 각 슬라이드의 문구·배경·이미지를 React 컴포넌트로 이식했다.
- 상단 메인 슬라이드는 좌우 버튼, 4개 pagination, 6초 자동 전환, 터치 swipe를 지원한다.
- 첫 번째 히어로 내부 PC 목업 슬라이드와 네 번째 moneybank 이미지 구성을 포함했다.
- LV 하단 서비스 카드 4개와 모바일 로그인 영역을 유지했다.
- 모바일에서는 데스크톱 히어로를 숨기고 LV 모바일 구성을 표시하도록 반응형 규칙을 보강했다.
- 운영 정적 파일 캐시 충돌 방지를 위해 빌드 버전을 HTML에 기록해 JS asset hash를 갱신했다.

## 변경 파일

- `user-web/src/pages/HomePages.jsx`
- `user-web/src/styles/final-ui-foundation.css`
- `user-web/src/main.jsx`

## 검증

- Cloudflare 정적 bundle build: 성공
- 최신 Pages 배포본: `https://491340bf.cubici.pages.dev`
- 데스크톱 DOM: 메인 슬라이드 4개, 서비스 카드 4개 확인
- 다음 버튼: transform이 `-100%`에서 `-200%`로 이동하는 것 확인
- 모바일 390px: 데스크톱 히어로 `display:none`, 모바일 영역 표시, 카드 4개, body overflow 없음 확인
- 빌드 경고: 기존 `/resources/...` 런타임 이미지 경로 경고와 대용량 JS 경고가 남아 있으나 빌드는 성공했다.

## 운영 상태

- Cloudflare Pages `main` 브랜치 배포는 완료됐다.
- 배포 직후 `cubici.co.kr`가 이전 CSS asset hash를 반환하는 구간이 있어, 운영 도메인 전파 상태를 별도로 확인했다. 최신 Pages 배포본에서는 수정 결과를 확인했다.
- backend/API는 이번 메인 UI 교체 범위에서 변경하지 않았다.
