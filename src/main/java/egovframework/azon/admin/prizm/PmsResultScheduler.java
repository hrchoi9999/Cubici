package egovframework.azon.admin.prizm;

import egovframework.azon.admin.prizm.mapper.PmsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PmsResultScheduler {
    @Autowired
    PmsService pmsService;

    @Autowired
    PmsMapper pmsMapper;

    @Scheduled(cron =  "0 0 5 * * *")
    public void accountChangeStatus() {
        pmsMapper.accountChangeStatus();
    }

    @Scheduled(cron = "0 0 5 ? * FRI")
    public void pmsResult() {
        int countData = pmsService.selectPrePmsCount();
//        int lastDay = pmsService.selectPrePmsDate();
//        if(lastDay<14) {
//            if(countData == 0) {
                int failCount = pmsService.selectPmsMBUserRequest();
//            }else {
//            }
//        }else {
//            int failCount = pmsService.selectPmsMBUserRequest();
//        }
    }
}
