package egovframework.azon.front.invento.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import egovframework.azon.cmmn.mapper.CmmScheduledMapper;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.invento.mapper.InventoMapper;

@Service
public class InventoService {

	Logger logger = LoggerFactory.getLogger(InventoService.class);
	
	@Autowired
	private InventoMapper inventoMapper;

	@Autowired
	CmmScheduledMapper cmmScheduledMapper;

	@Autowired
	CubiciCmmService cubiciCmmService;

	public void cubiciCodeList(HashMap<String, Object> params) {
		// shoptype parameter, shopid
		String shoptype = params.get("shopCode").toString();
		String SHOP_NAME = params.get("shopNm").toString();
		String prdNo = "PRODUCT_NO"; // 상품번호 컬럼이름 재설정

		if (shoptype.equals("03")) {
			prdNo = "ITEM_NO";
		}
		if (shoptype.equals("11")) {
			prdNo = "SELLER_PRODUCT_ITEM_ID";
		}
		params.put("SHOP_TYPE", shoptype);
		params.put("SHOP_NAME", SHOP_NAME);
		params.put("prdNo", prdNo);

		// 1 통합 마지막 코드 불러오기
		ArrayList<HashMap<String, Object>> lastCubiciCode = inventoMapper.selectCubiciCodeLast(params);
		List<String> dateList = new ArrayList<String>();
		List<String> lastCodeList = new ArrayList<String>();
		HashMap<String, Object> dataMap = new HashMap<String, Object>(); // lastCode, inputDate, shop_type, tablename 등
		for (int i = 0; i < lastCubiciCode.size(); i++) {
			HashMap<String, Object> getData = lastCubiciCode.get(i);
			dateList.add(getData.get("INPUT_DATE").toString());
			lastCodeList.add(getData.get("CUBICI_CODE").toString());
		}
		dataMap.put("SHOP_NAME", SHOP_NAME);
		dataMap.put("SHOP_TYPE", shoptype);
		dataMap.put("prdNo", prdNo);

		// 3 비어있는 갯수만큼 코드 만들기 stocklist = newcodelist >> break;
		List<String> madeCode = new ArrayList<String>();
		HashMap<String, Object> tempMap = new HashMap<String, Object>();

		// stock table 옥션, 11번가는 작업 X
		if (!shoptype.equals("03") || !shoptype.equals("04")) {
			for (int i = 0; i < dateList.size(); i++) {
				// 2 stock에서 코드 없는 list 불러오기
				dataMap.put("inputDate", dateList.get(i));
				ArrayList<HashMap<String, Object>> stockProductList = inventoMapper.selectStockProdcutList(dataMap);
				if (stockProductList.size() != 0) {

					dataMap.put("stockProductListSize", stockProductList.size());

					tempMap.put("lastCode", lastCodeList.get(i));
					tempMap.put("inputDate", dateList.get(i));
					tempMap.put("listSize", stockProductList.size());
					tempMap.put("shopType", shoptype);

					madeCode = makeCode(tempMap); // 라스트코드 전송 -> 날짜별 코드 생성 newCodeList

					for (int j = 0; j < madeCode.size(); j++) {
						if (j % 100 == 0) {
							try {
								Thread.sleep(1000);
							} catch (InterruptedException e) {
								logger.error(e.getMessage());
							}
						}
						ArrayList<HashMap<String, Object>> temp1 = new ArrayList<>();
						HashMap<String, Object> getData = stockProductList.get(j); // option_Id + inputDate
						getData.put("madeCode", madeCode.get(j));
						getData.put("SHOP_NAME", SHOP_NAME);
						getData.put("SHOP_TYPE", shoptype);
						getData.put("prdNo", prdNo);
						temp1.add(getData);
						inventoMapper.updateStockCubiciCode(temp1);
					}
				}
			}
		}

		// GOODS 테이블 작업 시작 (쿠팡제외)
		// 리스트 비우기
		if (!shoptype.equals("11")) {
			// 통합 마지막 코드 불러오기
			ArrayList<HashMap<String, Object>> re_lastCubiciCode = inventoMapper.selectCubiciCodeLast(params);
			List<String> re_dateList = new ArrayList<String>();
			List<String> re_lastCodeList = new ArrayList<String>();
			HashMap<String, Object> re_dataMap = new HashMap<String, Object>(); // lastCode, inputDate, shop_type,
																				// tablename 등
			for (int i = 0; i < re_lastCubiciCode.size(); i++) {
				HashMap<String, Object> getData = re_lastCubiciCode.get(i);
				re_dateList.add(getData.get("INPUT_DATE").toString());
				re_lastCodeList.add(getData.get("CUBICI_CODE").toString());
			}
			re_dataMap.put("SHOP_NAME", SHOP_NAME);
			re_dataMap.put("SHOP_TYPE", shoptype);
			re_dataMap.put("prdNo", prdNo);

			// 3 비어있는 갯수만큼 코드 만들기 stocklist = newcodelist >> break;
			List<String> re_madeCode = new ArrayList<String>();
			HashMap<String, Object> re_tempMap = new HashMap<String, Object>();

			for (int i = 0; i < re_dateList.size(); i++) {
				// 2 stock에서 cubici 코드 없는 list 불러오기
				re_dataMap.put("inputDate", re_dateList.get(i));
				ArrayList<HashMap<String, Object>> goodsProductList = inventoMapper.selectGoodsProdcutList(re_dataMap);
				// 11, 옥션은 옵션유무까지 확인. GOODS 에서 옵션없으면 CUBICI 코드생성
				if (goodsProductList.size() != 0) {
					re_tempMap.put("lastCode", re_lastCodeList.get(i));
					re_tempMap.put("inputDate", re_dateList.get(i));
					re_tempMap.put("listSize", goodsProductList.size());
					re_tempMap.put("shopType", shoptype);
					re_madeCode = makeCode(re_tempMap); // 라스트코드 전송 -> 날짜별 코드 생성 newCodeList

					for (int j = 0; j < re_madeCode.size(); j++) {
						if (j % 100 == 0) {
							try {
								Thread.sleep(1000);
							} catch (InterruptedException e) {
								logger.error(e.getMessage());
							}
						}
						ArrayList<HashMap<String, Object>> temp1 = new ArrayList<>();
						HashMap<String, Object> getData = goodsProductList.get(j); // option_Id(상품번호) + inputDate
						getData.put("madeCode", re_madeCode.get(j));
						getData.put("SHOP_NAME", SHOP_NAME);
						getData.put("SHOP_TYPE", shoptype);
						getData.put("prdNo", prdNo);
						temp1.add(getData);
						inventoMapper.updateGoodsCubiciCode(temp1);
					}
				}
			}
		}
	}

	// 코드 생성 ( cubici, matching )
	public List<String> makeCode(HashMap<String, Object> param) {
		// 날짜별 마지막 코드 불러와서 분해 + 코드생성
		int alpaCode1 = 0;
		int alpaCode2 = 0;
		int alpaCode3 = 0;
		int numCode1 = 0;
		int numCode2 = 0;

		String lastCode = param.get("lastCode").toString(); // 마지막 저장된 코드

		if (lastCode.equals("null")) {
			alpaCode1 = 65;
			alpaCode2 = 65;
			alpaCode3 = 65;
			numCode1 = 48;
			numCode2 = 48;
		} else {
			// 6~8 번째 문자 아스키코드
			alpaCode1 = lastCode.substring(6, 7).charAt(0);
			alpaCode2 = lastCode.substring(7, 8).charAt(0);
			alpaCode3 = lastCode.substring(8, 9).charAt(0);
			// 9~10 번째 숫자 아스키코드
			numCode1 = lastCode.substring(9, 10).charAt(0);
			numCode2 = lastCode.substring(10).charAt(0) + 1; // 마지막코드 +1 번째부터
		}

		// INPUT_DATE
		// String inputdate = inputdate; // 2021-01-01
		String inputdate = param.get("inputDate").toString();
		String year = inputdate.substring(3, 4);
		String month = inputdate.substring(5, 7);
		String day = inputdate.substring(8);

		// 월 1~12 : A~L
		char monthCode = ' ';
		int tempMonth = Integer.parseInt(month);
		for (int m = 1; m <= 12; m++) {
			if (tempMonth == m) {
				monthCode = (char) ('A' + m - 1);
				break;
			}
		}

		String alpa = "";
		String num = "";
		String CUBICI_CODE = "";

		List<String> newCodeList = new ArrayList<String>(); // 생성한 코드 저장

		loop: for (int ii = alpaCode1; ii <= 90; ii++) {
			for (int j = alpaCode2; j <= 90; j++) {
				for (int k = alpaCode3; k <= 90; k++) {
					for (int l = numCode1; l <= 57; l++) {
						for (int n = numCode2; n <= 57; n++) { // ~10 48~57
							alpa = Character.toString((char) alpaCode1) + Character.toString((char) alpaCode2)
									+ Character.toString((char) alpaCode3);
							num = Character.toString((char) numCode1) + Character.toString((char) numCode2);
							CUBICI_CODE = year + monthCode + day + param.get("shopType").toString() + alpa + num;
							newCodeList.add(CUBICI_CODE);
							if (newCodeList.size() == (int) param.get("listSize")) {
								break loop;
							}
							// 날짜별로 배열에 담기
							numCode2++;
						}
						numCode2 = 48;
						numCode1++;
					}
					numCode1 = 48;
					alpaCode3++;
				}
				alpaCode3 = 65;
				alpaCode2++;
			}
			alpaCode2 = 65;
			alpaCode1++;
		}
		return newCodeList;
	}

	// 매칭코드 자동 생성
	//@Scheduled(cron = "0 0 2 * * *") // 새벽 2시
	public void autoMatchingCode() {

		HashMap<String, Object> sendReport = new HashMap<String, Object>();

		Date ydate = new Date();
		Date tdate = new Date();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

		ydate = new Date(ydate.getTime() + (1000 * 60 * 60 * 24 * -1));

		String yDay = sdf.format(ydate); // 코드 생성할 때 사용
		String tDay = sdf.format(tdate); // 최근 코드 조회할 때 사용

		try {
			// automatching 시작
			String userLastCode = "";
			ArrayList<HashMap<String, Object>> UserList = inventoMapper.selectUserList();
			for (int i = 0; i < UserList.size(); i++) { // userList 조회 및 자동 매칭 작업 시작
				HashMap<String, Object> userMap = UserList.get(i);

				// 각 쇼핑몰 id map에 저장
				HashMap<String, Object> tempMap = cubiciCmmService.selectShopInfo(userMap);
				if (Integer.parseInt(tempMap.get("shop_count").toString()) > 0) {

					// 해당 user의 매칭 작업 안된 코드 조회 ( 선택매칭 해제한 경우 제외, 묶음으로 조회 )
					ArrayList<HashMap<String, Object>> matchingList = inventoMapper.selectMatchingList(tempMap);

					if (matchingList != null && matchingList.isEmpty() == false && matchingList.size() > 0) {
						List<String> manageCodeList = new ArrayList<String>();

						for (int j = 0; j < matchingList.size(); j++) {
							HashMap<String, Object> resultList = matchingList.get(j);
							manageCodeList.add(resultList.get("MANAGE_CODE").toString());
						}

						for (int j = 0; j < manageCodeList.size(); j++) { // j = 4
							tempMap.put("MANAGE_CODE", manageCodeList.get(j).toString());
							tempMap.put("FLAG", "AUTO_MATCH");

							ArrayList<HashMap<String, Object>> subDataList = inventoMapper.selectProductList(tempMap);
							String m_code = "";
							for (int k = 0; k < subDataList.size(); k++) {
								if (subDataList.get(k).get("MATCHING_CODE") != null) {
									m_code = subDataList.get(k).get("MATCHING_CODE").toString();
									// break;
								}
							}

							// 있는 matching으로 update
							if (m_code.length() > 0) { // 기존 manage_code가 있으면
								for (int k = 0; k < subDataList.size(); k++) {
									HashMap<String, Object> param = new HashMap<String, Object>();
									param.put("SHOP_NAME", subDataList.get(k).get("DIVISION").toString());
									param.put("MATCHING_CODE", m_code);
									param.put("MANAGE_CODE", subDataList.get(k).get("MANAGE_CODE").toString());
									param.put("UPDATE_FLAG", "AUTO");
									String manageCodeName = setManageCodeName(subDataList.get(k).get("DIVISION").toString());
									param.put("manageCodeName", manageCodeName);
									param.put("SHOP_ID", subDataList.get(k).get("SHOP_ID").toString());

									inventoMapper.updateMatchingCode(param);
								}
							} else { // 리스트 중에 matching코드 없는경우
								// 1. 라스트 코드 조회 > 코드 만들기 > update
								// lastMatchingCode 조회
								if (i == 0) {
									userLastCode = "null";
									ArrayList<HashMap<String, Object>> lastMatchingCode = inventoMapper.selectLastMatchingCode();
									if (lastMatchingCode == null || lastMatchingCode.isEmpty() || lastMatchingCode.size() == 0) {
										userLastCode = "null";
									} else {
										userLastCode = lastMatchingCode.get(0).get("MATCHING_CODE").toString();
									}
								} else {
									if (userLastCode.equals("")) {
										userLastCode = "null";
									}
								}

								// 매칭코드 만들기 + List에 저장
								HashMap<String, Object> codeParams = new HashMap<String, Object>();
								codeParams.put("inputDate", yDay);
								codeParams.put("lastCode", userLastCode);
								codeParams.put("shopType", "00");
								codeParams.put("listSize", 1);

								List<String> matchCode = new ArrayList<String>();
								matchCode = makeCode(codeParams); // 매칭코드 생성

								// 각 매칭코드별 쇼핑몰 마다 update >> id 여러개인 경우..
								for (int k = 0; k < subDataList.size(); k++) { // 9 개 ~ 9개의 상세
									HashMap<String, Object> param = new HashMap<String, Object>();
									param.put("SHOP_NAME", subDataList.get(k).get("DIVISION").toString());
									param.put("MATCHING_CODE", matchCode.get(0));
									param.put("MANAGE_CODE", subDataList.get(k).get("MANAGE_CODE").toString());
									param.put("UPDATE_FLAG", "AUTO");
									param.put("SHOP_ID", subDataList.get(k).get("SHOP_ID").toString());
									String manageCodeName = setManageCodeName(subDataList.get(k).get("DIVISION").toString());
									param.put("manageCodeName", manageCodeName);

									// update matching code
									inventoMapper.updateMatchingCode(param); // update할 테이블 리스트 (matchShopList) 보내기
									userLastCode = matchCode.get(0); // 매칭코드 저장
								}
							}
						}
					}
				}
			}
			sendReport.put("CAUSE", "AUTO MATCHING CODE 성공");
		} catch (Exception e) {
			sendReport.put("CAUSE", "AUTO MATCHING CODE 실패");
		} finally {
			sendReport.put("SCHEDULED_NAME", "[재고관리] AUTO MATCHING CODE");
			cmmScheduledMapper.insertScheduledReport(sendReport);
		}
	}

	public String setManageCodeName(String shopName) {
		String manageCodeName = "";
		if (shopName.equals("COUPANG_STOCK")) {
			manageCodeName = "EXTERNAL_VENDOR_SKU";
		}
		if (shopName.equals("NAVER_GOODS") || shopName.equals("GMARKET_GOODS") || shopName.equals("INTERPARK_GOODS")) {
			manageCodeName = "SELLER_PRODUCT_CODE";
		}
		if (shopName.equals("NAVER_STOCK") || shopName.equals("GMARKET_STOCK") || shopName.equals("INTERPARK_STOCK")) {
			manageCodeName = "MANAGE_CODE";
		}
		if (shopName.equals("11ST_GOODS") || shopName.equals("11ST_STOCK")) {
			manageCodeName = "SELLER_PRD_CD";
		}
		if (shopName.equals("AUCTION_GOODS")) {
			manageCodeName = "MANAGEMENT_CODE";
		}
		if (shopName.equals("AUCTION_STOCK")) {
			manageCodeName = "MANAGE_CODE";
		}
		return manageCodeName;
	}

	// 해당 아이디 가지고 있는 상품 중 UPD_DATE 최근 시간
	public String selectLastUpdDate(HashMap<String, Object> params) {
		return inventoMapper.selectLastUpdDate(params);
	}

	// inventoMain productList
	public ArrayList<HashMap<String, Object>> selectProductList(HashMap<String, Object> params) {
		ArrayList<HashMap<String, Object>> productList = inventoMapper.selectProductList(params);
		String onSale = "'승인완료','판매중','판매가능'";
		String stopSale = "'승인반려','판매금지','판매중지','품절','일시품절',''";
		String status = "err";
		for (int i = 0; i < productList.size(); i++) {
			HashMap<String, Object> resultMap = productList.get(i);
			status = resultMap.get("STATUS").toString();
			if (onSale.contains(status))
				status = "onSale";
			else if (stopSale.contains(status))
				status = "stopSale";
			resultMap.put("STATUS", status);
			productList.set(i, resultMap);
		}
		return productList;
	}

	// matched product list
	public ArrayList<HashMap<String, Object>> selectMatchedList(HashMap<String, Object> params) {
		params.put("FLAG", "MATCH");
		ArrayList<HashMap<String, Object>> matchList = inventoMapper.selectProductList(params);

		return matchList;
	}

	// 선택 매칭 작업
	@SuppressWarnings("unchecked")
	public HashMap<String, Object> matchingCode(HashMap<String, Object> params) {

		List<List<String>> dataList = (List<List<String>>) params.get("list");

		List<String> cCodeList = new ArrayList<String>();
		List<String> shopIdList = new ArrayList<String>();
		List<String> divList = new ArrayList<String>();
		List<String> shopTypeList = new ArrayList<String>();
		List<String> mCodeList = new ArrayList<String>();

		for (int i = 0; i < dataList.size(); i++) {
			cCodeList.add(dataList.get(i).get(0).toString());
			shopIdList.add(dataList.get(i).get(1).toString());
			divList.add(dataList.get(i).get(2).toString());
			shopTypeList.add(dataList.get(i).get(3).toString());
			mCodeList.add(dataList.get(i).get(4).toString());
		}
		Collections.sort(mCodeList);// MATCHING_CODE 정렬
		mCodeList.remove("null");

		String FLAG = params.get("FLAG").toString();
		String M_CODE = "";

		// 새로운 매칭작업
		if (FLAG.equals("NEW")) {
			// 오늘날짜 lastCode불러오기
			// lastMatchingCode 조회
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String tDay = sdf.format(date);

			String lastCode = "";
			params.put("UPD_DATE", tDay); // UPD_DATE 가 today인 것 중에서
			ArrayList<HashMap<String, Object>> lastMatchingCode = inventoMapper.selectLastMatchingCode();
			if (lastMatchingCode == null || lastMatchingCode.isEmpty() || lastMatchingCode.size() == 0) {
				lastCode = "null";
			} else {
				lastCode = lastMatchingCode.get(0).get("MATCHING_CODE").toString();
			}

			// 매칭코드 1개 만들기 + List에 저장
			HashMap<String, Object> codeParams = new HashMap<String, Object>();
			codeParams.put("inputDate", tDay);
			codeParams.put("lastCode", lastCode);
			codeParams.put("shopType", "00");
			codeParams.put("listSize", 1);

			List<String> newMatchCode = new ArrayList<String>();
			newMatchCode = makeCode(codeParams);

			M_CODE = newMatchCode.get(0);

		} else if (FLAG.equals("MERGE")) { // 매칭번호 2개 이상인 경우 정렬 후 가장 작은 값으로
			M_CODE = mCodeList.get(0).toString();
			for (int i = 0; i < mCodeList.size(); i++) { // 매칭되어있는 모든 상품 불러오기
				params.put("MATCHING_CODE", mCodeList.get(i).toString());
				params.put("FLAG", "MATCH");
				ArrayList<HashMap<String, Object>> subDataList = inventoMapper.selectProductList(params);
				for (int j = 0; j < subDataList.size(); j++) {
					cCodeList.add(subDataList.get(j).get("CUBICI_CODE").toString());
					divList.add(subDataList.get(j).get("DIVISION").toString());
					shopIdList.add(subDataList.get(j).get("SHOP_ID").toString());
				}
			}
		} else if (FLAG.equals("ADD")) { // 매칭번호 1개 인 경우
			M_CODE = mCodeList.get(0).toString();
		}

		// CUBICI_CODE , 해당 쇼핑몰 테이블 이름
		for (int j = 0; j < cCodeList.size(); j++) {
			HashMap<String, Object> updateData = new HashMap<String, Object>();
			updateData.put("CUBICI_CODE", cCodeList.get(j));
			updateData.put("MATCHING_CODE", M_CODE);
			updateData.put("SHOP_NAME", divList.get(j));
			updateData.put("UPDATE_FLAG", FLAG);
			updateData.put("SHOP_ID", shopIdList.get(j));

			inventoMapper.updateMatchingCode(updateData);
		}

		params.put("matching_code", mCodeList.get(0).toString());
		params.put("CUBICI_CODE", cCodeList.get(0).toString());
		params.put("FLAG", FLAG);

		return params;
	}

	// 상품 상세 정보 - 상품정보, 상세정보
	public ArrayList<HashMap<String, Object>> selectProductDetail(HashMap<String, Object> params) {
		params.put("FLAG", "DETAIL");
		return inventoMapper.selectProductList(params);
	}

	@SuppressWarnings("unchecked")
	public void removeMatching(HashMap<String, Object> params) {
		List<List<String>> dataList = (List<List<String>>) params.get("list");

		for (int i = 0; i < dataList.size(); i++) {
			HashMap<String, Object> paramsMap = new HashMap<String, Object>();
			String CUBICI_CODE = dataList.get(i).get(0).toString();
			String SHOP_ID = dataList.get(i).get(1).toString();
			String DIVISION = dataList.get(i).get(2).toString();

			paramsMap.put("CUBICI_CODE", CUBICI_CODE);
			paramsMap.put("MATHCING_CODE", "NULL");
			paramsMap.put("SHOP_ID", SHOP_ID);
			paramsMap.put("SHOP_NAME", DIVISION);
			paramsMap.put("UPDATE_FLAG", params.get("FLAG").toString());
			paramsMap.put("HEAD_INVEN", params.get("HEAD_INVEN").toString());
			paramsMap.put("PRODUCT_NO", params.get("PRODUCT_NO").toString());
			paramsMap.put("SHOPFLAG", params.get("SHOPFLAG").toString());

			inventoMapper.updateMatchingCode(paramsMap);
		}
	}

	// 재고정보 엑셀 데이터 가져오기
	public ArrayList<HashMap<String, Object>> getInventoExcelList(HashMap<String, Object> params) {
		return inventoMapper.selectInventoExcel(params);
	}

	// 재고정보 엑셀 합계 데이터 가져오기
	public ArrayList<HashMap<String, Object>> getGoodsSumMapList(HashMap<String, Object> params) {
		
		// 매칭
		params.put("excelFlag", "MATCH_SUM");
		ArrayList<HashMap<String, Object>> resultList = inventoMapper.selectInventoExcel(params);
		
		// Non-매칭
		params.put("excelFlag", "NON_SUM");
		ArrayList<HashMap<String, Object>> nonMatchSumList = inventoMapper.selectInventoExcel(params);
		
		// Non-매칭 합계를 ResultList에 넣기
		nonMatchSumList.forEach( nonMatchMap -> {
			String thisShop = nonMatchMap.get("SHOP").toString();
			resultList.forEach( result -> {
				
				if(result.get("SHOP").toString().equals(thisShop)) {
					result.put("NONMATCHED_SUM", nonMatchMap.get("NONMATCHED_SUM"));
				}
				
			});	
		});
		return resultList;
	}
}
