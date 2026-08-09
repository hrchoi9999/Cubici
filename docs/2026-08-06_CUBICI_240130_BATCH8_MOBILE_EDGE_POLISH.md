# Cubici 240130 Final UI Migration - Batch 8

## 범위

- 사용자 페이지 final UI의 상단 탭 표시 보정.
- 모바일 390px 기준 고객지원, 요금안내, 마이페이지, 머니뱅크 상세 화면의 overflow 보정.
- 긴 요금코드, 긴 요금명, 긴 사업자명, 긴 계약번호, 긴 게시글 제목/본문 대응.
- 기본 route smoke와 장문 데이터 edge smoke 분리.

## 변경 파일

- `user-web/src/styles/final-ui-foundation.css`
- `user-web/tests/e2e/batch8-final-ui-edge-smoke.spec.js`

## 주요 변경

- `.react-final-tabs`를 flex 기반으로 재정의해 탭 텍스트가 붙어 보이는 문제를 수정했다.
- 모바일에서는 탭을 가로 스크롤 가능한 구조로 유지해 6개 이상 탭도 화면을 밀지 않게 했다.
- `final-core-page` 하위 input/select/textarea에 `max-width: 100%`, readonly input 말줄임 처리를 추가했다.
- 표 셀, 카드, 지원 게시글 제목/요약, 약관 본문에 긴 문자열 줄바꿈/말줄임 방어를 추가했다.
- 주요 버튼에 최소 터치 높이를 적용했다.

## 검증

- `vite build`: 통과.
- Batch 7 기본 focused smoke: 17개 통과.
- Batch 8 장문 데이터 edge smoke: 2개 통과.
  - desktop 탭 간격/장문 데이터 fit 확인.
  - mobile 390px에서 6개 대표 route overflow 없음 확인.
- 산출물: `docs/batch8_mobile_edge_smoke/`

## 확인한 이슈와 조치

- 최초 Batch 8 edge smoke에서 `/chargeInfo` 모바일 화면이 긴 요금코드 input 때문에 `scrollWidth 516px`로 실패했다.
- readonly input에 `text-overflow: ellipsis`, `max-width: 100%`, `box-sizing: border-box`를 적용해 재검증 통과했다.

## 잔여 리스크

- 실제 운영 DB/API의 모든 긴 데이터 조합을 검증한 것은 아니다.
- 모바일 실기기 터치/브라우저별 렌더링은 별도 확인 필요.
- 관리자 화면 final UI, 운영 배포, 전체 회귀검증, legacy 산식 검산은 아직 남아 있다.

## 진행률

- 사용자 페이지 final UI 복원: 약 71%.
- 전체 프로젝트 기준 보수 진행률: 약 52%.
- 다음 단계: Batch 9에서 사용자 페이지 배포 후보 회귀검증 범위를 정리하고, 관리자 화면 final UI 반영 착수 전 남은 사용자 화면 결함을 정리하는 것이 적절하다.
