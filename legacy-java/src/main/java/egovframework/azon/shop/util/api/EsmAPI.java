package egovframework.azon.shop.util.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.ReturnDTO;
import egovframework.azon.shop.dto.SalesDTO;
import egovframework.azon.shop.util.APIClient;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import static egovframework.azon.shop.util.CommonUtils.setStringValue;
import static egovframework.azon.shop.util.CommonUtils.setIntegerValue;
import static egovframework.azon.shop.util.CommonUtils.setDateValue;

@Service
public class EsmAPI {

    private final AccountDTO accountDTO;
    private final String vendorId;

    public EsmAPI(AccountDTO aDTO) {
        this.accountDTO = aDTO;
        this.vendorId = aDTO.getVendorId();
    }

    private String getAuthToken() throws IOException {
        Map<String, Object> headers = new HashMap<>();
        headers.put("typ", "JWT");
        headers.put("alg", "HS256");
        headers.put("kid", accountDTO.getShopId());
        Map<String, Object> payloads = new HashMap<>();
        payloads.put("iss", "www.cafe24.com");
        payloads.put("sub", "sell");
        payloads.put("aud", "sa.esmplus.com");
        Long timestamp = System.currentTimeMillis();
        payloads.put("iat", timestamp.toString());
        String site_id = "";
        if(accountDTO.getShopType().equals("2")){
            site_id = "G:";
        }else if(accountDTO.getShopType().equals("3")){
            site_id = "A:";
        }
        site_id += accountDTO.getShopId();
        payloads.put("ssi", site_id);


        Long expiredTime = 1000 * 60L * 60L * 2L;

        Date ext = new Date();
        ext.setTime(ext.getTime() + expiredTime);
        String jwt = Jwts.builder()
                .setHeader(headers)
                .setClaims(payloads)
                .setExpiration(ext)
                .signWith(SignatureAlgorithm.HS256, accountDTO.getApiSecretKey().getBytes())
                .compact();
        return jwt;
    }
    public List<SalesDTO> getSalesData(List<String> date_list) throws Exception {
        List<String> testList = date_list;
        List<SalesDTO> sList = new ArrayList<>();
        String authorization = getAuthToken();
        Map<String, String> statuses = new HashMap<>();
        statuses.put("1", "ORDERED");
        statuses.put("2", "ACCEPT");
        statuses.put("3", "DELIVERING");
        statuses.put("4", "FINAL_DELIVERY");
        statuses.put("5", "PURCHASE_DECIDED");

        for(int i = 0; i+1 < date_list.size(); i++){
            for(String status : statuses.keySet()) {
                System.out.println("ESM " + accountDTO.getShopId() + "의 " + date_list.get(i) + "~" + date_list.get(i+1) + " " + status + " 주문 데이터 조회중..");
                Integer page = 1;
                String path = "/shipping/v1/Order/RequestOrders";
                String settlementPath = "/account/v1/settle/getsettleorder";
                Map<String, String> params = new HashMap<>();
                JsonObject requestBody = new JsonObject();
                JsonObject requestSettlementBody = new JsonObject();
                if(accountDTO.getShopType().equals("2")){ // gmarket
                    requestBody.addProperty("siteType", "1");
                    requestSettlementBody.addProperty("siteType", "G");
                }else if(accountDTO.getShopType().equals("3")){ // auction
                    requestBody.addProperty("siteType", "3");
                    requestSettlementBody.addProperty("siteType", "A");
                }
                requestBody.addProperty("orderStatus", status);
                requestBody.addProperty("requestDateType", "1"); // 주문일 기준으로 조회
                requestBody.addProperty("requestDateFrom", date_list.get(i));
                requestBody.addProperty("requestDateTo", date_list.get(i+1));

                while (page != null) {
                    if(page > 0){
                        requestBody.addProperty("pageIndex", page);
                    }
                    String responseBody = null;
                    try {
                        responseBody = new APIClient(accountDTO).esmPost(path, params, requestBody.toString(), authorization);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    JsonParser jsonParser = new JsonParser();
                    JsonObject responseObj = (JsonObject) jsonParser.parse(responseBody);
                    JsonObject jsonObj = responseObj.getAsJsonObject("Data");
                    JsonArray jsonArray = (JsonArray) jsonObj.get("RequestOrders");

                    int total_count = jsonObj.get("TotalCount").getAsInt();
                    int page_size = jsonObj.get("PageSize").getAsInt();
                    AtomicInteger count = new AtomicInteger();

                    if (jsonArray != null && jsonArray.size() > 0) {
                        jsonArray.forEach(jsonElement -> {
                            JsonObject data = jsonElement.getAsJsonObject();
                            SalesDTO sDTO = new SalesDTO();
                            try{sDTO.setShopType(accountDTO.getShopType());}catch(UnsupportedOperationException | NullPointerException ignored){}
                            try{sDTO.setShopId(accountDTO.getShopId());}catch(UnsupportedOperationException | NullPointerException ignored){}
                            String orderNo = null;
                            try{sDTO.setStatus(statuses.get(status));}catch(UnsupportedOperationException | NullPointerException ignored){}
                            setDateValue(data, "esm", "OrderDate", sDTO::setOrderedDate);
                            setDateValue(data, "esm", "PayDate", sDTO::setPaidDate);
                            setDateValue(data, "esm", "TransDate", sDTO::setShipmentDate);
                            setDateValue(data, "esm", "TransCompleteDate", sDTO::setDeliveredDate);
                            setDateValue(data, "esm", "BuyDecisionDate", sDTO::setConfirmDate);

                            setStringValue(data, "OrderNo", sDTO::setOrderNo);
                            setStringValue(data, "SiteGoodsNo", sDTO::setProductNo);
                            setStringValue(data, "GoodsName", sDTO::setProductName);
                            setIntegerValue(data, "ContrAmount", sDTO::setQuantity);
                            setIntegerValue(data, "SalePrice", sDTO::setSalesUnitPrice);
                            setIntegerValue(data, "OrderAmount", sDTO::setSalesAmount);
                            setIntegerValue(data, "SellerDiscountPrice", sDTO::setDiscountAmount);
                            setIntegerValue(data, "AcntMoney", sDTO::setPaymentAmount);
                            setIntegerValue(data, "SettlementPrice", sDTO::setSettleEstimateAmount);
                            setStringValue(data, "InfoCin", sDTO::setPcc);
                            setStringValue(data, "NoSongjang", sDTO::setShipmentNo);
                            setStringValue(data, "OutGoods", sDTO::setSellerProductNo);
                            setIntegerValue(data, "OutsidePrice", sDTO::setDeductionAmount);
                            setStringValue(data, "OverseaTransYn", sDTO::setOverseaDeliveryYn);
                            setStringValue(data, "DeliveryFeeCondition", sDTO::setShippingPolicy);
                            setIntegerValue(data, "ShippingFee", sDTO::setDeliveryCharges);
                            setIntegerValue(data, "BackwoodsAddDeliveryFee", sDTO::setDeliveryCharges_2);
                            setIntegerValue(data, "SellerDiscountPrice", sDTO::setSellerDiscountsAmount);
                            setIntegerValue(data, "DirectDiscountPrice", sDTO::setShoppingMallDiscountAmount);
                            
                            sDTO.setInstantDiscountCoupon(0);
                            sDTO.setDownloadableCoupon(0);
                            sDTO.setProductInstantDiscountAmount(0);
                            sDTO.setProductDiscountCouponAmount(0);
                            sDTO.setProductPurchaseDiscountAmount(0);
                            sDTO.setSellerDiscountCouponAmount(0);
                            sDTO.setSellerPurchaseDiscountAmount(0);
                            sDTO.setOrderAmount(0);
                            
                            sDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));
                            sDTO.setInputDate(new Timestamp(System.currentTimeMillis())); //현재 시간으로 기록

                            requestSettlementBody.addProperty("ContrNo", orderNo);
                            String settlementResponseBody = null;
                            try {
                                settlementResponseBody = new APIClient(accountDTO).esmPost(settlementPath, params, requestSettlementBody.toString(), authorization);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            JsonObject settlementResponseObj = (JsonObject) jsonParser.parse(settlementResponseBody);
                            JsonObject settlement = settlementResponseObj.getAsJsonArray("Data").get(0).getAsJsonObject();
                            setIntegerValue(settlement, "SettlementPrice", sDTO::setSettlementAmount);
                            setDateValue(settlement, "esm", "SettlementPrice", sDTO::setSettleEstimateDate);
                            setDateValue(settlement, "esm", "RemitDate", sDTO::setSettleEstimateDate);

                            sList.add(sDTO);
                            count.getAndIncrement();
                        });

                        if(((page-1) * page_size) + count.get() < total_count){
                            page++;
                        }else{
                            page = null;
                        }
                    }
                    responseBody = null;
                }
            }
        }
        return sList;
    }

    public List<ReturnDTO> getReturnData(List<String> date_list) throws Exception {
        List<ReturnDTO> rList = new ArrayList<>();
        String authorization = getAuthToken();
        Map<String, Map<String, String>> modes = new HashMap<>();

        Map<String, String> mode = new HashMap<>();
        mode.put("path", "/claim/v1/sa/Returns");
        mode.put("1", "RETURN_REQUEST");
        mode.put("2", "COLLECT_DONE");
        mode.put("3", "RETURN_HOLDBACK");
        mode.put("4", "RETURN_DONE");
        mode.put("5", "RETURN_REJECT");
        mode.put("6", "ADMIN_CANCEL_DONE");
        modes.put("Retrun", mode);
        mode = new HashMap<>();
        mode.put("path", "/claim/v1/sa/Exchanges");
        mode.put("1", "EXCHANGE_REQUEST");
        mode.put("2", "COLLECT_DONE");
        mode.put("3", "EXCHANGE_HOLDBACK");
        mode.put("4", "EXCHANGE_DONE");
        mode.put("5", "EXCHANGE_REJECT");
        modes.put("Exchange", mode);
        mode = new HashMap<>();
        mode.put("path", "/claim/v1/sa/Cancels");
        mode.put("1", "CANCEL_REQUEST");
        mode.put("2", "CANCELING");
        mode.put("3", "CANCEL");
        mode.put("4", "CANCEL_HOLDBACK");
        mode.put("5", "ADMIN_CANCEL_DONE");
        mode.put("6", "CANCEL");
        modes.put("Cancel", mode);

        for (int i = 0; i + 1 < date_list.size(); i++) {
            for(String this_mode : modes.keySet()){
                Map<String, String> statuses = modes.get(this_mode);
                String path = statuses.get("path");
                for (String status : statuses.keySet()) {
                    System.out.println("ESM " + accountDTO.getShopId() + "의 " + date_list.get(i) + "~" + date_list.get(i + 1) + " " + status + " 데이터 조회중..");

                    Map<String, String> params = new HashMap<>();
                    JsonObject requestBody = new JsonObject();
                    if (accountDTO.getShopType().equals("2")) {
                        requestBody.addProperty("siteType", "1");
                    } else if (accountDTO.getShopType().equals("3")) {
                        requestBody.addProperty("siteType", "3");
                    }
                    requestBody.addProperty(mode + "Status", status);
                    requestBody.addProperty("Type", "2");
                    requestBody.addProperty("requestDateFrom", date_list.get(i));
                    requestBody.addProperty("requestDateTo", date_list.get(i + 1));

                    String responseBody = null;
                    try {
                        responseBody = new APIClient(accountDTO).esmPost(path, params, requestBody.toString(), authorization);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    JsonParser jsonParser = new JsonParser();
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
                    JsonArray jsonArray = (JsonArray) jsonObj.get("Data");

                    if (jsonArray != null && jsonArray.size() > 0) {
                        jsonArray.forEach(jsonElement -> {
                            JsonObject data = jsonElement.getAsJsonObject();
                            ReturnDTO rDTO = new ReturnDTO();
                            try {rDTO.setShopType(accountDTO.getShopType());} catch (UnsupportedOperationException ignored) {}
                            try {rDTO.setShopId(accountDTO.getShopId());} catch (UnsupportedOperationException ignored) {}
                            try {rDTO.setStatus(statuses.get(status));} catch (UnsupportedOperationException ignored) {}
                            
                            setStringValue(data, "OrderNo", rDTO::setOrderNo);
                            setStringValue(data, "ItemOptionCodes", rDTO::setOptionNo);
                            setDateValue(data, "esm", "RequestDate", rDTO::setRegDate);

                            rDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));
                            rDTO.setInputDate(new Timestamp(System.currentTimeMillis()));

                            rList.add(rDTO);
                        });
                    }
                    responseBody = null;
                }
            }
        }
        return rList;
    }
}
