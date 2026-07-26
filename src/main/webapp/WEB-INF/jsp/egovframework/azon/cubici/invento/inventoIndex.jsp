<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<head>
	<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css" rel="stylesheet">
</head>
<style>
label.checkBox.navy span::before{width: 15px; height: 15px; border-radius: 15px; border: 1px solid #002353; background: #fff;}
label.checkBox.navy input:checked ~ span::before{background: #002353; border-color: #002353;}
</style>

<script type="text/javascript" src="/resources/js/jquery.ajax-cross-origin.min.js"></script>
<script>
var dataPerPage = 0; // 페이지당 데이터 수
var sale_status = ''; // 판매상태
var searchName = ''; // 검색어
var sortPage = ''; // 보기 설정
var select_shop = ''; // 초기 페이지 수
var pageNum = 1; // 현재 페이지
//컬럼 이름 배열
let key = [];
let thead = [];
let SHOPFLAG = '';//큐빅 코드가 없을때 저장시 사용
let MSProductNo = '';//큐빅 코드가 없을때 저장시 사용
let StockCheck = '';

$(document).ready(function(){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	if ("${resultCode}" === "0") {
		// 기준일
		lastUpdDate();
		//쇼핑몰 select 생성
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^","").split("|^");
		for(let i = 0; i<shopTypeList.length; i++){
			$("#shopInfo").append("<option value='"+ shopTypeList[i] +"'>"+ shopNameList[i] +"</option>");
			$('#shopInfo').find('option[value="'+select_shop+'"]').attr("selected",true);
		}
		// 목록생성
		productList(1);	 	

	} else {
		modalInfo("ErrorCode ::: " + "${resultCode}");
	}

	// 검색버튼
	$(document).on('click','.search',function(){
		productList(1);
	});
	
	// 매칭작업 버튼 클릭
	$(document).on('click','#matchingBtn',function(e){
    let matchedCnt = 0;
	    if($(".matchingRow:checked").length < 2){
	    	modalInfo("매칭할 상품을 2개 이상 선택해 주세요");
	        return false;
	    } else {
	    	let list = [];
	         
	        $('.matchingRow:checked').each(function(index, target){
	        	let sublist = [];
	            let inputdata = $(target).closest("tr").children("td").find("input");
	            let adata = $(target).closest("tr").find("a").eq(0)
	            let len = inputdata.length;
	            
	            for(let i=0; i<len; i++){
	               sublist[i] = inputdata.eq(i).val();
	            }
	            
	            sublist[len] = adata.attr("id");
	            list[index] = sublist;
	            
	            if(adata.attr('class').indexOf("down") >= 0){
	               matchedCnt++;
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
	
	$("#excelBtn").on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41" || thisUser == "40"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess();
		}
	});
});

// 기준일
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
   if(data.resultCode === 0){
      let date = data.lastUpdDate.replace(/-/gi, " ").split(" ")
       $('.date').html(date[0] + '년 ' + date[1] + '월 ' + date[2] + '일 ' + date[3].substr(0, date[3].length-3) + ' 기준');    
   }   
}

// 재고정보 목록 생성
function productList(CURRENTPAGE){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	$(".overflowBox").mCustomScrollbar("destroy");
	$(".fixRow").css('left', '0px');
	$(".m-shadowTable").find('th').css('top', '0px');
	
	$('.selectList').css('display','none');
	
	//변수
	dataPerPage = $('#dataPerPage').val();
	
	//판매상태
	sale_status = $('#saleStatus').val();
	if (sale_status == "stopSale") sale_status = '"승인반려", "품절", "일시품절", "판매종료", "판매금지", "판매중지", ""';
	else if (sale_status == "onSale") sale_status = '"승인완료", "판매중", "판매가능"';
	else sale_status = '"승인반려", "품절", "일시품절", "판매종료", "판매금지", "판매중지", "", "승인완료", "판매중", "판매가능"';
	searchName = $('#searchName').val();
	sortPage = $('#sortPage').val();
	select_shop = ($('#shopInfo').val() === '0') ? select_shop = "${shopInfoMap.shop_type_list}" : $('#shopInfo').val();
		
	currentPage = CURRENTPAGE-1; // 현재 페이지 0부터
	let dataCnt = currentPage * dataPerPage; // 각 페이지 데이터시작
	
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
			key = [];
			thead = [];
			
			$('.checkedColumn:checked').each(function(i){
				key[i] = $(this).attr('id')
				thead[i] = $(this).next().text()
				
			});
			//변동 컬럼 : 헤드
			let nonFixheadHtml = '<tr>';
			for(let i=0, len = key.length; i<len; i++){
				nonFixheadHtml += '<th>' + thead[i] + '</th>';
			}
			
			nonFixheadHtml += '<th>상세정보</th>';
			nonFixheadHtml += '</tr>';
			$(".rollRow").find('thead').html(nonFixheadHtml);
	             
			//고정컬럼 : 바디
			let fixTrHtml = '';
			if(dataList.length > 0){
				$.each(dataList, function (index, item) {
					//매칭 상품 작업
					let matching_yn = "";
					let shop = "";
					if(item.MATCHING_TABLE.indexOf("^") >= 0 ){
						matching_yn = "down";
						let shopCnt = item.MATCHING_TABLE.split("^");
					 	let set = new Set(shopCnt); // set으로 중복 제거
					 	shop = set.size;
				 	} else {
				 		matching_yn = "no";
						shop = item.SHOP;
					}			
					fixTrHtml += '<tr>';          
					
					//매칭선택
					fixTrHtml += '<th><div class="tIn">';
					if(item.CUBICI_CODE != null) fixTrHtml += '<label class="checkBox red"><input id="matching_' + index + '" class="matchingRow" type="checkbox" onclick="checkedMatching(' + index + ');"><span></span></label>';
					fixTrHtml += '</div></th>';
					
					//판매상태
					let status = (item.STATUS === "onSale") ? 'sColorN rBtn">판매중' : 'sColorG rBtn">판매중지'
						  		  
					fixTrHtml += '<td><div class="tIn"><span class="sBtn ' + status + '</span></div></td>';
					
					//매칭
					let match = (matching_yn === "down") ? "matchList('" + item.MATCHING_CODE + "')" : '';
					fixTrHtml += '<td><div class="tIn"><a id="' + item.MATCHING_CODE + '"href="javascript:' + match + ';" class="matchBtn oiBtn ' + matching_yn + '"></a></div></td>';
					
					//이미지
					let img = '';
					if(item.PRODUCT_IMG != "" && item.PRODUCT_IMG != null){
						item.PRODUCT_IMG = (item.PRODUCT_IMG.substr(0,5)=="https") ? item.PRODUCT_IMG : item.PRODUCT_IMG.replace("http", "https")
						if (item.SHOP == '네이버' || item.SHOP == '11ST' || item.SHOP == '옥션' || item.SHOP == '지마켓'){
							img = (item.PRODUCT_IMG == null || item.PRODUCT_IMG === "") ? '' : "<img src='" + item.PRODUCT_IMG + "' alt='' />";
						} else if (item.SHOP == '쿠팡'){
							img = "<img src='https://image6.coupangcdn.com/image/" + item.PRODUCT_IMG + "' alt='' />";
						} else if (item.SHOP == '인터파크'){
							img = "<img src='" + item.PRODUCT_IMG + "' alt='' />";
						}
					} else {
						img = "<img src='' alt='' />";
					}
					fixTrHtml += '<td><div class="tIn"><div class="thumbBox">' + img + '</div></div></td>';
					
					//쇼핑몰
					fixTrHtml += '<td><div class="tIn">' + shop + '</div></td>';
					//상품명
					fixTrHtml += '<td><div><a class="tIn tal" href="javascript:;" onclick="inventoModal(' + "'" + item.CUBICI_CODE + "','" + item.MATCHING_CODE + "','" + item.PRODUCT_NO + "'" + ')">'+ item.PRODUCT_NAME + '</a></div>';
 					// 큐빅아이코드, shop_id, division, shopType
					fixTrHtml += '<input type="hidden" value="' + item.CUBICI_CODE + '">';
					fixTrHtml += '<input type="hidden" value="' + item.SHOP_ID + '">';
					fixTrHtml += '<input type="hidden" value="' + item.DIVISION + '">';
					fixTrHtml += '<input type="hidden" value="' + item.SHOP_TYPE + '">';
					fixTrHtml += '</td></tr>';
				});
				
				$("#fixTbody").html(fixTrHtml);
				
				// 변동 컬럼
				let nonFixTrHtml = '';
				$.each(dataList, function (index, item) {
					let CATEGORY = "";
					let PRODUCT_NO = "";
					let HEAD_INVEN = "";
					if(item.MATCHING_TABLE.indexOf("^") < 0){
						PRODUCT_NO = item.PRODUCT_NO;
						CATEGORY = item.CATEGORY;
						//HEAD_INVEN = (item.HEAD_INVEN > 0) ? item.HEAD_INVEN : "";
					}
					nonFixTrHtml += '<tr>';
					for(let i=0, len = key.length; i<len; i++){
						// 컬럼 태그
						nonFixTrHtml += "<td><div class='tIn'>";
						nonFixTrHtml += (item[key[i]] === null || item[key[i]] === "") ? "-" : 
										(key[i] == "CATEGORY") ? CATEGORY :
										(key[i] == "PRODUCT_NO") ? PRODUCT_NO :
										(key[i] == "PRICE" || key[i] == "STOCK_QUANTITY" || key[i] == "D_CHARGE" ) ? comma(item[key[i]]) :
										(key[i] == "HEAD_INVEN") ? comma(HEAD_INVEN) : item[key[i]]
						nonFixTrHtml += "</div></td>";
					}
					//모달
					nonFixTrHtml += '<td><div class="tIn"><a href="javascript:;" onclick="inventoModal(' + "'" + item.CUBICI_CODE + "','" + item.MATCHING_CODE + "','" + item.PRODUCT_NO + "'" + ')"><img src="/resources/rudicks/img/icon/find.svg" alt=""></a></td>';
					nonFixTrHtml += '</tr>';	
				});
	
				$('#nonFixTbody').html(nonFixTrHtml);

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
				
				if(pageMaxCnt < 10){ //페이지 10개 미만
					for(let i = 1, len = Math.ceil(pageMaxCnt); i <= len; i++){
						pageHtml += "<li><a class='num' href='javascript:;' onclick='productList(" + i + ");'>" + i + "</a></li>";
					}
				} else if (pageMaxCnt >= 10) { // 페이지 10개 이상
					if( pageCnt > 0 ){ //이전				
						pageHtml += "<li><a class='oiBtn prev' href='javascript:;' onclick='productList(" + ((pageCnt)*10)+ ");'></a></li>";	
					}
					for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ //1~10
						if( i > Math.ceil(pageMaxCnt)) break; // 최대 페이지수 까지만 생성
						pageHtml += "<li><a class='num' href='javascript:;' onclick='productList(" + i + ");'>" + i + "</a></li>";
					}	
					if(Math.floor(pageMaxCnt) > (pageCnt*10) + 10){ //다음
						pageHtml += "<li><a class='oiBtn next' href='javascript:;' onclick='javascript:productList(" + ((pageCnt+1)*10 + 1) + ");'></a></li>";
					}
				}
				pageHtml += '</ul>';
				$('#table_paginate').empty().html(pageHtml);

				//페이징버튼 활성화
				$('.num:eq('+currentPage%10+')').addClass("active");
				
			} else {
				//테이블 고정컬럼
				let fixTrHtml = '<tr><td></td></tr>';
				//변동 컬럼
				let nonFixTrHtml = '<tr><td colspan="4">조회된 결과가 없습니다.</td></tr>';
				
				$('#fixTbody').empty().html(fixTrHtml);
				$('#nonFixTbody').html(nonFixTrHtml);
				
				$('#NonMatchingCnt').text("0 건");
				$('#MatchingCnt').text("0 건");
			}

			$('#fixTable').doFixTable2();
			if($("#fixTable").css("visibility") === "hidden"){
				$("#fixTable").css("visibility", "visible");
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
		MATCHING_CODE : MATCHING_CODE
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
			let fixTr = a.parent().parent().parent();
			trIndex = a.parent().parent().parent().index(); // 현재 tr index 저장
			
			a.removeClass("down");
			a.addClass("up");
			a.attr('href','javascript:removeCon("'+item.MATCHING_CODE+'")');
			
			let fixTrHtml = '<tr class="subCon' + item.MATCHING_CODE + '" style="background-color: rgba(220,220,220,0.2)">';
			fixTrHtml += '<td></td><td></td><td></td>';
			 
			let img = '';
			if(item.PRODUCT_IMG != "" && item.PRODUCT_IMG != null){
				item.PRODUCT_IMG = (item.PRODUCT_IMG.substr(0,5)=="https") ? item.PRODUCT_IMG : item.PRODUCT_IMG.replace("http", "https")
				if (item.SHOP == '네이버' || item.SHOP == '11ST' || item.SHOP == '옥션' || item.SHOP == '지마켓'){
					img = (item.PRODUCT_IMG == null || item.PRODUCT_IMG === "") ? '' : "<img src='" + item.PRODUCT_IMG + "' alt='' />";
				} else if (item.SHOP == '쿠팡'){
					img = "<img src='https://image6.coupangcdn.com/image/" + item.PRODUCT_IMG + "' alt='' />";
				} else if (item.SHOP == '인터파크'){
					img = "<img src='" + item.PRODUCT_IMG + "' alt='' />";
				}
			} else {
				img = "<img src='' alt='' />";
			}
			fixTrHtml += '<td><div class="tIn"><div class="thumbBox">' + img + '</div></div></td>';
			fixTrHtml += '<td><div class="tIn">' + item.SHOP + '</div></td>';
			fixTrHtml += '<td><div class="tIn tal">' + item.PRODUCT_NAME + '</div></td>';
			
			fixTr.after(fixTrHtml);
		});
		
		// sub tr 변동컬럼
		$.each(dataList, function (index, item) {
			let nonFixTr = $('#nonFixTbody').find('tr').eq(trIndex);
			
			nonFixTrHtml = '<tr class="subCon' + item.MATCHING_CODE + '" style="background-color: rgba(220,220,220,0.2)">';
			for(let i=0, len = key.length; i<len; i++){
				// 컬럼 태그
				nonFixTrHtml += "<td><div class='tIn'>";
				nonFixTrHtml += (item[key[i]] === null || item[key[i]] === "")? "-" :
								(key[i] == "PRICE" || key[i] == "STOCK_QUANTITY" || key[i] == "D_CHARGE" ) ? comma(item[key[i]]) :
								(key[i] == HEAD_INVEN)? comma(item.HEAD_INVEN) : item[key[i]]
				nonFixTrHtml += "</div></td>";
				nonFixTrHtml += "</div></td>";
			}
			nonFixTrHtml += '<td><div class="tIn"></div></td>';
			nonFixTrHtml += '</tr>';
			
			nonFixTr.after(nonFixTrHtml);
		});
		$('#fixTable').doFixTable2();
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
	$('#fixTable').doFixTable2();
}

// 선택 매칭 row선택
function checkedMatching(index){
	let result = ($('#matching_'+index).is(":checked")) ? true : false;
	$('#matching_'+index).attr("checked", result);
}

// 매칭 해체 row 선택
function removeRow(obj, index){
	if($(obj).attr("checked") == "checked"){
		$(obj).attr("checked", false);
		$('#deleteRow_'+index).val('');
	} else {
		$(obj).attr("checked", true);
		$('#deleteRow_'+index).val('Y');
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
//		let dataMap = data.resultMap;
		modalInfo("매칭이 완료되었습니다.");
		productList(pageNum);
	}	
}

// 상세내역 모달
function inventoModal(cubici_code, matching_code, product_no){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	let callUrl = "/cubici/invento/inventoModal";
	let callBackFunc = "inventoModalResponse";
	let objParam = {
			SHOP_TYPE_LIST : select_shop,
			interpark_id : "${shopInfoMap.interpark_id}",
			gmarket_id : "${shopInfoMap.gmarket_id}",
			auction_id : "${shopInfoMap.auction_id}",
			eleven_id : "${shopInfoMap.eleven_id}",
			coupang_id : "${shopInfoMap.coupang_id}",
			naver_id : "${shopInfoMap.naver_id}",
			CUBICI_CODE : cubici_code,
			MATCHING_CODE : matching_code,
			PRODUCT_NO : product_no
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function inventoModalResponse(data){
	$('tbody[name="prdDet"]').html('');
	let all_price = 0;
	//상품정보 >> cubici_code inventoList
	let modalData = data.inventoList;
	if(data.inventoList !== null){
		let img = '';
		if(modalData[0].PRODUCT_IMG != "" && modalData[0].PRODUCT_IMG != null){
			modalData[0].PRODUCT_IMG = (modalData[0].PRODUCT_IMG.substr(0,5)=="https") ? modalData[0].PRODUCT_IMG : modalData[0].PRODUCT_IMG.replace("http", "https")
			if (modalData[0].SHOP == '네이버' || modalData[0].SHOP == '11ST' || modalData[0].SHOP == '옥션' || modalData[0].SHOP == '지마켓'){
				img = "<img src='" + modalData[0].PRODUCT_IMG + "' alt='' />";
			} else if (modalData[0].SHOP == '쿠팡'){
				img = "<img src='https://image6.coupangcdn.com/image/" + modalData[0].PRODUCT_IMG + "' alt='' />";
			} else if (modalData[0].SHOP == '인터파크'){
				img = "<img src='" + modalData[0].PRODUCT_IMG + "' alt='' />";
			}
		} else {
			img = "<img src='' alt='' />";
		}
		
		$('#prd_img').find('i').empty().html(img);
		$('#prd_nm').val(modalData[0].PRODUCT_NAME);
		$('#prd_brand').val(modalData[0].BRAND);
		$('#avg_price').val(comma(modalData[0].PRICE));
		$('#seller_code').val(modalData[0].MANAGE_CODE);
		$('#cubici_code').val(modalData[0].CUBICI_CODE);
		$('#sales_status').val(modalData[0].STATUS);
		let head_inven = (modalData[0].HEAD_INVEN > 0) ? comma(modalData[0].HEAD_INVEN) : "";
		$('#seller_stock').val(head_inven);
		$('#option1').val(modalData[0].OPTION1);
		$('#option2').val(modalData[0].OPTION2);
		$('#option3').val(modalData[0].OPTION3);
		SHOPFLAG = modalData[0].SHOP_TYPE;
		MSProductNo = modalData[0].PRODUCT_NO;
		StockCheck = modalData[0].DIVISION;
		StockCheck = StockCheck.substring(StockCheck.length-5, StockCheck.length);
	}
	
	//매칭 list
	let modalmatch = data.matchList;
	if(data.matchList.length > 0){
		let trHtml = '<tr>';
		$.each(data.matchList, function (index, item) {
			trHtml += '<td style="display:none;"><div class="tIn">';
			trHtml += '<input type="hidden" value="' + item.CUBICI_CODE + '">';
			trHtml += '<input type="hidden" value="'+item.SHOP_ID+'">';
			trHtml += '<input type="hidden" value="'+item.DIVISION+'"></div></td>';
			trHtml += '<td><div class="tIn">' + item.SHOP + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.PRODUCT_NO + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.PRODUCT_NAME + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.CATEGORY + '</div></td>';
			trHtml += '<td><div class="tIn">' + comma(item.PRICE) + '</div></td>';
			trHtml += '<td><div class="tIn">' + comma(item.STOCK_QUANTITY) + '</div></td>';
			trHtml += '<td><div class="tIn"><label class="checkBox navy"><input type="checkbox" href="javascript:void(0);" onclick="removeRow(this,' + index + ');"><span></span>';
			trHtml += '<input type="hidden" id="deleteRow_' + index + '" value="">';
			trHtml += '</label></div></td></tr>';
			
			all_price += parseInt(item.PRICE);
		});
		$('#prdMatchingList').empty().html(trHtml);
	} else {
		trHtml = '<tr>';
		trHtml += '<input id="c_code" type="hidden" value="' + modalData[0].CUBICI_CODE + '">';
		trHtml += '<input id="shop_id" type="hidden" value="' + modalData[0].SHOP_ID + '">';
		trHtml += '<input id="division" type="hidden" value="' + modalData[0].DIVISION + '">';
		trHtml += '<td colspan="7"> 매칭 상품이 없습니다  </td></tr>';
		$('#prdMatchingList').empty().html(trHtml);
	}
	
	// 평균가격 반영
	if(all_price > 0){
		$('#avg_price').val(comma(Math.floor(all_price/modalmatch.length)));
	}
	
	modalOpen("c4p1");
	
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

// 저장확인 모달
function openAlertModal(){
	$('#alert-confirm').addClass('active');
	$("#alert-confirm").css('display','block');
}

//모달에서 저장하기 눌러야 수정사항 저장되도록 수정 ( 본사재고, 매칭해제 )
function modalSave(){
	
	let list = new Array();
	let delCnt = 0;
	let nonDelCnt = 0;
	let num = 0;
	let FLAG = "DEL";
	
	if(StockCheck == "STOCK" && $("#cubici_code").val() == ""){
		modalInfo("현재 상품 분석중 입니다. 잠시후 시도해주세요.");
		return false;
	}
	
	$("#prdMatchingList tr").each(function (index, item) {
		if($('#deleteRow_'+index).val() == 'Y') {
			let data = new Array();
			let inputdata = $("#prdMatchingList tr").eq(index).find('td').eq(0).find('input');
			let cubiciCode = inputdata.eq(0).val();
			let shopId = inputdata.eq(1).val();
			let division = inputdata.eq(2).val();
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
		let inputdata = $("#prdMatchingList tr").eq(num).find('td').eq(0).find('input');
		let cubiciCode = inputdata.eq(0).val();
		let shopId = inputdata.eq(1).val();
		let division = inputdata.eq(2).val();
		
		data.push(cubiciCode);
		data.push(shopId);
		data.push(division);
		
		list.push(data);
	} 	
 	if ( nonDelCnt == 0 && $('#prdMatchingList td').length > 1) { //삭제 row 하나도 없을 경우
		let data = new Array();
		let inputdata = $("#prdMatchingList tr").find('input');
		let cubiciCode = inputdata.eq(0).val();
		let shopId = inputdata.eq(1).val();
		let division = inputdata.eq(2).val();
		
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
 	
	let HEAD_INVEN = "0"; // 재고
	if(parseInt($('#seller_stock').val()) > 0){
		HEAD_INVEN = $('#seller_stock').val();
	}
	let callUrl = "/cubici/invento/removeMatching";
	let callBackFunc = "removeMatchingResponse";
	let objParam = {
			list : list,
			matchedCnt : delCnt,
			HEAD_INVEN : HEAD_INVEN.replace(/,/g,''),
			FLAG : FLAG,
			SHOPFLAG : SHOPFLAG,
			PRODUCT_NO : MSProductNo
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function removeMatchingResponse(data){
	if(data.resultCode == 0) {
		modalInfo("상품 정보가 저장되었습니다.");
		//큰모달 닫기.. 
		$('#c4p1').removeClass('active');
		$('#c4p1').css('display','none');
		productList(pageNum);
	}
}

//엑셀 다운로드
function doExcelDownloadProcess(){
	
	// Header 가져오기
	let mainTable = document.getElementById('fixTable').getElementsByTagName('thead')[1].getElementsByTagName('th'); // 0 element는 고정이라 필요 없음
	let mainTableArr = new Array();
	for(var i = 0, len=mainTable.length-1; i<len; i++){	
		mainTableArr.push(mainTable[i].textContent); // 각 thead의 th text를 저장
	}
			
	// 판매상태 검색 
	let sale_status = $('#saleStatus').val(); 
	if(sale_status == "onSale") {
		sale_status = "'승인완료', '판매중', '판매가능'"; // 각 쇼핑몰별 판매중일 때
	}else if(sale_status == "stopSale"){
		sale_status = "'승인반려', '품절', '일시품절', '판매종료', '판매금지', '판매중지', ''"; // 각 쇼핑몰별 판매중단일 때
	}else{
		sale_status = "'승인반려', '품절', '일시품절', '판매종료', '판매금지', '판매중지', '', '승인완료', '판매중', '판매가능'";
	}
	
	// 상품명 검색
	let searchName = $('#searchName').val();
	
	// 초기화
	if ($("#excelForm").html != null) {
		$("#excelForm").remove();
	}
	
	// 쇼핑몰 선택
	let select_shop = $('#shopInfo').val();
	
	let shopNameListStr = "";
	
	if(select_shop === "0"){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}"; // 전체 쇼핑몰 코드
		shopNameListStr = "${shopInfoMap.shop_name_list}".replace("^","").split("|^");
	} else {
		shopTypeList = select_shop; // 쇼핑몰 코드
		shopNameListStr = $("#shopInfo option:selected").text();
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
	formHtml += '<input type="hidden" name="sale_status" value="'+sale_status+'">';
	formHtml += '<input type="hidden" name="searchName" value="'+searchName+'">';
	formHtml += '<input type="hidden" name="this_header" value="'+mainTableArr+'">';
	formHtml += '</form>';
	$(".excelDiv").append(formHtml);

	var f = document.excelForm;
	f.action = "/invento/excelDownload";
	f.submit();
}

</script>

<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">쇼핑몰</span>
                <div class="input">
                    <select id="shopInfo">
                    	<option value="0">전체</option>
                    </select>
                </div>
            </div>
        </li>
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
            	<span class="ft">상품명</span>
                <div class="input">
                    <input id="searchName" type="text" placeholder="상품명">
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button class="sBtn sColorLG excel" id="excelBtn">엑셀 다운로드</button>
                <div class="excelDiv"></div>
            </div>
        </li>
    </ul>
    <ul>
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
            <div class="btns">
                <button class="sBtn sColorLB search">검색</button>
            </div>
        </li>
    </ul>
</div>

<div class="tableSet">
    <div class="m-options">
        <div class="pLeft">
            <span class="sBtn sColorN hasInfoBtn">
                <a href="javascript:;" id="matchingBtn" class="submitBtn modalOpen" data-modal="alert-match">선택상품 매칭</a>
            </span>
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
        <div class="pRight">
            <div class="fwBox">
                <span class="ft">페이지 보기 설정</span>
                <div class="input">
                    <select id="dataPerPage">
                        <option value="10">10개</option>
                        <option value="30">30개</option>
                        <option value="50">50개</option>
                    </select>
                </div>
            </div>
            <div class="m-filter">
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorN setting openFilter">선택옵션</a>
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
                        <button onclick="productList(1);" class="sBtn sColorLB wBtn">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable wide" style="visibility:hidden">
    	<div class="overflowBox mCustomScrollbar">
			<div class="fixArea">
				<div class="fixRow">
					<table class="m-shadowTable">
						<thead>
							<tr>
								<th>매칭선택</th><th>판매상태</th><th>매칭상품</th><th></th><th>쇼핑몰</th><th>상품명</th>
							</tr>
						</thead>
						<tbody id="fixTbody">
						</tbody>
					</table>
				</div>
				<div class="rollRow">
					<table class="m-shadowTable">
						<thead>
						</thead>
						<tbody id="nonFixTbody">
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="fixBottom">
			<ul class="tableTotal">
				<li><span class="txt">총 단품 상품수</span><span id="NonMatchingCnt" class="result"></span></li>
				<li><span class="txt">총 매칭 상품수</span><span id="MatchingCnt" class="result"></span></li>
				<li><span class="txt"></span><span class="result"></span></li>
			</ul>
		</div>
	<script>
         $('#fixTable').doFixTable2();
    </script>
</div>
<div id="table_paginate" class="m-paging"></div>

<!-- 재고정보 Modal -->
<div class="modal-container" id="c4p1">
    <div class="modal-wrapper">
        <header>
            <h2>상품 상세정보</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner mArticleArea">
                <article class="m-modalGrid">
                    <header>
                        <h3>상품정보</h3>
                        <!-- <span class="btns">
                            <a href="javascript:;" class="sBtn sColorLB">정보수정</a>
                        </span> -->
                    </header>
                    <div class="contentsArea">
                        <div class="item-col">
                            <div class="col-1">
                                <div id="prd_img" class="thumbBox">
                                    <i></i>
                                </div>
                            </div>
                            <div class="col-5">
                                <ul class="item">
                                    <li class="col-1">
                                        <div class="fwBox">
                                            <span class="ft">상품명</span>
                                            <div class="input">
                                                <input id="prd_nm" type="text" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul class="item">
                                    <li class="col-1">
                                        <div class="fwBox">
                                            <span class="ft">상품설명</span>
                                            <div class="input">
                                                <input type="text" readonly value="">
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul class="item">
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
                                </ul>
                                <ul class="item">
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
                                </ul>
                            </div>
                        </div>
                    </div>
                </article>
                <article class="m-modalGrid">
                    <header>
                        <h3>상세 정보</h3>
                    </header>
                    <div class="contentsArea">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">판매상태</span>
                                    <div class="input">
                                      <!--  <select>
                                            <option value="" readonly >판매 중</option>
                                        </select>  -->
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
                            <li>
                                <div class="fwBox">
                                    <span class="ft">본사재고</span>
                                    <div class="input unit">
                                        <input id="seller_stock" type="text" placeholder="수량입력" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        <span class="unitBox infoArea">
                                            <a href="javascript:;" class="oiBtn infoBtn">정보</a>
                                            <div class="infoMemo">
                                                <div class="iCon">
                                                    본사 재고수량 입력 시, 쇼핑몰 매출에 따라 자동적으로 그 수량을 감소합니다.<br>다만, 본사재고 재입고시, 그 수량을 수정해 주셔야 합니다.   
                                                </div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
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
                            <a href="javascript:;" class="oiBtn infoBtn">정보</a>
                            <div class="infoMemo">
                                <div class="iCon">
                                    등록된 상품의 내부관리코드가 있을 경우, 자동으로 상품을 매칭처리하고 있습니다. 만일 동일한 상품이 아닐 경우, "해제"를 클릭해주십시오.
                                </div>
                            </div>
                        </span>
                    </header>
                    <div class="contentsArea">
                        <div class="maxHeight">
                            <table class="m-shadowTable">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>상품번호</th>
                                        <th>쇼핑몰 상품명</th>
                                        <th>카테고리</th>
                                        <th>판매가격</th>
                                        <th>재고수량</th>
                                        <th>해제</th>
                                    </tr>
                                </thead>
                                <tbody id="prdMatchingList">
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
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">배송비</span>
                                    <div class="input">
                                        <input type="text" value="2,500원">
                                    </div>
                                </div>
                            </li>
                            <li class="col-2">
                                <div class="fwBox">
                                    <span class="ft">출고지</span>
                                    <div class="input">
                                        <input type="text" readonly value="">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>-->
                <div class="btnArea">
                    <a href="javascript:;" class="modalClose mBtn sColorLB">취소</a>
                    <a href="javascript:;" class="mBtn sColorN" onclick="openAlertModal();">저장하기</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 저장확인 모달 -->
<div class="modal-container alert alert-pass" id="alert-confirm" style="display:none; width:1903px;">
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
                <a href="javascript:;" onclick="modalSave();" class="modalClose sBtn sColorLS2">예</a>
                <a href="javascript:;" class="modalClose sBtn bColorG">아니오</a>
            </div>
        </div>
    </div>
</div>

<div class="modal-container alert alert-pass" id="alertBlock">
    <div class="modal-wrapper">
        <header>
            <h2>서비스 안내</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="alert-content">
            <div class="alert-txt">
                <div class="icon">
                    <img src="/resources/rudicks/img/icon/alert-info.svg" alt="안내">
                </div>
                <div class="txtBox">
                    서비스 준비 중입니다.
                </div>
            </div>
            <div class="btnArea">
                <a href="javascript:;" class="modalClose sBtn sColorLS2">확인</a>
            </div>
        </div>
    </div>
</div>