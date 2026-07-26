package egovframework.azon.shop.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@NoArgsConstructor
@Component
@Getter
public class AccountDTO {
    private String shopType;
    private String shopId;
    private String vendorId;
    private String apiKey;
    private String apiSecretKey;
    private String subStore01;
    private String subStore02;
    private String subStore03;

    public AccountDTO(String shopType, String shopId, String vendorId, String apiKey, String apiSecretKey, String subStore01, String subStore02, String subStore03) {
        this.shopType = shopType;
        this.shopId = shopId;
        this.vendorId = vendorId;
        this.apiKey = apiKey;
        this.apiSecretKey = apiSecretKey;
        this.subStore01 = subStore01;
        this.subStore02 = subStore02;
        this.subStore03 = subStore03;
    }
}