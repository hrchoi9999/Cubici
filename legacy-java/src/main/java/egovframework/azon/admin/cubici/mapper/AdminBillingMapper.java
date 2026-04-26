package egovframework.azon.admin.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface AdminBillingMapper {
	
	// 결제현황
	ArrayList<HashMap<String, Object>> selectPaymentList(HashMap<String, Object> params);
	// 결제관리
	ArrayList<HashMap<String, Object>> selectChangeChargeList(HashMap<String, Object> params);
	// 결제관리 - 환급모달
	HashMap<String, Object> selectRefundData(HashMap<String, Object> params);
	// 결제관리 - 환급 완료
	void updateRefundData(HashMap<String, Object> params);
	void updateDetailData(HashMap<String, Object> params);
	
}
