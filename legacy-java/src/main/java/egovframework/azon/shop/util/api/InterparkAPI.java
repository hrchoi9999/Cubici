package egovframework.azon.shop.util.api;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.ReturnDTO;
import egovframework.azon.shop.dto.SalesDTO;
import egovframework.azon.shop.util.APIClient;
import egovframework.azon.shop.util.CommonUtils;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static egovframework.azon.shop.util.CommonUtils.getTagValue;
import static egovframework.azon.shop.util.CommonUtils.getIntegerTagValue;

@Service
public class InterparkAPI {

    private final AccountDTO accountDTO;

    public InterparkAPI(AccountDTO aDTO) {
        this.accountDTO = aDTO;
    }

    public List<SalesDTO> getSalesData(List<String> date_list) throws Exception{
        List<SalesDTO> sList = new ArrayList<>();
        String[] paths = {"/order/OrderClmAPI.do?_method=orderListForSingle", "/order/OrderClmAPI.do?_method=orderListDelvForSingle", "/order/OrderClmAPI.do?_method=delvCompListForSingle", "/order/OrderClmAPI.do?_method=orderCompListForSingle", "/order/OrderClmAPI.do?_method=DelvArrCompListForSingle"};

        for(int i=0; i+1 < date_list.size(); i++){
            System.out.println("인터파크 " + accountDTO.getShopId() + "의 " + date_list.get(i) + " 주문 데이터 조회중..");

            for(String path : paths) {
                Integer page_no = 1;
                while (page_no != null){
                    Map<String, String> params = new HashMap<>();
                    params.put("sc", "sc");
                    params.put("sc.entrId", accountDTO.getVendorId());
                    params.put("sc.supplyEntrNo", accountDTO.getVendorId());
                    params.put("sc.supplyCtrtSeq", accountDTO.getApiSecretKey());
                    params.put("sc.strDate", date_list.get(i));
                    params.put("sc.endDate", date_list.get(i + 1));
                    if (path.contains("DelvArrCompListForSingle")) {
                        params.put("sc.pageNo", page_no.toString());
                    }

                    String responseBody = null;
                    try {
                        responseBody = new APIClient(accountDTO).interparkGet(path, params);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder builder = factory.newDocumentBuilder();
                    Document doc = builder.parse(new InputSource(new StringReader(responseBody)));

                    doc.getDocumentElement().normalize();
                    if (path.contains("DelvArrCompListForSingle")) {
                        Element page_info = doc.getElementById("PAGE_INFO");
                        if (page_info != null && page_no < Integer.parseInt(getTagValue("TOT_PAGE_NUM", page_info))) {
                            page_no++;
                        } else {
                            page_no = null;
                        }
                    } else {
                        page_no = null;
                    }
                    NodeList nList = doc.getElementsByTagName("ORDER");

                    for (int j = 0; j < nList.getLength(); j++) {
                        Node nNode = nList.item(j);
                        if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                            Element eElement = (Element) nNode;
                            SalesDTO sDTO = new SalesDTO();
                            try {
                                sDTO.setShopType(accountDTO.getShopType());
                            } catch (UnsupportedOperationException ignored) {
                            }
                            try {
                                sDTO.setShopId(accountDTO.getShopId());
                            } catch (UnsupportedOperationException ignored) {
                            }
                            sDTO.setOrderNo(getTagValue("ORD_NO", eElement));
                            sDTO.setOrderedDate(CommonUtils.parseTime("interpark", getTagValue("ORDER_DTS", eElement)));
                            sDTO.setPaidDate(CommonUtils.parseTime("interpark", getTagValue("PAY_DTS", eElement)));
                            sDTO.setPcc(getTagValue("RESIDENT_NO", eElement));
                            sDTO.setInputDate(CommonUtils.parseTime("interpark", date_list.get(i)));

                            NodeList productList = eElement.getElementsByTagName("PRD");
                            for (int k = 0; k < productList.getLength(); k++) {
                                Node productNode = productList.item(j);
                                if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                                    Element productElement = (Element) productNode;
                                    if (path.contains("orderCompListForSingle")) {
                                        sDTO.setStatus("URCHASE_DECIDED");
                                    } else if (path.contains("DelvArrCompListForSingle")) {
                                        sDTO.setStatus("FINAL_DELIVERY");
                                    } else {
                                        Map<String, String> status = new HashMap<>();
                                        status.put("50", "INSTRUCT");
                                        status.put("70", "DELIVERING");
                                        status.put("75", "FINAL_DELIVERY");
                                        status.put("80", "PURCHASE_DECIDED");
                                        sDTO.setStatus(getTagValue("CURRENT_STATE", productElement));
                                    }
                                    sDTO.setShipmentDate(CommonUtils.parseTime("interpark", getTagValue("DELV_DTS", eElement)));
                                    sDTO.setDeliveredDate(CommonUtils.parseTime("interpark2", getTagValue("DELV_COMPLETE_DT", eElement)));
                                    sDTO.setConfirmDate(CommonUtils.parseTime("interpark", getTagValue("ORD_COMP_DTS", eElement)));
                                    sDTO.setProductNo(getTagValue("PRD_NO", productElement));
                                    sDTO.setOptionNo(getTagValue("OPT_PRD_NO", productElement));
                                    sDTO.setProductName(getTagValue("PRD_NM", productElement));
                                    sDTO.setOptionName(getTagValue("IN_OPT_NM", productElement));
                                    sDTO.setQuantity(getIntegerTagValue("ORD_QTY", productElement));
                                    sDTO.setSalesAmount(getIntegerTagValue("REAL_SALE_UNITCOST", productElement));
                                    sDTO.setPaymentAmount(getIntegerTagValue("ORD_AMT", productElement));
                                    sDTO.setDeliveryCharges(getIntegerTagValue("DEL_AMT", productElement));
                                    sDTO.setDeliveryCharges_2(getIntegerTagValue("ADD_DEL_AMT", productElement));
                                    sDTO.setProductInstantDiscountAmount(getIntegerTagValue("PRE_USE_AMT", productElement));
                                    sDTO.setSellerDiscountCouponAmount(getIntegerTagValue("ENTR_DC_COUPON_AMT", productElement));
                                    sDTO.setShoppingMallDiscountAmount(getIntegerTagValue("DC_COUPON_AMT", productElement));
                                    sDTO.setOrderAmount(getIntegerTagValue("REAL_SALE_UNITCOST", productElement));
                                    sDTO.setInstantDiscountCoupon(0);
                                    sDTO.setDownloadableCoupon(0);
                                    sDTO.setProductDiscountCouponAmount(0);
                                    sDTO.setProductPurchaseDiscountAmount(0);
                                    sDTO.setSellerPurchaseDiscountAmount(0);
                                    sDTO.setSellerDiscountsAmount(0);
                                    sDTO.setSettlementAmount(0);
                                    if (sDTO.getQuantity() != null && sDTO.getSalesUnitPrice() != null && sDTO.getPaymentAmount() != null) {
                                        Integer amount = sDTO.getQuantity() * sDTO.getSalesUnitPrice();
                                        Integer discountAmount = amount - sDTO.getPaymentAmount();
                                        sDTO.setSalesAmount(amount);
                                        sDTO.setDiscountAmount(discountAmount);
                                    }
                                    sDTO.setShipmentNo(getTagValue("DELV_NO", productElement));
                                    sDTO.setSellerProductNo(getTagValue("ENTR_PRD_NO", productElement));

                                    sList.add(sDTO);
                                }
                            }
                        }
                    }
                }
            }
        }
        return sList;
    }

    public List<ReturnDTO> getReturnData(List<String> date_list) throws Exception{
        List<ReturnDTO> rList = new ArrayList<>();

        for(int i=0; i+1 < date_list.size(); i++){
            System.out.println("인터파크 " + accountDTO.getShopId() + "의 " + date_list.get(i) + " 반품 데이터 조회중..");

            String path = "/order/OrderClmAPI.do?_method=clmListForSingle";
            Map<String, String> params = new HashMap<>();
            params.put("sc", "sc");
            params.put("sc.entrId", accountDTO.getVendorId());
            params.put("sc.supplyEntrNo", accountDTO.getVendorId());
            params.put("sc.supplyCtrtSeq", accountDTO.getApiSecretKey());
            params.put("sc.strDate", date_list.get(i));
            params.put("sc.endDate", date_list.get(i+1));

            String responseBody = null;
            try {
                responseBody = new APIClient(accountDTO).interparkGet(path, params);
            } catch (IOException e) {
                e.printStackTrace();
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(responseBody)));

            doc.getDocumentElement().normalize();
            NodeList nList = doc.getElementsByTagName("ORDER");

            for (int j = 0; j < nList.getLength(); j++) {
                Node nNode = nList.item(j);
                if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                    Element eElement = (Element) nNode;
                    ReturnDTO rDTO = new ReturnDTO();
                    try {rDTO.setShopType(accountDTO.getShopType());} catch (UnsupportedOperationException ignored) {}
                    try {rDTO.setShopId(accountDTO.getShopId());} catch (UnsupportedOperationException ignored) {}
                    rDTO.setOrderNo(getTagValue("ORD_NO", eElement));
                    rDTO.setRegDate(CommonUtils.parseTime("interpark", getTagValue("CLM_DTS", eElement)));
                    rDTO.setInputDate(CommonUtils.parseTime("interpark", date_list.get(i)));

                    NodeList productList = eElement.getElementsByTagName("PRD");
                    for (int k = 0; k < productList.getLength(); k++) {
                        Node productNode = productList.item(j);
                        if (nNode.getNodeType() == Node.ELEMENT_NODE) {
                            Element productElement = (Element) productNode;
                            Map<String, String> status = new HashMap<>();
                            status.put("클레임접수", "CANCEL_REQUEST");
                            status.put("반품/교환수거지시", "RETURN_REQUEST");
                            status.put("반품/교환수거지시확인", "RETURN_REQUEST");
                            status.put("반품/교환입고완료", "RETURN_DONE");
                            status.put("교환/재배송출고예정_물류", "EXCHANGE_REQUEST");
                            status.put("교환/재배송출고지시", "EXCHANGE_REDELIVERING");
                            status.put("교환/재배송출고확인_업체", "EXCHANGE_REDELIVERING");
                            status.put("교환/재배송전담택배픽업요청_업체", "EXCHANGE_REDELIVERING");
                            status.put("교환/재배송출고완료", "EXCHANGE_DONE");
                            status.put("클레임확정_환불완료", "CANCEL");
                            status.put("클레임취소", "CANCEL_REJECT");
                            rDTO.setStatus(status.get(getTagValue("CURRENT_CLMPRD_STATNM", productElement)));
                            rDTO.setOptionNo(getTagValue("OPT_PRD_NO", productElement));

                            rList.add(rDTO);
                        }
                    }
                }
            }
        }
        return rList;
    }
}
