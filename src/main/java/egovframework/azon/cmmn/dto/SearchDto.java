package egovframework.azon.cmmn.dto;

import lombok.Getter;

@Getter
public enum SearchDto {
	BoardSearchKey("keyword"),
	UserStatus("NKeyword,CKeyword,IdKeyword"),
	PartnerSearchKey("FNKeyword,PSKeyword,RNKeyword,FOKeyword"),
	PromoSearchKey("PCKeyword,PNKeyword");
	
	private String[] searchkey;
	
	SearchDto(String searchkey) {
		String[] searchKeyArr = searchkey.split(",");
		this.searchkey = searchKeyArr;
	}
}
