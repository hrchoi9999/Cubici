<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script src="/resources/rudicks/js/file.js"></script>
<script>
	let file;

	$(document).ready(function(){

		if("${subMap.cb_check}" == "Y"){
			$(".cbInfo").attr("readOnly", true);
			$(".cbRadio").attr("onclick","return(false);");
		}

		$("#addCBInfo").on("click", function() {
			addCBInfo();
		});

		$("#addInfoCall").on("click", function() {
			addInfoCallDetail();
		});

		$("#cb_upload").change(function(){
			let files = $(this)[0].files;

			if(!fileVaildator(files)){
				return false;
			}

			file = $(this)[0].files[0];
			$(".fileName").text(file.name);
		});

		$(".fileNm").on("click", function(){
			let uuid = $(this).parent().parent().find("label").prop("id");
			let userKey = $(this).parent().parent().find(".userKey").val();
			fileNm(uuid, userKey);
		});

	});

	function addCBInfo() {
		let callUrl = "/admin/moneybank/addCBInfo";
		let callBackFunc = "addCBInfoResponse";

		let objParam = new FormData();

		let data = {
			mbid : "${requestMap.mbid}",
			userId : "${principal.admin_id}",
			cbScoreCurrent : $("#cbScoreCurrent").val(),
			cbScoreRank : $("#cbScoreRank").val(),
			cbScorePast : $("#cbScorePast").val(),
			defaultStatus : $('input[name=default]:checked').val(),
			financialDisorderStatus : $('input[name=financialDisorder]:checked').val(),
			publicInformationStatus : $("input[name=publicInformation]:checked").val(),
			overdueStatus : $("input[name=overdue]:checked").val()
		}

		objParam.append('file', file);
		objParam.append('data', new Blob([JSON.stringify(data)], {type : 'application/json'}));
		cubici.Ajax.file.fnRequest(objParam, callUrl, callBackFunc);
	}
	function addCBInfoResponse() {
		window.location.reload();
	}

	function fileNm(uuid, userKey){
		let callUrl = "/file/download";
		let objParam = {
			uuid : uuid,
			enc_type : "Y",
			userKey : userKey
		}
		cubici.Ajax.download.fnRequest(objParam, callUrl);
	}

	function addInfoCallDetail(){
		let callUrl = "/admin/moneybank/addInfoCallDetail";
		let callBackFunc = "addInfoCallDetailResponse";
		let objParam = {
			mbid : "${requestMap.mbid}",
			title : $("#title").val(),
			reviewer : $("#reviewer").val(),
			detail : $("#detail").val()
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}
	function addInfoCallDetailResponse() {
		window.location.reload();
	}

	function subComplete(){
		let callUrl = "/admin/moneybank/subComplete";
		let callBackFunc = "subCompleteResponse";
		let objParam = {
			mbid : "${requestMap.mbid}",
			userId : "${principal.admin_id}"
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	}
	function subCompleteResponse(){
		window.location.href = "/admin/moneybank/request";
	}

</script>

<!-- 타이틀 -->
<div class="m-tab">
	<ul>
		<li class="active"><a href="javascript:;">신청서류 확인</a></li>
	</ul>
</div>
<!-- 추가정보 -->
<div class="contentsArea">
	<div class="contentGrid m-45">
		<div class="inner wide">
			<div class="conArticle m-45">

				<div class="conArticle-inner m-b30">
					<h3>회원정보</h3>
					<div class="money-bank-table table-border2">
						<table>
							<colgroup>
								<col width="20%">
								<col width="15%">
								<col width="20%">
								<col width="25%">
								<col width="20%">
							</colgroup>
							<thead>
							<tr>
								<th>신청서비스</th>
								<th>MBID</th>
								<th>회원명</th>
								<th>회원ID</th>
								<th>회사명</th>
							</tr>
							</thead>
							<tbody class="align-center ">
							<tr>
								<td>${requestMap.mb_product_code}</td>
								<td>${requestMap.mbid}</td>
								<td>${requestMap.USER_NM}</td>
								<td>${requestMap.USER_ID}</td>
								<td>${requestMap.FIRM_NM}</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="conArticle-inner m-b30">
					<h3>서류 확인</h3>
					<div class="money-bank-table table-border2">
						<table>
							<colgroup>
								<col width="12%">
								<col width="18%">
								<col width="15%">
								<col width="15%">
								<col width="15%">
								<col width="15%">
								<col width="10%">
							</colgroup>
							<thead>
							<tr>
								<th colspan="2">서류 목록</th>
								<th colspan="4">정보 입력</th>
								<th>확인</th>
							</tr>
							</thead>
							<tbody class="align-center ">
							<tr>
								<td rowspan="5"><c:if test="${subMap.cb_check eq 'Y'}"></c:if>신용정보 입력</td>
								<td rowspan="3">
									<div class="tIn">
										<label for="cb_upload" class="oiBtn upload">업로드</label>
										<input type="file" id="cb_upload" style="display: none;"><br>
									</div>
								</td>
								<td colspan="2" rowspan="3">CB 스코어</td>
								<td>현 CB 점수</td>
								<td>
									<c:if test="${subMap.cb_score_current eq null}"><input class="cbInfo" id="cbScoreCurrent" type="text" placeholder="현 CB 점수 입력"></c:if>
									${subMap.cb_score_current}
								</td>
								<td rowspan="5">
									<c:if test="${subMap.cb_check eq null}"><a href="javascript:;" class="sBtn sColorN rBtn" id="addCBInfo">확인</a></c:if>
									<c:if test="${subMap.cb_check eq 'Y'}">담당자 : ${subMap.cb_confirm_admin}</c:if>
								</td>
							</tr>
							<tr>
								<td>CB 등수</td>
								<td>
									<c:if test="${subMap.cb_score_rank eq null}"><input class="cbInfo" id="cbScoreRank" type="text" placeholder="CB 등수 입력"></c:if>
									${subMap.cb_score_rank}
								</td>
							</tr>
							<tr>
								<td>6개월 CB점수</td>
								<td>
									<c:if test="${subMap.cb_score_past eq null}"><input class="cbInfo" id="cbScorePast" type="text" placeholder="6개월 CB 점수 입력"></c:if>
									${subMap.cb_score_past}
								</td>
							</tr>
							<tr>
								<td rowspan="2">
									<div class="tIn">
										<input class="userKey" type="text" placeholder="암호를 입력하세요">
										<label for="cb_download" id="${fileMap.CBInfo.uuid}" class="oiBtn download fileNm">다운로드</label>
									</div>
									<div class="tIn">
										<label id="cb_download" class="fileName fileNm">${fileMap.CBInfo.file_name}</label>
									</div>
								</td>
								<td>채무불이행</td>
								<td>
									<label><input class="cbRadio" type="radio" name="default" value="Y" ${subMap.default_status eq 'Y' ? "checked" : ""}> Y </label> &nbsp;&nbsp;
									<label><input class="cbRadio" type="radio" name="default" value="N" ${subMap.default_status eq 'N' ? "checked" : ""}> N </label>
								</td>
								<td>금융질서문란</td>
								<td>
									<label><input class="cbRadio" type="radio" name="financialDisorder" value="Y" ${subMap.financial_disorder_status eq 'Y' ? "checked" : ""}> Y </label> &nbsp;&nbsp;
									<label><input class="cbRadio" type="radio" name="financialDisorder" value="N" ${subMap.financial_disorder_status eq 'N' ? "checked" : ""}> N </label>
								</td>
							</tr>
							<tr>
								<td>공공정보</td>
								<td>
									<label><input class="cbRadio" type="radio" name="publicInformation" value="Y" ${subMap.public_information_status eq 'Y' ? "checked" : ""}> Y </label> &nbsp;&nbsp;
									<label><input class="cbRadio" type="radio" name="publicInformation" value="N" ${subMap.public_information_status eq 'N' ? "checked" : ""}> N </label>
								</td>
								<td>연체정보</td>
								<td>
									<label><input class="cbRadio" type="radio" name="overdue" value="Y" ${subMap.overdue_status eq 'Y' ? "checked" : ""}> Y </label> &nbsp;&nbsp;
									<label><input class="cbRadio" type="radio" name="overdue" value="N" ${subMap.overdue_status eq 'N' ? "checked" : ""}> N </label>
								</td>
							</tr>
							</tbody>
						</table>
						<br>
						<table>
							<colgroup>
								<col width="12%">
								<col width="18%">
								<col width="18%">
								<col width="18%">
								<col width="36%">
							</colgroup>
							<thead>
							<tr>
								<th colspan="2">서류 목록</th>
								<th colspan="3">정보 확인</th>
							</tr>
							</thead>
							<tbody class="align-center ">
							<tr>
								<td>대표 주민등록증사본</td>
								<td>
									<div class="tIn">
										<input class="userKey" type="text" placeholder="암호를 입력하세요">
										<label for="reg_download" id="${fileMap.regNo.uuid}" class="oiBtn download fileNm">다운로드</label>
									</div>
									<div class="tIn">
										<label id="reg_download" class="fileNm">${fileMap.regNo.file_name}</label>
									</div>
								</td>
								<td colspan="2">${requestMap.reg_no_first}</td>
								<td>${requestMap.reg_no_second}</td>
							</tr>
							<tr>
								<td colspan="2" rowspan="2">사업자 정보(사업자등록증)</td>
								<td colspan="2">${subMap.biz_no}</td>
								<td>${subMap.biz_start_date}</td>
							</tr>
							<tr>
								<td colspan="2">${subMap.tax_type}</td>
								<td>${subMap.biz_type}</td>
							</tr>
							<tr>
								<td colspan="2" rowspan="2">국세/지방세납부</td>
								<td colspan="2">국세 완납 여부</td>
								<td>${subMap.national_tax_full_payment}</td>
							</tr>
							<tr>
								<td colspan="2">지방세 완납 여부</td>
								<td>${subMap.local_tax_full_payment}</td>
							</tr>
							<tr>
								<td colspan="2" rowspan="2">건강보험납부</td>
								<td colspan="2">건강보험 완납 여부</td>
								<td>${subMap.health_insurance_full_payment}</td>
							</tr>
							<tr>
								<td colspan="2">건강보험 납부 총액</td>
								<td><fmt:formatNumber value="${subMap.health_insurance_paid_amount}"/></td>
							</tr>
							<tr>
								<td>정산계좌</td>
								<td>
									<div class="tIn">
										<input class="userKey" type="text" placeholder="암호를 입력하세요">
										<label for="demand_download" id="${fileMap.demand.uuid}" class="oiBtn download fileNm">다운로드</label>
									</div>
									<div class="tIn">
										<label id="demand_download" class="fileNm">${fileMap.demand.file_name}</label>
									</div>
								</td>
								<td colspan="2">경남은행</td>
								<td>${requestMap.mb_demand_acc_number}</td>
							</tr>
							<tr>
								<td rowspan="2">주거래계좌</td>
								<td rowspan="2">
									<div class="tIn">
										<input class="userKey" type="text" placeholder="암호를 입력하세요">
										<label id="${fileMap.main.uuid}" class="oiBtn download fileNm">다운로드</label>
									</div>
									<div class="tIn">
										<label class="fileNm">${fileMap.main.file_name}</label>
									</div>
								</td>
								<td>예금주</td>
								<td>${requestMap.mb_main_acc_holder}</td>
								<td rowspan="2">${requestMap.mb_main_acc_number}</td>
							</tr>
							<tr>
								<td colspan="2">${requestMap.mb_main_acc_bank_code}</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="conArticle-inner m-b30">
					<h3>안내 전화</h3>
					<div class="money-bank-table table-border2 infoCall">
						<table>
							<thead>
							<tr>
								<th></th>
								<th>안내</th>
								<th>담당자</th>
								<th>통화내역</th>
								<th>통화일시</th>
								<th></th>
							</tr>
							</thead>
							<tbody class="align-center">
							<tr>
								<td></td>
								<td><input id="title" type="text" placeholder="제목 입력"></td>
								<td><input id="reviewer" type="text" value="${principal.username}" readonly="readonly"></td>
								<td><input id="detail" type="text" placeholder="내용 입력"></td>
								<td></td>
								<td><a href="javascript:;" class="sBtn sColorN rBtn" id="addInfoCall">추가</a></td>
							</tr>
							<c:forEach var="infoCallList" items="${infoCallList}" varStatus="status">
								<tr>
									<td>${status.count}</td>
									<td>${infoCallList.title}</td>
									<td>${infoCallList.reviewer}</td>
									<td>${infoCallList.detail}</td>
									<td>${infoCallList.input_date}</td>
								</tr>
							</c:forEach>
							</tbody>
						</table>
					</div>
				</div>

				<div class="button-box">
					<button type="button" class="big-gray-btn" onclick="history.back();">이전</button>
					<c:if test="${subMap.sub_complete ne 'Y'}"><button type="button" class="big-blue-btn2" onclick="subComplete();">입력완료</button></c:if>
				</div>
			</div>
		</div>
	</div>
</div>