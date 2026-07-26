package egovframework.azon.cmmn.component;

import java.util.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ibm.icu.util.Calendar;

import egovframework.azon.cmmn.security.dto.AdminSecurityUser;
import egovframework.azon.cmmn.security.dto.SecurityUser;

public class CubiciUtils {
	
	static Logger logger = LoggerFactory.getLogger(CubiciUtils.class);

	public static HashMap<String, Object> UserAuthentication(){
		Object authentication = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		HashMap<String, Object> resultMap = new HashMap<String,Object>();
		
		if(!authentication.equals("anonymousUser")) {
			SecurityUser securityUser = (SecurityUser) authentication;
			resultMap = ObjectToHashMap(securityUser);
		}
		
		return resultMap;
	}
	
	public static HashMap<String, Object> AdminAuthentication(){
		Object authentication = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		HashMap<String, Object> resultMap = new HashMap<String,Object>();
		
		if(!authentication.equals("anonymousUser")) {
			AdminSecurityUser securityUser = (AdminSecurityUser) authentication;
			resultMap = ObjectToHashMap(securityUser);
		}
		
		return resultMap;
	}
	
	public static HashMap<String, Object> ObjectToHashMap(Object param){
		ObjectMapper objectMapper = new ObjectMapper();
		HashMap<String, Object> resultMap = objectMapper.convertValue(param, new TypeReference<HashMap<String, Object>>() {});
		return resultMap;
	}
	
	public static ArrayList<HashMap<String, Object>> ObjectToArrayList(Object param){
		ObjectMapper objectMapper = new ObjectMapper();
		ArrayList<HashMap<String, Object>> resultList = objectMapper.convertValue(param, new TypeReference<ArrayList<HashMap<String, Object>>>() {});
		return resultList;
	}
	
	public static HashMap<String, Object> jsonStringToHashMap(String json) {
		HashMap<String, Object> resultMap = new HashMap<>();
		ObjectMapper mapper = new ObjectMapper();
		try {
			resultMap = mapper.readValue(json, new TypeReference<HashMap<String, Object>>() {});
		} catch (JsonMappingException e) {
			logger.error(e.getMessage());
		} catch (JsonProcessingException e) {
			logger.error(e.getMessage());
		}
		return resultMap;
	}
	
	public static JSONObject JObjectAddHashMap(JSONObject jObject, HashMap<String, Object> map) {
		HashMap<String, Object> jMap = CubiciUtils.jsonStringToHashMap(jObject.toString());
		jMap.putAll(map);
		JSONObject resultjObject = new JSONObject(jMap);
		return resultjObject;
	}
	
	public static HashMap<String, Object> QuotesReplace(String[] keyArr, HashMap<String, Object> map) {
		for(String Key : keyArr) {
			String value = String.valueOf(map.get(Key));
			if(!value.equals("null")) {
				value = value.replace("'", "\\'");
				map.put(Key, value);
			}
		}
		return map;
	}
	
	public static String QuotesReplace(String param) {
		String result = param.replace("'", "\\'");
		return result;
	}
	
	public static void setCookie(HttpServletResponse response, String name, String value, int time) {
		Cookie cookie = new Cookie(name, value);
		cookie.setMaxAge(time);
		cookie.setPath("/");
		response.addCookie(cookie);
	}
	
	public static HashMap<String, Object> getCookie(HttpServletRequest request, String name) {
		Cookie[] cookies = request.getCookies();
		HashMap<String, Object> resultMap = new HashMap<>();
		
		if(cookies != null) {
			for(Cookie c : cookies) {
				if(name.equals(c.getName())) {
					resultMap.put(c.getName(), c.getValue());
				}
			}
		}
		return resultMap;
	}
	
	public static void delCookie(HttpServletRequest request, HttpServletResponse response, String name) {
		Cookie cookie = new Cookie("Auth", null);
		cookie.setMaxAge(0);
		cookie.setPath("/");
		cookie.setDomain(request.getServerName());
		response.addCookie(cookie);
	}
	
	public static boolean StringEmpty(String str) {
		return str == null || str.trim().isEmpty();
	}
	
	public static boolean nowDateCompare(String param) throws ParseException {
		boolean result = false;
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		Date now = new Date();
		Date date = dateFormat.parse(param);
		
		if(date.compareTo(now) > 0) {
			result = true;
		}
		
		return result;
	}
	
	public static HashMap<String, Object> getLastMonth(){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		Date today = new Date();
		
		Calendar c = Calendar.getInstance();
		c.setTime(today);
		c.add(Calendar.MONTH, -1);
		
		String fromDate = dateFormat.format(c.getTime());
		String toDate = dateFormat.format(today);
		
		resultMap.put("fromDate", fromDate);
		resultMap.put("toDate", toDate);	
		
		return resultMap;
	}
	
	public static List<String> toArrayList(String param){
		List<String> resultArr = new ArrayList<String>();
		
		if(param.equals("[]") || param.equals("null")) {
			return resultArr;
		}
		
		param  = param.substring(1, param.length()-1);
    	resultArr = Arrays.asList(param.split("\\s*,\\s*"));
    	return resultArr;
    }
	
	public static String getMonthByAlpa(int param) {
		return String.valueOf((char) (param + 64));
	}
	
	public static String findBetweenFirstWords(String param, String str1, String str2) {
		Pattern pattern = Pattern.compile("(\\" + str1 + ")(.*?)(\\" + str2 + ")");
    	Matcher matcher = pattern.matcher(param);
    	
    	String result = "";
    	if(matcher.find()) {
    		result = matcher.group(2);
    	}
    	
		return result;
	}
	
    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

	public static HashMap<String, Object> defaultSetDate() {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.KOREA);
		SimpleDateFormat sdf2 = new SimpleDateFormat("yy/MM/dd HH:mm", Locale.KOREA);

		// 오늘
		java.util.Calendar today = java.util.Calendar.getInstance();
		String todayDateStr = sdf.format(today.getTime());
		String todayDateTimeStr = sdf2.format(today.getTime());

		// 어제
		java.util.Calendar yesterday = java.util.Calendar.getInstance();
		yesterday.add(java.util.Calendar.DATE, -1);
		String yesterdayStr = sdf.format(yesterday.getTime());

		// 일주일전
		java.util.Calendar lastWeek = java.util.Calendar.getInstance();
		lastWeek.add(java.util.Calendar.DATE, -7);
		String lastWeekStr = sdf.format(lastWeek.getTime());

		// 한달 전
		java.util.Calendar lastMonth = java.util.Calendar.getInstance();
		lastMonth.add(java.util.Calendar.MONTH, -1);
		String lastMonthStr = sdf.format(lastMonth.getTime());

		// 두달 전
		java.util.Calendar lastMonth2 = java.util.Calendar.getInstance();
		lastMonth2.add(java.util.Calendar.MONTH, -2);
		String lastMonth2Str = sdf.format(lastMonth2.getTime());

		HashMap<String, Object> resultMap = new HashMap<>();
		resultMap.put("todayDate", todayDateStr);
		resultMap.put("todayDateTime", todayDateTimeStr);

		resultMap.put("fromDate", lastMonthStr);
		resultMap.put("toDate", yesterdayStr);

		resultMap.put("fromDate2", lastMonth2Str);
		resultMap.put("lastWeek", lastWeekStr);

		return resultMap;
	}
}
