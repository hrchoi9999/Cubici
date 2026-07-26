package egovframework.azon.cmmn.component;

import java.io.IOException;
import java.nio.charset.Charset;
import java.security.GeneralSecurityException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import egovframework.azon.cmmn.dto.CoupangApiData;
import egovframework.azon.cmmn.dto.CoupangApiExcepData;

public class CoupangApiComponent_old {

    Logger logger = LoggerFactory.getLogger(CoupangApiComponent_old.class);

    private String VENDOR_ID;
    private String ACCESS_KEY;
    private String SECRET_KEY;

    public CoupangApiComponent_old(String vendorId, String accessKey, String secretKey) {
        this.VENDOR_ID = vendorId;
        this.ACCESS_KEY = accessKey;
        this.SECRET_KEY = secretKey;
    }

    public static CoupangApiComponent_old setAPIKey(HashMap<String, Object> params) {
        String ACCESS_KEY = String.valueOf(params.get("ACCESS_KEY"));
        String SECRET_KEY = String.valueOf(params.get("SECRET_KEY"));
        String VENDOR_ID = String.valueOf(params.get("VENDOR_ID"));
        CoupangApiComponent_old apiInstance = new CoupangApiComponent_old(VENDOR_ID, ACCESS_KEY, SECRET_KEY);
        return apiInstance;
    }

    private final char[] DIGITS_LOWER = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };

    private final String HOST = "api-gateway.coupang.com";
    private final int PORT = 443;
    private final String SCHEMA = "https";

    // 발주서 목록 조회 API
    public String coupang_orderForm(String createdAtFrom, String createdAtTo, String status, String nextToken, int maxPerPage, String searchType) {
        String path = "/v2/providers/openapi/apis/api/v4/vendors/" + this.VENDOR_ID + "/ordersheets";

        URIBuilder uriBuilder = new URIBuilder().setPath(path)
                .addParameter("createdAtFrom", createdAtFrom)
                .addParameter("createdAtTo", createdAtTo)
                .addParameter("status", status)
                .addParameter("nextToken", nextToken)
                .addParameter("maxPerPage", Integer.toString(maxPerPage))
                .addParameter("searchType", searchType);

        String result = apiGetRequest(uriBuilder);
        return result;
    }

    // 매출내역 조회 API
    public String coupang_sales(String recognitionDateFrom, String recognitionDateTo, String salesNextToken, int salesMaxPerPage) {
        String path = "/v2/providers/openapi/apis/api/v1/revenue-history";

        URIBuilder uriBuilder = new URIBuilder().setPath(path)
                .addParameter("vendorId", this.VENDOR_ID)
                .addParameter("recognitionDateFrom", recognitionDateFrom)
                .addParameter("recognitionDateTo", recognitionDateTo)
                .addParameter("token", salesNextToken)
                .addParameter("maxPerPage", Integer.toString(salesMaxPerPage));

        String result = apiGetRequest(uriBuilder);
        return result;
    }

    // 발주서 단건 조회 API (주문번호 orderId)
    public String coupang_detailSales(String orderId) {
        String path = "/v2/providers/openapi/apis/api/v4/vendors/"+this.VENDOR_ID+"/"+orderId+"/ordersheets";

        URIBuilder uriBuilder = new URIBuilder().setPath(path);

        String result = apiGetRequest(uriBuilder);
        return result;
    }

    // 지급내역 조회 API
    public String coupang_settlement(String revenueRecognitionYearMonth) {
        String path = "/v2/providers/marketplace_openapi/apis/api/v1/settlement-histories";

        URIBuilder uriBuilder = new URIBuilder().setPath(path)
                .addParameter("revenueRecognitionYearMonth", revenueRecognitionYearMonth);

        String result = apiGetRequest(uriBuilder);
        return result;
    }

    // 반품/취소 요청목록 조회 API
    public String coupang_return(String createdAtFrom, String createdAtTo, String status, String nextToken, int maxPerPage, String searchType, String cancelType) {

        String path = "/v2/providers/openapi/apis/api/v4/vendors/"+this.VENDOR_ID+"/returnRequests";

        URIBuilder uriBuilder = new URIBuilder().setPath(path)
                .addParameter("searchType", searchType)
                .addParameter("createdAtFrom", createdAtFrom)
                .addParameter("createdAtTo", createdAtTo)
                .addParameter("status", status)
                .addParameter("cancelType", cancelType)
                .addParameter("nextToken", nextToken)
                .addParameter("maxPerPage", Integer.toString(maxPerPage));

        String result = apiGetRequest(uriBuilder);
        return result;
    }

    // 반품철회 이력 조회 API
    public String coupang_exchange(String dateFrom, String dateTo, int nextToken, int sizePerPage) {

        String path = "/v2/providers/openapi/apis/api/v4/vendors/"+this.VENDOR_ID+"/returnWithdrawRequests";

        URIBuilder uriBuilder = new URIBuilder().setPath(path)
                .addParameter("dateFrom", dateFrom)
                .addParameter("dateTo", dateTo)
                .addParameter("pageIndex", Integer.toString(nextToken))
                .addParameter("sizePerPage", Integer.toString(sizePerPage));

        String result = apiGetRequest(uriBuilder);
        return result;
    }

    // 교환요청 목록조회 API
    public String coupang_exchange(String createdAtFrom, String createdAtTo, String status, String orderId, String nextToken, int maxPerPage) {

        String path = "/v2/providers/openapi/apis/api/v4/vendors/"+this.VENDOR_ID+"/exchangeRequests";

        URIBuilder uriBuilder = new URIBuilder().setPath(path)
                .addParameter("createdAtFrom", createdAtFrom)
                .addParameter("createdAtTo", createdAtTo)
                .addParameter("nextToken", nextToken)
                .addParameter("maxPerPage", Integer.toString(maxPerPage));

        String result = apiGetRequest(uriBuilder);
        return result;
    }

    private String apiGetRequest(URIBuilder uriBuilder) {

        String result = "";
        String method = "GET";

        CloseableHttpClient client = null;

        try {
            client = HttpClients.createDefault();

            String authorization = generate(method, uriBuilder.build().toString(), this.SECRET_KEY, this.ACCESS_KEY);

            uriBuilder.setScheme(this.SCHEMA).setHost(this.HOST).setPort(this.PORT);

            HttpGet get = new HttpGet(uriBuilder.build().toString());

            get.addHeader("Authorization", authorization);
            get.addHeader("X-Requested-By", VENDOR_ID);
            get.addHeader("content-type", "application/json");
            get.addHeader("X-EXTENDED-TIMEOUT", "90000");

            CloseableHttpResponse response = null;
            try {
                response = client.execute(get);
                HttpEntity entity = response.getEntity();
                result = EntityUtils.toString(entity);
            } catch (Exception e) {
                logger.error(e.getMessage());
            } finally {
                if (response != null) {
                    try {
                        response.close();
                    } catch (IOException e) {
                        logger.error(e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            logger.error(e.getMessage());
        } finally {
            if (client != null) {
                try {
                    client.close();
                } catch (IOException e) {
                    logger.error(e.getMessage());
                }
            }
        }
        return result;
    }

    // lib
    private String generate(String method, String uri, String secretKey, String accessKey) {
        String[] parts = uri.split("\\?");
        if (parts.length > 2) {
            throw new RuntimeException("incorrect uri format");
        } else {
            String path = parts[0];
            String query = "";
            if (parts.length == 2) {
                query = parts[1];
            }
            SimpleDateFormat dateFormatGmt = new SimpleDateFormat("yyMMdd'T'HHmmss'Z'");
            dateFormatGmt.setTimeZone(TimeZone.getTimeZone("GMT"));
            String datetime = dateFormatGmt.format(new Date());
            String message = datetime + method + path + query;

            String signature;
            try {
                SecretKeySpec signingKey = new SecretKeySpec(secretKey.getBytes(Charset.forName("UTF-8")), "HmacSHA256");
                Mac mac = Mac.getInstance("HmacSHA256");
                mac.init(signingKey);
                byte[] rawHmac = mac.doFinal(message.getBytes(Charset.forName("UTF-8")));
                //signature = Hex.encodeHexString(rawHmac);
                signature = new String(encodeHex(rawHmac, DIGITS_LOWER));
            } catch (GeneralSecurityException var14) {
                throw new IllegalArgumentException("Unexpected error while creating hash: " + var14.getMessage(),
                        var14);
            }

            String result = String.format("CEA algorithm=%s, access-key=%s, signed-date=%s, signature=%s", "HmacSHA256",
                    accessKey, datetime, signature);
            return result;
        }
    }

    // lib
    private static char[] encodeHex(final byte[] data, final char[] toDigits) {
        final int l = data.length;
        final char[] out = new char[l << 1];
        // two characters form the hex value.
        for (int i = 0, j = 0; i < l; i++) {
            out[j++] = toDigits[(0xF0 & data[i]) >>> 4];
            out[j++] = toDigits[0x0F & data[i]];
        }

        return out;
    }

    public static String setDate(String unit, int days, String dateFormat) {
        SimpleDateFormat simpleDateForm = new SimpleDateFormat(dateFormat);
        Calendar day = Calendar.getInstance();
        String returnday = "";
        if (unit.equals("date")) {
            day.add(Calendar.DATE, days);
        } else if (unit.equals("month")) {
            if(day.getActualMaximum(Calendar.DAY_OF_MONTH) == 31) {
                day.add(Calendar.DATE, 1);
            }
            day.add(Calendar.MONTH, days);
        }

        returnday = simpleDateForm.format(day.getTime());

        return returnday;
    }

    public static ArrayList<JSONObject> setJsonObj(JSONObject jsonObj) {
        ArrayList<JSONObject> resultList = new ArrayList<>();
        if (!String.valueOf(jsonObj.get("data")).equals("[]")) {
            JSONArray dataArray = (JSONArray) jsonObj.get("data");
            for (int i=0; i < dataArray.size(); i++) {
                JSONObject dataObject = (JSONObject) dataArray.get(i);
                resultList.add(dataObject);
            }
        }
        return resultList;
    }

    public static HashMap<String, Object> setDataMap(JSONObject jsonObj, String keyName) {
        HashMap<String, Object> resultMap = new HashMap<String, Object>();
        jsonObj = (CoupangApiData.findByListName(keyName).equals("")) ? jsonObj : (JSONObject) jsonObj.get(keyName);
        List<String> list = CoupangApiData.findByKeyList(keyName);
        for (int i = 0; i < list.size(); i++) {
            String key = String.valueOf(list.get(i));
            if(jsonObj.containsKey(key)) {
                String value = dataExcept(String.valueOf(jsonObj.get(key)), key);
                if (!value.equals("pass")) {
                    resultMap.put(CoupangApiData.findByListName(keyName) + key, value);
                }
            }
        }
        return resultMap;
    }

    private static String dataExcept(String data, String key) {
        if (data.equals("") || data.equals("0") || data.equals("null")) {
            String except = CoupangApiExcepData.findByExcepResult(key).getResult();
            data = except.equals("null") ? data : except;
        }
        return data;
    }
}
