package egovframework.azon.shop.util.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.ReturnDTO;
import egovframework.azon.shop.dto.SalesDTO;
import egovframework.azon.shop.dto.SettlementDTO;
import egovframework.azon.shop.mapper.SalesMapper;
import egovframework.azon.shop.util.APIClient;
import egovframework.azon.shop.util.ClaimStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static egovframework.azon.shop.util.CommonUtils.setStringValue;
import static egovframework.azon.shop.util.CommonUtils.setIntegerValue;
import static egovframework.azon.shop.util.CommonUtils.setDateValue;

@Service
public class CoupangAPI {
    Logger logger = LoggerFactory.getLogger(CoupangAPI.class);
    
    private final AccountDTO accountDTO;
    private final String vendorId;
    private final SalesMapper salesMapper;

    public CoupangAPI(AccountDTO aDTO, SalesMapper salesMapper) {
        this.accountDTO = aDTO;
        this.vendorId = aDTO.getVendorId();
        this.salesMapper = salesMapper;
    }

    public List<SalesDTO> getSalesDataByDate(List<String> date_list) {
        List<SalesDTO> sList = new ArrayList<>();
        String[] statuses = {"ACCEPT", "INSTRUCT", "DEPARTURE", "DELIVERING", "FINAL_DELIVERY", "NONE_TRACKING"};
        for(int i = 0; i+1 < date_list.size(); i++){
            for(String status : statuses) {
                String next = "";
                String path = "/v2/providers/openapi/apis/api/v4/vendors/" + vendorId + "/ordersheets";
                Map<String, String> params = new HashMap<>();
                params.put("createdAtFrom", date_list.get(i));
                params.put("createdAtTo", date_list.get(i+1));
                params.put("status", status);

                while (next != null) {
                    if(next.length() > 0){
                        params.put("nextToken", next);
                    }
                    String responseBody = null;
                    try {
                        responseBody = new APIClient(accountDTO).coupangGet(path, params);
                    } catch (IOException e) {
                        logger.error("get coupang orders by date ({}) : {}", status, e);
                    }
                    
                    JsonParser jsonParser = new JsonParser();
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
                    JsonArray jsonArray = (JsonArray) jsonObj.get("data");
                    next = jsonObj.get("nextToken").getAsString().length() > 0 ? jsonObj.get("nextToken").getAsString() : null;

                    if (jsonArray != null && jsonArray.size() > 0) {
                        jsonArray.forEach(jsonElement -> {
                            JsonObject data = jsonElement.getAsJsonObject();
                            JsonObject orderer = data.get("orderer").getAsJsonObject();
                            JsonObject overseaShippingInfoDto = data.get("overseaShippingInfoDto").getAsJsonObject();
                            JsonArray items = data.get("orderItems").getAsJsonArray();
                            items.forEach(item -> {
                                SalesDTO sDTO = new SalesDTO();

                                sDTO.setShopType(accountDTO.getShopType());
                                sDTO.setShopId(accountDTO.getShopId());
                                
                                sDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                                sDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));
                                
                                sDTO.setProductInstantDiscountAmount(0);
                                sDTO.setProductDiscountCouponAmount(0);
                                sDTO.setProductPurchaseDiscountAmount(0);
                                sDTO.setSellerDiscountCouponAmount(0);
                                sDTO.setSellerPurchaseDiscountAmount(0);
                                sDTO.setOrderAmount(0);

                                setStringValue(data, "orderId", sDTO::setOrderNo);
                                setStringValue(data, "status", sDTO::setStatus);
                                setStringValue(data, "invoiceNumber", sDTO::setShipmentNo);
                                setIntegerValue(data, "shippingPrice", sDTO::setDeliveryCharges);
                                setIntegerValue(data, "remotePrice", sDTO::setDeliveryCharges_2);
                                setIntegerValue(data, "instantCouponDiscount", sDTO::setInstantDiscountCoupon);
                                setIntegerValue(data, "downloadableCouponDiscount", sDTO::setDownloadableCoupon);
                                setIntegerValue(data, "coupangDiscount", sDTO::setShoppingMallDiscountAmount);
                                setDateValue(data, "coupang", "orderedAt", sDTO::setOrderedDate);
                                setDateValue(data, "coupang", "paidAt", sDTO::setPaidDate);
                                setDateValue(data, "coupang2", "inTrasitDateTime", sDTO::setShipmentDate);
                                setDateValue(data, "coupang2", "deliveredDate", sDTO::setDeliveredDate);
                                setDateValue(data, "coupang2", "confirmDate", sDTO::setConfirmDate);
                                
                                setStringValue(orderer, "email", sDTO::setOrdererId);
                                setStringValue(orderer, "name", sDTO::setOrdererName);
                                
                                setStringValue(overseaShippingInfoDto, "personalCustomsClearanceCode", sDTO::setPcc);
                                
                                JsonObject itemDetail = item.getAsJsonObject();
                                setStringValue(itemDetail, "vendorItemId", sDTO::setOptionNo);
                                setStringValue(itemDetail, "productId", sDTO::setProductNo);
                                setStringValue(itemDetail, "sellerProductName", sDTO::setProductName);
                                setStringValue(itemDetail, "sellerProductItemName", sDTO::setOptionName);
                                setIntegerValue(itemDetail, "shippingCount", sDTO::setQuantity);
                                setIntegerValue(itemDetail, "salesPrice", sDTO::setSalesUnitPrice);
                                setIntegerValue(itemDetail, "discountPrice", sDTO::setDiscountAmount);
                                setIntegerValue(itemDetail, "orderPrice", sDTO::setPaymentAmount);
                                setStringValue(itemDetail, "sellerProductId", sDTO::setSellerProductNo);
                                setStringValue(itemDetail, "canceled", sDTO::setCanceled);
                                
                                sList.add(sDTO);
                            });
                        });
                    }
                    responseBody = null;
                }
            }
        }
        return sList;
    }

    public List<SalesDTO> getSalesDataByOrderNo(String order_no) throws Exception {
        List<SalesDTO> sList = new ArrayList<>();
        String path = "/v2/providers/openapi/apis/api/v4/vendors/" + vendorId + "/" + order_no + "/ordersheets";
        Map<String, String> params = new HashMap<>();

        String responseBody = null;
        try {
            responseBody = new APIClient(accountDTO).coupangGet(path, params);
        } catch (IOException e) {
            logger.error("get coupang order by orderId : ", e);
        }
        if(responseBody == null){
            return sList;
        } else {
            JsonParser jsonParser = new JsonParser();
            JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
            JsonObject data = jsonObj.get("data").getAsJsonArray().get(0).getAsJsonObject();
            JsonObject orderer = data.get("orderer").getAsJsonObject();
            JsonArray items = data.get("orderItems").getAsJsonArray();
            items.forEach(item -> {
                SalesDTO sDTO = new SalesDTO();
                
                sDTO.setShopType(accountDTO.getShopType());
                sDTO.setShopId(accountDTO.getShopId());
                
                sDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));
                sDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                
                sDTO.setProductInstantDiscountAmount(0);
                sDTO.setProductDiscountCouponAmount(0);
                sDTO.setProductPurchaseDiscountAmount(0);
                sDTO.setSellerDiscountCouponAmount(0);
                sDTO.setSellerPurchaseDiscountAmount(0);
                sDTO.setOrderAmount(0);
                
                setStringValue(data, "orderId", sDTO::setOrderNo);
                setStringValue(data, "status", sDTO::setStatus);
                setStringValue(data, "overseaShippingInfoDto", sDTO::setPcc);
                setStringValue(data, "shipmentBoxId", sDTO::setShipmentNo);
                setIntegerValue(data, "shippingPrice", sDTO::setDeliveryCharges);
                setIntegerValue(data, "remotePrice", sDTO::setDeliveryCharges_2);
                setIntegerValue(data, "instantCouponDiscount", sDTO::setInstantDiscountCoupon);
                setIntegerValue(data, "downloadableCouponDiscount", sDTO::setDownloadableCoupon);
                setIntegerValue(data, "coupangDiscount", sDTO::setShoppingMallDiscountAmount);
                setDateValue(data, "coupang", "orderedAt", sDTO::setOrderedDate);
                setDateValue(data, "coupang", "paidAt", sDTO::setPaidDate);
                setDateValue(data, "coupang2", "inTrasitDateTime", sDTO::setShipmentDate);
                setDateValue(data, "coupang2", "deliveredDate", sDTO::setDeliveredDate);
                setDateValue(data, "coupang2", "confirmDate", sDTO::setConfirmDate);

                setStringValue(orderer, "email", sDTO::setOrdererId);
                setStringValue(orderer, "name", sDTO::setOrdererName);

                JsonObject itemDetail = item.getAsJsonObject();
                setStringValue(itemDetail, "vendorItemId", sDTO::setOptionNo);
                setStringValue(itemDetail, "productId", sDTO::setProductNo);
                setStringValue(itemDetail, "sellerProductName", sDTO::setProductName);
                setStringValue(itemDetail, "sellerProductItemName", sDTO::setOptionName);
                setIntegerValue(itemDetail, "shippingCount", sDTO::setQuantity);
                setIntegerValue(itemDetail, "salesPrice", sDTO::setSalesUnitPrice);
                setIntegerValue(itemDetail, "discountPrice", sDTO::setDiscountAmount);
                setIntegerValue(itemDetail, "orderPrice", sDTO::setPaymentAmount);
                setStringValue(itemDetail, "sellerProductId", sDTO::setSellerProductNo);
                setStringValue(itemDetail, "canceled", sDTO::setCanceled);

                sList.add(sDTO);
            });

            responseBody = null;
        }        

        return sList;
    }

    public List<SalesDTO> getRevenueData(List<String> date_list) throws Exception {
        List<SalesDTO> sList = new ArrayList<>();

        for(int i = 0; i+1 < date_list.size(); i++){
            String next = "";
            String path = "/v2/providers/openapi/apis/api/v1/revenue-history";
            Map<String, String> params = new HashMap<>();
            params.put("vendorId", vendorId);
            params.put("recognitionDateFrom", date_list.get(i));
            params.put("recognitionDateTo", date_list.get(i+1));

            while (next != null) {
                params.put("token", next);

                String responseBody = null;
                try {
                    responseBody = new APIClient(accountDTO).coupangGet(path, params);
                } catch (IOException e) {
                    logger.error("get coupang confirmed orders by date : ", e);
                }
                JsonParser jsonParser = new JsonParser();
                JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
                JsonArray jsonArray = (JsonArray) jsonObj.get("data");
                next = jsonObj.get("hasNext").getAsBoolean() ? jsonObj.get("nextToken").getAsString() : null;

                if (jsonArray != null && jsonArray.size() > 0) {
                    jsonArray.forEach(jsonElement -> {
                        JsonObject data = jsonElement.getAsJsonObject();                        
                        JsonArray items = data.get("items").getAsJsonArray();
                        items.forEach(item -> {
                            SalesDTO sDTO = new SalesDTO();
                            
                            sDTO.setShopType(accountDTO.getShopType());
                            sDTO.setShopId(accountDTO.getShopId());
                            
                            sDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                            sDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));

                            setStringValue(data, "orderId", sDTO::setOrderNo);

                            setDateValue(data, "", "settlementDate", sDTO::setSettleEstimateDate);
                            setDateValue(data, "", "settlementDate", sDTO::setSettleCompleteDate);
                            
                            JsonObject itemDetail = item.getAsJsonObject();
                            setStringValue(itemDetail, "productId", sDTO::setProductNo);
                            setStringValue(itemDetail, "vendorItemId", sDTO::setOptionNo);
                            setIntegerValue(itemDetail, "salePrice", sDTO::setSalesAmount);
                            setIntegerValue(itemDetail, "settlementAmount", sDTO::setSettleEstimateAmount);
                            setIntegerValue(itemDetail, "settlementAmount", sDTO::setSettlementAmount);
                            
                            sList.add(sDTO);
                        });
                    });
                }
                responseBody = null;
            }
        }
        return sList;
    }

    public List<ReturnDTO> getReturnData(List<String> date_list) throws Exception {
        List<ReturnDTO> rList = new ArrayList<>();
        String[] statuses = {"RU", "UC", "CC", "PR", "CANCEL"};

        for(int i = 0; i+1 < date_list.size(); i++){
            for(String status : statuses) {
                String next = "";
                String path = "/v2/providers/openapi/apis/api/v4/vendors/" + vendorId + "/returnRequests";
                Map<String, String> params = new HashMap<>();
                params.put("createdAtFrom", date_list.get(i));
                params.put("createdAtTo", date_list.get(i+1));
                if(status.equals("CANCEL")){
                    params.put("cancelType", status);
                }else{
                    params.put("status", status);
                }

                while (next != null) {
                    if(next.length() > 0){ params.put("nextToken", next); }
                    
                    String responseBody = null;
                    try {
                        responseBody = new APIClient(accountDTO).coupangGet(path, params);
                    } catch (IOException e) {
                        logger.error("get coupang returned orders by date ({}) : {}", status, e);
                    }
                    
                    JsonParser jsonParser = new JsonParser();
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(responseBody);
                    JsonArray jsonArray = (JsonArray) jsonObj.get("data");
                    next = jsonObj.get("nextToken").getAsString().length() > 0 ? jsonObj.get("nextToken").getAsString() : null;

                    if (jsonArray != null && jsonArray.size() > 0) {
                        jsonArray.forEach(jsonElement -> {
                            JsonObject data = jsonElement.getAsJsonObject();                            
                            JsonArray items = data.get("returnItems").getAsJsonArray();
                            items.forEach(item ->{
                                ReturnDTO rDTO = new ReturnDTO();
                                
                                rDTO.setStatus(ClaimStatus.findbyStatusCode(data.get("receiptStatus").getAsString()).name());
                                rDTO.setShopType(accountDTO.getShopType());
                                rDTO.setShopId(accountDTO.getShopId());

                                rDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                                rDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));

                                setStringValue(data, "orderId", rDTO::setOrderNo);
                                setStringValue(data, "receiptId", rDTO::setReceiptNo);
                                setStringValue(data, "receiptStatus", rDTO::setReleaseStatus);
                                setStringValue(data, "paymentId", rDTO::setPaymentNo);
                                setStringValue(data, "receiptType", rDTO::setReceiptType);
                                setIntegerValue(data, "cancelCountSum", rDTO::setTotalCancelCount);
                                setStringValue(data, "returnDeliveryId", rDTO::setReturnDeliveryNo);
                                setStringValue(data, "releaseStopStatus", rDTO::setReleaseStopStatus);
                                setStringValue(data, "preRefund", rDTO::setPreRefund);
                                setStringValue(data, "completeConfirmType", rDTO::setCompleteConfirmType);
                                setDateValue(data, "coupang", "createAt", rDTO::setRegDate);

                                JsonObject returnItem = item.getAsJsonObject();
                                setStringValue(returnItem, "vendorItemId", rDTO::setOptionNo);
                                setStringValue(returnItem, "vendorItemId", rDTO::setProductNo);
                                setIntegerValue(returnItem, "cancelCount", rDTO::setCancelCount);
                                setIntegerValue(returnItem, "purchaseCount", rDTO::setOrderCount);
                                setStringValue(returnItem, "releaseStatus", rDTO::setReleaseStatus);

                                try{ rDTO.setPaymentAmount(Integer.parseInt(salesMapper.findPaymentAmountByOrderId(accountDTO.getShopType(), accountDTO.getShopId(), data.get("orderId").getAsString()))); }catch(UnsupportedOperationException | NumberFormatException ignored){}

                                rList.add(rDTO);
                            });                            
                        });
                    }
                    responseBody = null;
                }
            }
        }
        return rList;
    }

    public List<SettlementDTO> getSettlementData(List<String> date_list) throws Exception {
        List<SettlementDTO> sList = new ArrayList<>();
        for(int i = 0; i < date_list.size(); i++){
            String path = "/v2/providers/marketplace_openapi/apis/api/v1/settlement-histories";
            Map<String, String> params = new HashMap<>();
            params.put("revenueRecognitionYearMonth", date_list.get(i));

            String responseBody = null;
            try {
                responseBody = new APIClient(accountDTO).coupangGet(path, params);
            } catch (IOException e) {
                logger.error("get coupang settlement orders by date", e);
            }
            JsonParser jsonParser = new JsonParser();
            JsonArray jsonArray = (JsonArray) jsonParser.parse(responseBody);

            if (jsonArray != null && jsonArray.size() > 0) {
                jsonArray.forEach(jsonElement -> {
                    SettlementDTO sDTO = new SettlementDTO();

                    sDTO.setShopType(accountDTO.getShopType());
                    sDTO.setShopId(accountDTO.getShopId());
                    sDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                    sDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));

                    JsonObject data = jsonElement.getAsJsonObject();
                    setStringValue(data, "settlementType", sDTO::setSettlementType);
                    setIntegerValue(data, "totalSale", sDTO::setTotalSale);
                    setIntegerValue(data, "serviceFee", sDTO::setServiceFee);
                    setIntegerValue(data, "settlementTargetAmount", sDTO::setSettlementTargetAmount);
                    setIntegerValue(data, "settlementAmount", sDTO::setSettlementAmount);
                    setIntegerValue(data, "pendingReleasedAmount", sDTO::setPendingReleasedAmount);
                    setIntegerValue(data, "sellerDiscountCoupon", sDTO::setSellerDiscountCoupon);
                    setIntegerValue(data, "downloadableCoupon", sDTO::setDownloadableCoupon);
                    setIntegerValue(data, "sellerServiceFee", sDTO::setSellerServiceFee);
                    setIntegerValue(data, "storeFeeDiscount", sDTO::setStoreFeeDiscount);
                    setIntegerValue(data, "debtOfLastWeek", sDTO::setDebtOfLastWeek);
                    setStringValue(data, "bankAccountHolder", sDTO::setBankAccountHolder);
                    setStringValue(data, "bankName", sDTO::setBankName);
                    setStringValue(data, "bankAccount", sDTO::setBankAccount);
                    setStringValue(data, "status", sDTO::setStatus);
                    setStringValue(data, "sub_store", sDTO::setSubStore);
                    setDateValue(data, "", "settlementDate", sDTO::setSettlementDate);
                    
                    sList.add(sDTO);
                });
            }
            responseBody = null;
        }
        return sList;
    }
}
