package egovframework.azon.shop.component;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.service.AccountService;
import egovframework.azon.shop.service.ReturnService;
import egovframework.azon.shop.service.SalseService;
import egovframework.azon.shop.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@RequiredArgsConstructor
@Component
public class CoupangApiComponent {

    private final AccountService accountService;
    private final ReturnService returnService;
    private final SalseService salseService;
    private final SettlementService settlementService;

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveCoupangSales() throws Exception {
        List<AccountDTO> coupangAccounts = accountService.getListByShop("쿠팡");
        for(AccountDTO account : coupangAccounts){
            salseService.saveCoupangSales(account);
        }
    }

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveCoupangRevenues() throws Exception {
        List<AccountDTO> coupangAccounts = accountService.getListByShop("쿠팡");
        for(AccountDTO account : coupangAccounts){
            salseService.saveCoupangRevenues(account);
        }
    }

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveCoupangReturn() throws Exception {
        List<AccountDTO> coupangAccounts = accountService.getListByShop("쿠팡");
        for(AccountDTO account : coupangAccounts){
            returnService.saveCoupangReturn(account);
        }
    }

    // @Scheduled(cron = "0 0 0 * * *")
    public void saveCoupangSettlement() throws Exception {
        List<AccountDTO> coupangAccounts = accountService.getListByShop("쿠팡");
        for(AccountDTO account : coupangAccounts){
            settlementService.saveCoupangSettlement(account);
        }
    }
}
