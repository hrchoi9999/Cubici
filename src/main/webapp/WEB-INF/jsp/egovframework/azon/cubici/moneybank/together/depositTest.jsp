<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- 여기까지 상단 -->
<script>

$(document).ready(function(){
	
	// 입금일자
	$.datepicker.setDefaults({
		dateFormat: 'yymmdd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		dayNames: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
		showMonthAfterYear: true,
		yearSuffix: '년'
	});
	
	$("#forDate").datepicker({ dateFormat: 'yy-mm-dd' }).val();
	$("#forDate").datepicker();

	// 상환입금 저장 버튼
	$("#insertVal").on("click", function(){
		
		let repayVal = $("#depositVal").val();
		let repayDate = $("#forDate").val();
		
		callUrl = "/admin/together/operation/insertRepay";
		callBackFunc = "checkInsert";
		objParam = {
			TOTAL_REPAYMENT_AMOUNT : repayVal,
			REPAYMENT_DATE : repayDate	
		}
		
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	})

	// 연장신청 버튼
	$("#extentionBtn").on("click", function(){
		
		callUrl = "/admin/together/operation/extendReq";
		callBackFunc = "insertExtend";
		objParam = {
		}
		
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	})
	
})


// 상환내역 입력 확인
function checkInsert(result){
	if(result.resultCode == 0 && result.insertCode == 0){
		modalInfo("입금처리 완료");
	}else if(result.insertCode == 55){
		modalInfo("만기일이며 미납이 있습니다.");
	}else if(result.insertCode == 66){
		modalInfo("상환가능기간이 아닙니다.");
	}else if(result.insertCode == 88){
		modalInfo("미승인 회원입니다.");
	}else if(result.resultCode != 0){
		modalInfo("에러가 발생했습니다. 잠시 후 다시 시도해주세요");
	}
}

// 연장신청 확인
function insertExtend(result){
	if(result.resultCode == 0){
		modalInfoFunc("연장신청 완료");
	}else{
		modelInfoFunc("에러가 발생했습니다. 잠시 후 다시 신청해주세요");
	}
}

</script>
	
<div class="container">
	<br>
	<br>
	<h3>투게더펀딩 입금 테스트</h3>
	
	<div class='row d-md-flex col-12'>
		<div class="col-lg-3 col-md-4">
			금액 :<br>
			<input type="text" id="depositVal">
		</div>
		<div class="col-lg-3 col-md-4"  id="dateFinder">
			일자 :<br>
			<input type="text" style="max-width: 80%" class="form-control pull-right" id="forDate" name="forDate"  placeholder='입금날짜 입력' autoComplete="off">
		</div>
	</div>
	
	<div class="row d-md-flex col-12">
		<br>
		<div class="col-lg-3 col-md-3">
			<button type="button" class="mBtn sColorLS" id="insertVal">ENTER</button>
		</div>
		<br>
		<div class="row col-md-4 col-md-4">
			<button type="button" class="mBtn sColorLS" id="extentionBtn">연장신청</button>
		</div>
		
	</div>
	
</div>
<br>
<br>
<br>
