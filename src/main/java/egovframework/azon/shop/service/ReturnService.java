package egovframework.azon.shop.service;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.azon.shop.dto.ReturnDTO;
import egovframework.azon.shop.mapper.ReturnMapper;
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
public class ReturnService {

    private final ReturnMapper returnMapper;
    private final SalesMapper salesMapper;

    public void saveCoupangReturn(AccountDTO accountDTO) throws Exception {
        Timestamp input_date = returnMapper.findByShopTypeAndShopIdOrderByRegDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        if(input_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "coupang", 30); //timeout이 자주 발생시, 수정
        }else{
            Date start_date = input_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "coupang", 30); //timeout 발생시, 수정
        }

        int day_limit = 9999;
        CoupangAPI coupangAPI = new CoupangAPI(accountDTO, salesMapper);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<ReturnDTO> returns = coupangAPI.getReturnData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(ReturnDTO r : returns){
                returnMapper.saveAll(r);
            }
        }
    }

    public void saveNaverReturn(AccountDTO accountDTO) throws Exception {
        Timestamp input_date = returnMapper.findByShopTypeAndShopIdOrderByInputDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
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
            // 주문데이터 조회 api
            List<ReturnDTO> returns = naverAPI.getReturnData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(ReturnDTO r : returns){
                returnMapper.saveAll(r);
            }
        }
    }

    public void saveStreet11Return(AccountDTO accountDTO) throws Exception {
        Timestamp input_date = returnMapper.findByShopTypeAndShopIdOrderByInputDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        if(input_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "street11", 30); //최대 30일까지 조회가능

        }else{
            Date start_date = input_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "street11", 30); //최대 30일까지 조회가능
        }

        int day_limit = 9999;
        Street11API street11API = new Street11API(accountDTO, salesMapper);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<ReturnDTO> returns = street11API.getReturnData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(ReturnDTO r : returns){
                returnMapper.saveAll(r);
            }
        }
    }

    public void saveInterparkReturn(AccountDTO accountDTO) throws Exception {
        Timestamp input_date = returnMapper.findByShopTypeAndShopIdOrderByInputDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
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
            List<ReturnDTO> returns = interparkAPI.getReturnData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(ReturnDTO r : returns){
                returnMapper.saveAll(r);
            }
        }
    }

    public void saveEsmReturn(AccountDTO accountDTO) throws Exception {
        Timestamp order_date = returnMapper.findByShopTypeAndShopIdOrderByRegDateDesc(accountDTO.getShopType(), accountDTO.getShopId());
        List<String> date_list;
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

        if(order_date == null){
            Calendar cal = new GregorianCalendar();
            Date date = new Date();

            cal.setTime(date);
            cal.add(Calendar.MONTH, -1);
            date = cal.getTime();

            date_list = CommonUtils.getDays(formatter.format(date), "esm", 7); // 7일까지 조회 가능
        }else{
            Date start_date = order_date;
            date_list = CommonUtils.getDays(formatter.format(start_date), "esm", 7);
        }

        int day_limit = 9999;
        EsmAPI esmAPI = new EsmAPI(accountDTO);
        for(int id = 0; id < date_list.size(); id += day_limit){
            List<ReturnDTO> returns = esmAPI.getReturnData(new ArrayList<>(date_list.subList(id, min(id + day_limit, date_list.size()))));
            for(ReturnDTO r : returns){
                returnMapper.saveAll(r);
            }
        }
    }
}
