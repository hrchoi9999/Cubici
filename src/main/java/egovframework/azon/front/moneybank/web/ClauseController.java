package egovframework.azon.front.moneybank.web;


import egovframework.azon.cmmn.CmmMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class ClauseController {
    Logger logger = LoggerFactory.getLogger(ClauseController.class);

    @RequestMapping(value = "/moneybank/advcalc/request/clause-details/{cnt}", method = RequestMethod.GET)
    public ModelAndView calcRequestGet(@PathVariable String cnt) {
        logger.debug("[ /moneybank/clause-details/" + cnt + " ]");

        ModelAndView mav = new ModelAndView();
        try {
            mav.setViewName("/cubici/moneybank/clauseDetails/details"+cnt);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mav;
    }
}
