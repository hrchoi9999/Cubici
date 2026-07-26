package egovframework.azon.admin.moneybank.operation.service;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import egovframework.azon.admin.moneybank.operation.mapper.CmmMapper;
import egovframework.azon.admin.moneybank.operation.mapper.JudgeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import egovframework.azon.admin.cubici.service.MBReqShopService;
import egovframework.azon.admin.prizm.PrizmService;
import egovframework.azon.admin.moneybank.operation.mapper.ReqMapper;
import egovframework.azon.cmmn.cbc.CBCComponent;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.FileException;
import egovframework.azon.cmmn.exception.MoneyBankException;
import egovframework.azon.cmmn.service.FileService;

@Service
public class ReqService {

	@Autowired
	PrizmService prizmService;

	@Autowired
	MBReqShopService MBReqShopService;

	@Autowired
	ReqMapper reqMapper;

	@Autowired
	CmmMapper cmmMapper;

	@Autowired
	CBCComponent cbcComponent;

	@Autowired
	FileService fileService;

	@Value("#{properties['ReqDocumentFilePath']}")
	private String ReqDocumentFilePath;

	public ArrayList<HashMap<String, Object>> selectMBRequestList(HashMap<String, Object> params) {
		return reqMapper.selectMBRequestList(params);
	}

	public HashMap<String, Object> selectMBRequestSum(HashMap<String, Object> params) {
		return reqMapper.selectMBRequestSum(params);
	}

	// 머니뱅크 계약 정보
	public HashMap<String, Object> getMBRequestDetail(HashMap<String, Object> params) {
		HashMap<String, Object> resultMap = reqMapper.selectMBRequestDetail(params);

		String regNoSecond = resultMap.get("reg_no_second") != null ? cbcComponent.toDecryption(String.valueOf(resultMap.get("reg_no_second"))) : "";

		resultMap.put("reg_no_first", cbcComponent.toDecryption(String.valueOf(resultMap.get("reg_no_first"))));
		resultMap.put("mb_main_acc_bank_code", Bank.findBankNameByBankCode(String.valueOf(resultMap.get("mb_main_acc_bank_code"))));
		resultMap.put("mb_demand_acc_number", cbcComponent.toDecryption(String.valueOf(resultMap.get("mb_demand_acc_number"))));
		resultMap.put("mb_main_acc_number", cbcComponent.toDecryption(String.valueOf(resultMap.get("mb_main_acc_number"))));
		resultMap.put("reg_no_second", regNoSecond);

		return resultMap;
	}

	// 머니뱅크 신청 서류 정보
	public HashMap<String, Object> getMBSubDocDetail(HashMap<String, Object> params) {
		return reqMapper.selectMBSubDocDetail(params);
	}

	// 머니뱅크 신청 파일 리스트
	public HashMap<String, Object> getFileList(HashMap<String, Object> param) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String file_division_pk = String.valueOf(param.get("mbid"));
		param.put("file_division_pk", file_division_pk);

		resultMap.put("CBInfo", getFile(param, "CBInfo"));
		resultMap.put("regNo", getFile(param, "duplicateRegNo"));
		resultMap.put("main", getFile(param, "duplicateMain"));
		resultMap.put("demand", getFile(param, "duplicateDemand"));

		return resultMap;
	}

	private HashMap<String, Object> getFile(HashMap<String, Object> param, String file_division){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		param.put("file_division", file_division);
		if(!fileService.fileList(param).isEmpty()) {
			resultMap = fileService.fileList(param).get(0);
		}
		return resultMap;
	}

	public ArrayList<HashMap<String, Object>> getInfoCallList(HashMap<String, Object> params) {
		return reqMapper.selectInfoCallList(params);
	}

	public void cbFileUpload(HashMap<String, Object> paramMap, List<MultipartFile> fileList) throws FileException, IOException {
		if(!fileList.isEmpty()) {
			String file_division_pk = String.valueOf(paramMap.get("id"));
			paramMap.put("enc_type", "Y");
			paramMap.put("file_division", "CBInfo");
			paramMap.put("file_division_pk", file_division_pk);
			String path =  ReqDocumentFilePath + "/" + file_division_pk;
			fileService.fileUpload(paramMap, fileList, path);
		}
	}

	public void addCBInfo(HashMap<String, Object> params, List<MultipartFile> fileList) throws FileException, IOException {
		cbFileUpload(params, fileList);
		reqMapper.insertCBInfo(params);
	}

	public void addInfoCallDetail(HashMap<String, Object> params) {
		reqMapper.insertInfoCallDetail(params);
	}

	public void setSubComplete(HashMap<String, Object> params) {
		params.put("mb_status", "02");
		cmmMapper.modifyMbStatus(params);
		reqMapper.updateSubStatus(params);
	}

	public void calcPrizmScore(HashMap<String, Object> params) throws ParseException {
		if (String.valueOf(getMBRequestDetail(params).get("mb_status")).equals("02")) {

			prizmService.calcPrizmScore(params);
			params.put("mb_status", "03");
			cmmMapper.modifyMbStatus(params);

		} else {
			throw new MoneyBankException(MoneyBankErrorCode.NotSubmissionDocuments);
		}
	}
}
