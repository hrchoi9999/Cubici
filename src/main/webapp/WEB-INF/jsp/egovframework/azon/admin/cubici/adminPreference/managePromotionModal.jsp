<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<div class="modal-container alert resetClose"style="z-index:999;" id="promotion-modal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2 id="modal-title"></h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal w900">
					<header class="admin-header">
						<div class="m-options">
							<h3>연계코드 기본정보</h3>
						</div>
					</header>
					<div class="m-search">
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">연계코드명</span>
									<div class="input">
										<input type="text" id="promo_name">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox" id = "span_promo_code">
									<span class="ft">연계코드</span>
									<div class="input">
										<input type="text" id="promo_code" readonly>
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox" id="start_date_span">
									<span class="ft">시작일자</span>
									<div class="input">
										<input type="text" class="startDatepicker" id="start_date" autocomplete="off" readonly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox" id="end_date_span">
									<span class="ft">종료일자</span>
									<div class="input">
										<input type="text" class="endDatepicker" id="end_date" autocomplete="off" readonly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox" id="span_input_date">
									<span class="ft">등록일자</span>
									<div class="input">
										<input type="text" id="input_date">
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">대상</span>
									<div class="input">
										<select id="promo_target">
											<option value="" selected disabled>선택</option>
											<option value="N">신규</option>
											<option value="C">큐빅회원</option>
											<option value="M">MB회원</option>
											<option value="L">휴면회원</option>
											<option value="A">제휴사회원</option>
											<option value="O">기타</option>
										</select>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">구분</span>
									<div class="input" id="partner_division_div">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">협력사코드</span>
									<div class="input" id="partner_code_div">
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li class="fw">
								<div class="fwBox col-1">
									<span class="ft">연계요금제</span>
									<div class="input" id="charge_code">
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">무료 기간</span>
									<div class="input">
										<input type="text" id="free_period" maxlength="2" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
									</div>
									<div class="input">
										<select id="free_period_unit">
											<option value="" selected>선택</option>
											<option value="M">개월</option>
											<option value="W">주</option>
										</select>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox col-1">
									<span class="ft">제공 ID 수</span>
									<div class="input">
										<select id="sub_id">
											<option value="" selected>선택</option>
											<option value="99">무제한</option>
											<option value="1">1 개</option>
											<option value="2">2 개</option>
											<option value="3">3 개</option>
											<option value="4">4 개</option>
											<option value="5">5 개</option>
											<option value="6">6 개</option>
											<option value="7">7 개</option>
											<option value="8">8 개</option>
											<option value="9">9 개</option>
											<option value="10">10 개</option>
										</select>
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">% 할인</span>
									<div class="input">
										<input type="text" id="discount_rate" placeholder="%" maxlength="2" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
									</div>
								</div>
								<span style="color:#696969;"> # 중복 적용 불가. % 또는 금액 중 하나만 선택</span>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">금액 할인</span>
									<div class="input">
										<input type="text" id="discount_amount" maxlength="7" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<hr />
					<div class="conArticle modal w900">
						<header class="admin-header">
							<div class="m-options">
								<h3>기타혜택</h3>
							</div>
						</header>
						<ul>
							<li class="fw txt-Area">
								<div class="fwBox">
									<textarea class="textarea w100p" id="promo_detail"></textarea>
								</div>
							</li>
						</ul>
					<div class="button-box">
						<button class="bBtn3 sColorG modalClose">취소</button>
						<button class="bBtn3 sColorPB" id="promotionEnroll">등록</button>
						<button class="bBtn3 sColorPB" id="promotionUpdate">수정</button>
						<button class="bBtn3 sColorPB" id="promotionDelete">삭제</button>
					</div> 
				</div>
			</div>
		</div>
	</div>
</div>