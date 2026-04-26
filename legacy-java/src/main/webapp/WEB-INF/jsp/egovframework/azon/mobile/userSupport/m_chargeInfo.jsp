<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script type="text/javascript">
$(document).ready(function() {
});
</script>

<div class="contentGrid box-border">
	<div class="inner">
		<div class="conArticle">
			<div class="halfImg">
				<div class="col-1 txtBox center">
					<h5 class="caTitle md-txt">
						복잡한 요금체계는 이제 그만!<br /> 한 달<b>29,000원</b> <br /> 거기에 파격적인 이용기간
						할인까지
					</h5>
					<div class="pBox">
						<p class="sm-txt">
							복잡하거나 이용요금, 부가서비스, 이용자 ID, 등록 상품 수, 거래 수, 초기가입비, <br /> 큐빅아이에는
							없습니다. <br /> 한 달 무료 이용기간을 통해 쉽고 편리한 통합관리 서비스를 충분히 이용해 보세요! <br />
						</p>
					</div>
				</div>
				<div class="col-1 imgBox">
					<img src="/resources/rudicks/img/sub/confrim-img02.png" alt="영수증 이미지">
				</div>
			</div>
		</div>
		<div class="conArticle">
			<div class="descriptionBox">
				<h5>
					<span>요금안내</span>
				</h5>
				<div class="chargeList">
					<ul>
						<li><span><b>1개월</b>(VAT별도)</span> <span><b>29,000</b></span>
							<span>원/월</span> <span>매월 이용요금 결제</span></li>
						<li><span><b>3개월</b>(VAT별도)</span> <span><b>27,000</b></span>
							<span>원/월</span> <span>3개월마다 이용결제</span></li>
						<li><span><b>6개월</b>(VAT별도)</span> <span><b>25,000</b></span>
							<span>원/월</span> <span>6개월마다 이용결제</span></li>
						<!-- <li><span><b>12개월</b>(VAT별도)</span> <span><b>20,000</b></span>
							<span>원/월</span> <span>1년마다 이용결제</span></li> -->
					</ul>
				</div>
			</div>
			<div class="btnBox">
			<c:choose>
				<c:when test="${empty SES_USER}">
					<a href="/m/register/step1" class="sColorLB2 bBtn wBtn2">1개월 무료이용</a>
				</c:when>
				<c:otherwise>
					<a href="/m/cubici/mypage/myCharge" class="sColorLB2 bBtn wBtn2">요금제 변경</a>
				</c:otherwise>
			</c:choose>
			</div>
			<br><br><br>
			<div class="descriptionBox">
				<h5 class="bg-con">
					<span>이용안내</span>
				</h5>
				<ul class="dotList">
					<li>최초 회원가입의 경우, 자동으로 1개월 무료이용기간이 제공됩니다.</li>
					<li>회원가입 시, 선택하신 이용요금은 언제든지 변경이 가능합니다.</li>
					<li>제휴사나 연계 프로그램을 통해가입하시는 경우, 회원가입 시 해당 코드를 꼭 입력해 주십시오.</li>
				</ul>
			</div>
			<p style="color: #41587c;">큐빅아이의 유료 서비스 이용에 대한 책임과 요금변경,환불,민원 등의 처리는 큐빅아이에서 진행합니다.</p>
			<p style="color: #41587c;">* 민원 담당자 김태석 / 연락처 02-6925-6373</p>
		</div>
	</div>
</div>
