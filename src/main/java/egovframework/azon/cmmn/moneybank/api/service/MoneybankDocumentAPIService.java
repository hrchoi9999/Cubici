package egovframework.azon.cmmn.moneybank.api.service;

import java.util.*;

import egovframework.azon.cmmn.cbc.CBCComponent;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.MoneyBankException;
import egovframework.azon.cmmn.moneybank.api.MoneybankDocumentAPI;
import egovframework.azon.cmmn.moneybank.api.component.MoneybankDocumentAPIComponent;
import egovframework.azon.cmmn.moneybank.api.mapper.MoneybankDocumentAPIMapper;
import org.springframework.util.StringUtils;

@Service
public class MoneybankDocumentAPIService {
    Logger logger = LoggerFactory.getLogger(MoneybankDocumentAPIService.class);

    //향후 로그 방식 변경
    private final String[] commonLogParam = {"errMsg", "errYn"};
    private final String[] driverLicenseLogParam = {"name", "licenceTruthYn", "licenceTruthMsg", "serialNoTruthYn", "serialNoTruthMsg", "searchTime"};
    private final String[] accLogParam = {"errMsg"};

    @Autowired
    MoneybankDocumentAPI moneybankDocumentAPI;

    @Autowired
    MoneybankDocumentAPIComponent moneybankDocumentAPIComponent;

    @Autowired
    MoneybankDocumentAPIMapper moneybankDocumentAPIMapper;

    @Autowired
    CBCComponent cbcComponent;

    public void hasSelfAuth(HashMap<String, Object> paramMap) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject res = (JSONObject) jsonParser.parse(moneybankDocumentAPI.hyphenAPI("/in0005000233", paramMap));
        JSONObject common = (JSONObject) res.get("common");

        inputHyphenApiLog(commonLogParam, common);
        validateSelfAuth(common);
    }

    private void validateSelfAuth(JSONObject common) {
        String errYn = String.valueOf(common.get("errYn"));
        String errMsg = String.valueOf(common.get("errMsg"));

        if (errYn.equals("Y")) {
            if (errMsg.startsWith("B0001-N01")) {
                throw new MoneyBankException(MoneyBankErrorCode.NetworkError);
            } else {
                throw new MoneyBankException(MoneyBankErrorCode.HyphenApiResError);
            }
        }
    }

    public void hasDriverAuth(HashMap<String, Object> paramMap) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject res = (JSONObject) jsonParser.parse(moneybankDocumentAPI.hyphenAPI("/in0072000230", paramMap));
        JSONObject common = (JSONObject) res.get("common");
        JSONObject data = (JSONObject) res.get("data");

        inputHyphenApiLog(commonLogParam, common);
        inputHyphenApiLog(driverLicenseLogParam, data);
        validateDriverAuth(common, data);
    }

    private void validateDriverAuth(JSONObject common, JSONObject data) {
        String errYn = String.valueOf(common.get("errYn"));
        String licenceTruthYn = String.valueOf(data.get("licenceTruthYn"));
        String serialNoTruthYn = String.valueOf(data.get("serialNoTruthYn"));

        if ("Y".equals(errYn) || !"Y".equals(licenceTruthYn) || !"Y".equals(serialNoTruthYn)) {
            throw new MoneyBankException(MoneyBankErrorCode.DriverLicenseInvalid);
        }
    }

    public void createPrivateAccount(ArrayList<HashMap<String, Object>> paramList) throws ParseException {
        for (HashMap<String, Object> paramMap : paramList) {
            JSONParser jsonParser = new JSONParser();
            JSONObject res = (JSONObject) jsonParser.parse(moneybankDocumentAPI.hyphenAPI("/in0087000484", paramMap));
            JSONObject common = (JSONObject) res.get("common");

            inputHyphenApiLog(accLogParam, common);
            validatePrivateAccount(common);
        }
    }

    private void validatePrivateAccount(JSONObject common) {
        if (!String.valueOf(common.get("errYn")).equals("N")) {
            accountException(String.valueOf(common.get("errMsg")).substring(1, 10));
        }
    }

    private void accountException(String errMsg) {
        switch (errMsg) {
            case "LOGIN-C01":
                throw new MoneyBankException(MoneyBankErrorCode.CertLoginError);
            case "B0002-M03":
                throw new MoneyBankException(MoneyBankErrorCode.BankInformationError);
            case "B0001-999":
            case "B0002-999":
                throw new MoneyBankException(MoneyBankErrorCode.ProcessingError);
            case "LOGIN-R99":
                throw new MoneyBankException(MoneyBankErrorCode.NotRegisteredCertificate);
            default:
                throw new MoneyBankException(MoneyBankErrorCode.HyphenApiResError);
        }
    }

    public void inputApiDocument(HashMap<String, Object> paramMap) throws ParseException {
        HashMap<String, Object> documentMap = new HashMap<>();
        String mbid = String.valueOf(paramMap.get("mbid"));

        documentMap.put("mbid", mbid);
        documentMap.putAll(createBizInfo(moneybankDocumentAPIComponent.createBizMap(paramMap, getFirmInfo(mbid))));
        documentMap.putAll(createNationalTax(moneybankDocumentAPIComponent.createNationMap(paramMap)));
        documentMap.putAll(createLocalTax(moneybankDocumentAPIComponent.createLocalTaxMap(paramMap)));
        documentMap.putAll(createHealthPayment(moneybankDocumentAPIComponent.createHealthMap(paramMap, getRegNo(mbid))));

        moneybankDocumentAPIMapper.inputDocument(documentMap);
    }

    private HashMap<String, Object> getFirmInfo(String mbid) {
        return moneybankDocumentAPIMapper.getFirmInfo(mbid);
    }

    private HashMap<String, Object> createBizInfo(HashMap<String, Object> paramMap) {
        HashMap<String, Object> resultMap = new HashMap<>();

        try {
            JSONParser jsonParser = new JSONParser();
            JSONObject res = (JSONObject) jsonParser.parse(moneybankDocumentAPI.hyphenAPI("/in0076000245", paramMap));
            JSONObject common = (JSONObject) res.get("common");
            JSONObject data = (JSONObject) res.get("data");

            validateBizInfo(common, data, resultMap, paramMap);
        } catch (ParseException e) {
            logger.debug(" [ ERROR ] [ MoneybankDocumentAPIService/createBizInfo ] " + e.getMessage());
        }
        return resultMap;
    }

    private void validateBizInfo(JSONObject common, JSONObject data, HashMap<String, Object> resultMap, HashMap<String, Object> paramMap) {
        inputHyphenApiLog(commonLogParam, common);

        if (String.valueOf(common.get("errYn")).equals("N")) {
            successBizInfo(common, data, resultMap, paramMap);
        } else {
            bizInfoException(CubiciUtils.findBetweenFirstWords(String.valueOf(common.get("errMsg")), "[", "]"));
        }
    }

    private void successBizInfo(JSONObject common, JSONObject data, HashMap<String, Object> resultMap, HashMap<String, Object> paramMap) {
        Map<String, Object> bizMap = iterateBizInfo((JSONArray) data.get("bmanBscInfrInqrDVOList"), resultMap, paramMap);

        if (bizMap.isEmpty()) {
            bizInfoException(CubiciUtils.findBetweenFirstWords(String.valueOf(common.get("errMsg")), "[", "]"));
        }
        resultMap.put("tax_type", String.valueOf(data.get("txprClsfCd")));
    }

    private Map<String, Object> iterateBizInfo(JSONArray dataArr, HashMap<String, Object> resultMap, HashMap<String, Object> paramMap) {
        for (Object o : dataArr) {
            JSONObject jObject = (JSONObject) o;
            if (jObject.get("txprNm").equals(paramMap.get("firm_nm")) && jObject.get("txprDscmNoEncCntn").equals(paramMap.get("firm_id"))) {
                resultMap.put("biz_start_date", String.valueOf((jObject.get("txprDscmDt"))));
                resultMap.put("biz_no", String.valueOf(paramMap.get("firm_id")));
                return resultMap;
            }
        }
        throw new MoneyBankException(MoneyBankErrorCode.CompanyNameInconsistent);
    }

    private void bizInfoException(String errMsg) {
        if (errMsg.equals("LOGIN-014")) {
            throw new MoneyBankException(MoneyBankErrorCode.NotCertRegistered);
        } else if (errMsg.equals("LOGIN-021")) {
            throw new MoneyBankException(MoneyBankErrorCode.BizNoNotMatch);
        } else {
            throw new MoneyBankException(MoneyBankErrorCode.UnidentifiedError);
        }
    }

    private HashMap<String, Object> createNationalTax(HashMap<String, Object> paramMap) throws ParseException {
        HashMap<String, Object> resultMap = new HashMap<>();
        JSONParser jsonParser = new JSONParser();
        JSONObject res = (JSONObject) jsonParser.parse(moneybankDocumentAPI.hyphenAPI("/in0005000223", paramMap));
        JSONObject common = (JSONObject) res.get("common");

        validateNationalTax(common);

        return successNationalTax(res, resultMap);
    }

    private void validateNationalTax(JSONObject common) {
        inputHyphenApiLog(commonLogParam, common);

        if (!String.valueOf(common.get("errYn")).equals("N")) {
            throw new MoneyBankException(MoneyBankErrorCode.CertLoginError);
        }
    }

    private HashMap<String, Object> successNationalTax(JSONObject res, HashMap<String, Object> resultMap) {
        JSONObject data = (JSONObject) res.get("data");
        JSONArray reprieveList = (JSONArray) data.get("reprieveList");
        JSONArray defaultList = (JSONArray) data.get("defaultList");
        String nationalTax = "";

        if (reprieveList.isEmpty() && defaultList.isEmpty()) {
            nationalTax = "Y";
        } else {
            nationalTax = "N";
        }
        resultMap.put("national_tax_full_payment", nationalTax);

        return resultMap;
    }

    private HashMap<String, Object> createLocalTax(HashMap<String, Object> paramMap) throws ParseException {
        HashMap<String, Object> resultMap = new HashMap<>();
        JSONParser jsonParser = new JSONParser();
        JSONObject res = (JSONObject) jsonParser.parse(moneybankDocumentAPI.hyphenAPI("/in0005000198", paramMap));
        JSONObject common = (JSONObject) res.get("common");

        validateLocalTax(common);

        return successLocalTax(res, resultMap);
    }

    private void validateLocalTax(JSONObject common) {
        if (!String.valueOf(common.get("errYn")).equals("N")) {
            throw new MoneyBankException(MoneyBankErrorCode.CertLoginError);
        }
    }

    private HashMap<String, Object> successLocalTax(JSONObject res, HashMap<String, Object> resultMap) {
        JSONObject data = (JSONObject) res.get("data");
        String cappReqNo = String.valueOf(data.get("CappReqNo"));
        String localTax = "";

        if (cappReqNo.equals("null") || CubiciUtils.StringEmpty(cappReqNo)) {
            localTax = "N";
        } else {
            localTax = "Y";
        }
        resultMap.put("local_tax_full_payment", localTax);

        return resultMap;
    }

    private String getRegNo(String mbid) {
        HashMap<String, Object> regNo = moneybankDocumentAPIMapper.getRegNo(mbid);
        String regNoFirst = cbcComponent.toDecryption(String.valueOf(regNo.get("reg_no_first")));
        String regNoSecond = String.valueOf(regNo.get("reg_no_second"));

        if("null".equals(regNoSecond)) {
            regNoSecond = "";
        } else if (StringUtils.hasText(regNoSecond)) {
            regNoSecond = cbcComponent.toDecryption(regNoSecond);
        }

        return regNoFirst + regNoSecond;
    }

    /**
     * 필요 유무의 이슈로 인해서 보류 결과값 항상 Y
     */
    private HashMap<String, Object> createHealthPayment(HashMap<String, Object> paramMap) throws ParseException {
        HashMap<String, Object> resultMap = new HashMap<>();
        /*JSONParser jsonParser = new JSONParser();
        JSONObject res = (JSONObject) jsonParser.parse(moneybankDocumentAPI.hyphenAPI("/in0002000423", paramMap));
        JSONObject common = (JSONObject) res.get("common");

        validateHealthPayment(common);*/

        return successHealthPayment(resultMap);
    }

    private void validateHealthPayment(JSONObject common) {
        inputHyphenApiLog(commonLogParam, common);
        if (!String.valueOf(common.get("errYn")).equals("N")) {
            healthPaymentException(String.valueOf(common.get("errMsg")).substring(1, 10));
        }
    }

    //private HashMap<String, Object> successHealthPayment(JSONObject res, HashMap<String, Object> resultMap) { 임시
    private HashMap<String, Object> successHealthPayment(HashMap<String, Object> resultMap) {
        //resultMap.put("health_insurance_full_payment", String.valueOf(((JSONObject) res.get("data")).get("ggYn")));
        resultMap.put("health_insurance_full_payment", "Y");
        resultMap.put("health_insurance_paid_amount", 0); //임시값 차후 변경예정

        return resultMap;
    }

    private void healthPaymentException(String errMsg) {
        if (errMsg.equals("LOGIN-001")) {
            throw new MoneyBankException(MoneyBankErrorCode.CertLoginError);
        } else if (errMsg.equals("B0005-041")) {
            throw new MoneyBankException(MoneyBankErrorCode.ProcessingError);
        } else if (!CubiciUtils.StringEmpty(errMsg)) {
            throw new MoneyBankException(MoneyBankErrorCode.UnidentifiedError);
        }
    }

    private void inputHyphenApiLog(String[] logParam, JSONObject Object) {
        StringBuilder sb = new StringBuilder();
        StackTraceElement[] b = new Throwable().getStackTrace();

        sb.append(b[1].getMethodName()).append(" : ");
        Arrays.stream(logParam).forEach(s -> sb.append(s).append(" = ").append(Object.get(s)).append(" "));
        logger.debug(sb.toString());
    }
}
