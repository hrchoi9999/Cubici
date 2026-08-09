# Cubici Footer 회사 정보 수정 및 배포

## 변경

- 메인 footer 상단 메시지: `AI 기반의 공급망 금융 서비스 큐빅아이`
- 회사명: `(주)한국공급망데이터`
- 이메일: `admin@koreascf.com`
- 사업자 등록번호: `412-87-03180`
- 본사 주소: `서울시 강동구 올림픽로 752, 5층`
- 대표전화와 footer 디자인/레이아웃은 유지했다.

## 검증

- `user-web` production build: 통과
- Cloudflare 정적 번들 build: 통과
- Cloudflare 배포: 완료
- 배포 preview: `https://c0851108.cubici.pages.dev`
- `cubici.co.kr`: HTTP 200 및 cache-busting 요청으로 새 footer 문자열 확인
- backend, Docker, DB는 수정하지 않았다.

## 참고

- 기본 운영 도메인 요청은 Cloudflare 캐시 상태에 따라 이전 HTML을 잠시 반환할 수 있다.
- 브라우저에서 이전 내용이 보이면 강력 새로고침 또는 캐시가 갱신된 후 다시 확인한다.
