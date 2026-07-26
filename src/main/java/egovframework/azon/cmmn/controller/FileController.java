package egovframework.azon.cmmn.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.cmmn.exception.FileException;
import egovframework.azon.cmmn.service.FileService;

@Controller
public class FileController {
	
	Logger logger = LoggerFactory.getLogger(FileController.class);
	
	@Autowired
	FileService fileService;
	
	@RequestMapping(value="/file/list" , method=RequestMethod.POST)
	public ModelAndView fileList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			ArrayList<HashMap<String, Object>> fileList = fileService.fileList(paramMap);
			mav.addObject("fileList", fileList);
		} catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /file/list ] " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	@RequestMapping(value="/file/download", method=RequestMethod.POST)
	public void fileDownload(@RequestBody HashMap<String, Object> paramMap, HttpServletRequest request, HttpServletResponse response) throws IOException {
		try {
			fileService.fileDownload(request, response, paramMap);
		} catch(FileException e) {
			logger.debug(e.getFileErrorCode().FileErrorCodeLog(" [ ERROR ] [ /file/download ] "));
			fileService.StringOutputStream(response, e.getFileErrorCode().getDescription()); 
		} catch(Exception e) {
			logger.debug(" [ ERROR ] [ /file/download ] " + e.getMessage());
		}
	}
}
