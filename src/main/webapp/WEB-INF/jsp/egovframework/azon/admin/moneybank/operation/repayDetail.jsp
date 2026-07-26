<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<script>
$(document).ready(function(){

	// modal datepicker reset
	$.datepicker.setDefaults({
		dateFormat: 'yymmdd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		dayNames: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
		showMonthAfterYear: true,
		yearSuffix: '년'
	});
	$("#popFromDate").datepicker({ dateFormat: 'yy-mm-dd' }).val();
	$("#popFromDate").datepicker();
	$("#popToDate").datepicker({ dateFormat: 'yy-mm-dd' }).val();
	$("#popToDate").datepicker();
	
	// Default modal 날짜 설정
	$("#popFromDate").val("${fromDate}");
	$("#popToDate").val("${toDate}");
	$("#evalDate").val("${todayDateStr}");
	
	// 모달 현황 검색버튼
	$("#modalSearchBtn").on("click", function(){
		event.preventDefault();
		modalRepayList(seq, userNo)
	});
	
	$("#memSeq").val(seq);
	
	// 현황
	modalRepayList(seq, userNo);
	// 평가
	modalEvalList(seq, userNo);
	
	// 상환이력 데이터 가져오기
	let callUrl = "/admin/moneybank/hellopay/ops/repayDetail";
	let callBackFunc = "repayDetailModal";
	let objParam = {
		SEQ : seq,
		standard_date : "${standardDate}"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);

})
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="javascript:;">상환 상세현황</a></li>
    </ul>
</div>

<div>
<div class="mInner mArticleArea tabArea">
                <article class="m-modalGrid">
                    <header class="m-options">
                        <h3>이용서비스 : 헬로페이 선지급</h3>
                        <span class="baseDate pRight"><b>작성 기준일</b>${standardDate}</span>
                    </header>
                    <input type="hidden" id="memSeq">
                    <div class="contentsArea">
                    	<ul class="item">
                         	<li>
                                <div class="fwBox">
                                    <span class="ft">이름</span>
                                    <div class="input" id="memName"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">회원ID</span>
                                    <div class="input" id="memId"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">최초가입</span>
                                    <div class="input" id="memApplied"></div>
                                </div>
                            </li>
                        </ul>
                    	<ul class="item">
                         	<li>
                                <div class="fwBox">
                                    <span class="ft">머니뱅크 계좌</span>
                                    <div class="input" id="mbAccount"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">주거래 계좌</span>
                                    <div class="input" id="mainAccount"></div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">신청일자</span>
                                    <div class="input" id="requestDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">승인일자</span>
                                    <div class="input" id="approvalDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">계약일자</span>
                                    <div class="input" id="contractDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">만료일자</span>
                                    <div class="input" id="expireDate"></div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">계약금액</span>
                                    <div class="input" id="totalPayment"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">대출이자</span>
                                    <div class="input" id="interestRate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">수수료</span>
                                    <div class="input" id="feeRate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">기타</span>
                                    <div class="input" id=""></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <article class="m-tab">
                    <ul>
                        <li class="active"><h2><a href="javascript:;">상환상세</a></h2></li>
                        <li><h2><a href="javascript:;">CRA</a></h2></li>
                    </ul>
                </article>
                <div class="m-tabBox active">
                    <article class="m-modalGrid">
                        <header>
                            <h3>상환 현황</h3>
                            <!-- <div class="btns">
                                <a href="javascript:;" class="sBtn sColorN">상환 연장 신청</a>
                            </div> -->
                        </header>
                        <div class="m-search">
						   <ul>
						       <li>
						          <div class="fwBox">
						                <span class="ft">상태</span>
						                <div class="input" id="repayStatusSearch">
						                    <select>
						                        <option value="-">전체</option>
						                        <option value="">상환</option>
						                        <option value="">입금</option>
						                        <option value="">신청</option>
						                    </select>
						                </div>
						           </div>
						       </li>
						       <li>
								<div class="fwBox">
								      <span class="ft">B2B업체</span>
								      <div class="input" id="repayPartnerSearch">
								          <select>
								              <option value="-">전체</option>
								              <option value="">업체1</option>
								              <option value="">업체2</option>
								          </select>
								      </div>
								</div>
						        </li>
						        <li>
						            <div class="fwBox">
						                <span class="ft">계약일자</span>
						                <div class="input">
						                    <input type="text" id="popFromDate">
						                </div>
						            </div>
						        </li>
						        <li>
						            <div class="fwBox">
						                <span class="ft">계약일자</span>
						                <div class="input">
						                    <input type="text" id="popToDate">
						                </div>
						            </div>
						        </li>
						        <li>
						            <div class="btns">
						                <button class="sBtn sColorLB search" id="modalSearchBtn">검색</button>
						            </div>
						        </li>
						    </ul>
						</div>
                        <div class="maxHeight">
                            <table class="m-shadowTable tal">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>일자</th>
                                        <th class="tal">구분</th>
                                        <th>B2B도매몰</th>
                                        <th>선지급 총액</th>
                                        <th>상환총액</th>
                                        <th>원금</th>
                                        <th>이자</th>
                                        <th>수수료</th>
                                        <th>잔액반환</th>
                                        <th>잔여이용가능금액</th>
                                        <th>상세보기</th>
                                    </tr>
                                </thead>
                                <tbody id="repayHistoryLog"></tbody>
                            </table>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <header>
                            <h3>회원 평가</h3>
                            <div class="btns">
                                <a class="sBtn sColorN" id="insertEval" style="cursor: pointer">평가하기</a>
                            </div>
                        </header>
                        <div class="contentsArea evalSheet">
	                       <ul class="item">
                               <li class="col-1">
                                   <div class="fwBox">
                                   	<span class="ft">작성일자</span>
                                       <div class="input">
                                           <input type="text" class="datepicker" id="evalDate">
                                       </div>
                                   </div>
                               </li>
                               <li class="col-1">
                                   <div class="fwBox">
                                       <span class="ft">구분</span>
                                       <div class="input">
                                           <select id="evalSubject">
                                               <option value="">선택</option>
                                               <option value="서류">서류</option>
                                               <option value="심사">심사</option>
                                               <option value="계약">계약</option>
                                               <option value="상환">상환</option>
                                               <option value="해지">해지</option>
                                           </select>
                                       </div>
                                   </div>
                               </li>
                               <li class="col-1">
                                   <div class="fwBox">
                                   	<span class="ft">담당자</span>
                                       <div class="input">
                                           <input type="text" id="evalReviewer">
                                       </div>
                                   </div>
                               </li>
	                       </ul>
	                       <ul class="item">
                              <li class="col-1">
                                   <div class="fwBox">
                                       <span class="ft">제목</span>
                                       <div class="input">
                                           <input type="text" id="evalTitle">
                                       </div>
                                   </div>
                               </li>
                           </ul>
                           <br>
                           <div class="fwBox textarea">
                               <div class="input">
                                   <textarea id="evalDetail" placeholder="회원평가를 작성하여주세요"></textarea>
                               </div>
                           </div>
                           <!-- <div class="addBtns">
                               <a href="javascript:;" class="sBtn sColorLG">작성</a>
                               <a href="javascript:;" class="sBtn sColorLG">수정</a>
                               <a href="javascript:;" class="sBtn sColorLB">확인</a>
                           </div> -->
                           <br>
                        </div>
                        <div class="maxHeight">
                            <table class="m-shadowTable tal">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>일자</th>
                                        <th>작성자</th>
                                        <th>구분</th>
                                        <th>제목</th>
                                        <th>주의</th>
                                    </tr>
                                </thead>
                                <tbody id="repayReviewLog"></tbody>
                            </table>
                        </div>
                    </article>
                </div>
                <div class="m-tabBox ">
                    <article class="m-modalGrid">
                        <table class="m-mixTable">
                            <tr class="bgLightGray">
                                <td colspan="2"></td>
                                <td>12/01</td>
                                <td>12/02</td>
                                <td>12/03</td>
                                <td>12/04</td>
                                <td>12/05</td>
                                <td>12/06</td>
                                <td>12/07</td>
                                <td>12/08</td>
                                <td>12/09</td>
                                <td>12/10</td>
                                <td>12/11</td>
                                <td>12/12</td>
                                <td>12/13</td>
                                <td>Today</td>
                            </tr>
                            <tr>
                                <td class="bgColorLB" colspan="2">CRA Score</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorF">C</td>
                                <td class="bgColorF">C</td>
                                <td class="bgColorP">C</td>
                                <td class="bgColorR">C</td>
                                <td class="bgColorR">C</td>
                                <td class="bgColorG">C</td>
                                <td class="bgColorG">C</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorG">C</td>
                                <td class="bgColorG">C</td>
                            </tr>
                            <tr class="bgSkin">
                                <td rowspan="3">핵<br>심</td>
                                <td>결제통장 변경여부</td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                            </tr>
                            <tr class="bgSkin">
                                <td>온라인 송금 설정 여부</td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                            </tr>
                            <tr class="bgSkin">
                                <td>선정산 자금흐름 경고</td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                            </tr>
                            <tr class="bgBeige">
                                <td rowspan="3">매<br>출</td>
                                <td>매출액 변화</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBeige">
                                <td>주문당 매출액 변화</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBeige">
                                <td>동일 id 반복구매율</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBlueGray">
                                <td rowspan="3">운<br>영</td>
                                <td>구매자 수</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBlueGray">
                                <td>배송안전성</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBlueGray">
                                <td>주간 반품율</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                        </table>
                    </article>
                </div>
                <div class="btnArea">
                    <a href="javascript:;" class="modalClose mBtn sColorLB">취소</a>
                    <a href="javascript:;" class="modalClose mBtn sColorN">확인</a>
                </div>
            </div>
</div>

<!-- 상환 상세정보 MODAL -->
<div class="modal-container" id="repayDetModal" style="">
    <div class="modal-wrapper">
        <header>
            <h2>상환 상세 내역</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner mArticleArea tabArea">
                <div class="m-tabBox active">
                	<article class="m-modalGrid">
                        <header>
                            <h3>상환 입금 상세내역</h3>
                        </header>
                        <div class="maxHeight">
                            <table class="m-shadowTable tal">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>기준일자</th>
                                        <th>상환구분</th>
                                        <th>쇼핑몰</th>
                                        <th>주문건수</th>
                                        <th>입금 금액</th>
                                        <th>비고</th>
                                    </tr>
                                </thead>
                                <tbody id="detModalDetailLog"></tbody>
                            </table>
                        </div>
                    </article>
                </div>
                <div class="btnArea">
                    <a href="javascript:;" class="modalClose mBtn sColorLB">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>