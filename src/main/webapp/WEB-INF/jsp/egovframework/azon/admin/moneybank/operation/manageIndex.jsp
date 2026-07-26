<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>

<!-- 타이틀 -->
<div class="m-tab">
	<ul>
		<li class="active"><a href="javascript:;">지표 관리</a></li>
	</ul>
</div>

<div class="contentGrid">
	<div class="bg-fff">
		<div class="contentGrid">
			<!--PCS 지표-->
			<div class="conArticle">
				<div class="pms-table">
					<table>
						<caption class="caption">PCS 지표</caption>
						<colgroup>
							<col width="100px">
							<col width="140px">
							<col width="70px">
							<col width="75px">
							<col width="15px">
							<col width="75px">
							<col width="75px">
							<col width="15px">
							<col width="75px">
							<col width="75px">
							<col width="15px">
							<col width="75px">
							<col width="75px">
							<col width="15px">
							<col width="75px">
							<col width="75px">
							<col width="15px">
							<col width="75px">
						</colgroup>
						<thead>
							<tr class="bg-white">
								<th rowspan="2" scope="row">차원</th>
								<th rowspan="2" scope="row">평가항목</th>
								<th rowspan="2" scope="row">척도<br> 가중비
								</th>
								<th class="h50" colspan="15" scope="rowgroup">척도 구간 값(Min ~
									Max)</th>
							</tr>
							<tr class="bg-white">
								<th class="h50" colspan="3" scope="rowgroup">1</th>
								<th colspan="3" scope="rowgroup">2</th>
								<th colspan="3" scope="rowgroup">3</th>
								<th colspan="3" scope="rowgroup">4</th>
								<th colspan="3" scope="rowgroup">5</th>
							</tr>
						</thead>
						<tbody>
							<c:forEach items="${pcsItemList}" var="item" varStatus="status">
								<tr class="bg-sky">
									<c:choose>
										<c:when test="${item.SUBJECT_NO==1 and item.ITEM_NO==1}">
											<th class="bg-blue" rowspan="3" scope="rowgroup">기업개요</th>
										</c:when>
										<c:when test="${item.SUBJECT_NO==2 and item.ITEM_NO==1}">
											<th class="bg-blue" rowspan="2" scope="rowgroup">매출지표</th>
										</c:when>
										<c:when test="${item.SUBJECT_NO==3 and item.ITEM_NO==1}">
											<th class="bg-blue" rowspan="3" scope="rowgroup">정산지표</th>
										</c:when>
										<c:when test="${item.SUBJECT_NO==4 and item.ITEM_NO==1}">
											<th class="bg-blue" rowspan="3" scope="rowgroup">운영지표</th>
										</c:when>
										<c:when test="${item.SUBJECT_NO==5 and item.ITEM_NO==1}">
											<th class="bg-blue" rowspan="3" scope="rowgroup">금융건전성<br>
												지표
											</th>
										</c:when>
									</c:choose>
									<th class="h50 fw-400 bg-blue-2" scope="col">${item.ITEM_NM}</th>
									<td><input type="text" value="${item.ITEM_WEIGHT}"></td>
									<td><input type="text"
										value="${fn:replace(item.ITEM_STANDARD1[0],'null','')}"></td>
									<td>~</td>
									<td><input type="text"
										value="${fn:replace(item.ITEM_STANDARD2[0],'null','')}"></td>
									<td><input type="text" value="${item.ITEM_STANDARD1[1]}"></td>
									<td>~</td>
									<td><input type="text" value="${item.ITEM_STANDARD2[1]}"></td>
									<td><input type="text" value="${item.ITEM_STANDARD1[2]}"></td>
									<td>~</td>
									<td><input type="text" value="${item.ITEM_STANDARD2[2]}"></td>
									<td><input type="text" value="${item.ITEM_STANDARD1[3]}"></td>
									<td>~</td>
									<td><input type="text" value="${item.ITEM_STANDARD2[3]}"></td>
									<td><input type="text"
										value="${fn:replace(item.ITEM_STANDARD1[4],'null','')}"></td>
									<td>~</td>
									<td><input type="text"
										value="${fn:replace(item.ITEM_STANDARD2[4],'null','')}"></td>
								</tr>
							</c:forEach>
						</tbody>
					</table>
				</div>
			</div>
			<!--PCS 평가등급-->
			<div class="conArticle">
				<div class="pms-table">
					<table>
						<caption class="caption">PCS 평가등급</caption>
						<colgroup>
							<col width="10%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
							<col width="6%">
						</colgroup>
						<thead>
							<tr class="bg-white">
								<th class="h55" scope="col">평가등급</th>
								<th colspan="3" scope="rowgroup">E</th>
								<th colspan="3" scope="rowgroup">D</th>
								<th colspan="3" scope="rowgroup">C</th>
								<th colspan="3" scope="rowgroup">B</th>
								<th colspan="3" scope="rowgroup">A</th>
							</tr>
						</thead>
						<tbody>
							<tr class="bg-sky">
								<th class="bg-blue h50" scope="col">구간 값</th>
								<c:forEach items="${pcsItemGradeList}" var="item"
									varStatus="status">
									<td><input type="text" value="${item.ITEM_STANDARD1}"></td>
									<td>~</td>
									<td><input type="text" value="${item.ITEM_STANDARD2}"></td>
								</c:forEach>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!--PMS 지표-->
		<!-- 
		
		 -->
		<div class="conArticle">
			<div class="pms-table">
				<table>
					<caption class="caption">PMS 지표</caption>
					<colgroup>
						<col width="80px">
						<col width="160px">
						<col width="70px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
						<col width="55px">
					</colgroup>
					<thead>
						<tr class="bg-white">
							<th rowspan="2" scope="row">차원</th>
							<th rowspan="2" scope="row">평가항목</th>
							<th rowspan="2" scope="row">척도<br> 가중비
							</th>
							<th class="h50" colspan="15" scope="rowgroup">척도 구간 값(Min ~
								Max)</th>
						</tr>
						<tr class="bg-white">
							<th class="h50" colspan="3" scope="rowgroup">1</th>
							<th colspan="3" scope="rowgroup">2</th>
							<th colspan="3" scope="rowgroup">3</th>
							<th colspan="3" scope="rowgroup">4</th>
							<th colspan="3" scope="rowgroup">5</th>
						</tr>
					</thead>
					<tbody>
						<c:forEach items="${pmsItemList}" var="item" varStatus="status">
							<tr class="bg-sky">
								<c:choose>
									<c:when test="${item.SUBJECT_NO==1 and item.ITEM_NO==1}">
										<th class="bg-blue" rowspan="2" scope="rowgroup">핵심리스크</th>
									</c:when>
									<c:when test="${item.SUBJECT_NO==2 and item.ITEM_NO==1}">
										<th class="bg-blue" rowspan="4" scope="rowgroup">매출리스크</th>
									</c:when>
									<c:when test="${item.SUBJECT_NO==3 and item.ITEM_NO==1}">
										<th class="bg-blue" rowspan="4" scope="rowgroup">운영리스크</th>
									</c:when>
								</c:choose>
								<th class="h50 fw-400 bg-blue-2" scope="col">${item.ITEM_NM}</th>
								<td><input type="text" value="${item.ITEM_WEIGHT}"></td>
								<c:choose>
									<c:when test="${item.SUBJECT_NO==1 and item.ITEM_NO==1}">
										<td colspan="3">NO(정상)</td>
										<td colspan="3">YES(경고)</td>
										<td><input type="text" value=""></td>
										<td>~</td>
										<td><input type="text" value=""></td>
										<td><input type="text" value=""></td>
										<td>~</td>
										<td><input type="text" value=""></td>
										<td><input type="text" value=""></td>
										<td>~</td>
										<td><input type="text" value=""></td>
									</c:when>
									<c:when test="${item.SUBJECT_NO==1 and item.ITEM_NO==2}">
										<td colspan="3">NO(정상)</td>
										<td colspan="3">YES(주의)</td>
										<td><input type="text" value=""></td>
										<td>~</td>
										<td><input type="text" value=""></td>
										<td><input type="text" value=""></td>
										<td>~</td>
										<td><input type="text" value=""></td>
										<td><input type="text" value=""></td>
										<td>~</td>
										<td><input type="text" value=""></td>
									</c:when>
									<c:otherwise>
										<td><input type="text" value="${fn:replace(item.ITEM_STANDARD1[0],'null','')}"></td>
										<td>~</td>
										<td><input type="text" value="${fn:replace(item.ITEM_STANDARD2[0],'null','')}"></td>
										<td><input type="text" value="${item.ITEM_STANDARD1[1]}"></td>
										<td>~</td>
										<td><input type="text" value="${item.ITEM_STANDARD2[1]}"></td>
										<td><input type="text" value="${item.ITEM_STANDARD1[2]}"></td>
										<td>~</td>
										<td><input type="text" value="${item.ITEM_STANDARD2[2]}"></td>
										<td><input type="text" value="${item.ITEM_STANDARD1[3]}"></td>
										<td>~</td>
										<td><input type="text" value="${item.ITEM_STANDARD2[3]}"></td>
										<td><input type="text" value="${fn:replace(item.ITEM_STANDARD1[4],'null','')}"></td>
										<td>~</td>
										<td><input type="text" value="${fn:replace(item.ITEM_STANDARD2[4],'null','')}"></td>
									</c:otherwise>
								</c:choose>
								
							</tr>
						</c:forEach>
					</tbody>
				</table>
			</div>
		</div>

		<!--PMS 평가등급-->
		<div class="conArticle">
			<div class="pms-table">
				<table>
					<caption class="caption">PMS 평가등급</caption>
					<colgroup>
						<col width="10%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
						<col width="6%">
					</colgroup>
					<thead>
						<tr class="bg-white">
							<th class="h55">평가등급</th>
							<th colspan="3" scope="rowgroup">E</th>
							<th colspan="3" scope="rowgroup">D</th>
							<th colspan="3" scope="rowgroup">C</th>
							<th colspan="3" scope="rowgroup">B</th>
							<th colspan="3" scope="rowgroup">A</th>
						</tr>
					</thead>
					<tbody>
						<tr class="bg-sky">
							<th class="bg-blue h50" scope="col">구간 값</th>
							<c:forEach items="${pmsItemGradeList}" var="item" varStatus="status">
								<td><input type="text" value="${item.ITEM_STANDARD1}"></td>
								<td>~</td>
								<td><input type="text" value="${item.ITEM_STANDARD2}"></td>
							</c:forEach>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<div class="button-box txt-center">
		<button class="bBtn3 sColorLG pms-btn" type="button">초기화</button>
		<button class="bBtn3 sColorPB pms-btn" type="button">저장</button>
	</div>
</div>
