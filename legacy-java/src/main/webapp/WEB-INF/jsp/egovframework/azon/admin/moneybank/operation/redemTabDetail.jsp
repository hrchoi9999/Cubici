<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div id="Pan-00">
    <!--상환상세-->
    <div class="conArticle-inner">
        <div class="money-bank-table box-border-blue">
            <table class="register-table type2">
                <tbody>
                <tr class="border-bottom-g ">
                    <td class="border-r-none">
                        <label class="txt-none">상태</label>
                        <select class="wide2" id="status">
                            <option value="" selected> 상태</option>
                            <option value="deposit">입금</option>
                            <option value="redem">상환</option>
                        </select>
                    </td>
                    <td class="border-r-none">
                        <label class="txt-none">전체쇼핑몰</label>
                        <select class="wide2" id="shop" disabled>
                            <option selected> 전체쇼핑몰</option>
                        </select>
                    </td>
                    <td class="border-r-none ">
                        <label><b class="square-txt color-blue">기간검색</b></label>
                        <input type="date" id="fromDate" required> ~
                        <input type="date" id="toDate" required>
                    </td>
                    <td class="border-r-none">
                        <label class="txt-none">도매몰</label>
                        <select class="m-r-0 w150" id="dataLimit">
                            <option value="10">10줄 보기</option>
                            <option value="30" selected>30줄 보기</option>
                            <option value="50">50줄 보기</option>
                        </select>
                    </td>
                    <td class="border-r-none">
                        <button type="button" class="m-l-10 w130 t-big-btn bg-0e57bf" id="searchBtn">검색</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="money-bank-table table-border">
            <table class="redem-table">
                <thead class="bg-blue">
                <tr>
                    <th class="w80" rowspan="2" colspan="2">구분</th>
                    <th class="w100" rowspan="2">일자</th>
                    <th class="w190" rowspan="2">머니플러스 선정산 원금 입금</th>
                    <th class="w120" rowspan="2">쇼핑몰 정산금액</th>
                    <th class="w250" colspan="3">상세 상환 내역</th>
                    <th class="w200" colspan="2">반환 내역</th>
                    <th class="w190" rowspan="2">머니플러스 선정산 원금 잔액</th>
                </tr>
                <tr>
                    <th>원금상환</th>
                    <th>이용수수료</th>
                    <th>송금수수료</th>
                    <th>반환일자</th>
                    <th style="border-right: 1px solid #b8d4ff;">반환금액</th>
                </tr>
                </thead>
                <tbody id="tbody" class="text-center color-blue2">
                </tbody>
            </table>
        </div>
    </div>
</div>