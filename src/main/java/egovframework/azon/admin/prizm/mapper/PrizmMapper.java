package egovframework.azon.admin.prizm.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface PrizmMapper {

	/* ********** Prizm 시작 ********** */
	// 회원 정보 (프리즘)
	HashMap<String, Object> selectPrizmUserInfo(HashMap<String, Object> params);

	// 프리즘 이전 결과 불러오기
	HashMap<String, Object> selectPrizmPcsResult(String mbid);

	HashMap<String, Object> selectShopSalesApi(HashMap<String, Object> params);

	//머니뱅크
	ArrayList<HashMap<String, Object>> selectMBRequestDetailShop(HashMap<String, Object> params);

	// 프리즘 점수 insert
	int insertPrizmScore(HashMap<String, Object> params);

	void inputTerms(HashMap<String, Object> params);
}
