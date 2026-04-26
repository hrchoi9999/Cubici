<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<style>
.dataTables_wrapper{
	width: 60%;
	margin: auto;
}
</style>

<script>
// 이벤트 초기화
$(document).ready(function(){
	
	var itemList = new Array();
	
	<c:forEach items="${itemList}" var="item">
		var obj = new Object();
		obj.SUBJECT_NO = ${item.SUBJECT_NO};
		obj.ITEM_NO = ${item.ITEM_NO};
		obj.ITEM_NM = "${item.ITEM_NM}";
		
		itemList.push(obj);
	</c:forEach>
	
	var prizmEvalList = new Array();
	
	<c:forEach items="${prizmEvalList}" var="item">
		var obj = new Object();
		obj.SUBJECT_NO = ${item.SUBJECT_NO};
		obj.SUBJECT_NM = "${item.SUBJECT_NM}";
		obj.ITEM_NO = ${item.ITEM_NO};
		obj.ITEM_NM = "${item.ITEM_NM}";
		obj.ITEM_DEFINITION = "${item.ITEM_DEFINITION}";
		obj.ITEM_WEIGHT = ${item.ITEM_WEIGHT};
		obj.ITEM_SCORE = ${item.ITEM_SCORE};
		
		<c:choose>
			<c:when test="${item.ITEM_STANDARD1 eq '-'}">
				obj.ITEM_STANDARD1 = "${item.ITEM_STANDARD1}";
			</c:when>
			<c:otherwise>
				obj.ITEM_STANDARD1 = ${item.ITEM_STANDARD1};
			</c:otherwise>
		</c:choose>
		
		obj.OPERATOR1 = "${item.OPERATOR1}";
		
		<c:choose>
			<c:when test="${item.ITEM_STANDARD2 eq '-'}">
				obj.ITEM_STANDARD2 = "${item.ITEM_STANDARD2}";
			</c:when>
			<c:otherwise>
				obj.ITEM_STANDARD2 = ${item.ITEM_STANDARD2};
			</c:otherwise>
		</c:choose>
		
		obj.OPERATOR2 = "${item.OPERATOR2}";
		
		prizmEvalList.push(obj);
	</c:forEach>
	
	// select box 이벤트 (주제 리스트)
    $("#subjectSelect").change(function(){
    	
    	$("#ratioForm")[0].reset();
    	$('#ITEM_DEFINITION').prop('readonly', true);
		$('#ITEM_WEIGHT').prop('readonly', true);
		
    	var flag = Number($("#subjectSelect option:selected").val());
    	var optionHtml = "";
    	
    	for(var i=0; i<itemList.length; i++){
    		
    		var getData = itemList[i];
    		
    		if(getData.SUBJECT_NO === flag){
    			optionHtml += "<option value="+getData.ITEM_NO+">"+getData.ITEM_NM+"</option>";
    		}
    	}
    	
    	$("#itemSelect").html(optionHtml);
    });
	
 	// select box 이벤트 (평가지표)
    $("#itemSelect").change(function(){
    	
    	$("#ratioForm")[0].reset();
    	$("#ratioDetailInfo").empty();
    	
    	var subjectVal = Number($("#subjectSelect option:selected").val());
    	var itemVal = Number($("#itemSelect option:selected").val());
    	var count = 1;
    	
    	for(var i=0; i<prizmEvalList.length; i++){
    		var getData = prizmEvalList[i];
    		// 주제 번호와 항목 번호가 둘 다 같을 때
    		if(getData.SUBJECT_NO === subjectVal && getData.ITEM_NO === itemVal){
    			// 지표정의, 가중치는 초행만 입력하면 됨 ( 신용평가 평가점수는 스코어가 0(없음) )
    			$('#ITEM_DEFINITION').prop('readonly', false);
    			$('#ITEM_WEIGHT').prop('readonly', false);
    			if(getData.SUBJECT_NO == 6){
    				if(getData.ITEM_SCORE == 0){
        				$("#ITEM_DEFINITION").val(getData.ITEM_DEFINITION);
        				$("#ITEM_WEIGHT").val(getData.ITEM_WEIGHT);
        			}
    			}else{
    				
        			if(getData.ITEM_SCORE == 1){
        				$("#ITEM_DEFINITION").val(getData.ITEM_DEFINITION);
        				$("#ITEM_WEIGHT").val(getData.ITEM_WEIGHT);
        			}
        			
        			var inputHtml = "";
        			inputHtml += '<div class="form-group row">';
        			inputHtml += '<label for="colFormLabel" class="col-sm-2 col-form-label" name="ITEM_SCORE">'+getData.ITEM_SCORE+'</label>';
        			inputHtml += '<div class="col-sm-3"><input type="text" class="form-control form-control-sm" id="score_'+count+'" name="ITEM_STANDARD1"></div>';
        			inputHtml += '<div class="col-sm-2"><select class="custom-select" id="score_'+count+'_select" name="OPERATOR1"><option value="-" selected></option><option value="이상">이상</option><option value="미만">미만</option></select></div>';
        			inputHtml += '<div class="col-sm-3"><input type="text" class="form-control form-control-sm" id="score_'+count+'_second" name="ITEM_STANDARD2"></div>';
        			inputHtml += '<div class="col-sm-2"><select class="custom-select" id="score_'+count+'_select_second" name="OPERATOR2"><option value="-" selected></option><option value="이상">이상</option><option value="미만">미만</option></select></div></div>';
					
        			$("#ratioDetailInfo").append(inputHtml);
        			
        			$("#score_"+count).val(comma(getData.ITEM_STANDARD1));
    				$("#score_"+count+"_second").val(comma(getData.ITEM_STANDARD2));
    				$("#score_"+count+"_select option[value="+getData.OPERATOR1+"]").prop("selected", "selected").change();
    				$("#score_"+count+"_select_second option[value="+getData.OPERATOR2+"]").prop("selected", "selected").change();
    				count++;
    			}
    		}
    	}
    	
    });
 	
 	$("#confirmButton").on("click", function(){
 		ratioUpdate();
 	})
 	
});
//세부지표 수정
function ratioUpdate(){
	
	$("#modalInfo_confirm").modal("hide");
	
	if($("#ITEM_DEFINITION").val() === "" || $("#ITEM_DEFINITION").val() === null || $("#ITEM_DEFINITION").val() === undefined){
		alertModal("지표정의가 설정되지 않았습니다.");
		return false;
	}
	if($("#ITEM_WEIGHT").val() === "" || $("#ITEM_WEIGHT").val() === null || $("#ITEM_WEIGHT").val() === undefined){
		alertModal("가중치가 설정되지 않았습니다.");
		return false;
	}
	
	// 세부지표 목록 가져오기
	var subjectVal = Number($("#subjectSelect option:selected").val());
	var itemVal = Number($("#itemSelect option:selected").val());
	var subjectNM = $("#subjectSelect option:selected").text();
	var itemNM = $("#itemSelect option:selected").text();
	
	var itemScore = $("label[name=ITEM_SCORE]").length;
	var itemScore_list = new Array(itemScore);
	for(var i=0; i<itemScore; i++){                          
		itemScore_list[i] = $("label[name=ITEM_SCORE]").eq(i).text();
	}
	
	var standard1 = $("input[name=ITEM_STANDARD1]").length;
	var standard1_list = new Array(standard1);
	for(var i=0; i<standard1; i++){
		if($("input[name=ITEM_STANDARD1]").eq(i).val() === ""){
			standard1_list[i] = "-";
		}else{
			standard1_list[i] = deComma($("input[name=ITEM_STANDARD1]").eq(i).val());
		}
	}
	
	var standard2 = $("input[name=ITEM_STANDARD2]").length;
	var standard2_list = new Array(standard2);
	for(var i=0; i<standard2; i++){
		if($("input[name=ITEM_STANDARD2]").eq(i).val() === ""){
			standard2_list[i] = "-";
		}else{
			standard2_list[i] = deComma($("input[name=ITEM_STANDARD2]").eq(i).val());
		}
	}
	
	var operator1 = $("select[name=OPERATOR1]").length;
	var operator1_list = new Array(operator1);
	for(var i=0; i<operator1; i++){                          
		operator1_list[i] = $("select[name=OPERATOR1]").eq(i).val();
	}
	
	var operator2 = $("select[name=OPERATOR2]").length;
	var operator2_list = new Array(operator2);
	for(var i=0; i<operator2; i++){                          
		operator2_list[i] = $("select[name=OPERATOR2]").eq(i).val();
	}
	
	//console.log(subjectVal + " ::: " +itemVal+" ::: "+itemScore_list + " ::: " +standard1_list + " ::: "+standard2_list + " ::: "+operator1_list+" ::: "+operator2_list);
	var arr = new Array();
	var params = new Object();
	
	if(subjectVal !== 6){
		for(var i=0; i<itemScore; i++){
			var obj = new Object();
			/* obj.SUBJECT_NO = subjectVal;
			obj.ITEM_NO = itemVal; */
			obj.ITEM_SCORE = itemScore_list[i];
			obj.ITEM_STANDARD1 = standard1_list[i];
			obj.OPERATOR1 = operator1_list[i];
			obj.ITEM_STANDARD2 = standard2_list[i];
			obj.OPERATOR2 = operator2_list[i];
			
			arr.push(obj);
		}
		params.ITEM_DETAIL_LIST = arr;
		params.ITEM_LENGTH = itemScore;
	}else{ // 신용평가 지표는 구분 필요
		params.ITEM_LENGTH = 1;
	}
	
	params.SUBJECT_NO = subjectVal;
	params.ITEM_NO = itemVal;
	params.SUBJECT_NM = subjectNM;
	params.ITEM_NM = itemNM;
	params.ITEM_DEFINITION = $("#ITEM_DEFINITION").val();
	params.ITEM_WEIGHT = $("#ITEM_WEIGHT").val();
	params.UPD_MEMO = "수정";
	params.DIVISION = 1;
	
	//console.log(params);
	
	$.ajax({
		url: "/admin/cubici/adminPreference/prizmEvalUpdate",
		type: "post",
		dataType: "json",
		data: params,
		success: function (result) {
			if(result.resultCode == 0){
				location.reload();
			}else{
				alert("프리즘 세부지표 업데이트 중 오류가 발생했습니다.");
			}
		},
		error: function(result){
			alert("서버 통신 오류");
		}
	});
	
}
// 세부지표 상세 내역
function updDetail(UPD_SEQ){
	
	var param = {
			UPD_SEQ: UPD_SEQ,
			DIVISION: 1
			}
	
	$.ajax({
		url: "/admin/cubici/adminPreference/prizmEvalUpdList",
		type: "post",
		dataType: "json",
		data: param,
		success: function (result) {
			if(result.resultCode == 0){
				
				var arrLength = result.prizmUpdDetailList.length;
				var arr = result.prizmUpdDetailList;
				
				var beforeHtml = "";
				var afterHtml = "";
				
				for(var i=0; i<arrLength; i++){
					var getData = arr[i];
					if(i === 0){
						beforeHtml += '<tr><th colspan="5"><strong style="float: left">지표정의</strong><textarea id="ITEM_DEFINITION_BEFORE" rows="2" style="width: 100%; font-weight: normal;" readonly>'+arr[i].ITEM_DEFINITION_BEFORE+'</textarea></th></tr>';
						beforeHtml += '<tr><th colspan="5"><strong>가중치</strong>&nbsp;&nbsp;&nbsp;<input style="font-weight: normal;" id="ITEM_WEIGHT_BEFORE" type="text" value='+arr[i].ITEM_WEIGHT_BEFORE+' readonly /></th></tr>';
						afterHtml += '<tr><th colspan="5"><strong style="float: left">지표정의</strong><textarea id="ITEM_DEFINITION_AFTER" rows="2" style="width: 100%; font-weight: normal;" readonly>'+arr[i].ITEM_DEFINITION_AFTER+'</textarea></th></tr>';
						afterHtml += '<tr><th colspan="5"><strong>가중치</strong>&nbsp;&nbsp;&nbsp;<input style="font-weight: normal;" id="ITEM_WEIGHT_AFTER" type="text" value='+arr[i].ITEM_WEIGHT_AFTER+' readonly /></th></tr>';
					}
					if(Number(arr[i].SUBJECT_NO) !== 6){
						beforeHtml += "<tr>";
						beforeHtml += "<td><strong>"+arr[i].ITEM_SCORE+"</strong></td>";
						if(arr[i].ITEM_STANDARD1_BEFORE === "-"){
							beforeHtml += "<td>"+arr[i].ITEM_STANDARD1_BEFORE+"</td>";
						}else{
							beforeHtml += "<td>"+parseFloat(arr[i].ITEM_STANDARD1_BEFORE)+"</td>";
						}
						beforeHtml += "<td>"+arr[i].OPERATOR1_BEFORE+"</td>";
						if(arr[i].ITEM_STANDARD2_BEFORE === "-"){
							beforeHtml += "<td>"+arr[i].ITEM_STANDARD2_BEFORE+"</td>";
						}else{
							beforeHtml += "<td>"+parseFloat(arr[i].ITEM_STANDARD2_BEFORE)+"</td>";
						}
						beforeHtml += "<td>"+arr[i].OPERATOR2_BEFORE+"</td>";
						beforeHtml += "</tr>";
						
						afterHtml += "<tr>";
						afterHtml += "<td><strong>"+arr[i].ITEM_SCORE+"</strong></td>";
						if(arr[i].ITEM_STANDARD1_AFTER === "-"){
							afterHtml += "<td>"+arr[i].ITEM_STANDARD1_AFTER+"</td>";
						}else{
							afterHtml += "<td>"+parseFloat(arr[i].ITEM_STANDARD1_AFTER)+"</td>";
						}
						afterHtml += "<td>"+arr[i].OPERATOR1_AFTER+"</td>";
						if(arr[i].ITEM_STANDARD2_AFTER === "-"){
							afterHtml += "<td>"+arr[i].ITEM_STANDARD2_AFTER+"</td>";
						}else{
							afterHtml += "<td>"+parseFloat(arr[i].ITEM_STANDARD2_AFTER)+"</td>";
						}
						afterHtml += "<td>"+arr[i].OPERATOR2_AFTER+"</td>";
						afterHtml += "</tr>";
					}
				}
				
				$("#beforeDetailRecord").empty().html(beforeHtml);
				$("#afterDetailRecord").empty().html(afterHtml);
				
				$("#prizmUpdDetailModal").modal("show");
			}else{
				alert("프리즘 세부지표 수정내역 요청 중 오류가 발생했습니다.");
			}
		},
		error: function(result){
			alert("서버 통신 오류");
		}
	});
	
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="/admin/cubici/adminPreference/prizmConfig">Prizm</a></li>
        <li><a href="/admin/cubici/adminPreference/craConfig">CRA Index</a></li>
        <li><a href="/admin/cubici/adminPreference/prizmRawData">RawData</a></li>
    </ul>
</div>

<div class="selectSetArea">
    <div class="btnArea">
        <a href="javascript:;" class="sBtn sColorLB modalOpen" data-modal="ac6p4">지표 변경 이력관리</a>
    </div>
    <div class="selectSet">
        <article>
            <header>
                <h4>차원 List</h4>
            </header>
            <div class="contentArea">
                <div class="selectMulti">
                    <div class="fwBox selectHead">
                        <span>List</span>
                        <span>비중</span>
                    </div>
                    <ul>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>기업개요</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>매출지표</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>정산지표</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>고객지표</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>운영지표</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>신용평가</b><i>XX</i></span>
                            </label>
                        </li>
                    </ul>
                    <div class="total">
                        <span>6차원</span>
                        <span>100</span>
                    </div>
                </div>
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorLG">수정</a>
                    <a href="javascript:;" class="sBtn sColorLB">확인</a>
                </div>
            </div>
        </article>
        <article>
            <header>
                <h4>평가지표</h4>
            </header>
            <div class="contentArea">
                <div class="selectMulti">
                    <div class="fwBox selectHead">
                        <span>List</span>
                        <span>비중</span>
                    </div>
                    <ul>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>사업기간</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>몰 운영기간</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>거래 쇼핑몰 수</b><i>XX</i></span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="s01">
                                <span><b>판매 제품 수</b><i>XX</i></span>
                            </label>
                        </li>
                    </ul>
                    <div class="total">
                        <span>4항목</span>
                        <span>100</span>
                    </div>
                </div>
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorLG">수정</a>
                    <a href="javascript:;" class="sBtn sColorLB">확인</a>
                </div>
            </div>
        </article>
        <article>
            <header>
                <h4>세부지표 설정</h4>
            </header>
            <div class="contentArea">
                <div class="justifyArea">
                    <dl>
                        <dt><span>지표 정의</span></dt>
                        <dd>
                            <div class="fwBox">
                                <span>
                                    사업자등록증 상, 개업연월일 <br>
                                    기준으로 기간 산정
                                </span>
                            </div>
                        </dd>
                    </dl>
                    <dl>
                        <dt>
                            <span>구분 척도</span>
                            <input type="text">
                        </dt>
                        <dd>
                            <ul class="inputList">
                                <li>
                                    <i class="num">1</i>
                                    <input type="text">
                                    <input type="text">
                                </li>
                                <li>
                                    <i class="num">2</i>
                                    <input type="text">
                                    <input type="text">
                                </li>
                                <li>
                                    <i class="num">3</i>
                                    <input type="text">
                                    <input type="text">
                                </li>
                                <li>
                                    <i class="num">4</i>
                                    <input type="text">
                                    <input type="text">
                                </li>
                                <li>
                                    <i class="num">5</i>
                                    <input type="text">
                                    <input type="text">
                                </li>
                            </ul>
                            </ul>
                        </dd>
                    </dl>
                </div>
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorLG">수정</a>
                    <a href="javascript:;" class="sBtn sColorLB">확인</a>
                </div>
            </div>
        </article>
    </div>
    <div class="m-search m-modalGrid">
        <ul class="item">
            <li></li>
            <li class="col-2 btn">
                <div class="fwBox">
                    <span class="ft">수정 적용 기준</span>
                    <div class="input">
                        <input type="text" class="datepicker" placeholder="시작기간">
                    </div>
                </div>
                <div class="fwBtn">
                    <a href="javascript:;" class="sBtn sColorLB">확인</a>
                </div>
            </li>

            <li></li>
        </ul>
    </div>
</div>

<article class="subBox">
    <header>
        <h4>종합 지표 현황</h4>
        <span class="miniData">2021/07/01 기준  /  총 사례수 10,122</span>
    </header>
    <div class="contentArea">
        <table class="m-mixTable">
            <tr class="bgDarkGray">
                <td rowspan="2">평가지표</td>
                <td rowspan="2">비중</td>
                <td rowspan="2">평균값</td>
                <td rowspan="2">최소값</td>
                <td rowspan="2">최대값</td>
                <td colspan="5">척도별 빈도</td>
            </tr>
            <tr class="bgLightBlue">
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
            </tr>
            <tr>
                <th>기업개요</th>
                <td>XX</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <th>사업기간</th>
                <td>XX</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <th>몰 운영기간</th>
                <td>XX</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <th>거래 쇼핑몰 수</th>
                <td>XX</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        </table>
    </div>
</article>
