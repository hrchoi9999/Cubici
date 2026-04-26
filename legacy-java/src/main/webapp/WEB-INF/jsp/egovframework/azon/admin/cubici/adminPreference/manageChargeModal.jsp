<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<div class="modal-container alert resetClose" style="z-index:999;" id="charge-modal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2 id="modal-title"></h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal w900">
					<header class="admin-header">
						<div class="m-options">
							<h3>요금제 정보</h3>
						</div>
					</header>
					<div class="m-search">
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">요금제명</span>
									<div class="input">
										<input type="text" id="charge_name">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">구분</span>
									<div class="input">
										<select id="charge_type">
											<option value="" selected>선택</option>
											<option value="B">기본요금</option>
											<option value="A">부가요금</option>
											<option value="M">조건부요금</option>
											<option value="O">기타요금</option>
											<option value="F">무료요금</option>
										</select>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox" id="span_charge_code">
									<span class="ft">요금코드</span>
									<div class="input">
										<input type="text" id="charge_code" readonly>
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">시작일자</span>
									<div class="input">
										<input type="text" class="startDatepicker" id="start_date" autocomplete="off" readonly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">종료일자</span>
									<div class="input">
										<input type="text" class="endDatepicker" id="expire_date" autocomplete="off" readonly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox" id="span_regi_date">
									<span class="ft">등록일자</span>
									<div class="input">
										<input type="text" id="regi_date">
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">제공 ID 수</span>
									<div class="input">
										<select id="sub_id">
											<option selected disabled>선택</option>
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
							<li>
								<div class="fwBox">
									<span class="ft">거래 건수</span>
									<div class="input">
										<input type="text" id="sales_count" placeholder="무제한" readonly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox col-1">
									<span class="ft">상품 건수</span>
									<div class="input">
										<input type="text" id="product_count" placeholder="무제한" readonly>
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">기준금액</span>
									<div class="input">
										<input type="text" id="amount" placeholder="(VAT제외)" maxlength="8" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
									</div>
								</div>
							</li>
							<li class="fw">
								<div class="fwBox col-1">
									<span class="ft">서비스 기간 단위</span>
									<div class="input">
										<input type="text" id="sub_period" maxlength="2" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
									</div>
								</div>
								<div class="fwBox l-m-10">
									<div class="input">
										<select id="sub_unit">
											<option value="" selected>선택</option>
											<option value="M">개월</option>
											<option value="W">주</option>
										</select>
									</div>
								</div>
							</li>
						</ul>
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
									<textarea class="textarea w100p" id="charge_detail"></textarea>
								</div>
							</li>
						</ul>
					</div>
					<div class="button-box">
						<button class="bBtn3 sColorG modalClose">취소</button>
						<button class="bBtn3 sColorPB" id="chargeEnroll">등록</button>
						<button class="bBtn3 sColorPB" id="chargeUpdate">수정</button>
						<button class="bBtn3 sColorPB" id="chargeDelete">삭제</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>