# M4 관리자 최종 복원 감사

## 결론

- 관리자 직접 메뉴 24개는 PC·모바일 사용자 승인을 완료했다.
- 상세·파생 화면 10개는 React route와 기능 회귀 근거가 모두 있다.
- 상세·파생 화면 중 3개는 엄격한 최종 승인 이미지가 없으므로 화면 복원 완료로 처리하지 않는다.
- 전체 관리자 React 화면 복원율은 34개 가중 평균 98.2%다.
- 기능 구현은 직접 메뉴 평균 84.5%, 상세·파생 포함 보수적 평균 83.5%다.

## 화면 수 기준

| 기준 | 수량 | 설명 |
|---|---:|---|
| legacy 좌측 메뉴 | 21 | legacy 메뉴 구조 기준 |
| React 직접 메뉴 | 24 | 현재 관리자 주 화면 기준 |
| React 상세·파생 화면 | 10 | 탭, 상세, 설정 파생 route |
| React 전체 화면 | 34 | 직접 메뉴와 상세·파생 합계 |
| legacy 관리자 JSP 물리 파일 | 72 | `D:/Cubici` 관리자 JSP 전체 |
| legacy 감사 대상 JSP | 61 | 공통 4개, 빈 shell 1개, Excel test 1개, 은행·인증 test 5개 제외 |

JSP 물리 파일 수와 React 화면 수는 일대일 대응하지 않는다. legacy 상세, modal, 상태 JSP는 React 화면 내부 상태 또는 modal로 통합됐다.

## A01·A03 정정

초기 Batch 2의 복원율이 후속 전용 복원 결과에 갱신되지 않은 기록 불일치를 확인했다.

| 진행표 ID | 실제 화면 | 이전 복원율 | 확정 복원율 | 근거 |
|---|---|---:|---:|---|
| A01 | 통합정보/큐빅아이 | 86% | 100% | ADM-LV-02 PC·모바일 승인본, 실제 DB E2E, 그래프 canvas 검증 |
| A03 | 회원관리/회원현황 | 92% | 100% | ADM-LV-01 PC·모바일 승인본, 실제 DB E2E, 그래프 canvas 검증 |

두 화면의 후보본과 승인본 SHA-256은 PC·모바일 각각 일치했다. 산식 잔여가 있으므로 기능 구현율은 이번 감사에서 올리지 않았다.

## 상세·파생 10개

| ID | Route | 화면 근거 | 화면 복원율 | 기능 구현율 | 판정 |
|---|---|---|---:|---:|---|
| D01 | `/admin/cubici/manageMember/member_tab2` | D01 PC·모바일 승인본 | 100% | 78% | 복원 승인 완료 |
| D02 | `/admin/cubici/manageMember/member_tab3` | D02 PC·모바일 승인본 | 100% | 78% | 복원 승인 완료 |
| D03 | `/admin/cubici/manageMember/payment_tab2` | legacy JSP, React, focused E2E | 80% | 80% | 최종 승인 이미지 필요 |
| D04 | `/admin/cubici/manageMember/userstatus` | `member_status.jsp`, React, focused E2E | 80% | 78% | 최종 승인 이미지 필요 |
| D05 | `/admin/moneybank/management/usageDetail` | ADM-LV-24 PC·모바일 승인본 | 100% | 88% | 복원 승인 완료 |
| D06 | `/admin/cubici/supportMember/manageEmail` | ADM-LV-13 이메일 승인본 | 100% | 88% | 복원 승인 완료 |
| D07 | `/admin/cubici/supportMember/manageBoard_tab2` | ADM-LV-14 FAQ PC·모바일 승인본 | 100% | 86% | 복원 승인 완료 |
| D08 | `/admin/cubici/adminPreference/manageMoneybank_tab1` | 환경설정 Batch 승인 기록 | 100% | 85% | 복원 승인 완료 |
| D09 | `/admin/cubici/adminPreference/manageMoneybank_tab2` | 환경설정 Batch 승인 기록 | 100% | 85% | 복원 승인 완료 |
| D10 | `/admin/cubici/adminPreference/prizmRawData` | legacy JSP, React, focused E2E | 80% | 65% | 최종 승인 이미지, Excel·산식 잔여 |

## 검증

| 항목 | 결과 |
|---|---|
| 관리자 production build | 통과, 75 modules, 5.02초 |
| 현재 App route 정적 매핑 | 34/34 |
| 직접 메뉴 최신 회귀 근거 | 24/24 통과 |
| 상세·파생 조회/focused 회귀 근거 | 10/10 통과 |
| 운영 배포 source | route 보완과 Prism UI/API 포함 |
| A01·A03 후보/승인 이미지 hash | PC·모바일 4쌍 모두 일치 |

## 남은 복원 Batch

엄격한 페이지 단위 승인 순서는 다음과 같다.

1. D03 요금변경 관리
2. D04 회원상세
3. D10 Prism RawData

위 3개 승인 후 관리자 34개 화면의 UI 복원 작업을 종료한다. DB CRUD, legacy 산식 검산, Excel, 외부 연동은 기능 작업으로 별도 관리한다.
