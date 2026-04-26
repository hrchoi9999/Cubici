<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

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
	<p>투게더 관리자 > 통합현황 > 운영지표</p>
	
	<div class='row d-md-flex col-12'>
		<div class="col-lg-3 col-md-3">
			신규신청:<br>
		</div>
		<div class="col-lg-3 col-md-3">
			신규심사:<br>
		</div>
		<div class="col-lg-3 col-md-3">
			신규계약:<br>
		</div>
		<div class="col-lg-3 col-md-3">
			계약종료:<br>
		</div>
	</div>
	<br>
	<div class='row d-md-flex col-12'>
		<div class="col-lg-3 col-md-3">
			머니뱅크 운영건수:<br>
		</div>
		<div class="col-lg-3 col-md-3">
			머니뱅크 운용금액:<br>
		</div>
		<div class="col-lg-3 col-md-3">
			머니뱅크 잔액:<br>
		</div>
		<div class="col-lg-3 col-md-3">
			머니뱅크 연체:<br>
		</div>
	</div>
	
	<div class="col-lg-2 col-md-2">
		<a href="/admin/cubici/signOut"><button type="button" class="mt-5 btn btn-warning" id="adminSignOut">로그아웃</button></a>
	</div>
</div>
</body>
</html>
