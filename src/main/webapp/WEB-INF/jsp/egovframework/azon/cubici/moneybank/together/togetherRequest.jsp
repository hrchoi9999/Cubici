<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
$(document).ready(function(){
	
	// 회원 정보 띄우기
	$("#reqUserId").val("${info.USER_ID}");
	$("#reqUserNm").val("${info.USER_NM}");
	$("#reqFirmId").val("${info.FIRM_ID}");
	$("#reqFirmNm").val("${info.FIRM_NM}");
	
	displayShops();
	
	// 신청 버튼
	$("#submitRequest").on('click', function(){
		
		event.preventDefault();
		
		// 신청 쇼핑몰 리스트를 String으로 변환 후 보내기
		let shopArr = [];
		let shopStr = "";
		$("input[name=checkShop]:checked").each(function(){
			let shops = $(this).val();
			if(shops!=null){
				shopArr.push(shops);
			}
			shopStr = shopArr.toString();
		});
		$("#requestShops").val(shopStr);
		
		// 쇼핑몰 & 업로드 파일 FormData로 정리
		let data = new FormData();
		
		data.append("REQUEST_SHOP", shopStr); // 요청 쇼핑몰
		let bizRegForms = $("#bizRegistFrmFile")[0].files[0]; // 사업자등록증
		let repIdForms = $("#repIdFormFile")[0].files[0]; // 대표자신분증
		data.append("bizRegistForm", bizRegForms);
		data.append("repIdForm", repIdForms);
		
		// 신청 Process
		$.ajax({
			type : "POST",
			enctype : 'multipart/form-data',
			url : "/cubici/moneybank/together/reqInsert",
			data : data,
			processData : false,
			contentType : false,
			cashe: false,
			timeout : 600000,
			success: function(data){
				sendRequest(data);
			},
			error: function(e){
				alert("서비스 점검 중");
			}
		});
		
		/* let callUrl = "/cubici/moneybank/together/reqInsert";
		let callBackFunc = "sendRequest";
		let objParam = {
				REQUEST_SHOP : shopStr
		} */
		// cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
});

// 신청 가능 쇼핑몰 표기
function displayShops(){
	let currShops = ("${shop}").split(",");
	
	let shopHtml = "";
	
	for(let i = 0; i<currShops.length; i++){
		if(currShops[i] == "3"){
			shopHtml += '<div class="labelBox"><label class="checkBox"><input type="checkbox" name="checkShop" value="3"><span>';
			shopHtml += '<img src="/resources/rudicks/img/partner-color/partner-sq-auction.jpg" alt="옥션">옥션</span></label></div>';			
		}
		if(currShops[i] == "14"){
			shopHtml += '<div class="labelBox"><label class="checkBox"><input type="checkbox" name="checkShop" value="14"><span>';
			shopHtml += '<img src="/resources/rudicks/img/partner-color/partner-sq-naver.jpg" alt="네이버">네이버</span></label></div>';			
		}
		if(currShops[i] == "2"){
			shopHtml += '<div class="labelBox"><label class="checkBox"><input type="checkbox" name="checkShop" value="2"><span>';
			shopHtml += '<img src="/resources/rudicks/img/partner-color/partner-sq-gmarket.jpg" alt="지마켓">지마켓</span></label></div>';			
		}
		if(currShops[i] == "4"){
			shopHtml += '<div class="labelBox"><label class="checkBox"><input type="checkbox" name="checkShop" value="4"><span>';
			shopHtml += '<img src="/resources/rudicks/img/partner-color/partner-sq-11st.jpg" alt="11번가">11번가</span></label></div>';			
		}
		if(currShops[i] == "1"){
			shopHtml += '<div class="labelBox"><label class="checkBox"><input type="checkbox" name="checkShop" value="1"><span>';
			shopHtml += '<img src="/resources/rudicks/img/partner-color/partner-sq-interpark.jpg" alt="인터파크">인터파크</span></label></div>';			
		}
		if(currShops[i] == "11"){
			shopHtml += '<div class="labelBox"><label class="checkBox"><input type="checkbox" name="checkShop" value="11"><span>';
			shopHtml += '<img src="/resources/rudicks/img/partner-color/partner-sq-coupang.jpg" alt="쿠팡">쿠팡</span></label></div>';			
		}
	}
	$("#checkShop").html(shopHtml);
}

// 신청 결과 알림 Func
function sendRequest(result){
	if(result.insertCode==0){
		modalInfo("신청 되었습니다!");
	}else if(result.insertCode == 66){
		modalInfo("신청 가능 대상이 아닙니다!");
	}else if(result.insertCode == 55){
		modalInfo("이미 서비스를 신청하셨습니다.");
	}else if(result.insertCode == 99){
		modalInfo("시스템 점검 중입니다.");
	}
}
</script>

<div class="m-tab">
    <ul>
        <li><a href="javascript:;">회원가입</a></li>
        <li class="active"><a href="/cubici/moneybank/together/request">단비펀드 신청</a></li>
        <li><a href="/cubici/moneybank/together/documentNotice">서류 제출 안내</a></li>
    </ul>
</div>

<article class="subBox">
    <div class="contentArea">
        <div class="m-modalGrid">
            <ul class="item">
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">아이디</span>
                        <div class="input">
                            <input type="text" id="reqUserId" readonly></input>
                        </div>
                    </div>
                </li>
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">사업자등록번호</span>
                        <div class="input">
                            <input type="text" id="reqFirmId" readonly></input>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">대표자명</span>
                        <div class="input">
                            <input type="text" id="reqUserNm" readonly></input>
                        </div>
                    </div>
                </li>
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">상호</span>
                        <div class="input">
                            <input type="text" id="reqFirmNm" readonly></input>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li class="col-1">
                    <div class="fwBox autoHeight">
                        <div class="ft">
                            <span class="infoArea">
                                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
                                <div class="infoMemo">
                                    <div class="iCon">
                                        선정산 신청은 회원가입 시 등록하신<br>
                                        사업자등록증 번호를 기준으로 선택하신
                                        쇼핑몰 단위로 선정산 서비스를 운영되고
                                        있습니다.” 
                                    </div>
                                </div>
                            </span>
                            <p>
                               운영 쇼핑몰<br>
                               선정산 대상
                            </p>
                        </div>
                        <div class="input">
                            <p class="guide">* 운영하시고 계시는 쇼핑몰의 머니뱅크 이용 여부를 선택해 주십시오. 대상 쇼핑몰이 많을 수록 이용금액이 커질 수 있습니다.</p>
                            <div class="checkArea" id="checkShop"></div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>신청서류 제출</h4>
    </header>
    <div class="contentArea">
	    <div class="m-modalGrid">
            <ul class="item">
                <li class="col-1 btn file">
                    <div class="fwBox">
                        <span class="ft">사업자등록증</span>
                        <div class="input">
                            <input type="text" readonly>
                        </div>
                    </div>
                    <div class="fwBtn">
                        <label class="fileBtn">
                            <input type="file" id="bizRegistFrmFile">
                            <span class="sBtn sColorLB">파일찾기</span>
                        </label>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li class="col-1 btn file">
                    <div class="fwBox">
                        <span class="ft">대표자 신분증</span>
                        <div class="input">
                            <input type="text" readonly>
                        </div>
                    </div>
                    <div class="fwBtn">
                        <label class="fileBtn">
                            <input type="file" id="repIdFormFile">
                            <span class="sBtn sColorLB">파일찾기</span>
                        </label>
                    </div>
                </li>
            </ul>
            <p class="guide center">* 신청서류는 3mb 이하의 사이즈로 pdf, jpg, png파일로 올려 주십시오.</p>
        </div>
    </div>
</article>

<article class="subBox">
    <div class="contentArea">
       <div class="confrimImgBox">
           <div class="txtBox">
                <p class="t1">
                    머니뱅크 신청 정보와 머니뱅크 이용 쇼핑몰 여부를 <br>
                    정상적으로 제출하였음을 확인하며 머니뱅크 서비스를 신청합니다.
                </p>
                <p class="date">2021년 3월 10일</p>
                <p class="t1">서비스 진행을 위해 필요한 서류는 <b>“서비스 신청”</b>을 클릭해서 참고해 주십시오.</p>
                <p class="t2">감사합니다!</p>
           </div>
       </div>
    </div>
</article>

<div class="subContentsBtns">
    <a href="/moneybank/intro" class="mBtn sColorN">이전</a>
    <a href="/moneybank/intro" class="mBtn sColorF">취소</a>
    <a href="javascript:;" class="mBtn sColorLB" id="submitRequest">서비스 신청</a>
</div>


<!-- 머니뱅크 블록 (MKC 2021.04.27) -->
<div class="modal-container alert alert-pass" id="alert-pass">
    <div class="modal-wrapper">
        <header>
            <h2>서비스 안내</h2>
        </header>
        <div class="alert-content">
            <div class="alert-txt">
                <div class="icon">
                    <img src="/resources/rudicks/img/icon/alert-info.svg" alt="안내">
                </div>
                <div class="txtBox">
                    머니뱅크 선정산 서비스 제공을 위하여 금융망과의 연동이 진행되고 있습니다. 서비스 제공이 늦어져서 대단히 죄송합니다. 
                    <br>  <br>
                    다소 시간이 걸리더라도 정확한 서비스가 될 수 있도록 노력하겠습니다. 감사합니다. 
                </div>
            </div>
            <div class="btnArea">
                <a href="/moneybank/intro" class="modalClose sBtn sColorLS2">확인</a>
            </div>
        </div>
    </div>
</div>