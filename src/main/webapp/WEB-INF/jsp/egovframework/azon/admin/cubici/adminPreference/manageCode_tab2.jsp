<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>

$(document).ready(function(){
	
	// 주소 검색
	$(document).on('click',"#addrSearch",function(){
		let pop = window.open("/addrSearch","pop","width=570,height=420, scrollbars=yes, resizable=yes");
	});
	
	if(location.href != "https://www.cubici.co.kr/admin/cubici/adminPreference/manageCode_tab2"){
		// 연계 코드 수정
		$(document).on('click',"#CONFIRM", function(){
			let flag = insertLinkedCode("UPDATE",getParameters('gototTab2Data').LINKED_NO);
			if(flag == true){
				window.location.href = '/admin/cubici/adminPreference/manageCode_tab1';
				}
		});
	} else if(location.href == "https://www.cubici.co.kr/admin/cubici/adminPreference/manageCode_tab2"){
		// 연계 코드 등록
		$(document).on('click',"#CONFIRM", function(){
			let flag = insertLinkedCode("INSERT","");
			if(flag == true){
			window.location.href = '/admin/cubici/adminPreference/manageCode_tab1';
			}
		});
	}

	gotoTab2();

});

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

//주소 검색 응답
function jusoCallBack(roadFullAddr,roadAddrPart1,addrDetail,roadAddrPart2,engAddr, jibunAddr, zipNo, admCd, rnMgtSn, bdMgtSn,detBdNmList,bdNm,bdKdcd,siNm,sggNm,emdNm,liNm,rn,udrtYn,buldMnnm,buldSlno,mtYn,lnbrMnnm,lnbrSlno,emdNo){
	$("#FIRM_ZIP_CODE").val(zipNo);
	$("#FIRM_ADDR").val(roadFullAddr);
}

function insertLinkedCode(FLAG,LINKED_NO){
	
	// 연계내역
	let LINKED_CODE = $("#LINKED_CODE").val(); // 연계인증번호
	let RECOMMENDED_CODE = $("#RECOMMENDED_CODE").val(); // 추천기관번호
	
	// 기본정보
	let LINKED_NAME = $("#LINKED_NM").val(); // 연계명
	let LINKED_STATUS = $("#LINKED_STATUS option:selected").val(); // 운영상태
	let FIRM_NM = $("#FIRM_NM").val(); // 회사명
	let FIRM_ID = $("#FIRM_ID").val(); // 사업자 번호
	let REP_NAME = $("#REP_NAME").val(); // 대표이사
	let FIRM_ZIP_CODE = $("#FIRM_ZIP_CODE").val(); // 우편번호
	let FIRM_ADDR =$("#FIRM_ADDR").val(); // 상세주소
	let REGI_DATE = formatDate($("#REGI_DATE").val()); // 등록 일자
	let START_DATE = formatDate($("#START_DATE ").val()); // 시작 일자
	let END_DATE = formatDate($("#END_DATE").val()); // 종료 일자
	
	// 담당 정보
	let TASK_MANAGER = $("#TASK_MANAGER").val(); // 책임자
	let TASK_MANAGER_POSITION = $("#TASK_MANAGER_POSITION").val(); // 직급
	let TASK_MANAGER_TEL = $("#TASK_MANAGER_TEL").val(); // 전화
	let CS_MANAGER = $("#CS_MANAGER").val(); // 고객지원 담당
	let CS_MANAGER_POSITION = $("#CS_MANAGER_POSITION").val(); // 직급
	let CS_MANAGER_TEL = $("#CS_MANAGER_TEL").val(); // 전화
	let CS_TEL = $("#CS_TEL").val(); // 전화
	let CS_FAX = $("#CS_FAX").val(); // 팩스
	let CS_EMAIL= $("#CS_EMAIL").val(); // 이메일
	
	// 연계 내역
	let LINKED_CONTENTS = $("#LINKED_CONTENTS").val(); // 연계 내역 내용
	
	// NULL 값 확인
	// 연계명
	if (LINKED_NAME === null || LINKED_NAME === undefined || LINKED_NAME === "") {
		modalInfo("연계명을 입력해주세요.");
		$("#LINKED_NM").focus();
		return false;
		}
	
	// 운영상태
	if (LINKED_STATUS === null || LINKED_STATUS === undefined || LINKED_STATUS === "") {
		modalInfo("운영상태를 선택해주세요.");
		return false;
		}
	
	// 회사명
	if (FIRM_NM === null || FIRM_NM === undefined || FIRM_NM === "") {
		modalInfo("회사명을 입력해주세요.");
		$("#FIRM_NM").focus();
		return false;
		}
	
	// 사업자번호
	if (FIRM_ID === null || FIRM_ID === undefined || FIRM_ID === "") {
		modalInfo("사업자번호를 입력해주세요.");
		$("#FIRM_ID").focus();
		return false;
		}
	
	// 대표이사
	if (REP_NAME === null || REP_NAME === undefined || REP_NAME === "") {
		modalInfo("대표이사명을 입력해주세요.");
		$("#REP_NAME").focus();
		return false;
		}
	
	// 우편번호
	if (FIRM_ZIP_CODE === null || FIRM_ZIP_CODE === undefined || FIRM_ZIP_CODE === "") {
		modalInfo("우편번호를 입력해주세요.");
		$("#FIRM_ZIP_CODE").focus();
		return false;
		}
	
	// 상세주소
	if (FIRM_ADDR === null || FIRM_ADDR === undefined || FIRM_ADDR === "") {
		modalInfo("상세주소를 입력해주세요.");
		$("#FIRM_ADDR").focus();
		return false;
		}
	
	// 등록일자
	if (REGI_DATE === null || REGI_DATE === undefined || REGI_DATE === "" || REGI_DATE === "NaN-NaN-NaN") {
		modalInfo("등록일자를 선택해주세요.");
		return false;
		}
	
	// 시작일자
	if (START_DATE === null || START_DATE === undefined || START_DATE === "" || START_DATE === "NaN-NaN-NaN") {
		modalInfo("시작일자를 입력해주세요.");
		return false;
		}
	
	// 종료일자
	if (END_DATE === null || END_DATE === undefined || END_DATE === "" || END_DATE === "NaN-NaN-NaN") {
		modalInfo("종료일자를 입력해주세요.");
		return false;
		}
	
	// 담당자
	if (TASK_MANAGER === null || TASK_MANAGER === undefined || TASK_MANAGER === "" || TASK_MANAGER === "NaN-NaN-NaN") {
		modalInfo("담당자 이름을 입력해주세요.");
		return false;
		}
	
	
 	let callUrl = "/admin/cubici/adminPreference/manageCode_tab2_regist";
	let callBackFunc = "registManagecodeResponse";
	let objParam = {
			FLAG : FLAG, // FLAG (수정, 등록)
			LINKED_NO : LINKED_NO, // PRI_KEY
			LINKED_CODE : LINKED_CODE, // 연계인증번호
			RECOMMENDED_CODE : RECOMMENDED_CODE, // 추천기관 번호
			LINKED_NM : LINKED_NAME, // 연계명
			LINKED_STATUS : LINKED_STATUS, // 운영상태
			FIRM_NM : FIRM_NM, // 회사명
			FIRM_ID : FIRM_ID, // 사업자번호
			REP_NAME : REP_NAME, // 대표이사
			FIRM_ZIP_CODE : FIRM_ZIP_CODE, // 우편번호
			FIRM_ADDR : FIRM_ADDR, // 상세주소
			REGI_DATE : REGI_DATE, // 등록일자
			START_DATE : START_DATE, // 시작 일자
			END_DATE : END_DATE, // 종료 일자
			TASK_MANAGER : TASK_MANAGER, // 책임자
			TASK_MANAGER_POSITION : TASK_MANAGER_POSITION, // 책임자 직급
			TASK_MANAGER_TEL : TASK_MANAGER_TEL, // 책임자 전화
			CS_MANAGER : CS_MANAGER, // 고객지원 담당
			CS_MANAGER_POSITION : CS_MANAGER_POSITION, // 고객지원 담당 직급
			CS_MANAGER_TEL : CS_MANAGER_TEL, // 고객지원 담당 전화
			CS_TEL : CS_TEL, // 전화
			CS_FAX : CS_FAX, // 팩스
			CS_EMAIL : CS_EMAIL, // 이메일
			LINKED_CONTENTS : LINKED_CONTENTS // 연계 내역
 	} 
	
	 cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
	return true;
};

function registManagecodeResponse(data){
	
	return true;
}

function gotoTab2(){
	
	if(getParameters('resultCode') == '0'){
		
		 let LINKED_CODE = getParameters('gototTab2Data').LINKED_CODE;
		 let RECOMMENDED_CODE = getParameters('gototTab2Data').RECOMMENDED_CODE;
		 let LINKED_NM = getParameters('gototTab2Data').LINKED_NM;
		 let LINKED_STATUS = getParameters('gototTab2Data').LINKED_STATUS;
		 let FIRM_NM = getParameters('gototTab2Data').FIRM_NM;
		 let FIRM_ID = getParameters('gototTab2Data').FIRM_ID;
		 let REP_NAME = getParameters('gototTab2Data').REP_NAME;
		 let FIRM_ADDR = getParameters('gototTab2Data').FIRM_ADDR;
		 let FIRM_ZIP_CODE = getParameters('gototTab2Data').FIRM_ZIP_CODE;
		 let REGI_DATE = getParameters('gototTab2Data').REGI_DATE;
		 let START_DATE = getParameters('gototTab2Data').START_DATE;
		 let END_DATE = getParameters('gototTab2Data').END_DATE;
		 let TASK_MANAGER = getParameters('gototTab2Data').TASK_MANAGER;
		 let TASK_MANAGER_POSITION = getParameters('gototTab2Data').TASK_MANAGER_POSITION;
		 let TASK_MANAGER_TEL = getParameters('gototTab2Data').TASK_MANAGER_TEL;
		 let CS_MANAGER = getParameters('gototTab2Data').CS_MANAGER;
		 let CS_MANAGER_POSITION = getParameters('gototTab2Data').CS_MANAGER_POSITION;
		 let CS_MANAGER_TEL = getParameters('gototTab2Data').CS_MANAGER_TEL;
		 let CS_TEL = getParameters('gototTab2Data').CS_TEL;
		 let CS_FAX = getParameters('gototTab2Data').CS_FAX;
		 let CS_EMAIL = getParameters('gototTab2Data').CS_EMAIL;
		 let LINKED_CONTENTS = getParameters('gototTab2Data').LINKED_CONTENTS;
		 
		$('input[id=LINKED_CODE]').attr('value',LINKED_CODE);
		$('input[id=RECOMMENDED_CODE]').attr('value',RECOMMENDED_CODE);
		$('input[id=LINKED_NM]').attr('value',LINKED_NM);
		$('#LINKED_STATUS').val(LINKED_STATUS).prop("selected",true);
		$('input[id=FIRM_NM]').attr('value',FIRM_NM);
		$('input[id=FIRM_ID]').attr('value',FIRM_ID);
		$('input[id=REP_NAME]').attr('value',REP_NAME);
		$('input[id=FIRM_ADDR]').attr('value',FIRM_ADDR);
		$('input[id=FIRM_ZIP_CODE]').attr('value',FIRM_ZIP_CODE);
		$('input[id=REGI_DATE]').attr('value',REGI_DATE);
		$('input[id=START_DATE]').attr('value',START_DATE);
		$('input[id=END_DATE]').attr('value',END_DATE);
		$('input[id=TASK_MANAGER]').attr('value',TASK_MANAGER);
		$('input[id=TASK_MANAGER_POSITION]').attr('value',TASK_MANAGER_POSITION);
		$('input[id=TASK_MANAGER_TEL]').attr('value',TASK_MANAGER_TEL);
		$('input[id=CS_MANAGER]').attr('value',CS_MANAGER);
		$('input[id=CS_MANAGER_POSITION]').attr('value',CS_MANAGER_POSITION);
		$('input[id=CS_MANAGER_TEL]').attr('value',CS_MANAGER_TEL);
		$('input[id=CS_TEL]').attr('value',CS_TEL);
		$('input[id=CS_FAX]').attr('value',CS_FAX);
		$('input[id=CS_EMAIL]').attr('value',CS_EMAIL);
		$('#LINKED_CONTENTS').val(LINKED_CONTENTS);
	}
	
	return false;
}

</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/adminPreference/manageCode_tab1">연계코드</a></li>
        <li  class="active"><a href="/admin/cubici/adminPreference/manageCode_tab2">연계코드 등록</a></li>
    </ul>
</div>

<article class="subBox">
    <header>
        <h4>연계내역</h4>
    </header>
    <div class="contentArea mArticleArea">
        <div class="m-modalGrid">
            <ul class="item">
                <li>
                      <div class="fwBox">
                        <span class="ft">연계인증번호 번호</span>
                        <div class="input">
                            <input type="text" id="LINKED_CODE" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">추천기관 번호</span>
                        <div class="input">
                            <input type="text" id="RECOMMENDED_CODE" value="">
                        </div>
                    </div>
                </li>
                <li></li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>기본 정보</h4>
    </header>
    <div class="contentArea mArticleArea">
        <div class="m-modalGrid">
            <ul class="item">
                <li class="col-2">
                    <div class="fwBox">
                        <span class="ft">연계명</span>
                        <div class="input">
                            <input type="text" id="LINKED_NM" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">운영상태</span>
                        <div class="input">
                            <select id="LINKED_STATUS">
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
                            <input type="text" id="REP_NAME" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li class="btn">
                    <div class="fwBox">
                        <span class="ft">주소</span>
                        <div class="input">
                            <input type="text" placeholder="우편번호 검색" id="FIRM_ZIP_CODE" value="">
                        </div>
                    </div>
                    <div class="fwBtn wide">
                    	<button id="addrSearch" class="sBtn sColorLB search" style="font-size:12px;">찾기</button>
                    </div>
                </li>
                <li class="col-2">
                    <div class="fwBox">
                        <div class="input">
                            <input type="text" placeholder="상세주소" id="FIRM_ADDR" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">등록 일자</span>
                        <div class="input">
                            <input type="text" class="datepicker" id="REGI_DATE" placeholder="등록 일자" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">시작 일자</span>
                        <div class="input">
                            <input type="text" class="datepicker" id="START_DATE" placeholder="시작 일자" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">종료 일자</span>
                        <div class="input">
                            <input type="text" class="datepicker" id="END_DATE" placeholder="종료 일자" value="">
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
                            <input type="text" id="TASK_MANAGER" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">직급</span>
                        <div class="input">
                            <input type="text" id="TASK_MANAGER_POSITION" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">전화</span>
                        <div class="input">
                            <input type="text" id="TASK_MANAGER_TEL" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">고객지원 담당</span>
                        <div class="input">
                            <input type="text" id="CS_MANAGER" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">직급</span>
                        <div class="input">
                            <input type="text" id="CS_MANAGER_POSITION" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">전화</span>
                        <div class="input">
                            <input type="text" id="CS_MANAGER_TEL" value="">
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">전화</span>
                        <div class="input">
                            <input type="text" id="CS_TEL" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">팩스</span>
                        <div class="input">
                            <input type="text" id="CS_FAX" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">이메일</span>
                        <div class="input">
                            <input type="text" id="CS_EMAIL" value="">
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>연계 내역</h4>
    </header>
    <div class="contentArea mArticleArea">
        <article class="m-modalGrid">
            <ul class="item">
                <li>
                    <div class="fwBox textarea">
                        <div class="input">
                            <textarea type="text" id="LINKED_CONTENTS"></textarea>
                        </div>
                    </div>
                </li>
            </ul>
        </article>
    </div>
</article>

<div class="subContentsBtns">
    <a href="javascript:;" class="mBtn sColorN" id="CONFIRM">확인</a>
</div>