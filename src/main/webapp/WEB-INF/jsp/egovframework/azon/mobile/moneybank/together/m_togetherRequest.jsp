<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<script>
$(document).ready(function(){
	
	// 회원 정보 띄우기
	$("#reqUserId").val("${info.USER_ID}");
	$("#reqUserNm").val("${info.USER_NM}");
	$("#reqFirmId").val("${info.FIRM_ID}");
	$("#reqFirmNm").val("${info.FIRM_NM}");
	
	displayShops();
	
	$("#submitRequest").on('click', function(){
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
		
	});
});

//신청 가능 쇼핑몰 표기
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

// 신청 확인
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
        <li class="active"><a href="/m/cubici/moneybank/together/request">단비펀드 신청</a></li>
        <li><a href="/m/cubici/moneybank/together/documentNotice">서류 제출 안내</a></li>
    </ul>
</div>

<article class="subBox transparent">
    <div class="m-modalGrid mArticleArea">
        <article>
            <ul class="item vertical">
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">아이디</span>
                        <div class="input">
                            <input type="text" id="reqUserId" readonly>
                        </div>
                    </div>
                </li>
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">사업자등록번호</span>
                        <div class="input">
                            <input type="text" id="reqFirmId" readonly>
                        </div>
                    </div>
                </li>
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">대표자명</span>
                        <div class="input">
                            <input type="text" id="reqUserNm" readonly>
                        </div>
                    </div>
                </li>
                <li class="col-1">
                    <div class="fwBox">
                        <span class="ft">상호</span>
                        <div class="input">
                            <input type="text" id="reqFirmNm" readonly>
                        </div>
                    </div>
                </li>
            </ul>
        </article>

        <article>
            <header>
                <h3>운영 쇼핑몰 선정산 대상</h3>    
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
            </header>
            <div class="contentArea">
                <ul class="item">
                    <li class="col-1">
                        <div class="fwBox autoHeight hasContents">
                            <div class="input">
                                <p class="guide">* 운영하시고 계시는 쇼핑몰의 머니뱅크 이용 여부를 선택해 주십시오. 대상 쇼핑몰이 많을 수록 이용금액이 커질 수 있습니다.</p>
                                <div class="checkArea" id="checkShop"></div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </article>
    </div>
</article>

<article class="subBox transparent">
    <header>
        <h4>신청서류 제출</h4>
    </header>
    <div class="contentArea">
    	<form id="file_form" method="post" enctype="multipart/form-data">
        <div class="m-modalGrid">
            <ul class="item">
                <li class="col-1 btn file">
                    <div class="fwBox">
                        <span class="ft">사업자등록증</span>
                        <div class="input">
                            <input type="text" id="bizRegistFrmStr" readonly>
                        </div>
                    </div>
                    <div class="fwBtn">
                        <label class="fileBtn">
                            <input type="file" id="bizRegistFrmFile">
                            <span class="mBtn sColorLB">파일찾기</span>
                        </label>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li class="col-1 btn file">
                    <div class="fwBox">
                        <span class="ft">대표자 신분증</span>
                        <div class="input">
                            <input type="text" id="repIdFormStr" readonly>
                        </div>
                    </div>
                    <div class="fwBtn">
                        <label class="fileBtn">
                            <input type="file" id="repIdFormFile">
                            <span class="mBtn sColorLB">파일찾기</span>
                        </label>
                    </div>
                </li>
            </ul>
            <p class="guide center">* 신청서류는 3mb 이하의 사이즈로 pdf, jpg, png파일로 올려 주십시오.</p>
        </div>
     	</form>
        <div class="confrimImgBox">
            <div class="imgBox">
                <img src="/resources/rudicks/img/sub/confrim-img01.png" alt="">
            </div>
            <div class="txtBox">
                 <p class="t1">
                     머니뱅크 신청 정보와 머니뱅크 이용 쇼핑몰 여부를 <br>
                     정상적으로 제출하였음을 확인하며 머니뱅크 서비스를 신청합니다.
                     <br> <br>
                     2021년 3월 10일
                     <br> <br>
                 </p>
                 <p class="t1">서비스 진행을 위해 필요한 서류는<br> <b>“서비스 신청”</b>을 클릭해서 참고해 주십시오.</p>
                 <p class="t2">감사합니다!</p>
            </div>
        </div>
    </div>
</article>



<div class="subContentsBtns">
    <a href="javascript:;" class="mBtn sColorN">이전</a>
    <a href="javascript:;" class="mBtn sColorF">취소</a>
    <a href="javascript:;" class="mBtn sColorLB modalOpen" data-modal="alert-moneybank" id="submitRequest">서비스 신청</a>
</div>