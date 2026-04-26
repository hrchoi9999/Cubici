<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<div class="modal-container" id="inform_members">
    <div class="modal-wrapper" style="width: 500px">
        <header>
            <h2>서비스 안내</h2>
        </header>
        <div class="modal-content">
            <div class="mInner auto mArticleArea">
                <div class="noticeTxt" style="text-align: left">
                    안녕하세요,<br><br>
                    현재 큐빅아이는 보다 나은 서비스 제공을 위해서 전체 서비스 업그레이드 및 새로운
                    기능을 추가하고 있습니다. 이로 인하여 서비스 이용에 다소 <br>
                    불편함이 있을 수 있습니다. 잠시만 기다려주시면 신속하게 업그레이드를 <br>
                    완료해서 더 편리하고 풍부한 기능을 제공할 수 있도록 하겠습니다.<br>
                </div>
                <br>    
                <div class="noticeTxt">    
                    회원 여러분의 성공을 기원합니다.<br>
                    큐빅아이
                </div>
	            <div class="btnArea">
	                <a href="javascript:;" class="modalClose mBtn sColorLS2">확인</a>
	            </div>
            </div>
        </div>
    </div>
</div>

<div class="modal-container pass" id="re_join">
   <div class="modal-wrapper m-w400 bg-fff">
      <header>
         <h2 class="my">재방문 환영 혜택 !</h2>
      </header>
      <div class="contentGrid">
         <div class="modal-inner">
            <div class="conArticle modal">
               <div class="conArticle-inner m-b30 text-center">
                  <p class="m-b10 color-0e57bf f-s20">
                     <b>2주 무료 이용!</b>
                  </p>
                  <p class="txt-box color-0e57bf f-s15 f-w-300">쇼핑몰 통합정산 서비스, 큐빅아이 재방문을 진심으로 환영합니다!</p>
                  <p class="txt-box color-0e57bf f-s15 f-w-300">
                  		회원님의 큐빅아이 정보의 활성화에 동의하시면 재방문을 환영하는 마음으로 
                  	 	2주간의 무료이용기간을 제공합니다. 인공지능 기반의 쇼핑몰 통합정보 서비스 큐빅아이가 회원님의 사업 성공을 기원합니다.
                  </p>
               </div>
               <div class="day-close">
               		<input type="checkbox" class="dayClose" id="dayCloseRJ"><label for="dayCloseRJ">오늘 하루 열지 않기</label>
               </div>
               <div class="button-box">
                  <button class="m-big-btn modalClose">확인</button>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>

<!--무료기간 종료안내 -->
<div class="modal-container pass" id="freePeriodEnd">
	<div class="modal-wrapper m-w400 bg-fff">
		<header>
			<h2 class="my">무료기간 종료안내</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30 text-center">
						<p class="m-b10 color-0e57bf f-s20">
							<b>무료이용 기간이 종료됩니다!</b>
						</p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							회원님, 무료 이용기간이 <span id="free_expire_date"></span> 종료됩니다.<br>
							큐빅아이 서비스를 계속 이용하시길 원하시면 유료 서비스로 전환해주십시오.<br>
							큐빅아이는 합리적인 서비스 이용제를 통해서 회원님에게 더욱 큰 만족을 드리고자 합니다.
						</p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							인공지능 기반의 쇼핑몰 통합정보 서비스 큐빅아이가 회원님의 사업 성공을 기원합니다.</p>
						<div class="day-close">
							<input type="checkbox" class="dayClose" id="dayClose1-1"><label for="dayClose1-1">오늘 하루 열지 않기</label>
						</div>
					</div>
					<div class="button-box">
						<button type="button" class="m-big-btn myCharge">서비스 이용신청</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--서비스 이용 종료안내 -->
<div class="modal-container pass" id="periodEnd">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">서비스 이용 종료안내 !</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20">
							<b>이용하고 계신 서비스가 만료됩니다! </b>
						</p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							${principal.username} 회원님, <br><br>
							현재 이용하고 계신 큐빅아이 서비스가 만료됨에 따라 서비스 이용이 종료될 예정입니다.<br>
							아래 정보를 확인하시고 서비스 연장을 신청해주시면 감사하겠습니다.<br>
						</p>
						<div class="m-txt-content2 f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<p>
								<span class="square-txt f-w-500 w130">이용 서비스 </span>:<span class="f-w-300" id="charge_name"></span>
							</p>
							<p>
								<span class="square-txt f-w-500 w130">시작일자 </span>:<span class="f-w-300" id="start_date"></span>
							</p>
							<p>
								<span class="square-txt f-w-500 w130">종료일자 </span>:<span class="f-w-300" id="using_expire_date"></span>
							</p>
						</div>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							서비스 종료 이후에는 휴면회원으로 전환되며 서비스 접근은 가능하나<br>내용은 열람하실 수 없습니다.<br><br>
							감사합니다.<br>
							큐빅아이
						</p>
						<div class="day-close">
							<input type="checkbox" class="dayClose" id="dayClose1-2"><label for="dayClose1-2">오늘 하루 열지 않기</label>
						</div>
					</div>
					<div class="button-box">
						<button type="button" class="m-big-btn myCharge">서비스 연장</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--머니뱅크 계약 종료안내  !  -->
<div class="modal-container pass" id="MbPeriodEnd">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">머니뱅크 계약 종료 안내</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20 text-center">
							<b>계약기간이 종료됩니다! </b>
						</p>
						<br>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							현재 이용하고 계신 <span id="">머니뱅크 서비스</span> 계약이 아래와 같이 종료됩니다.<br>
							계약만기 시, 이용하고 계신 <span id="">OOO 서비스</span> 금액 전액 상환이 필요합니다.<br>
							서비스의 지속적인 사용을 위하여 머니뱅크 신청페이지를 통해 <br>재신청해주시기 바랍니다.
						</p>
						<div class="m-txt-content2 f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<p>
								<span class="square-txt f-w-500 w130">이용 서비스 </span>:<span class="f-w-300" id="">머니뱅크 서비스</span>
							</p>
							<p>
								<span class="square-txt f-w-500 w130">계약일자 </span>:<span class="f-w-300" id="contract_date"></span>
							</p>
							<p>
								<span class="square-txt f-w-500 w130">만기일자 </span>:<span class="f-w-300" id="contract_expire_date"></span>
							</p>
						</div>
						<p class="txt-box color-0e57bf f-s15 f-w-300 text-center">
							인공지능 기반의 쇼핑몰 통합정보 서비스 큐빅아이가<br> 회원님의 사업 성공을 기원합니다.
						</p>
						<div class="day-close">
							<input id="dayClose1" type="checkbox" class="dayClose" id="dayClose1-3"/><label for="dayClose1-3">오늘 하루 보지 않기</label>
						</div>
					</div>
					<div class="button-box">
						<button class="m-big-btn modalClose">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 1-4 서비스 접근 제한 -->
<div class="modal-container pass" id="mbSignUp">
	<div class="modal-wrapper m-w400 bg-fff">
		<header>
			<h2 class="my">서비스 접근 제한</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							${principal.username} 회원님,<br><br>
							클릭하신 페이지 접근을 위해서는 머니뱅크 서비스 가입이 필요합니다.<br>
							머니뱅크는 비대면 방식 합리적 조건의 간편금융 서비스입니다.<br><br>
							감사합니다.<br>큐빅아이
						</p>
						<div class="day-close">
							<input type="checkbox" class="dayClose" id="dayClose1-4"><label for="dayClose1-4">오늘 하루 열지 않기</label>
						</div>	
					</div>
					<div class="button-box">
						<button type="button" class="m-big-btn mbApp">서비스 신청</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 1-4-2 계약 진행중 알림 -->
<div class="modal-container pass" id="mbProgress">
	<div class="modal-wrapper m-w400 bg-fff">
		<header>
			<h2 class="my">서비스 접근 제한</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							서비스 신청이 진행중입니다. <br>
							이어서 진행하시겠습니까? <br><br>
						</p>
					</div>
					<div class="button-box">
						<button type="button" class="m-big-btn modalClose processContinue">계속 진행하기</button>
						<button type="button" class="m-big-btn processEnd">취소</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 2-1 서비스 접근 제한 -->
<div class="modal-container pass" id="serviceForbidden">
	<div class="modal-wrapper m-w400 bg-fff">
		<header>
			<h2 class="my">서비스 접근 제한</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20 text-center">
							<b>큐빅아이 활성화가 필요합니다!</b>
						</p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							${principal.username} 회원님,<br><br>
							클릭하신 페이지 접근을 위해서는 큐빅아이 서비스 활성화가 필요합니다.<br>
							큐빅아이 활성화 시, 재사용을 환영하는 의미에서 2주 무료 기간을 추가해드립니다.
						</p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							서비스 활성화를 위하여 아래  “나의 요금” 을 클릭해주십시오.<br>
							<b>인공지능 기반의 쇼핑몰 통합정보 서비스 큐빅아이</b>
						</p>
						<div class="day-close">
							<input type="checkbox" class="dayClose" id="dayClose2-1"><label for="dayClose2-1">오늘 하루 열지 않기</label>
						</div>
					</div>
					<div class="button-box">
						<button type="button" class="m-big-btn myCharge">나의 요금</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 2-2 서비스 이용 제한 // 휴면 97 -->
<div class="modal-container pass" id="rejoinBenefit">
	<div class="modal-wrapper m-w400 bg-fff">
		<header>
			<h2 class="my">서비스 이용 제한</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20 text-center">
							<b>큐빅아이 활성화가 필요합니다!</b>
						</p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							${principal.username} 회원님,<br><br>
							회원님은 현재 휴면 회원으로 서비스 이용을 위해 큐빅아이 서비스 활성화가 필요합니다.<br>
							큐빅아이 활성화 시, 재사용을 환영하는 의미에서 2주 무료 기간을 추가해드립니다.
						</p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							서비스 활성화를 위하여 아래  “나의 요금” 을 클릭해주십시오.<br>
							<b>인공지능 기반의 쇼핑몰 통합정보 서비스 큐빅아이</b>
						</p>
						<div class="day-close">
							<input type="checkbox" class="dayClose" id="dayClose2-2"><label for="dayClose2-2">오늘 하루 열지 않기</label>
						</div>
					</div>
					<div class="button-box">
						<button type="button" class="m-big-btn myCharge">나의 요금</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>