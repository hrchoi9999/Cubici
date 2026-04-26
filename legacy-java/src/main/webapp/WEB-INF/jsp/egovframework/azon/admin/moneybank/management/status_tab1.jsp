<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	
	<title>Insert title here</title>
	
	<script type="text/javascript" src="/resources/assets/js/jquery.min.js"></script>
	<script src="/resources/js/common/cubici.core.js"></script>

	<script>
		$(document).ready(function(){
	
		});
	</script>
</head>
<body>
<div class="container">
	<div class="mb-5 row col-lg-12 col-md-12">
		<div class="col-lg-2 col-md-2">
			<a href="/admin/together/management/status/tab1"><button type="button" class="mt-5 btn btn-info">현황종합</button></a>
		</div>
		<div class="col-lg-2 col-md-2">
			<a href="/admin/together/management/status/tab2"><button type="button" class="mt-5 btn btn-primary">운영지표</button></a>
		</div>
		<div class="col-lg-2 col-md-2">
			<a href="/admin/together/operation/status"><button type="button" class="mt-5 btn btn-secondary">operation</button></a>
		</div>
	</div>
	
	<p>투게더 관리자 > 통합현황 > 현황종합</p>
	
	<div class='row d-md-flex col-12'>
		<div class="col-lg-3 col-md-3">
			머니뱅크 회원<br>
			전일가입: ${regUserInfo.yesterMemCount}<br>
			누적회원: ${regUserInfo.totalMembers}<br>
		</div>
		<div class="col-lg-3 col-md-3">
			서비스 누적 (백만원)<br>
			전일신청: ${regUserInfo.yesterLoanAmount}<br>
			당월누적: ${regUserInfo.totalLoanAmount}<br>
		</div>
		<div class="col-lg-3 col-md-3">
			상환 누적 (백만원)<br>
			전일신청:<br>
			당월누적:<br>
		</div>
		<div class="col-lg-3 col-md-3">
			서비스 잔액<br>
			전일심사:<br>
			당월누적:<br>
		</div>
	</div>
	
	<div class="col-lg-2 col-md-2">
		<a href="/admin/cubici/signOut"><button type="button" class="mt-5 btn btn-warning" id="adminSignOut">로그아웃</button></a>
	</div>
</div>
</body>
</html>
