package egovframework.azon.shop.util;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.function.Consumer;

public class CommonUtils {
    public static List<String> getDays(String date, String type, int count, String endDate) throws Exception {
        List<String> list = new ArrayList<>();
        SimpleDateFormat dayFormat;
        if (type.equals("11st")) {
            dayFormat = new SimpleDateFormat("yyyyMMddHHmm", Locale.KOREA);
        } else if (type.equals("coupang")) {
            dayFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.KOREA);
        } else if(type.equals("weamap")) {
            dayFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        } else {
            dayFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.KOREA);
        }

        Date day = dayFormat.parse(date);
        Date day2;

        Calendar cal = new GregorianCalendar();
        cal.setTime(day);
        day2 = dayFormat.parse(endDate);

        int result;
        result = day2.compareTo(day);
        while (result == 1) {
            list.add(dayFormat.format(day));

            cal.add(Calendar.DATE, count);

            day = (cal.getTime());
            result = day2.compareTo(day);
            if (result <= 0) {
                list.add(dayFormat.format(day2));
            }
        }
        return list;
    }

    public static List<String> getDays(String date, String type, int count) {
        List<String> list = new ArrayList<>();
        SimpleDateFormat dayFormat;
        SimpleDateFormat inputDayFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.KOREA);
        if (type.equals("11st")) {
            dayFormat = new SimpleDateFormat("yyyyMMddHHmm", Locale.KOREA);
        } else if (type.contains("coupang") || type.contains("esm")) {
            dayFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.KOREA);
        } else if (type.equals("wemap")) {
            dayFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.KOREA);
        } else if (type.equals("interpark")) {
            dayFormat = new SimpleDateFormat("yyyyMMdd000000", Locale.KOREA);
        } else if (type.equals("street11")) {
            dayFormat = new SimpleDateFormat("yyyyMMddHHmm", Locale.KOREA);
        } else if (type.equals("naver")) {
            dayFormat = new SimpleDateFormat("EEE MMM dd yyyy '00:00:00 GMT+0900 (대한민국 표준시)'", new Locale("en", "US"));
        } else {
            dayFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.KOREA);
        }

        Date day;
        Date day2 = new Date();
        Calendar cal = new GregorianCalendar();
        Calendar cal2 = new GregorianCalendar();

        cal2.setTime(day2);
        cal2.add(Calendar.MINUTE, -10);
        if(type.equals("coupang_revenue")){
            cal2.add(Calendar.DATE, -1);
        }
        day2 = cal2.getTime();
        int result;
        try {
            day = inputDayFormat.parse(date);
            result = day2.compareTo(day);
            while (result > 0) {
                list.add(dayFormat.format(day));
                cal.setTime(day);
                cal.add(Calendar.DATE, count);

                day = (cal.getTime());
                result = day2.compareTo(day);
                if (result < 0) {
                    list.add(dayFormat.format(day2));
                }
            }

            if (type.equals("wemap")) {
                for (int i = 0; i < list.size(); i++) {
                    Date date1 = dayFormat.parse(list.get(i));

                    Calendar cal1 = Calendar.getInstance();
                    cal1.setTime(date1);
                    cal1.add(Calendar.SECOND, -i);

                    list.set(i, dayFormat.format(cal1.getTime()));
                }
            }

            return list;
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return list;
    }

    public static Timestamp parseTime(String shopType, String time) {
        if(time == null || time.length() < 1){
            return null;
        }
        Timestamp timestamp = null;
        String pattern = "yyyy-MM-dd";
        switch (shopType) {
            case "coupang":
                pattern = "yyyy-MM-dd'T'HH:mm:ss";
                break;
            case "coupang2":
            case "11st":
                pattern = "yyyy-MM-dd HH:mm:ss";
                break;
            case "naver":
                time = time.replaceAll("\\+09:00", "");
                pattern = "yyyy-MM-dd'T'HH:mm:ss";
                break;
            case "11st2":
                pattern = "yyyyMMddHHmm";
                break;
            case "interpark":
                pattern = "yyyyMMddHHmmss";
                break;
            case "interpark2":
                pattern = "yyyyMMdd";
                break;
            case "esm":
                time = time.replaceAll("Z", "");
                pattern = "yyyy-MM-dd'T'HH:mm:ss";
                break;
        }
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat(pattern);
            Date parsedDate = dateFormat.parse(time);
            timestamp = new Timestamp(parsedDate.getTime());
        } catch(Exception ignored) {
            ignored.printStackTrace();
            return null;}
        return timestamp;
    }

    public static String getTagValue(String tag, Element eElement) {
        if(eElement == null || eElement.getElementsByTagName(tag).item(0) == null){
            return null;
        }
        NodeList nlList = eElement.getElementsByTagName(tag).item(0).getChildNodes();
        Node nValue = nlList.item(0);
        if (nValue == null)
            return null;
        return nValue.getNodeValue();
    }

    public static Integer getIntegerTagValue(String tag, Element eElement) {
        if(eElement == null || eElement.getElementsByTagName(tag).item(0) == null){
            return null;
        }
        NodeList nlList = eElement.getElementsByTagName(tag).item(0).getChildNodes();
        Node nValue = nlList.item(0);
        if (nValue == null){
            return null;
        }else{
            return Integer.parseInt(nValue.getNodeValue());
        }
    }
    
    public static void setStringValue(JsonObject data, String key, Consumer<String> setter) {
        try {
            JsonElement element = data.get(key);
            if (!element.isJsonNull()) {
                setter.accept(element.getAsString());
            }
        } catch (UnsupportedOperationException | NullPointerException ignored) { }
    }
    
    public static void setIntegerValue(JsonObject data, String key, Consumer<Integer> setter) {
        try {
            JsonElement element = data.get(key);
            if (!element.isJsonNull()) {
                setter.accept(element.getAsInt());
            }
        } catch (UnsupportedOperationException | NullPointerException ignored) { }
    }

    public static void setDateValue(JsonObject data, String shopType, String key, Consumer<Timestamp> setter) {
        try {
            JsonElement element = data.get(key);
            if (!element.isJsonNull()) {
                setter.accept(CommonUtils.parseTime(shopType, element.getAsString()));
            }
        } catch (UnsupportedOperationException | NullPointerException ignored) { }
    }
}
