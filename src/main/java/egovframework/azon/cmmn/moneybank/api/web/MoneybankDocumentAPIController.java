package egovframework.azon.cmmn.moneybank.api.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import egovframework.azon.cmmn.moneybank.api.service.MoneybankDocumentAPIService;

@Controller
public class MoneybankDocumentAPIController {
	Logger logger = LoggerFactory.getLogger(MoneybankDocumentAPIController.class);
	
	@Autowired
	MoneybankDocumentAPIService moneybankDocumentAPIService;
}
