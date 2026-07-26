<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<div class="modal-container alert resetClose" id="partner-modal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2 id="modal-title"></h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal w900">
					<header class="admin-header">
						<div class="m-options">
							<h3>기본정보</h3>
						</div>
					</header>
					<div class="m-search">
						<ul>
							<li>
								<div class="fwBox" id="span_partner_code">
									<span class="ft">협력사코드</span>
									<div class="input">
										<input type="text" id="partner_code" readonly>
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
									<span class="ft">회사명</span>
									<div class="input">
										<input type="text" id="partner_nm">
									</div>
								</div>
							</li>
							<li class="fw">
								<div class="fwBox col-1">
									<span class="ft-w">사업자 번호</span>
									<div class="input">
										<input type="text" id="partner_id" maxlength="10">
									</div>
								</div>
								<div class="btns l-m-10">
									<button class="rBtn2 sColorLB" id="btnBizChk">확인</button>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">대표이사</span>
									<div class="input">
										<input type="text" id="rep_nm">
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li class="fw">
								<div class="fwBox col-1">
									<span class="ft">주소</span>
									<div class="input">
										<input type="text" id="partner_zip" readonly>
									</div>
								</div>
								<div class="btns l-m-10">
									<button class="rBtn2 sColorLB" id="addrSearch">찾기</button>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">상세주소</span>
									<div class="input">
										<input type="text" id="partner_address">
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft">운영상태</span>
									<div class="input">
										<select id="partner_status">
											<option value="" selected disabled>선 택</option>
											<option value="00">운 영</option>
											<option value="01">종 료</option>
										</select>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">업종</span>
									<div class="input">
										<select id="partnerType">
										</select>
									</div>
								</div>
							</li>
							<li class="fw">
								<div class="fwBox col-1" id="span_division_code">
									<span class="ft">구분코드</span>
									<div class="input">
										<input type="text" id="division_code" maxlength="2">
									</div>
								</div>
								<div class="btns l-m-10">
									<button class="rBtn2 sColorLB" id="divisionChk">확인</button>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div class="conArticle modal w900">
					<header class="admin-header">
						<div class="m-options">
							<h3>연락처 정보</h3>
						</div>
					</header>
					<div class="m-search">
						<ul id="supInfo">
							<li>
								<div class="fwBox">
									<span class="ft">책임자</span>
									<div class="input">
										<input type="text" id="sup_nm" name="sup">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">직급</span>
									<div class="input">
										<input type="text" id="sup_rank" name="sup">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">이메일</span>
									<div class="input">
										<input type="text" id="sup_email" name="sup">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">전화</span>
									<div class="input">
										<input type="text" id="sup_phone" name="sup" maxlength="13" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);">
									</div>
								</div>
							</li>
						</ul>
						<ul id="managerInfo">
							<li>
								<div class="fwBox">
									<span class="ft">담당자</span>
									<div class="input">
										<input type="text" id="manager_nm" name="manager">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">직급</span>
									<div class="input">
										<input type="text" id="manager_rank" name="manager">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">이메일</span>
									<div class="input">
										<input type="text" id="manager_email" name="manager">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">전화</span>
									<div class="input">
										<input type="text" id="manager_phone"  name="manager" maxlength="13" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);">
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div class="conArticle modal w900">
					<header class="admin-header">
						<div class="m-options">
							<h3>연계내역</h3>
						</div>
					</header>
					<ul>
						<li class="fw txt-Area">
							<div class="fwBox">
								<textarea class="textarea w100p" id="detail"></textarea>
							</div>
						</li>
					</ul>
					<div class="button-box">
						<button class="bBtn3 sColorG modalClose">취소</button>
						<button class="bBtn3 sColorPB" id="partnerEnroll">등록</button>
						<button class="bBtn3 sColorPB" id="partnerUpdate">수정</button>
						<button class="bBtn3 sColorPB" id="partnerDelete">삭제</button>
					</div> 
				</div>
			</div>
		</div>
	</div>
</div>