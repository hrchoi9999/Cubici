<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>


<script>

	$(document).ready(function(){
		
		// 기본 계약 info
		setPageInfo();
		
		// 신청 쇼핑몰 나열
		displayShop();
		
		// 현황 & 이력 테이블
		getDetailLog();
		
		
		// 실행금 신청
		$("#confirm_btn").on('click', function() {

			// 실행금 입력값
			let settingPriceText = 0;
			settingPriceText = document.getElementById("executeAmnt").value;

			if (settingPriceText == "") {
				alert("선지급 실행금액이 설정되지 않았습니다.");
			} else {
				settingPriceText = parseInt(settingPriceText.replaceAll(",", ""))*1000000;
			}

			// 회원번호
			let seq = "${mbankInfo.SEQ}";
			
			// 기준일자
			let standardDate = "${standard_date}";
			
			// 신청 Process
			let callUrl = "/moneybank/advPay/executeInsert";
			let callBackFunc = "execRequestResult";
			objParam = {
				SEQ : seq,
				REQUEST_PROVIDER: "BB31",
				settingPriceText : settingPriceText,
				standard_date : standardDate
			}
			cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
		});
		
	})
	
	// 기본 계약정보 표시
	function setPageInfo(){
		
		// 이용조건
		let totalAmount = comma("${mbankInfo.B2B_LIMIT_AMOUNT}");
		let interestRate = "${mbankInfo.INTEREST_RATE}" + "% / 일";
		let feeRate = "${mbankInfo.FEE_RATE}" + "% / 일";
		let wholesaleNm = "${mbankInfo.WHOLESALE_NM}"
		let availAmount = comma("${mbankInfo.AVAILABLE_AMOUNT}");
		let demandBankInfo = "${mbankInfo.DEMAND_ACC_BANK_NM}" +"\u00a0"+ "${mbankInfo.DEMAND_ACC_NUMBER}" +"\u00a0"+ "${mbankInfo.DEMAND_ACC_HOLDER}";
		let mainBankInfo = "${mbankInfo.MAIN_ACC_BANK_NM}" +"\u00a0"+ "${mbankInfo.MAIN_ACC_NUMBER}" +"\u00a0"+ "${mbankInfo.MAIN_ACC_HOLDER}";
		
		$("#totalAmount").text(totalAmount);
		$("#interestRate").text(interestRate);
		$("#feeRate").text(feeRate);
		$("#wholesaleNm").val(wholesaleNm);
		$("#availableAmnt").val(availAmount);
		$("#demandBankInfo").text(demandBankInfo);
		$("#mainBankInfo").text(mainBankInfo);
		
	}
	
	// 신청 쇼핑몰 나열 FUNC
	function displayShop(){
		
		let shopHtml = "";

		let currShops = ('${mbankInfo.REQUEST_SHOP}').split(",");
		
		currShops.forEach( shop => {
			
			shopHtml += '<span class="color-blue2">';
			
			switch(shop){
				case '1':
					shopHtml+= '<img src="/resources/rudicks/img/partner-color/auction-con.png" alt="">옥션</span>';
					break;
				case '2':
					shopHtml+= '<img src="/resources/rudicks/img/partner-color/naver-con.png" alt="">네이버</span>';
					break;
				case '3':
					shopHtml+= '<img src="/resources/rudicks/img/partner-color/gmarket-con.png" alt="">지마켓</span>';
					break;			
				case '4':
					shopHtml+= '<img src="/resources/rudicks/img/partner-color/11st-con.png" alt="">11번가</span>';
					break;
				case '11':
					shopHtml+= '<img src="/resources/rudicks/img/partner-color/coupang-con.png" alt=""></span>';
					break;
				case '14':
					shopHtml+= '<img src="/resources/rudicks/img/partner-color/interpark-con.png" alt=""></span>';
					break;
			}
		})
		shopHtml += '<button type="button" class="t-btn bg-699de7" onclick="shopChange()">수정</button>';
		$("#currentShop").html(shopHtml);
	}
	
	// 현황 & 이력 데이터 가져오기 FUNC
	function getDetailLog() {
		
		let standardDate = "${standard_date}";
		let fromDate = $("#fromDate").val();
		let toDate = $("#toDate").val();
		let seq = "${mbankInfo.SEQ}";
		
		let callUrl = "/moneybank/advPay/current/getDetails";
		let callBackFunc = "getDetailResponse";
		let objParam = {
			standardDate : standardDate,
			fromDate : formatDate(fromDate),
			toDate : formatDate(toDate),
			SEQ : seq,
			ORDER : "DESC"
		};
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}
	
	// 현황 & 이력 데이터 CALLBACK FUNC
	function getDetailResponse(data){
		
		let resultList = data.executeList;
		
		let tableHtml = "";
		
		tableHtml += '<tr>';
		tableHtml += '<th class="w50">No.</th>';
		tableHtml += '<th class="w140">상태</th>';
		tableHtml += '<th class="w140">실행 CODE</th>';
		tableHtml += '<th class="w140">입금일자</th>';
		tableHtml += '<th class="w140">입금금액</th>';
		tableHtml += '<th class="w140">상환총액</th>';
		tableHtml += '<th class="w140">상환잔액</th>';
		tableHtml += '<th class="w140">상세보기</th>';
		tableHtml += '<th class="w200">직접상환</th>';
		tableHtml += '</tr>';
		
		for(let i = 0; i < resultList.length; i++){
			
			let thisMap = resultList[i];
			
			let rowNum = i+1;
			let repayStatus = "";
			let repayBtnClass = "";
			
			if(thisMap.remaining_repayment_amount > 0){
				
				if(thisMap.actual_payment == thisMap.remaining_repayment_amount){
					repayStatus = "입금";
				}else{
					repayStatus = "상환중"
				}
				repayBtnClass = "t-btn bg-0e57bf"; 
			
			}else{
				repayStatus = "완료";
				repayBtnClass = "t-btn bg-bfbfbf";
			}
			
			tableHtml += '<tr>';
			tableHtml += '<td class="w50">'+rowNum+'</td>';
			tableHtml += '<td class="w40">'+repayStatus+'</td>';
			tableHtml += '<td class="w140">'+thisMap.entry_name+'</td>';
			tableHtml += '<td class="w140">'+thisMap.deposit_date+'</td>';
			tableHtml += '<td class="w140">'+thisMap.total_payment+'</td>';
			tableHtml += '<td class="w140">'+thisMap.total_repayment+'</td>';
			tableHtml += '<td class="w140">'+thisMap.remaining_repayment_amount+'</td>';
			tableHtml += '<td class="w140"><button class="t-btn bg-699de7" type="button" onclick="getExecDetail('+thisMap.entry+', \''+thisMap.entry_name+'\', \''+thisMap.deposit_date+'\', \''+thisMap.total_payment+'\', \''+thisMap.total_repayment+'\', \''+thisMap.remaining_repayment_amount+'\')"> 보기</button></td>';
			tableHtml += '<td class="w167"><button class="'+repayBtnClass+'" type="button" onclick="directRepay('+thisMap.entry+', \''+thisMap.entry_name+'\', \''+thisMap.total_payment+'\')"> 신청</button></td>';
			tableHtml += '</tr>';
		}
		
		$("#executeTable").html(tableHtml);
	}
	
	// 실행금건에 대한 상환 상세 Modal
	function getExecDetail(entry, execName, depoDate, totalAmnt, repayAmnt, remainAmnt){
		
		$("#detailEntry").text(entry);
		$("#detailExecName").text(execName);
		$("#detailDepoDate").text(formatDate(depoDate));
		$("#detailTotalAmnt").text(comma(totalAmnt));
		$("#detailTotalRepay").text(comma(repayAmnt));
		$("#detailRemainAmnt").text(comma(remainAmnt));
		
		let seq = "${mbankInfo.SEQ}";
		
		let callUrl = "/moneybank/advPay/current/repayModal";
		let callBackFunc = "getRepayModal";
		let objParam = {
			ENTRY : entry,
			SEQ : seq,
			ORDER : "DESC"
		};
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
		
	}
	
	// 실행금건에 대한 상환 상세 Modal callback FUNC
	function getRepayModal(data){

		let modalRepayHtml = "";
		
		let resultList = data.repayInfo;
		
		modalRepayHtml += '<tr>';
		modalRepayHtml += '<th class="f-w-500 w50">No.</th>';
		modalRepayHtml += '<th class="f-w-500 w80">기준일자</th>';
		modalRepayHtml += '<th class="f-w-500 w80">상환구분</th>';
		modalRepayHtml += '<th class="f-w-500 w80">쇼핑몰</th>';
		modalRepayHtml += '<th class="f-w-500 w80">주문건수</th>';
		modalRepayHtml += '<th class="f-w-500 w80">정산입금액</th>';
		modalRepayHtml += '<th class="f-w-500 w80">상환금액</th>';
		modalRepayHtml += '<th class="f-w-500 w80">잔액반환</th>';
		modalRepayHtml += '<th class="f-w-500 w120">상환잔액</th>';
		modalRepayHtml += '</tr>';
		
		for(let i = 0; i<resultList.length; i++){

			let thisMap = resultList[i];
			
			let rowNum = i+1;
			
			let typeDisplay = "";
			if(thisMap.repay_type == "auto"){
				typeDisplay = "자동상환";
			} else if(thisMap.repay_type == "direct"){
				typeDisplay = "직접상환";
			}
			
			modalRepayHtml += '<tr>';
			modalRepayHtml += '<td class="w50">'+rowNum+'</td>';
			modalRepayHtml += '<td class="w80">'+formatDate(thisMap.repayment_date)+'</td>';
			modalRepayHtml += '<td class="w80">'+typeDisplay+'</td>';
			modalRepayHtml += '<td class="w80">'+thisMap.shop_type+'</td>';
			modalRepayHtml += '<td class="w80">'+'{건수}'+'건</td>';
			modalRepayHtml += '<td class="w80">'+comma(thisMap.total_repayment_amount)+'</td>';
			modalRepayHtml += '<td class="w80">'+comma(thisMap.original_amount)+'</td>';
			modalRepayHtml += '<td class="w80">'+comma(thisMap.total_return_amount)+'</td>';
			modalRepayHtml += '<td class="w90">'+comma(thisMap.repayment_remaining_amount)+'</td>';
			modalRepayHtml += '</tr>';
		}
	
		$("#modalRepayTable").html(modalRepayHtml);
		
		modalOpen("repayDetailModal");
		
	}
		
	// 직접 상환 Modal
	function directRepay(entry, name, payment){
		
		let seq = "${mbankInfo.SEQ}";
		let targetDate = "${standard_date}";
		
		let callUrl = "/moneybank/advPay/current/directRepayModal";
		let callBackFunc = "getDirectRepayModal";
		let objParam = {
			SEQ : seq,
			ENTRY : entry,
			TARGET_DATE : targetDate,
			EXECUTE_NAME : name,
			TOTAL_PAYMENT : payment
		};
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}
	
	// 직접 상환 Modal callback FUNC
	function getDirectRepayModal(data){
		
		let directMap = data.directMap;
		
		$("#direct_entryName").text(directMap.EXECUTE_NAME);
		$("#direct_depositAmnt").text(comma(directMap.TOTAL_PAYMENT));
		$("#direct_repayAmnt").text(comma(directMap.repayFinalizeVal));
		
		modalOpen("directRepayModal");
	}
	
	// 전액 상환 Modal
	function completeRepay(){
		
		let seq = "${mbankInfo.SEQ}";
		let targetDate = "${standard_date}";
		
		let callUrl = "/moneybank/advPay/current/totalRepayModal";
		let callBackFunc = "getCompleteRepayModal";
		let objParam = {
			SEQ : seq,
			TARGET_DATE : targetDate
		};
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
		
	}
	
	// 전액 상환 Modal callback FUNC
	function getCompleteRepayModal(data){
		
		let totalRepayAmnt = comma(data.repayMap.totalRepayAmount) + " 원";
		
		$("#totalRepayAmount").text(totalRepayAmnt);
		
		modalOpen("completeRepayModal");
		
	}
	
	// 한도증액 Modal
	function execAmntChange(){
		modalOpen("execAmntChangeModal");
	}
	
	// 등록쇼핑몰 변경 Modal
	function shopChange(){
		modalOpen("shopChangeModal");
	}
	
	//신청 결과 알림 Func
	function execRequestResult(data) {
		if (data.insertCode == 0) {
			modalInfo("신청 되었습니다!");
		} else if (data.insertCode == 88) {
			modalInfo("실행금액 신청가능 금액이 아닙니다.");
		} else {
			modalInfo("선지금 실행금액 설정 신청 실패");
		}
	}
	
</script>
<script>
	//상세현황 스크롤
	$('#overTable').mCustomScrollbar({
    	theme: "dark-3"
	});
</script>

<!-- 컨텐츠 -->
		<div class="contentGrid m-45">
							<div class="inner wide">

								<div class="page-title">
									<h2>기본정보</h2>
									<small class="ruby-right"><span>기준일자</span> 2021 / 06 / 16</small>
								</div>

								<div class="conArticle m-45">
									<div class="conArticle-inner">
										<h3>선지급 이용조건</h3>
										<div class="money-bank-table color-g box-border-blue">
											<table class="text-left h-f-blue header-w150">
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b>이용한도 총액</b>
													</th>
													<td class="border-r-none bg-sky">
														<b class="color-blue">30,000,000원</b>
														<button type="button" class="t-btn right bg-699de7">한도증액</button>
													</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b>계약일자</b>
													</th>
													<td class="border-r-none">
														<b class="color-blue">2022년 1월 12일</b>
														<button type="button" class="t-btn right bg-699de7">계약서</button>
													</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b> 대출이자율</b>
													</th>
													<td class="border-r-none">
														<span class="color-blue f-w-300">0.033%/일</span>
													</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b>이용 수수료</b>
													</th>
													<td class="border-r-none f-w-300">
														<span class="color-blue">0.008%/일</span>
													</td>
												</tr>
											</table>
										</div>
									</div>
								</div>

								<div class="conArticle m-45">
									<div class="conArticle-inner">
										<h3>기본회원정보</h3>
										<div class="money-bank-table color-g box-border-blue">
											<table class="h-f-blue">
												<tr class="border-bottom-g">
													<th class="w120 bg-sky">
														<b> 회사명</b>
													</th>
													<td class="border-r-none">
														길동상사
													</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b>대표자</b>
													</th>
													<td class="border-r-none">
														홍길동
													</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b>사업자번호</b>
													</th>
													<td class="border-r-none">
														123-456-7890
													</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b>큐빅아이 ID</b>
													</th>
													<td class="border-r-none">
														hoho123@xxx.co.kr
													</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														</b> <b>가입일자</b>
													</th>
													<td class="border-r-none">2021/05/15</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b>선지급 신청일자</b>
													</th>
													<td>2021/06/15</td>
												</tr>
												<tr class="border-bottom-g">
													<th class="bg-sky">
														<b> 요구불 계좌</b>
													</th>
													<td class="border-r-none" colspan="3">
														XX은행 111-1111-111111
													</td>
												</tr>
												<tr>
													<th class="bg-sky" rowspan="2">
														<b> 주거래 계좌</b>
													</th>
													<td colspan="3" class="border-r-none border-b-none">
														<span> XX은행 111-1111-111111</span>
													</td>
												</tr>
												<tr>
													<td colspan="3" class="border-r-none">
														<button type="button" class="t-btn right bg-699de7">계좌변경</button>
													</td>
												</tr>
											</table>
										</div>
									</div>
								</div>
								<div class="conArticle m-45">
									<div class="conArticle-inner">
										<h3>등록 B2B도매몰 정보</h3>
										<div class="money-bank-table table-border fix-table">
											<table>
												<thead class="bg-blue">
													<tr>
														<th>등록 B2B 도매몰</th>
														<th>B2B 아이디</th>
														<th colspan="2">선지급 대상 쇼핑몰</th>
													</tr>
												</thead>
												<tbody class="align-center ">
													<tr>
														<td class="color-blue2 w120">
															비밀특가
														</td>
														<td class="color-blue2 w120">
															xxxx@xxxx.com
														</td>
														<td class="span-shop border-r-none">
															<span class="color-blue2"><img src="../img/partner-color/auction-con.png"
																	alt="옥션">옥션</span>
															<span class="color-blue2"><img src="../img/partner-color/naver-con.png"
																	alt="네이버">네이버</span>
															<span class="color-blue2"><img src="../img/partner-color/gmarket-con.png"
																	alt="지마켓">지마켓</span>
															<span class="color-blue2"><img src="../img/partner-color/11st-con.png"
																	alt="11번가">11번가</span>
														</td>
														<td>
															<button type="button" class="t-btn bg-699de7">수정</button>
														</td>
													</tr>
													<tr>
														<td>
															도매꾹
														</td>
														<td class="color-blue2">
															xxxx@xxxx.com
														</td>
														<td class="span-shop  border-r-none">
															<span class="color-blue2"><img src="../img/partner-color/auction-con.png"
																	alt="옥션">옥션</span>
															<span class="color-blue2"><img src="../img/partner-color/naver-con.png"
																	alt="네이버">네이버</span>
															<span class="color-blue2"><img src="../img/partner-color/gmarket-con.png"
																	alt="지마켓">지마켓</span>
															<span class="color-blue2"><img src="../img/partner-color/11st-con.png"
																	alt="11번가">11번가</span>
														</td>
														<td>
															<button type="button" class="t-btn bg-699de7">수정</button>
														</td>
													</tr>
											</table>
										</div>
									</div>
								</div>
							</div>

							<div class="conArticle m-45">
								<div class="conArticle-inner">
									<h3 class="big-txt">선지급 입금신청</h3>
									<small class="ruby-right"><span>기준일자</span> 2021 / 06 / 16</small>
									<form>
										<div class="money-bank-table box-border-blue">
											<table class="register-table type2 ">
												<tbody>
													<tr class="border-bottom-g ">
														<td class="border-r-none">
															<label><b class="square-txt color-blue">도매몰 선택 </b></label>
															<select class="wide">
																<option> 선택하세요.</option>
																<option> A 몰</option>
															</select>
														</td>
													</tr>
													<tr>
														<td class="border-r-none ">
															<label><b class="square-txt color-blue">보유잔액</b></label>
															<input class="wide align-left" type="text" placeholder="870,000원" required>
														</td>
													</tr>
													<tr>
														<td class="border-b-none">
															<label><b class="square-txt color-blue">추가 입금 요청액</b></label>
															<input class="bg-e6eff8 border-5a9aff wide align-left" type="text" placeholder="870,000원"
																required>
															<span class="color-blue">백만원</span>
														</td>
													</tr>
													<tr>
														<td class="border-r-none text-center">
															<button type="button" class=" t-big-btn bg-0e57bf">신청</button>
														</td>
													</tr>
												</tbody>
											</table>
									</form>
								</div>
							</div>
						</div>


						<div class="conArticle m-45">
							<div class="conArticle-inner">
								<h3 class="big-txt">이용 서비스 현황</h3>
								<button class="repay-btn  bg-0e57bf" type="button">전액상환</button>
								<div class="money-bank-table table-border fix-table">
									<table class="f-w-400">
										<thead class="bg-blue">
											<tr>
												<th class="w80">No.</th>
												<th class="w140">계약일자</th>
												<th class="w140">이용서비스</th>
												<th class="w140">연계 도매몰</th>
												<th class="w140">이용 한도총액</th>
												<th class="w140">누적 이용금액</th>
												<th class="w140">누적 상환금액</th>
												<th class="w140">상환잔액</th>
												<th class="w140">이용가능잔액</th>
												<th class="w140">계약잔여일자</th>
											</tr>
										</thead>
										<tbody class="text-center color-blue2">
											<tr>
												<td>1</td>
												<td>21/07/10</td>
												<td>선지급</td>
												<td>비밀특가</td>
												<td>20,000,000</td>
												<td>28,000,000</td>
												<td>18,000,000</td>
												<td>10,000,000</td>
												<td>8,000,000</td>
												<td>156일 (22/07/09)</td>
											</tr>
									</table>
								</div>
								<form>
									<div class="money-bank-table box-border-blue">
										<table class="register-table type2">
											<tbody>
												<tr class="border-bottom-g ">
													<td class="border-r-none">
														<div class="input-set">
															<label class="txt-none">상태</label>
															<select class="wide">
																<option> 상태</option>
																<option> 사용</option>
															</select>
															<label class="txt-none">도매몰</label>
															<select class="wide">
																<option> ----B2B도매몰----</option>
																<option>----B2B도매몰----</option>
															</select>
														</div>
														<div class="flex-s m-b10">
														<label><b class="square-txt color-blue">기간검색</b></label>
														<div class="m-r-10">
															<input type="date" data-placeholder="시작" required><span>~</span>
															<input type="date" data-placeholder="21/09/20" required>
														</div>
														<div>
															<button type="button" class="w130 t-big-btn bg-0e57bf">검색</button>
															<label class="txt-none">도매몰</label>
															<select class="w150">
																<option>----보기설정----</option>
																<option>----0----</option>
															</select>
														</div>
													</div>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</form>


								<div class="ruby-padding">
									<small class="ruby-right"><span>기준일자</span> 2021 / 06 / 16</small>
									<div class="money-bank-table fix-header table-border fix-table">
										<table class="sky2 text-center">
											<tr>
												<th class="w50 bg-sky">No.</th>
												<th class="w140 bg-sky">상태</th>
												<th class="w140 bg-sky">실행 CODE</th>
												<th class="w140 bg-sky">입금일자</th>
												<th class="w140 bg-sky">신청금액</th>
												<th class="w140 bg-sky">입금금액</th>
												<th class="w140 bg-sky">상환총액</th>
												<th class="w140 bg-sky">상환잔액</th>
												<th class="w140 bg-sky">상세보기</th>
												<th class="w200 bg-sky">직접상환</th>
											</tr>
											<tr>
												<td>1</td>
												<td>상환중</td>
												<td>AA014</td>
												<td>21/08/15</td>
												<td>2,000,000</td>
												<td>1,000,000</td>
												<td>200,000</td>
												<td>800,000</td>
												<td><button class="t-btn2 bg-699de7" type="button"> 보기</button></td>
												<td><button class="t-btn2 bg-0e57bf" type="button"> 보기</button></td>
											</tr>
											<tr>
												<td>2</td>
												<td>상환중</td>
												<td>AA013</td>
												<td>21/07/09</td>
												<td>2,000,000</td>
												<td>1,000,000</td>
												<td>1,600,000</td>
												<td>400,000</td>
												<td><button class="t-btn2 bg-699de7" type="button"> 보기</button></td>
												<td><button class="t-btn2 bg-0e57bf" type="button"> 신청</button></td>
											</tr>
											<tr>
												<td>3</td>
												<td>완료</td>
												<td>AA012</td>
												<td>21/05/15</td>
												<td>2,000,000</td>
												<td>1,000,000</td>
												<td>200,000</td>
												<td>0</td>
												<td><button class="t-btn2 bg-699de7" type="button"> 보기</button></td>
												<td><button class="t-btn2 bg-0e57bf" type="button"> 신청</button></td>
											</tr>
											<tr>
												<td>4</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td><button class="t-btn2 bg-bfbfbf" type="button"> 신청</button></td>
											</tr>
											<tr>
												<td>5</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td><button class="t-btn2 bg-bfbfbf" type="button"> 신청</button></td>
											</tr>
											<tr>
												<td>6</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
											</tr>
											<tr>
												<td>7</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
											</tr>
											<tr>
												<td>8</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
											</tr>
											<tr>
												<td>9</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
											</tr>
											<tr>
												<td>9</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
											</tr>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
<!-- //컨텐츠 -->

<!-- 금액 변경 MODAL -->
<div class="modal-container" id="execAmntChangeModal">
	<div class="modal-wrapper">
		<header>
		<h2>이용안내</h2>
		</header>
		<div class="modal-content">
			<div class="mInner auto mArticleArea">   
				<div class="noticeTxt-03">
					<h3>현재 선지급 이용한도:30백만원</h3>   
					<form>
						<label>조정 요청한도</label>
						<input type="text" placeholder="요청금액 입력">
						<span>백만원</span>
					</form>
					<div class="btnArea2">
						<a href="javascript:;" class="modalClose bBtn3 sColorLB">신청</a>
					</div>
					<ul class="barList">
						<li>
							선지급 이용한도는 최소 5백만원에서 최대 50백안 원입니다. <br/>
							조정요청 금액을 백만원 단위로 입력해 주세요
						</li>
						<li>
							조정 신청을 하시면 심사를 통하여 24시간이내에 그 결과를  알려드립니다.
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>

<!--등록 쇼핑몰 변경-->
<div class="modal-container pass" id="shopChangeModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>등록 쇼핑몰 변경</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="page-title">
					<h3>기본정보</h3>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<h3>머니뱅크 이용방법</h3>
						<div class="money-bank-table w740 color-g box-border-blue">
							<table class="h-f-blue header-w140 text-left">
								<tr class="border-bottom-g">
									<th class="bg-sky">
										<b>아이디</b>
									</th>
									<td class="w230 border-r-none">
										hoho123@xxx.co.kr
									</td>
									<th class="bg-sky">
										<b> 회사명</b>
									</th>
									<td class="w230 border-r-none">
										길동컴퍼니
									</td>
								</tr>
								<tr class="border-bottom-g">
									<th class="bg-sky">
										<b>대표자</b>
									</th>
									<td class="w230 border-r-none">
										홍길동
									</td>
									<th class="bg-sky">
										사업자번호
									</th>
									<td>
										123-456-7890
									</td>
								</tr>
								<tr>
									<th class="bg-sky">
										<b>주소</b>
									</th>
									<td class="w230 border-r-none">서울 강남구 봉은사로 435</td>
									<th colspan="2" class="bg-sky"></th>
								</tr>
							</table>
						</div>
					</div>
				</div>

				<div class="conArticle  modal">
					<div class="conArticle-inner">
						<h3>등록 쇼핑몰 변경</h3>
						<p class="txt-box color-0e57bf f-s15">
							기존 등록 B2B 도매몰의 온라인 쇼핑몰이 변경된 경우 해당 B2B도매몰의 온라인 쇼핑몰 선택을 통해 수정해
							주십시오. <br />
							신규 B2B 도매몰 등록의 경우 B2B도매몰과 아이디를 입력하시고 온라인 쇼핑몰을 선택해주십시오.
						</p>
						<form>
							<div class="money-bank-table box-border-blue">
								<table class="register-table modal">
									<tbody>
										<tr class="border-bottom-g ">

											<td class="w370 border-r-none">
												<label><b class="square-txt color-blue">B2B 도매몰 </b></label>
												<select class="wide">
													<option>-------- B2B몰 선택 --------</option>
													<option> A 몰</option>
												</select>
											</td>
											<td class="w370">
												<label><b class="square-txt color-blue">B2B 아이디</b></label>
												<input class="wide align-left" type="text" placeholder="hoho123" required>
											</td>
										</tr>
										<tr>
											<td colspan="2">
												<p>선지급 서비스를 이용할 B2B 도매사이트를 선택하시고 해당 몰의 아이디를 입력해주세요.</p>
												<input class="check-shop" id="Shop1" type="checkbox" name="shop" /><label
													for="Shop1"><img src="/resources/rudicks/img/partner-color/auction-con.png" alt="">옥션</label>
												<input class="check-shop" id="Shop2" type="checkbox" name="shop" /><label
													for="Shop2"><img src="/resources/rudicks/img/partner-color/naver-con.png" alt="">네이버</label>
												<input class="check-shop" id="oShop3" type="checkbox" name="shop" /><label
													for="Shop3"><img src="/resources/rudicks/img/partner-color/gmarket-con.png" alt="">지마켓</label>
												<input class="check-shop" id="Shop4" type="checkbox" name="shop" /><label
													for="Shop4"><img src="/resources/rudicks/img/partner-color/11st-con.png" alt="">11번가</label>
												<input class="check-shop" id="Shop5" type="checkbox" name="shop" /><label
													for="Shop5"><img src="/resources/rudicks/img/partner-color/coupang-con.png" alt="쿠팡"></label>
												<input class="check-shop" id="Shop6" type="checkbox" name="shop" /><label
													for="Shop6"><img src="/resources/rudicks/img/partner-color/interpark-con.png" alt="인터파크"></label>
												<div class="button-box">
													<button class="m-big-btn f-s16" type="button">신청</button>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--상세상환내역-->
<div class="modal-container pass" id="repayDetailModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>상세 상환 내역</h2>
			<span class="m-ruby-right  bg-0e57bf"><b>기준일자 </b>${standard_date}</span>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<h3 class="f-s20">실행금 상황현황</h3>

						<div class="money-bank-table f-s14  table-border">
							<table class="f-w-400">
								<thead class="bg-blue">
									<tr>
										<th class="f-w-500 w60">No.</th>
										<th class="f-w-500 w95">실행Code</th>
										<th class="f-w-500 w95">입금일자</th>
										<th class="f-w-500 w95">선지급입금액</th>
										<th class="f-w-500 w95">상환총액</th>
										<th class="f-w-500 w95">상환잔액</th>
									</tr>
								</thead>
								<tbody class="text-center color-blue2">
									<tr>
										<td class="w60" id="detailEntry"></td>
										<td class="w95" id="detailExecName"></td>
										<td class="w95" id="detailDepoDate"></td>
										<td class="w95" id="detailTotalAmnt"></td>
										<td class="w95" id="detailTotalRepay"></td>
										<td class="w95" id="detailRemainAmnt"></td>
									</tr>
							</table>
						</div>
					</div>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<h3 class="f-s20">정산입금 상세내역</h3>
						<div class="money-bank-table f-s14 table-border">
							<table class="m-fix-header text-center h-363 bg-blue" id="modalRepayTable"></table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--전액 일시 상환-->
<div class="modal-container pass" id="completeRepayModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>전액 일시 상환</h2>
			<span class="m-ruby-right  bg-0e57bf"><b>기준일자 </b> 2021 / 06 / 16</span>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s16 text-center">
							기상환금액은 이용기간 및 상환금액에 따라 변동되고 있습니다.<br />
							전액상환을 위해서는 상환기준 일자에 아래 상환잔액을 입금해 주십시오.
						</p>
						<div class="money-bank-table w460 f-s14  table-border">
							<table class="f-w-400">
								<thead class="bg-blue">
									<tr>
										<th class="f-w-500 w90">회원명</th>
										<th class="f-w-500">선지급 계약일</th>
										<th class="f-w-500">상환기준일자</th>
										<th class="f-w-500">중도상환 필요액</th>
									</tr>
								</thead>
								<tbody class="text-center color-blue2">
									<tr>
										<td class="f-w-300 w90">${info.USER_NM}</td>
										<td class="f-w-300">${mbankInfo.MONEYBANK_REQUEST_DATE}</td>
										<td class="f-w-300">${standard_date}</td>
										<td class="f-w-300" id="totalRepayAmount"></td>
									</tr>
							</table>
						</div>
					</div>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s15 f-w-300 text-center">
							중도상환 입금 시, 등록하신 주거래계좌를 통해서 아래 계좌의 집금번호란에<br />
							회원명을 입력하시고 정확한 중도상환 필요액을 입금해 주십시오.
						</p>
						<div class="m-txt-content f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<span class="square-txt">중도상환 입금 계좌 &nbsp; : </span> &nbsp; <span>OO은행 123456-00-123456</span>
						</div>
						<div class="button-box">
							<button class="m-big-btn">확인</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--직접 상환 신청-->
<div class="modal-container pass" id="directRepayModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>직접 상환 신청</h2>
			<span class="m-ruby-right  bg-0e57bf"><b>기준일자 </b> 2021 / 06 / 16</span>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s17 text-center">
							선택하신 실행금의 상환금액은 이용기간 및 상환잔액에 따라 변동되고 있습니다.<br />
							선택 실행금을 상환완료 이전 직접상환하기 위해서는 기준 일자를 확인하시고<br />
							아래 상환잔액을 입금해 주십시오.
						</p>
						<div class="money-bank-table w590 f-s14 table-border">
							<table class="f-w-400 ">
								<thead class="bg-blue">
									<tr>
										<th class="f-w-500">선지급계약일</th>
										<th class="f-w-500">실행금코드</th>
										<th class="f-w-500">입금액</th>
										<th class="f-w-500">기준일자</th>
										<th class="f-w-500">중도상환 필요액</th>
									</tr>
								</thead>
								<tbody class="text-center color-blue2">
									<tr>
										<td class="f-w-300">${mbankInfo.MONEYBANK_REQUEST_DATE}</td>
										<td class="f-w-300" id="direct_entryName"></td>
										<td class="f-w-300" id="direct_depositAmnt"></td>
										<td class="f-w-300">${standard_date}</td>
										<td class="f-w-500 f-s16" id="direct_repayAmnt"></td>
									</tr>
							</table>
						</div>
					</div>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s15 f-w-300 text-center">
							중도상환 입금 시, 등록하신 주거래계좌를 통해서 아래 계좌의 집금번호란에<br />
							회원명을 입력하시고 정확한 중도상환 필요액을 입금해 주십시오.
						</p>
						<div class="m-txt-content f-s16 f-w-300 box-border-blue bg-d5e5f5 ">
							<span class="square-txt">중도상환 입금 계좌 &nbsp; : &nbsp; OO은행 123456-00-123456</span>
						</div>
						<div class="button-box">
							<button class="m-big-btn">확인</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>