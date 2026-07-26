package egovframework.azon.admin.moneybank.operation.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;


@Mapper
public interface ReqMapper {
	// 헬로페이 선지급 신청 목록
	ArrayList<HashMap<String, Object>> selectMBRequestList(HashMap<String, Object> params);
	// 헬로페이 선지급 신청 합계
	HashMap<String, Object> selectMBRequestSum(HashMap<String, Object> params);
	
	// 머니뱅크 계약 정보
	HashMap<String, Object> selectMBRequestDetail(HashMap<String, Object> params);
	// 머니뱅크 신청 서류 정보
	public HashMap<String, Object> selectMBSubDocDetail(HashMap<String, Object> params);
	// 안내전화 리스트
	public ArrayList<HashMap<String, Object>> selectInfoCallList(HashMap<String, Object> params);
	// 신용정보 입력
	void insertCBInfo(HashMap<String, Object> params);
	// 안내전화 내역 추가
	void insertInfoCallDetail(HashMap<String, Object> params);

	void updateSubStatus(HashMap<String, Object> params);
	
}
