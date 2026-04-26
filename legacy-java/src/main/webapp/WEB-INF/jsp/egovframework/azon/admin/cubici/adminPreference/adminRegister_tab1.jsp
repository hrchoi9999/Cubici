<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<script>
	$(document).ready(function() {

		setAdminList("00,01,02", "", "00,01,02", 1, 10);

		// 관리자 아이디 중복확인 func
		$(document).on('click', "#idCheck", function() {
			$("#idCheckMsg").css("display", "none");
			$("#idCheckMsg li span").text("");
			if ($('#approval_ADMIN_ID').val().length > 0) {
				adminIdCheck();
			} else {
				$("#idCheckMsg").css("display", "block");
				$("#idCheckMsg li span").css("color", "red");
				$("#idCheckMsg li span").text("ID를 입력해주세요");
			}
		});

		// 관리자 승인 func
		$(document).on('click', "#approvalBtn", function() {
			approvalAdmin();
		});

		// 관리자 정보 수정 func
		$(document).on('click', "#updateBtn", function() {
			updateAdmin();
		});

		// 관리자 등록 해지 func
		$(document).on('click', "#deleteBtn", function() {
			deleteAdmin();
		});

		$(document).on('click', '.search', function() {
			let ADMIN_TYPE = $('#ADMIN_TYPE option:selected').val();
			if (ADMIN_TYPE == "") {
				ADMIN_TYPE = "00,01,02"
			}
			let ADMIN_NAME = $('#ADMIN_NAME').val();
			if (ADMIN_NAME == "" || ADMIN_NAME == null) {
				ADMIN_NAME = "";
			}
			let ADMIN_GRADE = $('#ADMIN_GRADE option:selected').val();
			if (ADMIN_GRADE == "") {
				ADMIN_GRADE = "00,01,02"
			}

			setAdminList(ADMIN_TYPE, ADMIN_NAME, ADMIN_GRADE, 1, 10);
		});

	});

	// 관리자 목록
	function setAdminList(ADMIN_TYPE, ADMIN_NAME, ADMIN_GRADE, currentPage,
			dataPerPage) {

		let pageNum = currentPage - 1; // 현재 페이지 0부터
		let dataCnt = pageNum * dataPerPage; // 각 페이지 데이터시작

		let callUrl = "/admin/cubici/adminPreference/adminRegister_tab1/getAdminList";
		let callBackFunc = "setAdminListResponse";
		let objParam = {
			ADMIN_TYPE : ADMIN_TYPE,
			ADMIN_NAME : ADMIN_NAME,
			ADMIN_GRADE : ADMIN_GRADE,
			pageNum : pageNum,
			dataCnt : dataCnt,
			dataPerPage : dataPerPage
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}

	function setAdminListResponse(data) {
		let dataList = data.resultList;
		if (dataList.length > 0) {
			let tbodyHtml = "";
			$
					.each(
							dataList,
							function(index, item) {
								let btn_color = "";
								let reg_date = "-";
								let approval_date = "-";
								let admin = "";
								let modalFunc = "";
								let approval_yn = "";
								if (item.ADMIN_APPROVAL_DATE === null) {
									btn_color = "sColorG";
									approval_yn = "대기";
									modalFunc = "adminApprovalModalFunc";
								} else {
									btn_color = "sColorN";
									approval_yn = "승인완료";
									approval_date = formatDate(item.ADMIN_APPROVAL_DATE);
									modalFunc = "adminUpdateModalFunc";
								}
								if (item.ADMIN_REG_DATE != null) {
									reg_date = formatDate(item.ADMIN_REG_DATE);
								}

								tbodyHtml += "<tr>";
								tbodyHtml += "<td><div class='tIn'>"
										+ item.RNUM + "</div></td>";
								//회사명
								if (item.ADMIN_TYPE === "00") {
									admin = "큐빅아이";
								}
								if (item.ADMIN_TYPE === "01") {
									admin = "투게더";
								}
								if (item.ADMIN_TYPE === "02") {
									admin = "헬로펀딩";
								}

								tbodyHtml += "<td><div class='tIn'>" + admin
										+ "</div></td>";
								tbodyHtml += "<td><div class='tIn'>"
										+ item.ADMIN_DEPARTMENT + "</div></td>";
								tbodyHtml += "<td><div class='tIn'>"
										+ item.ADMIN_NAME + "</div></td>";
								tbodyHtml += "<td><div class='tIn'>"
										+ numSorting(item.ADMIN_PHONE)
										+ "</div></td>";
								tbodyHtml += "<td><div class='tIn'>"
										+ item.ADMIN_EMAIL + "</div></td>";
								tbodyHtml += "<td><div class='tIn'>" + reg_date
										+ "</div></td>";
								tbodyHtml += "<td><div class='tIn'>"
										+ approval_date + "</div></td>";
								tbodyHtml += "<td><div class='tIn'>"
										+ item.ADMIN_GRADE + "</div></td>";
								tbodyHtml += "<td><div class='tIn'><span class='sBtn " + btn_color +" rBtn'>"
										+ approval_yn + "</span></div></td>";
								tbodyHtml += "<td><div class='tIn'><a href='javascript:;' onclick='"
										+ modalFunc + "(";
								tbodyHtml += '"' + item.ADMIN_TYPE + '","'
										+ item.ADMIN_DEPARTMENT + '","'
										+ item.ADMIN_NAME + '","'
										+ item.ADMIN_PHONE + '","'
										+ item.ADMIN_EMAIL + '","'
										+ item.ADMIN_GRADE + '","'
										+ item.ADMIN_ID + '"' + ")'";
								tbodyHtml += "class='modalOpen' data-modal='intro-new-admin-approved'><img src='/resources/rudicks/img/icon/doc-check.png' alt='수정'></a></div></td>";
								tbodyHtml += "</tr>";
							});
			$('#tbody_con').empty().html(tbodyHtml);

			// 페이징
			let search = data.params;
			let pageMaxCnt = data.TOTAL / 10;
			pageNum = search.pageNum;
			let pageCnt = Math.floor(search.pageNum / 10);

			let pageHtml = "";
			pageHtml += "<ul>";
			if (pageMaxCnt < 10) { //페이지 10개 미만
				for (let i = 1; i <= Math.ceil(pageMaxCnt); i++) {
					pageHtml += "<li><a class='num' href='javascript:;' onclick='setAdminList(";
					pageHtml += '"' + search.ADMIN_TYPE + '","'
							+ search.ADMIN_NAME + '", "' + search.ADMIN_GRADE
							+ '", ' + i + ', 10);' + "'>" + i + "</a></li>";
				}
			} else if (pageMaxCnt >= 10) { // 페이지 10개 이상
				if (pageCnt > 0) { //이전				
					pageHtml += "<li><a class='oiBtn prev' href='javascript:;' onclick='setAdminList(";
					pageHtml += '"' + search.ADMIN_TYPE + '","'
							+ search.ADMIN_NAME + '", "' + search.ADMIN_GRADE
							+ '", ' + ((pageCnt) * 10) + ', 10);'
							+ "'></a></li>";
				}
				for (let i = (pageCnt * 10) + 1; i <= (pageCnt * 10) + 10; i++) { //1~10
					if (i > Math.ceil(pageMaxCnt)) { // 최대 페이지수 까지만 생성
						break;
					}
					pageHtml += "<li><a class='num' href='javascript:;' onclick='setAdminList(";
					pageHtml += '"' + search.ADMIN_TYPE + '","'
							+ search.ADMIN_NAME + '", "' + search.ADMIN_GRADE
							+ '", ' + i + ', 10);' + "'>" + i + "</a></li>";
				}
				if (Math.floor(pageMaxCnt) > (pageCnt * 10) + 10) { //다음
					pageHtml += "<li><a class='oiBtn next' href='javascript:;' onclick='setAdminList(";
					pageHtml += '"' + search.ADMIN_TYPE + '","'
							+ search.ADMIN_NAME + '", "' + search.ADMIN_GRADE
							+ '", ' + ((pageCnt + 1) * 10 + 1) + ', 10);'
							+ "'></a></li>";
				}
			}
			pageHtml += '</ul>';
			$('#table_paginate').empty().html(pageHtml);

			//페이징버튼 활성화
			$('#table_paginate ul li').each(function(index, item) {
				if ($(item).find('.num').text() == parseInt(pageNum) + 1) {
					$(item).find('.num').addClass("active");
				}
			});

		} else {
			$('#tbody_con')
					.empty()
					.html(
							"<tr><td colspan='10'><div class='tIn'>검색결과가 없습니다.</div></td></tr>");
		}

		$('#total').text(data.TOTAL + " 명");
	}

	//관리자 아이디 중복확인
	function adminIdCheck() {
		let callUrl = "/admin/cubici/adminPreference/adminRegister_tab1/adminIdCheck";
		let callBackFunc = "adminIdCheckResponse";
		let objParam = {
			ADMIN_ID : $("#approval_ADMIN_ID").val()
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}
	function adminIdCheckResponse(data) {
		$("#idCheckMsg").css("display", "block");
		if (data.hashMap.COUNT > 0) {
			$("#idCheckMsg li span").css("color", "red");
			$("#idCheckMsg li span").text("중복된 아이디 입니다.");
			$("#approval_ADMIN_ID").focus();
		} else {
			$("#idCheckMsg li span").css("color", "green");
			$("#idCheckMsg li span").text("사용가능한 아이디 입니다.");
		}
	}

	//관리자 승인 modal (id, pw) 입력 가능하도록
	function adminApprovalModalFunc(admin_type, department, name, phone, email,
			grade, id) {
		$('#approval_ADMIN_ID').val('');
		$('#approval_ADMIN_PW').val('');
		$("#idCheckMsg").css("display", "none");
		$("#approval_ADMIN_GRADE option:eq(0)").prop("selected", true);

		let admin = "";
		if (admin_type === "00") {
			admin = "큐빅아이"
		} else if (admin_type === "01") {
			admin = "투게더"
		} else if (admin_type === "02") {
			admin = "헬로펀딩"
		}
		$('#approval_ADMIN_TYPE').val(admin);
		$('#approval_ADMIN_DEPARTMENT').val(department);
		$('#approval_ADMIN_NAME').val(name);
		$('#approval_ADMIN_PHONE').val(numSorting(phone));
		$('#approval_ADMIN_EMAIL').val(email);
		$('#approval_ADMIN_ID').html(
				'<input id="temp_id" type="hidden" value="'+id+'">');
		modalOpen('intro-new-admin-approved');
	}

	function approvalAdmin() {
		if ($('#approval_ADMIN_GRADE option:selected').val() == "none") {
			modalInfo("등급을 확인해주세요");
			return false;
		}
		if ($("#approval_ADMIN_ID").val().length <= 0
				|| $("#approval_ADMIN_ID").val() == null) {
			modalInfo("ID를 입력해주세요");
			return false;
		}
		if ($("#approval_ADMIN_PW").val().length <= 0
				|| $("#approval_ADMIN_PW").val() == null) {
			modalInfo("ID를 입력해주세요");
			return false;
		}

		let ADMIN_PASSWORD = CryptoJS.SHA256(
				$("#approval_ADMIN_PW").val() + cubici.SHA256_SALT).toString();
		let callUrl = "/admin/cubici/adminPreference/adminRegister_tab1/approvalAdmin";
		let callBackFunc = "approvalAdminResponse";
		let objParam = {
			ADMIN_GRADE : $("#approval_ADMIN_GRADE option:selected").val(),
			ADMIN_TEMP_ID : $('#temp_id').val(),
			ADMIN_ID : $("#approval_ADMIN_ID").val(),
			ADMIN_PASSWORD : ADMIN_PASSWORD
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}
	function approvalAdminResponse(data) {
		if (data.resultCode === 0) {
			modalInfo("관리자 승인되었습니다.");
			location.reload();
		}
	}

	//관리자 정보 수정 modal (id, 회사명 조회만 가능하도록)
	function adminUpdateModalFunc(admin_type, department, name, phone, email,
			grade, id) {
		$('#modi_ADMIN_ID').val(id);
		$('#modi_ADMIN_PW').val(department);
		let admin = "";
		if (admin_type === "00") {
			admin = "큐빅아이"
		} else if (admin_type === "01") {
			admin = "투게더"
		} else if (admin_type === "02") {
			admin = "헬로펀딩"
		}
		$('#modi_ADMIN_TYPE').val(admin);
		$('#modi_ADMIN_DEPARTMENT').val(department);
		$('#modi_ADMIN_NAME').val(name);
		$('#modi_ADMIN_PHONE').val(numSorting(phone));
		$('#modi_ADMIN_EMAIL').val(email);
		$('#modi_ADMIN_GRADE').val(grade).attr("selected", "selected");

		modalOpen('intro-new-admin-modify');
	}

	// 관리자 정보 수정 (id, 회사명 수정불가능)
	function updateAdmin() {
		let admin_type = "";
		if ($("#modi_ADMIN_TYPE").val() === "큐빅아이") {
			admin_type = "00";
		} else if ($("#modi_ADMIN_TYPE").val() === "투게더") {
			admin_type = "00";
		} else if ($("#modi_ADMIN_TYPE").val() === "헬로펀딩") {
			admin_type = "00";
		}
		if ($("#modi_ADMIN_PW").val().length <= 0
				|| $("#modi_ADMIN_PW").val() == null) {
			alert("비밀번호를 입력해 주세요.");
			return false;
		}
		let ADMIN_PASSWORD = CryptoJS.SHA256(
				$("#modi_ADMIN_PW").val() + cubici.SHA256_SALT).toString();

		let callUrl = "/admin/cubici/adminPreference/adminRegister_tab1/updateAdmin";
		let callBackFunc = "updateAdminResponse";
		let objParam = {
			ADMIN_PASSWORD : ADMIN_PASSWORD,
			ADMIN_TYPE : admin_type,
			ADMIN_DEPARTMENT : $("#modi_ADMIN_DEPARTMENT").val(),
			ADMIN_NAME : $("#modi_ADMIN_NAME").val(),
			ADMIN_PHONE : $("#modi_ADMIN_PHONE").val().replace(/-/gi, ""),
			ADMIN_EMAIL : $("#modi_ADMIN_EMAIL").val(),
			ADMIN_GRADE : $("#modi_ADMIN_GRADE option:selected").val(),
			ADMIN_ID : $("#modi_ADMIN_ID").val()
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}

	function updateAdminResponse(data) {
		location.reload(true);
	}

	//관리자 정보 삭제 
	function deleteAdmin() {

		let callUrl = "/admin/cubici/adminPreference/adminRegister_tab1/deleteAdmin";
		let callBackFunc = "deleteAdminResponse";
		let objParam = {
			ADMIN_ID : $("#modi_ADMIN_ID").val()
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);

	}
	function deleteAdminResponse(data) {
		modalInfo("삭제되었습니다");
		location.reload(true);
	}

	function numSorting(phone) {
		let result = "-";
		let val = "";
		if (phone != null) {
			if (phone.substr(3).length === 7) { //국번 제외 7자리
				result = phone.substr(0, 3) + "-" + phone.substr(3, 3) + "-"
						+ phone.substr(6);
			} else if (phone.substr(3).length === 8) { //국번 제외 8자리, 인터넷전화
				result = phone.substr(0, 3) + "-" + phone.substr(3, 4) + "-"
						+ phone.substr(7);
			}
		} else if (phone == null || phone == "" || phone == undefined) {
			result = "-";
		}
		return result;
	}
</script>

<div class="m-tab">
	<ul>
		<li class="active"><a
			href="/admin/cubici/adminPreference/adminRegister_tab1">등록 관리자</a></li>
		<li><a href="/admin/cubici/adminPreference/adminRegister_tab2">접근권한</a></li>
	</ul>
</div>

<div class="m-search">
	<ul>
		<li>
			<div class="fwBox">
				<span class="ft">회사명</span>
				<div class="input">
					<select id="ADMIN_TYPE">
						<option value="">전체</option>
						<option value="00">큐빅아이</option>
						<option value="01">투게더</option>
						<option value="02">헬로펀딩</option>
					</select>
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">접근권한</span>
				<div class="input">
					<select id="ADMIN_GRADE">
						<option value="">전체</option>
						<option value="00">권한1</option>
						<option value="01">권한2</option>
					</select>
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">이름</span>
				<div class="input">
					<input id="ADMIN_NAME" type="text" placeholder="이름">
				</div>
			</div>
		</li>
		<li>
			<div class="btns">
				<button class="sBtn sColorLB search">검색</button>
			</div>
		</li>
	</ul>

</div>

<div class="mArticleArea">
	<div class="fixTable ">
		<div class="maxHeight row10">
			<table class="m-shadowTable">
				<thead>
					<tr>
						<th>#</th>
						<th>회사명</th>
						<th>부서명</th>
						<th>이름</th>
						<th>핸드폰</th>
						<th>이메일</th>
						<th>신청일자</th>
						<th>승인일자</th>
						<th>접근권한</th>
						<th>상태</th>
						<th>수정</th>
					</tr>
				</thead>
				<tbody id="tbody_con">
				</tbody>
			</table>
		</div>
		<div class="fixBottom">
			<ul class="tableTotal">
				<li><span class="txt">전체</span> <span class="result" id="total"></span>
				</li>
				<li class="multi">
					<!--   <div class="mItem">
                        <span class="txt">C1</span>
                        <span class="result">2 명</span>
                    </div>
                    <div class="mItem">
                        <span class="txt">C2</span>
                        <span class="result">2 명</span>
                    </div> -->
				</li>
				<li class="multi">
					<!--  <div class="mItem">
                        <span class="txt">M1</span>
                        <span class="result">2 명</span>
                    </div>
                    <div class="mItem">
                        <span class="txt">M2</span>
                        <span class="result">2 명</span>
                    </div> -->
				</li>
			</ul>
		</div>
	</div>
	<div class="m-paging" id="table_paginate"></div>
	<script>
		$('#fixTable').doFixTable();
	</script>
</div>

<div class="modal-container alert" id="intro-new-admin-modify">
	<div class="modal-wrapper">
		<header>
			<h2>관리자 정보 수정</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="modal-content">
			<div class="mInner auto mArticleArea">
				<article>
					<p class="noticeTxt">
						관리자 등록 및 변경을 위해서는 아래 정보를 확인하고 <br> 변경된 내용을 수정해 주세요
					</p>
				</article>
				<article class="m-modalGrid">
					<div class="formMaxWrap">
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">관리자 아이디</span>
									<div class="input">
										<input id="modi_ADMIN_ID" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">관리자 비밀번호</span>
									<div class="input">
										<input id="modi_ADMIN_PW" type="password">
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">회사명</span>
									<div class="input">
										<input id="modi_ADMIN_TYPE" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">부서명</span>
									<div class="input">
										<input id="modi_ADMIN_DEPARTMENT" type="text">
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">이름</span>
									<div class="input">
										<input id="modi_ADMIN_NAME" type="text">
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">핸드폰</span>
									<div class="input">
										<input id="modi_ADMIN_PHONE" type="text">
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">이메일</span>
									<div class="input">
										<input id="modi_ADMIN_EMAIL" type="text">
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">접근등급</span>
									<div class="input">
										<select id="modi_ADMIN_GRADE">
											<option value="00">1</option>
											<option value="01">2</option>
										</select>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</article>
				<div class="formMaxWrap">
					<div class="btnArea">
						<a href="javascript:;" id="deleteBtn"
							class="modalClose mBtn sColorP">등록 해지</a> <a href="javascript:;"
							id="updateBtn" class="mBtn sColorLB">정보 수정</a> <a
							href="javascript:;" class="modalClose mBtn sColorN">확인</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="modal-container alert" id="intro-new-admin-approved">
	<div class="modal-wrapper">
		<header>
			<h2>관리자 등록 승인</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="modal-content">
			<div class="mInner auto mArticleArea">
				<article>
					<p class="noticeTxt">
						관리자 등록 신청정보를 확인하시고, <br> 해당 조직의 담당자와의 통화를 통해 내용을 확인하고 승인하십시오.
					</p>
				</article>
				<article class="m-modalGrid">
					<div class="formMaxWrap">
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">관리자 아이디</span>
									<div class="input">
										<input id="approval_ADMIN_ID" type="text"
											placeholder="관리자 아이디 입력">
									</div>
									<a href="javascript:;" id="idCheck" class="sBtn sColorLB">중복확인</a>
								</div>
							</li>
						</ul>
						<ul id="idCheckMsg" style="display: none" class="item">
							<li><span style="font-size: 12px">사용가능</span></li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">관리자 비밀번호</span>
									<div class="input">
										<input id="approval_ADMIN_PW" type="text"
											placeholder="관리자 비밀번호 입력">
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">회사명</span>
									<div class="input">
										<input id="approval_ADMIN_TYPE" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">부서명</span>
									<div class="input">
										<input id="approval_ADMIN_DEPARTMENT" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">이름</span>
									<div class="input">
										<input id="approval_ADMIN_NAME" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">핸드폰</span>
									<div class="input">
										<input id="approval_ADMIN_PHONE" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">이메일</span>
									<div class="input">
										<input id="approval_ADMIN_EMAIL" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">접근등급</span>
									<div class="input">
										<select id="approval_ADMIN_GRADE">
											<option value="none" selected>- 접근등급 설정 -</option>
											<option value="00">1</option>
											<option value="01">2</option>
										</select>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</article>
				<div class="formMaxWrap">
					<div class="btnArea">
						<a href="javascript:;" class="modalClose mBtn sColorLB">등록 취소</a>
						<a href="javascript:;" id="approvalBtn" class="mBtn sColorN">등록
							승인</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

