package egovframework.azon.admin.cmmn.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.cmmn.mapper.ManageMemberMapper;
import egovframework.azon.cmmn.cbc.CBCComponent;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.dto.SearchDto;
import egovframework.azon.cmmn.service.FileService;
import egovframework.azon.front.cubici.service.CubiciCmmService;

@Service
public class ManageMemberService {

    @Autowired
    ManageMemberMapper manageMemberMapper;

    @Autowired
    CubiciCmmService cubiciCmmService;

    @Autowired
    FileService fileService;

    @Autowired
    CBCComponent cbcComponent;

    public ArrayList<HashMap<String, Object>> userStatusList(HashMap<String, Object> paramMap) {
        String[] boardSearchKey = SearchDto.UserStatus.getSearchkey();
        paramMap = CubiciUtils.QuotesReplace(boardSearchKey, paramMap);
        return manageMemberMapper.userStatusList(paramMap);
    }

    public HashMap<String, Object> userStatusSum(HashMap<String, Object> paramMap) {
        return manageMemberMapper.userStatusSum(paramMap);
    }

    public HashMap<String, Object> userDetail(String userCode) {
        HashMap<String, Object> resultMap = new HashMap<String, Object>();

		if("null".equals(userCode)) {
			throw new IllegalArgumentException("유저 정보가 올바르지 않습니다.");
		}

        resultMap.putAll(userStatusDetail(userCode));
        resultMap.putAll(operationInfo(userCode));
        resultMap.putAll(getUserEvaluate(userCode));

        return resultMap;
    }

    private HashMap<String, Object> getUserEvaluate(String userCode) {
        HashMap<String, Object> evaluateMap = manageMemberMapper.findEvaluateByObjectNo(userCode);

        if(evaluateMap == null) {
            return new HashMap<>();
        }

        return evaluateMap;
    }

    private HashMap<String, Object> userStatusDetail(String userCode) {
        HashMap<String, Object> resultMap = manageMemberMapper.userStatusDetail(userCode);
        resultMap.put("demand_acc", cbcComponent.toDecryption(String.valueOf(resultMap.get("demand_acc"))));
        resultMap.put("main_acc", cbcComponent.toDecryption((String.valueOf(resultMap.get("main_acc")))));

        return resultMap;
    }

    private HashMap<String, Object> operationInfo(String userCode) {
        HashMap<String, Object> useShopMap = cubiciCmmService.inUserShop(userCode);
        HashMap<String, Object> resultMap = manageMemberMapper.totalSku(useShopMap);
        resultMap.putAll(useShopMap);
        useShopMap.putAll(CubiciUtils.getLastMonth());
        resultMap.putAll(manageMemberMapper.totalSales(useShopMap));
        resultMap.putAll(manageMemberMapper.totalCalculate(useShopMap));

        return resultMap;
    }


    public HashMap<String, Object> userStatusRateDetail(String param) {
        return manageMemberMapper.userStatusRateDetail(param);
    }

    public HashMap<String, Object> userStatusRateTotalDate(String param) {
        return manageMemberMapper.userStatusRateTotalDate(param);
    }

    public void userEvaluateEnroll(HashMap<String, Object> paramMap) {
        HashMap<String, Object> principal = CubiciUtils.AdminAuthentication();
        String reviewer = String.valueOf(principal.get("username"));
        paramMap.put("reviewer", reviewer);
        manageMemberMapper.userEvaluateEnroll(paramMap);
    }

    public void userEvaluateModify(HashMap<String, Object> paramMap) {
        manageMemberMapper.userEvaluateModify(paramMap);
    }

    public ArrayList<HashMap<String, Object>> findPaymentList(HashMap<String, Object> paramMap) {
        return manageMemberMapper.findPaymentList(paramMap);
    }

    public ArrayList<HashMap<String, Object>> findUsageList(HashMap<String, Object> paramMap) {
        String status = String.valueOf(paramMap.get("selectStatusSearch"));
        paramMap.put("status", getMbStatus(status));

        return manageMemberMapper.findUsageList(paramMap);
    }

    private String getMbStatus(String param) {
        String result = "'00', '01', '02', '03', '04', '05', '06', '07', '41'";

        if (param.equals("approval")) {
            result = "'00','01', '02', '03'";
        } else if (param.equals("judge")) {
            result = "'04', '05'";
        } else if (param.equals("repayment")) {
            result = "'06'";
        } else if (param.equals("refuse")) {
            result = "'41'";
        } else if (param.equals("expire")) {
            result = "'07'";
        }
        return result;
    }

    public HashMap<String, Object> getUsageListCount(HashMap<String, Object> paramMap) {
        return manageMemberMapper.getUsageListCount(paramMap);
    }

    public HashMap<String, Object> findMbTab(HashMap<String, Object> paramMap) {
        HashMap<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.putAll(manageMemberMapper.findMbFirstRegDate(paramMap));
        resultMap.putAll(manageMemberMapper.findMbInfo(paramMap));
        resultMap.putAll(manageMemberMapper.findFileCheck(paramMap));
        return resultMap;
    }

    public ArrayList<HashMap<String, Object>> findHistoryList(HashMap<String, Object> paramMap) {
        return manageMemberMapper.findHistoryList(paramMap);
    }
}
