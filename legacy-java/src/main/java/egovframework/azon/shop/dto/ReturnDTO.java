package egovframework.azon.shop.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;

@NoArgsConstructor
@Component
@Getter
@Setter
public class ReturnDTO {
    private String shopType;
    private String shopId;
    private String subStore;
    private String orderNo;
    private String status;
    private Integer paymentAmount;
    private String receiptNo;
    private String claimStatus;
    private String paymentNo;
    private String receiptType;
    private Integer totalCancelCount;
    private String returnDeliveryNo;
    private String releaseStopStatus;
    private String preRefund;
    private String completeConfirmType;
    private Integer cancelCount;
    private Integer orderCount;
    private String releaseStatus;
    private String reasonCode;
    private String productNo;
    private String optionNo;
    private Timestamp regDate;
    private Timestamp claimCompleteDate;
    private Timestamp inputDate;
    private Timestamp updDate;
}
