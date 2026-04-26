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
public class InterparkApiComponent {

    private final AccountService accountService;
    private final ReturnService returnService;
    private final SalseService salseService;


    // @Scheduled(cron = "0 0 0 * * *")
    public void saveInterparkSales() throws Exception {
        List<AccountDTO> interparkAccounts = accountService.getListByShop("인터파크");
        for(AccountDTO account : interparkAccounts){
            salseService.saveInterparkSales(account);
        }

    }

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveInterparkReturn() throws Exception {
        List<AccountDTO> interparkAccounts = accountService.getListByShop("인터파크");
        for(AccountDTO account : interparkAccounts){
            returnService.saveInterparkReturn(account);
        }
    }
}
