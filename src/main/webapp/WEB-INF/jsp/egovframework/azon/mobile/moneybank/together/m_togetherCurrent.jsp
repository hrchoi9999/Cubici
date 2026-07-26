<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<script>

$(document).ready(function(){
	selectLog();
})

// 현황 데이터 가져오기
function selectLog(){
	
	let callUrl = "/cubici/moneybank/together/current/get";
	let callBackFunc = "repayHistoryReponse";
	let objParam = {};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

// 현황 데이터 테이블
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
	    
	    if(repayLog[0] == null){
	    	repayHistoryHtml+= '<tr align="left"><td colSpan="8">데이터가 없습니다.</td></tr>';
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
	
	// 이용현황 테이블
	let useLog = data.useLog;
	let useLogHtml = "";	
	useLogHtml+='<table class="m-baseTable"><colgroup><col width="2%"></colgroup><thead>';
	useLogHtml+='<tr><th>회차</t><th>일자</t><th>선정산 총액</t><th>서비스 기간</t><th>수수료 율</t><th>상태</t></tr></thead>';
	useLogHtml+='<tbody>';
	    
	if(useLog[0].APPROVAL_DATE == null){
		useLogHtml+='<tr align="left"><td colSpan="6">데이터가 없습니다.</td></tr>';		
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

// 선정산 중인 쇼핑몰만 보여주기
function getShopList(shopList){
	let shopHtml = '<ul class="imgTxtList">';
	for(let i = 0; i<shopList.length; i++){
		let thisShop = shopList[i];
		if(thisShop == 1){
			shopHtml += '<li><span><img src="/resources/rudicks/img/partner-color/partner-sq-interpark.jpg" alt="인터파크"><b>인터파크</b></span></li>';
			continue;
		}
		if(thisShop == 2){
			shopHtml += '<li><span><img src="/resources/rudicks/img/partner-color/partner-sq-gmarket.jpg" alt="지마켓"><b>지마켓</b></span></li>';
			continue;
		}
		if(thisShop == 3){
			shopHtml += '<li><span><img src="/resources/rudicks/img/partner-color/partner-sq-auction.jpg" alt="옥션"><b>옥션</b></span></li>';
			continue;
		}
		if(thisShop == 4){
			shopHtml += '<li><span><img src="/resources/rudicks/img/partner-color/partner-sq-11st.jpg" alt="11번가"><b>11번가</b></span></li>';
			continue;
		}
		if(thisShop == 11){
			shopHtml += '<li><span><img src="/resources/rudicks/img/partner-color/partner-sq-coupang.jpg" alt="쿠팡"><b>쿠팡</b></span></li>';
			continue;
		}
		if(thisShop == 14){
			shopHtml += '<li><span><img src="/resources/rudicks/img/partner-color/partner-sq-naver.jpg" alt="네이버"><b>네이버</b></span></li>';
			continue;
		}
	}
	shopHtml += '</ul>';
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
                <header class="m-options">
                    <h3>기본정보</h3>
                    <span class="baseDate pRight"><b>기준</b>${standard_date}</span>
                </header>
                <div class="contentsArea">
                    <ul class="item vertical">
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
                                <span class="ft">수수료 율 (일)</span>
                                <div class="input">
                                    <span id="dailyFee"></span>
                                </div>
                            </div>
                        </li>
                        <li class="btn">
                            <a href="javascript:;" class="bBtn wBtn sColorLB">계약서 다운로드</a>
                        </li>
                    </ul>
                    <ul class="item">
                        <li class="col-1">
                            <div class="fwBox autoHeight">
                                <div class="ft">대상 쇼핑몰</div>
                                <div class="input" id="reqShopList"></div>
                            </div>
                        </li>
                    </ul>
                </div>
            </article>
            <article>
                <header>
                    <h3>선정산 현황</h3>
                    <span class="infoArea">
                        <a href="javascript:;" class="oiBtn infoBtn question">정보</a>
                        <div class="infoMemo">
                            <div class="iCon">
                                현재 이용하고 계산 선정산 상환진행 내역입니다. 
                            </div>
                        </div>
                    </span>
                </header>
                <div class="contentsArea">
                    <div class="maxHeight" id="repayHistoryTable"></div>
                </div>
            </article>

            <article>
                <header>
                    <h3>서비스 이용 이력</h3>
                </header>
                <div class="maxHeight" id="useLogTable"></div>
            </article>
        </div>
    </div>
</div>
