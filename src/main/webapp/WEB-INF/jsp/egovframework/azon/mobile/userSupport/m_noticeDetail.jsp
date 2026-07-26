<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style type="text/css">
	.boardList_td{color: #000000; text-align:center; font-size:15px; padding:2px; border-bottom:1px solid #ddd;}
	.boardList_td2{text-align:center; border-bottom:1px solid #ddd;}
	.boardList_td3{text-align:left; font-size:15; border-bottom:1px solid #ddd;}
</style>
<!-- Page 상단  끝 -->
<div>
	<div style="font-size: 14px; text-align: left;">
			<table style="font-size: 14px; border-collapse: separate; border-spacing: 0 2px; margin-left: 5px; margin-right: auto;">
				<colgroup>
					<col width="20%">
					<col width="80%">
				</colgroup>
				<tbody>
					<tr>
						<td colspan="2" style="font-size:15px; padding:0 0 10px 0; border-top:1.5px solid #696969;">${resultList.TITLE}<br>
							<span style="font-size:10px; color:#A9A9A9;" >작성자:${resultList.USER_NM} &nbsp;&nbsp;|&nbsp;&nbsp; 등록일:${resultList.REG_DATE}</span>
						</td>
					</tr>
					<tr>
						<td colspan="2" valign="top" align="left" style="border-bottom:1.5px solid #696969; text-align: left; padding:10px 0 0 0; height:600px; border-top:1px solid #ddd; font-size:8px;">${resultList.CONTENT}</td>
					</tr>
				</tbody>
			</table>
			<div style="width: 79%; margin: auto; text-align: end; padding-top:10px;">
				<button type="button" style="font-size: 12px;padding: 13px;line-height: 0.1rem;" class="sBtn rBtn sColorLG" onclick="history.back();">목록</button>
			</div>
		</div>
</div>
