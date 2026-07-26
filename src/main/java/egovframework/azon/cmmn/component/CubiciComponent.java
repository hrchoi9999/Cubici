package egovframework.azon.cmmn.component;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

@Component
public class CubiciComponent {
    public long getTomorrowInSecond() {
        Date today = new Date();
        Calendar c = Calendar.getInstance();

        c.setTime(today);
        c.add(Calendar.DATE, 1);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);

        Date tomorrow = c.getTime();

        long result = (tomorrow.getTime() - today.getTime()) / 1000;

        return result;
    }

    public String getCookieName(HttpServletRequest request, String param) {
        String result = "";

        if (param != null) {
            HashMap<String, Object> Cookie = CubiciUtils.getCookie(request, param);
            if (!Cookie.isEmpty()) {
                result = param;
            }
        }

        return result;
    }

    public ArrayList<String> getCookieModal(HttpServletRequest request) {
        ArrayList<String> result = new ArrayList<String>();
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                String value = c.getValue();
                if (value.equals("sad")) {
                    result.add(c.getName());
                }
            }
        }
        return result;
    }

    public boolean isUserTypeCheck(String param) {
        boolean result = false;

        HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
        String userType = String.valueOf(principal.get("user_type"));

        if (userType.equals(param)) {
            result = true;
        }

        return result;
    }

    public int getAge(String regNoFirst, String regNoSecond) {
        if (regNoSecond == null) {
            return getAge(regNoFirst);
        }
        return Period.between(LocalDate.of(Integer.parseInt(regNoFirst.substring(0, 2)) + getRegisterCentury(Integer.parseInt(regNoSecond.substring(0, 1)))
                , Integer.parseInt(regNoFirst.substring(2, 4))
                , Integer.parseInt(regNoFirst.substring(4, 6))), LocalDate.now()).getYears();
    }

    private int getAge(String birthDate) {
        return Period.between(LocalDate.parse(birthDate, DateTimeFormatter.BASIC_ISO_DATE), LocalDate.now()).getYears();
    }

    private int getRegisterCentury(Integer regNoSecondFirstNo) {
        switch (regNoSecondFirstNo) {
            case 1:
            case 2:
                return 1900;
            case 3:
            case 4:
                return 2000;
            default:
                throw new IllegalArgumentException("주민번호 뒷자리에 오류가 있습니다.");
        }
    }
}
