# Cubici Footer Legacy 스타일 복원

## 변경

- footer 배경색을 legacy `#002e6e`로 복원했다.
- legacy 기준 좌측 로고, 세로 구분선, 인라인 회사 정보 배치로 정렬했다.
- 첫 번째 서비스 문구를 좌측 정렬로 고정했다.
- logo를 표시하지 않고 footer 전체 opacity를 `1`로 복원했다.
- 서비스 문구와 회사 정보행을 하나의 legacy 텍스트 영역으로 묶어 동일한 좌측 배열을 적용했다.
- footer 상·하단 padding을 `50px`에서 `32px`로 줄여 영역 높이를 약 20% 축소했다.
- footer의 `서비스 소개` 링크를 삭제했다.
- 통신판매업 신고번호를 삭제했다.
- Copyright 줄을 삭제했다.
- 대표자 정보는 캡처 기준에 맞춰 표시하지 않는다.

## 검증

- `user-web` production build: 통과
- Cloudflare 정적 번들 build: 통과
- 최신 Cloudflare Pages production deployment: 완료
- Preview URL: `https://0fb58f46.cubici.pages.dev`
- Preview에서 새 회사 정보, legacy 색상, 삭제 항목 부재 확인: 통과
- Preview computed style에서 logo 숨김, opacity `1`, 텍스트 영역 좌측 여백 `90px` 확인
- footer 높이 축소 후 preview HTTP 200 및 `padding: 32px 0` 반영 확인

## 운영 도메인 상태

- `cubici.co.kr`은 현재 이전 JS asset을 반환하고 있다.
- Cloudflare Pages 최신 deployment 자체는 `Production/main`으로 생성됐다.
- Cloudflare Dashboard가 현재 Chrome에서 로그인 화면이므로, custom domain 연결/배포 대상 확인은 로그인 후 마무리해야 한다.
- backend, Docker, DB는 수정하지 않았다.
