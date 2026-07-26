package egovframework.azon.shop.component;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.service.AccountService;
import egovframework.azon.shop.service.ReturnService;
import egovframework.azon.shop.service.SalseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Component
public class EsmApiComponent {

    private final AccountService accountService;
    private final ReturnService returnService;
    private final SalseService salseService;

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveEsmSales() throws Exception {
        List<AccountDTO> esmAccounts = new ArrayList<>();
        esmAccounts.addAll(accountService.getListByShop("지마켓"));
        esmAccounts.addAll(accountService.getListByShop("옥션"));
        for(AccountDTO account : esmAccounts){
            salseService.saveEsmSales(account);
        }
    }

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveEsmReturn() throws Exception {
        List<AccountDTO> esmAccounts = new ArrayList<>();
        esmAccounts.addAll(accountService.getListByShop("지마켓"));
        esmAccounts.addAll(accountService.getListByShop("옥션"));
        for(AccountDTO account : esmAccounts){
            returnService.saveEsmReturn(account);
        }
    }
}
