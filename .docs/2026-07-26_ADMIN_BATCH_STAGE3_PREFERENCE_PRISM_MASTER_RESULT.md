# 관리자단 3단계 환경설정/Prism/Master 일괄작업 결과

## 범위

- 협력사 master 담당자 정합성 표시
- 머니뱅크 금융상품 master 적재/조건 정합성 표시
- 관리자 계정 권한범위/audit 상태 표시
- Prism 설정값 미완성 상태 표시
- RawData 공식 연결 상태 표시

제외:

- 실제 권한 middleware/접근제어 엔진
- 금융상품 master seed 데이터 임의 생성
- Prism 산식 재산출 또는 Alt_CSM score 실연동
- RawData 공식 자동 검증/계산 실행

## 작업 결과

### 협력사

- 협력사 목록 counts에 `missing_manager_count`를 추가했다.
- 행별 `manager_status_label`을 추가해 담당자 미지정/등록 상태를 표시했다.

### 금융상품

- 금융상품 counts에 `partner_count`, `preference_count`, `incomplete_count`, `master_status_label`을 추가했다.
- 행별 `master_status_label`을 추가해 상품조건 등록/수수료 조건 확인/실행금액 조건 확인 등을 표시했다.
- 현재 DB는 `moneybank_partner=0`, `moneybank_product_preference=0`이므로 `미적재` 상태로 분류한다.

### 관리자 계정

- `permission_scope_label`을 추가해 `권한1/권한2/승인대기`의 운영 범위를 표시했다.
- `audit_status_label`을 추가해 승인대기/승인이력/수정이력 상태를 표시했다.

### Prism/RawData

- Prism 항목별 `config_status_label`을 추가했다.
- Prism counts에 `incomplete_count`를 추가했다.
- RawData 공식별 `formula_status_label`을 추가했다.

## 변경 파일

| 파일 | 내용 |
| --- | --- |
| `service-api/src/cubici_service/preferences/repository.py` | master/audit/config 상태 필드 추가 |
| `admin-web/src/pages/PartnerManagementPage.jsx` | 담당자 미지정 수/담당상태 표시 |
| `admin-web/src/pages/MoneybankProductPreferencePage.jsx` | 금융상품 master 적재/조건상태 표시 |
| `admin-web/src/pages/AdminAccountManagementPage.jsx` | 권한범위/audit 상태 표시 |
| `admin-web/src/pages/PrizmConfigPage.jsx` | Prism 미완성 수/설정상태 표시 |
| `admin-web/src/pages/RawDataConfigPage.jsx` | RawData 공식 상태 표시 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| backend domain route focused test | 통과: 69 passed |
| 실제 PostgreSQL API 조회 | 통과: preferences 6개 endpoint 200 |
| admin focused Playwright E2E | 통과: 5 passed |
| admin-web production build | 통과: focused E2E runner 내 build 완료 |

실제 DB 상태:

- 협력사: 4건, 담당자 미지정 3건
- 머니뱅크 금융상품 partner: 0건
- 머니뱅크 금융상품 preference: 0건
- 관리자 계정: 0건
- Prism 항목: 26건, 미완성 26건
- RawData 공식: 0건

## 보수적 완료율 갱신

| 메뉴 | 이전 보수 완료율 | 현재 보수 완료율 | 비고 |
| --- | ---: | ---: | --- |
| 관리자 등록 | 62% | 66% | 권한/audit 상태 표시 보강, 실제 접근제어 엔진 잔여 |
| 협력사 관리 | 60% | 66% | 담당자 정합성 표시 보강 |
| 머니뱅크 상품관리 | 52% | 60% | master 미적재/조건상태 표시 보강, seed 데이터 잔여 |
| Prism System | 56% | 62% | 설정 미완성/변경이력 표시 보강 |
| RawData 설정 | 56% | 61% | 공식 연결상태 표시 보강 |

관리자단 전체 운영 재현율은 보수적으로 70~74% 수준으로 본다.

## 다음 액션

1. 통합정보 shop grouping/legacy 통계 procedure 대조
2. 서버관리/Error Log 처리 workflow 보강
3. 고객문의/공지/템플릿 후속 상태 workflow 점검
4. 잔여 작업 완료 후 관리자단 전체 E2E milestone 1회 실행
