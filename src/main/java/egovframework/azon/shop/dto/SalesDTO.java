package egovframework.azon.shop.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@Component
public class SalesDTO {
    private String shopType;
    private String shopId;
    private String subStore;
    private String orderNo;
    private String status;
    private Timestamp orderedDate;
    private Timestamp paidDate;
    private Timestamp shipmentDate;
    private Timestamp deliveredDate;
    private Timestamp confirmDate;
    private Timestamp settleEstimateDate;
    private Timestamp settleCompleteDate;
    private String productNo;
    private String optionNo;
    private String productName;
    private String optionName;
    private Integer quantity;
    private Integer salesUnitPrice;
    private Integer salesAmount;
    private Integer discountAmount;
    private Integer paymentAmount;
    private Integer settleEstimateAmount;
    private Integer settlementAmount;
    private String pcc;
    private String shipmentNo;
    private String sellerProductNo;
    private String canceled;
    private String ordererId;
    private String ordererName;
    private String shipmentBoxNo;
    private Integer optionSalesAmount;
    private String deliveryMethod;
    private Integer deductionAmount;
    private String overseaDeliveryYn;
    private String shippingPolicy;
    private Timestamp inputDate;
    private Timestamp updDate;

    //추가된 컬럼
    private Integer deliveryCharges;
    private Integer deliveryCharges_2;
    private Integer instantDiscountCoupon;
    private Integer downloadableCoupon;
    private Integer productInstantDiscountAmount;
    private Integer productDiscountCouponAmount;
    private Integer productPurchaseDiscountAmount;
    private Integer sellerDiscountCouponAmount;
    private Integer sellerPurchaseDiscountAmount;
    private Integer sellerDiscountsAmount;
    private String sellerPurchaseDiscountType;
    private Integer shoppingMallDiscountAmount;
    private Integer orderAmount;

}