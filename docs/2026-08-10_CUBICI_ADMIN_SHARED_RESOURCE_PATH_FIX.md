# 관리자 공용 자원 경로 보완

## 운영 증상

- `/admin` 진입 후 상단 비주얼과 좌측 메뉴는 표시되지만 본문이 좌측 메뉴 아래로 밀리고 전체 배치가 무너졌다.
- 운영 응답 확인 결과 `/admin/resources/rudicks/css/style-sub.css`가 CSS가 아닌 관리자 HTML을 반환했다.
- 정상 공용 자원 경로 `/resources/rudicks/css/style-sub.css`는 CSS를 반환했다.

## 원인

- 관리자 Vite base `/admin/`이 HTML의 공용 legacy 자원 경로까지 `/admin/resources/`로 변환했다.
- Cloudflare Worker는 존재하지 않는 `/admin/resources/*` 요청을 관리자 SPA HTML로 fallback 처리했다.
- 필수 legacy CSS가 적용되지 않아 좌측 메뉴의 absolute 배치와 공통 inner 폭이 해제됐다.

## 수정

- Cloudflare bundle 생성 시 관리자 HTML의 공용 자원 경로만 `/resources/`로 정규화한다.
- Worker에 `/admin/resources/*`를 `/resources/*`로 변환하는 호환 경로를 추가한다.
- smoke에서 관리자 HTML의 잘못된 경로 부재, 공용 CSS 응답, 정적 자원 비HTML 응답을 검증한다.
