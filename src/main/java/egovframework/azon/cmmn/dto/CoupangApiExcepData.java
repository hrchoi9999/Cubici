package egovframework.azon.cmmn.dto;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import lombok.Getter;

@Getter
public enum CoupangApiExcepData {
	blacnkVar("", Arrays.asList("confirmDate", "productName")),
	zeroVar("0", Arrays.asList("instantCouponDiscount", "downloadableCoupon", "downloadableCouponDiscount", "coupangDiscount", "serviceFeeRatio")),
	pass("pass", Arrays.asList("externalVendorSkuCode", "externalSellerSkuCode", "orderItemName", "orderPackageId", "orderPackageName", "targetItemName", "cancelReason", "deliveredDate")),
	EMPTY("null", Collections.emptyList());
	
	private final String result;
	private final List<String> excepList;
	
	CoupangApiExcepData(String result, List<String> excepList) {
		this.result = result;
		this.excepList = excepList;
	}
	
	public static CoupangApiExcepData findByExcepResult(String value) {
		return Arrays.stream(CoupangApiExcepData.values())
				.filter(coupangApiExcepData -> coupangApiExcepData.hasExcept(value))
				.findAny()
				.orElse(EMPTY);
	}
	
	public boolean hasExcept (String value) {
		return excepList.stream().anyMatch(result -> result.equals(value));
	}
}
