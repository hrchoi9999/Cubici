package egovframework.azon.shop.service;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.SalesDTO;
import egovframework.azon.shop.mapper.SalesMapper;
import egovframework.azon.shop.util.CommonUtils;
import egovframework.azon.shop.util.api.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static java.lang.Math.min;

@RequiredArgsConstructor
@Service
public class SalseService {

    private final SalesMapper salesMapper;

    public void saveCoupangSales(AccountDTO accountDTO) throws Exception{
        Timestamp order_date = new Timestamp(System.currentTimeMillis() - (1 * 24 * 60 * 60 * 1000));
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        if(order_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "coupang", 31);
        }else{
            Date start_date = order_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "coupang", 31);
        }

        int day_limit = 9999;
        CoupangAPI coupangAPI = new CoupangAPI(accountDTO, salesMapper);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<SalesDTO> sales = coupangAPI.getSalesDataByDate(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(SalesDTO s : sales){
                salesMapper.saveAll(s);
            }
        }
    }

    public void saveCoupangRevenues(AccountDTO accountDTO) throws Exception {
//        Timestamp order_date = salesMapper.findByShopTypeAndShopIdOrderByUpdDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        Timestamp order_date = new Timestamp(System.currentTimeMillis() - (1 * 24 * 60 * 60 * 1000));
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        
        if(order_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "coupang_revenue", 27); // 쿠팡 api 오류로 30일이상 설정시, 오류 발생

        }else{
            Date start_date = order_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "coupang_revenue", 27); // 쿠팡 api 오류로 30일이상 설정시, 오류 발생
        }

        int day_limit = 9999;
        CoupangAPI coupangAPI = new CoupangAPI(accountDTO, salesMapper);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<SalesDTO> revenues = coupangAPI.getRevenueData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(SalesDTO r : revenues){
                salesMapper.saveAll(r);
                List<SalesDTO> sales = coupangAPI.getSalesDataByOrderNo(r.getOrderNo());
                for(SalesDTO s : sales){
                    salesMapper.saveAll(s);
                }
            }
        }
    }

    public void saveNaverSales(AccountDTO accountDTO) throws Exception {
//        Timestamp input_date = salesMapper.findByShopTypeAndShopIdOrderByOrderDateDesc(accountDTO.getShopType(), accountDTO.getShopId());

        Timestamp input_date = new Timestamp(System.currentTimeMillis() - (1 * 24 * 60 * 60 * 1000));
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        if(input_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "naver", 1);

        }else{
            Date start_date = input_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "naver", 1);
        }

        int day_limit = 9999;
        NaverAPI naverAPI = new NaverAPI(accountDTO);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<SalesDTO> sales = naverAPI.getSalesData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(SalesDTO s : sales){
                salesMapper.saveAll(s);
            }
        }
    }

    public void saveInterparkSales(AccountDTO accountDTO) throws Exception {
//        Timestamp input_date = salesMapper.findByShopTypeAndShopIdOrderByOrderDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        Timestamp input_date = new Timestamp(System.currentTimeMillis() - (1 * 24 * 60 * 60 * 1000));
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        if(input_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "interpark", 1); //최대 조회기간 1일

        }else{
            Date start_date = input_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "interpark", 1);
        }

        int day_limit = 9999;
        InterparkAPI interparkAPI = new InterparkAPI(accountDTO);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<SalesDTO> sales = interparkAPI.getSalesData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(SalesDTO s : sales){
                salesMapper.saveAll(s);
            }
        }
    }

    public void saveStreet11Sales(AccountDTO accountDTO) throws Exception {
//        Timestamp input_date = salesMapper.findByShopTypeAndShopIdOrderByOrderDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        Timestamp input_date = new Timestamp(System.currentTimeMillis() - (20 * 24 * 60 * 60 * 1000));
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        if(input_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "street11", 7); //최대 1주일까지 조회가능

        }else{
            Date start_date = input_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "street11", 7);
        }

        int day_limit = 9999;
        Street11API street11API = new Street11API(accountDTO, salesMapper);

        for(int id = 0; id < date_list.size(); id += day_limit){
            List<SalesDTO> sales = street11API.getSalesData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(SalesDTO s : sales){
                salesMapper.saveAll(s);
            }
        }
    }

    public void saveEsmSales(AccountDTO accountDTO) throws Exception {
//        Timestamp order_date = salesMapper.findByShopTypeAndShopIdOrderByOrderDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        Timestamp order_date = new Timestamp(System.currentTimeMillis() - (1 * 24 * 60 * 60 * 1000));
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        if(order_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "esm", 30);
        }else{
            Date start_date = order_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "esm", 30);
        }

        int day_limit = 9999;
        EsmAPI esmAPI = new EsmAPI(accountDTO);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<SalesDTO> sales = esmAPI.getSalesData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(SalesDTO s : sales){
                salesMapper.saveAll(s);
            }
        }
    }
}
