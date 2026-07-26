<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<script>
$(document).ready(function() {
	
	// 영업 소재지 조회
	selectData();
	
	// 조회버튼
	$(document).on('click', "#confirm2", function(){
		window.location.href = '/cubici/mypage/businessInfo';
    });
	
});

//영업 소재지 조회
function selectData(){
	// 파라미터
	let callUrl = "/cubici/mypage/businessInfo/select";
	let callBackFunc = "businessSelectResponse";
	let objParam = {
		USER_NO : "${SES_USER.USER_NO}"
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function businessSelectResponse(data){
	
	// 영업소재지 정보
	let insertTable="";
	
	// 체크박스 checked 유무
	let checkInventory="";
	let checkReturn="";
	let checkSend="";
	
	let businessData = data.resultList;
	
	// DB에 char 1byte로 삽입되어있는 값을 check box의 check 유무에 맞춰 바꿔줌
	 for(let i=0; i<businessData.length; i++){
		if(businessData[i].CHECK_INVENTORY_STORAGE == "Y"){
			checkInventory = "checked";
		}else{
			checkInventory = "unchecked"; 
		}
			
		if(businessData[i].CHECK_RETURN == "Y"){
			checkReturn = "checked";
		}else{
			checkReturn = "unchecked";
		}
		
		if(businessData[i].CHECK_SEND == "Y"){
			checkSend = "checked";
		} else{
			checkSend = "unchecked";
		}
		
		// 테이블 출력
		insertTable += "<tr>";
		insertTable += "<td><div class='tIn'>"+businessData[i].BUSINESS_LOCATION+"</div></td>";
		insertTable += "<td><div class='tIn'>"+businessData[i].POST_CODE+"</div></td>";
		insertTable += "<td><div class='tIn'>"+businessData[i].ADDRESS+"</div></td>";
		insertTable += "<td><div class='tIn'>"+businessData[i].TEL_NO+"</div></td>";
		insertTable += "<td><div class='tIn'><label class='checkBox'><input type='checkbox' class ='checkInventory'"+checkInventory+" id='checkInvento"+businessData[i].BUSINESS_LOCATION_NUMBER+"'><span></span></label></div></td>";
		insertTable += "<td><div class='tIn'><label class='checkBox'><input type='checkbox' class ='checkSend' "+checkSend+" id ='checkSend"+businessData[i].BUSINESS_LOCATION_NUMBER+"'><span></span></label></div></td>";
		insertTable += "<td><div class='tIn'><label class='checkBox'><input type='checkbox' class ='checkReturn' "+checkReturn+" id = 'checkReturn"+businessData[i].BUSINESS_LOCATION_NUMBER+"'><span></span></label></div></td>";
		insertTable += "<td><div class='tIn'>";
		insertTable += "<button class='lBtn rBtn sColorLS' onclick='updateData(\"update\", "+businessData[i].BUSINESS_LOCATION_NUMBER+");'>수정</button>";
		insertTable += "<button class='lBtn rBtn sColorG' onclick='updateData(\"delete\", "+businessData[i].BUSINESS_LOCATION_NUMBER+");'>삭제</button>";
		insertTable += "</div></td></tr>";
	 }
	 
	$("#insertTable").empty().html(insertTable);
}

//데이터 추가
function insertData(){
	
	// 전화번호
	let telNo = $("#telNo").val();
	//파라미터
	let businessLocation = $("#businessLocation").val();
	let postCode = $("#zipCode1").val();
	let address = $("#roadFullAddr1").val();
	let checkInventory = $("#checkInventory").is(":checked");
	let checkReturn = $("#checkReturn").is(":checked");
	let checkSend = $("#checkSend").is(":checked");
	
	// 사업처 not null
	if (businessLocation === null || businessLocation === undefined || businessLocation === "") {
		modalInfo("사업처를 입력해주세요.");
		$("#businessLocation").focus();
		return false;
		}
	
	// 주소 not null	    
    if (address === null || address === undefined || address == "") {
    	modalInfo("주소를 입력해주세요.");
        $("#roadFullAddr1").focus();
        return false;
	    }
		
	// 휴대전화 유효성검사	
	if(telValidator(telNo) === false){
		modalInfo("유효하지 않는 전화번호입니다");
		return false;
		}
	
	// checkbox 1개 이상 
	if(checkInventory==false && checkReturn==false && checkSend==false){
		modalInfo("하나 이상 체크해 주세요");
		return false;
		}
		
	// DB에 char 1byte 형식으로 삽입되어야하기 때문에 형식에 맞춰 변환
	if(checkInventory == true){
		checkInventory = "Y";
	}else{
		checkInventory = "N"; 
	}
		
	if(checkReturn == true){
		checkReturn = "Y";
	}else{
		checkReturn = "N";
	}
	
	if(checkSend == true){
		checkSend = "Y";
	} else{
		checkSend = "N";
	}
	
	let callUrl = "/cubici/mypage/businessInfo/insert";
	let callBackFunc = "businessInsertResponse";
	let objParam = {
		USER_NO : "${SES_USER.USER_NO}",
		BUSINESSLOCATION : businessLocation,
		POSTCODE : postCode,
		ADDRESS : address,
		TELNO : telNo,
		CHECKINVENTORY : checkInventory,
		CHECKRETURN : checkReturn,
		CHECKSEND : checkSend
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function businessInsertResponse(data){
	
	if(data.resultCode === 0){
		modalReload("영업 소재지가 추가되었습니다.");
	} else {
		modalReload("영업 소재지 추가에 실패했습니다.");
	}
}

//데이터 수정/삭제
function updateData(flag, businessLocationNum){
	
	// 수정할 때 필요한 파라미터
	let checkInventory = $("#checkInvento"+businessLocationNum).is(":checked");
	let checkReturn = $("#checkReturn"+businessLocationNum).is(":checked");
	let checkSend = $("#checkSend"+businessLocationNum).is(":checked");
	
	if(checkInventory==false && checkReturn==false && checkSend==false){
		modalInfo("하나 이상 체크해 주세요");
		return false;
	}
	
	// DB에 char 1byte 형식으로 삽입되어야하기 때문에 형식에 맞춰 변환
	if(checkInventory == true){
		checkInventory = "Y";
	}else{
		checkInventory = "N"; 
	}
		
	if(checkReturn == true){
		checkReturn = "Y";
	}else{
		checkReturn = "N";
	}
	
	if(checkSend == true){
		checkSend = "Y";
	} else{
		checkSend = "N";
	}
	
	let callUrl = "/cubici/mypage/businessInfo/update";
	let callBackFunc = "businessUpdResponse";
	let objParam = {
		FLAG : flag,
		USER_NO : "${SES_USER.USER_NO}",
		BUSINESSLOCATIONNUM : businessLocationNum,
		CHECKINVENTORY : checkInventory,
		CHECKRETURN : checkReturn,
		CHECKSEND : checkSend
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function businessUpdResponse(data){
	
	// 수정 및 삭제
	if(data.FLAG === "delete"){
		if(data.resultCode === 0){
			modalReload("영업 소재지 정보를 삭제했습니다.");
		}else{
			modalReload("영업 소재지 정보 삭제를 실패했습니다.");
		}
	}else if(data.FLAG === "update"){
		if(data.resultCode === 0){
			modalReload("영업 소재지 정보를 수정했습니다.");
		}else{
			modalReload("영업 소재지 정보 수정에 실패했습니다.");
		}
	}else{
		modalReload("오류 발생");
	}
}

// 전화번호 유효성 검사
function telValidator(args) {
    if (/^[0-9]{2,3}[0-9]{3,4}[0-9]{4}/.test(args)) {
        return true;
    }
    return false;
}
</script>

<div class="m-tab">
    <ul>
        <li><a href="/m/cubici/mypage/companyInfo">회사정보</a></li>
        <li class="active"><a href="/m/cubici/mypage/businessInfo">사업정보</a></li>
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
                            <input type="text" value="${FIRM_NM}" readonly>
                        </div>
                    </div>
                </li>
                <!-- <li>
                    <div class="fwBox">
                        <span class="ft">대표자명</span>
                        <div class="input">
                            <input type="text" placeholder="대표자명을 입력해주세요">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">사업자 번호</span>
                        <div class="input">
                            <input type="text" placeholder="XXX - XX - XXXXX">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">통신판매업신고</span>
                        <div class="input">
                            <input type="text" placeholder="XXX - XX - XXXXX">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">대표이메일</span>
                        <div class="input">
                            <input type="text" placeholder="XXXXX@XXXXXX.XXX">
                        </div>
                    </div>
                </li> -->
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>영업 소재지 추가</h4>
    </header>
    <div class="contentArea">
        <div class="m-modalGrid">

            <ul class="item vertical">
                <li class="col-2">
                    <div class="fwBox">
                        <span class="ft">사업처</span>
                        <div class="input">
                            <input type="text" placeholder="입력" id="businessLocation">
                        </div>
                    </div>
                </li>                
                <li class="col-1 btn">
                    <div class="fwBox">
                    	<span class="ft">우편번호</span>
                        <div class="input">
                            <input type="text" id="zipCode1" class="zipCode" placeholder="우편번호" readonly>
                        </div>
                    </div>
                    <div class="fwBtn">
                    	<button id="addrSearch" id="mobileAuthNoCheck" class="mBtn sColorLB search"><img src="/resources/rudicks/img/icon/btn-serach.svg"></button>
                    </div>
                </li>                
                <li class="col-2">
                    <div class="fwBox">
                         <span class="ft">세부 주소</span>
                        <div class="input">
                            <input type="text" id="roadFullAddr1" class="roadFullAddr" placeholder="상세주소">
                        </div>
                    </div>
                </li>
                <li class="col-2">
                    <div class="fwBox">
                         <span class="ft">전화번호</span>
                        <div class="input">
                            <input type="text" placeholder="숫자만 입력" id="telNo">
                        </div>
                    </div>
                </li>
                <li>
                   <div class="fwBox tac">
                        <label class="checkBox col-1">
                            <input type="checkbox" id="checkInventory">
                            <span>재고보관</span>
                        </label>
                        <label class="checkBox col-1">
                            <input type="checkbox" id="checkSend">
                            <span>발송처</span>
                        </label>
                        <label class="checkBox col-1">
                            <input type="checkbox" id="checkReturn">
                            <span>반송처</span>
                        </label>
                   </div>
                </li>
                <li class="btn">
                    <a onclick="insertData();" class="mBtn wBtn sColorLB">추가</a>
                </li>
            </ul>

        </div>
    </div>
</article>

<article class="subBox transparent">
    <header>
        <h4>영업소재지 정보</h4>
    </header>
    <div class="contentArea">
        <div class="mArticleArea">
            <div class="fixTable maxHeight">
                <table class="m-baseTable">
                    <thead>
                        <tr>
                            <th>사업처</th>
                            <th>우편번호</th>
                            <th>주소</th>
                            <th>전화번호</th>
                            <th>재고보관</th>
                            <th>발송</th>
                            <th>반송</th>
							<!--<th>교환</th>-->
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="insertTable">
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</article>

<!-- <div class="subContentsBtns">
    <a href="javascript:;" class="mBtn sColorN">취소</a>
    <a href="javascript:;" class="mBtn sColorLB">수정 확인</a>
</div> -->