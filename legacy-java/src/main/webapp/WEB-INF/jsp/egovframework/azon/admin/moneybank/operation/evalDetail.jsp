<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>


<div class="col-10 d-none" id="Pan-02">
    <div class="table-tab m-options">
        <div class="pRight">
            <a href="#" data-toggle="modal" class="rBtn2 sColorGN" id="eval">평가하기</a>
        </div>
    </div>
    <table class="m-shadowTable">
        <thead>
        <tr>
            <th>No.</th>
            <th>일자</th>
            <th>작성자</th>
            <th>구분</th>
            <th>제목</th>
        </tr>
        </thead>
        <tbody id="mbTbody"></tbody>
    </table>
</div>

<div class="modal-container pass nresetClose" id="evaluation">
    <div class="modal-wrapper bg-fff" style="width:530px;">
        <header>
            <h2 class="my">회원평가</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="contentGrid">
            <div class="modal-inner" style="padding-left:40px; padding-right:40px">
                <div class="conArticle modal">
                    <div class="conAtricle-inner">
                        <div class="money-bank-table">
                            <table class="border-gray-1" style="width:450px">
                                <colgroup>
                                    <col style="width:85px">
                                    <col style="width:140px">
                                    <col style="width:85px">
                                    <col style="width:140px">
                                </colgroup>
                                <tr>
                                    <th class="bg-sky border-b-gray-1 border-r-0">작성일자</th>
                                    <td class="border-b-gray-1 border-r-0">
                                        <input class="input-sky-box fw-300" type="text" id="today_date" value="${redemInfo.standardDate}" readonly>
                                    </td>
                                    <th class="bg-sky border-b-gray-1">구분</th>
                                    <td class="border-b-gray-1">
                                        <select class="input-sky-box fw-300" id="EvalMBStatus">
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th class="bg-sky border-b-gray-1">작성자</th>
                                    <td class="border-b-gray-1 border-r-0" colspan="3">
                                        <input class="input-sky-box wid-100p fw-300" type="text" id="admin_nm" value="${admin_nm}" readonly>
                                    </td>
                                </tr>
                                <tr>
                                    <th class="bg-sky">제목</th>
                                    <td colspan="3">
                                        <input class="input-sky-box wid-100p" type="text" id="eval_title" autofocus>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <textarea class="input-sky-box wid-100p fc-blue resize-none" id="eval_detail" style="height: 100px;" autofocus>
                        </textarea>
                        <div class="button-box">
                            <button onclick="modalValid()" id="evalBtn" class="m-big-btn" type="button">평가하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>