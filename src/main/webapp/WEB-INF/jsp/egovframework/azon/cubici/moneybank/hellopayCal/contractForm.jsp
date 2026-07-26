<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<script>

$(document).ready(function(){
	

</script>

<!-- 컨텐츠 -->
<div class="contentGrid">
	<div class="inner wide">
		
		<!-- TAB 영역 -->
		<div class="s-tab">
			<ul>
				<li><a>서비스 신청</a></li>
				<li><a>검토 및 심사</a></li>
				<li class="active"><a>계약 체결</a></li>
			</ul>
		</div>
		
		<!-- 오픈뱅킹 호출 -->
		<div class="fwBox autoHeight">
	        <div class="ft">
	            <span class="infoArea">
	                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
	            </span>
	            <p>P2P 계약 TEST</p>
	        </div> 
	        <div class="input">
		         <p class="guide"></p>
		         <br>
		         <div>
					<b>계좌별명을 "선지급" 혹은 "요구불"로 입력하여 인증해주세요.</b>
			     </div>
		         <br>
		         <br>
		         <div>
			         <b>계약 은행정보 인증 : </b>
			         	<button class="sColorN" id ="apiAuth" style="width: 100px; height : 34px;" >인증</button>
			     </div>
		         <br>
		    </div>
		    <div class="input">
		         <p class="guide"></p>
		         <br>
		         <div>
			         <b>RESULTS : </b>
			         	<br>
			         	<br>
			         	<textarea id="apiResult" style=" text-align : center; width: 70%; height : 200px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
			         	<br>
			         	<br>
			         	<button class="sColorN" id = "submitContract" style="width: 100px; height : 34px;" >계약성립</button>
			         	<br>
			         	<br>
		         </div>
		         <br>
		    </div>
	    </div>	
	    
	    <!-- 선지급 서비스 안내 -->
		<div class="conArticle">
			<div class="conArticle-inner">
				<h3>머니플러스 서비스 안내</h3>
				<div class="txt-content content-bg">
					아래의 전자 계약서 내역을 확인하시고 계약 체결 버튼을 클릭 하시면 머니플러스 서비스 계약이 체결됩니다.
				</div>
				<p class="text-center f-w-300 m-b60">위의 심사결과 및 이용조건을 확인 하시고 아래 “이용조건 동의”를 선택하시면 계약이 진행됩니다.</p>
				<!-- 심사결과 동의 버튼 -->
				<div class="button-box">
					<a class="big-gray-btn" type="button" style="cursor: pointer;" id="refusalEval">동의하지 않습니다</a>
					<a class="big-blue-btn" type="button" style="cursor: pointer;" id="approvalEval">이용조건 동의</a>
				</div>
				
			</div>
		</div>		
	</div>
</div>