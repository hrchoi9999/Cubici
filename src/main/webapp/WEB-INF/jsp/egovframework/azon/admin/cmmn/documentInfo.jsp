<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<div class="m-tabBox mInner mArticleArea tabArea" id="documentInfoDetail">
	<article class="m-modalGrid">
		<header>
			<h3>사업자 증빙서류</h3>
		</header>
		<div class="contentGrid m-45">
			<div class="conArticle m-45">
				<div class="conArticle-inner m-b30">
					<div class="money-bank-table table-border2">
						<table class="file-sub-table">
							<colgroup>
								<col width="9%">
								<col width="11%">
								<col width="9%">
								<col width="11%">
								<col width="9%">
								<col width="11%">
								<col width="9%">
								<col width="11%">
								<col width="9%">
								<col width="11%">
							</colgroup>
							<tbody class="align-center ">
								<tr>
									<td>신용보고서</td>
									<td>
										<div class="tIn">
											<a href="javascript:;" class="oiBtn download"></a>
										</div>
									</td>
									<td>주거래계좌</td>
									<td>
										<div class="tIn">
											<a href="javascript:;" class="fileDownload oiBtn download main_chk"></a>
										</div>
									</td>
									<td>정산계좌</td>
									<td>
										<div class="tIn">
											<a href="javascript:;" class="fileDownload oiBtn download demand_chk"></a>
										</div>
									</td>
								</tr>
								<tr></tr>
								<tr>
									<td>사업자등록증</td>
									<td><span id="biz_chk"></span></td>
									
									<td>주민등록등본</td>
									<td><span id="reg_chk"></span></td>
									
									<td>국세완납증명</td>
									<td><span id="national_chk"></span></td>
									
									<td>지방세완납증명</td>
									<td><span id="local_chk"></span></td>

									<td>의료보험완납</td>
									<td><span id="health_chk"></span></td>
								</tr>
								<tr></tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</article>
	
	<article class="m-modalGrid">
		<header>
			<h3>서비스 계약이력</h3>
		</header>
		<div class="contentsArea">
			<div class="item-col">
				<div id="fixTable" class="fixTable">
					<div class="col-9">
						<table class="m-shadowTable">
							<thead>
								<tr>
									<th>NO</th>
									<th>계약 일자</th>
									<th>이용서비스</th>
									<th>MBID</th>
									<th>계약서</th>
								</tr>
							</thead>
							<tbody id="docTbody"></tbody>
						</table>   
					</div>
				</div>
			</div>
		</div>
	</article>
	
	<div class="c-boardSet">
		<div class="button-box">
			<div id="docPagingButton" class="m-paging"></div>
			<div style = "display:none">
				<input type="text" id="currentPageNum"/>
			</div>
			<a type="button" class="bBtn2 sColorN listBtn" onclick="">목록</a>
		</div>
	</div>
</div>