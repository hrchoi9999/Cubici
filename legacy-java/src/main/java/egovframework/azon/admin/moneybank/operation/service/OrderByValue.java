package egovframework.azon.admin.moneybank.operation.service;

import java.util.Arrays;

import lombok.Getter;

@Getter
public enum OrderByValue {
	latest("mb_contract_date desc"),
	past("mb_contract_date asc"),
	limit("sales_limit_per_case desc"),
	feeRate("fee_rate desc");
	
	private String orderBy;
	
	OrderByValue(String orderBy) {
		this.orderBy = orderBy;
	}
	
	public static String findByOrderByValue(String orderBy) {
		return Arrays.stream(OrderByValue.values())
				.filter(orderByValue -> orderByValue.name().equals(orderBy))
				.findFirst().get().getOrderBy();
	}
}
