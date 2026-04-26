package egovframework.azon.shop.util.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.ReturnDTO;
import egovframework.azon.shop.dto.SalesDTO;
import egovframework.azon.shop.util.APIClient;
import egovframework.azon.shop.util.ClaimStatus;
import egovframework.azon.shop.util.Status;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.*;

import static egovframework.azon.shop.util.CommonUtils.*;

@Service
public class NaverAPI {
    Logger logger = LoggerFactory.getLogger(CoupangAPI.class);

    private final AccountDTO accountDTO;

    public NaverAPI(AccountDTO aDTO) {
        this.accountDTO = aDTO;
    }

    private String getAuthToken() throws IOException {
        Long timestamp = System.currentTimeMillis();
        Long newTimestamp = timestamp - ( 1 * 60 * 1000 );
        String password = accountDTO.getApiKey() + "_" + newTimestamp;
        String hashedPw = BCrypt.hashpw(password, accountDTO.getApiSecretKey());
        String signature = Base64.getUrlEncoder().encodeToString(hashedPw.getBytes(StandardCharsets.UTF_8));

        String path = "/v1/oauth2/token";
        Map<String, String> params = new HashMap<>();
        params.put("client_id", accountDTO.getApiKey());
        params.put("timestamp", newTimestamp.toString());
        params.put("client_secret_sign", signature);
        params.put("grant_type", "client_credentials");
        params.put("type", "SELF");
        String responseBody = null;
        try {
            responseBody = new APIClient(accountDTO).naverPost(path, params);
        } catch (IOException e) {
            logger.error("get Auth Token :", e);
        } 
        JsonParser jsonParser = new JsonParser();
        JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
        if(jsonObj.get("access_token") != null){
            String accessToken = jsonObj.get("access_token").getAsString();
            return accessToken;
        }
        responseBody = null;
        return null;
    }

    public List<SalesDTO> getSalesData(List<String> date_list) throws Exception{
        List<SalesDTO> sList = new ArrayList<>();
        String authorization = getAuthToken();

        for(int i=0; i < date_list.size(); i++){
            String path = "/v1/pay-order/seller/product-orders/last-changed-statuses";
            String moreFrom = "";
            String moreSequence = "";
            while(moreSequence != null) {
                Map<String, String> params = new HashMap<>();
                params.put("lastChangedFrom", date_list.get(i));
                if(moreSequence.length() > 0){
                    params.put("moreSequence", moreSequence);
                    params.put("lastChangedFrom", moreFrom);
                }

                moreSequence = null;
                String responseBody = null;
                try {
                    responseBody = new APIClient(accountDTO).naverGet(path, params, authorization);
                } catch (IOException e) {
                    logger.error("get naver orders by date :", e);
                }
                JsonParser jsonParser = new JsonParser();
                if(responseBody.equals("over_date")){
                }else {
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
                    if(jsonObj.get("data") != null){
                        JsonObject dataObj = (JsonObject) jsonObj.get("data");
                        if (dataObj.get("more") != null) {
                            JsonObject moreObj = dataObj.get("more").getAsJsonObject();
                            moreFrom = moreObj.get("moreFrom").getAsString();
                            moreSequence = moreObj.get("moreSequence").getAsString();
                        }

                        JsonArray jsonArray = (JsonArray) dataObj.get("lastChangeStatuses");
                        if(jsonArray != null && jsonArray.size() > 0){
                            jsonArray.forEach(jsonElement -> {
                                JsonObject data = jsonElement.getAsJsonObject();
                                if(!Status.findByStatusCode(data.get("productOrderStatus").getAsString()).name().equals("EMPTY")){                                    
                                    String detailPath = "/v1/pay-order/seller/product-orders/query";
                                    String detailResponse = null;
                                    try {
                                        detailResponse = new APIClient(accountDTO).naverPost(detailPath, new HashMap<>(), "{\"productOrderIds\": [\""+ data.get("productOrderId").getAsString() + "\"]}", authorization);
                                    } catch (IOException e) {
                                        logger.error("get naver orders by date : ", e);
                                    }
                                    JsonObject detailJsonObj = (JsonObject) jsonParser.parse(detailResponse);
                                    JsonArray detailJsonArray = detailJsonObj.get("data").getAsJsonArray();
                                    detailJsonArray.forEach(detailJsonElement ->{
                                        
                                        SalesDTO sDTO = new SalesDTO();
                                        
                                        sDTO.setShopType(accountDTO.getShopType());
                                        sDTO.setShopId(accountDTO.getShopId());
                                        sDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));
                                        sDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                                        
                                        try{sDTO.setStatus(Status.findByStatusCode(data.get("productOrderStatus").getAsString()).name());}catch(UnsupportedOperationException | NullPointerException ignored){}
                                        
                                        setDateValue(data, "naver", "paymentDate", sDTO::setPaidDate);
                                        setStringValue(data, "orderId", sDTO::setOrderNo);
                                        setStringValue(data, "productOrderId", sDTO::setOptionNo);
                                        
                                        JsonObject order = (JsonObject) detailJsonElement.getAsJsonObject().get("order");
                                        JsonObject delivery = (JsonObject) detailJsonElement.getAsJsonObject().get("delivery");
                                        JsonObject productOrder = (JsonObject) detailJsonElement.getAsJsonObject().get("productOrder");                             
                                        
                                        setDateValue(delivery, "naver", "orderDate", sDTO::setOrderedDate);
                                        setDateValue(delivery, "naver", "sendDate", sDTO::setShipmentDate);
                                        setDateValue(delivery, "naver", "deliveredDate", sDTO::setDeliveredDate);
                                        setDateValue(delivery, "naver", "decisionDate", sDTO::setConfirmDate);
                                        setStringValue(productOrder, "productId", sDTO::setProductNo);
                                        setStringValue(productOrder, "productName", sDTO::setProductName);
                                        setStringValue(productOrder, "productOption", sDTO::setOptionName);
                                        setIntegerValue(productOrder, "quantity", sDTO::setQuantity);
                                        setIntegerValue(productOrder, "unitPrice", sDTO::setSalesUnitPrice);
                                        setIntegerValue(productOrder, "totalProductAmount", sDTO::setSalesAmount);
                                        setIntegerValue(order, "orderDiscountAmount", sDTO::setDiscountAmount);
                                        setIntegerValue(productOrder, "totalPaymentAmount", sDTO::setPaymentAmount);
                                        setIntegerValue(productOrder, "expectedSettlementAmount", sDTO::setSettleEstimateAmount);
                                        setIntegerValue(productOrder, "expectedSettlementAmount", sDTO::setSettlementAmount);
                                        setStringValue(productOrder, "individualCustomUniqueCode", sDTO::setPcc);
                                        setStringValue(delivery, "trackingNumber", sDTO::setShipmentNo);
                                        setStringValue(productOrder, "sellerProductCode", sDTO::setSellerProductNo);
                                        setStringValue(order, "ordererId", sDTO::setOrdererId);
                                        setStringValue(order, "ordererName", sDTO::setOrdererName);
                                        setIntegerValue(productOrder, "deliveryFeeAmount", sDTO::setDeliveryCharges);
                                        setIntegerValue(productOrder, "sectionDeliveryFee", sDTO::setDeliveryCharges_2);
                                        setIntegerValue(productOrder, "productImediateDiscountAmount", sDTO::setProductInstantDiscountAmount);
                                        setIntegerValue(productOrder, "productImediateDiscountAmount", sDTO::setProductDiscountCouponAmount);
                                        setIntegerValue(productOrder, "productMultiplePurchaseDiscountAmount", sDTO::setProductPurchaseDiscountAmount);
                                        setIntegerValue(productOrder, "sellerBurdenImediateDiscountAmount", sDTO::setSellerDiscountCouponAmount);
                                        setIntegerValue(productOrder, "sellerBurdenStoreDiscountAmount", sDTO::setSellerPurchaseDiscountAmount);
                                        setIntegerValue(productOrder, "sellerBurdenDiscountAmount", sDTO::setSellerDiscountsAmount);
                                        setStringValue(productOrder, "sellerBurdenMultiplePurchaseDiscountType", sDTO::setSellerPurchaseDiscountType);
                                        setIntegerValue(productOrder, "totalPaymentAmount", sDTO::setOrderAmount);
                                        setIntegerValue(productOrder, "expectedSettlementAmount", sDTO::setSettlementAmount);
                                        sDTO.setInstantDiscountCoupon(0);
                                        sDTO.setDownloadableCoupon(0);
                                        
                                        sList.add(sDTO);
                                    });
                                }
                            });
                        }
                    }
                }
                responseBody = null;
            }
        }
        return sList;
    }

    public List<ReturnDTO> getReturnData(List<String> date_list) throws Exception{
        List<ReturnDTO> rList = new ArrayList<>();
        String authorization = getAuthToken();

        for(int i=0; i < date_list.size(); i++){
            String path = "/v1/pay-order/seller/product-orders/last-changed-statuses";
            String moreFrom = "";
            String moreSequence = "";
            while(moreSequence != null) {
                Map<String, String> params = new HashMap<>();
                params.put("lastChangedFrom", date_list.get(i));
                if(moreSequence.length() > 0){
                    params.put("moreSequence", moreSequence);
                    params.put("lastChangedFrom", moreFrom);
                }

                moreSequence = null;
                String responseBody = null;
                try {
                    responseBody = new APIClient(accountDTO).naverGet(path, params, authorization);
                } catch (IOException e) {
                    logger.error("get returned orders by date : ", e);
                }
                JsonParser jsonParser = new JsonParser();
                if(responseBody.equals("over_date")){
                }else {
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
                    if(jsonObj.get("data") != null){
                        JsonObject dataObj = (JsonObject) jsonObj.get("data");
                        if (dataObj.get("more") != null) {
                            JsonObject moreObj = dataObj.get("more").getAsJsonObject();
                            moreFrom = moreObj.get("moreFrom").getAsString();
                            moreSequence = moreObj.get("moreSequence").getAsString();
                        }
                        ArrayList<String> status = new ArrayList<>(Arrays.asList("EXCHANGED", "CANCELED", "RETURNED", "CANCELED_BY_NOPAYMENT"));

                        JsonArray jsonArray = (JsonArray) dataObj.get("lastChangeStatuses");
                        if (jsonArray != null && jsonArray.size() > 0) {
                            jsonArray.forEach(jsonElement -> {
                                JsonObject data = jsonElement.getAsJsonObject();

                                if(status.contains(data.get("productOrderStatus").getAsString())){
                                    String detailPath = "/v1/pay-order/seller/product-orders/query";
                                    
                                    String detailResponse = null;
                                    try {
                                        detailResponse = new APIClient(accountDTO).naverPost(detailPath, new HashMap<>(), "{\"productOrderIds\": [\""+ data.get("productOrderId").getAsString() + "\"]}", authorization);
                                    } catch (IOException e) {
                                        logger.error("get naver returned order by productOrderIds : ", e);
                                    }

                                    JsonObject detailJsonObj = (JsonObject) jsonParser.parse(detailResponse);
                                    JsonArray detailJsonArray = detailJsonObj.get("data").getAsJsonArray();
                                    
                                    detailJsonArray.forEach(detailJsonElement ->{
                                        ReturnDTO rDTO = new ReturnDTO();
                                        
                                        rDTO.setShopType(accountDTO.getShopType());
                                        rDTO.setShopId(accountDTO.getShopId());
                                        rDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));
                                        rDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                                        
                                        setStringValue(data, "orderId", rDTO::setOrderNo);
                                        setStringValue(data, "productOrderId", rDTO::setOptionNo);
                                        
                                        JsonObject productOrder = (JsonObject) detailJsonElement.getAsJsonObject().get("productOrder");
                                        JsonObject claimData = setClaimData(detailJsonElement);

                                        setIntegerValue(productOrder, "totalPaymentAmount", rDTO::setPaymentAmount);
                                        setDateValue(claimData, "naver", "claimRequestDate", rDTO::setRegDate);
                                        
                                        try { rDTO.setStatus(ClaimStatus.findbyStatusCode(claimData.get("claimStatus").getAsString()).name()); } catch (UnsupportedOperationException | NullPointerException ignored) {}
                                        try { rDTO.setClaimStatus(ClaimStatus.findbyStatusCode(claimData.get("claimStatus").getAsString()).name()); } catch (UnsupportedOperationException | NullPointerException ignored) {}
                                        
                                        rList.add(rDTO);
                                    });
                                }
                            });
                        }
                    }
                }
                responseBody = null;
            }
        }
        return rList;
    }

    public JsonObject setClaimData(JsonElement detailJsonElement) {
        String[] names = {"cancel", "return", "exchange"};
        JsonObject detailJsonObject = detailJsonElement.getAsJsonObject();
        for (String n : names) {
            if (detailJsonObject.has(n)) {
                return detailJsonObject.getAsJsonObject(n);
            }
        }
        return null;
    }
}
