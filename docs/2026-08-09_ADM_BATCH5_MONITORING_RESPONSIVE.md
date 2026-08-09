# Cubici ADM Batch 5 - 모니터링 3개 화면

## 작업 범위

| ID | 화면 | Route | LV 직접 기준 |
|---|---|---|---|
| ADM-06A | Error Log | `/admin/cubici/adminMonitor/error_report` | `관리자화면09.png`, `error_report.jsp` |
| ADM-06B | 서버 관리 | `/admin/cubici/adminMonitor/server_monitor` | 직접 캡처 없음, 승인된 관리자 공통 UI 기준 |
| ADM-06C | 펌뱅킹 전문 | `/admin/cubici/adminMonitor/fintech_trade` | 직접 캡처 없음, 승인된 관리자 공통 UI 기준 |

## 구현 내용

- subvisual 및 좌측 메뉴와 중복되던 본문 제목/모니터링 탭 제거
- 검색 영역, 목록 표, 상태 표시, 공통 pagination을 ADM Batch 4 승인 스타일로 통일
- `이전/다음`은 `#9fb2cf`, 현재 페이지는 `#002e6e`, 높이 차이 1px 이하 유지
- Error Log 목록을 LV 기준 핵심 6개 컬럼으로 정리하고 처리/실행 정보는 선택 상세에 유지
- 서버 상태 카드와 점검 기준 표를 PC 4열, 모바일 1열 및 내부 표 스크롤로 반응형 구성
- 펌뱅킹 MOCK 입력과 parser 상세는 초기 화면에서 숨기고 사용자 동작 시 표시
- 기존 API 목록/검색/범위 변경/상세 호출은 유지, Backend 소스는 변경하지 않음

## 후보 이미지

경로: `docs/reference/lv-ui/admin/ADM-BATCH5-MONITORING/candidate`

- `ADM-06A-ERROR-LOG-PC.png`, `ADM-06A-ERROR-LOG-MOBILE.png`
- `ADM-06B-SERVER-PC.png`, `ADM-06B-SERVER-MOBILE.png`
- `ADM-06C-FINTECH-PC.png`, `ADM-06C-FINTECH-MOBILE.png`

## 검증

| 검증 | 결과 |
|---|---|
| ADM Batch 5 Playwright focused | 3/3 통과, 5.7초 |
| 기존 Error Log/서버 관리 회귀 | 2/2 통과, 3.7초 |
| Backend route/auth pytest | 76/76 통과, 2.37초 |
| PC/mobile body overflow | 세 화면 모두 1px 이하 |
| pagination 색상/높이 | Error Log·펌뱅킹 전문 통과 |
| production build | 73 modules 통과, JS chunk 559.44kB 경고만 존재 |

## 보수적 진행률

| 화면 | 화면 복원율 | 기능 구현율 | 주요 잔여 |
|---|---:|---:|---|
| ADM-06A Error Log | 100% | 70% | 화면 승인 완료, 운영 로그 DB 검증 |
| ADM-06B 서버 관리 | 100% | 60% | 화면 승인 완료, 외부 OS/server metric 연동 |
| ADM-06C 펌뱅킹 전문 | 100% | 68% | 화면 승인 완료, 실송금 차단 유지, DB MOCK 저장 E2E |

사용자 승인에 따라 Batch 5 화면 복원율은 100%로 확정했다. 내부 기능 구현률은 66%로 유지한다. 외부 서버 metric과 실제 은행 송금은 추가개발/외부연동 범위로 분리한다.

## 상태

- 관리자 직접 메뉴 최종 승인: 24/24
- 관리자 직접 메뉴 후보 검증: 24/24
- 사용자 화면 승인: 2026-08-09 완료
- Git staging/commit/push 및 운영 배포: 수행하지 않음
- 다음 batch: 사용자 승인 후 환경설정 6개 직접 메뉴
