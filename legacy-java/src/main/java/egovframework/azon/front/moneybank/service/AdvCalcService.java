package egovframework.azon.front.moneybank.service;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import javax.transaction.Transactional;

import egovframework.azon.cmmn.dto.SmsDto;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ibm.icu.util.Calendar;

import egovframework.azon.admin.cmmn.mapper.ManageMemberMapper;
import egovframework.azon.cmmn.cbc.CBCComponent;
import egovframework.azon.cmmn.component.CubiciComponent;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.FileException;
import egovframework.azon.cmmn.exception.MoneyBankException;
import egovframework.azon.cmmn.moneybank.api.service.MoneybankDocumentAPIService;
import egovframework.azon.cmmn.moneybank.service.MoneybankCmmService;
import egovframework.azon.cmmn.service.FileService;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.moneybank.mapper.AdvCalcMapper;

@Service
public class AdvCalcService {

    @Value("#{properties['MBRequestFilePath']}")
    private String MBRequestFilePath;

    @Autowired
    ManageMemberMapper adminManageMemberMapper;

    @Autowired
    CBCComponent cbcComponent;

    @Autowired
    FileService fileService;

    @Autowired
    CubiciComponent cubiciComponent;

    @Autowired
    CubiciCmmService cubiciCmmService;

    @Autowired
    MoneybankCmmService moneybankCmmService;

    @Autowired
    AdvCalcMapper advCalcMapper;

    @Autowired
    MoneybankDocumentAPIService moneybankDocumentAPIService;

    private final SmsDto sd = new SmsDto();

    private final String mbProductCode = "MP";

    public void calcRequestPost() {
        if (cubiciComponent.isUserTypeCheck("02")) {
            throw new MoneyBankException(MoneyBankErrorCode.MoneyBankServiceOverlap);
        } else if (!cubiciComponent.isUserTypeCheck("01")) {
            throw new MoneyBankException(MoneyBankErrorCode.UserTermination);
        }
    }

    @Transactional
    public boolean isAdvanceRequest(HashMap<String, Object> paramMap) throws ParseException {
        String userCode = String.valueOf(paramMap.get("user_code"));
        String regNoFirst = String.valueOf(paramMap.get("reg_no_first"));
        String regNoSecond = String.valueOf(paramMap.get("reg_no_second"));
        String birthDate = String.valueOf(paramMap.get("birth_date"));
        String shops = String.valueOf(paramMap.get("shop_arr"));
        boolean isDriver = "driver-license".equals(String.valueOf(paramMap.get("type")));
        boolean isRegNo = "reg-no".equals(String.valueOf(paramMap.get("type")));

        advanceRequestCheck(userCode);

        String encryptedRegNoFirst = cbcComponent.toEncryption(regNoFirst);
        String encryptedRegNoSecond = cbcComponent.toEncryption(regNoSecond);

        if (isDriver) {
            DriverLicenseApi(paramMap);
            regNoFirst = birthDate;
            regNoSecond = null;
            encryptedRegNoFirst = cbcComponent.toEncryption(birthDate.substring(1));
            encryptedRegNoSecond = null;
        } else if (isRegNo) {
            regNoApi(paramMap);
        } else {
            throw new MoneyBankException(MoneyBankErrorCode.AdvanceRequestTypeError);
        }

        HashMap<String, Object> advanceRequestMap = proceedAdvanceRequest(userCode, cubiciComponent.getAge(regNoFirst, regNoSecond));

        if (!"Y".equals(advanceRequestMap.get("mb_check_success"))) {
            return false;
        }

        saveMbRequest(userCode, encryptedRegNoFirst, encryptedRegNoSecond, String.valueOf(advanceRequestMap.get("mb_sales_amount")), shops);
        return true;
    }

    private void regNoApi(HashMap<String, Object> paramMap) throws ParseException {
        HashMap<String, Object> apiMap = new HashMap<>();

        apiMap.put("ownerNm", String.valueOf(CubiciUtils.UserAuthentication().get("username")));
        apiMap.put("juminNo", String.valueOf(paramMap.get("reg_no_first")) + String.valueOf(paramMap.get("reg_no_second")));
        apiMap.put("issueDt", String.valueOf(paramMap.get("issueDate")));

        moneybankDocumentAPIService.hasSelfAuth(apiMap);
    }

    private void DriverLicenseApi(HashMap<String, Object> paramMap) throws ParseException {
        HashMap<String, Object> apiMap = new HashMap<>();

        apiMap.put("ownerNm", String.valueOf(CubiciUtils.UserAuthentication().get("username")));
        apiMap.put("juminNo", String.valueOf(paramMap.get("birth_date")));
        apiMap.put("licence01", String.valueOf(paramMap.get("licence01")));
        apiMap.put("licence02", String.valueOf(paramMap.get("licence02")));
        apiMap.put("licence03", String.valueOf(paramMap.get("licence03")));
        apiMap.put("licence04", String.valueOf(paramMap.get("licence04")));
        apiMap.put("serialNo", String.valueOf(paramMap.get("serialNo")));

        moneybankDocumentAPIService.hasDriverAuth(apiMap);
    }

    private HashMap<String, Object> proceedAdvanceRequest(String userCode, int age) {
        HashMap<String, Object> resultMap = new HashMap<>();

        HashMap<String, Object> totalSalesMap = cubiciCmmService.inUserShop(userCode);
        totalSalesMap.putAll(CubiciUtils.getLastMonth());

        int mbSalesAmount = Integer.parseInt(String.valueOf(adminManageMemberMapper.totalSales(totalSalesMap).get("ORDER_PRICE")).replaceAll(",", ""));
        resultMap.put("mb_sales_amount", mbSalesAmount);

        HashMap<String, Object> advanceMap = findAdvanceRequestByUserCode(userCode, age);
        advCalcMapper.advanceReqeustInsert(advanceMap);

        resultMap.put("mb_check_success", String.valueOf(advanceMap.get("mb_check_success")));
        return resultMap;
    }

    private void advanceRequestCheck(String userCode) {
        HashMap<String, Object> checkMap = advCalcMapper.advanceRequestCheck(userCode);

        String advanceReqCheck = String.valueOf(checkMap.get("advance_req_check"));

        if (advanceReqCheck.equals("Y")) {
            throw new MoneyBankException(MoneyBankErrorCode.AlreadyAdvanceRequestSuccess);
        } else if (advanceReqCheck.equals("N")) {
            throw new MoneyBankException(MoneyBankErrorCode.AlreadyAdvanceRequestfailer);
        } else if (Boolean.parseBoolean(String.valueOf(advCalcMapper.RequestAcceptCheck(userCode).get("isAdvanceRequest")))) {
            throw new MoneyBankException(MoneyBankErrorCode.AdvanceRequest);
        }
    }

    private HashMap<String, Object> findAdvanceRequestByUserCode(String userCode, int age) {
        HashMap<String, Object> requestMap = new HashMap<>();
        requestMap.put("user_code", userCode);
        requestMap.put("mb_user_age", age);

        return advCalcMapper.advanceRequest(requestMap);
    }

    private void saveMbRequest(String userCode, String regNoFirst, String regNoSecond, String mbSalesAmount, String shops) {
        HashMap<String, Object> resultMap = new HashMap<>();

        String mbid = createMBId(mbProductCode);
        resultMap.put("mbid", mbid);
        resultMap.put("user_code", userCode);
        resultMap.put("mb_product_code", mbProductCode);
        resultMap.put("reg_no_first", regNoFirst);
        resultMap.put("reg_no_second", regNoSecond);
        resultMap.put("mb_sales_amount", mbSalesAmount);

        advCalcMapper.MBReqeustInsert(resultMap);
        inputRequestShop(mbid, userCode, CubiciUtils.toArrayList(String.valueOf(shops)));
        updateMbRole();
    }

    private String createMBId(String goods) {
        LocalDateTime currentDate = LocalDateTime.now();
        String formattedDate = currentDate.format(DateTimeFormatter.ofPattern("MMddyy"));

        int month = currentDate.getMonthValue();
        String dayYear = formattedDate.substring(2);

        return String.format("%s%s%s%s", goods, CubiciUtils.getMonthByAlpa(month), dayYear, createSerialNum(goods));
    }

    private String createSerialNum(String param) {
        String findMBId = advCalcMapper.findMBId(param);

        if (CubiciUtils.StringEmpty(findMBId)) {
            return "001";
        }

        return String.format("%03d", Integer.parseInt(findMBId.substring(7)) + 1);
    }

    private void inputRequestShop(String mbid, String userCode, List<String> shopArr) {
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("userCode", userCode);
        paramMap.put("shopArr", shopArr);

        advCalcMapper.findAccountList(paramMap).forEach(v -> registerRequestShop(mbid, v));
    }

    private void updateMbRole() {
        HashMap<String, Object> requestMap = new HashMap<>();
        requestMap.put("addRole", new String[]{"ROLE_MB_REQUEST"});
        requestMap.put("removeRole", new String[]{"ROLE_MB_ADVANCE"});
        moneybankCmmService.updateAuth(requestMap);
    }

    private void MBRequestFileInsert(String mbid, String fileDivision, List<MultipartFile> fileList) throws FileException, IOException {
        if (fileList.isEmpty()) {
            throw new MoneyBankException(MoneyBankErrorCode.RequestFileNotFind);
        }
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("enc_type", "Y");
        paramMap.put("file_division", fileDivision);
        paramMap.put("file_division_pk", mbid);
        fileService.fileUpload(paramMap, fileList, MBRequestFilePath);
    }

    private void registerRequestShop(String mbid, HashMap<String, Object> shopMap) {
        HashMap<String, Object> paramMap = new HashMap<>();

        paramMap.put("mbid", mbid);
        paramMap.put("mb_request_shop", String.valueOf(shopMap.get("CODE_E_NM")));
        paramMap.put("mb_request_shop_type", String.valueOf(shopMap.get("SHOP_TYPE")));
        paramMap.put("mb_request_shop_id", String.valueOf(shopMap.get("SHOP_ID")));

        advCalcMapper.requestShopInsert(paramMap);
    }

    public void settleAccSendSms() {
        HashMap<String, Object> paramMap = new HashMap<>();
        HashMap<String, Object> principal = CubiciUtils.UserAuthentication();

        String userPhone = cubiciCmmService.findUserPhone(String.valueOf(principal.get("user_code")));
        paramMap.put("USER_PHONE", userPhone);
        paramMap.put("SMS_CODE", "15");

        String[] smsArr = new String[1];

        cubiciCmmService.sendSms(paramMap, smsArr);
    }

    @Transactional
    public void requestAccept(HashMap<String, Object> paramMap, List<MultipartFile> fileList) throws FileException, IOException, ParseException {
        if (String.valueOf(paramMap.get("signCert")).equals("null") || String.valueOf(paramMap.get("signPri")).equals("null")) {
            throw new MoneyBankException(MoneyBankErrorCode.CheckPassword);
        }
        isApproval("00");

        HashMap<String, Object> acceptCheckMap = advCalcMapper.RequestAcceptCheck(String.valueOf(paramMap.get("user_code")));
        hasAccount(paramMap);

        if (!Boolean.parseBoolean(String.valueOf(acceptCheckMap.get("isAdvanceRequest")))) {
            throw new MoneyBankException(MoneyBankErrorCode.NotAdvanceRequest);
        }

        String mbid = String.valueOf(acceptCheckMap.get("mbid"));
        paramMap.put("mbid", mbid);
        paramMap.put("mb_demand_acc_number", cbcComponent.toEncryption(String.valueOf(paramMap.get("mb_demand_acc_number"))));
        paramMap.put("mb_main_acc_number", cbcComponent.toEncryption(String.valueOf(paramMap.get("mb_main_acc_number"))));
        paramMap.put("mbStatus", "00");
        paramMap.put("changeStatus", "01");

        String[] addRole = {"ROLE_MB_EVALUATE"};
        String[] removeRole = {"ROLE_USER_REQUEST"};
        paramMap.put("addRole", addRole);
        paramMap.put("removeRole", removeRole);

        moneybankDocumentAPIService.inputApiDocument(createDocumentApiMap(paramMap));

        String[] fileDivision = {"duplicateMain", "duplicateDemand", "consentFile"};
        for (int i = 0; i < fileList.size(); i++) {
            List<MultipartFile> list = new ArrayList<>();
            list.add(fileList.get(i));
            MBRequestFileInsert(mbid, fileDivision[i], list);
        }

        updateMbStatus(paramMap);
    }

    private void hasAccount(HashMap<String, Object> paramMap) throws ParseException {
        ArrayList<HashMap<String, Object>> resultList = new ArrayList<>();
        HashMap<String, Object> apiMap = new HashMap<>();

        modifyBankApiMap(apiMap, paramMap);

        String[] demand = {"mb_demand_acc_bank_code", "mb_demand_acc_number"};
        String[] main = {"mb_main_acc_bank_code", "mb_main_acc_number"};

        resultList.add(createBankApiMap(apiMap, paramMap, demand, "demand"));
        resultList.add(createBankApiMap(apiMap, paramMap, main, "main"));

        moneybankDocumentAPIService.createPrivateAccount(resultList);
    }

    private void modifyBankApiMap(HashMap<String, Object> apiMap, HashMap<String, Object> paramMap) {
        String prikey = String.valueOf(paramMap.get("signPri"));
        prikey = prikey.replace("-----BEGIN ENCRYPTED PRIVATE KEY-----", "");
        prikey = prikey.replace("-----END ENCRYPTED PRIVATE KEY-----", "");
        prikey = prikey.replaceAll("\n", "");

        String certkey = String.valueOf(paramMap.get("signCert"));
        certkey = certkey.replace("-----BEGIN CERTIFICATE-----", "");
        certkey = certkey.replace("-----END CERTIFICATE-----", "");
        certkey = certkey.replaceAll("\n", "");

        apiMap.put("gubun", "01");
        apiMap.put("loginMethod", "CERT");
        apiMap.put("signCert", certkey);
        apiMap.put("signPri", prikey);
        apiMap.put("signPw", String.valueOf(paramMap.get("signPw")));
    }

    private HashMap<String, Object> createBankApiMap(HashMap<String, Object> apiMap, HashMap<String, Object> paramMap, String[] keyarr, String division) {
        HashMap<String, Object> resultMap = new HashMap<>();

        apiMap.put("division", division);
        apiMap.put("bankCd", String.valueOf(paramMap.get(keyarr[0])));
        apiMap.put("acctNo", String.valueOf(paramMap.get(keyarr[1])));
        resultMap.putAll(apiMap);

        return resultMap;
    }

    private HashMap<String, Object> createDocumentApiMap(HashMap<String, Object> paramMap) {
        HashMap<String, Object> apiMap = new HashMap<>();

        apiMap.put("mbid", String.valueOf(paramMap.get("mbid")));
        apiMap.put("signCert", String.valueOf(paramMap.get("signCert")));
        apiMap.put("signPri", String.valueOf(paramMap.get("signPri")));
        apiMap.put("signPw", String.valueOf(paramMap.get("signPw")));

        return apiMap;
    }

    public void isApprovalTermsOfUse(HashMap<String, Object> params) {
        isApproval("04");
        String status = String.valueOf(params.get("status"));
        String changeStatus = "51";
        String strAddRole = "ROLE_MB_ADVANCE";

        if (status.equals("Approval")) {
            changeStatus = "05";
            strAddRole = "ROLE_MB_CONTRACT";
            params.put("SMS_CODE", "06");
            params.put("USER_PHONE", "01037846802");
            params.put("fromDate", CubiciUtils.defaultSetDate().get("todayDateTime"));
            params.put("toDate", cubiciCmmService.bizDay().get("tomorrow"));
            cubiciCmmService.sendSms(params, sd.getSmsNewContract());
        }

        String[] addRole = {strAddRole};
        String[] removeRole = {"ROLE_MB_EVALUATE"};

        params.put("changeStatus", changeStatus);
        params.put("addRole", addRole);
        params.put("removeRole", removeRole);
        updateMbStatus(params);
    }

    private void updateMbStatus(HashMap<String, Object> params) {
        advCalcMapper.modifyRequestStatusByMbStatus(params); // 계약상태 업데이트
        moneybankCmmService.updateAuth(params);
    }

    private void isApproval(String status) {
        String mbStatus = "";
        if (advCalcMapper.getMoneybankRequestInfo(CubiciUtils.UserAuthentication()) != null) {
            mbStatus = String.valueOf(advCalcMapper.getMoneybankRequestInfo(CubiciUtils.UserAuthentication()).get("mb_status"));
        }
        if (!mbStatus.equals(status)) {
            if (status.equals("00") && mbStatus.equals("")) {
                throw new MoneyBankException(MoneyBankErrorCode.NotAdvanceRequest);
            } else {
                throw new MoneyBankException(MoneyBankErrorCode.AbnormalApproach);
            }
        }
    }

    public ArrayList<HashMap<String, Object>> getRedemDetailList(HashMap<String, Object> paramMap) {
        String status = String.valueOf(paramMap.get("status"));
        if (status.equals("redem")) status = "상환";
        else if (status.equals("deposit")) status = "입금";
        else status = "";
        paramMap.put("status", status);
        return advCalcMapper.getRedemDetailList(paramMap);
    }

    public HashMap<String, Object> getRedemDetailSum(HashMap<String, Object> paramMap) {
        return advCalcMapper.getRedemDetailSum(paramMap);
    }
}
