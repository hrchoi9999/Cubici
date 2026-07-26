<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
let SHOPFLAG = '';//큐빅 코드가 없을때 저장시 사용
let MSProductNo = '';//큐빅 코드가 없을때 저장시 사용
let StockCheck = '';//STOCK GOODS 여부 확인

$(document).ready(function(){
	$('tbody[name="prdDet"]').html('');
	let all_price = 0;
	let priceValue = '';
	//상품정보 >> cubici_code inventoList
	if(${not empty inventoList}){
		let img_url = "";
		if ('${inventoList[0].SHOP}' == '네이버'){
			img_url = "<img src='/" + '${inventoList[0].PRODUCT_IMG}' + "' alt='' />";
		} else if ('${inventoList[0].SHOP}' == '쿠팡'){
			img_url = "<img src='https://image6.coupangcdn.com/image/" + '${inventoList[0].PRODUCT_IMG}' + "' alt='' />";
		} else if ('${inventoList[0].SHOP}' == '옥션' || '${inventoList[0].SHOP}' == '11ST'){
			img_url = "<img src='/resources/rudicks/img/logo.svg' alt='' />";
		} else if ('${inventoList[0].SHOP}' == '지마켓'){
			if('${inventoList[0].PRODUCT_IMG}' == ''){
				img_url = "<img src='/resources/rudicks/img/logo.svg' alt='' />";				
			}else{
				img_url = "<img src='" + '${inventoList[0].PRODUCT_IMG}' + "' alt='' />"				
			}
		} else if ('${inventoList[0].SHOP}' == '인터파크'){
			img_url = "<img src='" + '${inventoList[0].PRODUCT_IMG}' + "' alt='' />"
		}
		
		$('#prd_img').find('i').empty().html(img_url);
		$('#prd_nm').val('${inventoList[0].PRODUCT_NAME}');
		$('#prd_brand').val('${inventoList[0].BRAND}');
		$('#avg_price').val(comma('${inventoList[0].PRICE}'));
		$('#seller_code').val('${inventoList[0].MANAGE_CODE}');
		$('#cubici_code').val('${inventoList[0].CUBICI_CODE}');
		$('#sales_status').val('${inventoList[0].STATUS}');
		if(parseInt(${inventoList[0].HEAD_INVEN}) > 0) {
			$('#seller_stock').val(comma('${inventoList[0].HEAD_INVEN}'));
		} else {
			$('#seller_stock').val("");
		}
		$('#option1').val('${inventoList[0].OPTION1}');
		$('#option2').val('${inventoList[0].OPTION2}');
		$('#option3').val('${inventoList[0].OPTION3}');
		
		SHOPFLAG = '${inventoList[0].SHOP_TYPE}';
		MSProductNo = '${inventoList[0].PRODUCT_NO}';
		StockCheck = '${inventoList[0].DIVISION}';
		StockCheck = StockCheck.substring(StockCheck.length-5, StockCheck.length);
	}
		 
	//매칭 list
	if(${fn:length(matchList)} == 0){
		trHtml = '<tr>';
		trHtml += '<input id="c_code" type="hidden" value="${inventoList[0].CUBICI_CODE}">';
		trHtml += '<input id="shop_id" type="hidden" value="${inventoList[0].SHOP_ID}">';
		trHtml += '<input id="division" type="hidden" value="${inventoList[0].DIVISION}">';
		trHtml += '<td colspan="7"> 매칭 상품이 없습니다  </td></tr>';
		$('#prdMatchingList').empty().html(trHtml);
	}else if(${fn:length(matchList)} > 0){
		
		for(i=0; i < ${fn:length(matchList)}; i++){
			priceValue = $('#priceRow_'+i).text().replace(/,/g, "");
			all_price += parseInt(priceValue);
		}
		
	}
	
	// 평균가격 반영
	if(all_price > 0){
		$('#avg_price').val(comma(Math.floor(all_price/${fn:length(matchList)})));
	}
		
});

//저장확인 모달
function openAlertDetail(){
	$('#alert-confirm').addClass('active');
	$("#alert-confirm").css('display','block');
}

//매칭 해체 row 선택
function removeRow(obj, index){
	if($(obj).attr("checked") == "checked"){
		$(obj).attr("checked", false);
		$('#deleteRow_'+index).val('');
	} else {
		$(obj).attr("checked", true);
		$('#deleteRow_'+index).val('Y');
	}
}

//모달에서 저장하기 눌러야 수정사항 저장되도록 수정 ( 본사재고, 매칭해제 )
function detailSave(){
	
	let list = new Array();
	let delCnt = 0;
	let nonDelCnt = 0;
	let num = 0;
	let FLAG = "DEL";
	
	if(StockCheck == "STOCK" && $("#cubici_code").val() == ""){
		modalInfo("현제 상품 분석중 입니다. 잠시후 시도해주세요.");
		return false;
	}
	
	$("#prdMatchingList tr").each(function (index, item) {
		if($('#deleteRow_'+index).val() == 'Y') {
			let data = new Array();
			
			let cubiciCode = $("#prdMatchingList tr").eq(index).find('td').eq(0).find('input').eq(0).val();
			let shopId = $("#prdMatchingList tr").eq(index).find('td').eq(0).find('input').eq(1).val();
			let division = $("#prdMatchingList tr").eq(index).find('td').eq(0).find('input').eq(2).val();
			data.push(cubiciCode);
			data.push(shopId);
			data.push(division);
			
			list.push(data);
			
			nonDelCnt++;
		} else if($('#deleteRow_'+index).val() == 'N') {
			delCnt++;
			num = index;
		}
	});
	if(delCnt == 1) { //매칭코드 하나 남은 경우 해당 row도 추가
		let data = new Array();
		
		let cubiciCode = $("#prdMatchingList tr").eq(num).find('td').eq(0).find('input').eq(0).val();
		let shopId = $("#prdMatchingList tr").eq(num).find('td').eq(0).find('input').eq(1).val();
		let division = $("#prdMatchingList tr").eq(num).find('td').eq(0).find('input').eq(2).val();
		
		data.push(cubiciCode);
		data.push(shopId);
		data.push(division);
		
		list.push(data);
	} 	
 	if ( nonDelCnt == 0 && $('#prdMatchingList td').length > 1) { //삭제 row 하나도 없을 경우
		let data = new Array();
		
		let cubiciCode = $("#prdMatchingList tr").find('input').eq(0).val();
		let shopId = $("#prdMatchingList tr").find('input').eq(1).val();
		let division = $("#prdMatchingList tr").find('input').eq(2).val();
		
		data.push(cubiciCode);
		data.push(shopId);
		data.push(division);
		
		list.push(data);
		
		FLAG = "INVEN_UPDATE";
	} 
 	
 	if ($('#prdMatchingList td').length < 2) { //매칭 상품 없는경우
 		let data = new Array();
 	
 		let cubiciCode = $('#c_code').val();
		let shopId = $('#shop_id').val();
		let division = $('#division').val();
		
		data.push(cubiciCode);
		data.push(shopId);
		data.push(division);
		
		list.push(data);
		
		FLAG = "INVEN_UPDATE";
 	}
 	
	let HEAD_INVEN = 0; // 재고
	if(parseInt($('#seller_stock').val()) > 0){
		HEAD_INVEN = $('#seller_stock').val();
	}
	
	let callUrl = "/cubici/invento/removeMatching";
	let callBackFunc = "removeMatchingResponse";
	let objParam = {
			list : list,
			matchedCnt : delCnt,
			HEAD_INVEN : HEAD_INVEN.replace(/,/g,""),
			FLAG : FLAG,
			SHOPFLAG : SHOPFLAG,
			PRODUCT_NO : MSProductNo
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function removeMatchingResponse(data){
	if(data.resultCode == 0) {
		$(location).attr("href", "<c:url value='/m/cubici/invento/index' />");
	}
}
</script>

<div class="subBox transparent">
    <header>
        <h4>상품 상세정보</h4>
        <div class="btns">
            <a onclick="history.back();" class="oiBtn back">뒤로</a>
        </div>
    </header>
    <div class="contentArea">
        <div class="mArticleArea">
            <article class="m-modalGrid">
                <header>
                    <h3>상품정보</h3>
                   
                </header>
                <div class="contentsArea">
                    <div id="prd_img" class="thumbBox">
                    	<i></i>
                    </div>
                    <ul class="item vertical">
                        <li class="col-1">
                            <div class="fwBox">
                                <span class="ft">상품명</span>
                                <div class="input">
                                    <input id="prd_nm" type="text" readonly>
                                </div>
                            </div>
                        </li>
                        <li class="col-1">
                            <div class="fwBox">
                                <span class="ft">상품설명</span>
                                <div class="input">
                                    <input type="text" readonly value="">
                                </div>
                            </div>
                        </li>
                        <li class="col-1">
                            <div class="fwBox">
                                <span class="ft">브랜드</span>
                                <div class="input">
                                    <input id="prd_brand" type="text" readonly>
                                </div>
                            </div>
                        </li>
                        <li class="col-1">
                            <div class="fwBox">
                                <span class="ft">평균판매가격</span>
                                <div class="input">
                                    <input id="avg_price" type="text" readonly>
                                </div>
                            </div>
                        </li>
                        <li class="col-1">
                            <div class="fwBox">
                                <span class="ft">내부관리번호</span>
                                <div class="input">
                                    <input id="seller_code" type="text" readonly>
                                </div>
                            </div>
                        </li>
                        <li class="col-1">
                            <div class="fwBox">
                                <span class="ft">큐빅아이코드</span>
                                <div class="input">
                                    <input id="cubici_code" type="text" readonly>
                                </div>
                            </div>
                        </li>
                        <!-- <li class="btns">
                            <a href="javascript:;" class="mBtn wBtn sColorLB modalOpen" data-modal="alert-confirm">정보수정</a>
                        </li> -->
                    </ul>
                </div>
            </article>
            <article class="m-modalGrid">
                <header>
                    <h3>상세 정보</h3>
                </header>
                <div class="contentsArea">
                    <ul class="item vertical">
                        <li>
                            <div class="fwBox">
                                <span class="ft">판매상태</span>
                                <div class="input">
                                    <!-- <select>
                                        <option value="">판매 중</option>
                                    </select> -->
                                    <input id="sales_status" readonly type="text">
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="fwBox">
                                <span class="ft">상품상태</span>
                                <div class="input">
                                    <input type="text" readonly value="">
                                </div>
                            </div>
                        </li>
                        <li class="btn">
                            <div class="fwBox">
                                <span class="ft">본사재고</span>
                                <div class="input unit">
                                    <input id="seller_stock" type="text" placeholder="수량입력" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                    <span class="unitBox infoArea">
                                        <a href="javascript:;" class="oiBtn infoBtn navy">정보</a>
                                        <div class="infoMemo">
                                            <h5 class="mt"><span>본사재고 관리</span></h5>
                                            <div class="iCon">
                                                <p>
                                                    본사 재고수량 입력 시, 쇼핑몰 매출에
                                                    따라 자동적으로 그 수량을 감소합니다.
                                                    다만, 본사재고 재입고시,
                                                    그 수량을 수정해 주셔야 합니다.
                                                </p>
                                            </div>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="fwBox">
                                <span class="ft">옵션1</span>
                                <div class="input">
                                    <input id="option1" type="text" readonly>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="fwBox">
                                <span class="ft">옵션2</span>
                                <div class="input">
                                    <input id="option2" type="text" readonly>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="fwBox">
                                <span class="ft">옵션3</span>
                                <div class="input">
                                    <input id="option3" type="text" readonly>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </article>
            <article>
                <header>
                    <h3>쇼핑몰 등록 정보</h3>
                    <span class="infoArea">
                        <a href="javascript:;" class="oiBtn infoBtn" >정보</a>
                        <div class="infoMemo">
                            <h5 class="mt"><span>상품매칭</span></h5>
                            <div class="iCon">
                                등록된 상품의 내부관리코드가 있을 경우, 자동으로 상품을 매칭처리하고 있습니다. 만일 동일한 상품이 아닐 경우, "해제"를 클릭해주십시오.
                            </div>
                        </div>
                    </span>
                </header>
                <div class="contentsArea">
                    <div class="maxHeight">
                        <table class="m-baseTable">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>상품번호</th>
                                    <th>쇼핑몰 상품명</th>
                                    <th>카테고리</th>
                                    <th>판매가격</th>
                                    <th>재고수량</th>
                                        <!-- <span class="infoArea">
                                            <a href="javascript:;" class="oiBtn infoBtn white">정보</a>
                                            <div class="infoMemo">
                                                <h5 class="mt"><span>쇼핑몰 재고수량</span></h5>
                                                <div class="iCon">
                                                    <p>
                                                        쇼핑몰 재고수량은 큐빅아이에
                                                        등록하신 쇼핑몰 중 가장 낮은
                                                        재고수량을 기준으로 표시됩니다.
                                                    </p>
                                                </div>
                                            </div>
                                        </span> -->
                                    <th>해제</th>
                                </tr>
                            </thead>
                            <tbody id="prdMatchingList">
                            	<c:if test="${fn:length(matchList) gt 0}">
                            		<c:forEach var="item" items="${matchList}" varStatus="indexNum">
	                            		<tr>
	                            			<td style="display:none;">
	                            				<div class="tIn">
													<input type="hidden" value="${item.CUBICI_CODE}">
													<input type="hidden" value="${item.SHOP_ID}">
													<input type="hidden" value="${item.DIVISION}">
												</div>
											</td>
											<td>
												<div class="tIn"> ${item.SHOP} </div>
											</td>
											<td>
												<div class="tIn"> ${item.PRODUCT_NO} </div>
											</td>
											<td>
												<div class="tIn"> ${item.PRODUCT_NAME} </div>
											</td>
											<td>
												<div class="tIn"> ${item.CATEGORY} </div>
											</td>
											<td>
												<div class="tIn" id="priceRow_${indexNum.index}"> <fmt:formatNumber value="${item.PRICE}" pattern="#,###" /> </div>
											</td>
											<td>
												<div class="tIn"> <fmt:formatNumber value="${item.STOCK_QUANTITY}" pattern="#,###" /> </div>
											</td>
											<td>
												<div class="tIn">
													<label class="checkBox navy">
														<input type="checkbox" href="javascript:void(0);" onclick="removeRow(this,${indexNum.index});"><span></span>
														<input type="hidden" id="deleteRow_${indexNum.index}" value="">
													</label>
												</div>
											</td>
										</tr>
                            		</c:forEach>
                            	</c:if>
                            </tbody>
                        </table>
                    </div>
                </div>
            </article>
            <!-- <article class="m-modalGrid">
                <header>
                    <h3>배송정보</h3>
                </header>
                <div class="contentsArea">
                    <ul class="item vertical">
                        <li>
                            <div class="fwBox">
                                <span class="ft">배송비</span>
                                <div class="input">
                                    <input type="text" value="2,500원">
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="fwBox">
                                <span class="ft">출고지</span>
                                <div class="input">
                                    <input type="text" placeholder="주소" value="서울특별시 금천구 시흥동 78-5">
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </article> -->
            <div class="btnArea">
                <a onclick="history.back();" class="mBtn sColorLB">취소</a>
                <a href="javascript:;" class="mBtn sColorN" onclick="openAlertDetail();">저장하기</a>
            </div>
        </div>
    </div>
</div>

<!-- 저장확인 모달 -->
<div class="modal-container alert alert-pass" id="alert-confirm">
    <div class="modal-wrapper">
        <header>
            <h2>상품정보 변경</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="alert-content">
            <div class="alert-txt">
                <div class="icon">
                    <img src="/resources/rudicks/img/icon/alert-info.svg" alt="안내">
                </div>
                <div class="txtBox">
                    입력하신 내용에 따라
                    상품 정보가 변경됩니다.
                    <br><br>
                    계속 진행하시겠습니까?
                </div>
            </div>
            <div class="btnArea">
                <a href="javascript:;" onclick="detailSave();" class="modalClose mBtn sColorLS2">예</a>
                <a href="javascript:;" class="modalClose mBtn bColorG">아니오</a>
            </div>
        </div>
    </div>
</div>