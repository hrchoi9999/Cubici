package egovframework.azon.admin.prizm;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;

import egovframework.azon.admin.moneybank.operation.mapper.ReqMapper;
import egovframework.azon.admin.moneybank.operation.service.ReqService;
import egovframework.azon.admin.prizm.mapper.PrizmMapper;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.MoneyBankException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import egovframework.azon.admin.cubici.mapper.PreferencesMapper;

@Service
public class PrizmService {

	Logger logger = LoggerFactory.getLogger(PrizmService.class);

	@Autowired
	PrizmMapper prizmMapper;

	@Autowired
	PreferencesMapper preferencesMapper;

	@Autowired
	ReqService reqService;

	@Autowired
	ReqMapper reqMapper;

	/* ********** PRIZM ********** */
	// 회원 정보 불러오기
	public HashMap<String, Object> selectPrizmUserInfo(HashMap<String, Object> params) {
		return prizmMapper.selectPrizmUserInfo(params);
	}

	public HashMap<String, Object> selectShopSalesApi(HashMap<String, Object> params){
		return prizmMapper.selectShopSalesApi(params);
	}

	public void calcPrizmScore(HashMap<String, Object> params) throws ParseException {
		HashMap<String, Object> resultMap = reqMapper.selectMBRequestDetail(params);
		resultMap.put("request_shop", "2,3,4,11,14");//인터파크 제외
		HashMap<String, Object> prizmUserRequest = selectPrizmUserInfo(resultMap);
		ArrayList<HashMap<String, Object>> shopResultMap = prizmMapper.selectMBRequestDetailShop(resultMap);

		/* SHOP_ID 정의 */
		int totalMSV=0;
		int totalMSQ=0;
		int totalMSA=0;
		double totalMSP=0;
		double totalMSTSR=0;
		double totalMPR=0;
		double totalMDP=0;
		double totalMRR = 1.0; //컬럼이 없어 최고점으로 등록 [1%로 책정]
		for(int i=0;i< shopResultMap.size();i++) {

			HashMap<String, Object> shopParam = new HashMap<String,Object>();
			shopParam.put("SHOP_ID",shopResultMap.get(i).get("SHOP_ID"));
			shopParam.put("SHOP_TYPE",shopResultMap.get(i).get("SHOP_TYPE"));
			HashMap<String, Object> shopSalesData = selectShopSalesApi(shopParam); //쇼핑몰별 데이터값 추출
			shopResultMap.get(i).putAll(shopSalesData);
			double msp = Double.parseDouble(String.valueOf(shopSalesData.get("MSP_SUM")))/Double.parseDouble(String.valueOf(shopSalesData.get("MSP_COUNT")));
			shopResultMap.get(i).put("MSP",msp);
			totalMSV += Integer.parseInt(String.valueOf(shopSalesData.get("MSV")));
			totalMSQ += Integer.parseInt(String.valueOf(shopSalesData.get("MSQ")));
			totalMSA += Integer.parseInt(String.valueOf(shopSalesData.get("MSA")));
		}

		for(int i=0;i< shopResultMap.size();i++) {
			double msvw = 0+Double.parseDouble(String.valueOf(shopResultMap.get(i).get("MSV")))/totalMSV;

			shopResultMap.get(i).put("MSVW",msvw);
			double msp = Double.parseDouble(String.valueOf(shopResultMap.get(i).get("MSP")))*msvw;
			if(Double.isNaN(msp))msp=0;
			if(Double.isInfinite(msp))msp=0;
			totalMSP += msp;
			double mstsr = Double.parseDouble(String.valueOf(shopResultMap.get(i).get("MSA")))/Double.parseDouble(String.valueOf(shopResultMap.get(i).get("MSV")));
			if(Double.isNaN(mstsr))mstsr=0;
			if(Double.isInfinite(mstsr))mstsr=0;
			totalMSTSR += mstsr;
			double mpr = Double.parseDouble(String.valueOf(shopResultMap.get(i).get("MPR")))*msvw;
			if(Double.isNaN(mpr))mpr=0;
			if(Double.isInfinite(mpr))mpr=0;
			totalMPR += mpr;
			double mdp = Double.parseDouble(String.valueOf(shopResultMap.get(i).get("MDP")))*msvw;
			if(Double.isNaN(mdp))mdp=0;
			if(Double.isInfinite(mdp))mdp=0;
			totalMDP += mdp;
		}

		HashMap<String, Object> selectMBSubDocDetail = reqMapper.selectMBSubDocDetail(params);
		double cbScoreChangeRate = 0+(Double.parseDouble(String.valueOf(selectMBSubDocDetail.get("cb_score_current"))) - Double.parseDouble(String.valueOf(selectMBSubDocDetail.get("cb_score_past")))) / Double.parseDouble(String.valueOf(selectMBSubDocDetail.get("cb_score_past")));

//			System.out.println("====================================================================");
//			System.out.println("FIRM_PERIOD : "+prizmUserRequest.get("FIRM_PERIOD")); //사업자등록 기간
//			System.out.println("SHOP_REGIST_MONTH : "+prizmUserRequest.get("SHOP_REGIST_MONTH"));//오래된 쇼핑몰 개월수
//			System.out.println("SHOP_COUNT : "+shopResultMap.size());//운영 쇼핑몰 수
//			System.out.println();
//			System.out.println("MSV : "+totalMSV);//MSV
//			System.out.println("MSVW : "+gMSVW+"/"+aMSVW+"/"+eMSVW+"/"+cMSVW+"/"+nMSVW+"/");//MSVW
//			System.out.println("MSQ : " +totalMSQ);//MSQ
//			System.out.println();
//			System.out.println("MSA : "+totalMSA);//MSA
//			System.out.println("MSP : "+totalMSP);//MSP
//			System.out.println("MSTSR : "+totalMSTSR);//MSTSR
//			System.out.println();
//			System.out.println("MPR : "+totalMPR);
//			System.out.println("MDP : "+totalMDP);
//			System.out.println("MRR : "+ totalMRR);
//			System.out.println();
//			System.out.println("CB_SCORE : " + selectMBSubDocDetail.get("cb_score_current"));
//			System.out.println("CB_SCORE_RANK"+selectMBSubDocDetail.get("cb_score_rank"));
//			System.out.println("CB_SCORE_CHANGE_RATE : "+cbScoreChangeRate);
//			System.out.println("====================================================================");

		HashMap<String, Object> prizmFunctionParam = new HashMap<String,Object>();
		// 프리즘 계산 Param
		prizmFunctionParam.put("BUSINESS_PERIOD", prizmUserRequest.get("FIRM_PERIOD")); //사업기간
		prizmFunctionParam.put("OPERATING_PERIOD", prizmUserRequest.get("SHOP_REGIST_MONTH")); //쇼핑몰 운영기간
		prizmFunctionParam.put("SHOP_COUNT", shopResultMap.size()); //운영 쇼핑몰 수
		prizmFunctionParam.put("MSV", totalMSV); //월 매출액
		prizmFunctionParam.put("MSQ", totalMSQ); //월 매출건
		prizmFunctionParam.put("MSA", totalMSA); //월 정산액
		prizmFunctionParam.put("MSP", totalMSP); //주문정산회수기간
		prizmFunctionParam.put("MSTSR", totalMSTSR); //매출대비 정산율
		prizmFunctionParam.put("MPR", totalMPR); //매출 판촉 비율
		prizmFunctionParam.put("MDP", totalMDP); //배송완료기간
		prizmFunctionParam.put("MRR", totalMRR); //반품비율
		prizmFunctionParam.put("CB_SCORE", selectMBSubDocDetail.get("cb_score_current")); //대표자신용평점
		prizmFunctionParam.put("CB_SCORE_RANK", selectMBSubDocDetail.get("cb_score_rank")); //신용평가 전체순위
		prizmFunctionParam.put("CB_SCORE_CHANGE_RATE", cbScoreChangeRate); //신용평점변화율

		HashMap<String,Object> prizmFunctionResult = prizmFunction(prizmFunctionParam);

		prizmFunctionParam.putAll(prizmFunctionResult);
		prizmFunctionParam.put("ID",resultMap.get("mbid"));
		prizmFunctionParam.put("USER_CODE",resultMap.get("USER_CODE"));

//			System.out.println("====================================================================");
//			System.out.println("prizmFunctionParam : " + prizmFunctionParam);
//			System.out.println("prizmFunctionResult : " + prizmFunctionResult);
//			System.out.println("====================================================================");

		// INSERT PRIZM_PCS_RESULT
		prizmMapper.insertPrizmScore(prizmFunctionParam);
		prizmMapper.inputTerms(prizmFunctionParam);

	}

	// 프리즘 계산 함수
	public HashMap<String, Object> prizmFunction(HashMap<String, Object> params) {
		String prizmGrade = "";
		double prizmScore = 0;

		//1. 기업개요
		double b_period_score = 0.0; // 사업기간
		double o_period_score = 0.0; // 쇼핑몰 운영기간
		double shopCount_score = 0.0; // 운영 쇼핑몰 수

		//2. 매출지표
		double month_sales_val_score = 0.0; // 월 매출액
		double month_sales_cnt_score = 0.0; // 월 매출건

		//3. 정산지표
		double month_cal_val_score = 0.0; // 월 정산액
		double order_setlle_period_scroe = 0.0; // 주문정산회수기간
		double monthly_settlement_to_sales_rate = 0.0;//매출대비 정산율

		//4.운영지표
		double promotion_rate_score = 0.0; // 판촉비율
		double order_ship_end_score = 0.0; //배송완료기간
		double return_rate_score = 0.0; // 구매거부율

		//5.금융건정성지표
		double credit_score = 0.0;//대표자 신용평점
		double credit_rank = 0.0;//대표자 신용평점
		double credit_change_rate = 0.0;//대표자 신용평점

		// 프리즘 계산 조건
		params.put("DIVISION", 1);
		ArrayList<HashMap<String, Object>> prizmRatioList = preferencesMapper.selectPrizmEvalList(params);
		for (int i = 0; i < prizmRatioList.size(); i++) {
			HashMap<String, Object> getData = prizmRatioList.get(i);

			int num = 0;
			double itemWeight = Double.parseDouble(getData.get("ITEM_WEIGHT").toString());

			// 사업기간
			if (getData.get("SUBJECT_NO").toString().equals("1") && getData.get("ITEM_NO").toString().equals("1")) {
				num = operatorFunc(getData, Integer.parseInt(String.valueOf(params.get("BUSINESS_PERIOD"))));
				if (num != 0) {
					b_period_score = num * itemWeight;
				}
			} // 쇼핑몰 운영기간
			else if (getData.get("SUBJECT_NO").toString().equals("1") && getData.get("ITEM_NO").toString().equals("2")) {
				num = operatorFunc(getData, Integer.parseInt(String.valueOf(params.get("OPERATING_PERIOD"))));
				if (num != 0) {
					o_period_score = num * itemWeight;
				}
			} // 운영 쇼핑몰 수
			else if (getData.get("SUBJECT_NO").toString().equals("1") && getData.get("ITEM_NO").toString().equals("3")) {
				num = operatorFunc(getData, Integer.parseInt(params.get("SHOP_COUNT").toString()));
				if (num != 0) {
					shopCount_score = num * itemWeight;
				}
			}
			// 월 매출액
			else if (getData.get("SUBJECT_NO").toString().equals("2") && getData.get("ITEM_NO").toString().equals("1")) {
				num = operatorFunc(getData, Integer.parseInt(params.get("MSV").toString()));
				if (num != 0) {
					month_sales_val_score = num * itemWeight;
				}
			} // 월 매출건
			else if (getData.get("SUBJECT_NO").toString().equals("2") && getData.get("ITEM_NO").toString().equals("2")) {
				num = operatorFunc(getData, Integer.parseInt(params.get("MSQ").toString()));
				if (num != 0) {
					month_sales_cnt_score = num * itemWeight;
				}
			}
			// 월 정산액
			else if (getData.get("SUBJECT_NO").toString().equals("3") && getData.get("ITEM_NO").toString().equals("1")) {
				num = operatorFunc(getData, Integer.parseInt(params.get("MSA").toString()));
				if (num != 0) {
					month_cal_val_score = num * itemWeight;
				}
			}
			// 주문정산회수기간
			else if (getData.get("SUBJECT_NO").toString().equals("3") && getData.get("ITEM_NO").toString().equals("2")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("MSP").toString()));
				if (num != 0) {
					order_setlle_period_scroe = num * itemWeight;
				}
			}
			// 매출대비 정산율
			else if (getData.get("SUBJECT_NO").toString().equals("3") && getData.get("ITEM_NO").toString().equals("3")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("MSTSR").toString()));
				if (num != 0) {
					monthly_settlement_to_sales_rate = num * itemWeight;
				}
			}
			// 매출 판촉 비율
			else if (getData.get("SUBJECT_NO").toString().equals("4") && getData.get("ITEM_NO").toString().equals("1")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("MPR").toString()));
				if (num != 0) {
					promotion_rate_score = num * itemWeight;
				}
			}
			// 배송완료기간
			else if (getData.get("SUBJECT_NO").toString().equals("4") && getData.get("ITEM_NO").toString().equals("2")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("MDP").toString()));
				if (num != 0) {
					order_ship_end_score = num * itemWeight;
				}
			}
			// 반품 비율
			else if (getData.get("SUBJECT_NO").toString().equals("4") && getData.get("ITEM_NO").toString().equals("3")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("MRR").toString()));
				if (num != 0) {
					return_rate_score = num * itemWeight;
				}
			} // 대표자 신용평점
			else if (getData.get("SUBJECT_NO").toString().equals("5") && getData.get("ITEM_NO").toString().equals("1")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("CB_SCORE").toString()));
				if (num != 0) {
					credit_score = num * itemWeight;
				}
			} // 신용평가 전체순위
			else if (getData.get("SUBJECT_NO").toString().equals("5") && getData.get("ITEM_NO").toString().equals("2")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("CB_SCORE_RANK").toString()));
				if (num != 0) {
					credit_rank = num * itemWeight;
				}
			} // 신용평점 변화율
			else if (getData.get("SUBJECT_NO").toString().equals("5") && getData.get("ITEM_NO").toString().equals("3")) {
				num = operatorFunc(getData, Double.parseDouble(params.get("CB_SCORE_CHANGE_RATE").toString()));
				if (num != 0) {
					credit_change_rate = num * itemWeight;
				}

			}
		}

		prizmScore = Double.parseDouble(String.format("%.1f", b_period_score))
				+ Double.parseDouble(String.format("%.1f", o_period_score))
				+ Double.parseDouble(String.format("%.1f", shopCount_score))
				+ Double.parseDouble(String.format("%.1f", month_sales_val_score))
				+ Double.parseDouble(String.format("%.1f", month_sales_cnt_score))
				+ Double.parseDouble(String.format("%.1f", month_cal_val_score))
				+ Double.parseDouble(String.format("%.1f", order_setlle_period_scroe))
				+ Double.parseDouble(String.format("%.1f", monthly_settlement_to_sales_rate))
				+ Double.parseDouble(String.format("%.1f", promotion_rate_score))
				+ Double.parseDouble(String.format("%.1f", order_ship_end_score))
				+ Double.parseDouble(String.format("%.1f", return_rate_score))
				+ Double.parseDouble(String.format("%.1f", credit_score))
				+ Double.parseDouble(String.format("%.1f", credit_rank))
				+ Double.parseDouble(String.format("%.1f", credit_change_rate));

//		System.out.println("사업기간 (점수) :::  "+String.format("%.1f", b_period_score));
//		System.out.println("쇼핑몰 운영 기간 (점수) :::  "+String.format("%.1f", o_period_score));
//		System.out.println("운영 쇼핑몰 수 (점수) :::  "+String.format("%.1f", shopCount_score));
//
//		System.out.println("월 매출액 (점수) :::  "+String.format("%.1f", month_sales_val_score));
//		System.out.println("월 매출건 (점수) :::  "+String.format("%.1f", month_sales_cnt_score));
//
//		System.out.println("월 정산액 (점수) :::  "+String.format("%.1f", month_cal_val_score));
//		System.out.println("주문 정산 회수 기간 (점수) :::  "+String.format("%.1f", order_setlle_period_scroe));
//		System.out.println("매출대비 정산율 (점수) :::  "+String.format("%.1f", monthly_settlement_to_sales_rate));
//
//
//		System.out.println("매출 판촉 비율 (점수) :::  "+String.format("%.1f", promotion_rate_score));
//		System.out.println("배송완료 평균 일수 (점수) :::  "+String.format("%.1f", order_ship_end_score));
//		System.out.println("교환/반품 비율 (점수) :::  "+String.format("%.1f", return_rate_score));
//
//		System.out.println("개인 신용도 평가 (점수) ::: "+String.format("%.1f", credit_score));
//		System.out.println("신용 평가 등수 (점수) ::: "+String.format("%.1f", credit_rank));
//		System.out.println("신용평가 변화율 (점수) ::: "+String.format("%.1f", credit_change_rate));
//
//		System.out.println("결과 ::: "+String.format("%.0f", prizmScore));

		prizmScore = Double.parseDouble(String.format("%.0f", prizmScore));

		if (prizmScore > 880 && prizmScore <= 1000) {
			prizmGrade = "A";
		} else if (prizmScore > 700 && prizmScore <= 879) {
			prizmGrade = "B";
		} else if (prizmScore > 501 && prizmScore <= 699) {
			prizmGrade = "C";
		} else if (prizmScore > 321 && prizmScore <= 500) {
			prizmGrade = "D";
		} else if (prizmScore > 200 && prizmScore <= 320) {
			prizmGrade = "E";
		} else {
			prizmGrade = "N";
		}

		HashMap<String, Object> resultMap = new HashMap<>();
		resultMap.put("PRIZM_SCORE", prizmScore);
		resultMap.put("PRIZM_GRADE", prizmGrade);
		return resultMap;
	}

	/* ********** 프리즘 끝 ********** */

	// 연산자 함수
	public Integer operatorFunc(HashMap<String, Object> getData, double score) {

		int resultScore = 0;

		if (getData.get("OPERATOR1").toString().equals("이상") && getData.get("OPERATOR2").toString().equals("-")) {
			if (score >= Double.parseDouble(getData.get("ITEM_STANDARD1").toString())) {
				resultScore = (int) getData.get("ITEM_SCORE");
			}
		} else if (getData.get("OPERATOR1").toString().equals("-") && getData.get("OPERATOR2").toString().equals("미만")) {
			if (score < Double.parseDouble(getData.get("ITEM_STANDARD2").toString())) {
				resultScore = (int) getData.get("ITEM_SCORE");
			}
		} else if (getData.get("OPERATOR1").toString().equals("미만") && getData.get("OPERATOR2").toString().equals("-")) {
			if (score < Double.parseDouble(getData.get("ITEM_STANDARD1").toString())) {
				resultScore = (int) getData.get("ITEM_SCORE");
			}
		} else if (getData.get("OPERATOR1").toString().equals("이상")
				&& getData.get("OPERATOR2").toString().equals("미만")) {
			if (score >= Double.parseDouble(getData.get("ITEM_STANDARD1").toString())
					&& score < Double.parseDouble(getData.get("ITEM_STANDARD2").toString())) {
				resultScore = (int) getData.get("ITEM_SCORE");
			}
		} else if (getData.get("OPERATOR1").toString().equals("미만")
				&& getData.get("OPERATOR2").toString().equals("이상")) {
			if (score < Double.parseDouble(getData.get("ITEM_STANDARD1").toString())
					&& score >= Double.parseDouble(getData.get("ITEM_STANDARD2").toString())) {
				resultScore = (int) getData.get("ITEM_SCORE");
			}
		} else if (getData.get("OPERATOR1").toString().equals("이상")
				&& getData.get("OPERATOR2").toString().equals("-")) {
			if (score >= Double.parseDouble(getData.get("ITEM_STANDARD1").toString())) {
				resultScore = (int) getData.get("ITEM_SCORE");
			}
		} else if (getData.get("OPERATOR1").toString().equals("-") && getData.get("OPERATOR2").toString().equals("미만")) {
			if (score < Double.parseDouble(getData.get("ITEM_STANDARD2").toString())) {
				resultScore = (int) getData.get("ITEM_SCORE");
			}
		}
		return resultScore;
	}

	/**
	 * PCS 평가지표
	 * @param mbid
	 * @return
	 */
	public HashMap<String, Object> getPcs(String mbid) {

		HashMap<String, Object> resultMap = prizmMapper.selectPrizmPcsResult(mbid);
		return resultMap;

	}
}