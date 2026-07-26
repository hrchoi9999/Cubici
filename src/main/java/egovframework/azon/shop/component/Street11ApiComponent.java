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
public class Street11ApiComponent {

    private final AccountService accountService;
    private final ReturnService returnService;
    private final SalseService salseService;

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveStreet11Sales() throws Exception {
        List<AccountDTO> street11Accounts = accountService.getListByShop("11번가");
        for(AccountDTO account : street11Accounts){
            salseService.saveStreet11Sales(account);
        }
    }

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveStreet11Return() throws Exception {
        List<AccountDTO> street11Accounts = accountService.getListByShop("11번가");
        for(AccountDTO account : street11Accounts){
            returnService.saveStreet11Return(account);
        }
    }
}
