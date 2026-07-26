<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style>
.BRight {border-right:1px solid #ddd;}
</style>

<script>
let keyword = "";

$(document).ready(function() {
	SMSBoardList(0);

	$('input[name="search"]').keyup(function(e){
		if(e.keyCode == 13){
			$('#currentPageNum').val("");
			SMSBoardList(1);
		};
	});

	$('#searchBtn').click(function(){
		$('#currentPageNum').val("");
		SMSBoardList(1);
	});
});

function SMSBoardList(CURRENTPAGE){
	if(CURRENTPAGE != 0){
		$('#currentPageNum').val(CURRENTPAGE);
		currentPageNum = $('#currentPageNum').val();
	}else if($('#currentPageNum').val() == ""){
		currentPageNum = $('#currentPageNum').val()+1;
	}else{
		currentPageNum = $('#currentPageNum').val();
	}
	
	keyword = $('#keyword').val();
	
	let currentPage = currentPageNum-1;
	let	dataPerPage = 10;
	let dataCnt = currentPage * dataPerPage;
	
	let callUrl = "/admin/sms/list";
	let callBackFunc = "SMSBoardListResponse";
	let objParam = {
			dataPerPage : dataPerPage,
			currentPage : currentPage,
			dataCnt : dataCnt,
			keyword : keyword,
			SMS_KEY: "00"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function SMSBoardListResponse(data){
	let dataList = data.resultList;
	
	if(dataList.length > 0){
		let trHtml = "";
		
		$.each(dataList, function (index, item) {
			trHtml += '<tr><td class="BRight">' + item.SMS_MENU + '</td>';
			trHtml += '<td class="BRight">' + item.SMS_DIVISION + '</td>';
			trHtml += '<td class="BRight">' + item.SMS_ITEM + '</td>';
			trHtml += '<td class="BRight">' + item.SMS_TITLE + '</td>';
			trHtml += '<td class="BRight">' + item.SMS_CODE + '</td>';
			trHtml += '<td><a href="javascript:SMSboardDetail(' + item.SMS_NO + ');" class="sBtn sColorLB rBtn">보기</a></td></tr>';
		});
		$('#listTbody').empty().html(trHtml);
		
		let pageHtml = "";
		pageHtml += "<ul>";

		let pageMaxCnt = Math.ceil(dataList[0].CNT / data.dataPerPage);
		let dataPerPage = data.dataPerPage;
		let currentPage = data.currentPage;
		let pageCnt = Math.floor(currentPage / 10);
		
		if(pageCnt != 0){
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:SMSBoardList(" + ((pageCnt)*10) + ")'> < </a></li>";
		}
	
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){
			if( i > pageMaxCnt) {
				break;
			}
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:SMSBoardList(" + i + ")'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:SMSBoardList(" + i + ")'>" + i + "</a></li>";
			}
		}	
		
		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:SMSBoardList(" + ((pageCnt+1)*10 + 1) + ")'> > </a></li>";
		}
		pageHtml += '</ul>';
		$("#pagingButton").empty().html(pageHtml);
		
	} else {
		let trHtml = '<tr><td colspan="6">조회된 결과가 없습니다.</td></tr>';
		$('#listTbody').empty().html(trHtml);
		$('#pagingButton').empty();
	}
}

function SMSboardDetail(SMSNo){
	let form= $("<form></form>");
	form.attr("name", "detailForm");
	form.attr("method", "get");
	form.attr("action", "<c:url value='/admin/cubici/supportMember/manageSms/write'/>");
	form.append($("<input />", {type: "hidden", name: "SMS_NO", value: SMSNo}));
	form.appendTo("body");
	form.submit();
}

$(function(){
	$('#smsWrite').on('click', function(){
		$(location).attr("href", "<c:url value='/admin/cubici/supportMember/manageSms/write' />");
	});
});
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="/admin/cubici/supportMember/manageSms">문자 공지</a></li>
        <li><a href="/admin/cubici/supportMember/manageEmail">이메일</a></li>
    </ul>
</div>

<div class="m-baordSet">
    <div class="boardTop">
		<div class="wBtnDiv">
				<button id="smsWrite" class="sBtn sColorLB aiBtn write">글쓰기</button>
		</div>
        <div class="bRight">
            <div class="fwBox">
                <div class="input search">
                    <input type="text" name="search" id="keyword" placeholder="검색">
                    <button id="searchBtn" class="oiBtn search">검색</button>
                </div>
            </div>
        </div>
    </div>
    <div class="boardList">
		<table class="list">
			<thead>
				<tr>
					<th style="width:12%">메뉴</th>
					<th style="width:18%">구분</th>
					<th style="width:20%">항목</th>
					<th style="width:30%">요약</th>
					<th style="width:10%">코드</th>
					<th style="width:10%">보기</th>
				</tr>
			</thead>
			<tbody id ="listTbody"></tbody>
		</table>
		<div id="pagingButton" class="m-paging"></div>
     	<div style = "display:none"><input type="text" id="currentPageNum"/></div>       
	</div>
</div>