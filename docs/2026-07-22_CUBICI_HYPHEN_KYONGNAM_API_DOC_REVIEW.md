# Cubici Hyphen/Kyongnam Bank API Document Review

## 확인 범위

- 사용자 지정 외부 문서 폴더:
  - `D:\01 업무파일\00 Cubici DeV\01 Site Plan\02 Hellopay\99 경남은행 API연동`
- 확인 목적:
  - legacy 개발 당시 적용한 Hyphen/경남은행 입출금 API 문서를 Python migration에 적용할 수 있는지 판단

## 확인된 주요 자료

- `실시간 출금대행\하이픈 자금이체대행 전문 V1.0.5.docx`
- `실시간 출금대행\RFB_1.3(실시간 펌뱅킹 최신버전).zip`
- `하이픈 지급대행 서비스 출금대행_송금대행 전문 전달\RFB_1.3(송금대행 전문).zip`
- `하이픈 지급대행 서비스 출금대행_송금대행 전문 전달\src\FirmBypassDB.java`
- `하이픈 지급대행 서비스 출금대행_송금대행 전문 전달\conf\config.ini`
- 자동이체 동의서, 계좌개설 자료, 통신모듈 설치 매뉴얼

## 핵심 확인 내용

- 해당 자료는 단순 공개 REST API 문서가 아니라 Hyphen/KSNET 계열 실시간 펌뱅킹 전문 연동 자료다.
- `하이픈 자금이체대행 전문 V1.0.5.docx`에는 300 byte 전문 기반 업무가 정리되어 있다.
  - 송금이체/지급이체
  - 처리 결과 조회
  - 잔액 조회
  - 계좌/예금주 조회
  - 가상계좌 발급/조회/해지/수정
  - 가상계좌 입금통지
- 샘플 모듈 설정에서 `TRADE_REQUEST_BIN` 테이블 사용이 확인된다.
- 샘플 Java는 DB에서 미전송 전문을 조회하고, socket 통신 후 응답 전문을 다시 DB에 갱신하는 구조다.
  - 조회 기준: `SEND_FLAG = 'N'`
  - 전송 후: `SEND_FLAG = 'Y'`, `SEND_DATE`, `SEND_TIME` 갱신
  - 응답 후: `RECV_FLAG`, `RECV_DATE`, `RECV_TIME`, `RECV_MSG` 갱신
- 이는 현재 legacy DB의 `TRADE_REQUEST_BIN`, `firm_request_bin`, `trade_result_inquiry` 구조와 직접 연결된다.

## 적용 판단

신규 Python migration에서는 공개 Hyphen API 문서보다 이 내부 개발 당시 문서를 우선 기준으로 삼는 것이 맞다.

사유:

- 실제 Cubici 운영 테스트 당시 사용한 자료일 가능성이 높다.
- legacy DB 테이블 구조와 문서/샘플 모듈의 테이블명이 직접 일치한다.
- 현재 Java 웹 소스에 `/fintech/api/*` controller가 누락되어 있어도, 입출금 실행부는 별도 펌뱅킹 통신모듈과 DB 전문 테이블 조합으로 동작했을 가능성이 높다.
- 공개 문서는 인증/일반 API 확인에는 유용하지만, Cubici의 실제 입출금 재현에는 전문 레이아웃과 DB polling 구조가 더 중요하다.

## Migration 구현 방향

1. `TRADE_REQUEST_BIN` 기반 전문 요청/응답 lifecycle을 Python 서비스로 재구현한다.
2. 송금/지급, 결과조회, 잔액조회, 계좌조회 업무 코드를 우선 inventory한다.
3. 300 byte 전문 layout builder/parser를 Python 모듈로 분리한다.
4. 실제 통신은 개발 단계에서 mock/sandbox adapter로 시작한다.
5. 운영 전 Hyphen/경남은행 현재 계약 조건, IP, 포트, 인증 방식, 방화벽 정책을 재확인한다.
6. 계좌번호, 업체코드, 은행 접속정보, 키 값은 Git에 기록하지 않는다.

## 불확실한 내용

- 외부 폴더의 자료가 최종 운영 버전 전체인지 여부는 아직 확정하지 않았다.
- 현재 공개 Hyphen API와 과거 펌뱅킹 전문 방식의 계약/사용 가능 상태는 Hyphen 측 재확인이 필요하다.
- legacy Java 웹 소스에서 누락된 `/fintech/api/*` 구현은 별도 모듈, 운영 서버 전용 코드, 이전 브랜치 중 하나였을 가능성이 있다. 이는 추정이다.

## 다음 액션

- `TRADE_REQUEST_BIN` 컬럼과 전문 문서 필드를 매핑한다.
- `firm_request_bin`, `fintech_request`, `trade_result_inquiry`와의 업무 연결 관계를 정리한다.
- Python API에는 우선 관리자용 조회/테스트/mock 송금 요청 API를 만든다.
- 실송금 기능은 별도 운영 승인 플래그와 테스트 환경 검증 후 활성화한다.
