# Cubici 관리자 신청 접수 상세 모드 분리 기록

## 작업 결과

- 신청 접수 목록의 `신청상태`, `서류`, `Prism Score` 클릭 동작을 분리했다.
- 기존에는 `신청상태`만 상세 조회를 열고 `서류`, `Prism Score`는 실질 동작이 없었다.
- 신규 React 화면에서는 동일 계약 상세 API를 사용하되, 클릭한 버튼에 따라 서로 다른 상세 섹션만 표시한다.

## 상세 모드

- `status`
  - `신청상태` 버튼 클릭
  - 회원정보, 신청/계약 주요 일자, 상환 요약 표시
- `documents`
  - `서류` 버튼 클릭
  - 신용정보 입력, 서류 확인, 파일 업로드/다운로드, 안내 전화/심사 메모 표시
- `score`
  - `Prism Score` 버튼 클릭
  - PCS/PMS 평가 결과와 주요 산출 feature 표시

## 변경 파일

- `Cubici/admin-web/src/pages/AdminDashboardPage.jsx`

## 검증 여부

- `D:\Alt_CSM\.venv\Scripts\python.exe -m pytest D:\Alt_CSM\Cubici\service-api\tests`
  - 17 passed
- `D:\Alt_CSM\.tools\node-v22.13.1-win-x64\npm.cmd run build`
  - Vite production build 성공
- 코드 확인
  - `신청상태` 클릭: `openDetail(row.id, 'status')`
  - `서류` 클릭: `openDetail(row.id, 'documents')`
  - `Prism Score` 클릭: `openDetail(row.id, 'score')`

## 다음 액션

- 계약 승인/상태 변경 API migration
- 상태 상세 화면에 승인/반려/취소 등 legacy 상태 전이 버튼 연결
- legacy 암호화 파일(`enc_type = 'Y'`) 복호화 방식 migration 여부 결정
