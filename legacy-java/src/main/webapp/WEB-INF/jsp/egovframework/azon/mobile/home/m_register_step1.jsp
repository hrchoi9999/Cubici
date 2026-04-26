<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>

$(document).ready(function(){
	$(document).on('click', ".registNextBtn", function(){	
		nextCheck = $(".agreeAll").prop('checked');
		if(!nextCheck){
			modalInfo("이용약관에 모두 동의해주세요.");
			return false;
		} else {
			location.href="/m/register/step2"
		}
	});
	
	// 회원가입 > 약관동의 > 전체동의 스크립트
	$(document).on('change', ".agreeAll", function(){
	    let state = $(this).prop('checked') ? true : false;
	    $('input[name="agree"]').prop('checked', state);
	});
	$(document).on('change', 'input[name="agree"]', function(){
		let thisLength = $('input[name="agree"]').length;
		let checkedLength = $('input[name="agree"]:checked').length;
		let state =  thisLength == checkedLength ? true : false;
	    $('.agreeAll').prop('checked', state);
	});
});



</script>

<div class="subContents onlyContents">
    <div class="inner">
       <!--  <div class="subBox"> -->
            <!-- <header>
                <h4>회원가입</h4>
                <div class="btns">
                    <a href="/m/main" class="oiBtn back">뒤로</a>
                </div>
            </header> -->
	    <div class="contentArea">
	        <div class="loginArea">
	            <div class="m-tab">
	                <ul>
	                    <li class="active"><a href="javascript:;" style="cursor: default;" data-page="join02">약관 동의</a></li>
	                    <li><a href="javascript:;" style="cursor: default;" data-page="join01">기본 정보</a></li>
	                    <li><a href="javascript:;" style="cursor: default;" data-page="join03">쇼핑몰 등록</a></li>
	                </ul>
	            </div>
	            <div class="m-tabBox active">
	                <div class="mArticleArea policySet">
	                    <div class="articleTitle">
	                        <span class="t1">약관동의</span>
	                        <div class="aRight">
	                            <label class="checkBox">
	                                <input type="checkbox" class="agreeAll">
	                                <span>이용 약관 전체 동의</span>
	                            </label>
	                        </div>
	                    </div>
	                    <article class="m-modalGrid">
	                        <div class="contentsArea">
	                            <div class="policyTxtBox">
	                        		<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/agree1.jsp" flush="true" />
	                       		</div>
	                            <div class="checkArea">
	                                <label class="checkBox">
	                                    <input type="checkbox" name="agree">
	                                    <span>약관에 동의합니다.</span>
	                                </label>
	                            </div>
	                        </div>
	                    </article>
	                    <article class="m-modalGrid">
	                        <header>
	                            <h3>개인정보 보호정책</h3>
	                        </header>
	                        <div class="contentsArea">
	                            <div class="policyTxtBox">
	                         	<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/agree2.jsp" flush="true" />
	                         </div>
	                            <div class="checkArea">
	                                <label class="checkBox">
	                                    <input type="checkbox" name="agree">
	                                    <span>약관에 동의합니다.</span>
	                                </label>
	                            </div>
	                        </div>
	                    </article>
	                    <article class="m-modalGrid">
	                     <header>
	                         <h3>개인정보 취급방침</h3>
	                     </header>
	                     <div class="contentsArea">
	                         <div class="policyTxtBox">
	                         	<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/agree3.jsp" flush="true" />
	                         </div>
	                         <div class="checkArea">
	                             <label class="checkBox">
	                                 <input type="checkbox" name="agree">
	                                 <span>약관에 동의합니다.</span>
	                             </label>
	                         </div>
	                     </div>
	                 </article>
	                    <div class="btnArea">
	                        <button type="button" class="mBtn sColorG" onclick="location.href='/m/main'">취소</button>
	                 	<a href="javascript:;" class="mBtn sColorN registNextBtn">다음</a>
	                    </div>
	                </div>
	            </div>
	        </div>
            <!-- </div> -->
        </div>
    </div>
</div>