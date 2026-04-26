package egovframework.azon.shop.service;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.mapper.AccountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AccountService {

    private final AccountMapper accountMapper;

    public List<AccountDTO> getListByShop(String shop){
        String shopType = shop;
        switch (shopType){
            case "인터파크":
                shopType = "1";
                break;
            case "지마켓":
                shopType = "2";
                break;
            case "옥션":
                shopType = "3";
                break;
            case "11번가":
                shopType = "4";
                break;
            case "쿠팡":
                shopType = "11";
                break;
            case "네이버":
                shopType = "14";
                break;
        }
        return accountMapper.findByShopType(shopType);
    }


}
