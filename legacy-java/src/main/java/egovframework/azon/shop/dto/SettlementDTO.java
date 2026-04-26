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
public class SettlementDTO {
    private String shopType;
    private String shopId;
    private String subStore;
    private String settlementType;
    private Timestamp settlementDate;
    private Integer totalSale;
    private Integer serviceFee;
    private Integer settlementTargetAmount;
    private Integer settlementAmount;
    private Integer pendingReleasedAmount;
    private Integer sellerDiscountCoupon;
    private Integer downloadableCoupon;
    private Integer sellerServiceFee;
    private Integer storeFeeDiscount;
    private Integer debtOfLastWeek;
    private String bankAccountHolder;
    private String bankName;
    private String bankAccount;
    private String status;
    private Timestamp inputDate;
    private Timestamp updDate;
}
