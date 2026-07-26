<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>무제</title>
<style>
table, tr, th{
border-collapse: collapse;
 border:1px solid black;
}
</style>
<script type="text/javascript" src="/resources/assets/js/jquery.min.js"></script>

<script>
$(document).ready(function() {
    $(document).on('click', "#gogo", function(){
    	let shopCode = $("#shopCode").val();
    	let shopNm = $("#shopNm").val();
    	rpaInventoFunc(shopCode, shopNm);
    });
});

function rpaInventoFunc(shopCode, shopNm) {
	xhr = new XMLHttpRequest();
	xhr.open("post", "https://www.cubici.co.kr/rpa/invento/post", true);
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var responseData = xhr.responseText;
				console.log("요청 결과 : " + responseData);
			} else {
				console.log("요청오류 : " + xhr.status);
			}
		}
	}
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("&shopCode=" + shopCode + "&shopNm=" + shopNm);
}
</script>

</head>

<body>
<input type="text" id="shopCode" placeholder="shopCode">
<input type="text" id="shopNm" placeholder="shopNm">
<button type="button" id="gogo">start</button>

</body>
</html>
