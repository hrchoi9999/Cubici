<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>	

<script src="/resources/js/views/admin/cmmn/manageMember.js"></script>
<script src="/resources/rudicks/js/file.js"></script>

<div class="m-tab">
	<ul>
		<li class="active"><a href="javascript:;">회원 상세정보</a></li>
	</ul>
</div>

<div class="m-searc" id="member_detai">
	<div class="modal-wrapper">
		<div class="modal-content">
			<div class="mInner mArticleArea tabArea">
				<article class="m-modalGrid">
					<header>
						<h3>회원 정보</h3>
					</header>
					<div class="contentsArea">
						<input type="hidden" id="mbid" value="${userDetail.mbid}" />
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">회원상태</span>
									<div class="input" id="user_no">${userDetail.status}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">회원명</span>
									<div class="input" id="user_name">${userDetail.user_nm}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">회원ID</span>
									<div class="input" id="user_id">${userDetail.user_id}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">핸드폰</span>
									<div class="input" id="user_phone">${userDetail.user_phone}</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">회사명</span>
									<div class="input" id="firm_nm">${userDetail.firm_nm}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">사업자등록번호</span>
									<div class="input" id="firm_id">${userDetail.firm_id}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">설립연도</span>
									<div class="input" id="frim_setup_date">${userDetail.firm_setup_date}</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">사업자 유형</span>
									<div class="input" id="biz_type">${userDetail.biz_type}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">업종</span>
									<div class="input" id="sector">${userDetail.sector}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">최초가입</span>
									<div class="input" id="reg_date">${userDetail.reg_date}</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">우편번호</span>
									<div class="input" id="zip_code_value">${userDetail.firm_zip_code}</div>
								</div>
							</li>
							<li class="col-2">
								<div class="fwBox">
									<span class="ft">회사주소</span>
									<div class="input" id="addr_value">${userDetail.firm_addr}</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">이용요금제</span>
									<div class="input" id="charge_nm">${userDetail.charge_name}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">이용서비스</span>
									<div class="input" id="product_code">${userDetail.mb_product_code}</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">계약만료</span>
									<div class="input" id="mb_contract_expire_date">${userDetail.mb_contract_expire_date}</div>
								</div>
							</li>
						</ul>
					</div>
				</article>
				<article class="m-tab">
					<ul>
						<li class="active">
							<h2>
								<a href="javascript:;" >기본정보</a>
							</h2>
						</li>
						<li>
							<h2 class="tabClass">
								<a id="mbTab" href="javascript:;">머니뱅크</a>
							</h2>
						</li>
						<li>
							<h2 h2 class="tabClass">
								<a id="docTab" href="javascript:;">추가서류</a>
							</h2>
						</li>
					</ul>
				</article>
				
				<jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/cmmn/userInfo.jsp" />
				<jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/cmmn/mbInfo.jsp"/>
				<jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/cmmn/documentInfo.jsp"/>
			</div>
		</div>
	</div>
</div>