package egovframework.azon.admin.moneybank.operation.web;

import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.moneybank.operation.service.ManageService;
import egovframework.azon.cmmn.CmmMessage;

@Controller
public class ManageController{

    Logger logger = LoggerFactory.getLogger(ManageController.class);

    @Autowired
    ManageService manageService;

    @RequestMapping(value="/admin/moneybank/manage")
    public ModelAndView mbManageIndex() {
        logger.debug("[ /admin/moneybank/manage ]");

        ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
        mav.addObject("pageName", "/admin/moneybank/operation/manageIndex");
        HashMap<String,Object> pcsParamMap = new HashMap<String, Object>();
        pcsParamMap.put("DIVISION", 1);
        ArrayList<HashMap<String, Object>> pcsItemList = manageService.getPrizmItemList(pcsParamMap);
        ArrayList<HashMap<String, Object>> pcsItemGradeList = manageService.getPrizmItemGradeList(pcsParamMap);

        HashMap<String,Object> pmsParamMap = new HashMap<String, Object>();
        pmsParamMap.put("DIVISION", 2);
        ArrayList<HashMap<String, Object>> pmsItemList = manageService.getPrizmItemList(pmsParamMap);
        ArrayList<HashMap<String, Object>> pmsItemGradeList = manageService.getPrizmItemGradeList(pmsParamMap);

        mav.addObject("pcsItemList", pcsItemList);
        mav.addObject("pcsItemGradeList", pcsItemGradeList);
        mav.addObject("pmsItemList", pmsItemList);
        mav.addObject("pmsItemGradeList", pmsItemGradeList);

        return mav;
    }
}
