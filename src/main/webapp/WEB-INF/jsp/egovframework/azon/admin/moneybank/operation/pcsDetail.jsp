<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<sec:authorize access="isAuthenticated()">
    <sec:authentication property="principal" var="principal"/>
</sec:authorize>

<div class="m-tab">
    <ul>
        <li class="active"><a href="javascript:;">프리즘 상세내역</a></li>
    </ul>
</div>

<div class="m-search">
    <div class="modal-wrapper">
        <div class="modal-content">
            <div class="mInner mArticleArea tabArea">
                <div class="conArticle modal w900">
                    <header class="admin-header">
                        <div class="m-options">
                            <h3>기본정보</h3>
                            <div class="pRight">
                                <span class="baseDate pRight"><b>평가 기준일</b>${standardDate}</span>
                            </div>
                        </div>
                    </header>
                    <div class="m-search">
                        <ul>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이름</span>
                                    <div class="input">
                                        <input type="text" value="${userInfo.USER_NM}">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">회원ID</span>
                                    <div class="input">
                                        <input type="text" value="${userInfo.USER_ID}">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">회사명</span>
                                    <div class="input">
                                        <input type="text" value="${userInfo.FIRM_NM}">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="conArticle modal w900">
                    <div class="m-colorTable">
                        <table>
                            <thead>
                            <tr>
                                <th>Prizm</th>
                                <th>평가차원</th>
                                <th>평가항목</th>
                                <th>Data</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th rowspan="14">
                                    <p>${result.prizm_grade}</p>
                                    <span><fmt:formatNumber pattern="0" value="${result.prizm_score}"/></span>
                                </th>
                                <td rowspan="3">기업개요</td>
                                <td>사업기간(개월)</td>
                                <td><fmt:formatNumber value="${result.business_period}" pattern="0"/>개월</td>
                            </tr>
                            <tr>
                                <td>온라인 운영기간(개월)</td>
                                <td><fmt:formatNumber value="${result.operating_period}" pattern="0"/>개월</td>
                            </tr>
                            <tr>
                                <td>(등록) 운영 쇼핑몰 수</td>
                                <td>${result.shop_count}개</td>
                            </tr>
                            <tr class="bg-blueGray">
                                <td rowspan="2">매출지표</td>
                                <td>월매출액(천원)</td>
                                <td><fmt:formatNumber type="number" maxFractionDigits="3" value="${result.monthly_sales_value}"/></td>
                            </tr>
                            <tr class="bg-blueGray">
                                <td>월매출건(개)</td>
                                <td>${result.monthly_sales_quantity}</td>
                            </tr>
                            <tr>
                                <td rowspan="3">정산지표</td>
                                <td>월 정산액(천원)</td>
                                <td><fmt:formatNumber type="number" maxFractionDigits="3" value="${result.monthly_settlement_amount}"/></td>
                            </tr>
                            <tr>
                                <td>주문정산 회수기간(일)</td>
                                <td><fmt:formatNumber pattern="0" value="${result.monthly_settlement_period}"/></td>
                            </tr>
                            <tr>
                                <td>매출 대비 정산율(%)</td>
                                <td><fmt:formatNumber pattern="#.#" value="${result.monthly_settlement_to_sales_rate}"/></td>
                            </tr>
                            <tr class="bg-blueGray">
                                <td rowspan="3">운영지표</td>
                                <td>매출판촉 비율</td>
                                <td><fmt:formatNumber pattern="#.#" value="${result.monthly_promotion_rate}"/></td>
                            </tr>
                            <tr class="bg-blueGray">
                                <td>배송완료기간(일)</td>
                                <td><fmt:formatNumber pattern="0" value="${result.monthly_delivery_period}"/></td>
                            </tr>
                            <tr class="bg-blueGray">
                                <td>구매거부율</td>
                                <td><fmt:formatNumber pattern="#.#" value="${result.monthly_return_rate}"/></td>
                            </tr>
                            <tr>
                                <td rowspan="3">금융건정성지표</td>
                                <td>대표자 신용평점</td>
                                <td>${result.cb_score_current}</td>
                            </tr>
                            <tr>
                                <td>신용평가 전체순위</td>
                                <td>${result.cb_score_rank}</td>
                            </tr>
                            <tr>
                                <td>신용평점 변화율</td>
                                <td>${result.cb_score_change_rate}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="c-boardSet">
                        <div class="button-box">
							<span class="btns" id="evalbtns">
								<button class="bBtn2 sColorN" onclick="javascript:history.back();" type="button">확인</button>
							</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


