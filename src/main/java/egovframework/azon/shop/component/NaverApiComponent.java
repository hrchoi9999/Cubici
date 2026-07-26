package egovframework.azon.shop.component;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.service.AccountService;
import egovframework.azon.shop.service.ReturnService;
import egovframework.azon.shop.service.SalseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@RequiredArgsConstructor
@Component
public class NaverApiComponent {

    private final AccountService accountService;
    private final ReturnService returnService;
    private final SalseService salseService;

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveNaverSales() throws Exception {
        List<AccountDTO> naverAccounts = accountService.getListByShop("네이버");
        for(AccountDTO account : naverAccounts){
            salseService.saveNaverSales(account);
        }
    }

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveNaverReturn() throws Exception {
        List<AccountDTO> naverAccounts = accountService.getListByShop("네이버");
        for(AccountDTO account : naverAccounts){
            returnService.saveNaverReturn(account);
        }
    }
}
