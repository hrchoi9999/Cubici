package egovframework.azon.admin.moneybank.operation.service;

import egovframework.azon.admin.moneybank.operation.mapper.CmmMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;

@Service
public class CmmService {
	@Autowired
	CmmMapper cmmMapper;


//	@Scheduled(cron = "0 0 0 * * *")
	public void contractStatusCheck() {
		cmmMapper.modifyMbStatusByAgreeDate();
	}

	public ArrayList<HashMap<String, Object>> modifyDataByMbStatus(ArrayList<HashMap<String, Object>> List) {
		for (HashMap<String, Object> DataMap : List) {
			String mbStatus = String.valueOf(DataMap.get("mb_status"));
			DataMap.put("color", MbStatus.findByMbStatus(mbStatus).getColor());
			DataMap.put("mb_status_name", MbStatus.findByMbStatus(mbStatus).getMbStatusName());
		}
		return List;
	}
}
