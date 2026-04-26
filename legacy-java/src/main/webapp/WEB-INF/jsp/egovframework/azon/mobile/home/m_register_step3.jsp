<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>


<script>
$(document).ready(function(){
	let objParam = {flag: "signUp"};
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url : "/selectShop",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result.resultCode === 0) {
	            $("#bizType").empty().html("<option value='-'>유형 선택</option>");
	            for(key in result.bizType){
	            	$("#bizType").append("<option value='"+key+"'>"+result.bizType[key]+"</option>");
	            }
				
	            $("#shopList").empty();
	            for(key in result.shopList){
	            	$("#shopList").append("<option value='"+key+"'>"+result.shopList[key]+"</option>");
	            }     
			} else {
				console.log("ErrorCode ::: " + result.resultCode);
				modalInfo("관리자에게 문의 바랍니다.");
			}
		},
		error : function() {
			alert(cubici.AJAX_ERROR_MSG);
		}
	});
});

// 쇼핑몰 추가 버튼
$(document).on('click', "#addRow", function(){
	
	let shopList = $("#shopList option:selected").val();
	let shopId = $.trim($("#shopId").val());
	let shopPwd = $.trim($("#shopPwd").val());
	let checkPassword = $.trim($("#checkPassword").val());
	
	if(shopId === null || shopId === ""){
		modalInfo("쇼핑몰 아이디를 입력해주세요.");
		return false;
	}
	if(shopPwd === null || shopPwd === "" || checkPassword === null || checkPassword === ""){
		modalInfo("비밀번호를 입력해주세요.");
		return false;
	}
	if( shopPwd !== checkPassword){
		modalInfo("비밀번호가 일치하지 않습니다.");
		return false;
	}
	
	let shopName = "";
	let naverDivision = shopId.indexOf('@'); // 네이버 @ 들어가면 판매자계정
	
	if(shopList === "1") {
		shopName = "interpark";
	}
	if(shopList === "2") {
		shopName = "gmarket";
	}
	if(shopList === "3") {
		shopName = "auction";
	}
	if(shopList === "4") {
		shopName = "11st";
	}
	if(shopList === "14" && naverDivision === -1) {
		shopName = "naver";
	}
	if(shopList === "14" && naverDivision !== -1) {
		shopName = "naverseller";
	}
	if(shopList === "11") {
		shopName = "coupang";
	}
	
	// 쇼핑몰 중복 체크
	let shopDuplicateCheck = 0;
	let interparkDupliCheck = 0;
	let gmarketDupliCheck = 0;
	let auctionDupliCheck = 0;
	let elevenDupliCheck = 0;
	let naverDupliCheck = 0;
	let coupangDupliCheck = 0;
	
	$("#shopRegistTboby tr").each(function(){
	    let shopCodeFlag = $(this).find(".hiddenShopCode").val(); // 쇼핑몰 번호
		let shopIdFlag = $(this).find("td").eq(1).find('div').text(); // 쇼핑몰 아이디
		
		if(shopList === shopCodeFlag && shopId === shopIdFlag){
			shopDuplicateCheck++;
		}
		// 인터파크 > 사업자번호 1개당 계정 1개
		if(shopCodeFlag === "1"){
			interparkDupliCheck++;
		}
		// 지마켓 > 사업자번호 1개당 계정 3개
		if(shopCodeFlag === "2"){
			gmarketDupliCheck++;
		}
		// 옥션 > 사업자번호 1개당 계정 5개
		if(shopCodeFlag === "3"){
			auctionDupliCheck++;
		}
		// 11번가 > 사업자번호 1개당 계정 3개
		if(shopCodeFlag === "4"){
			elevenDupliCheck++;
		}
		// 쿠팡 > 사업자번호 1개당 계정 1개
		if(shopCodeFlag === "11"){
			coupangDupliCheck++;
		}
		// 네이버 > 사업자번호 1개당 계정 1개
		if(shopCodeFlag === "14"){
			naverDupliCheck++;
		}
	});
	
	if(shopDuplicateCheck > 0){
		modalInfo("이미 등록된 쇼핑몰 정보 입니다.");
		return false;
	}
	if(interparkDupliCheck > 0 && shopList === "1"){
		modalInfo("인터파크는 한 계정만 등록 가능합니다.");
		return false;
	}
	if(gmarketDupliCheck > 3 && shopList === "2"){
		modalInfo("지마켓은 계정 3개까지만 등록 가능합니다.");
		return false;
	}
	if(auctionDupliCheck > 5 && shopList === "3"){
		modalInfo("옥션은 계정 5개까지만 등록 가능합니다.");
		return false;
	}
	if(elevenDupliCheck > 0 && shopList === "4"){
		modalInfo("11번가는 계정 3개까지만 등록 가능합니다.");
		return false;
	}
	if(coupangDupliCheck > 0 && shopList === "11"){
		modalInfo("쿠팡은 한 계정만 등록 가능합니다.");
		return false;
	}
	if(naverDupliCheck > 0 && shopList === "14"){
		modalInfo("네이버는 한 계정만 등록 가능합니다.");
		return false;
	}
	
	let objParam = {
		cnt: "0",
		shopType: shopList,
		shopName: shopName,
		shopId: shopId,
		shopPwd: shopPwd
	};
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	$.ajax({
		cache : false,
		type : "POST",
		url : "/tomcattonode",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			// 로딩바 해제
			$(".loadingSpinner").css({"display" : "none"});
			if(result.resultCode === 0){
				if (result.result === "YES") {
					// 쿠팡인 경우는 modal을 따로 띄워줌
					if(shopName === "coupang") {
						modalOpen("coupangApiInputModal");
						addRow("11", "쿠팡", $.trim($("#shopId").val()), $.trim($("#shopPwd").val()));
					} else {
						// 네이버 로그인 구분 추가
						if(shopList === "14"){
							$("body").append("<input type='hidden' name='naverAccountInput' value1='"+shopId+"' value2='"+shopName+"' />");
						}
						addRow(shopList, shopName, shopId, shopPwd);
						modalInfo("정상적으로 확인되었습니다.");
					}
				} else if(result.result == "NO") {
					if(shopName === "naver"){ // naver 판매자계정에 '@'가 포함된 아이디 가입여부 확인
						naverCheck(shopList, shopId, shopPwd, "0", "N");
					} else {
						modalInfo("입력하신 쇼핑몰 정보가 올바르지 않습니다.");
						return false;
					}
				} else {
					modalInfo("쇼핑몰 추가에 오류가 있습니다. 관리자에게 문의 부탁드립니다.");
					return false;
				}
			} else {
				console.log("Error Code :: "+result.resultCode);
				modalInfo("관리자에게 문의부탁드립니다.");
			}
		},
		error : function() {
			// 로딩바 해제
			$(".loadingSpinner").css({"display" : "none"});
			alert(cubici.AJAX_ERROR_MSG);
		}
	})
	
	// 회원가입 등록하기
	$(document).on('click', "#registBtn", function(){
		signUpRequest();
    });
	
});

function sendAuthCode(uri, objParam) {
	
	let resultBoolean = false;
	
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url: uri,
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result.resultCode === 0) {
				if (result.resultChar === "Y") {
					
					resultBoolean = true;
					if(objParam.FLAG === "email"){
						modalInfo("인증번호가 발송되었습니다.");
						$("#sendEmailCertNum").val(result.authCode);
					} else if(objParam.FLAG === "sms"){
						modalInfo("인증번호가 발송되었습니다.");
						$("#sendSmsCertNum").val(result.authCode);
					}
				} else {
					if(objParam.FLAG === "email"){
						modalInfo("이메일 발송에 실패했습니다.");
					} else if(objParam.FLAG === "sms"){
						modalInfo("SMS 발송에 실패했습니다.");
					}
				}
				console.log(objParam.FLAG+" 전송 확인 :: "+resultBoolean);
			} else {
				console.log("ErrorCode ::: " + result.resultCode);
				modalInfo("관리자에게 문의 바랍니다.");
			}
		},
		error : function() {
			alert(cubici.AJAX_ERROR_MSG);
		}
	});
	
	return resultBoolean;
}

// row 추가
function addRow(shopCode, shopName, shopId, shopPwd) {
	console.log(shopCode)
	let insertTbody = "<tr>";
	insertTbody += '<input type="hidden" class="hiddenShopCode" value="'+shopCode+'">';
	insertTbody += '<input type="hidden" class="hiddenShopPwd" value="'+shopPwd+'">';
	insertTbody += '<td><div class="tIn">'+shopName+'</div></td>';
	insertTbody += '<td><div class="tIn">'+shopId+'</div></td>';
	insertTbody += '<td><div class="tIn">******</div></td>';
	insertTbody += '<td><div class="tIn"><span class="lBtn sColorP rBtn mLong">연결필요</span></td>';
	insertTbody += '<td><div class="tIn"><a href="javascript:;" class="lBtn rBtn sColorG" onclick="deleteRow(\''+shopCode+'\', \''+shopId+'\');">삭제</a></div></td>';
	insertTbody += "</tr>";
	$("#shopRegistTboby").append(insertTbody);
	
	// 초기화
	$("#shopId").val("");
	$("#shopPwd").val("");
	$("#checkPassword").val("");
}

// row 삭제
function deleteRow(shopCode, shopId){
	$("#shopRegistTboby tr").each(function(){
		let shopCodeFlag = $(this).find(".hiddenShopCode").val(); // 쇼핑몰 번호
		let shopIdFlag = $(this).find("td").eq(1).find('div').text(); // 쇼핑몰 아이디
		
		if(shopCode === shopCodeFlag && shopId === shopIdFlag){
			$(this).remove();
		}
	});
}

//네이버 일반계정
function naverCheck(shopList, shopId, shopPwd, cnt, mod_yn){
		
	let shopName = "naverseller";
	
	let objParam = {
		shopType: shopList,
		shopName: shopName,
		shopId: shopId,
		shopPwd: shopPwd
	};
	
	$.ajax({
		cache : false,
		type : "POST",
		url : "/tomcattonode2",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if(result.resultCode === 0){
				if (result.result === "YES") {
					// 로딩바 해제
					$(".loadingSpinner").css({"display" : "none"});
					
					// 네이버 로그인 구분 추가
					//console.log("naverLoginDivision22 :: "+result.naverLoginDivision);
					$("body").append("<input type='hidden' name='naverAccountInput' value1='"+shopId+"' value2='"+shopName+"' />");
					
					if(mod_yn === "N"){
						addRow(shopList, "네이버", shopId, shopPwd);
					} else if (mod_yn === "Y"){
						$('#shopPwd_'+cnt).css('readonly', true);
						$('#shopPwd_'+cnt).css('border', 'none');
						$("#re_pwd_"+cnt).css('display', 'none');
						
						$('#btnMod_'+cnt).text("수정");
						$('#cancelBtn_'+cnt).css('display','none');
						$('#btnDel_'+cnt).css('display','inline-block');
						
						$('#modiYN_'+cnt).val("Y");
					}
					
					modalInfo("정상적으로 확인되었습니다.");
				} else {
					// 로딩바 해제
					$(".loadingSpinner").css({"display" : "none"});
					modalInfo("입력하신 쇼핑몰 정보가 올바르지 않습니다.");
					return false;
				}
			} else {
				// 로딩바 해제
				$(".loadingSpinner").css({"display" : "none"});
				console.log("Error Code :: "+result.resultCode);
				modalInfo("관리자에게 문의부탁드립니다.");
			}
		},
		error : function() {
			//$("#cover-spin").css({"display": "none"});
			alert(cubici.AJAX_ERROR_MSG);
		}
	});
}

function coupangApiConfirm() {
	
	let vendorId = document.getElementById('vendorId').value;
	let accessKey = document.getElementById('accessKey').value;
	let secretKey = document.getElementById('secretKey').value;
	let coupangSettlementRadio = $('input[name="coupangSettlementRadio"]:checked').val();
	
	//console.log("값: "+vendor_id+" ::: "+access_key+" ::: "+secret_key+" ::: "+coupangSettlementRadio);
	
	if (vendorId === null || vendorId === undefined || vendorId === "") {
		modalInfo("업체코드를 입력해주세요");
	} else if (accessKey === null || accessKey === undefined || accessKey === "") {
		modalInfo("엑세스키를 입력해주세요");
	} else if (secretKey === null || secretKey === undefined || secretKey === "") {
		modalInfo("시크릿키를 입력해주세요");
	} else if ($(':radio[name="coupangSettlementRadio"]:checked').length < 1) {
		modalInfo("정산 방식을 선택해주세요.");
	} else {
		$("#coupangApiInputModal").removeClass('active').fadeOut(300);
		modalInfo("정상적으로 확인 되었습니다.");
	}
}

// 쿠팡 API 정보 등록 함수
function insertCoupangAPI(shopID){
	
	let returnVal = 0;
	
	let objParam = {
		SHOP_ID : shopID,
		VENDOR_ID : document.getElementById('vendorId').value,
		API_KEY : document.getElementById('accessKey').value,
		API_SECRET_KEY : document.getElementById('secretKey').value,
		COUPANG_SETTLEMENT_TYPE : $('input[name="coupangSettlementRadio"]:checked').val()
	};
	
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url : "/saveCoupangAPI",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			returnVal = result.resultCode;
		},
		error : function() {
			returnVal = 77;
		}
	});
	
	return returnVal;
}

// 네이버 로그인 구분 추가
function insertNaverLoginDivision(){
	
	let returnVal = 0;
	let accountListStr = "";
	
	$("input[name='naverAccountInput']").each(function(index, item){
		accountListStr += $(item).attr("value1"); // 쇼핑몰 아이디
		accountListStr += ":"+$(item).attr("value2"); // 로그인 구분
	});
	
	console.log("네이버 구분 추가 :: "+accountListStr);
	
	let objParam = {
		accountListStr: accountListStr
	}
	
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url : "/insertNaverLoginDivision",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			returnVal = result.resultCode;
		},
		error : function() {
			returnVal = 66;
		}
	});
	
	return returnVal;
}

//회원가입
function signUpRequest(){
	
	let shopAccountArray = new Array();
	
	let coupangFlag = "N"; // 쿠팡있으면 추가작업
	let coupangShopId = "";
	let naverFlag = "N"; // 네이버있으면 추가작업

	if($('#shopRegistTboby > tr').length > 0){	
			
		// 쇼핑몰 계정
		$("#shopRegistTboby tr").each(function(){
			if($(this).find(".hiddenShopCode").val() === "11"){
				coupangFlag = "Y";
				coupangShopId = $(this).find("td").eq(1).find('div').text();
			}
			if($(this).find(".hiddenShopCode").val() === "14"){
				naverFlag = "Y";
			}
			let shopAccountObj = {
				SHOP_TYPE : $(this).find(".hiddenShopCode").val(),
				SHOP_ID : $(this).find("td").eq(1).find('div').text(),
				SHOP_PW : $(this).find(".hiddenShopPwd").val(),
				DEL_YN : "N",
				USER_NEW_YN1 : "Y",
				USER_NEW_YN2 : "Y",
				SEND_MAIL : "N",
				LOGIN_LOCK : "N",
				LOGIN_LOCK_NOTICE : 0
			};
			shopAccountArray.push(shopAccountObj);
		});
		
		// 기본정보
		let encryptUserPw = CryptoJS.SHA256($("#txtPwd").val() + cubici.SHA256_SALT);
		
		let objParam = {
			USER_ID : "${params.userId}",
			USER_PW : "${params.encPwd}",
			USER_TYPE : "02",
			USER_NM : "${params.userNm}",
			USER_PHONE : "${params.phoneNum}",
			FIRM_ID : "${params.bizNum}",
			FIRM_NM : "${params.firmNm}",
			FIRM_ZIP_CODE : "${params.zipCode}",
			FIRM_ADDR : "${params.roadFullAddr}",
			FIRM_SETUP_DATE : "${params.setupdate}",
			BUSINESS_TYPE : "${params.bizType}",
			SECTORS : "${params.sectors}",
			LINKED_NUM : "${params.linkedNum}",
			RECOMMENDED_NUM : "${params.recommendedNum}",
			SHOP_ACCOUNT : shopAccountArray
		};
		
		$.ajax({
			cache : false,
			async : false,
			type : "POST",
			url: "/signUp",
			data : JSON.stringify(objParam),
			dataType : "JSON",
			contentType : "application/json; charset=utf-8",
			success : function(result) {
				if (result.resultCode === 0) {
					// 추가작업 결과 코드
					let addResultCode = 0;
					// 등록한 쇼핑몰들 중 쿠팡이 있다면
					if(coupangFlag === "Y"){
						addResultCode = insertCoupangAPI(coupangShopId);
					}
					// 등록한 쇼핑몰들 중 네이버가 있다면
					if(naverFlag === "Y"){
						addResultCode = insertNaverLoginDivision();
					}
					
					// 회원가입 축하 이메일 전송
					if(addResultCode === 0){
						let uri = "/mailAuth";
						let objParam = {
							FLAG: "welcomeEmail",
							userNm: "${params.userNm}",
							userId: "${params.userId}",
							firmNm: "${params.firmNm}",
							bizNum: "${params.bizNum}"
						};
						welcomeEmail = sendAuthCode(uri, objParam);
						
						if(welcomeEmail){
							$("#join").removeClass('active').fadeOut(300);
							let userNm = "${params.userNm}";
							let userId = "${params.userId}";
							$("#signUpCompleteName").text(userNm);
	            			$("#signUpCompleteId").text(userId);
	            			modalOpen("signUpComplete");
						} else {
							modalInfo("회원가입 이메일 전송 실패. 관리자에게 문의 바랍니다.");
							window.location.href = '/m/main'; // 메인 페이지
						}
					} else if(addResult === 77) {
						modalInfo("쿠팡 API 정보 등록에 실패했습니다.<br>관리자에게 문의해 주세요.");
					} else if(addResult === 66) {
						modalInfo("네이버 계정 정보 등록에 실패했습니다.<br>관리자에게 문의해 주세요.");
					}
				} else {
					console.log("ErrorCode ::: " + result.resultCode);
					modalInfo("회원가입에 실패 했습니다. 관리자에게 문의 바랍니다.");
				}
			},
			error : function() {
				alert(cubici.AJAX_ERROR_MSG);
			}
		});
	} else {
		modalInfo("쇼핑몰을 1개 이상 등록해주세요.");
		return false
	}
	
}
</script>

<div class="subContents onlyContents">
    <div class="inner">
        <!-- <div class="subBox">
            <header>
                <h4>회원가입</h4>
                <div class="btns">
                    <a href="/m/main" class="oiBtn back">뒤로</a>
                </div>
            </header> -->
	    <div class="contentArea">
	        <div class="loginArea">
	            <div class="m-tab">
	                <ul>
	                    <li><a href="javascript:;" style="cursor: default;" data-page="join01">약관 동의</a></li>
	                    <li><a href="javascript:;" style="cursor: default;" data-page="join02">기본 정보</a></li>
	                    <li class="active"><a href="javascript:;" style="cursor: default;" data-page="join03">쇼핑몰 등록</a></li>
	                </ul>
	            </div>
	            <div class="m-tabBox active">
	                <div class="mArticleArea">
	                    <article>
	                        <header>
	                            <h3>쇼핑몰 등록</h3>
	                        </header>
	                            <div class="m-modalGrid">
	                                <ul class="item vertical">
	                                    <li class="col-1">
	                                        <div class="fwBox">
	                                            <span class="ft">추가 쇼핑몰</span>
	                                            <div class="input">
	                                                <select id="shopList">
	                                           		</select>
	                                            </div>
	                                        </div>
	                                    </li>
	                                    <li class="col-1">
	                                        <div class="fwBox">
	                                            <span class="ft">쇼핑몰 ID</span>
	                                            <div class="input">
	                                                <input type="text" id='shopId' placeholder="입력">
	                                            </div>
	                                        </div>
	                                    </li>
	                                   <!--  <li class="col-1">
	                                        <div class="fwBox">
	                                            <span class="ft">쇼핑몰명</span>
	                                            <div class="input">
	                                                <input type="text" placeholder="입력">
	                                            </div>
	                                        </div>
	                                    </li> -->
	                                    <li class="col-1">
	                                        <div class="fwBox">
	                                            <span class="ft">비밀번호</span>
	                                            <div class="input">
	                                                <input type="password" id='shopPwd' placeholder="입력">
	                                            </div>
	                                        </div>
	                                    </li>
	                                    <li class="col-1">
	                                        <div class="fwBox">
	                                            <span class="ft">비밀번호 확인</span>
	                                            <div class="input">
	                                                <input type="password" id='checkPassword' placeholder="재입력">
	                                            </div>
	                                        </div>
	                                    </li>
	                                    <li class="btn">
	                                        <a href="javascript:;" id="addRow" class="mBtn wBtn sColorLB">쇼핑몰 추가</a>
	                                    </li>
	                                </ul>
	                    
	                            </div>
	                    </article>
	                    <article>
	                        <header>
	                            <h3>쇼핑몰 정보</h3>
	                            <span class="infoArea">
	                                <a href="javascript:;" class="oiBtn infoBtn navy">정보</a>
	                                <div class="infoMemo">
	                                    <h5 class="mt"><span>선정산 대상 쇼핑몰 지정</span></h5>
	                                    <div class="iCon">
	                                        <p>
	                                            선정산 대상 쇼핑몰 지정은 회원가입 후, 머니뱅크 신청 시 선택하시면 됩니다. 
	                                        </p>
	                                    </div>
	                                </div>
	                            </span>
	                        </header>
	                        <div class="mArticleArea">
	                            <div class="fixTable maxHeight">
	                                <table class="m-baseTable">
	                                    <colgroup>
	                                        <col>
	                                        <col>
	                                        <col>
	                                        <col width="15%">
	                                        <col width="15%">
	                                        <col>
	                                        <col>
	                                    </colgroup>
	                                    <thead class="hasRow">
	                                        <tr>
	                                            <th rowspan="2">운영 쇼핑몰</th>
	                                            <th rowspan="3">쇼핑몰  ID</th>
	                                            <th rowspan="3">비밀번호</th>
	                                            <!-- <th colspan="2" class="hasLine">선정산대상 쇼핑몰 적용여부</th> -->
	                                            <th rowspan="2">API 연결</th>
	                                            <th rowspan="2">정보수정</th>
	                                        </tr>
	                                        <!-- <tr>
	                                            <th class="hasLine hasTopLine">대상여부</th>
	                                            <th class="hasLine hasTopLine">변경</th>
	                                        </tr> -->
	                                    </thead>
	                                    <tbody id="shopRegistTboby">
	                                    </tbody>
	                                </table>
	                            </div>
	                        </div>
	                    </article>
	                    <div class="btnArea">
	                        <a href="/m/register/step2" class="mBtn sColorLB">이전</a>
	                        <a href="javascript:;" id="registBtn" class="mBtn sColorN">가입하기</a>
	                    </div>
	                </div>
	            </div>
	        </div>
            <!-- </div> -->
        </div>
    </div>
</div>

<!-- 쿠팡 API 모달 -->
<div class="modal-container pass alert" id="coupangApiInputModal">
    <div class="modal-wrapper">
        <header>
            <h2>API 인증 요청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner middle mArticleArea">
                <article class="noticeTxt">
                    <p>
                        큐빅아이에서는 회원님 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 <br>
                        쿠팡에서 제공하는 API 방식을 사용하고 있습 니다. <br>
                        쿠팡 쇼핑몰 정보 확인을 위해서는 아래 “API 키 받기 ” 버튼을 클릭해 주세요
                    </p>
                </article>
                <article class="middleBtnArea">
                    <a target="_blank" href="https://developers.coupangcorp.com/hc/ko/articles/360033980613-OPENAPI-Key-%EB%B0%9C%EA%B8%89%EB%B0%9B%EA%B8%B0" class="mBtn imgBtn tColorRB"><img src="/resources/rudicks/img/partner-color/partner-sq-coupang.jpg" alt="쿠팡"> 쿠팡API 키 받기</a>
                </article>
                <article class="noticeTxt">
                    <p>
                        쿠팡에서 제공하는 API 키를 아래와 같이<br>
                        업체코드, 엑세스키, 시크릿키 3가지를 확인하시고,<br>
                        해당 란에 입력해 주십시오. 감사합니다.
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">업체코드</span>
                                    <div class="input">
                                        <input type="text" id="vendorId" placeholder="업체코드">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">엑세스키</span>
                                    <div class="input">
                                        <input type="text" id="accessKey" placeholder="엑세스키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">시크릿키</span>
                                    <div class="input">
                                        <input type="text" id="secretKey" placeholder="시크릿키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <article>
                    <p class="noticeTxt">현재 정산은 어떤 방식으로 진행하고 계십니까?</p>
                    <div class="lableList">
                        <label class="radioBox">
                            <input type="radio" name="coupangSettlementRadio" value="WEEKLY">
                            <span>주 정산</span>
                        </label>
                        <label class="radioBox">
                            <input type="radio" name="coupangSettlementRadio" value="MONTH">
                            <span>월 정산</span>
                        </label>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" class="mBtn sColorLS2" onclick="coupangApiConfirm();">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 회원가입 완료 모달 -->
<div class="modal-container pass" id="signUpComplete">
    <div class="modal-wrapper">
        <header>
            <h2>회원가입</h2>
        </header>
        <div class="modal-content">
            <div class="mInner auto mArticleArea">
                <div class="textArea">
                    <p>큐빅아이 회원가입을 환영합니다!</p>
                    <p>
                        큐빅아이가 등록하신 쇼핑몰의 정보 취합을 위해서는 통상 6시간 정도가 소요됩니다. <br>
                        자료취합이 완료되면, 등록 하신 회원님의 이메일과 문자를 통해
                        완료 상황을 알려드 리도록 하겠습니다.
                        큐빅아이의 다양한 정보를 활용하셔서 더욱 성공적인 사업으로 발전하시길 기원합니다.
                    </p>
                    <p>회원님의 가입정보는 다음과 같습니다.</p>
                    <p>
                        회원명 : <span id="signUpCompleteName"></span><br>
                        회원ID : <span id="signUpCompleteId"></span>
                    </p>
                    <p>
                        감사합니다.<br>
                        큐빅아이
                    </p>
                </div>
                <div class="btnArea">
                    <a href="/main" class="mBtn sColorLS2">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>