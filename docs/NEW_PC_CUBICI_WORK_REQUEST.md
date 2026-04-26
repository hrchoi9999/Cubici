# Cubici 새 PC 작업요청서

## 1. 작업 목적

Cubici 프로젝트의 1차 목표는 기존 Java 운영 서비스를 즉시 외부 공개하는 것이 아니라, 투자자와 외부 관계자에게 서비스를 안전하게 소개할 수 있는 웹사이트와 데이터 분석 데모를 구축하는 것이다.

이번 단계의 목표는 다음 두 가지다.

1. `cubici.co.kr`에 공개할 서비스 소개 사이트 구축
2. 기존 DB 일부 데이터와 가상 거래 데이터를 활용한 관리자 데모 대시보드 및 투자자용 분석 자료 구축

기존 Java/Tomcat 시스템은 운영 서버로 바로 공개하지 않고, 화면 구조와 업무 로직을 참고하는 `legacy` 자료로 활용한다.

## 2. 현재 새 PC 상태

새 PC에는 다음 작업이 완료된 것으로 전제한다.

- Windows 11 설치
- `C:\Cubici` 폴더에 기존 Cubici 프로그램/소스 복사 완료
- VS Code 설치 완료
- Python 64bit 설치 완료

주의: 설치된 Python 버전이 `Python 3.13.13 64bit`라고 전달되었으나, 실제 설치 버전과 경로를 먼저 확인해야 한다. 기존 계획은 `Python 3.10.11 64bit` 기준이었으므로, 라이브러리 호환성 문제가 생기면 Python 3.10.11 64bit를 추가 설치한다.

확인 명령:

```powershell
python --version
python -c "import sys, platform; print(sys.executable); print(platform.architecture()[0])"
```

## 3. 권장 개발 방향

이번 단계에서는 다음 구조를 기본안으로 한다.

```text
C:\Cubici
  ├─ legacy-java
  ├─ website
  ├─ analysis
  ├─ data_sample
  ├─ reports
  └─ docs
```

각 폴더의 역할:

- `legacy-java`: 기존 Java/Spring/JSP/Tomcat 소스 보관 및 참고
- `website`: `cubici.co.kr` 공개용 소개 사이트와 데모 관리자 대시보드
- `analysis`: Python 데이터 분석, 가상 거래 데이터 생성, 리스크 스코어링 코드
- `data_sample`: 익명화된 샘플 데이터와 가상 거래 데이터
- `reports`: 투자자용 PDF, Excel, 차트 이미지, HTML 리포트 산출물
- `docs`: 개발환경, 배포, 데이터 정의, 작업 메모 문서

## 4. 우선 설치할 도구

필수:

- Git
- Node.js LTS
- VS Code
- Python 64bit
- MySQL 8
- DBeaver 또는 MySQL Workbench

권장:

- JDK 13
- Maven
- Tomcat 9

선택:

- Docker Desktop

이번 1차 목표에서는 Docker는 필수가 아니다. 기존 PC에서 Docker가 정상 작동하지 않았으므로 새 PC에서도 Docker는 나중에 안정화 단계에서 검토한다.

## 5. GitHub 운영 원칙

GitHub 저장소는 반드시 Private Repository로 시작한다.

GitHub에 올리면 안 되는 자료:

- 실제 DB 백업 파일
- 운영/개발 DB 접속정보
- 외부 API 계정정보
- 문자/SMS/결제 계정정보
- 관리자 계정정보
- 실사용자 개인정보
- 사업상 민감한 원본 데이터

특히 기존 소스에 포함된 아래 유형의 파일은 커밋 전에 분리하거나 삭제해야 한다.

```text
참고자료.txt
backup_*.sql
*.sql
src/main/resources/egovframework/globals.properties
src/main/resources/egovframework/mailsmsweb.properties
```

샘플 설정 파일만 커밋한다.

예:

```text
globals.properties.example
.env.example
```

## 6. 1차 작업 순서

### 6.1 원본 보존

현재 `C:\Cubici`에 복사된 기존 소스를 먼저 백업한다.

권장:

```text
C:\Cubici_original_backup
```

그 후 작업용 `C:\Cubici` 안에서 폴더 구조를 정리한다.

### 6.2 기존 Java 소스 정리

기존 Java 프로젝트는 `legacy-java`로 이동하거나 복사한다.

목적:

- 기존 관리자 메뉴 구조 확인
- JSP 화면 구성 참고
- DB 테이블/Mapper 구조 확인
- 필요한 화면 캡처
- 서비스 업무 흐름 파악

이번 단계에서는 기존 Java 관리자 페이지를 외부에 직접 공개하지 않는다.

### 6.3 Python 분석환경 구성

Python 가상환경을 만든다.

Python 3.10.11 64bit를 사용할 경우:

```powershell
C:\Python310_64\python.exe -m venv C:\Cubici\.venv310
C:\Cubici\.venv310\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

현재 설치된 Python을 그대로 사용할 경우:

```powershell
python -m venv C:\Cubici\.venv
C:\Cubici\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

분석 패키지:

```powershell
pip install pandas numpy matplotlib plotly scikit-learn jupyterlab openpyxl sqlalchemy pymysql
```

### 6.4 로컬 DB 준비

MySQL 8을 설치하고 기존 DB 백업을 로컬 개발 DB로 복원한다.

주의:

- 운영 DB와 절대 연결하지 않는다.
- 복원 후 개인정보와 민감정보를 익명화한다.
- 투자자 데모에 사용할 데이터는 `data_sample`에 별도로 추출한다.

### 6.5 가상 거래 데이터 생성

Python으로 다음 유형의 샘플 데이터를 만든다.

- 업체 정보
- 판매 채널
- 주문/거래 내역
- 정산 예정금
- 취소/반품
- 선지급 신청
- 상환 내역
- 연체/지연 상환
- 업체별 리스크 스코어

이 데이터는 실제 개인정보 없이 투자자에게 보여줄 수 있어야 한다.

### 6.6 분석 리포트 작성

분석 결과물은 다음 형태로 생성한다.

- 투자자용 PDF 리포트
- Excel 상세 데이터
- 웹사이트 삽입용 차트 이미지 또는 JSON
- 관리자 데모 대시보드용 샘플 데이터

핵심 분석 주제:

- 매출 안정성
- 채널 분산도
- 정산 예정금 기반 회수 가능성
- 반품/취소율
- 상환 지연 위험
- 업체별 리스크 등급
- 선지급 한도 산정 예시

### 6.7 공개 웹사이트 구축

`website` 폴더에 소개 사이트를 구축한다.

추천 기술:

- Vite
- React
- TypeScript 선택 가능
- 정적 JSON 기반 데모 데이터
- 차트는 Plotly, Recharts, ECharts 중 선택

사이트 구성:

- 메인 소개
- 서비스 문제 정의
- Cubici 솔루션
- 수집 데이터 항목
- 신용평가/리스크 관리 방식
- 관리자 데모 대시보드
- 투자자용 분석 데모
- 문의/연락처

### 6.8 관리자 데모 대시보드

기존 관리자 페이지를 외부에 직접 공개하지 않고, 정적 사이트 안에 데모 관리자 화면을 구현한다.

구성 예:

- 데모 로그인 화면
- 관리자 대시보드
- 업체 관리
- 거래내역 관리
- 정산 예정금 관리
- 선지급 신청 관리
- 상환 현황
- 연체/위험 알림
- 업체별 리스크 스코어
- 투자자 리포트

원칙:

- 실제 DB 저장 없음
- 결제 없음
- SMS 없음
- 외부 쇼핑몰 API 호출 없음
- 관리자 기능은 읽기 전용 또는 데모 동작만 제공

## 7. 배포 방향

1차 공개는 정적 사이트 배포로 진행한다.

추천:

- Cloudflare Pages
- GitHub Pages
- Netlify

도메인:

- `cubici.co.kr`: 공개 소개 사이트
- `demo.cubici.co.kr`: 관리자 데모 대시보드 또는 데모 섹션

운영 서버, Tomcat, Cloud SQL, GCP Cloud Run은 이번 1차 목표에서는 필수가 아니다.

## 8. 주요 위험요인

가장 중요한 위험은 민감정보 노출이다.

반드시 점검할 항목:

- DB 계정/비밀번호
- 외부 API 키
- 결제 계정
- 문자/SMS 계정
- 관리자 계정
- 실사용자 개인정보
- 실제 거래처/업체 식별정보

기존 Java 시스템을 그대로 외부 공개하지 않는 이유:

- 관리자 기능 노출 위험
- DB 개인정보 노출 위험
- 외부 API 오작동 가능성
- 구버전 Spring/JSP 보안 점검 필요
- 파일 업로드 취약점 가능성
- 운영 서버 관리 부담

## 9. 완료 기준

1차 완료 기준:

- `C:\Cubici` 폴더 구조 정리
- GitHub Private Repository 생성
- 민감정보가 제외된 상태로 초기 커밋 완료
- Python 분석환경 구성 완료
- 샘플/가상 데이터 생성 완료
- 투자자용 분석 리포트 초안 생성
- `website` 소개 사이트 초안 실행 가능
- 관리자 데모 대시보드 초안 실행 가능

최종 1차 공개 기준:

- `cubici.co.kr`에서 소개 사이트 접속 가능
- 데모 관리자 화면에서 샘플 거래/정산/상환/리스크 데이터 확인 가능
- 투자자용 PDF 또는 Excel 리포트 제공 가능
- 실제 운영 DB, 결제, SMS, 외부 API와 분리 완료

## 10. 다음 작업 요청

새 PC에서 이 문서를 기준으로 다음 작업을 시작한다.

1. `C:\Cubici` 현재 파일 구조 확인
2. 민감정보 포함 파일 식별
3. 새 폴더 구조로 프로젝트 재배치
4. `.gitignore` 작성
5. Python 가상환경 생성
6. `website` 프로젝트 생성
7. `analysis` 프로젝트 생성
8. 샘플 데이터 설계
9. 관리자 데모 화면 설계
10. GitHub Private Repository 초기화

