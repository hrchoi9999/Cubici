<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>

<div class="contentGrid m-45">
	<div class="inner wide">

		<div class="page-title">
			<h2>서비스 해지</h2>
		</div>

		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<div class="money-bank-table color-g box-border-blue">
					<table class="text-left h-f-blue header-w150">
						<tr class="border-bottom-g ">
							<th class="w130 bg-sky"><span class="f-color-111">아이디</span>
							</th>
							<td class="border-r-none">hoho123</td>
						</tr>
						<tr class="border-bottom-g ">
							<th class="bg-sky"><span class="f-color-111">회사명</span></th>
							<td class="border-r-none">길동컴퍼니</td>
						</tr>
						<tr class="border-bottom-g">
							<th class="bg-sky"><span class="f-color-111"> 대표자명</span></th>
							<td class="border-r-none"><span>홍길동</span></td>
						</tr>
						<tr class="border-bottom-g ">
							<th class="bg-sky"><span class="f-color-111">사업자등록번호</span>
							</th>
							<td class="border-r-none f-w-300">111-1234-5678</td>
						</tr>
						<tr>
							<th class="bg-sky"><span class="f-color-111">주소</span></th>
							<td class="border-r-none">서울 강남구 봉은사로 435</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		<div class="page-title">
			<h2>이용정보</h2>
		</div>

		<div class="conArticle m-45">
			<div class="conArticle-inner m-b30">
				<h3>서비스 이용내역</h3>
				<div class="money-bank-table m-fix-table table-border2">
					<table>
						<thead>
							<tr>
								<th class="w150">구분</th>
								<th class="w150">서비스</th>
								<th class="w150">최초가입</th>
								<th class="w150">종료일자</th>
								<th class="w150">서비스 해지</th>
							</tr>
						</thead>
						<tbody class="align-center ">
							<tr>
								<td>기본 서비스</td>
								<td>3개월 요금제</td>
								<td>21/10/20</td>
								<td>21/01/19</td>
								<td>
									<button type="button" class="t-m-btn2 bg-0e57bf">서비스
										해지</button>
								</td>
							</tr>
							<tr>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td>
									<button type="button" class="t-m-btn2 bg-bfbfbf">서비스
										해지</button>
								</td>
							</tr>
					</table>
				</div>
			</div>

			<div class="conArticle-inner">
				<h3>머니뱅크 이용현황</h3>
				<button class="ruby-btn" type="button">전체서비스 해지</button>
				<div class="money-bank-table m-fix-table table-border2">
					<table>
						<thead>
							<tr>
								<th class="w130">이용 서비스</th>
								<th class="w130">시작일자</th>
								<th class="w130">만기일자</th>
								<th class="w130">상환 잔액</th>
								<th class="w130">상태</th>
								<th class="w130">해지 신청</th>
							</tr>
						</thead>
						<tbody class="align-center ">
							<tr>
								<td>B2B 구매자금</td>
								<td>2021. 07. 15</td>
								<td>2021. 10. 15</td>
								<td>2,512,000</td>
								<td>이용중</td>
								<td>
									<button type="button" class="t-m-btn2 bg-0e57bf">서비스
										해지</button>
								</td>
							</tr>
							<tr>
								<td>단비 펀드</td>
								<td>2020. 06. 16</td>
								<td>2021. 06. 15</td>
								<td>0</td>
								<td>상환완료</td>
								<td>
									<button type="button" class="t-m-btn2 bg-bfbfbf">서비스
										해지</button>
								</td>
							</tr>
							<tr>
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

<!-- 모달 -->
<!--서비스 해지 불가-->
<div class="modal-container pass" id="alert-pass">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">서비스 해지</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30 f-s14">
						<p class="m-b10 color-0e57bf f-s20">
							<b>홍길동 회원님</b><span>,</span>
						</p>
						<p class="txt-box color-0e57bf f-s14 f-w-300">기회원님께서는 아래와 같은
							이유로 해지진행이 어려운 것으로 판단됩니다. 아래 내용을 확인하시고 이후 진행 부탁드립니다.</p>
						<div
							class="m-txt-content2 f-s14 box-border-blue bg-d5e5f5 f-w-300">
							<span class="square-txt">머니뱅크 미정산금 &nbsp; : </span> <span>1,000,000원</span>
						</div>
						<p class="txt-box color-0e57bf f-s14 f-w-300">
							머니뱅크 서비스 해지를 위해서는 머니뱅크 <b>“전체서비스 해지”</b>를 클릭해 주십시오. 보다 자세한 내용은
							Q&A 게시판을 통해 문의하시면 보다 자세하게 안내드리도록 하겠습니다.<br /> 감사합니다.
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn2">취소</button>
						<button class="m-big-btn">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<!--서비스 해지 사유-->
<div class="modal-container pass" id="alert-pass">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">서비스 해지</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30  f-s14">
						<p class="m-b10 color-0e57bf f-s20">
							<b>홍길동 회원님</b><span>,</span>
						</p>
						<p class="txt-box color-0e57bf f-w-300">회원님께서는 큐빅아이 서비스 해지를
							신청하셨습니다. 아래와 서비스 해지를 원하시는 일자를 선택하시고 해지 사유를 선택해 주시면 대단히 감사하겠습니다.
							향후 더 좋은 서비스로 다시 뵐 수 있기를 희망합니다.</p>
						<div
							class="m-txt-content2 f-s14 box-border-blue bg-d5e5f5 f-w-300">
							<p>
								<span class="square-txt">머니뱅크 미정산금 &nbsp; :</span> <span>1,000,000원</span>
							</p>
						</div>
						<p class="txt-box color-0e57bf f-w-300">
							머니뱅크 서비스 해지를 위해서는 머니뱅크 <b>“전체서비스 해지”</b>를 클릭해 주십시오. 보다 자세한 내용은
							Q&A 게시판을 통해 문의하시면 보다 자세하게 안내드리도록 하겠습니다.<br /> 감사합니다.
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn2">취소</button>
						<button class="m-big-btn">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<!--전액 상환-->
<div class="modal-container pass" id="alert-pass">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">머니뱅크 전체서비스 해지</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30 f-s14">
						<p class="m-b10 color-0e57bf f-s20">
							<b>홍길동 회원님</b><span>,</span>
						</p>
						<p class="txt-box color-0e57bf f-w-300">이용하고 계시는 머니뱅크 000 모든
							서비스의 해지를 위해서는 아래 상환잔액을 먼저 입금하셔야 합니다. 신청일자 기준 상환입금 필요금액은 다음과 같습니다.
						</p>
						<div
							class="m-txt-content2 f-s14 box-border-blue bg-d5e5f5 f-w-300">
							<p>
								<span class="square-txt f-w-500">서비스명 </span> :<span
									class="f-w-300">머니뱅크 전체서비스</span>
							</p>
							<p>
								<span class="square-txt f-w-500">선지급 이용총액 </span>: <span
									class="f-w-300">2,000,000원</span>
							</p>
							<p>
								<span class="square-txt f-w-500">상환입금 필요금액 </span>:<span
									class="f-w-300">875,000원</span>
							</p>
						</div>
						<p class="txt-box color-0e57bf f-w-300">
							보다 상세한 상환내역 및 직접상환을 위해서는 <b class="underline-txt">“전액상환신청” </b>페이지를
							통해서 진행해주시면 됩니다. 보다 자세한 내용은 Q&A 게시판을 통해 문의하시면 보 다 자세하게 안내드리도록
							하겠습니다.<br /> 감사합니다.<br /> 큐빅아이
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn2">취소</button>
						<button class="m-big-btn">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<!--중도 상환-->
<div class="modal-container pass" id="alert-pass">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">머니뱅크 전체서비스 해지</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30 f-s14">
						<p class="m-b10 color-0e57bf f-s20">
							<b>홍길동 회원님</b><span>,</span>
						</p>
						<p class="txt-box color-0e57bf f-w-300">이용하고 계시는 머니뱅크 000 모든
							서비스의 해지를 위해서는 아래 상환잔액을 먼저 입금하셔야 합니다. 신청일자 기준 상환입금 필요금액은 다음과 같습니다.
						</p>
						<div
							class="m-txt-content2 f-s14 box-border-blue bg-d5e5f5 f-w-300">
							<p>
								<span class="square-txt f-w-500">서비스명 </span> :<span
									class="f-w-300">머니뱅크 전체서비스</span>
							</p>
							<p>
								<span class="square-txt f-w-500">선지급 이용총액 </span>: <span	class="f-w-300">2,000,000원</span>
							</p>
							<p>
								<span class="square-txt f-w-500">상환입금 필요금액 </span>:<span class="f-w-300">875,000원</span>
							</p>
						</div>
						<p class="txt-box color-0e57bf f-w-300">
							보다 상세한 상환내역 및 직접상환을 위해서는 <b class="underline-txt">“중도상환신청” </b>페이지를
							통해서 진행해주시면 됩니다. 보다 자세한 내용은 Q&A 게시판을 통해 문의하시면 보 다 자세하게 안내드리도록
							하겠습니다.<br /> 감사합니다.<br /> 큐빅아이
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn2">취소</button>
						<button class="m-big-btn">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>



<!--해지일자-->
<div class="modal-container pass" id="alert-pass">
	<div class="modal-wrapper m-w720 bg-fff">
		<header>
			<h2 class="my">서비스 해지</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20">
							<b>홍길동 회원님</b><span>,</span>
						</p>
						<p class="txt-box color-0e57bf f-s14 f-w-300">회원님께서는 큐빅아이 서비스
							해지를 신청하셨습니다. 아래와 서비스 해지를 원하시는 일자를 선택하시고 해지 사유를 선택해 주시면 대단히
							감사하겠습니다. 향후 더 좋은 서비스로 다시 뵐 수 있기를 희망합니다.</p>
						<ul class="deco-box">
							<li><label class="square-txt">해지일자 지정 </label> <input
								type="date" data-placeholder="해당일자 지정" required />
							<li><label class="square-txt">해지사유 </label> <select>
									<option>해지사유 선택</option>
									<option>해지사유</option>
									<option>해지사유</option>
							</select></li>
							<li><label class="square-txt">서비스 잔액 발생 시, 입금요청 통장 </label>
								<select>
									<option>은행</option>
									<option>은행</option>
									<option>은행</option>
							</select> <input type="text" placeholder="계좌번호 입력" /></li>
						</ul>
						<p class="txt-box color-0e57bf f-s14 f-w-300">
							만일 머니뱅크 서비스를 이용하고 계셨다면, 큐빅아이 서비스 해지와 함께 머니뱅크의 모든 서비스의 계약 도 함께
							자동적으로 해지가 됩니다. <br /> 그동안 큐빅아이와 함께해 주셔서 대단히 감사합니다. <br /> 큐빅아이
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn2">취소</button>
						<button class="m-big-btn">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>