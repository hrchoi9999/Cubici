package egovframework.azon.shop.service;


import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.SettlementDTO;
import egovframework.azon.shop.mapper.SalesMapper;
import egovframework.azon.shop.mapper.SettlementMapper;
import egovframework.azon.shop.util.api.CoupangAPI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static java.lang.Math.min;

@RequiredArgsConstructor
@Service
public class SettlementService {

    private final SettlementMapper settlementMapper;
    private final SalesMapper salesMapper;

    public void saveCoupangSettlement(AccountDTO accountDTO) throws Exception {
        Timestamp input_date = settlementMapper.findByShopTypeAndShopIdOrderByInputDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        List<String> date_list = new ArrayList<>();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");

        Calendar cal = new GregorianCalendar();
        Date date = new Date();
        cal.setTime(date);
        if(input_date == null){
            for(int i = 0; i <= 12; i++){
                date = cal.getTime();
                date_list.add(formatter.format(date));
                cal.add(Calendar.MONTH, -1);
            }
        }else{
            String start_month = formatter.format(input_date);
            String temp = "";
            cal.setTime(date);
            date = cal.getTime();
            while(!start_month.equals(temp)){
                temp = formatter.format(date);
                date_list.add(temp);
                cal.add(Calendar.MONTH, -1);
                date = cal.getTime();
            }
        }

        int day_limit = 9999;
        CoupangAPI coupangAPI = new CoupangAPI(accountDTO, salesMapper);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<SettlementDTO> settlements = coupangAPI.getSettlementData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(SettlementDTO s : settlements){
                settlementMapper.saveAll(s);
            }
        }
    }
}
