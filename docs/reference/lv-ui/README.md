# Cubici LV UI Reference

## 목적

LV 사용자/관리자 화면 복원을 페이지 단위로 진행하기 위한 이미지 기준 폴더다.

## 폴더 구조

- `user/reference/pc`: 실제 사용자 LV PC 캡처 13장
- `user/reference/mobile`: 실제 사용자 LV 모바일 캡처 4장
- `user/source-render`: 240130 HTML/CSS 원본 렌더 10장
- `user/current-react`: 기존 React Batch 출력 59장
- `admin/reference`: 관리자 LV 캡처 11장
- `work/USR-MAIN-AUTH-PC/candidate`: 로그인 사용자 메인 복원 후보 출력
- `image-manifest.csv`: 이미지 출처, 해상도, SHA-256, reference 경로

## 기준 우선순위

1. 실제 LV 화면 캡처
2. 240130 HTML/CSS/이미지 원본
3. legacy JSP/Rudicks 자료
4. 현재 React 출력

## 운영 원칙

- 원본 폴더는 수정하지 않는다.
- reference에는 개인정보, 계좌·결제정보, 계약자료, DB dump, 실제 환경설정을 넣지 않는다.
- 새 출력 이미지는 `current`가 아니라 화면별 작업 폴더의 `candidate`에 추가한다.
- 사용자 승인 후 `approved`로 분류하고 승인일을 화면 진행표에 기록한다.
- 해시가 같은 중복 이미지는 추가하지 않는다.

## 제외 자료

- `D:\Alt_CSM\Cubici\.docs\hyphen-api-docs`
- `D:\Alt_CSM\Cubici\data_local`
- `target`, `dist`, `dist-cloudflare`, `node_modules`의 중복 빌드 산출물
- 금융·결제·계좌·개인정보가 포함될 수 있는 PDF/ZIP
