<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui">
	<title>큐빅아이 관리 시스템</title>
	<!-- Bootstrap -->
	<link rel="stylesheet" href="./assets/bootstrap/css/bootstrap.min.css">
	<link type="text/css" rel="stylesheet" href="./assets/css/jquery-ui.css">
	<link type="text/css" rel="stylesheet" href="./assets/fonts/font-awesome/css/font-awesome.min.css">
	<link type="text/css" rel="stylesheet" href="./assets/fonts/themify-icons/themify-icons.css">
	<link type="text/css" rel="stylesheet" href="./assets/dataTables/dataTables.bootstrap4.css?ver=200326_0933">
	<link type="text/css" rel="stylesheet" href="./assets/dataTables/buttons.dataTables.css?ver=200326_0933">
	<link type="text/css" rel="stylesheet" href="./assets/css/style.css?ver=200326_0933">

	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
	<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
	<!--[if lt IE 9]>
	  <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
	<!-- FAVICON -->
	<link href="./assets/img/favicon.svg" rel="shortcut icon">
	<!--js plugins-->
	<script type="text/javascript" src="./assets/js/jquery.min.js"></script>
	<script type="text/javascript" src="./assets/js/jquery-ui.js"></script>
	<!--
	<script type="text/javascript" src="./assets/js/jquery.ui.datepicker-ko.min.js"></script>
	-->
	<script type="text/javascript" src="./assets/js/moment.min.js"></script>
	<script type="text/javascript" src="./assets/bootstrap/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="./assets/bootstrap/js/bootstrap-filestyle.min.js?ver=200331_1808"></script>
	<script type="text/javascript" src="./assets/js/enquire.min.js?ver=200326_0933"></script>
	<script type="text/javascript" src="./assets/js/jquery.datetimepicker.min.js"></script>
	<!-- dataTables -->
	<script type="text/javascript" src="./assets/dataTables/jquery.dataTables.min.js"></script>
	<script type="text/javascript" src="./assets/dataTables/dataTables.bootstrap4.min.js"></script>
	<script type="text/javascript" src="./assets/dataTables/dataTables.buttons.min.js"></script>
	<script type="text/javascript" src="./assets/dataTables/buttons.colVis.min.js"></script>
</head>
<body>
<header id="topnav" class="navbar navbar-blue navbar-fixed-top">
	<div class="logo-area">
		<a class="navbar-brand" href="./main.html" title=""><img src="./assets/img/logo-h-white.svg" align="absmiddle" /></a>
		<span id="trigger-sidebar" class="toolbar-trigger toolbar-icon-bg">
			<a data-toggle="tooltips" data-placement="right" title="Toggle Sidebar">
				<span class="icon-bg">
					<i class="ti"></i>
				</span>
			</a>
		</span>
	</div><!-- logo-area -->
	<ul class="nav navbar-nav d-none d-sm-none d-md-none d-lg-block">
        <li class="nav-item dropdown">
			<a class="nav-link dropdown-toggle" data-toggle="dropdown" href="javascript:;">큐빅아이 현황</a>
			<ul class="dropdown-menu">
				<li class="dropdown-item"><a class="nav-link" href="./cubici_user.html">가입자 현황</a></li>
				<li class="dropdown-item"><a class="nav-link" href="./cubici_data.html">데이터 현황</a></li>
			</ul>
        </li>
        <li class="nav-item dropdown">
			<a class="nav-link dropdown-toggle" data-toggle="dropdown" href="javasacript:;">선정산 신청 관리</a>
			<ul class="dropdown-menu">
				<li class="dropdown-item"><a href="./hellopay_main.html">선정산 신청관리</a></li>
				<li class="dropdown-item"><a href="./hellopay_status.html"> 선정산신청현황</a></li>
				<li class="dropdown-item"><a href="./hellopay_review.html">심사 평가 관리</a></li>
			</ul>
        </li>
        <li class="nav-item dropdown">
			<a class="nav-link dropdown-toggle" data-toggle="dropdown" href="javascript:;">선정산 운영 관리</a>
			<ul class="dropdown-menu">
				<li class="dropdown-item"><a href="#">선정산 현황</a></li>
				<li class="dropdown-item"><a href="./hellopay_manage_02.html">상환 현황</a></li>
				<li class="dropdown-item"><a href="#">RM 현황</a></li>
				<li class="dropdown-item"><a href="#">수수료 현황</a></li>
				<li class="dropdown-item"><a href="./hellopay_manage_05.html">수수료 기준 설정</a></li>
			</ul>
        </li>
        <li class="nav-item dropdown">
			<a class="nav-link dropdown-toggle" data-toggle="dropdown" href="javascript:;">선정산 회원관리</a>
			<ul class="dropdown-menu">
				<li class="dropdown-item"><a href="./hellopay_member.html">선정산 이용자 현황</a></li>
				<li class="dropdown-item"><a href="#">선정산 이용자 CRM</a></li>
			</ul>
        </li>
        <li class="nav-item dropdown">
			<a class="nav-link dropdown-toggle" data-toggle="dropdown" href="javascript:;">환경 설정</a>
			<ul class="dropdown-menu">
				<li class="dropdown-item"><a href="./add_admin.html">관리자 등록</a></li>
				<li class="dropdown-item"><a href="./settings_prism.html">지표 관리</a></li>
			</ul>
        </li>
	</ul>
	<ul class="nav navbar-nav toolbar ml-auto">
		<li class="nav-item dropdown toolbar-icon-bg toolbar-info">
			<a href="javascript:;" class="nav-link dropdown-toggle" data-toggle='dropdown' aria-haspopup="true" aria-expanded="false" id="navbarDropdownMenuLink">
				<span class="icon-bg">
					<strong class='fa fa-user-o'></strong>&nbsp;&nbsp;oasis87
				</span>
			</a>
			<ul class="dropdown-menu userinfo arrow" aria-labelledby="navbarDropdownMenuLink">
				<li class='dropdown-item'><a href="javascript:;"><i class="ti ti-user"></i><span>프로필</span></a></li>
				<li class='dropdown-item'><a href="javascript:;"><i class="ti ti-settings"></i><span>설정</span></a></li>
				<li class='dropdown-item'><a href="javascript:;"><i class="ti ti-help-alt"></i><span>도움말</span></a></li>
				<li class="divider"></li>
				<li class='dropdown-item'><a href="./"><i class="ti ti-shift-right"></i><span>로그아웃</span></a></li>
			</ul>
		</li>
	</ul>
</header>
<div id="wrapper">
	<div id="layout-static">
		<div class="static-sidebar-wrapper sidebar-bluegray">
			<div class="static-sidebar">
				<div class="sidebar">
					<div class="widget stay-on-collapse" id="widget-sidebar">
						<nav class="widget-body">
							<ul class="acc-menu">
								<li class="open active">
									<a class="nav-link" href="javascript:;">큐빅아이 현황</a>
									<ul class="acc-menu">
										<li class="nav-item"><a class="nav-link" href="./cubici_user.html">가입자 현황</a></li>
										<li class="nav-item active"><a class="nav-link" href="./cubici_data.html">데이터 현황</a></li>
									</ul>
								</li>
								<li>
									<a class="nav-link" href="javascript:;">선정산 신청관리</a>
									<ul class="acc-menu">
										<li class="nav-item"><a class="nav-link" href="./hellopay_main.html">선정산 신청관리</a></li>
										<li class="nav-item"><a class="nav-link" href="./hellopay_status.html">선정산 신청현황</a></li>
										<li class="nav-item"><a class="nav-link" href="./hellopay_review.html">심사 평가 관리</a></li>
									</ul>
								</li>
								<li>
									<a class="nav-link" href="javascript:;">선정산 운영 관리</a>
									<ul class="acc-menu">
										<li class="nav-item"><a class="nav-link" href="#">선정산 현황</a></li>
										<li class="nav-item"><a class="nav-link" href="./hellopay_manage_02.html">상환 현황</a></li>
										<li class="nav-item"><a class="nav-link" href="#">RM 현황</a></li>
										<li class="nav-item"><a class="nav-link" href="#">수수료 현황</a></li>
										<li class="nav-item"><a class="nav-link" href="./hellopay_manage_05.html">수수료 기준 설정</a></li>
									</ul>
								</li>
								<li>
									<a class="nav-link" href="javascript:;">선정산 회원관리</a>
									<ul class="acc-menu">
										<li class="nav-item"><a class="nav-link" href="./hellopay_member.html">선정산 이용자 현황</a></li>
										<li class="nav-item"><a class="nav-link" href="#">선정산 이용자 CRM</a></li>
									</ul>
								</li>
								<li>
									<a class="nav-link" href="javascript:;">환경 설정</a>
									<ul class="acc-menu">
										<li class="nav-item"><a class="nav-link" href="./add_admin.html">관리자 등록</a></li>
										<li class="nav-item"><a class="nav-link" href="./settings_prism.html">지표 관리</a></li>
									</ul>
								</li>
							</ul>
						</nav>
					</div>
				</div>
			</div>
		</div>
		<div class="static-content-wrapper">
			<div class="static-content">
				<div class="page-content">
<ol class="breadcrumb">
	<li class='breadcrumb-item'><a href="./main.html">Home</a></li>
	<li class='breadcrumb-item'>큐빅아이 현황</li>
	<li class='breadcrumb-item active'>거래 데이터</li>
</ol>
<div class="page-heading">
	<h1>거래 데이터</h1>
</div>
<div class="container-fluid">
	<section class='lg-wrap'>
		<div class='d-md-flex mb-3'>
			<div class='mr-auto'>
				<div class="input-group">
					<select id="status" name="status" class="form-control">
						<option value="" selected>검색조건</option>
						<option value="회사명">회사명</option>
						<option value="아이디">아이디</option>
					</select>
					<input type="text" name="search_stx"  class="form-control">
					<span class="input-group-append"><button type="button" class="btn btn-primary"><i class="fa fa-search"></i> 검색</button></span>
				</div>
			</div>
			<div class='ml-auto text-right'>
				<div class="input-group">
					<select id="status" name="status" class="form-control">
						<option value="" selected>기간검색</option>
						<option value="가입일자">가입일자</option>
					</select>
					<input type='text' class='form-control datepicker' name='start_date' id='start_date' placeholder='시작일' value='' >
					<input type='text' class='form-control datepicker' name='end_datre' id='end_datre' placeholder='종료일' value='' >
					<span class="input-group-append"><button type="button" class='btn btn-sm btn-success'><i class='fa fa-file-excel-o'></i> 엑셀 다운로드</button></span>
				</div>
			</div>
		</div>
		<table width="100%" border='0' cellspacing='0'cellpadding='0' class="table table-bordered">
			<thead>
				<tr class="text-center">
					<th>기준일</th>
					<th>회원코드</th>
					<th>큐빅아이ID</th>
					<th>기준일</th>
					<th>쇼핑몰</th>
					<th>쇼핑몰ID</th>
					<th>판매금액</th>
					<th>쇼핑몰<br />수수료</th>
					<th>정산예정<br />금액</th>
					<th>정산확정<br />금액</th>
					<th>출금<br />가능액</th>
					<th>상세보기</th>
				</tr>
			</thead>
			<tbody class="text-center">
				<tr>
					<td rowspan="6">20200102</td>
					<td rowspan="5">C_20200101_001</td>
					<td rowspan="5">cubic125@naver.com</td>
					<td>20200101</td>
					<td>auction</td>
					<td>kairoslabxx</td>
					<td>300,000</td>
					<td>6,000</td>
					<td>294,000</td>
					<td>294,000</td>
					<td>294,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_01" /><label for="chk_01"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>gmarket</td>
					<td>kairoslabxx</td>
					<td>700,000</td>
					<td>8,000</td>
					<td>692,000</td>
					<td>692,000</td>
					<td>692,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_02" /><label for="chk_02"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>11st</td>
					<td>kairoslabxx</td>
					<td>600,000</td>
					<td>9,000</td>
					<td>591,000</td>
					<td>591,000</td>
					<td>591,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_03" /><label for="chk_03"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>interpark</td>
					<td>kairoslabxx</td>
					<td>500,000</td>
					<td>6,000</td>
					<td>494,000</td>
					<td>494,000</td>
					<td>494,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_04" /><label for="chk_04"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>naver</td>
					<td>kairoslabxx</td>
					<td>200,000</td>
					<td>3,000</td>
					<td>297,000</td>
					<td>297,000</td>
					<td>297,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_05" /><label for="chk_05"></label></span></td>
				</tr>
				<tr>
					<td colspan="5">합계</td>
					<td>2,300,000</td>
					<td>32,000</td>
					<td>2,268,000</td>
					<td>2,268,000</td>
					<td>2,268,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_all_01" /><label for="chk_all_01"></label></span></td>
				</tr>
				<tr>
					<td rowspan="6">20200102</td>
					<td rowspan="5">C_20200101_001</td>
					<td rowspan="5">cubic125@naver.com</td>
					<td>20200101</td>
					<td>auction</td>
					<td>kairoslabxx</td>
					<td>300,000</td>
					<td>6,000</td>
					<td>294,000</td>
					<td>294,000</td>
					<td>294,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_01" /><label for="chk_01"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>gmarket</td>
					<td>kairoslabxx</td>
					<td>700,000</td>
					<td>8,000</td>
					<td>692,000</td>
					<td>692,000</td>
					<td>692,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_02" /><label for="chk_02"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>11st</td>
					<td>kairoslabxx</td>
					<td>600,000</td>
					<td>9,000</td>
					<td>591,000</td>
					<td>591,000</td>
					<td>591,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_03" /><label for="chk_03"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>interpark</td>
					<td>kairoslabxx</td>
					<td>500,000</td>
					<td>6,000</td>
					<td>494,000</td>
					<td>494,000</td>
					<td>494,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_04" /><label for="chk_04"></label></span></td>
				</tr>
				<tr>
					<td>20200101</td>
					<td>naver</td>
					<td>kairoslabxx</td>
					<td>200,000</td>
					<td>3,000</td>
					<td>297,000</td>
					<td>297,000</td>
					<td>297,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_05" /><label for="chk_05"></label></span></td>
				</tr>
				<tr>
					<td colspan="5">합계</td>
					<td>2,300,000</td>
					<td>32,000</td>
					<td>2,268,000</td>
					<td>2,268,000</td>
					<td>2,268,000</td>
					<td><span class="checkbox checkbox-inline"><input type="checkbox" id="chk_all_01" /><label for="chk_all_01"></label></span></td>
				</tr>
			</tbody>
		</table>
		<div data-widget-group="group1">
			<div class='d-flex justify-content-center'>
				<ul class='pagination'>
					<li class='page-item disabled'><a href='#' class='page-link'><i class='fa fa-angle-double-left'></i></a></li>
					<li class='page-item disabled'><a href='#' class='page-link'><i class='fa fa-angle-left'></i></a></li>
					<li class='page-item active'><a href='#' class='page-link'>1</a></li>
					<li class='page-item'><a href='#' class='page-link'>2</a></li>
					<li class='page-item'><a href='#' class='page-link'>3</a></li>
					<li class='page-item'><a href='#' class='page-link'>4</a></li>
					<li class='page-item'><a href='#' class='page-link'>5</a></li>
					<li class='page-item'><a href='#' class='page-link'>6</a></li>
					<li class='page-item'><a href='#' class='page-link'>7</a></li>
					<li class='page-item'><a href='#' class='page-link'>8</a></li>
					<li class='page-item'><a href='#' class='page-link'>9</a></li>
					<li class='page-item'><a href='#' class='page-link'>10</a></li>
					<li class='page-item'><a href='#' class='page-link'><i class='fa fa-angle-right'></i></a></li>
					<li class='page-item'><a href='#' class='page-link'><i class='fa fa-angle-double-right'></i></a></li>
				</ul>
			</div>
		</div>
		<!--
		-->
	</section>
</div>
				</div>
				 <footer id="footer" class="flex-column text-center">
					ⓒ cubici Co., Ltd.
				 </footer>
			</div>
		</div>
	</div>
</div>
<a href="#" class="scrollup" title="상단으로" alt="top"><!-- <i class="fa fa-angle-up"></i> --><i class="fa fa-angle-up"></i></a>
<script type="text/javascript" src="./assets/js/custom.js?ver=200331_03"></script>
    </body>
</html>
