<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>    

<div class="m-tabBox">
	<article class="m-modalGrid">
		<div class="contentsArea">
			<div class="service-table fix-header">
				<table class="txt-center">
					<thead>
						<tr>
							<th class="b-b" rowspan="2">No</th>
							<th class="b-b" rowspan="2">결제일자</th>
							<th class="b-b" rowspan="2">이용 요금제</th>
							<th class="b-b" colspan="2">이용기간</th>
							<th class="b-b" rowspan="2">서비스 이용료(부가세 제외)</th>
							<th class="b-b" rowspan="2">요금제 변경일자</th>
							<th class="b-b" rowspan="2">제휴이벤트</th>
							<th class="b-b" rowspan="2">환불 금액</th>
						</tr>
						<tr class="b-b">
							<th class="b-b">시작</th>
							<th class="b-b">종료</th>
						</tr>
					</thead>
					<tbody id="listTbody">
					</tbody>
				</table>
			</div>
		</div>
	</article>
	<div id="pagingButton" class="m-paging"></div>
	<div style = "display:none">
		<input type="text" id="currentPageNum"/>
	</div>
			
	<div class="c-boardSet">
		<div class="button-box">
			<a type="button" class="bBtn2 sColorN listBtn" onclick="">목록</a>
		</div>
	</div>
</div>
