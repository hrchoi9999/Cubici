<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div class="m-tabBox mInner mArticleArea tabArea" id="mbInfoDetail">
	<article class="m-modalGrid">
		<div class="contentsArea">
			<div class="item-col">
				<div class="col-4 colorBox">
					<span class="bold">머니뱅크 최초신청</span>
				</div>
				<div class="col-4">
					<ul class="item">
						<li>
							<div class="fwBox">
								<div class="input">
									<input type="text" id="first_date" value="" readonly />
								</div>
							</div>
						</li>
					</ul>
				</div>
				
				<div class="col-4 colorBox">
					<span class="bold">이용서비스</span>
				</div>
				<div class="col-4">
					<ul class="item">
						<li>
							<div class="fwBox">
								<div class="input">
									<input type="text" id="product_code2" value="" readonly />
								</div>
							</div>
						</li>
					</ul>
				</div>	
				
				<div class="col-4 colorBox">
					<span class="bold">MBID</span>
				</div>
				<div class="col-4">
					<ul class="item">
						<li>
							<div class="fwBox">
								<div class="input">
									<input type="text" id="mbInfoMbid" value="" readonly />
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</article>
	
	<article class="m-modalGrid">
		<div class="contentsArea">
			<div class="item-col">
				<div class="col-1 colorBox">
					<span class="bold">이용 서비스 상태</span>
				</div>
				<div class="col-5">
					<ul class="item">
						<li>
							<div class="fwBox">
								<span class="ft">신청일자</span>
								<div class="input">
									<input type="text" id="req_date" value="" readonly />
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">계약일자</span>
								<div class="input">
									<input type="text" id="cont_date" value="" readonly />
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">계약만료</span>
								<div class="input">
									<input type="text" id="cont_exp_date2" value="" readonly />
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</article>
	
	<article class="m-modalGrid">
		<div class="contentsArea">
			<div class="item-col">
				<div class="col-1 colorBox">
					<span class="bold">Prizm Credit<br><b id="prizm_detail_grade">-</b>등급</span>
				</div>
				<div class="col-5">
					<ul class="item">
						<li>
							<div class="fwBox">
								<span class="ft">종합</span>
								<div class="input">
									<span class="tColorLB">60/100</span>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">기업</span>
								<div class="input">
									<span>60/100</span>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">매출</span>
								<div class="input">
									<span class="tColorR">60/100</span>
								</div>
							</div>
						</li>
					</ul>
					<ul class="item">
						<li>
							<div class="fwBox">
								<span class="ft">정산</span>
								<div class="input">
									<span class="tColorLB">60/100</span>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">고객</span>
								<div class="input">
									<span class="tColorLB">60/100</span>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">운영</span>
								<div class="input">
									<span class="tColorR">60/100</span>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</article>
	<article class="m-modalGrid">
		<div class="contentsArea">
			<div class="item-col">
				<div class="col-1 colorBox">
					<span class="bold">Prizm Monitor<br><b id="prizm_detail_grade">-</b>등급</span>
				</div>
				<div class="col-5">
					<ul class="item">
						<li>
							<div class="fwBox">
								<span class="ft">매출</span>
								<div class="input">
									<span class="tColorLB">60/100</span>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">운영</span>
								<div class="input">
									<span>60/100</span>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">금융</span>
								<div class="input">
									<span class="tColorR">60/100</span>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</article>
	
	<article class="m-modalGrid">
		<div class="contentsArea">
			<div class="item-col">
				<div class="col-1 colorBox">
					<span class="bold" style="text-align:center;">이전 이력<br><br><b id="usageCnt"></b>건</span>
				</div>
				<div>
					<span>&nbsp;&nbsp;</span>
				</div>
				<div class="col-10">
					<table class="m-shadowTable">
						<thead>
							<tr>
								<th>No.</th>
								<th>계약 일자</th>
								<th>이용서비스</th>
								<th>이용총액</th>
								<th>계약완료</th>
								<th>서비스기간</th>
								<th>수수료</th>
								<th>PCS점수</th>
								<th>PMS점수</th>
							</tr>
						</thead>
						<tbody id="mbTbody"></tbody>
					</table>
				</div>
			</div>
		</div>
	</article>
	
	<div id="mbPagingButton" class="m-paging"></div>
	<div style = "display:none">
		<input type="text" id="currentPageNum"/>
	</div>
			
	<div class="c-boardSet">
		<div class="button-box">
			<a type="button" class="bBtn2 sColorN listBtn" onclick="">목록</a>
		</div>
	</div>
</div>
