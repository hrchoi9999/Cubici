<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
$(document).ready(function(){
	
	// 주소 검색
	$(document).on('click',"#addrSearch",function(){
		let pop = window.open("/addrSearch","pop","width=570,height=420, scrollbars=yes, resizable=yes");
	});
	
	// 도매업체 리스트
 	
	if(location.href != "http://localhost:8080/admin/cubici/adminPreference/manageMoneybank_tab2"){
		// 머니뱅크 수정
		$(document).on('click',"#CONFIRM", function(){
			let flag = insertMoneybankProduct("UPDATE",getParameters('gototTab2Data').FIRM_NO);
			if(flag == true){
				window.location.href = '/admin/cubici/adminPreference/manageMoneybank_tab1';
			}
		});
	} else if(location.href == "http://localhost:8080/admin/cubici/adminPreference/manageMoneybank_tab2"){
		// 머니뱅크 등록
		$(document).on('click',"#CONFIRM", function(){
			let flag = insertMoneybankProduct("INSERT","");
			if(flag == true){
				window.location.href = '/admin/cubici/adminPreference/manageMoneybank_tab1';
			} 	
		});
	}
	
	 gotoTab2(); 
	
});

// get으로 받은 URL을 필요한 데이터로 분리
 let getParameters = function (paramName){
	let returnValue;
	let url = location.href;
	let parameters = (url.slice(url.indexOf('?') + 1,url.length)).split('&');
	
	for(let i=0; i<parameters.length; i++){
		let varName = parameters[i].split('=')[0];
		if(varName.toUpperCase() == paramName.toUpperCase()){
			returnValue = JSON.parse(decodeURIComponent(parameters[i].split('=')[1]).replaceAll('+',' '));
			return returnValue;
		}
	}
}; 

// 주소 검색 응답
function jusoCallBack(roadFullAddr,roadAddrPart1,addrDetail,roadAddrPart2,engAddr, jibunAddr, zipNo, admCd, rnMgtSn, bdMgtSn,detBdNmList,bdNm,bdKdcd,siNm,sggNm,emdNm,liNm,rn,udrtYn,buldMnnm,buldSlno,mtYn,lnbrMnnm,lnbrSlno,emdNo){
	$("#FIRM_ZIP").val(zipNo);
	$("#FIRM_ADDRESS").val(roadFullAddr);
}

function insertMoneybankProduct(FLAG,FIRM_NO){
	
	// 기본 정보
	let PRODUCT_NAME = $("#PRODUCT_NAME").val(); // 상품명
	let PRODUCT_STATUS = $("#PRODUCT_STATUS option:selected").val(); // 운영상태
	let FIRM_NM = $("#FIRM_NM").val(); // 회사명
	let FIRM_ID = $("#FIRM_ID").val(); // 사업자번호
	let REP_NAME = $("#REP_NM").val(); // 대표이사
	let FIRM_ZIP = $("#FIRM_ZIP").val(); // 우편번호
	let FIRM_ADDR =$("#FIRM_ADDRESS").val(); // 상세주소
	let INPUT_DATE= formatDate($("#INPUT_DATE").val()); // 등록 일자
	let LAUNCH_DATE= formatDate($("#LAUNCH_DATE ").val()); // 시작 일자
	let EXPIRE_DATE = formatDate($("#EXPIRE_DATE").val()); // 종료 일자
	let B2B_FIRM_NM = $("#B2B_FIRM_NM").val(); // 도매업체명
	let PRODUCT_TYPE = $("#PRODUCT_TYPE").val(); // 서비스 종류
	
	// 담당 정보
	let MANAGER_NM = $("#MANAGER_NM").val(); // 책임자명
	let MANAGER_RANK = $("#MANAGER_RANK").val(); // 책임자 직급
	let MANAGER_PHONE = $("#MANAGER_PHONE").val(); // 책임자 번호
	let DEVELOPER_NM = $("#DEVELOPER_NM").val(); // 개발자명
	let DEVELOPER_RANK = $("#DEVELOPER_RANK").val(); // 개발자 직급
	let DEVELOPER_PHONE = $("#DEVELOPER_PHONE").val(); // 개발자 번호
	let CS_NM = $("#CS_NM").val(); // 고객지원 담당자 명
	let CS_RANK = $("#CS_RANK").val(); // 고객지원 담당자 직급
	let CS_PHONE = $("#CS_PHONE").val(); // 고객지원 담당자 번호
	let FIRM_TEL = $("#FIRM_TEL").val(); // 회사 전화번호
	let FIRM_FAX = $("#FIRM_FAX").val(); // 회사 팩스번호
	let FIRM_EMAIL = $("#FIRM_EMAIL").val(); // 회사 이메일
	
	// 신청 조건
	let MIN_SALES_AMOUNT = $("#MIN_SALES_AMOUNT").val(); // 최소매출
	let MIN_BUSINESS_PERIOD = $("#MIN_BUSINESS_PERIOD").val(); // 최소 사업기간
	let CREDIT_RATE = $("#CREDIT_RATE").val(); // 신용평가
	let MIN_CALC_AMOUNT = $("#MIN_CALC_AMOUNT").val(); // 최소 정산금액
	let CBCI_PERIOD = $("#CBCI_PERIOD").val(); // 큐빅아이 가입기간
	let OTHER_CONDITIONS = $("#OTHER_CONDITIONS").val(); // 기타조건
	
	// 신청 조건 - 상품 운영 조건
	let SERVICE_AMOUNT_STANDARD = $("#SERVICE_AMOUNT_STANDARD option:selected").val(); // 서비스 금액신청
	let SERVICE_AMOUNT_MIN = $("#SERVICE_AMOUNT_MIN").val(); // 최소 서비스금액
	let SERVICE_AMOUNT_MAX = $("#SERVICE_AMOUNT_MAX").val(); // 최대 서비스금액
	let AMOUNT_LIMIT = $("#SERVICE_AMOUNT_UNIT").val(); // 서비스 금액 단위
	
	let EXECUTE_AMOUNT_STANDARD = $("#EXECUTE_AMOUNT_STANDARD option:selected").val(); // 실행금액 신청
	let EXECUTE_AMOUNT_MIN = $("#EXECUTE_AMOUNT_MIN").val(); // 최소 실행금액
	let EXECUTE_AMOUNT_MAX = $("#EXECUTE_AMOUNT_MAX").val(); // 최대 실행금액
	let EXECUTE_AMOUNT_UNIT = $("#EXECUTE_AMOUNT_UNIT").val(); // 실행금액 단위
	
	let SERVICE_FEE_STANDARD = $("#SERVICE_FEE_STANDARD option:selected").val(); // 수수료산정
	let SERVICE_FEE_MIN = $("#SERVICE_FEE_MIN").val(); // 최소 수수료
	let SERVICE_FEE_MAX= $("#SERVICE_FEE_MAX").val(); // 최대 수수료
	let ANNUAL_FEE_RATE= $("#ANNUAL_FEE_RATE").val(); // 연수수료율
	
	let INTEREST_STANDARD = $("#INTEREST_STANDARD option:selected").val(); // 선취이자 산정
	let INTEREST_MIN = $("#INTEREST_MIN").val(); // 최소 선취이자율
	let INTEREST_MAX= $("#INTEREST_MAX").val(); // 최대 선취이자율
	let LIMIT_CHANGE_YN= $("#LIMIT_CHANGE_YN").val(); // 총액 한도 변경 유무
	
	let SERVICE_REPAY_PERIOD = $("#SERVICE_REPAY_PERIOD option:selected").val(); // 상환기간
	let SERVICE_REPAY_MIN = $("#SERVICE_REPAY_MIN").val(); // 최소 상환기간
	let SERVICE_REPAY_MAX = $("#SERVICE_REPAY_MAX").val(); // 최대 상환기간
	let EXTENTION_YN = $("#EXTENTION_YN option:selected").val(); // 상환연장가능
	let SERVICE_REPAY_METHOD = $("#SERVICE_REPAY_METHOD option:selected").val(); // 상환방식
	let REPAYMENT_COUNT = $("#REPAYMENT_COUNT").val(); // 상환횟수
	let REPAY_AMOUNT = $("#REPAY_AMOUNT").val(); // 회당 상환금액
	let MID_REPAY_YN= $("#MID_REPAY_YN").val(); // 중도상환 가능여부
	
	// NULL 값 확인
	// 기본정보
	
	// 숫자 체크
	let chkNum = /^[0-9]/g; // 숫자 체크 정규식
	
	// 상품명
	if (PRODUCT_NAME === null || PRODUCT_NAME === undefined || PRODUCT_NAME === "") {
		modalInfo("상품명을 입력해주세요.");
		$("#PRODUCT_NAME").focus();
		return false;
		}
	// 운영상태
	if (PRODUCT_STATUS  === null || PRODUCT_STATUS  === undefined || PRODUCT_STATUS  === "") {
		modalInfo("운영상태를 선택해주세요.");
		return false;
		}
	// 회사명
	if (FIRM_NM  === null || FIRM_NM  === undefined || FIRM_NM  === "") {
		modalInfo("회사명을 입력해주세요.");
		$("#FIRM_NM ").focus();
		return false;
		}
	// 사업자번호
	if (FIRM_ID  === null || FIRM_ID  === undefined || FIRM_ID  === "") {
		modalInfo("사업자번호를 입력해주세요.");
		$("#FIRM_ID ").focus();
		return false;
		}
	// 대표이사
	if (REP_NAME  === null || REP_NAME  === undefined || REP_NAME  === "") {
		modalInfo("대표이사명을 입력해주세요.");
		$("#REP_NM ").focus();
		return false;
		}
	
	// 주소 (우편번호)
	if (FIRM_ZIP  === null || FIRM_ZIP  === undefined || FIRM_ZIP  === "" || FIRM_ZIP.length > 5) {
		modalInfo("우편번호를 확인해주세요.");
		$("#FIRM_ZIP ").focus();
		return false;
		}
	// 주소 (상세주소)
	if (FIRM_ADDR  === null || FIRM_ADDR  === undefined || FIRM_ADDR  === "") {
		modalInfo("상세주소를 확인해주세요.");
		$("#FIRM_ADDRESS ").focus();
		return false;
		}
	// 등록 일자
	if (INPUT_DATE === null || INPUT_DATE === undefined || INPUT_DATE === "") {
		modalInfo("등록일자를 입력해주세요.");
		$("#INPUT_DATE").focus();
		return false;
		}
	// 시작 일자
	if (LAUNCH_DATE === null || LAUNCH_DATE === undefined || LAUNCH_DATE === "") {
		modalInfo("시작일자를 입력해주세요.");
		$("#LAUNCH_DATE").focus();
		return false;
		}
	// 종료 일자
	if (EXPIRE_DATE  === null || EXPIRE_DATE  === undefined || EXPIRE_DATE  === "") {
		modalInfo("종료일자를 입력해주세요.");
		$("#EXPIRE_DATE").focus();
		return false;
		}
	
	// 책임자
	if (MANAGER_NM  === null || MANAGER_NM  === undefined || MANAGER_NM  === "") {
		modalInfo("책임자명을 입력해주세요.");
		$("#MANAGER_NM ").focus();
		return false;
		}
	
	
	// 신청조건
	// 최소매출
	if (MIN_SALES_AMOUNT === null || MIN_SALES_AMOUNT === undefined || MIN_SALES_AMOUNT === "" || MIN_SALES_AMOUNT.search(chkNum) == -1) {
		modalInfo("최소매출을 입력해주세요.(숫자만 입력 가능합니다.)");
		$("#MIN_SALES_AMOUNT").focus();
		return false;
		}
	
	// 최소 사업기간
	if (MIN_BUSINESS_PERIOD  === null || MIN_BUSINESS_PERIOD  === undefined || MIN_BUSINESS_PERIOD  === "" || MIN_BUSINESS_PERIOD.search(chkNum) == -1) {
		modalInfo("최소 사업기간을 입력해주세요. (숫자만 입력 가능합니다.)");
		$("#MIN_BUSINESS_PERIOD ").focus();
		return false;
		}
	
	// 신용평가
	if (CREDIT_RATE  === null || CREDIT_RATE  === undefined || CREDIT_RATE  === "" || CREDIT_RATE.search(chkNum) == -1) {
		modalInfo("신용평가를 입력해주세요. (숫자만 입력 가능합니다.)");
		$("#CREDIT_RATE ").focus();
		return false;
		}
	
	// 최소 정산금액
	if (MIN_CALC_AMOUNT  === null || MIN_CALC_AMOUNT  === undefined || MIN_CALC_AMOUNT  === "" || MIN_CALC_AMOUNT.search(chkNum) == -1) {
		modalInfo("최소 정산금액을 입력해주세요. (숫자만 입력 가능합니다.)");
		$("#MIN_CALC_AMOUNT ").focus();
		return false;
		}
	
	// 큐빅아이 가입기간
	if (CBCI_PERIOD   === null || CBCI_PERIOD  === undefined || CBCI_PERIOD  === "" || CBCI_PERIOD.search(chkNum) == -1) {
		modalInfo("큐빅아이 가입기간을 입력해주세요. (숫자만 입력 가능합니다.)");
		$("#CBCI_PERIOD ").focus();
		return false;
		}
	
	// 기타조건
	if (OTHER_CONDITIONS  === null || OTHER_CONDITIONS  === undefined || OTHER_CONDITIONS  === "") {
		modalInfo("기타조건을 입력해주세요.");
		$("#OTHER_CONDITIONS ").focus();
		return false;
		}
	
	// 숫자체크
	// 최소 서비스 금액
	if(SERVICE_AMOUNT_MIN.search(chkNum) == -1){
		modalInfo("최소 서비스 금액에 숫자만 입력해주세요");
		$("#SERVICE_AMOUNT_MIN").focus();
		return false;
	}
	
	// 최대 서비스 금액
	if(SERVICE_AMOUNT_MAX.search(chkNum) == -1){
		modalInfo("최대 서비스 금액에 숫자만 입력해주세요");
		$("#SERVICE_AMOUNT_MAX").focus();
		return false;
	}
	
	// 한도금액
	if(AMOUNT_LIMIT.search(chkNum) == -1){
		modalInfo("한도금액에 숫자만 입력해주세요");
		$("#AMOUNT_LIMIT").focus();
		return false;
	}
	
	// 최소 상환기간
	if(SERVICE_REPAY_MIN.search(chkNum) == -1){
		modalInfo("최소 상환기간에 숫자만 입력해주세요");
		$("#SERVICE_REPAY_MIN").focus();
		return false;
	}
	
	// 최대 상환기간
	if(SERVICE_REPAY_MAX.search(chkNum) == -1){
		modalInfo("최대 상환기간에 숫자만 입력해주세요");
		$("#SERVICE_REPAY_MAX").focus();
		return false;
	}
	
	// 상환횟수
	if(REPAYMENT_COUNT.search(chkNum) == -1){
		modalInfo("상환횟수에 숫자만 입력해주세요");
		$("#REPAYMENT_COUNT").focus();
		return false;
	}
	
	// 회당 상환금액
	if(REPAY_AMOUNT.search(chkNum) == -1){
		modalInfo("회당 상환금액에 숫자만 입력해주세요");
		$("#REPAY_AMOUNT").focus();
		return false;
	}
	
	let callUrl = "/admin/cubici/adminPreference/managerMoneybank_tab2_regist";
	let callBackFunc = "registManagecodeResponse";
	let objParam = {
			FLAG : FLAG, // FLAG (수정, 등록)
			PRODUCT_NAME : PRODUCT_NAME, // 상품명
			B2B_FIRM_NM : B2B_FIRM_NM, // 도매업체코드
			PRODUCT_TYPE : PRODUCT_TYPE, // 서비스 종류
			PRODUCT_STATUS : PRODUCT_STATUS, // 운영상태
			FIRM_NM : FIRM_NM, // 회사명
			FIRM_ID : FIRM_ID, // 사업자번호
			REP_NAME : REP_NAME, // 대표이사
			FIRM_ZIP : FIRM_ZIP, // 우편번호
			FIRM_ADDR : FIRM_ADDR, // 상세주소
			INPUT_DATE : INPUT_DATE, // 등록 일자
			LAUNCH_DATE : LAUNCH_DATE, // 시작 일자
			EXPIRE_DATE : EXPIRE_DATE, // 종료 일자
			MANAGER_NM : MANAGER_NM, // 책임자명
			MANAGER_RANK : MANAGER_RANK, // 책임자 직급
			MANAGER_PHONE : MANAGER_PHONE, // 책임자 번호
			DEVELOPER_NM : DEVELOPER_NM, // 개발자명
			DEVELOPER_RANK : DEVELOPER_RANK, // 개발자 직급
			DEVELOPER_PHONE : DEVELOPER_PHONE, // 개발자 번호
			CS_NM : CS_NM, // 고객지원 담당자명
			CS_RANK : CS_RANK, // 고객지원 담당자 직급
			CS_PHONE : CS_PHONE, // 고객지원 담당자 번호
			FIRM_TEL : FIRM_TEL, // 회사 전화번호
			FIRM_FAX : FIRM_FAX, // 회사 팩스번호
			FIRM_EMAIL : FIRM_EMAIL, // 회사 이메일
			MIN_SALES_AMOUNT : MIN_SALES_AMOUNT, // 최소매출
			MIN_BUSINESS_PERIOD : MIN_BUSINESS_PERIOD, // 최소 사업기간
			CREDIT_RATE : CREDIT_RATE, // 신용평가
			MIN_CALC_AMOUNT : MIN_CALC_AMOUNT, // 최소 정산금액
			CBCI_PERIOD : CBCI_PERIOD, // 큐빅아이 가입기간
			OTHER_CONDITIONS : OTHER_CONDITIONS, // 기타조건
			SERVICE_AMOUNT_STANDARD : SERVICE_AMOUNT_STANDARD, // 서비스 금액신청
			SERVICE_AMOUNT_MIN : SERVICE_AMOUNT_MIN, // 최서 서비스금액
			SERVICE_AMOUNT_MAX : SERVICE_AMOUNT_MAX, // 최대 서비스금액
			AMOUNT_LIMIT : AMOUNT_LIMIT, // 한도금액
			SERVICE_FEE_STANDARD : SERVICE_FEE_STANDARD, // 수수로산정
			SERVICE_FEE_MIN : SERVICE_FEE_MIN, // 최소 수수료
			SERVICE_FEE_MAX : SERVICE_FEE_MAX, // 최대 수수료
			SERVICE_REPAY_PERIOD : SERVICE_REPAY_PERIOD, // 상환기간
			SERVICE_REPAY_MIN : SERVICE_REPAY_MIN, // 최소 상환기간
			SERVICE_REPAY_MAX : SERVICE_REPAY_MAX, // 최대 상환기간
			EXTENTION_YN : EXTENTION_YN, // 상환연장가능
			SERVICE_REPAY_METHOD : SERVICE_REPAY_METHOD, // 상환방식
			REPAYMENT_COUNT : REPAYMENT_COUNT, // 상환횟수
			REPAY_AMOUNT : REPAY_AMOUNT, // 회당 상환금액
			LIMIT_CHANGE_YN : LIMIT_CHANGE_YN, // 한도금액변경가능여부
			MID_REPAY_YN : MID_REPAY_YN // 중도상환가능여부
			
 	} 
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);

	return true;
}
function registManagecodeResponse(data){
	return true
}
function gotoTab2(){
	if(getParameters('resultCode') == '0'){
		
		// 받은 데이터 변수에 저장
		let PRODUCT_NAME = getParameters('gototTab2Data').PRODUCT_NAME;
		let PRODUCT_STATUS = getParameters('gototTab2Data').PRODUCT_STATUS; 
		let FIRM_NM = getParameters('gototTab2Data').FIRM_NM;
		let FIRM_ID = getParameters('gototTab2Data').FIRM_ID;
		let REP_NM = getParameters('gototTab2Data').REP_NM;
		let FIRM_ZIP = getParameters('gototTab2Data').FIRM_ZIP;
		let FIRM_ADDRESS = getParameters('gototTab2Data').FIRM_ADDRESS;
		let INPUT_DATE = formatDate(getParameters('gototTab2Data').INPUT_DATE);
		let LAUNCH_DATE = formatDate(getParameters('gototTab2Data').LAUNCH_DATE);
		let EXPIRE_DATE = formatDate(getParameters('gototTab2Data').EXPIRE_DATE);
		let B2B_FIRM_NM = getParameters('gototTab2Data').B2B_FIRM_NM;
		let PRODUCT_TYPE = getParameters('gototTab2Data').PRODUCT_TYPE;
		let MANAGER_NM = getParameters('gototTab2Data').MANAGER_NM;
		let MANAGER_RANK = getParameters('gototTab2Data').MANAGER_RANK;
		let MANAGER_PHONE = getParameters('gototTab2Data').MANAGER_PHONE;
		let DEVELOPER_NM = getParameters('gototTab2Data').DEVELOPER_NM;
		let DEVELOPER_RANK = getParameters('gototTab2Data').DEVELOPER_RANK;
		let DEVELOPER_PHONE = getParameters('gototTab2Data').DEVELOPER_PHONE;
		let CS_NM = getParameters('gototTab2Data').CS_NM;
		let CS_RANK = getParameters('gototTab2Data').CS_RANK;
		let CS_PHONE = getParameters('gototTab2Data').CS_PHONE;
		let FIRM_TEL = getParameters('gototTab2Data').FIRM_TEL;
		let FIRM_FAX = getParameters('gototTab2Data').FIRM_FAX;
		let FIRM_EMAIL = getParameters('gototTab2Data').FIRM_EMAIL;
		let MIN_SALES_AMOUNT = getParameters('gototTab2Data').MIN_SALES_AMOUNT;
		let MIN_BUSINESS_PERIOD = getParameters('gototTab2Data').MIN_BUSINESS_PERIOD;
		let CREDIT_RATE = getParameters('gototTab2Data').CREDIT_RATE;
		let MIN_CALC_AMOUNT = getParameters('gototTab2Data').MIN_CALC_AMOUNT;
		let CBCI_PERIOD = getParameters('gototTab2Data').CBCI_PERIOD;
		let OTHER_CONDITIONS = getParameters('gototTab2Data').OTHER_CONDITIONS;
		let SERVICE_AMOUNT_STANDARD = getParameters('gototTab2Data').SERVICE_AMOUNT_STANDARD; 
		let SERVICE_AMOUNT_MIN = getParameters('gototTab2Data').SERVICE_AMOUNT_MIN;
		let SERVICE_AMOUNT_MAX = getParameters('gototTab2Data').SERVICE_AMOUNT_MAX;
		let SERVICE_AMOUNT_UNIT = getParameters('gototTab2Data').SERVICE_AMOUNT_UNIT;
		let EXECUTE_AMOUNT_STANDARD = getParameters('gototTab2Data').EXECUTE_AMOUNT_STANDARD; 
		let EXECUTE_AMOUNT_MIN = getParameters('gototTab2Data').EXECUTE_AMOUNT_MIN;
		let EXECUTE_AMOUNT_MAX = getParameters('gototTab2Data').EXECUTE_AMOUNT_MAX;
		let EXECUTE_AMOUNT_UNIT = getParameters('gototTab2Data').EXECUTE_AMOUNT_UNIT;
		let SERVICE_FEE_STANDARD = getParameters('gototTab2Data').SERVICE_FEE_STANDARD; 
		let SERVICE_FEE_MIN = getParameters('gototTab2Data').SERVICE_FEE_MIN;
		let SERVICE_FEE_MAX = getParameters('gototTab2Data').SERVICE_FEE_MAX;
		let ANNUAL_FEE_RATE = getParameters('gototTab2Data').ANNUAL_FEE_RATE;
		let INTEREST_STANDARD = getParameters('gototTab2Data').SERVICE_FEE_STANDARD; 
		let INTEREST_MIN = getParameters('gototTab2Data').SERVICE_FEE_MIN;
		let INTEREST_MAX = getParameters('gototTab2Data').SERVICE_FEE_MAX;
		let MID_REPAY_YN = getParameters('gototTab2Data').MID_REPAY_YN;
		let SERVICE_REPAY_PERIOD = getParameters('gototTab2Data').SERVICE_REPAY_PERIOD; 
		let SERVICE_REPAY_MIN = getParameters('gototTab2Data').SERVICE_REPAY_MIN;
		let SERVICE_REPAY_MAX = getParameters('gototTab2Data').SERVICE_REPAY_MAX;
		let EXTENTION_YN = getParameters('gototTab2Data').EXTENTION_YN; 
		let SERVICE_REPAY_METHOD = getParameters('gototTab2Data').SERVICE_REPAY_METHOD; 
		let REPAYMENT_COUNT = getParameters('gototTab2Data').REPAYMENT_COUNT;
		let REPAY_AMOUNT = getParameters('gototTab2Data').REPAY_AMOUNT;
		let LIMIT_CHANGE_YN = getParameters('gototTab2Data').LIMIT_CHANGE_YN;
		
		// TEXT
		$('input[id=PRODUCT_NAME]').attr('value',PRODUCT_NAME);
		$('input[id=FIRM_NM]').attr('value',FIRM_NM);
		$('input[id=FIRM_ID]').attr('value',FIRM_ID);
		$('input[id=REP_NM]').attr('value',REP_NM);
		$('input[id=FIRM_ZIP]').attr('value',FIRM_ZIP);
		$('input[id=FIRM_ADDRESS]').attr('value',FIRM_ADDRESS);
		$('input[id=INPUT_DATE]').attr('value',INPUT_DATE);
		$('input[id=LAUNCH_DATE]').attr('value',LAUNCH_DATE);
		$('input[id=EXPIRE_DATE]').attr('value',EXPIRE_DATE);
		$('input[id=MANAGER_NM]').attr('value',MANAGER_NM);
		$('input[id=MANAGER_RANK]').attr('value',MANAGER_RANK);
		$('input[id=MANAGER_PHONE]').attr('value',MANAGER_PHONE);
		$('input[id=DEVELOPER_NM]').attr('value',DEVELOPER_NM);
		$('input[id=DEVELOPER_RANK]').attr('value',DEVELOPER_RANK);
		$('input[id=DEVELOPER_PHONE]').attr('value',DEVELOPER_PHONE);
		$('input[id=CS_NM]').attr('value',CS_NM);
		$('input[id=CS_RANK]').attr('value',CS_RANK);
		$('input[id=CS_PHONE]').attr('value',CS_PHONE);
		$('input[id=FIRM_TEL]').attr('value',FIRM_TEL);
		$('input[id=FIRM_FAX]').attr('value',FIRM_FAX);
		$('input[id=FIRM_EMAIL]').attr('value',FIRM_EMAIL);
		$('input[id=MIN_SALES_AMOUNT]').attr('value',MIN_SALES_AMOUNT);
		$('input[id=MIN_BUSINESS_PERIOD]').attr('value',MIN_BUSINESS_PERIOD);
		$('input[id=CREDIT_RATE]').attr('value',CREDIT_RATE);
		$('input[id=MIN_CALC_AMOUNT]').attr('value',MIN_CALC_AMOUNT);
		$('input[id=CBCI_PERIOD]').attr('value',CBCI_PERIOD);
		$('input[id=OTHER_CONDITIONS]').attr('value',OTHER_CONDITIONS);
		$('input[id=SERVICE_AMOUNT_MIN]').attr('value',SERVICE_AMOUNT_MIN);
		$('input[id=SERVICE_AMOUNT_MAX]').attr('value',SERVICE_AMOUNT_MAX);
		$('input[id=SERVICE_AMOUNT_UNIT]').attr('value',SERVICE_AMOUNT_UNIT);
		$('input[id=EXECUTE_AMOUNT_MIN]').attr('value',EXECUTE_AMOUNT_MIN);
		$('input[id=EXECUTE_AMOUNT_MAX]').attr('value',EXECUTE_AMOUNT_MAX);
		$('input[id=EXECUTE_AMOUNT_UNIT]').attr('value',EXECUTE_AMOUNT_UNIT);
		$('input[id=SERVICE_FEE_MIN]').attr('value',SERVICE_FEE_MIN);
		$('input[id=SERVICE_FEE_MAX]').attr('value',SERVICE_FEE_MAX);
		$('input[id=ANNUAL_FEE_RATE]').attr('value',ANNUAL_FEE_RATE);
		$('input[id=INTEREST_MIN]').attr('value',SERVICE_FEE_MIN);
		$('input[id=INTEREST_MAX]').attr('value',SERVICE_FEE_MAX);
		$('input[id=SERVICE_REPAY_MIN]').attr('value',SERVICE_REPAY_MIN);
		$('input[id=SERVICE_REPAY_MAX]').attr('value',SERVICE_REPAY_MAX);
		$('input[id=REPAYMENT_COUNT]').attr('value',REPAYMENT_COUNT);
		$('input[id=REPAY_AMOUNT]').attr('value',REPAY_AMOUNT);
		
		// 드롭박스
		$('#PRODUCT_STATUS').val(PRODUCT_STATUS).prop("selected",true);
		$('#SERVICE_FEE_STANDARD').val(SERVICE_FEE_STANDARD).prop("selected",true);
		$('#INTEREST_STANDARD').val(INTEREST_STANDARD).prop("selected",true);
		$('#SERVICE_AMOUNT_STANDARD').val(SERVICE_AMOUNT_STANDARD).prop("selected",true);
		$('#EXECUTE_AMOUNT_STANDARD').val(EXECUTE_AMOUNT_STANDARD).prop("selected",true);
		$('#SERVICE_REPAY_PERIOD').val(SERVICE_REPAY_PERIOD).prop("selected",true);
		$('#EXTENTION_YN').val(EXTENTION_YN).prop("selected",true);
		$('#SERVICE_REPAY_METHOD').val(SERVICE_REPAY_METHOD).prop("selected",true);
		$('#B2B_FIRM_NM').val(B2B_FIRM_NM).prop("selected", true);
		$('#PRODUCT_TYPE').val(PRODUCT_TYPE).prop("selected", true);
		$('#MID_REPAY_YN').val(MID_REPAY_YN).prop("selected", true);
		$('#LIMIT_CHANGE_YN').val(LIMIT_CHANGE_YN).prop("selected", true);
		
	}
	
	return false;
}

</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/adminPreference/manageMoneybank_tab1">상품 리스트</a></li>
        <li class="active"><a href="/admin/cubici/adminPreference/manageMoneybank_tab2">상품등록</a></li>
    </ul>
</div>

<article class="subBox">
    <header>
        <h4>기본 정보</h4>
    </header>
    <div class="contentArea mArticleArea">
        <div class="m-modalGrid">
            <ul class="item">
                <li class="col-2">
                    <div class="fwBox">
                        <span class="ft">상품명</span>
                        <div class="input">
                            <input type="text" id="PRODUCT_NAME" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">운영상태</span>
                        <div class="input">
                            <select id="PRODUCT_STATUS">
                                <option value="운영">운영</option>
                                <option value="완료">완료</option>
                                <option value="중지">중지</option>
                            </select>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">회사명</span>
                        <div class="input">
                            <input type="text" id="FIRM_NM" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">사업자번호</span>
                        <div class="input">
                            <input type="text" id="FIRM_ID" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">대표이사</span>
                        <div class="input">
                            <input type="text" id="REP_NM" value="">
                        </div>
                    </div>
                </li>
            </ul>
           <ul class="item">
                <li class="btn">
                    <div class="fwBox">
                        <span class="ft">주소</span>
                        <div class="input">
                            <input type="text" placeholder="우편번호 검색" id="FIRM_ZIP" value="">
                        </div>
                    </div>
                    <div class="fwBtn wide">
                    	<button id="addrSearch" class="sBtn sColorLB search" style="font-size:12px;">찾기</button>
                    </div>
                </li>
                <li class="col-2">
                    <div class="fwBox">
                        <div class="input">
                            <input type="text" placeholder="상세주소" id="FIRM_ADDRESS" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
              <li>
                  <div class="fwBox">
                      <span class="ft">등록 일자</span>
                      <div class="input">
                          <input type="text" class="datepicker" id="INPUT_DATE" placeholder="등록 일자" value="">
                      </div>
                  </div>
              </li>
              <li>
                  <div class="fwBox">
                      <span class="ft">시작 일자</span>
                      <div class="input">
                          <input type="text" class="datepicker" id="LAUNCH_DATE" placeholder="시작 일자" value="">
                      </div>
                  </div>
              </li>
              <li>
                  <div class="fwBox">
                      <span class="ft">종료 일자</span>
                      <div class="input">
                          <input type="text" class="datepicker" id="EXPIRE_DATE" placeholder="종료 일자" value="">
                      </div>
                  </div>
              </li>
          </ul>
          <ul class="item">
              <li>
                  <div class="fwBox">
                      <span class="ft">B2B 업체명</span>
                      <div class="input">
                           <input type="text" placeholder="도매업체명" id="B2B_FIRM_NM" value="">
                       </div>
                  </div>
              </li>
              <li>
              	  <div class="fwBox">
              	  	  <span class="ft">서비스 종류</span>
                      <div class="input">
	                      <select id="PRODUCT_TYPE">
	                          <option value="선정산">선정산</option>
	                          <option value="선지급">선지급</option>
	                      </select>
                      </div>
              	  </div>
              </li>
          </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>담당 정보</h4>
    </header>
    <div class="contentArea mArticleArea">
        <div class="m-modalGrid">
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">책임자</span>
                        <div class="input">
                            <input type="text" id="MANAGER_NM" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">직급</span>
                        <div class="input">
                            <input type="text" id="MANAGER_RANK" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">전화</span>
                        <div class="input">
                            <input type="text" id="MANAGER_PHONE" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">개발담당</span>
                        <div class="input">
                            <input type="text" id="DEVELOPER_NM" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">직급</span>
                        <div class="input">
                            <input type="text" id="DEVELOPER_RANK" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">전화</span>
                        <div class="input">
                            <input type="text" id="DEVELOPER_PHONE" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">고객지원 담당</span>
                        <div class="input">
                            <input type="text" id="CS_NM" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">직급</span>
                        <div class="input">
                            <input type="text" id="CS_RANK" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">전화</span>
                        <div class="input">
                            <input type="text" id="CS_PHONE" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">전화</span>
                        <div class="input">
                            <input type="text" id="FIRM_TEL" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">팩스</span>
                        <div class="input">
                            <input type="text" id="FIRM_FAX" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">이메일</span>
                        <div class="input">
                            <input type="text" id="FIRM_EMAIL" value="">
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>신청 조건</h4>
    </header>
    <div class="contentArea mArticleArea">
        <article class="m-modalGrid">
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">최소매출</span>
                        <div class="input">
                            <input type="text" id="MIN_SALES_AMOUNT" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최소 사업기간</span>
                        <div class="input">
                            <input type="text" id="MIN_BUSINESS_PERIOD" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">신용평가</span>
                        <div class="input">
                            <input type="text" id="CREDIT_RATE" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">최소 정산금액</span>
                        <div class="input">
                            <input type="text" id="MIN_CALC_AMOUNT" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">큐빅아이 가입기간</span>
                        <div class="input">
                            <input type="text" id="CBCI_PERIOD" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">기타조건</span>
                        <div class="input">
                            <input type="text" id="OTHER_CONDITIONS" value="">
                        </div>
                    </div>
                </li>
            </ul>

        </article>
        <article class="m-modalGrid">
            <header>
                <h3>상품 운영 조건</h3>
            </header>
            <ul class="item autoFt">
                <li>
                    <div class="fwBox">
                        <span class="ft">서비스 금액신청</span>
                        <div class="input">
                            <select id="SERVICE_AMOUNT_STANDARD">
                                <option value="고정방식">고정방식</option>
                                <option value="매출연동">매출연동</option>
                                <option value="신용연계">신용연계</option>
                            </select>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최소 서비스금액</span>
                        <div class="input">
                            <input type="text" id="SERVICE_AMOUNT_MIN" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최대 서비스금액</span>
                        <div class="input">
                            <input type="text" id="SERVICE_AMOUNT_MAX" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">단위 금액</span>
                        <div class="input">
                            <input type="text" id="SERVICE_AMOUNT_UNIT">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item autoFt">
                <li>
                    <div class="fwBox">
                        <span class="ft">서비스 실행금신청</span>
                        <div class="input">
                            <select id="EXECUTE_AMOUNT_STANDARD">
                                <option value="고정방식">고정방식</option>
                                <option value="매출연동">매출연동</option>
                                <option value="신용연계">신용연계</option>
                            </select>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최소 실행금액</span>
                        <div class="input">
                            <input type="text" id="EXECUTE_AMOUNT_MIN" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최대 실행금액</span>
                        <div class="input">
                            <input type="text" id="EXECUTE_AMOUNT_MAX" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">단위 금액</span>
                        <div class="input">
                            <input type="text" id="EXECUTE_AMOUNT_UNIT">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item autoFt">
                <li>
                    <div class="fwBox">
                        <span class="ft">수수료 산정</span>
                        <div class="input">
                            <select id="SERVICE_FEE_STANDARD">
                                <option value="고정방식">고정방식</option>
                                <option value="매출연동">매출연동</option>
                                <option value="신용연계">신용연계</option>
                            </select>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최소 수수료</span>
                        <div class="input">
                            <input type="text" id="SERVICE_FEE_MIN" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최대 수수료</span>
                        <div class="input">
                            <input type="text" id="SERVICE_FEE_MAX" value="">
                        </div>
                    </div>
                </li>
                <li>
	                <div class="fwBox">
                        <span class="ft">연수수료율</span>
                        <div class="input">
                            <input type="text" id="ANNUAL_FEE_RATE" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item autoFt">
                <li>
                    <div class="fwBox">
                        <span class="ft">선취이자 산정</span>
                        <div class="input">
                            <select id="INTEREST_STANDARD">
                                <option value="고정방식">고정방식</option>
                                <option value="매출연동">매출연동</option>
                                <option value="신용연계">신용연계</option>
                            </select>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최소 이자율</span>
                        <div class="input">
                            <input type="text" id="INTEREST_MIN" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최대 이자율</span>
                        <div class="input">
                            <input type="text" id="INTEREST_MAX" value="">
                        </div>
                    </div>
                </li>
                <li>
	                <div class="fwBox">
                        <span class="ft">총액 한도 변경 유무</span>
                        <div class="input">
                            <select id="LIMIT_CHANGE_YN">
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item autoFt">
                <li>
                    <div class="fwBox">
                        <span class="ft">상환기간</span>
                        <div class="input">
                            <select id="SERVICE_REPAY_PERIOD" value="">
                                <option value="고정형">고정형</option>
                            </select>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최소 상환기간</span>
                        <div class="input">
                            <input type="text" id="SERVICE_REPAY_MIN" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">최대 상환기간</span>
                        <div class="input">
                            <input type="text" id="SERVICE_REPAY_MAX" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">상환연장가능</span>
                        <div class="input">
                            <select id="EXTENTION_YN">
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item autoFt">
                <li>
                    <div class="fwBox">
                        <span class="ft">상환방식</span>
                        <div class="input">
                            <select id="SERVICE_REPAY_METHOD" value="">
                                <option value="미지정">미지정</option>
                            </select>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">상환횟수</span>
                        <div class="input">
                            <input type="text" id="REPAYMENT_COUNT" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">회당 상환금액</span>
                        <div class="input">
                            <input type="text" id="REPAY_AMOUNT" value="">
                        </div>
                    </div>
                </li>
                <li>
                  <div class="fwBox">
	                  <span class="ft">중도상환가능</span>
		              <div class="input">
		                  <select id="MID_REPAY_YN">
		                      <option value="Y">Yes</option>
		                      <option value="N">No</option>
		                  </select>
		              </div>
	              </div>
                </li>
            </ul>
        </article>
    </div>
</article>

<div class="subContentsBtns">
    <a href="javascript:;" class="mBtn sColorLB" id="CONFIRM">확인</a>
</div>