<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>

$(document).ready(function(){
	// 현황 & 이력 표시
	selectLog();
})

// 현황 & 이력 데이터 가져오기 Func
function selectLog(){
	let callUrl = "/cubici/moneybank/together/current/get";
	let callBackFunc = "repayHistoryReponse";
	let objParam = {};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 이용현황 & 이용이력 테이블 Func
function repayHistoryReponse(data){
	
	// 기본정보
	$("#totalPayment").text(comma(data.userInfo.TOTAL_PAYMENT)+" 원"); // 선정산 원금
	$("#userName").text(data.userInfo.USER_NM); // 계약자
	$("#approvalDate").text(data.userInfo.APPROVAL_DATE); // 선정산 시작일
	$("#dailyFee").text(data.userInfo.DAILY_USAGE_FEE); // 수수료율
	
	// 대상 쇼핑몰
	let shopList = data.userInfo.REQUEST_SHOP.split(",");
	getShopList(shopList);
	
	// 선정산 현황
	let repayLog = data.repayLog;
	let repayHistoryHtml = "";	
	repayHistoryHtml += '<table class="m-baseTable"><colgroup><col width="5%"></colgroup>';
	repayHistoryHtml += '<thead><tr><th>회차</t><th>일자</t><th>상환입금</t><th>상환필요액</t>';
	repayHistoryHtml += '<th>원금 상환</t><th>이용수수료</t><th>원금잔액</t><th>상태</t></tr></thead>';
	repayHistoryHtml += '<tbody>';
	    
	    if(repayLog == null){
	    	repayHistoryHtml+= '<tr><td colSpan="8">데이터가 없습니다.</td></tr>'
	    }else{
		    for(let i = 0; i<repayLog.length; i++){
		    	let thisLog = repayLog[i];
		    	repayHistoryHtml += '<tr>';
		    	repayHistoryHtml += '<td>1</td>';
		    	repayHistoryHtml += '<td>'+thisLog.REPAYMENT_DATE+'</td>';
		    	repayHistoryHtml += '<td class="num">'+thisLog.TOTAL_REPAYMENT_AMOUNT+'</td>';
		    	repayHistoryHtml += '<td class="num">$$상환필요금액</td>';
		    	repayHistoryHtml += '<td class="num">'+thisLog.ORIGINAL_AMOUNT+'</td>';
		    	repayHistoryHtml += '<td class="num">'+thisLog.FEE_AMOUNT+'</td>';
		    	repayHistoryHtml += '<td class="num">'+thisLog.ORIGINAL_REMAINING_AMOUNT+'</td>';
		    	repayHistoryHtml += '<td>02</td>';
		        repayHistoryHtml += '</tr>';
		    }
	    }
	repayHistoryHtml += '</tbody>';
	repayHistoryHtml +=	'<tfoot><tr>';
	repayHistoryHtml +=	'<th colspan="2">Total</th>';
	repayHistoryHtml +=	'<th>$$상환원금TOTAL</th>';
	repayHistoryHtml +=	'<th>$$TOTAL</th>';
	repayHistoryHtml +=	'<th>-</th>';
	repayHistoryHtml +=	'<th>-</th>';
	repayHistoryHtml +=	'<th>$$TOTAL</th>';
	repayHistoryHtml +=	'<th>-</th>';
	repayHistoryHtml +=	'</tr></tfoot></table>';
	
	/* <tr class="bgBlue">
	      <td>오늘</td>
	      <td>21/02/16</td>
	      <td class="num">1,500,000</td>
	      <td class="num">2,560,920</td>
	      <td class="num">560,920</td>
	      <td class="num">9,920</td>
	      <td class="num">2,560,920</td>
	      <td>상환</td>
	</tr> */
	
	// 이용현황
	let useLog = data.useLog;
	let useLogHtml = "";	
	useLogHtml+='<table class="m-baseTable"><colgroup><col width="2%"></colgroup><thead>';
	useLogHtml+='<tr><th>회차</t><th>일자</t><th>선정산 총액</t><th>서비스 기간</t><th>수수료 율</t><th>상태</t></tr></thead>';
	useLogHtml+='<tbody>';
	    
	if(useLog == null){
		useLogHtml+='<tr><td colSpan="6">데이터가 없습니다.</td></tr>'		
	}else{
		for(let i = 0; i<useLog.length; i++){
			let thisMap = useLog[i];
			useLogHtml+= '<tr>';
			useLogHtml+= '<td>1</td>';
			useLogHtml+= '<td>'+thisMap.APPROVAL_DATE+'</td>';
			useLogHtml+= '<td>'+thisMap.TOTAL_PAYMENT+' 원</td>';
			useLogHtml+= '<td>'+thisMap.USAGE_PERIOD+' 일</td>';
			useLogHtml+= '<td>'+thisMap.DAILY_USAGE_FEE+' %</td>';
			useLogHtml+= '<td>'+thisMap.FINAL_REPAYMENT_YN+'</td>';
			useLogHtml+= '</tr>';
		}
	}    
	useLogHtml+= '</tbody></table>';
	$("#repayHistoryTable").html(repayHistoryHtml);
	$("#useLogTable").html(useLogHtml);
}

function getShopList(shopList){
	let shopHtml = "";
	for(let i = 0; i<shopList.length; i++){
		let thisShop = shopList[i];
		if(thisShop == 1){
			shopHtml += '<span><img src="/resources/rudicks/img/partner-color/partner-sq-interpark.jpg" alt="인터파크"><b>인터파크</b></span>';
			continue;
		}
		if(thisShop == 2){
			shopHtml += '<span><img src="/resources/rudicks/img/partner-color/partner-sq-gmarket.jpg" alt="지마켓"><b>지마켓</b></span>';
			continue;
		}
		if(thisShop == 3){
			shopHtml += '<span><img src="/resources/rudicks/img/partner-color/partner-sq-auction.jpg" alt="옥션"><b>옥션</b></span>';
			continue;
		}
		if(thisShop == 4){
			shopHtml += '<span><img src="/resources/rudicks/img/partner-color/partner-sq-11st.jpg" alt="11번가"><b>11번가</b></span>';
			continue;
		}
		if(thisShop == 11){
			shopHtml += '<span><img src="/resources/rudicks/img/partner-color/partner-sq-coupang.jpg" alt="쿠팡"><b>쿠팡</b></span>';
			continue;
		}
		if(thisShop == 14){
			shopHtml += '<span><img src="/resources/rudicks/img/partner-color/partner-sq-naver.jpg" alt="네이버"><b>네이버</b></span>';
			continue;
		}
	}
	$('#reqShopList').html(shopHtml);
}
</script>

<div class="subBox">
    <header>
        <h4>단비펀드 이용현황</h4>
    </header>
    <div class="contentArea">
        <div class="mArticleArea">
            <article class="m-modalGrid">
                <header>
                    <h3>기본정보</h3>
                </header>
                <div class="contentsArea">
                    <div class="item-col">
                        <div class="col-5">
                            <ul class="item">
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">선정산 원금</span>
                                        <div class="input">
                                            <span id="totalPayment"> 원</span>
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">계약자</span>
                                        <div class="input">
                                            <span id="userName"></span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <ul class="item">
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">선정산 시작일</span>
                                        <div class="input">
                                            <span id="approvalDate"></span>
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">수수료율 (일)</span>
                                        <div class="input">
                                            <span id="dailyFee"></span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="col-1">
                            <div class="btnBox">
                                <a href="javascript:;" class="bBtn sColorLB">계약서 다운로드</a>
                            </div>
                        </div>
                    </div>
                    <ul class="item">
                        <li class="col-1">
                            <div class="fwBox autoHeight">
                                <div class="ft">대상 쇼핑몰</div>
                                <div class="input">
                                    <div class="imgTxtList" id="reqShopList"></div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </article>
            <article>
                <header>
                    <h3>선정산 현황</h3>
                </header>
                <div class="contentsArea">
                    <div class="maxHeight" id="repayHistoryTable">
                        
                    </div>
                </div>
            </article>

        </div>
    </div>
</div>

<div class="subBox">
	<header>
    	<h4>서비스 이용 이력</h4>
    </header>
    <div class="contentArea">
        <div class="mArticleArea">
            <div class="maxHeight" id="useLogTable"></div>
        </div>
    </div>
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