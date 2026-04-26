package egovframework.azon.shop.util;


import lombok.Getter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 각 쇼핑몰에서 들어오는 status 값 정리
 * 
 */
@Getter
public enum Status {
    STANDBY("결제대기", Arrays.asList("102", "103", "PAYMENT_WAITING")),
    PAYED("결제완료", Arrays.asList("201", "202", "ACCEPT", "PAYED")),
    PACKAGING("배송준비중", Arrays.asList("301", "INSTRUCT", "DEPARTURE")),
    DELIVERING("배송중", Arrays.asList("401", "DELIVERING")),
    DELIVERED("배송완료", Arrays.asList("501", "FINAL_DELIVERY", "DELIVERED")),
    PURCHASE_DECIDED("구매확정", Arrays.asList("901", "PURCHASE_DECIDED")),
    NON_TRACKING("직배송", Arrays.asList("NONE_TRACKING")),
    EMPTY("없음", Collections.EMPTY_LIST);
    
    String statusName;
    List<String> statusList;

    Status(String statusName, List<String> statusList) {
        this.statusName = statusName;
        this.statusList = statusList;
    }
    
    public static Status findByStatusCode(String code){
        return Arrays.stream(Status.values())
                .filter(status -> status.hasStatusCode(code))
                .findAny()
                .orElse(EMPTY);
    }
    
    public boolean hasStatusCode(String code) {
        return statusList.stream()
                .anyMatch(status -> status.equals(code));
    }
    
}
