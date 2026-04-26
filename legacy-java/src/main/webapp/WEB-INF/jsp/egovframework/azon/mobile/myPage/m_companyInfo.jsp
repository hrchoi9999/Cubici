<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<script>
var naverAccountCount = 0; // 네이버 로그인 구분을 위해 추가
var bReturn = true;

var userPhone = "${userInfo.USER_PHONE}";
var userEmail = "${userInfo.USER_ID}";
var sendSmsResult = false;  // 저장하기 할 때 사용
var sendEmailResult = false;  // 저장하기 할 때 사용
var authResult = false;
var smsAuthNum = ""; // 인증번호
var emailAuthNum = ""; // 인증번호

$(document).ready(function(){
	
	$('#firmId').val(numSorting('firmId', '${userInfo.FIRM_ID}'));
	$('#firmTel').val(numSorting('firmTel', '${userInfo.FIRM_TEL}'));
	$('#firmFax').val(numSorting('firmFax', '${userInfo.FIRM_FAX}'));
	$('#firm').val(numSorting('userPhone', '${userInfo.USER_PHONE}'));
	$('#userPhone').val(numSorting('userPhone', '${userInfo.USER_PHONE}'));
	$('#firmSetUpDate').val("${userInfo.FIRM_SETUP_DATE}");
	
	// 휴대폰번호 수정
	$("#userPhone").on("propertychange change keyup paste input", function() {
	    var currentVal = $(this).val();
	    if(currentVal == userPhone) {
	        return;
	    }
	    currentVal = userPhone;
		$('#mobileAuthNoCheck').css("background-color","#179aff");
		$('#mobileAuthNoCheck').text("확인");
	    sendSmsResult = false;
	});

	// 인증 번호 확인
	$("#mobileAuthNoCheck").on("click", function() {
		let mobileAuthNo = $('#mobileAuthNo').val(); // 입력받은 인증 값
		if(mobileAuthNo <= 0){
			modalInfo("인증번호를 입력해주세요.");
			return false;
		}
		if(mobileAuthNo == smsAuthNum) {
			$('#mobileAuthNoCheck').css("background-color","#999");
			$('#mobileAuthNoCheck').text("인증완료");
			sendSmsResult = true;
		}else{
			modalInfo("인증번호가 일치하지 않습니다.");
			return false;
		}
	});
	
	//쇼핑몰 추가
	$("#mp_addRow").on("click", function() { 
		let check = validationCheck();

		if (check == true) {
			
			let shopType = $('#mp_shopType').val();
			let shopId = $('#mp_shopId').val();
			let shopPwd = $('#mp_shopPwd').val();
			let re_shopPwd = $('#re_shopPwd').val();
			
			let naverIdCheck = shopId.indexOf('@'); // @ 포험여부
			
			let shopName = "";
			if (shopType == 1) shopName = "interpark";
			if (shopType == 2) shopName = "gmarket";
			if (shopType == 3) shopName = "auction";
			if (shopType == 4) shopName = "11st";
			if (shopType == 11) shopName = "coupang";
			if (shopType == 14 && naverIdCheck == -1) shopName = "naver"; // 일반 > 판매자
			if (shopType == 14 && naverIdCheck != -1) shopName = "naverseller";

			// 중복 체크
			let shopDuplicateCheck = 0;
			
			// 쇼핑몰 개수 체크
			let interparkCheck = 0;
			let gmarketCheck = 0;
			let auctionCheck = 0;
			let shop11stCheck = 0;
			let coupangCheck = 0;
			let naverCheck = 0;
			let rowCount = 0;
			
			$("#shopList tr").each(function(i, item) {
				let shopCodeFlag = $(this).find("th").eq(0).find('input').val(); // 쇼핑몰 번호
				let shopIdFlag = $(this).find("td").eq(0).find('input').val(); // 쇼핑몰 아이디
				
				if($(item).css("display") == "table-row"){
					rowCount++;		
					if (shopType == shopCodeFlag && shopId == shopIdFlag) {
						shopDuplicateCheck++;
					}
					// 인터파크 : 1, 지마켓 : 3, 옥션 : 5, 11번가 : 3, 쿠팡 : 1, 네이버 : 1
					if (shopCodeFlag === "1") {
						interparkCheck++;
					}
					if (shopCodeFlag === "2") {
						gmarketCheck++;
					}
					if (shopCodeFlag === "3") {
						auctionCheck++;
					}
					if (shopCodeFlag === "4") {
						shop11stCheck++;
					}
					if (shopCodeFlag === "11") {
						coupangCheck++;
					}
					if (shopCodeFlag === "14") {
						naverCheck++;
					}
				}
			});
			
			if (rowCount >= 14) {
				modalInfo('쇼핑몰은 최대 14개까지 추가할 수 있습니다.');
				return;
			}
			
			if (shopDuplicateCheck > 0) {
				modalInfo("이미 등록된 쇼핑몰 정보 입니다.");
				return false;
			}

			if (interparkCheck > 0 && shopType === "1") {
				modalInfo("인터파크는 한 계정만 등록 가능합니다.");
				return false;
			}
			if (gmarketCheck > 2 && shopType === "2") {
				modalInfo("지마켓은 3개의 계정까지 등록 가능합니다.");
				return false;
			}
			if (auctionCheck > 4 && shopType === "3") {
				modalInfo("옥션은 5개의 계정까지 등록 가능합니다.");
				return false;
			}
			if (shop11stCheck > 2 && shopType === "4") {
				modalInfo("11번가는 3개의 계정까지 등록 가능합니다.");
				return false;
			}
			if (coupangCheck > 0 && shopType === "11") {
				modalInfo("쿠팡은 한 계정만 등록 가능합니다.");
				return false;
			}
			if (naverCheck > 0 && shopType === "14") {
				modalInfo("네이버는 한 계정만 등록 가능합니다.");
				return false;
			}

			checkMall(shopType, shopId, shopPwd, '0');
		}
	});
	
	//취소
	$('#cancelBtn').on('click', function(){
		
		modalCancel('회원정보 수정을 취소하시겠습니까?');
		
		$("#confirm_btn").on("click", function() {
			window.document.location.href="/";
		});		
		
	});
	
	//저장하기
	$('#saveBtn').on('click', function(){
		if(sendSmsResult == true){ //문자 수정
			saveInfo();
		}else{ // 문자 수정 x
			if($('#userPhone').val().replace(/-/gi,"") == "${userInfo.USER_PHONE}"){
				saveInfo();
			} else {
				modalInfo("문자 인증을 진행해 주세요");
				return false;
			}
		}
	});	
});

//sms
function sendSmsAuth(){
	userPhone = $('#userPhone').val().replaceAll("-","");
	let uri = "/smsAuth";
	let objParam = {FLAG: "signUpSms", USER_PHONE: userPhone};
	smsAuthNum = sendAuthCode(uri, objParam);
}

// 쇼핑몰 추가시 데이터 체크
function validationCheck() {
	// 소핑몰선택
	let shopType = $("#mp_shopType").val();
	if(shopType == null || shopType == "") {
		modalInfo("쇼핑몰을 선택해 주세요.");
		$("#mp_shopType").focus();
		return false;
	}
			
	//쇼핑몰 아이디
	let shopId = $("#mp_shopId").val();
	if(shopId == null || shopId == "") {
		modalInfo("쇼핑몰 아이디를 입력해주세요.");
		$("#mp_shopId").focus();
		return false;
	}
						
	// 비밀번호 체크
	let shopPwd = $("#mp_shopPwd").val();
	let re_shopPwd = $("#re_shopPwd").val();
	if(shopPwd.length < 1) {
		modalInfo("비밀번호를 입력해 주세요.");
		$("#mp_shopPwd").focus();
		return false;
	}			
	
	if(re_shopPwd.length<1) {
		modalInfo("확인 비밀번호를 입력해 주세요.");
		$("#re_shopPwd").focus();
		return false;
	}
	
	if(shopPwd!=re_shopPwd) {
		modalInfo("비밀번호가 일치하지 않습니다.");
		$("#mp_shopPwd").val('');
		$("#re_shopPwd").val('');
		$("#mp_shopPwd").focus();
		return false;
	}
	
	return true;
}

function saveInfo(){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	let updateList = new Array();
	let insertList = new Array();
	
	let coupangFlag = "N"; // 쿠팡있으면 추가작업
	let coupangShopId = "";
	let naverFlag = "N"; // 네이버있으면 추가작업
	
	$("#shopList tr").each(function (index, item) {	// 삭제, 수정 > 업데이트
		index++;

		let delYn = $('#delYN_'+index).val();
		let newDelYn = $('#newDelYN_'+index).val();
		let modiYn = $('#modiYN_'+index).val();
		
		if($('#shop_'+index).val() === "11"){
			coupangFlag = "Y";
			coupangShopId = $('#shopId_'+index).val();
		}
		
		if((delYn == 'N' && modiYn == 'Y') || (delYn == 'Y')) { // 수정O or 삭제O
			let shopAccountObj = {
				SHOP_TYPE : $('#shop_'+index).val(),
				SHOP_ID : $('#shopId_'+index).val(),
				SHOP_PW : $('#shopPwd_'+index).val(),
				DEL_YN : delYn
			}
			updateList.push(shopAccountObj);
		}
		if(delYn == 'N' && newDelYn == 'N'){ // 새로 추가
			if($('#shop_'+index).val() === "14"){
				naverFlag = "Y";
			}
			let shopAccountObj = {
				SHOP_TYPE : $('#shop_'+index).val(),
				SHOP_ID : $('#shopId_'+index).val(),
				SHOP_PW : $('#shopPwd_'+index).val(),
				DEL_YN : "N",
				USER_NEW_YN1 : "Y",
				USER_NEW_YN2 : "Y",
				SEND_MAIL : "N",
				LOGIN_LOCK : "N",
				LOGIN_LOCK_NOTICE : 0
			}
			insertList.push(shopAccountObj);
		}
	});
	
	let objParam = {
		//보내야하는 값 > email , 핸드폰, 대표전화 , fax, 홈페이지, 본사주소(우편+주소)
		USER_NO : "${userShopList[0].USER_NO}",
		USER_CODE : "${userInfo.USER_CODE}",
		USER_ID : userEmail,
		USER_PHONE : userPhone.replace(/-/gi,""),
		FIRM_TEL : $('#firmTel').val().replace(/-/gi,""),
		FIRM_FAX : $('#firmFax').val().replace(/-/gi,""),
		HOME_PAGE : $('#homePage').val(),
		FIRM_ADDR : $('#mp_roadFullAddr').val(),
		FIRM_ZIP_CODE : $('#mp_zipCode').val(),
		//쇼핑몰 list
		UPDATELIST : updateList,
		INSERTLIST : insertList
	}
	
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url: "/cubici/mypage/companyInfo/update",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(data) {
			// 로딩바 해제
			$(".loadingSpinner").css({"display" : "none"});
			
			if (data.resultCode != "0") {
				modalInfo("회원 정보 수정이 실패하였습니다.<br>관리자에게 문의해주세요.");
		        return;
		    } else if (data.resultCode =='0') {
		    	// 쿠팡 구분 결과코드
				let addResult = 0;
				// 등록한 쇼핑몰들 중 쿠팡이 있다면
				if(coupangFlag === "Y"){
					var vendorid = $('#vendor_id').val();
					if(vendorid !== null && vendorid !== undefined && vendorid !== ""){
						addResult = insertCoupangAPI(data.coupang_shopID);
					}
				}
				// 추가 등록한 쇼핑몰들 중 네이버가 있다면
				if(naverFlag === "Y"){
					addResult = insertNaverLoginDivision();
				}
				
				if(addResult === 0){
					modalInfo('회원 정보 수정이 완료 되었습니다.');
					$("#confirm").on("click", function() {
						window.document.location.href="/";
					});		
					
				} else if(addResult === 77) {
					modalInfo("쿠팡 API 정보 등록에 실패했습니다.<br>관리자에게 문의해 주세요.");
				} else if(addResult === 66) {
					modalInfo("네이버 계정 정보 등록에 실패했습니다.<br>관리자에게 문의해 주세요.");
				} else {
					modalInfo("전송 장애가 있었습니다.<br>관리자에게 문의해주세요.");
					return;
				}
		    } else {
				console.log("ErrorCode ::: " + result.resultCode);
		    	let modiNonPass = confirm("전송 장애가 있었습니다.<br>관리자에게 문의해주세요.");
				if(modiNonPass==true){
					window.document.location.href="/";
				}
		    }
		},
		error : function() {
			alert(cubici.AJAX_ERROR_MSG);
		}
		
	});	
}

//원래 있던 row 삭제
function deleteRow(cnt){ //공통
	if($('#shopList tr').length <= 1){
		modalInfo('쇼핑몰은 1개 이상 등록하세요.');
	}
	if($('#acvcalYn_'+cnt) == 'Y'){
		modalInfo('선정산 대상 쇼핑몰은 삭제할 수 없습니다.');
		return;
	}
	
	modalCancel('정말 삭제하시겠습니까?');
	
	$("#confirm_btn").on("click", function() {
	$("#delYN_"+cnt).parent().css("display","none");
	$("#delYN_"+cnt).val('Y');  //delYN > Y 로 업데이트
	});
}

//새로운 row 추가
function addRow() { 

	let shopType = $('#mp_shopType').val();
	let shopId = $('#mp_shopId').val();
	let shopPwd = $('#mp_shopPwd').val();
	let re_shopPwd = $('#re_shopPwd').val();

	let naverIdCheck = shopId.indexOf('@'); // @ 포험여부

	let shopName = "";
	if (shopType == 1)
		shopName = "인터파크";
	if (shopType == 2)
		shopName = "지마켓";
	if (shopType == 3)
		shopName = "옥션";
	if (shopType == 4)
		shopName = "11번가";
	if (shopType == 11)
		shopName = "쿠팡";
	if (shopType == 14)
		shopName = "네이버";
	
	let rowCount = 0;
	$("#shopList tr").each(function(i, item) {
		if($(item).css('display') == "table-row"){
			rowCount++;
		}
	});
	
	let cnt = rowCount + 1 ;
	
	trHtml = '<tr>';
	trHtml += '<input type="hidden" id="delYN_' + cnt + '" value="N">';
	trHtml += '<input type="hidden" id="newDelYN_' + cnt + '" value="N">';
	trHtml += '<th><div class="tIn">'+ shopName +'<input type="hidden" id="shop_' + cnt + '" value="' + shopType + '"></div></th>';
	trHtml += '<td><div class="tIn">' + shopId + '<input type="hidden" id="shopId_' + cnt + '" value="' + shopId + '"></div></td>';
	trHtml += '<td><div class="tIn" style="text-align: left; padding-left: 50px;">••••••••<input type="hidden" id="shopPwd_' + cnt + '" value="' + shopPwd + '"></div></td>';
	trHtml += '<td><div class="tIn"><i class="oiBtn fail"></i></div></td>';
	trHtml += '<td><div class="tIn"></div></td>';
	trHtml += '<td><div class="tIn"><a href="javascript:;" onclick="deleteNewRow(' + cnt + ');" class="lBtn rBtn sColorG">삭제</a></div></td>';
	trHtml += '</tr>';
	
	$('#shopList').append(trHtml);
}

// 새로 추가한 row 삭제
function deleteNewRow(cnt){
	// 화면에 보이는 row 개수
	let rowCount = 0;
	$("#shopList tr").each(function(i, item) {
		if($(item).css('display') == "table-row"){
			rowCount++;
		}
	});
	
	if(rowCount <= 1){
		modalInfo('쇼핑몰은 1개 이상 등록해야 합니다');
	}
	
	modalCancel('정말 삭제하시겠습니까?');
	
	$("#confirm_btn").on("click", function() {
	$("#delYN_"+cnt).parent().css("display","none");
	$("#delYN_"+cnt).val('Y');  //delYN > Y 로 업데이트
	});
}

// 비밀번호 수정
function modifyRow(cnt){
	
	let ckReturn = false;
	
	let shopType = $('#shop_'+cnt).val();
	let shopId = $('#shopId_'+cnt).val();
	let shopPwd = $('#shopPwd_'+cnt).val();
	let re_shopPwd = $('#re_shopPwd_'+cnt).val();

	if($('#re_pwd_'+cnt).css('display') == "none" ){
		$('#re_pwd_'+cnt).css('display','block'); // 비밀번호 수정 확인 칸 
		
		$('#re_shopPwd_'+cnt).css('border','1px solid black'); 
		$('#shopPwd_'+cnt).css('border','1px solid black');
		$('#shopPwd_'+cnt).attr('readonly', false);
		
		$('#btnMod_'+cnt).text("확인");
		
		$('#btnDel_'+cnt).css('display','none');
		
		aHtml = '<a href="javascript:;" id="cancelBtn_'+cnt+'" onclick="cancelModi('+cnt+');" class="lBtn rBtn sColorG">취소</a>';
		$('#btnMod_'+cnt).after(aHtml);
	} else {
		ckReturn = valCheck(cnt);
 		if(ckReturn == false){
 			return false;
 		}
	}
	
	if(ckReturn == true){
		modalCancel("비밀번호를 수정하시겠습니까?");
		checkMall(shopType, shopId, shopPwd, cnt);
	}
}
// 수정 취소
function cancelModi(cnt){	
	//수정칸 없애고 css 수정
	$('#shopPwd_'+cnt).css('readonly', true);
	$('#shopPwd_'+cnt).css('border', 'none');
	$('#re_pwd_'+cnt).css('display', 'none');
	//삭제버튼 보이게
	$('#btnDel_'+cnt).css('display','inline-block');
	//수정으로 변경
	$('#btnMod_'+cnt).text("수정");
	//취소버튼 제거
	$('#cancelBtn_'+cnt).remove();
}

// 수정 비밀번호 확인
function valCheck(cnt){  // 수정창 비밀번호 체크
	let bRet = true;
	
	// 쇼핑몰 select값이 없을 경우   체크
	$("#shopList tr").each(function(i, item){
		let shoppwd = $("#shopPwd_"+cnt).val();
		let reshoppwd = $("#re_shopPwd_"+cnt).val();
		
		if(shoppwd == null || shoppwd == "") {
			modalInfo("수정하실 비밀번호를 입력해 주세요.");
			$("#shopPwd_"+cnt).focus();
			bRet = false;
			return false;					
		}
		if(reshoppwd == null || reshoppwd == "") {
			modalInfo("수정하실 확인 비밀번호를 입력해 주세요.");
			$("#shopPwd_"+cnt).focus();
			bRet = false;
			return false;					
		}
		if(shoppwd != reshoppwd) {
			modalInfo("수정하실 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
			$("#shopPwd_"+cnt).focus();
			bRet = false;
			return false;
		}	
	});	
	
	bReturn = bRet;	
	return bReturn;
}

//쇼핑몰 진위여부 (유효성) 검사
function checkMall(shopType, shopId, shopPwd, cnt) {
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});

	let naverIdCheck = shopId.indexOf('@'); // @ 포험여부

	let shopName = "";
	if (shopType == 1) {
		shopName = "interpark";
	}
	if (shopType == 2) {
		shopName = "gmarket";
	}
	if (shopType == 3) {
		shopName = "auction";
	}
	if (shopType == 4) {
		shopName = "11st";
	}
	if (shopType == 11) {
		shopName = "coupang";
	}
	if (shopType == 14 && naverIdCheck == -1) {
		shopName = "naver";
	}
	if (shopType == 14 && naverIdCheck != -1) {
		shopName = "naverseller";
	}

	let callUrl = "/tomcattonode";
	let callBackFunc = "checkMallResponse";
	let objParam = {
		shopName : shopName,
		shopType : shopType,
		shopId : shopId,
		shopPwd : shopPwd,
		cnt: cnt
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function checkMallResponse(data) {
	if(data.resultCode == 0 ) {
		if (data.result == "YES") {
			// 로딩바 해제
			$(".loadingSpinner").css({"display" : "none"});
			
			if (data.shopName === "coupang") {
				if(data.cnt > 0){ // 수정
					modalOpen("coupangApiInputModal");
					
					$('#shopPwd_'+data.cnt).css('readonly', true);
					$('#shopPwd_'+data.cnt).css('border', 'none');
					$("#re_pwd_"+data.cnt).css('display', 'none');
					
					$('#btnMod_'+data.cnt).text("수정");
					$('#cancelBtn_'+data.cnt).css('display','none');
					$('#btnDel_'+data.cnt).css('display','inline-block');
					
					$('#modiYN_'+data.cnt).val("Y");
				} else { // 추가
					modalOpen("coupangApiInputModal");
					addRow("11", "쿠팡", $.trim($("#mp_shopId").val()), $.trim($("#mp_shopPwd").val()));
				}
			} else {					
				if (data.cnt > 0) { // 쇼핑몰 비밀번호 수정
					if (data.shopType === "14") {	// 네이버 로그인 구분 추가
						//console.log("naverLoginDivision :: "+data.naverLoginDivision);
						naverAccountCount++;
						$("body").append("<input type='hidden' name='naverAccountInput' value1='" + data.shopId + "' value2='" + data.shopName + "' />");
					}
					$('#shopPwd_'+data.cnt).css('readonly', true);
					$('#shopPwd_'+data.cnt).css('border', 'none');
					$("#re_pwd_"+data.cnt).css('display', 'none');
					
					$('#btnMod_'+data.cnt).text("수정");
					$('#cancelBtn_'+data.cnt).css('display','none');
					$('#btnDel_'+data.cnt).css('display','inline-block');
					
					$('#modiYN_'+data.cnt).val("Y");
				} else { // 쇼핑몰 추가
					if (data.shopType === "14") {	// 네이버 로그인 구분 추가
						//console.log("naverLoginDivision :: "+data.naverLoginDivision);
						naverAccountCount++;
						$("body").append("<input type='hidden' name='naverAccountInput' value1='" + data.shopId + "' value2='" + data.shopName + "' />");
					}
					modalInfo("정상적으로 확인 되었습니다.");
					addRow();
				}
			}
		} else if (data.result == "NO") {  // 네이버 체크
			if (data.shopName == "naver") {
				if (data.cnt > 0) { // 마이페이지 > 쇼핑몰 정보 수정
					naverCheck(data.shopType, data.shopId, data.shopPwd, data.cnt, 'Y');
				} else { // 회원가입
					naverCheck(data.shopType, data.shopId, data.shopPwd, data.cnt, 'N');
				}
			} else {
				if (data.cnt > 0) { // 마이페이지 > 쇼핑몰 정보 수정
					modalInfo("입력하신 쇼핑몰 정보가 정확하지 않습니다.");
					$('#shopPwd_'+cnt).focus();
				}
				return false;
			}
		}
	} else {
		// 로딩바 해제
		$(".loadingSpinner").css({"display" : "none"});
		console.log("Error Code :: "+result.resultCode);
		modalInfo("관리자에게 문의부탁드립니다.");
	}
}

function getApiInfo(){
}

function numSorting(type, num){
	let result;
	if(type === "firmId"){ // 사업자번호
		result = num.substr(0,3) + "-" + num.substr(3,2) + "-" + num.substr(5);
		return result;
	} else if (type === "firmTel" || type === "firmFax" || type === "userPhone") {
		if(num.substr(0,2) === "02"){ //서울
			if(num.substr(2).length === 7){ //02 제외 7자리
				result = num.substr(0, 2) + "-" + num.substr(2, 3) + "-" + num.substr(5);
			}else if(num.substr(2).length === 8){
				result = num.substr(0, 2) + "-" + num.substr(2, 4) + "-" + num.substr(6);
			}
		} else { //서울 이외
			if(num.substr(3).length === 7){ //국번 제외 7자리
				result = num.substr(0, 3) + "-" + num.substr(3, 3) + "-" + num.substr(6);
			}else if(num.substr(3).length === 8){ //국번 제외 8자리, 인터넷전화
				result = num.substr(0, 3) + "-" + num.substr(3, 4) + "-" + num.substr(7);
			}
		}
		return result;
	} else if(type === "firmSetUpDate"){
		result = num.substr(0,4) + "-" + num.substr(4,2) + "-" + num.substr(6);
		return result;
	}
}

function modalCancel(text){
	
	let modalButton=""; // 모달 버튼 띄우기
	
	modalButton += '<li style="display:none"><a id="modalOpenButton" href="javascript:;" class="modalOpen sBtn rBtn sColorN" data-modal="modal-cancel"></a></li>';
    
    // body 뒷 부분에 html 태그 삽입
	$('body').append(modalButton);
	
	// 클릭이벤트 재설정
	$('.modalOpen').on('click', modalOpen);
	
	// 모달창에 text 삽입
	$('#CommonModal3').text(text);
	
	$('#modalOpenButton').trigger('click', modalOpen); // 클릭 이벤트 강제 실행
    $('#modalOpenButton').parent().remove(); // 이벤트 마지막 버튼 삭제 
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="/m/cubici/mypage/companyInfo">회사정보</a></li>
        <li><a href="/m/cubici/mypage/businessInfo">사업정보</a></li>
    </ul>
</div>

<article class="subBox">
    <div class="contentArea">
        <div class="m-modalGrid">
            <ul class="item vertical">
                <li>
                    <div class="fwBox">
                        <span class="ft">회사명</span>
                        <div class="input">
                            <input id="firmNm" type="text" value="${userInfo.FIRM_NM}" readonly>

                        </div>
                    </div>
                </li>
                
                <li>
                    <div class="fwBox">
                        <span class="ft">아이디</span>
                        <div class="input">
                            <input id="firmNm" type="text" value="${userInfo.USER_ID}" readonly>
                        </div>
                    </div>
                </li>

                <li>
                    <div class="fwBox">
                        <span class="ft">대표자명</span>
                        <div class="input">
                            <input id="userNm" type="text" value="${userInfo.USER_NM}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">사업자 번호</span>
                        <div class="input">
                            <input id="firmId" type="text" value="" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">통신판매업신고</span>
                        <div class="input">
                            <input id="togsinNo" type="text" value="${userInfo.TONGSIN_NO}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">설립일자</span>
                        <div class="input">
                            <input id="firmSetUpDate" type="text" value="${userInfo.FIRM_SETUP_DATE}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">사업자 유형</span>
                        <div class="input">
                            <input id="bizType" type="text" value="${userInfo.BUSINESS_TYPE}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">주요 판매품목</span>
                        <div class="input">
                            <input id="sectors" type="text" value="${userInfo.SECTORS}" readonly>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <div class="contentArea">
        <div class="m-modalGrid">
            <ul class="item vertical">

                <li class="col-1 btn">
                    <div class="fwBox">
                        <span class="ft">등록 핸드폰 변경</span>
                        <div class="input">
                            <input id="userPhone" type="text" value="${userInfo.USER_PHONE}">
                        </div>
                    </div>
                    <div class="fwBtn">
                        <a href="javascript:;" id="mobileAuthNoBtn" class="mBtn sColorLB" onclick="sendSmsAuth();">인증요청</a>
                    </div>
                </li>
                <li class="col-1 btn">
                    <div class="fwBox">
                        <div class="input">
                            <input id="mobileAuthNo" type="text" placeholder="인증번호 요청">
                        </div>
                    </div>
                    <div class="fwBtn">
                        <a href="javascript:;" id="mobileAuthNoCheck" class="mBtn sColorLB">확인</a>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">등록 대표번호 변경</span>
                        <div class="input">
                            <input id="firmTel" type="text" value="${userInfo.FIRM_TEL}">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">FAX</span>
                        <div class="input">
                            <input id="firmFax" type="text" value="${userInfo.FIRM_FAX}">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">홈페이지</span>
                        <div class="input">
                            <input id="homePage" type="text" value="${userInfo.HOME_PAGE}">
                        </div>
                    </div>
                </li>
                <li class="btn">
                    <div class="fwBox">
                        <span class="ft">주소 변경</span>
                        <div class="input">
                            <input type="text" id="mp_zipCode" class="zipCode" value="${userInfo.FIRM_ZIP_CODE}" readonly>
                        </div>
                    </div>
                    <div class="fwBtn wide">
                        <a id="addrSearch" href="javascript:;" class="mBtn sColorLB">찾기</a>
                    </div>
                </li>
                <li class="col-2">
                    <div class="fwBox">
                        <div class="input">
                            <input type="text" placeholder="주소" id="mp_roadFullAddr" class="roadFullAddr" value="${userInfo.FIRM_ADDR}" >
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>쇼핑몰 추가 등록</h4>
        <ul class="btns">
            <li class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn white">정보</a>
                <div class="infoMemo">
                    <div class="iCon">
                        <p>
                            사업자등록증 번호 기준 등록가능 최대 아이디는 옥션 5개, 11번가 및 지마켓 3개, 기타 쇼핑몰은 각각 1개씩으로 제한됩니다. 
                        </p>
                    </div>
                </div>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="m-modalGrid">
            <ul class="item vertical">
                <li>
                    <div class="fwBox">
                        <span class="ft">추가 쇼핑몰</span>
                        <div class="input">
                            <select id="mp_shopType">
                            <option value="">선택</option>
						  	<c:forEach items="${shopList}" var="shoplist">
						  		<option value="${shoplist.key}">${shoplist.value}</option>
						  	</c:forEach>
                            </select>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">쇼핑몰 ID</span>
                        <div class="input">
                           <input id="mp_shopId" type="text" placeholder="입력">
                        </div>
                    </div>
                </li>

                <li>
                    <div class="fwBox">
                        <span class="ft">비밀번호</span>
                        <div class="input">
                            <input id="mp_shopPwd" type="password" placeholder="입력">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">비밀번호 확인</span>
                        <div class="input">
                            <input id="re_shopPwd" type="password" placeholder="재입력">
                        </div>
                    </div>
                </li>
                <li class="btn">
                    <a href="javascript:;" id="mp_addRow" class="mBtn sColorLB wBtn">확인</a>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox transparent">
    <header>
        <h4>쇼핑몰 정보</h4>
        <ul class="btns">
            <li class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn white">정보</a>
                <div class="infoMemo">
                    <div class="iCon">
                        <p>
                            선정산 서비스를 이용하시고 있는 경우, 대상 쇼핑몰을 제외하시거나 쇼핑몰 등록을 삭제하시더라도 기존 금액의 상환완료 이전까지는 해당쇼핑몰 변경이 적용되지 않습니다. 또한, 쇼핑몰 추가 시, 선정산에 필요한 증빙 서류 제출을 필요할 수 있습니다.
                        </p>
                    </div>
                </div>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="mArticleArea">
            <div class="fixTable maxHeight">
                <table class="m-baseTable">
                    <thead class="hasRow">
                        <tr>
                            <!-- <th rowspan="2">운영 쇼핑몰</th>
                            <th rowspan="2">쇼핑몰  ID</th>
                            <th rowspan="2">비밀번호</th>
                            <th colspan="2" class="hasLine">선정산대상 쇼핑몰 적용여부</th>
                            <th rowspan="2">API 연결</th>
                            <th rowspan="2">정보수정</th> -->
                            <th>운영 쇼핑몰</th>
                            <th>쇼핑몰  ID</th>
                            <th>비밀번호</th>
                            <th>선정산대상</th>
                            <th>API 연결</th>
                            <th>정보수정</th>
                        </tr>
                        <!-- <tr>
                            <th class="hasLine hasTopLine">대상여부</th>
                            <th class="hasLine hasTopLine">변경</th>
                        </tr> -->
                    </thead>
                    <tbody id="shopList">
                    <c:forEach items="${userShopList}" var="userShop" varStatus="st">
                    	 <tr>
                    	 	<input type="hidden" id="delYN_${st.count}" value="${userShop.DEL_YN}">
							<input type="hidden" id="modiYN_${st.count}" value="N">
                            <th><div class="tIn">${userShop.CODE_NM}<input type="hidden" id="shop_${st.count}" value="${userShop.SHOP_TYPE}"></div></th>
							<td><div class="tIn">${userShop.SHOP_ID}<input type="hidden" id="shopId_${st.count}" value="${userShop.SHOP_ID}"></div></td>
                            <td>
								<div class="tIn">
									<div class="input">
										<input type="password" id="shopPwd_${st.count}" value="${userShop.SHOP_PW}" style="border:none; width:120px;" readonly>
									</div>
									<div id="re_pwd_${st.count}" class="input" style="display:none">
										<input type="password" id="re_shopPwd_${st.count}" value="${userShop.SHOP_PW}" placeholder="비밀번호 재입력" style="width:120px;">
									</div>
								</div>
							</td>   
                            <!--<td><div class="tIn"><i class="oiBtn pass"></i></div></td>
                             <td><div class="tIn">제외</td> -->
                            <td>
                            	<div class="tIn">
									 <c:choose>
								         <c:when test = "${userShop.ADVCAL_YN == 'Y'}">
								         	<i id="advcalYn_${st.count}" class="oiBtn pass"></i>
								         </c:when>
								         <c:when test = "${userShop.ADVCAL_YN == 'N'}">
								         	<i id="advcalYn_${st.count}" class="oiBtn fail"></i>
								         </c:when>
								         <c:otherwise>
								         	<i id="advcalYn_${st.count}" class="oiBtn fail"></i>
								         </c:otherwise>
								      </c:choose>
								</div>
                            </td>
                            <td>
								<div class="tIn">
									<c:choose>
										<c:when test = "${userShop.SHOP_TYPE == '11'}">
											<span class="lBtn sColorN rBtn mLong">연결중</span>
										</c:when>
										<c:when test = "${userShop.SHOP_TYPE == '3' || userShop.SHOP_TYPE == '4'}">
											<c:if test = "${not empty userShop.API_KEY}"><span class="lBtn sColorN rBtn mLong">연결중</span></c:if>
											<c:if test = "${empty userShop.API_KEY}"><a href="javascript:;" onclick="getApiInfo();" class="lBtn sColorGN rBtn mLong">연결가능</a></c:if>
										</c:when>
										<c:otherwise>
											<span></span>
										</c:otherwise>
									</c:choose>
								</div>
							</td>
                            <td>
                            	<div class="tIn">
									<a href="javascript:;" id="btnMod_${st.count}" onclick="modifyRow(${st.count});" class="lBtn rBtn sColorLS">수정</a>
	                                <a href="javascript:;" id="btnDel_${st.count}" onclick="deleteRow(${st.count});" class="lBtn rBtn sColorG">삭제</a>
	                            </div>
	                       </td>
                        </tr>
                    </c:forEach>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</article>

<div class="subContentsBtns">
    <a href="javascript:;" id="cancelBtn" class="mBtn sColorN" style="width:300px;">취소</a>
    <a href="javascript:;" id="saveBtn" class="mBtn sColorLB" style="width:300px;">수정 확인</a>
</div>

<input type="hidden" id='sendSmsCertNum'>

<div class="modal-container alert pass" id="info-change">
    <div class="modal-wrapper">
        <header>
            <h2>마이페이지 접속안내</h2>
            <a href="javascript:;" id="authClose" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner auto mArticleArea">
                <article class="noticeTxt">
                     회원님의 소중한 정보보호을 위해<br>
                     인증	번호 입력이 필요합니다.<br>
			아래 “인증번호 받기”를 클릭하시면<br>
			등록하신 핸드폰으로 인증번호를 보내드립니다. 
                </article>
                <article>
                    <div class="formMaxWrap2">
                        <div class="middleBtnArea">
                            <a href="javascript:;" id="authBtn" class="wBtn mBtn imgBtn tColorN">인증번호 받기</a>
                        </div>
                    </div>
                </article>
                <article class="m-modalGrid">
                    <p class="noticeTxt">전달받으신 인증번호를 입력해 주십시오.</p>
                    <div class="formMaxWrap2">
                        <ul class="item">
                            <li class="btn">
                                <div class="fwBox col-2">
                                    <div class="input">
                                        <input type="text" id="authNum" placeholder="인증번호 입력">
                                    </div>
                                </div>
                                <div class="fwBtn col-1">
                                    <a href="javascript:;" id="confirmAuth" class="mBtn sColorLS2">확인</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <p class="noticeTxt">감사합니다.</p>
                </article>
               
                <div class="btnArea">
                    <a href="javascript:;" id="authConfirm" class="modalClose mBtn sColorLS2">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 취소 버튼 있는 모달 -->
<div class="modal-container alert alert-pass" id="modal-cancel">
	<div class="modal-wrapper">
		<header><h2>서비스 안내</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="alert-content">
			<div class="alert-txt">
				<div id="CommonModal3" class="txtBox" style="text-align: center; padding:0">
				</div>
			</div>
				<div class="btnArea">
				<a href="javascript:;" class="modalClose mBtn sColorLS2" id="confirm_btn">확인</a>
				<a href="javascript:;" class="modalClose mBtn sColorLS2">취소</a>
			</div>
		</div>
	</div>
</div>		