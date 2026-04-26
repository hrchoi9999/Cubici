package egovframework.azon.admin.moneybank.operation.service;

import java.util.Arrays;

import lombok.Getter;

@Getter
public enum MbProductCode {
	moneyplus("MP"),
	all("");
	
	private String productCode;
	
	MbProductCode(String productCode) {
		this.productCode = productCode;
	}
	
	public static String findByMbProductCode(String productCode) {
		return Arrays.stream(MbProductCode.values())
				.filter(mbProductCode -> mbProductCode.name().equals(productCode))
				.findFirst().get().getProductCode();
	}
}
