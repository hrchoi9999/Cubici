package egovframework.azon.shop.util;

import lombok.Getter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Getter
public enum ClaimStatus {
    REPURCHASE_WATTING("재결제 대기중",  Arrays.asList("103")),
    RELEASE_STOP_UNCHECKED("출고중지요청", Arrays.asList("RU")),
    CANCEL_REQUEST("취소 요청", Arrays.asList("CANCEL_REQUEST", "01", "601")),
    CANCELING("취소 처리 중", Arrays.asList("CANCELING", "701")),
    CANCEL_DONE("취소 처리 완료", Arrays.asList("CANCEL", "02", "B01", "C01")),
    CANCEL_REJECT("취소 철회", Arrays.asList("CANCEL_REJECT", "05")),
    RETURN_REQUEST("반품 요청", Arrays.asList("RETURN_REQUEST", "UC", "105")),
    EXCHANGE_REQUEST("교환 요청", Arrays.asList("EXCHANGE_REQUEST", "201")),
    COLLECTING("수거 처리 중", Arrays.asList("COLLECTING")),
    COLLECT_DONE("수거 완료", Arrays.asList("COLLECT_DONE")),
    EXCHANGE_REDELIVERING("교환 재배송 중", Arrays.asList("EXCHANGE_REDELIVERING", "301")),
    RETURN_DONE("반품 완료", Arrays.asList("RETURN_DONE", "CC", "106", "A01")),
    EXCHANGE_DONE("교환 완료", Arrays.asList("EXCHANGE_DONE", "221", "302")),
    RETURN_REJECT("반품 철회", Arrays.asList("RETURN_REJECT", "108")),
    EXCHANGE_REJECT("교환 철회", Arrays.asList("EXCHANGE_REJECT", "233")),
    RETURN_HOLDBACK("반품 보류", Arrays.asList("104", "109")),
    EXCHANGE_HOLDBACK("교환 보류", Arrays.asList("214")),
    PURCHASE_DECISION_HOLDBACK("구매 확정 보류", Arrays.asList("PURCHASE_DECISION_HOLDBACK")),
    PURCHASE_DECISION_REQUEST("구매 확정 요청", Arrays.asList("PURCHASE_DECISION_REQUEST")),
    PURCHASE_DECISION_HOLDBACK_RELEASE("구매 확정 보류 해제", Arrays.asList("PURCHASE_DECISION_HOLDBACK_RELEASE")),
    ADMIN_CANCELING("직권 취소 중", Arrays.asList("ADMIN_CANCELING")),
    ADMIN_CANCEL_DONE("직권 취소 완료", Arrays.asList("ADMIN_CANCEL_DONE")),
    ADMIN_CANCEL_REJECT("직권 취소 철회", Arrays.asList("ADMIN_CANCEL_REJECT")),
    ADMIN_RETURN_REJECT("반품 거부", Arrays.asList("107")),
    ADMIN_EXCHANGE_REJECT("교환 거부", Arrays.asList("232")),
    EMPTY("없음", Collections.EMPTY_LIST);
    
    String statusName;
    List<String> statusList;

    ClaimStatus(String statusName, List<String> statusList) {
        this.statusName = statusName;
        this.statusList = statusList;
    }
    
    public static ClaimStatus findbyStatusCode(String code) {
        return Arrays.stream(ClaimStatus.values())
                .filter(status -> status.hasStatusCode(code))
                .findAny()
                .orElse(EMPTY);
    }

    public boolean hasStatusCode(String code) {
        return statusList.stream()
                .anyMatch(status -> status.equals(code));
    }
}
