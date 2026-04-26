package egovframework.azon.cmmn.util;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import java.io.IOException;

import java.net.URLDecoder;
import java.net.URLEncoder;

import java.util.HashMap;

/* Cookie 수정
 * 2021. 03. 23
 * by KJC */
public class CookieUtil {
	
    // <Cookie 이름, Cookie 객체>
    private HashMap<String, Cookie> cookieMap = new HashMap<>();

    /* 생성자
     * cookie배열을 cookieMap에 저장
     * @param request */
    public CookieUtil(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (int i = 0 ; i < cookies.length ; i++) {
                cookieMap.put(cookies[i].getName(), cookies[i]);
            }
        }
    }
    
    public HashMap<String, Cookie> getCookieMap(){
    	return this.cookieMap;
    }
    
    /* 쿠키 존재 여부
     * @return 존재 : true, 미존재 : false */
    public boolean isExist(String name) {
        return cookieMap.get(name) != null;
    }
    
    public String getCookieValue(String name) throws IOException {
        Cookie cookie = (Cookie)cookieMap.get(name);
        if (cookie == null) {
        	return null;
        }
        return URLDecoder.decode(cookie.getValue(), "utf-8");
    }
    
    /* 쿠키 객체 생성 */
    public Cookie createCookie(String name, String value) throws IOException {
        return new Cookie(name, URLEncoder.encode(value, "utf-8"));
    }
    public Cookie createCookie(String name, String value, String path) throws IOException {
        Cookie cookie = new Cookie(name, URLEncoder.encode(value, "utf-8"));
        cookie.setPath(path);
        return cookie;
    }
    public Cookie createCookie( String name, String value, String path, int maxAge) throws IOException {
        Cookie cookie = new Cookie(name, URLEncoder.encode(value, "utf-8"));
        cookie.setPath(path);
        cookie.setMaxAge(maxAge);
        return cookie;
    }
    public Cookie createCookie(String name, String value, String domain, String path, int maxAge) throws IOException {
        Cookie cookie = new Cookie(name, URLEncoder.encode(value, "utf-8"));
        cookie.setDomain(domain);
        cookie.setPath(path);
        cookie.setMaxAge(maxAge);
        return cookie;
    }
    
    public Cookie getCookie(String name) {
        return (Cookie)cookieMap.get(name);
    }
    
    /* 쿠키 삭제 */
    public Cookie deleteCookie(String cookieKey){
        Cookie cookie = null;
        if(isExist(cookieKey)){
            cookie = getCookie(cookieKey);
            // 쿠키생성시에 setPath()가 설정되어 있으면 삭제시에도 해당 패스를 다시 삭제하기위해서 생성된
            // 쿠키에 재설정하고 setMaxAge(0)으로 설정하며 삭제합니다.
            if(cookie.getPath() != null){
                cookie.setPath(cookie.getPath());
            }else{
                cookie.setPath("/");
            }
            if(cookie.getDomain() != null){
                cookie.setDomain(cookie.getDomain());
            }
            cookie.setMaxAge(0);
        }
        return cookie;
    }
    
}
