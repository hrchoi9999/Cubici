package egovframework.azon.front.invento.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

/* 재고관리 mapper
 * 2021. 01. 04
 * by KJC */
/* 재고관리 2021. 02. 09 PHJ */
@Mapper
public interface InventoMapper {

	// 유저 조회
	ArrayList<HashMap<String, Object>> selectUserList();

	// cubicicode null 인 stock table 상품 조회
	ArrayList<HashMap<String, Object>> selectStockProdcutList(HashMap<String, Object> params);

	// cubicicode null 인 goods table 상품 조회
	ArrayList<HashMap<String, Object>> selectGoodsProdcutList(HashMap<String, Object> params);

	// cubicicode 가장 최근 데이터 날짜별 조회
	ArrayList<HashMap<String, Object>> selectCubiciCodeLast(HashMap<String, Object> params);

	// cubicicode update
	void updateGoodsCubiciCode(ArrayList<HashMap<String, Object>> codeList);

	// cubicicode update
	void updateStockCubiciCode(ArrayList<HashMap<String, Object>> codeList);

	// matchingcode null인 상품 조회
	ArrayList<HashMap<String, Object>> selectMatchingList(HashMap<String, Object> params);

	// matchingcode 가장 최근 데이터 조회
	ArrayList<HashMap<String, Object>> selectLastMatchingCode();

	// matchingcode update
	void updateMatchingCode(HashMap<String, Object> param);

	// inventoMain / productList / lastUpdDate
	ArrayList<HashMap<String, Object>> selectProductList(HashMap<String, Object> params);

	// 기준일자 (마지막 업데이트일)
	String selectLastUpdDate(HashMap<String, Object> params);
	
	// invento excel 데이터
	ArrayList<HashMap<String, Object>> selectInventoExcel(HashMap<String, Object> params);
	
	
}
