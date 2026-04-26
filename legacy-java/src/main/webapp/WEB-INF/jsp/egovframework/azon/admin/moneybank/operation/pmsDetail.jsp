<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div id="Pan-01" class="d-none">
    <div class="pms-table">
        <table>
            <colgroup>
                <col width="19.5%">
                <col width="19.5%">
                <col width="19.5%">
                <col width="19.5%">
                <col width="22%">
            </colgroup>
            <thead>
            <tr class=" bg-white">
                <td class="h55"></td>
                <td class="bg-white"></td>
                <th><b>TODAY</b></th>
                <th><b id="inputDate1"></b></th>
                <th><b id="inputDate2"></b></th>
            </tr>
            </thead>
            <tbody>
            <tr class="bg-sky" id="pmsCoreRisk1">
                <th class="bg-blue" rowspan="2">핵심 리스크 관리</th>
                <th class="h50 fw-300">정산계좌 변경여부</th>
                <td>
                    <div>
                    </div>
                </td>
                <td>
                    <div>
                    </div>
                </td>
                <td>
                    <div>
                    </div>
                </td>
            </tr>
            <tr class="bg-sky" id="pmsCoreRisk2">
                <th class="h50 fw-300">정산입금 결손발생</th>
                <td>
                    <div>
                    </div>
                </td>
                <td>
                    <div>
                    </div>
                </td>
                <td>
                    <div>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="h20 bl-0 br-0" colspan="5"></td>
            </tr>
            <tr>
                <th class="bg-blue" rowspan="3">PMS 종합리스크</th>
                <th class="h55" colspan="3">
                    <b>당 기</b>
                    <span class="fw-300" id="date"></span>
                </th>
                <th>
                    <b>전 기</b>
                </th>
            </tr>
            <tr class="bg-sky">
                <td class="level-c" rowspan="2" id="totalResult"></td>
                <td class="h50">매출리스크</td>
                <td id="salesResult1">
                    <div></div>
                </td>
                <td id="salesResult2">
                    <div></div>
                </td>
            </tr>
            <tr class="bg-sky">
                <td class="h50">운영리스크</td>
                <td id="manageResult1">
                    <div></div>
                </td>
                <td id="manageResult2">
                    <div></div>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</div>