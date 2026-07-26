package egovframework.azon.admin.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;


@Mapper
public interface AdminMoneyBankOpsMapper {
	
	// 머니뱅크 운영 -> 신청 접수 데이터
	ArrayList<HashMap<String, Object>> selectRequestGet(HashMap<String, Object> params);
	
	// 헬로페이 선지급 신청 목록
	ArrayList<HashMap<String, Object>> selectRequestList(HashMap<String, Object> params);
	
	// 상환건 리스트
	ArrayList<HashMap<String, Object>> selectMoneybankRepay(HashMap<String, Object> params);
	
	// 상환건별 이력 리스트
	// ArrayList<HashMap<String, Object>> selectRepayHistory(HashMap<String, Object> params);
	
	// 상환 평가 입력
	void insertRepayEval(HashMap<String, Object> params);
	
	// 전화 확인 데이터 insert
	// void insertConfirmTel(HashMap<String, Object> params);

	// 상세모달 확인 데이터 리스트
	// ArrayList<HashMap<String, Object>> selectTelConfirmList(HashMap<String, Object> params);

	// 확인 데이터 추가
	// HashMap<String, Object> selectInsertTelData(HashMap<String, Object> params);
	
}
