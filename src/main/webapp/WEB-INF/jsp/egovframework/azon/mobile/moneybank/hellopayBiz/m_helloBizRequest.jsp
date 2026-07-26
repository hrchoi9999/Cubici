<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
$(document).ready(function(){
	
	let flag = "${advancePaymentYN}";
	
	let currentShopStr = "${shop}";
	
	// 쇼핑몰
	displayShops(currentShopStr);
	
	// 동의서 확인
	/* $("#allCheck").click(function(){
        if($("#allCheck").is(":checked")){
            $("input[class=check-doc]").prop("checked", true);
        }else{
        	$("input[class=check-doc]").prop("checked", false);
        }
    }); */
	
	// 문서 업로드 ?
	
	// 입력내용확인 버튼
	$("#validateInfo").on('click', function(){
		
		event.preventDefault();
		
		if(flag == "Y"){
			
			// 회원정보
			let userNo = ${info.USER_NO};
			
			// 신청 쇼핑몰 리스트를 String으로 변환 후 보내기
			let shopArr = [];
			let shopStr = "";
			$("input[class=check-shop]:checked").each(function(){
				let shops = $(this).val();
				if(shops!=null){
					shopArr.push(shops);
				}
				shopStr = shopArr.toString();
			});
			// 쇼핑몰 예외처리
			if(shopStr == ""){
				modalInfo("선지급 서비스를 이용할 B2B 도매사이트를 선택해주세요");
				return;
			}
			
			// 금액 예외처리
			let totalLimitAmount = $('#total_limit_amount').val();
			let limitInt = totalLimitAmount*1;
			if(totalLimitAmount == ""){
				modalInfo("총 한도 금액을 입력해주세요.");
				return;
			}else if(limitInt<5 || limitInt>50){
				modalInfo("신청 한도 금액을 확인해주세요. (5백만원 ~ 5천만원)");
				return;
			}
			
			// 조건 조회
			let callUrl = "/moneybank/advPay/requestCondition";
			let callbackFunc = "initConditionCheck";
			let objParam = {
					USER_NO : userNo,
					REQUEST_SHOP : shopStr,
					REQ_LIMIT_AMOUNT : totalLimitAmount
			}
			cubici.Ajax.fnRequest(objParam, callUrl, callbackFunc);
			
		}else{
			modalInfo("신청 가능 회원이 아닙니다.");
			return false;
		}
		
	});
	
	// 신청하기 버튼
	$("#submitRequest").on("click", function(){
		
		event.preventDefault();
				
		// 동의서 확인 여부
		// checkRegisterForm();
		
		if(flag == "Y"){
			
			// 회원번호
			let userNo = ${info.USER_NO};
			
			// 체크한 쇼핑몰들을 String 형식으로 변환
			let shopArr = [];
			let shopStr = "";
			$("input[class=check-shop]:checked").each(function(){
				let shops = $(this).val();
				if(shops!=null){
					shopArr.push(shops);
				}
				shopStr = shopArr.toString();
			});
			// 쇼핑몰 예외처리
			if(shopStr == ""){
				modalInfo("선지급 서비스를 이용할 B2B 도매사이트를 선택해주세요");
				return;
			}
			
			// 금액 예외처리 ( 입력값은 백만원 단위 )
			let totalLimitAmount = $('#total_limit_amount').val();
			let limitInt = totalLimitAmount*1;
			if(totalLimitAmount == ""){
				modalInfo("총 한도 금액을 입력해주세요.");
				return;
			}else if(limitInt<5 || limitInt>50){
				modalInfo("신청 한도 금액을 확인해주세요. (5백만원 ~ 5천만원)");
				return;
			}
			
			// Form Data
			let data = new FormData();
			data.append("USER_NO", userNo);
			data.append("REQUEST_SHOP", shopStr);
			data.append("REQ_LIMIT_AMOUNT", totalLimitAmount);
			
			// 신청상태
			data.append("REQUEST_STATUS", "00");
			// 상품번호 ( 헬로페이 선지급 -> 9 )
			data.append("DIVISION", "9");
			
			// B2B도매업체명 ( 현재는 비밀특가 하나뿐이니 고정 )
			data.append("WHOLESALE_MALL_ID", "비밀특가");
			
			// B2B도매업체 아이디
			data.append("WHOLESALE_MALL_ID", "TEST123");
			
			// 여기 필요 파일 업로드 여부 확인 추가
			
			// 신청 Process
		 	$.ajax({
				type : "POST",
				enctype : 'multipart/form-data',
				url : "/moneybank/advPay/requestInsert",
				data : data,
				processData : false,
				contentType : false,
				cashe: false,
				timeout : 600000,
				success: function(data){
					sendRequest(data);
				},
				error: function(e){
					alert("서비스 점검 중");
				}
			});
			
		}else{
			modalInfo("신청 가능 회원이 아닙니다.");
			return false;
		}	
		
	});
});

// 신청 결과 FUNC
function sendRequest(data){
	
	let resultCode = data.resultCode;
	
	if(resultCode == 0){
		modalInfo("신청이 접수 되었습니다.");
	}else{
		modalInfo("신청 사항을 다시 확인해주세요.");
	}
	
}

// text comma 찍기
function numberWithCommas(x) {
  x = x.replace(/[^0-9]/g,'');   // 입력값이 숫자가 아니면 공백
  x = x.replace(/,/g,'');          // ,값 공백처리
  $("#total_limit_amount").val(x.replace(/\B(?=(\d{3})+(?!\d))/g, ",")); // 정규식을 이용해서 3자리 마다 , 추가 
}

// 입력내용확인 & 1차 조회 결과 Func
function initConditionCheck(data){
	if(data.resultCode == 0){
		if (data.requestCondition == 0) {
			alert("헬로펀딩 선지급 신청이 가능 합니다.");
		} else {
			alert("헬로펀딩 선지급 대상이 아닙니다 : "+data.requestCondition);
		}
	} else {
		alert("관리자에게 문의해 주세요.");
	}
}

// 동의서 체크 확인
function checkRegisterForm(){
	
	// 동의서 확인
	let allChecked = $("#allCheck").is(":checked");
	let checked01 = $("#check-01").is(":checked");
	let checked02 = $("#check-02").is(":checked");
	let checked03 = $("#check-03").is(":checked");
	
	if(allChecked == false){
		if(checked01 == false || checked02 == false || checked03 == false){
			modalInfo("동의서를 모두 확인해주세요.")
			return false;
		}
	}
}

// 쇼핑몰 나열
function displayShops(currentShopStr){
	
	let shopHtml = "";

	let currShops = currentShopStr.split(",");
	
	currShops.forEach( shop => {
		
		switch(shop){
			case '1':
				shopHtml+= '<input class="check-shop" id="옥션" type="checkbox" name="shop" value="'+shop+'"/>'+
							'<label for="옥션"><img src="/resources/rudicks/img/partner-color/auction-con.png" alt="">옥션</label>';
				break;
			case '2':
				shopHtml+= '<input class="check-shop" id="네이버" type="checkbox" name="shop" value="'+shop+'"/>'+
							'<label for="네이버"><img src="/resources/rudicks/img/partner-color/naver-con.png" alt="">네이버</label>';
				break;
			case '3':
				shopHtml+= '<input class="check-shop" id="지마켓" type="checkbox" name="shop" value="'+shop+'"/>'+
							'<label for="지마켓"><img src="/resources/rudicks/img/partner-color/gmarket-con.png" alt="">지마켓</label>';
				break;			
			case '4':
				shopHtml+= '<input class="check-shop" id="11번가" type="checkbox" name="shop" value="'+shop+'"/>'+
							'<label for="11번가"><img src="/resources/rudicks/img/partner-color/11st-con.png" alt="">11번가</label>';
				break;
			case '11':
				shopHtml+= '<input class="check-shop" id="쿠팡" type="checkbox" name="shop" value="'+shop+'"/>'+
							'<label for="쿠팡"><img src="/resources/rudicks/img/partner-color/coupang-con.png" alt=""></label>';
				break;
			case '14':
				shopHtml+= '<input class="check-shop" id="인터파크" type="checkbox" name="shop" value="'+shop+'"/>'+
							'<label for="인터파크"><img src="/resources/rudicks/img/partner-color/interpark-con.png" alt=""></label>';
				break;
		}
	})
	$("#currentShop").html(shopHtml);
}

</script>

<!-- 컨텐츠 -->
  <div class="contentGrid">
    <div class="inner wide">
      <div class="s-tab">
        <ul>
          <li class="active"><a href="c5p2-1">서비스 신청</a></li>
          <li><a href="c5p2-2">검토 및 심사</a></li>
          <li><a href="c5p2-3">계약 체결</a></li>
        </ul>
      </div>

      <div class="conArticle">
        <div class="conArticle-inner">
          <h3>머니뱅크 이용방법</h3>
          <div class="money-bank-table color-g box-border-blue">
            <table>
              <tr>
                <th class="w120 bg-sky">
                  아이디
                </th>
                <td class="border-r-none">
                  hoho123
                </td>
                </tr>
                <tr>
                <th class="bg-sky">
                  회사명
                </th>
                <td>길동컴퍼니</td>
              </tr>
              <tr>
                <th class="bg-sky">
                  대표자명
                </th>
                <td class="border-r-none">
                  홍길동
                </td>
                </tr>
                <tr>
                <th class="bg-sky">
                  사업자등록번호
                </th>
                <td>111-1234-5678</td>
              </tr>
              <tr>
                <th class="bg-sky">
                  주소
                </th>
                <td class="border-r-none">
                  서울 강남구 봉은사로 435
                </td>    
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="conArticle">
        <div class="conArticle-inner">
          <h3>서비스 소개</h3>
          <div class="txt-content content-bg  bg-icon con-01">
            <p class="mTop-20">
              <b class="color-blue underlineTxt"> 구매자금 선지급 서비스 </b>는 B2B 도매사이트를 통해 물건을 구입해 온라인 쇼핑몰에서 판매를 하시고
              도매사이트의 배송서비스를 이용하시는 셀러를
              위한 서비스
              입니다. 먼저 필요한 구매자금을 신청하시고 그 자금으로 상품을 구매할 수 있어서 자금 여력이 부족하신 셀러의 경우 매우 유용한 서비스입니다.
            </p>
            <div class="deco-box">
              <h4>신청대상</h4>
              <ul class="barList color-blue font-14">
                <li>개인온라인 사업 대표 (미성년 및 법인제외)</li>
                <li>월 평균 매출액 5백만원 이상</li>
                <li>타 선지급 및 선정산 서비스 중복이용 불가</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="conArticle">
        <div class="conArticle-inner">
          <h3>선지급 도매몰 등록</h3>
          <form>
            <div class="money-bank-table box-border-blue">
              <table class="register-table">
                <tbody>
                  <tr class="border-bottom-g ">
                    <th class="border-r-none"> 선지급 서비스를 이용할 B2B 도매사이트를 선택하시고 해당 몰의 아이디를 입력해주세요. </th>
                  </tr>
                  <tr class="border-bottom-g ">
                    <td class="border-r-none">
                      <label><b class="square-txt color-blue">B2B 도매몰 </b></label>
                      <select class="wide">
                        <option>-------- B2B몰 선택 --------</option>
                        <option> A 몰</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label><b class="square-txt color-blue">B2B 아이디</b></label>
                      <input class="wide align-left" type="text" placeholder="hoho123" required>
                    </td>
                  </tr>
        
                  <tr>
                    <th class="border-r-none border-bottom-g">선지급 서비스를 이용할 B2B 도매사이트를 선택하시고 해당 몰의 아이디를 입력해주세요.</th>
                  </tr>
                  <tr>
                    <td class="shopList">
                      <div>
                      <input class="check-shop" id="Shop1" type="checkbox" name="shop" />
                      <label
                        for="Shop1"><img src="/resources/rudicks/img/partner-color/auction-con.png" alt="">옥션</label>
                      </div>
                      <div>
                      <input class="check-shop" id="Shop2" type="checkbox" name="shop" />
                      <label
                        for="Shop2"><img src="/resources/rudicks/img/partner-color/naver-con.png" alt="">네이버</label>
                      </div>
                      <div>
                      <input class="check-shop" id="oShop3" type="checkbox" name="shop" />
                      <label
                        for="Shop3"><img src="/resources/rudicks/img/partner-color/gmarket-con.png" alt="">지마켓</label>
                      </div>
                      <div>
                      <input class="check-shop" id="Shop4" type="checkbox" name="shop" />
                      <label
                        for="Shop4"><img src="/resources/rudicks/img/partner-color/11st-con.png" alt="">11번가</label>
                      </div>
                      <div>
                      <input class="check-shop" id="Shop5" type="checkbox" name="shop" />
                      <label
                        for="Shop5"><img src="/resources/rudicks/img/partner-color/coupang-con.png" alt="쿠팡"></label>
                      </div>
                      <div>
                      <input class="check-shop" id="Shop6" type="checkbox" name="shop" />
                      <label
                        for="Shop6"><img src="/resources/rudicks/img/partner-color/interpark-con.png" alt="인터파크"></label>
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
          </form>
        </div>
      </div>
    </div>

    <div class="conArticle">
      <div class="conArticle-inner">
        <h3>희망 선지급 최대 총액</h3>
        <div class="txt-content content-bg bg-icon con-02">
          <form>
            <p class="mTop-20"><b class="color-blue underlineTxt">희망하시는 구매자금 선지급 대출총액</b>을 아래에 최소 5백만원에서 최대
              5천만원까지 사이의 금액을 백만원 단위로 입력해 주십시오. <br />
              (심사평가 결과 신청금액과 이용가능 금액이 상이할 수 있습니다.)
            </p>
            <div class="color-blue center-box">
              <label for=""><span>
                  <b class="square-txt">희망 선지급 이용한도</b></span>
              </label>
              <input class="amount" id="" type="text" value="" placeholder="희망금액" /><span>백만원</span>
            </div>
            <p class="color-blue font-14">
              선지급 이용한도란 선지급 이용가능 총액한도금액을 의미합니다. 따라서 대출총액 30백만원의 경우 3백만원씩 10번의 선지급 이용이 가능합니다. <br />
              (회당 이용가능 금액은 셀러의 필요에 따라 설정가능)
            </p>
            <div class="button-box">
              <button class="inputCheck-btn" type="submit">입력내용확인</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="conArticle">
      <div class="conArticle-inner">
        <h3>신청 서류 안내</h3>
        <div class="txt-content content-bg">
          <p>큐빅아이 구매자금 선지급 신청을 위해서는 아래의 서류들이 필요합니다. 제출서류 내용과 아래의 동의서를 꼭 확인하시고 신청해 주십시오.</p>
          <ul class="barList color-blue font-14">
            <li><span>사업자 등록증 및 대표자 주민등록증 사본 : 필수 확인 서류</span></li>
            <li><span>주거래 통장 사본 : 선지급 상환이후 잔금 입금을 위한 통장 (셀러 관리통장)</span> </li>
            <li><span>요구불 통장 사본 : 선지급 입금 및 온라인 쇼핑몰 정산입금 관리를 위한 통장 (통장개설 이후, 쇼핑몰 결제계좌를 본 요구불통장으로 변경하셔야
                합니다.)</span><a class="bankbook-btn" href="#n">통장개설</a> </li>
            <li><span>신용평가, 개인(신용)정보조회, 신용정보수집이용 동의서 동의</span></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="conArticle">
      <div class="conArticle-inner">
        <h3>동의서 확인</h3>
        <div class="txt-content box-border-blue">
          <p>큐빅아이 구매자금 선지급 신청을 위해서는 아래의 서류들이 필요합니다. 제출서류 내용과 아래의 동의서를 꼭 확인하시고 신청해 주십시오.</p>
          <form>
            <fieldset>
              <ul class="checkBoxList">
                <li class="col-100"><input id="allCheck" class="all-check" type="checkbox">
                  <label for="allCheck" class="color-blue"><b>전체동의</b></label>
                </li>
                <li class="col-100 font-14">
                  <input id="check-01" type="checkbox"><label for="check-01">[필수] 신용평가
                    의뢰서(개인사업자)</label>
                  </li>
                <li class="col-100 font-14">
                  <input id="check-02" type="checkbox"><label for="check-02">[필수]
                    신용정보수집이용 제공동의서 (재무재표 수집 등)</label>
                  </li>
                <li class="col-100 font-14">
                  <input id="check-03" type="checkbox"><label for="check-03">[필수]
                    개인(신용)정보조회 동의서</label>
                  </li>
              </ul>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
    <div class="conArticle">
      <div class="conArticle-inner">
        <h3>신청서류 업로드</h3>
        <div class="money-bank-table table-border">
          <table>
            <thead class="bg-blue">
              <tr>
                <th>제출 서류</th>
                <th>번호 입력</th>
              </tr>
            </thead>
            <tbody class="align-center">
              <tr>
                <th rowspan="2">사업자등록증</th>
                <td> <input class="wide" type="text" placeholder="사업자번호(&quot;- &quot;없이 숫자만)" /></td>
              </tr>
              <tr>
                <td> <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" /></td>
              </tr>

              <tr>
                <th rowspan="2">대표자 주민등록등본</th>
                <td><input type="text" value="" placeholder="앞 생년월일" /><span>-</span><input type="text"
                    value="" placeholder="고유번호" /></td>
              </tr>
              <tr>
                <td> <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" /></td>
              </tr>

              <tr>
                <th rowspan="2">국세 납세증명서</th>
                <td><span class="color-blue"><b>“홈텍스”</b> </span>민원증명/납세증명서에서 발급</td>
              </tr>

              <tr>
                <td> <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" /></td>
              </tr>
              <tr>
                <th rowspan="2">지방세 납세증명서</th>
                <td><span class="color-blue"><b>“정부24” </b></span>지방세납세증명에서 발급</td>
              </tr>
              <tr>
                <td> <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" /></td>
              </tr>
              <tr>
                <th rowspan="2">건강보험료 납입증명서</th>
                <td><span class="color-blue"><b>“국민건강보험”</b></span> 제증명발급에서 발급</td>
              </tr>
              <tr>
                <td> <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" /></td>
              </tr>
              <tr>
                <th rowspan="2">부가가치세증명원 (3년)</th>
                <td><span class="color-blue"><b>“홈텍스”</b> </span>민원증명/부가가치세 과세증명</td>
              </tr>
              <tr>
                <td>
                  <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" />
                  <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" />
                  <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" />
                </td>
              </tr>
              <tr>
                <th rowspan="2">제무재표 (3년)</th>
                <td><span class="color-blue"><b>“홈텍스”</b> </span> 민원증명/표준제무제표증명</td>
              </tr>
              <tr>
                <td><img src="../img/icon/upload02.png" alt="업로드"></td>
              </tr>
              <tr>
                <th rowspan="2">요구불 통장 사본</th>
                <td>
                  <select>
                    <option>은행</option>
                  </select>
                  <input  type="text" value="" placeholder="계좌번호 (&quot;- &quot;없이 숫자만)" />
                </td>
              </tr>
              <tr>
                <td>
                  <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" />
                  <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" />
                  <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" />
                </td>
              </tr>
              <tr>
                <th rowspan="2">주거래 통장 사본</th>
                <td>
                  <select>
                    <option>은행</option>
                  </select>
                  <input  type="text" value="" placeholder="계좌번호 (&quot;- &quot;없이 숫자만)" />
                </td>
              </tr>
              <tr>
                <td> <label class="fileUpload" for="Upload01"><img src="/resources/rudicks/img/icon/upload02.png"
                      alt="업로드"></label><input id="Upload01" type="file" /></td>
              </tr>
              </tbody>
          </table>
        </div>
        <small class="small color-blue">* 업로드 서류는 3mb이하의 사이즈로 pdf, jpg, png 파일형식이어야 합니다.</small>
        <div class="check-info">
          선지급 대상 쇼핑몰로 등록하신 쇼핑몰의 결제 계좌를 새로 개설하신 “요구불 통장”계좌로<br />
          변경이 확인되어야 선지급 신청내역 심사가 시작됩니다.
        </div>
        <div class="button-box">
          <a class="btn" href="#n">구매자금 선지급 신청</a>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-container pass show" id="alert-pass">
    <div class="modal-wrapper">
      <header>
        <h2>이용안내</h2>
      </header>
      <div class="modal-content">
        <div class="mInner auto mArticleArea">
          <div class="m-imgBox-02"><img src="/resources/rudicks/img/icon/modal-icon02.png" alt="" /></div>
          <div class="noticeTxt">
            <span class="font-32">감사합니다!</span><br/>
            지급 신청단계가 완료되었습니다.<br/>
		신청하신정보와 서류를 기반으로 회원님의 사업현황을 분석하여<br/>
		선지급 이용가능 총액과 이용 조건을 24시간 이내에 안내해<br/>
		드리도록 하겠습니다.
          </div>
          <div class="btnArea">
            <a href="javascript:;" class="modalClose bBtn3 sColorLB">확인</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- //컨텐츠 -->


