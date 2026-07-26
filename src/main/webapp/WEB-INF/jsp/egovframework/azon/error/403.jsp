<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko" xml:lang="ko">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" href="/resources/rudicks/css/style-sub.css" />
	<link rel="shortcut icon" href="/resources/assets/images/favicon.png">
	<title>Cubici - Page not Found</title>
</head>

<body>
   <div class="notfound-box">
      <div class="notfound-inner">
         <h2>PAGE NOT FOUND</h2>
         <p>죄송합니다. 요청하신 페이지를 찾을 수 없습니다.</p>
         <p>
            방문하시려는 페이지의 주소가 잘못 입력되었거나, 페이지의 주소가 변경 혹은 삭제되어 요청하신 페이지를 찾을 수 없습니다.<br />
            입력하신 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.<br /> 관련 문의사항은 큐빅아이 고객센터에 알려주시면
            친절하게 안내해 드리겠습니다.<br /> 감사합니다.
         </p>
         <div class="btn-box">
            <a class="big-btn" href="/board/qa/index">고객센터</a>
            <c:choose>
	            <c:when test="{principal.admin_type eq '00'}">
	            	<a class="big-btn" href="/admin/cubici/infoIntegrated/cubici_tab1">메인으로</a>
	            </c:when>
	            <c:when test="{principal.admin_type eq '01'}">
	            	<a class="big-btn" href="/admin/moneybank/FI33/management/info_tab1">메인으로</a>
	            </c:when>
	            <c:when test="{principal.admin_type eq '02'}">
	            	<a class="big-btn" href="/admin/moneybank/hellopay/management/info_tab1">메인으로</a>
	            </c:when>
	            <c:otherwise>
	            	<a class="big-btn" href="/">메인으로</a>
	            </c:otherwise>
            </c:choose>
         </div>
      </div>
   </div>
</body>
</html>