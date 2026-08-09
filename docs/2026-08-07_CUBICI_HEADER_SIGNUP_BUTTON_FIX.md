# Header 회원가입 버튼 복구

## 원인

React Header의 비로그인 분기에서 `로그인`만 렌더링하고 `회원가입` 링크를 누락했다. CSS나 인증 API 문제는 아니다.

## 변경

- 데스크톱 상단 로그인 오른쪽에 `회원가입` 링크 복구
- 이동 경로: `/mainSignUp`
- 기존 Header 글꼴, 간격, 구분선 스타일 유지

## 검증

- `user-web` Vite production build 성공
- Cloudflare 정적 번들 생성 성공
- Cloudflare Pages 배포 성공: `https://acf13501.cubici.pages.dev`
- 배포 미리보기 HTTP 200 확인
- 최신 JS 번들에서 `회원가입` 및 `/mainSignUp` 포함 확인
