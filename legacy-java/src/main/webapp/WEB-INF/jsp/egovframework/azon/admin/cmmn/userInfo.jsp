<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
    </div>
</div>

<div class="m-tabBox active" id="userInfoDetail">
	<article class="m-modalGrid">
		<header>
			<h3>서비스 이용정보</h3>
		</header>
		<div class="contentsArea">
			<div class="item-wrap">
				<div class="item-header-02">
					<span>큐빅아이</span>
				</div>
				<div class="item-box">
					<ul class="item col-1">
						<li>
							<div class="fwBox">
								<span class="ft">요금제</span>
								<div class="input" id="">
									<p>${userStatusRateDetail.charge_name}</p>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">가입일자</span>
								<div class="input" id="">
									<p>${userStatusRateDetail.start_date}</p>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">만료일자</span>
								<div class="input" id="">
									<p>${userStatusRateDetail.expire_date}</p>
								</div>
							</div>
						</li>
					</ul>
					<ul class="item col-1">
						<li>
							<div class="fwBox">
								<span class="ft">결제금액</span>
								<div class="input" id="">
									<p>${userStatusRateDetail.amount}</p>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">연계코드명</span>
								<div class="input" id="">
									<p>${userStatusRateDetail.promo_name}</p>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">협력사</span>
								<div class="input" id="">
									<p>${userStatusRateDetail.partner_nm}</p>
								</div>
							</div>
						</li>
						<li>
							<div class="fwBox">
								<span class="ft">총 유료이용기간</span>
								<div class="input" id="">
									<p>${userStatusRateTotalDate.effective_count}일</p>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
			<div class="dot-hr"></div>
		</div>
	</article>
	
	<article class="m-modalGrid">
		<header>
			<div class="m-options">
				<h3>운영 쇼핑몰</h3>
			</div>
		</header>
		<div class="contentsArea">
			<ul class="item">
				<li class="col-1">
					<div class="fwBox autoHeight">
						<div class="ft">
							<p>
								<b>운영 쇼핑몰</b>
							</p>
						</div>
						<div class="input">
							<div class="checkArea">
								<div class="labelBox">
									<label class="checkBox"> <input type="checkbox"
										<c:if test="${userDetail.SHOP_1 ne \"''\"}">checked</c:if>
										onClick="return false;"> <span><img
											src="/resources/rudicks/img/partner-color/partner-sq-interpark.jpg"
											alt="인터파크">인터파크</span></label>
								</div>
								<div class="labelBox">
									<label class="checkBox"> <input type="checkbox"
										<c:if test="${userDetail.SHOP_11 ne \"''\"}">checked</c:if>
										onClick="return false;"> <span><img
											src="/resources/rudicks/img/partner-color/partner-sq-coupang.jpg"
											alt="쿠팡">쿠팡</span></label>
								</div>
								<div class="labelBox">
									<label class="checkBox"> <input type="checkbox"
										<c:if test="${userDetail.SHOP_14 ne \"''\"}">checked</c:if>
										onClick="return false;"> <span><img
											src="/resources/rudicks/img/partner-color/partner-sq-naver.jpg"
											alt="네이버">네이버</span></label>
								</div>
								<div class="labelBox">
									<label class="checkBox"> <input type="checkbox"
										<c:if test="${userDetail.SHOP_2 ne \"''\"}">checked</c:if>
										onClick="return false;"> <span><img
											src="/resources/rudicks/img/partner-color/partner-sq-gmarket.jpg"
											alt="지마켓">지마켓</span></label>
								</div>
								<div class="labelBox">
									<label class="checkBox"> <input type="checkbox"
										<c:if test="${userDetail.SHOP_3 ne \"''\"}">checked</c:if>
										onClick="return false;"> <span><img
											src="/resources/rudicks/img/partner-color/partner-sq-auction.jpg"
											alt="옥션">옥션</span></label>
								</div>
								<div class="labelBox">
									<label class="checkBox"> <input type="checkbox"
										<c:if test="${userDetail.SHOP_4 ne \"''\"}">checked</c:if>
										onClick="return false;"> <span><img
											src="/resources/rudicks/img/partner-color/partner-sq-11st.jpg"
											alt="11번가">11번가</span></label>
								</div>
							</div>
						</div>
					</div>
				</li>
			</ul>
			<ul class="item">
				<li>
					<div class="fwBox">
						<span class="ft">월 매출<i>(백만)</i></span>
						<div class="input">${userDetail.ORDER_PRICE} 원</div>
					</div>
				</li>
				<li>
					<div class="fwBox">
						<span class="ft">월 정산액<i>(백만)</i></span>
						<div class="input">${userDetail.total_amount} 원</div>
					</div>
				</li>
				<li>
					<div class="fwBox">
						<span class="ft">등록 SKU 수</span>
						<div class="input">${userDetail.TOTAL_SKU} 개</div>
					</div>
				</li>
			</ul>
			<ul class="item">
				<li>
					<div class="fwBox">
						<span class="ft">주거래 계좌</span>
						<div class="input">${userDetail.main_acc }</div>
						${userStatusDetail.main_bank_name } <div class="input"> ${userStatusDetail.main_acc}</div>
					</div>
				</li>
				<li>
					<div class="fwBox">
						<span class="ft">정산 계좌</span>
						<div class="input" id="tee">${userDetail.demand_acc }</div>
					</div>
				</li>
			</ul>
		</div>
	</article>
	<article class="m-modalGrid">
		<header>
			<h3>회원평가</h3>
			<span class="btns" id="evalbtns"> 
				<c:choose>
					<c:when test="${not empty userDetail.detail}">
						<button class="sBtn sColorLG" id="ModEvalbtns" >수정</button>
					</c:when>
					<c:otherwise>
						<button class="sBtn sColorLG" id="EnrollEvalbtns" >작성</button>
					</c:otherwise>
				</c:choose>	
			</span>
		</header>
		<div class="contentsArea">
			<div class="fwBox textarea">
				<div class="input">
					<textarea id="evaldetail" placeholder="" >${userDetail.detail}</textarea>
				</div>
			</div>
		</div>
		
		<input type="hidden" name="object_no" value="${userDetail.object_no }">
		
		<div class="c-boardSet">
			<div class="button-box">
				<a type="button" class="bBtn2 sColorN listBtn" onclick="">목록</a>
			</div>
		</div>
	</article>
</div>