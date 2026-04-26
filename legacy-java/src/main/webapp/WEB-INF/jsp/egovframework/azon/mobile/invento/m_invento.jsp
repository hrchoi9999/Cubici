<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style>
label.checkBox.navy span::before{width: 15px; height: 15px; border-radius: 15px; border: 1px solid #002353; background: #fff;}
label.checkBox.navy input:checked ~ span::before{background: #002353; border-color: #002353;}
</style>

<script>
let dataPerPage = 0; // 페이지당 데이터 수
let sale_status = ''; // 판매상태
let searchName = ''; // 검색어
let sortPage = ''; // 보기 설정
let select_shop = ''; // 초기 페이지 수
let pageNum = 1; // 현재 페이지
//컬럼 이름 배열
let varTheadArray = new Array();

$(document).ready(function(){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});

	if ("${resultCode}" === "0") {
		//쇼핑몰 select 생성
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^","").split("|^");
		
		$("#shopInfo").append('<option value="">전체</option>');
		for(let i = 0; i<shopTypeList.length; i++){
			$("#shopInfo").append("<option value='"+ shopTypeList[i] +"'>"+ shopNameList[i] +"</option>");
			$('#shopInfo').find('option[value="'+select_shop+'"]').attr("selected",true);
		}

		lastUpdDate(); // 기준일
		searchProduct();
	} else {
		modalInfo("ErrorCode ::: " + "${resultCode}");
	}
	
	// 매칭작업 버튼 클릭
	$(document).on('click','#matchingBtn',function(){
		let matchedCnt = 0;
		if($(".matchingRow:checked").length < 2){
			modalInfo("매칭할 상품을 2개 이상 선택해 주세요");
			return false;
		} else {
			let list = new Array();
			$('#fixTbody tr').each(function(index, item){
				if($('#fixTbody tr').eq(index).find($('#matching_'+index)).attr('checked')){
					let data = new Array();
					let h_c_code = $('#fixTbody tr').eq(index).find('input').eq(1).val();
					let h_shop_id = $('#fixTbody tr').eq(index).find('input').eq(2).val();
					let h_division = $('#fixTbody tr').eq(index).find('input').eq(3).val();
					let h_shoptype = $('#fixTbody tr').eq(index).find('input').eq(4).val();
					let matching_code = $('#fixTbody tr').eq(index).find('a').eq(0).attr('id');
					
					if($('#fixTbody tr').eq(index).find('a').eq(0).attr('class').indexOf("down") >= 0){
						matchedCnt++;
					}
					data.push(h_c_code);
					data.push(h_shop_id);
					data.push(h_division);
					data.push(h_shoptype);
					data.push(matching_code);
					
					list.push(data);
				}
			});
			
			if(matchedCnt == 0){
				matchingCode(list, "NEW", matchedCnt);
			} else if (matchedCnt == 1){
				matchingCode(list, "ADD", matchedCnt);
			} else {
				matchingCode(list,"MERGE", matchedCnt);
			}
		}
	});
	
	// 검색버튼
	$(document).on('click','.search',function(){
		searchProduct("click");
	});
	
	$("#excelBtn").on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess();
		}
	});
	
	$('#OptionModal').on('click', function(){
		$('#OptionModal').parents('.modal-container').removeClass('active').fadeOut(300);
	})
});

//기준일
function lastUpdDate() {
	let callUrl = "/cubici/invento/lastUpdDate";
	let callBackFunc = "lastUpdDateResponse";
	let objParam = {
		SHOP_TYPE_LIST : "${shopInfoMap.shop_type_list}",
		interpark_id : "${shopInfoMap.interpark_id}",
		gmarket_id : "${shopInfoMap.gmarket_id}",
		auction_id : "${shopInfoMap.auction_id}",
		eleven_id : "${shopInfoMap.eleven_id}",
		coupang_id : "${shopInfoMap.coupang_id}",
		naver_id : "${shopInfoMap.naver_id}"
		}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function lastUpdDateResponse(data){
	let lastUpdDate = data.lastUpdDate[0].UPD_DATE;
	lastUpdDate = lastUpdDate.replace("-","/");
	let date_temp = new Date(lastUpdDate);
	let date = date_temp.toString().split(" ");
    let time = date[4].split(":");
    $('.date').html(date[3] + '년 ' + (1 + date_temp.getMonth()) + '월 ' + date[2] + '일 ' + time[0] + ':' + time[1] + ' 기준');    
}

//검색버튼 > 변수에 데이터 저장
function searchProduct(flag){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	varTheadArray.length = 0;
	
	$('.checkedColumn').each(function(i,item){
		if(this.checked){
			let theadStr = $(this).parent().find('span').text();
			varTheadArray.push(theadStr.slice(0, theadStr.length));
		}
	});
	
	dataPerPage = $('#dataPerPage').val();
	sale_status = $('#saleStatus').val(); 
	searchName = $('#searchName').val();
	sortPage = $('#sortPage').val();
	select_shop = $('#shopInfo').val();
	
	//페이징 유지 (클릭시 미클릭시)
	if(flag == "click"){
		$('#currentPageNum').val("");
		currentPage = 1;
	}else{
		currentPage = 0;
		select_shop = $("#currentPageShop").val();
		$('#shopInfo').val(select_shop).prop("selected",true);
	}
	
	//쇼핑몰 검색값 페이징 유지
	let currentPageShop = $("#currentPageShop").val(select_shop);
	
	productList(currentPage, dataPerPage, searchName, sale_status, select_shop, sortPage);
}

// 재고정보 목록 생성
function productList(CURRENTPAGE, dataPerPage, searchName, sale_status, select_shop, sortPage){
	
	if(select_shop.length == '0'){
		select_shop = "${shopInfoMap.shop_type_list}";
	}
	
	if(CURRENTPAGE != 0){
		$('#currentPageNum').val(CURRENTPAGE);//하단 페이지 이동할때 값 저장하는 곳으로 전달
		currentPageNum = $('#currentPageNum').val();//값 세팅
	}else if($('#currentPageNum').val() == ""){
		currentPageNum = $('#currentPageNum').val()+1; // 첫 메인화면 들어올시 빈 값이면 +1 로 첫페이지를 맞춤
	}else{
		currentPageNum = $('#currentPageNum').val(); // 상세를 보고 나왔을시 페이지 값 유지
	}
	
	currentPage = currentPageNum-1; // 현재 페이지 0부터
	let dataCnt = currentPage * dataPerPage; // 각 페이지 데이터시작
	
	// 판매상태
	if(sale_status == "onSale") {
		sale_status = "'승인완료','판매중','판매가능'"; // 각 쇼핑몰별 판매중일 때
	}else if(sale_status == "stopSale"){
		sale_status = "'승인반려','판매금지','판매중지','품절','일시품절',''"; // 각 쇼핑몰별 판매중단일 때
	}else{
		sale_status = "'승인완료','판매중','승인반려','판매가능','일시품절','판매금지','판매중지','품절',''";
	}
	
	let objParam = {
		SHOP_TYPE_LIST : select_shop,
		interpark_id : "${shopInfoMap.interpark_id}",
		gmarket_id : "${shopInfoMap.gmarket_id}",
		auction_id : "${shopInfoMap.auction_id}",
		eleven_id : "${shopInfoMap.eleven_id}",
		coupang_id : "${shopInfoMap.coupang_id}",
		naver_id : "${shopInfoMap.naver_id}",
		sale_status : sale_status,
		searchName : searchName,
		sortPage : sortPage,
		dataCnt : dataCnt,
		currentPage : currentPage,
		dataPerPage : dataPerPage,
		FLAG : "PRODUCT"
	}
	
	$.ajax({
		crossOrigin : true,
		cache : false,
		async : false,
		type : "POST",
		url : "/cubici/invento/productList",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(data) {
			//fixTbody tr 생성
			let dataList = data.inventoList;
			
			//총매칭상품 총단품상품 갯수
			let MatchingCnt = 0;
			let NonMatchingCnt = 0;
			if(dataList.length > 0){
				//테이블 고정컬럼 : 헤드
				fixTableHtml = '<div  class="fixTable maxHeight long">';
				fixTableHtml += '<table class="m-baseTable">';
				fixTableHtml += '<thead><tr><th class="fix auto">매칭선택</th><th class="fix auto">판매상태</th><th class="fix">매칭상품</th><th class="fix"></th>'
				fixTableHtml += '<th class="fix">쇼핑몰</th><th class="fix">상품명</th>';
				for(let i = 0; i<varTheadArray.length; i++){
					fixTableHtml += '<th class="notFix">' + varTheadArray[i] + '</th>';
				}
				fixTableHtml += '<th>상세정보</th>';
		        fixTableHtml += '</tr></thead><tbody id="fixTbody">';
				
				//고정컬럼 : 바디
				let fixTrHtml = '';
				$.each(dataList, function (index, item) {
					
					//매칭 상품 작업
					let category = "";
					let prd_no = "";
					let head_stock = "";
					let matching_yn = "";
					let shop = "";
					if(item.MATCHING_TABLE.indexOf("^") >= 0 ){
					matching_yn = "down";
					let shopCnt = item.MATCHING_TABLE.split("^");
				 	let set = []; // 처리된 배열
				 	// 중복 제거
				 	for (var i=0; i<shopCnt.length; i++) {
				 		if (set.indexOf(shopCnt[i]) === -1)
				 			set.push(shopCnt[i]);
				 		}
				 		shop = set.length;
				 	} else {
				 		matching_yn = "no";
						shop = item.SHOP;
						prd_no = item.PRODUCT_NO;
						category = item.CATEGORY;
						if(item.HEAD_INVEN > 0){
							head_stock = item.HEAD_INVEN;
						} else {
							head_stock = "";
						}
					}			
					fixTrHtml += '<tr>';          
					//매칭선택
					if(item.CUBICI_CODE != null) {
						fixTrHtml += '<td class="fix auto"><label class="checkBox red"><input id="matching_' + index + '" class="matchingRow" type="checkbox" onclick="checkedMatching(' + index + ');"><span></span></label></td>';
					} else {
						fixTrHtml += '<td class="fix"></td>';
					}
					//판매상태     서비스 수정 >> 판매중 판매완료로 반환해서 정리.
					if(item.STATUS === "승인반려" || item.STATUS === "품절" || item.STATUS === "판매종료" || item.STATUS === "판매금지" || item.STATUS === "판매중지" || item.STATUS === ""){
						fixTrHtml += '<td class="fix auto"><span class="sBtn sColorG rBtn">판매중지</span></td>';
					}
					if(item.STATUS === "승인완료" || item.STATUS == "판매중" || item.STATUS == "판매가능"){
						fixTrHtml += '<td class="fix auto"><span class="sBtn sColorN rBtn">판매중</span></td>';
					}
					//매칭
					if(matching_yn === "no"){
						fixTrHtml += '<td class="fix"><a id="' + item.MATCHING_CODE + '"href="javascript:;" class="matchBtn oiBtn ' + matching_yn + '"></a></div></td>';
					} else {
						fixTrHtml += '<td class="fix"><a id="' + item.MATCHING_CODE + '" href="javascript:matchList(';
						fixTrHtml += "'" + item.MATCHING_CODE + "'" + ')" class="matchBtn oiBtn ' + matching_yn + '"></a></td>';
					}			
					//이미지
					fixTrHtml += '<td class="fix"><div class="thumbBox">';
					if (item.SHOP == '네이버'){
						fixTrHtml += "<img src='/" + item.PRODUCT_IMG + "' alt='' />";
					} else if (item.SHOP == '쿠팡'){
						fixTrHtml += "<img src='https://image6.coupangcdn.com/image/" + item.PRODUCT_IMG + "' alt='' />";
					} else if (item.SHOP == '옥션' || item.SHOP == '11ST'){
						fixTrHtml += '';
					} else if (item.SHOP == '지마켓'){
						if(item.PRODUCT_IMG === ""){
							fixTrHtml += '';
						}else{
							fixTrHtml += "<img src='" + item.PRODUCT_IMG + "' alt='' />";					
						}
					} else if (item.SHOP == '인터파크'){
						fixTrHtml += "<img src='" + item.PRODUCT_IMG + "' alt='' />";
					}
					fixTrHtml += '</div></td>';
					//쇼핑몰
					fixTrHtml += '<td class="fix">' + shop + '</td>';
					//상품명
					fixTrHtml += '<td class="fix"><div class="tIn tal"><a href="javascript:;" onclick="inventoModal(' + "'" + item.CUBICI_CODE + "','" + item.MATCHING_CODE + "','" + item.PRODUCT_NO + "'" + ')">'+ item.PRODUCT_NAME + '</a></div>';
					for(let i=0; i<varTheadArray.length; i++){
						// 컬럼 태그
						if(i === 0){
							fixTrHtml += "<th>";
						} else {
							fixTrHtml += "<td>";
						}
						if(varTheadArray[i] === "카테고리"){
							fixTrHtml += category;
						} else if (varTheadArray[i] === "브랜드"){
							fixTrHtml += item.BRAND;
						} else if (varTheadArray[i] === "쇼핑몰 상품 #"){
							fixTrHtml += prd_no;
						} else if (varTheadArray[i] === "내부 상품 #"){
							fixTrHtml += item.MANAGE_CODE;
						} else if (varTheadArray[i] === "Cubici 상품 #"){
							if(item.CUBICI_CODE === null){
								fixTrHtml += "-"
							}else{
								fixTrHtml += item.CUBICI_CODE;
							}
						} else if (varTheadArray[i] === "옵션1"){
							fixTrHtml += item.OPTION1;
						} else if (varTheadArray[i] === "옵션2"){
							fixTrHtml += item.OPTION2;
						} else if (varTheadArray[i] === "옵션3"){
							fixTrHtml += item.OPTION3;
						} else if (varTheadArray[i] === "판매가격"){
							fixTrHtml += comma(item.PRICE);
						} else if (varTheadArray[i] === "본사재고"){
							fixTrHtml += comma(head_stock);
						} else if (varTheadArray[i] === "쇼핑몰 재고"){
							fixTrHtml += comma(item.STOCK_QUANTITY);
						} else if (varTheadArray[i] === "판매등록 일시"){
							fixTrHtml += item.REG_DATE;
						} else if (varTheadArray[i] === "배송비"){
							fixTrHtml += comma(item.D_CHARGE);
						}
						// 컬럼 태그
						if(i === 0){
							fixTrHtml += "</th>";
						} else {
							fixTrHtml += "</td>";
						}
					}
					fixTrHtml += '<td class="auto"><a href="javascript:;" onclick="inventoModal(' + "'" + item.CUBICI_CODE + "','" + item.MATCHING_CODE + "','" + item.PRODUCT_NO + "'" + ')">';
					fixTrHtml += '<img src="/resources/rudicks/img/icon/find.svg" alt=""></a></td>';
					// 큐빅아이코드, shop_id, division, shopType
					fixTrHtml += '<input type="hidden" value="' + item.CUBICI_CODE + '">';
					fixTrHtml += '<input type="hidden" value="' + item.SHOP_ID + '">';
					fixTrHtml += '<input type="hidden" value="' + item.DIVISION + '">';
					fixTrHtml += '<input type="hidden" value="' + item.SHOP_TYPE + '">';
					fixTrHtml += '</td>';
					fixTrHtml += '</tr>';
				});
				
				fixTableHtml += fixTrHtml;
				fixTableHtml += '</tbody></table></div></div>';
				
				fixBottomHtml = '<div class="fixBottom"><ul class="tableTotal">';
				fixBottomHtml += '<li><span class="txt">총 단품 상품수</span><span id="NonMatchingCnt" class="result"></span></li>';
				fixBottomHtml += '<li><span class="txt">총 매칭 상품수</span><span id="MatchingCnt" class="result"></span></li>';
				fixBottomHtml += '<li><span class="txt"></span><span class="result"></span></li></ul></div>';
				fixBottomHtml += '<div id="table_paginate" class="m-paging"></div>';
				
				fixTableHtml += fixBottomHtml;
				$('#fixTable').empty().html(fixTableHtml);
				
				//매칭 상품 단품 상품 갯수 계산
				if(dataList[0].MATCHING_CODE == null){
					MatchingCnt = comma(dataList[0].CNT - dataList[0].MATCHING_CNT);
					NonMatchingCnt = comma(dataList[0].MATCHING_CNT);
				}else{
					MatchingCnt = comma(dataList[0].MATCHING_CNT);
					NonMatchingCnt = comma(dataList[0].CNT - dataList[0].MATCHING_CNT);
				}
		
				$('#NonMatchingCnt').text(NonMatchingCnt+"건");
				$('#MatchingCnt').text(MatchingCnt+"건");
				
				// 페이징
				let pageMaxCnt = dataList[0].CNT / dataPerPage ;
				let currentPage = data.currentPage;
				let pageCnt = Math.floor(currentPage / 10);
				
				let pageHtml = "";
				pageHtml += "<ul>";
				
				let pageSaleStatus = $('#saleStatus').val();//판매 상태값 설정
				
				if(pageMaxCnt < 10){ //페이지 10개 미만
					for(let i = 1; i <= Math.ceil(pageMaxCnt); i++){
						pageHtml += "<li><a class='num' href='javascript:;' onclick='productList(";
						pageHtml += i + ',' + dataPerPage + ', "' + searchName + '", "' + pageSaleStatus + '", "' + select_shop + '", "' + sortPage + '");' + "'>" + i + "</a></li>";
					}
				} else if (pageMaxCnt >= 10) { // 페이지 10개 이상
					if( pageCnt > 0 ){ //이전				
						pageHtml += "<li><a class='oiBtn prev' href='javascript:;' onclick='productList(" + ((pageCnt)*10);
						pageHtml += ',' + dataPerPage + ', "' + searchName + '", "' + pageSaleStatus + '", "' + select_shop + '", "' + sortPage +  '");' + "'></a></li>";
						
					}
					for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ //1~10
						if( i > Math.ceil(pageMaxCnt)) { // 최대 페이지수 까지만 생성
							break;
						}
						pageHtml += "<li><a class='num' href='javascript:;' onclick='productList(";
						pageHtml += i + ',' +  dataPerPage + ', "' + searchName + '", "' + pageSaleStatus + '", "' + select_shop + '", "' + sortPage + '");' + "'>" + i + "</a></li>";
					}	
					if(Math.floor(pageMaxCnt) > (pageCnt*10) + 10){ //다음
						pageHtml += "<li><a class='oiBtn next' href='javascript:;' onclick='javascript:productList(" + ((pageCnt+1)*10 + 1) 
						pageHtml += ','+ dataPerPage + ', "' + searchName + '", "' + pageSaleStatus + '", "' + select_shop + '", "' + sortPage + '");' + "'></a></li>";
					}
				}
				pageHtml += '</ul>';
				$('#table_paginate').empty().html(pageHtml);
				
				//페이징버튼 활성화
				$('#table_paginate ul li').each(function(index, item){
					if($(item).find('.num').text() == parseInt(currentPage)+1){
						$(item).find('.num').addClass("active");
					}
				});
				
				$('#fixTable').doFixTable();
				
			} else {
				//테이블 고정컬럼 : 헤드
				fixTableHtml += '<div  class="fixTable maxHeight long"><table class="m-baseTable">';
				fixTableHtml += '<thead><tr><th class="fix">매칭선택</th><th class="fix">판매상태</th><th class="fix">매칭상품</th><th class="fix"></th>'
				fixTableHtml += '<th class="fix">쇼핑몰</th><th class="fix">상품명</th>';
				for(let i = 0; i<varTheadArray.length; i++){
					fixTableHtml += '<th>' + varTheadArray[i] + '</th>';
				}
				fixTableHtml += '<th>상세정보</th>';
		        fixTableHtml += '</tr></thead><tbody id="fixTbody">';
				fixTableHtml += '</tbody></table></div></div>';
				
				fixBottomHtml = '<div class="fixBottom"><ul class="tableTotal">';
				fixBottomHtml += '<li><span class="txt">총 단품 상품수</span><span id="NonMatchingCnt" class="result"></span></li>';
				fixBottomHtml += '<li><span class="txt">총 매칭 상품수</span><span id="MatchingCnt" class="result"></span></li>';
				fixBottomHtml += '<li><span class="txt"></span><span class="result"></span></li></ul></div>';
				
				fixTableHtml += fixBottomHtml;
				$('#fixTable').empty().html(fixTableHtml);
				
		
				$('#fixTable').doFixTable();
				
				$('#NonMatchingCnt').text("0 건");
				$('#MatchingCnt').text("0 건");
				let fixTrHtml = "<tr><td colspan='10'>조회된 결과가 없습니다.</td></tr>";
				$('#fixTbody').empty().html(fixTrHtml);
			}
			
			// 로딩바 해제
			$(".loadingSpinner").css({"display" : "none"});
		}
	});
}

//매칭Y 인 manage_code 로 sub list불러오기
function matchList(MATCHING_CODE){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	let callUrl = "/cubici/invento/matchList";
	let callBackFunc = "matchListResponse";
	let objParam = {
		SHOP_TYPE_LIST : "${shopInfoMap.shop_type_list}",
		interpark_id : "${shopInfoMap.interpark_id}",
		gmarket_id : "${shopInfoMap.gmarket_id}",
		auction_id : "${shopInfoMap.auction_id}",
		eleven_id : "${shopInfoMap.eleven_id}",
		coupang_id : "${shopInfoMap.coupang_id}",
		naver_id : "${shopInfoMap.naver_id}",
		MATCHING_CODE : MATCHING_CODE,
		
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}

function matchListResponse(data){
	let dataList = data.matchList;
	let trIndex = 0;
	
	if(dataList.length > 0){
		// sub tr 고정컬럼
		$.each(dataList, function (index, item) {
			
			let a = $('#'+item.MATCHING_CODE);
			let fixTr = a.parent().parent();
			trIndex = a.parent().parent().parent().index(); // 현재 tr index 저장
			
			a.removeClass("down");
			a.addClass("up");
			a.attr('href','javascript:removeCon("'+item.MATCHING_CODE+'")');
			
			let fixTrHtml = '<tr class="subCon' + item.MATCHING_CODE + '" style="background-color: rgba(220,220,220,0.2)">';
			fixTrHtml += '<td class="fix"></td><td class="fix"></td><td class="fix"></td>';
			fixTrHtml += '<td class="fix"><div class="thumbBox">';
			if (item.SHOP == '네이버'){
				fixTrHtml += "<img src='/" + item.PRODUCT_IMG + "' alt='' />";
			} else if (item.SHOP == '쿠팡'){
				fixTrHtml += "<img src='https://image6.coupangcdn.com/image/" + item.PRODUCT_IMG + "' alt='' />";
			} else if (item.SHOP == '옥션'|| item.SHOP == '11ST'){
				fixTrHtml += '';
			}else if (item.SHOP == '지마켓'){
				if(item.PRODUCT_IMG === ""){
					fixTrHtml += '';
				}else{
					fixTrHtml += "<img src='" + item.PRODUCT_IMG + "' alt='' />";					
				}
			} else if (item.SHOP == '인터파크'){
				fixTrHtml += "<img src='" + item.PRODUCT_IMG + "' alt='' />";
			}
			fixTrHtml += '</div></div></td>';
			fixTrHtml += '<td class="fix">' + item.SHOP + '</div></td>';
			fixTrHtml += '<td class="fix">' + item.PRODUCT_NAME + '</div></td>';
			
			for(let i=0; i<varTheadArray.length; i++){
				// 컬럼 태그
				if(i === 0){
					fixTrHtml += "<th>";
				} else {
					fixTrHtml += "<td>";
				}
				if(varTheadArray[i] === "카테고리"){
					fixTrHtml += item.CATEGORY;
				} else if (varTheadArray[i] === "브랜드"){
					fixTrHtml += item.BRAND;
				} else if (varTheadArray[i] === "쇼핑몰 상품 #"){
					fixTrHtml += item.PRODUCT_NO;
				} else if (varTheadArray[i] === "내부 상품 #"){
					fixTrHtml += item.MANAGE_CODE;
				} else if (varTheadArray[i] === "Cubici 상품 #"){
					if(item.CUBICI_CODE === null){
						fixTrHtml += "-"
					}else{
						fixTrHtml += item.CUBICI_CODE;
					}
				} else if (varTheadArray[i] === "옵션1"){
					fixTrHtml += item.OPTION1;
				} else if (varTheadArray[i] === "옵션2"){
					fixTrHtml += item.OPTION2;
				} else if (varTheadArray[i] === "옵션3"){
					fixTrHtml += item.OPTION3;
				} else if (varTheadArray[i] === "판매가격"){
					fixTrHtml += comma(item.PRICE);
				} else if (varTheadArray[i] === "본사재고"){
					if(item.HEAD_INVEN > 0){
						fixTrHtml += comma(item.HEAD_INVEN);
					}else{
						fixTrHtml += "";
					}					
				} else if (varTheadArray[i] === "쇼핑몰 재고"){
					fixTrHtml += comma(item.STOCK_QUANTITY);
				} else if (varTheadArray[i] === "판매등록 일시"){
					fixTrHtml += item.REG_DATE;
				} else if (varTheadArray[i] === "배송비"){
					fixTrHtml += comma(item.D_CHARGE);
				}
				// 컬럼 태그
				if(i === 0){
					fixTrHtml += "</th>";
				} else {
					fixTrHtml += "</td>";
				}
			}
			fixTrHtml += '<td class="fix"></td></tr>';
			
			fixTr.after(fixTrHtml);
		});
		
		$('#fixTable').doFixTable();
	}
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

//매칭 sub list 내용 지우기
function removeCon(MATCHING_CODE){
	$('.subCon'+MATCHING_CODE).remove();
	$('#' + MATCHING_CODE).removeClass("up");
	$('#' + MATCHING_CODE).addClass("down");
	$('#' + MATCHING_CODE).prop('href','javascript:matchList("' + MATCHING_CODE + '")');
	$('#fixTable').doFixTable();
}

// 선택 매칭 row선택
function checkedMatching(index){
	if($('#matching_'+index).attr("checked") == "checked"){
		$('#matching_'+index).attr("checked",false);
	} else {
		$('#matching_'+index).attr("checked",true);
	}
}

// 선택 매칭 진행
function matchingCode(list, FLAG, matchedCnt){
	let callUrl = "/cubici/invento/matchingCode";
	let callBackFunc = "matchingCodeResponse";
	let objParam = {
		SHOP_TYPE_LIST : "${shopInfoMap.shop_type_list}",
		interpark_id : "${shopInfoMap.interpark_id}",
		gmarket_id : "${shopInfoMap.gmarket_id}",
		auction_id : "${shopInfoMap.auction_id}",
		eleven_id : "${shopInfoMap.eleven_id}",
		coupang_id : "${shopInfoMap.coupang_id}",
		naver_id : "${shopInfoMap.naver_id}",
		list : list,
		FLAG : FLAG,
		matchedCnt : matchedCnt
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function matchingCodeResponse(data){
	if(data.resultCode == 0){
		let dataMap = data.resultMap;
		modalInfo("매칭이 완료되었습니다.");
		productList(pageNum, dataPerPage, searchName, sale_status, select_shop, sortPage);
	}	
}

//엑셀 다운로드
function doExcelDownloadProcess(){
	
	// Header 가져오기
	let mainTable = document.getElementById('fixTable').getElementsByTagName('thead')[0].getElementsByClassName('notFix'); // 0 element는 고정이라 필요 없음
	let mainTableArr = new Array();
	for(var i = 0; i<mainTable.length; i++){	
		mainTableArr.push(mainTable[i].textContent); // 각 thead의 th text를 저장
	}

	// 쇼핑몰 선택
	let selectShop = $("#shopInfo option:selected").val();
	let shopTypeList = "";
	let shopNameListStr = "";
	if(selectShop === ""){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}"; // 전체 쇼핑몰 코드
		
		let shopNameList = "${shopInfoMap.shop_name_list}";
		shopNameListStr = shopNameList.replace(/\^/gi, "").replace(/\|/gi, ","); // 전체 쇼핑몰명
		
	} else {
		shopTypeList = selectShop; // 쇼핑몰 코드
		
		// 쇼핑몰명
		if(selectShop === "1"){
			shopNameListStr = "인터파크";
		}else if(selectShop === "2"){
			shopNameListStr = "지마켓";
		}else if(selectShop === "3"){
			shopNameListStr = "옥션";
		}else if(selectShop === "4"){
			shopNameListStr = "11번가";
		}else if(selectShop === "11"){
			shopNameListStr = "쿠팡";
		}else if(selectShop === "14"){
			shopNameListStr = "네이버";
		}
	}
	
	// 판매상태 검색 
	let saleStatus = $('#saleStatus').val(); 
	if(sale_status == "onSale") {
		sale_status = "'승인완료','판매중','판매가능'"; // 각 쇼핑몰별 판매중일 때
	}else if(sale_status == "stopSale"){
		sale_status = "'승인반려','판매금지','판매중지','품절','일시품절',''"; // 각 쇼핑몰별 판매중단일 때
	}else{
		sale_status = "'승인완료','판매중','승인반려','판매가능','일시품절','판매금지','판매중지','품절',''";
	}
	
	// 상품명 검색
	let searchName = $('#searchName').val();
	
	// 초기화
	if ($("#excelForm").html != null) {
		$("#excelForm").remove();
	}
	
	// form 태그 생성
	var formHtml = "";
	formHtml = '<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data" style="display: none">'
	formHtml += '<input type="hidden" name="shop_type_list" value="'+shopTypeList+'">';
	formHtml += '<input type="hidden" name="shop_name_list" value="'+shopNameListStr+'">';
	formHtml += '<input type="hidden" name="interpark_id" value="${shopInfoMap.interpark_id}">';
	formHtml += '<input type="hidden" name="eleven_id" value="${shopInfoMap.eleven_id}">';
	formHtml += '<input type="hidden" name="gmarket_id" value="${shopInfoMap.gmarket_id}">';
	formHtml += '<input type="hidden" name="auction_id" value="${shopInfoMap.auction_id}">';
	formHtml += '<input type="hidden" name="naver_id" value="${shopInfoMap.naver_id}">';
	formHtml += '<input type="hidden" name="coupang_id" value="${shopInfoMap.coupang_id}">';
	formHtml += '<input type="hidden" name="saleStatus" value="'+saleStatus+'">';
	formHtml += '<input type="hidden" name="searchName" value="'+searchName+'">';
	formHtml += '<input type="hidden" name="this_header" value="'+mainTableArr+'">';
	formHtml += '</form>';
	$(".excelDiv").append(formHtml);

	var f = document.excelForm;
	f.action = "/invento/excelDownload";
	f.submit();
}

// 상세내역 모달
function inventoModal(cubici_code, matching_code, product_no){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
		
	let form= $("<form></form>");
	form.attr("name", "inventoForm");
	form.attr("method", "get");
	form.attr("action", "<c:url value='/m/cubici/invento/detail'/>");
	
	form.append($("<input />", {type: "hidden", name: "SHOP_TYPE_LIST", value: select_shop}));
	form.append($("<input />", {type: "hidden", name: "interpark_id", value: "${shopInfoMap.interpark_id}"}));
	form.append($("<input />", {type: "hidden", name: "gmarket_id", value: "${shopInfoMap.gmarket_id}"}));
	form.append($("<input />", {type: "hidden", name: "auction_id", value: "${shopInfoMap.auction_id}"}));
	form.append($("<input />", {type: "hidden", name: "eleven_id", value: "${shopInfoMap.eleven_id}"}));
	form.append($("<input />", {type: "hidden", name: "coupang_id", value: "${shopInfoMap.coupang_id}"}));
	form.append($("<input />", {type: "hidden", name: "naver_id", value: "${shopInfoMap.naver_id}"}));
	form.append($("<input />", {type: "hidden", name: "CUBICI_CODE", value: cubici_code}));
	form.append($("<input />", {type: "hidden", name: "MATCHING_CODE", value: matching_code}));
	form.append($("<input />", {type: "hidden", name: "PRODUCT_NO", value: product_no}));
	
	form.appendTo("body");
	
	form.submit();
} 
</script>

<div class="m-search">
    <ul>
        <li>
         	<div class="fwBox">
                <span class="ft">판매상태</span>
                <div class="input">
                    <select id="saleStatus">
                        <option value="">전체</option>
                        <option value="onSale">판매</option>
                        <option value="stopSale">판매중지</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
           <div class="fwBox">
                <span class="ft">쇼핑몰</span>
                <div class="input">
                    <select id="shopInfo">
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">상품명</span>
                <div class="input">
                    <input id="searchName" type="text" placeholder="상품명">
                </div>
            </div>
        </li>

        <li>
            <div class="fwBox">
                <span class="ft">보기설정</span>
                <div class="input">
                    <select id="sortPage">
                        <option value="REG_DATE">최근 순</option>
                        <option value="PRODUCT_NAME">이름 순</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
       		<div class="fwBox">
                <span class="ft">시작</span>
                <div class="input">
                    <input type="text" autocomplete="off" style="text-align:right" placeholder="시작기간" disabled>
                </div>
            </div>
        </li>
        <li>
          <div class="fwBox">
                <span class="ft">종료</span>
                <div class="input">
                    <input type="text" autocomplete="off" style="text-align:right" placeholder="종료기간" disabled>
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button class="mBtn sColorLG excel" id="excelBtn">엑셀 다운로드</button>
                <div class="excelDiv"></div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button class="mBtn sColorLB search">검색</button>
            </div>
        </li>
    </ul>
</div>

<div class="tableSet">
    <div class="m-options">
        <div class="fwBox col-4">
            <span class="ft">페이지 보기 설정</span>
            <div class="input">
                 <select id="dataPerPage">
                     <option value="10">10개</option>
                     <option value="30">30개</option>
                     <option value="50">50개</option>
                 </select>
            </div>
        </div>
        <div class="m-filter col-2">
            <div class="btns">
                <a href="javascript:;" class="mBtn sColorN setting openFilter modalOpen" data-modal="c4p1-filter">선택옵션</a>
            </div>
        </div>
    </div>

    <div class="m-options-add">
        <a href="javascript:;" id="matchingBtn" class="mBtn sColorN modalOpen" data-modal="alert-match">선택상품 매칭</a>
        <span class="infoArea">
            <a href="javascript:;" class="oiBtn infoBtn navy">정보</a>
            <div class="infoMemo">
                <h5 class="mt"><span>상품매칭 방법</span></h5>
                <div class="iCon">
                    <p>
                        같은 상품을 하나의 상품으로 매칭하기
                        위해서는 먼저 하나로 묶어야 할 상품을
                        상품리스트에서 선택하시고 
                        <a href="javascript:;">"선택상품 매칭"</a> 을 클릭해 주십시오.
                    </p>
                </div>
            </div>
        </span>
        <span class="date"></span>
    </div>

    <div class="modal-container" id="c4p1-filter">
        <div class="modal-wrapper">
            <header>
                <h2>선택옵션</h2>
                <a href="javascript:;" class="modalClose">닫기</a>
            </header>
            <div class="modal-content">
                <div class="m-filter">
                    <div class="btns">
                        <a href="javascript:;" class="mBtn sColorN setting openFilter">선택옵션</a>
                    </div>
                    <ul class="selectList">
                        <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" class="required" disabled checked>
	                            <span>판매상태</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" class="required" disabled checked>
	                            <span>대표이미지</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" class="required" disabled checked>
	                            <span>쇼핑몰</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" class="required" disabled checked>
	                            <span>상품명</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="CATEGORY" class="checkedColumn" checked>
	                            <span>카테고리</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="BRAND" class="checkedColumn" checked>
	                            <span>브랜드</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="PRODUCT_NO" class="checkedColumn" checked>
	                            <span>쇼핑몰 상품 #</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="MANAGE_CODE"  class="checkedColumn" checked>
	                            <span>내부 상품 #</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="CUBICI_CODE" class="checkedColumn" checked>
	                            <span>Cubici 상품 #</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="OPTION1" class="checkedColumn" checked>
	                            <span>옵션1</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="OPTION2" class="checkedColumn" checked>
	                            <span>옵션2</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="OPTION3" class="checkedColumn" checked>
	                            <span>옵션3</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="PRICE" class="checkedColumn" checked>
	                            <span>판매가격</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="HEAD_INVEN" class="checkedColumn" checked>
	                            <span>본사재고</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="STOCK_QUANTITY" class="checkedColumn" checked>
	                            <span>쇼핑몰 재고</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="REG_DATE" class="checkedColumn" checked>
	                            <span>판매등록 일시</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="D_CHARGE" class="checkedColumn" checked>
	                            <span>배송비</span>
	                        </label>
	                    </li>
	                    <li class="btns">
	                        <button id="OptionModal" onclick="searchProduct('click');" class="mBtn sColorLB wBtn">옵션 확인</button>
	                    </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div id="fixTable" class="mArticleArea">
        
    
    <script>
         $('#fixTable').doFixTable();
    </script>
</div>
<div style = "display:none"><!-- 페이지값 저장 -->
	<input type="text" id="currentPageNum"/>
</div>
<div style = "display:none"><!-- 쇼핑몰 검색값 저장 -->
	<input type="text" id="currentPageShop"/>	
</div>