package egovframework.azon.shop.util.api;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.ReturnDTO;
import egovframework.azon.shop.dto.SalesDTO;
import egovframework.azon.shop.mapper.SalesMapper;
import egovframework.azon.shop.util.APIClient;
import egovframework.azon.shop.util.ClaimStatus;
import egovframework.azon.shop.util.CommonUtils;
import egovframework.azon.shop.util.Status;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.io.StringReader;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static egovframework.azon.shop.util.CommonUtils.getTagValue;
import static egovframework.azon.shop.util.CommonUtils.getIntegerTagValue;

@RequiredArgsConstructor
@Service
public class Street11API {
    
    Logger logger = LoggerFactory.getLogger(Street11API.class);
    private final AccountDTO accountDTO;
    private final SalesMapper salesMapper;

    public List<SalesDTO> getSalesData(List<String> date_list) throws Exception{
        List<SalesDTO> sList = new ArrayList<>();
        String[] paths = {"/rest/ordservices/standby/", //결제대기
                "/rest/ordservices/complete/", //결제완료
                "/rest/ordservices/packaging/", //배송준비중
                "/rest/ordservices/shipping/", //배송중
                "/rest/ordservices/dlvcompleted/", // 배송완료
                "/rest/ordservices/completed/" }; //구매확정

        for(int i=0; i+1 < date_list.size(); i++){
            for(String path : paths) {
                path += date_list.get(i) + "/" + date_list.get(i + 1);
                Map<String, String> params = new HashMap<>();

                String responseBody = null;
                try {
                    responseBody = new APIClient(accountDTO).street11Get(path, params);

                } catch (IOException e) {
                    logger.error("get 11st orders by date : ", e);
                }
                
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document doc = builder.parse(new InputSource(new StringReader(responseBody)));
                doc.getDocumentElement().normalize();
                NodeList nList = doc.getElementsByTagName("ns2:order");

                for (int j = 0; j < nList.getLength(); j++) {
                    Node nNode = nList.item(j);
                    if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                        Element eElement = (Element) nNode;
                        SalesDTO sDTO = new SalesDTO();
                        sDTO.setShopType(accountDTO.getShopType());
                        sDTO.setShopId(accountDTO.getShopId());
                        String orderNo = getTagValue("ordNo", eElement);
                        sDTO.setOrderNo(orderNo);
                        sDTO.setOrderedDate(CommonUtils.parseTime("11st", getTagValue("ordDt", eElement)));
                        sDTO.setPaidDate(CommonUtils.parseTime("11st", getTagValue("ordStlEndDt", eElement)));
                        sDTO.setDeliveredDate(CommonUtils.parseTime("11st", getTagValue("dlvEndDt", eElement)));
                        sDTO.setConfirmDate(CommonUtils.parseTime("11st", getTagValue("pocnfrmDt", eElement)));
                        sDTO.setOptionName(getTagValue("slctPrdOptNm", eElement));
                        sDTO.setSalesUnitPrice(getIntegerTagValue("selPrc", eElement));
                        sDTO.setSalesAmount(getIntegerTagValue("ordAmt", eElement));
                        sDTO.setDiscountAmount(getIntegerTagValue("sellerDscPrc", eElement));
                        sDTO.setPaymentAmount(getIntegerTagValue("ordPayAmt", eElement));
                        sDTO.setSettleEstimateAmount(getIntegerTagValue("stlPlnAmt", eElement));
                        sDTO.setPcc(getTagValue("psnCscUniqNo", eElement));
                        sDTO.setSellerProductNo(getTagValue("sellerPrdCd", eElement));
                        sDTO.setShipmentBoxNo(getTagValue("bndlDlvSeq", eElement));
                        try{sDTO.setOrdererId(getTagValue("ordNm", eElement)); }catch(UnsupportedOperationException | NullPointerException ignored){}
                        try{sDTO.setOrdererName(getTagValue("memID", eElement)); }catch(UnsupportedOperationException | NullPointerException ignored){}
                        sDTO.setOptionSalesAmount(getIntegerTagValue("ordOptWonStl", eElement));
                        sDTO.setDeliveryCharges(getIntegerTagValue("lstDlvCst", eElement));
                        sDTO.setDeliveryCharges_2(getIntegerTagValue("bmDlvCst", eElement));
                        sDTO.setSellerDiscountsAmount(getIntegerTagValue("sellerDscPrc", eElement));
                        sDTO.setShoppingMallDiscountAmount(getIntegerTagValue("tmallDscPrc", eElement));
                        sDTO.setOrderAmount(getIntegerTagValue("ordAmt", eElement));
                        sDTO.setShipmentNo(getTagValue("invcNo", eElement));

                        sDTO.setInstantDiscountCoupon(0);
                        sDTO.setDownloadableCoupon(0);
                        sDTO.setProductInstantDiscountAmount(0);
                        sDTO.setProductDiscountCouponAmount(0);
                        sDTO.setProductPurchaseDiscountAmount(0);
                        sDTO.setSellerDiscountCouponAmount(0);
                        sDTO.setSellerPurchaseDiscountAmount(0);
                        sDTO.setSettlementAmount(0);

                        if(path.contains("/rest/ordservices/completed/")){
                            responseBody = null;
                            try {
                                responseBody = new APIClient(accountDTO).street11Get("/rest/ordservices/complete/"+orderNo, params);
                                factory = DocumentBuilderFactory.newInstance();
                                builder = factory.newDocumentBuilder();
                                doc = builder.parse(new InputSource(new StringReader(responseBody)));
                                doc.getDocumentElement().normalize();
                                NodeList detailList = doc.getElementsByTagName("ns2:order");
                                nNode = detailList.item(0);
                            } catch (IOException e) {
                                logger.error("get 11st complete order by orderNo : ", e);
                            }
                            if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                                eElement = (Element) nNode;
                                sDTO.setOrdererName(getTagValue("ordNm", eElement));
                                sDTO.setOrdererId(getTagValue("memID", eElement));
                                sDTO.setSettleEstimateAmount(getIntegerTagValue("stlPlnAmt", eElement));
                                sDTO.setConfirmDate(CommonUtils.parseTime("11st", getTagValue("plcodrCnfDt", eElement)));
                            }
                        }

                        responseBody = null;
                        try {
                            responseBody = new APIClient(accountDTO).street11Get("/rest/claimservice/orderlistalladdr/"+orderNo, params);

                        } catch (IOException e) {
                            logger.error("get 11st order's shipInfo by orderNo : ", e);
                        }

                        factory = DocumentBuilderFactory.newInstance();
                        builder = factory.newDocumentBuilder();
                        doc = builder.parse(new InputSource(new StringReader(responseBody)));

                        doc.getDocumentElement().normalize();
                        NodeList statusList = doc.getElementsByTagName("ns2:order");
                        nNode = statusList.item(0);
                        if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                            eElement = (Element) nNode;
                            sDTO.setStatus(Status.findByStatusCode(getTagValue("ordPrdStat", eElement)).name());
                            sDTO.setShipmentDate(CommonUtils.parseTime("11st", getTagValue("sndEndDt", eElement)));
                            sDTO.setProductNo(getTagValue("prdNo", eElement));
                            sDTO.setOptionNo(getTagValue("ordPrdSeq", eElement));
                            sDTO.setProductName(getTagValue("prdNm", eElement));
                            sDTO.setQuantity(getIntegerTagValue("ordQty", eElement));
                            sDTO.setDeliveryMethod(getTagValue("dlvMthdCd", eElement));
                        }

                        sDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                        sDTO.setUpdDate(new Timestamp(System.currentTimeMillis()));
                        sList.add(sDTO);
                    }
                }
            }
        }
        return sList;
    }

    public List<ReturnDTO> getReturnData(List<String> date_list) throws Exception{
        List<ReturnDTO> rList = new ArrayList<>();
        String[] paths = {"/rest/claimservice/cancelorders/", "/rest/claimservice/canceledorders/", "/rest/claimservice/withdrawcanceledorders/", "/rest/claimservice/exchangeorders/", "/rest/claimservice/exchangedorders/", "/rest/claimservice/retractexcorders/", "/rest/claimservice/returnorders/", "/rest/claimservice/returnedorders/", "/rest/claimservice/retractretorders/"};

        for(int i=0; i+1 < date_list.size(); i++){
            for(String path : paths) {
                path += date_list.get(i) + "/" + date_list.get(i + 1);
                Map<String, String> params = new HashMap<>();

                String responseBody = null;
                try {
                    responseBody = new APIClient(accountDTO).street11Get(path, params);
                } catch (IOException e) {
                    logger.error("get 11st returned orders by date: ", e);
                }

                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document doc = builder.parse(new InputSource(new StringReader(responseBody)));

                doc.getDocumentElement().normalize();
                NodeList nList = doc.getElementsByTagName("ns2:order");

                for (int j = 0; j < nList.getLength(); j++) {
                    Node nNode = nList.item(j);
                    if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                        Element eElement = (Element) nNode;
                        String orderNo = getTagValue("ordNo", eElement);
                        
                        ReturnDTO rDTO = new ReturnDTO();
                        
                        rDTO.setShopType(accountDTO.getShopType());
                        rDTO.setShopId(accountDTO.getShopId());

                        rDTO.setInputDate(new Timestamp(System.currentTimeMillis()));
                        rDTO.setUpdDate(new Timestamp(System.currentTimeMillis())); 
                        rDTO.setOrderNo(orderNo);
                        rDTO.setProductNo(getTagValue("prdNo", eElement));

                        if(path.contains("cancel")){
                            rDTO.setStatus(ClaimStatus.findbyStatusCode(getTagValue("ordCnStatCd", eElement)).name());
                            rDTO.setRegDate(CommonUtils.parseTime("11st", getTagValue("createDt", eElement)));
                            rDTO.setClaimCompleteDate(CommonUtils.parseTime("11st", getTagValue("cnTrtEndDt", eElement)));
                        }else{
                            rDTO.setStatus(ClaimStatus.findbyStatusCode(getTagValue("clmStat", eElement)).name());
                            rDTO.setRegDate(CommonUtils.parseTime("11st", getTagValue("reqDt", eElement)));
                            rDTO.setClaimCompleteDate(CommonUtils.parseTime("11st", getTagValue("trtEndDt", eElement)));
                        }

                        responseBody = null;
                        try {
                            responseBody = new APIClient(accountDTO).street11Get("/rest/claimservice/orderlistalladdr/"+orderNo, params);
                        } catch (IOException e) {
                            logger.error("get 11st order's shipInfo by orderNo : ", e);
                        }

                        factory = DocumentBuilderFactory.newInstance();
                        builder = factory.newDocumentBuilder();
                        doc = builder.parse(new InputSource(new StringReader(responseBody)));
                        doc.getDocumentElement().normalize();
                        NodeList statusList = doc.getElementsByTagName("ns2:order");
                        nNode = statusList.item(0);
                        if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                            eElement = (Element) nNode;
                            if(rDTO.getStatus() == null){
                                rDTO.setStatus(ClaimStatus.findbyStatusCode(getTagValue("ordPrdStat", eElement)).name());
                            }
                            rDTO.setOptionNo(getTagValue("ordPrdSeq", eElement));
                        }
                        try {rDTO.setPaymentAmount(Integer.parseInt(salesMapper.findPaymentAmountByOrderId(accountDTO.getShopType(), accountDTO.getShopId(), orderNo)));} catch (UnsupportedOperationException | NumberFormatException ignored) { }
                        
                        
                        if(rDTO.getStatus() != null)
                            rList.add(rDTO);
                    }
                }
            }
        }
        return rList;
    }
}
