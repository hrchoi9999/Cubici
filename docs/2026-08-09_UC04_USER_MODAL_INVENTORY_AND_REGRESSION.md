# UC04 사용자 Modal 목록 및 회귀 결과

기준일: 2026-08-09

## 기준 자료

- LV 원본: `240130_큐빅아이/modal_view.html`, `static/css/modal.css`
- 보존 사본: `docs/reference/lv-ui/work/USR-COMMON-MODAL/source/`
- API 모달 기준: `USR-MYPAGE-API-PC/reference/lv-reference-rendered.png`
- Backend, DB schema, API contract 변경 없음

## 현재 React 활성 모달 3종

| 유형 | Route | 상태 |
|---|---|---|
| 일일 정산 표 | `/cubici/calculateInfo/calendar` | LV 공통 shell 적용, PC/모바일 후보 작성 |
| 정산 상세 | `/cubici/calculateInfo/details` | LV 공통 shell 적용, PC 후보 작성 |
| API 인증 폼 | `/cubici/mypage/businessInfo`, `/cubici/mypage/myAuth` | 기존 PC/모바일 승인 디자인 유지 |

공통 동작은 닫기 버튼, `Esc`, backdrop 클릭, 최초 닫기 버튼 focus, 내부 overflow로 통일했다.

## LV modal_view 16종 분류

| ID | LV 모달 | 현재 처리 | 잔여 |
|---|---|---|---|
| All-sv | 전체서비스 해지 | 해지 화면의 inline 상태로 일부 대체 | 잔액·전체해지 정책/API 확정 |
| Ut-sv | 이용서비스 해지 | inline 해지신청으로 일부 대체 | 서비스별 해지 API |
| Cancel-sv | 서비스 해지 | inline 해지신청으로 일부 대체 | 사유·일자 저장 정책 |
| CancelN | 서비스 해지불가 | 안내문으로 일부 대체 | 차단 사유 API |
| Directly | 직접 상환 | 미구현 | 사용자 직접 상환 API |
| Once | 전액 일시상환 | 미구현 | 전액상환 산식/API |
| Detail | 상세 상환내역 | 현황 표로 일부 대체 | modal 상세 데이터 계약 |
| Limit | 이용한도 조정 | 미구현 | 한도 조정 신청 API |
| Evaluate | 회원평가 | 검토·심사 페이지로 대체 | modal 불필요 여부 확정 |
| ShopCh | 등록 쇼핑몰 변경 | 마이페이지 inline CRUD로 대체 | 별도 modal 불필요 여부 확정 |
| FreeEnd | 무료기간 종료 | 미구현 | 요금제 전환 정책 |
| EndOfUse | 서비스 이용 종료 | 미구현 | 결제 연계 정책 |
| ServiceEnd | 서비스 종료 | 미구현 | 미결제·휴면 정책 |
| Revisit | 재방문 혜택 | 미구현 | 프로모션 정책 |
| IdFind | 아이디 찾기 | 독립 React 페이지로 대체 | 본인인증 API |
| PwFind | 비밀번호 찾기 | 독립 React 페이지로 대체 | 본인인증·재설정 API |

16종은 공통 UI 누락과 업무 기능 미구현을 혼동하지 않도록 페이지별 기능 잔여 작업으로 관리한다.

## 검증

- production build: 통과, 2.88초
- UC04 정산 모달 focused regression: 2/2 통과, 3.4초
- API 모달 저장 payload regression: 1/1 통과, 3.3초
- API 모달 모바일/`Esc` regression: 1/1 통과, 3.7초
- 원본 정적 캡처 테스트는 `4311` source server 미기동으로 제외하고 기존 보존 reference를 사용

## 승인 이미지

- `docs/reference/lv-ui/work/USR-COMMON-MODAL-TABLE-PC/approved/approved-react.png`
- `docs/reference/lv-ui/work/USR-COMMON-MODAL-DETAIL-PC/approved/approved-react.png`
- `docs/reference/lv-ui/work/USR-COMMON-MODAL-TABLE-MOBILE/approved/approved-react.png`
- API 모달은 기존 PC/모바일 승인 이미지 유지

## 진행률

- UC04 화면 복원율: 100% (사용자 승인 완료)
- UC04 공통 기능 구현율: 90%
- LV 16종 업무 기능은 각 페이지/API 잔여 작업으로 별도 관리
- 사용자 직접 화면 승인: 26/26
- 공통 UI 완료: 4/4

## 다음 단일 Batch

- 사용자 화면 전체 회귀검증 준비
