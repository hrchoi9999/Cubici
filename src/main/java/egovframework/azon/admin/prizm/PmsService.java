package egovframework.azon.admin.prizm;

import egovframework.azon.admin.cubici.mapper.PreferencesMapper;
import egovframework.azon.admin.prizm.mapper.PmsMapper;
import egovframework.azon.cmmn.cbc.CBCComponent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class PmsService {
    @Autowired
    PrizmService prizmService;
    @Autowired
    PmsMapper pmsMapper;
    @Autowired
    PreferencesMapper preferencesMapper;
    @Autowired
    CBCComponent cbcComponent;

    public ArrayList<HashMap<String,Object>> selectPmsResultDetail(String mbid){
        ArrayList<HashMap<String,Object>> pmsResultDetailList = pmsMapper.selectPmsResultDetail(mbid);
        ArrayList<HashMap<String,Object>> resultList = new ArrayList<>();
        for(int i=0; i<pmsResultDetailList.size();i++) {
            HashMap<String, Object> tempMap = new HashMap<>();
            tempMap.put("PMS_GRADE", pmsResultDetailList.get(i).get("PMS_GRADE"));
            tempMap.put("PMS_SCORE", pmsResultDetailList.get(i).get("PMS_SCORE"));
            tempMap.put("SALES_CLASS_NM", setClassNmbyScore(String.valueOf(pmsResultDetailList.get(i).get("SALES_TOTAL_SCORE"))));
            tempMap.put("SALES_TOTAL_SCORE", pmsResultDetailList.get(i).get("SALES_TOTAL_SCORE"));
            tempMap.put("MANAGE_CLASS_NM", setClassNmbyScore(String.valueOf(pmsResultDetailList.get(i).get("MANAGE_TOTAL_SCORE"))));
            tempMap.put("MANAGE_TOTAL_SCORE", pmsResultDetailList.get(i).get("MANAGE_TOTAL_SCORE"));
            tempMap.put("INPUT_DATE", pmsResultDetailList.get(i).get("INPUT_DATE"));
            tempMap.put("BIWEEK_DATE", pmsResultDetailList.get(i).get("BIWEEK_DATE"));
            resultList.add(tempMap);
        }
        return resultList;
    }

    private String setClassNmbyScore(String pmsScore) {
        String result = "";
        double Score = Double.parseDouble(pmsScore);
        if(Score > 75 && Score < 89) {
            result = "care";
        } else if (Score >= 90) {
            result = "warn";
        }
        return result;
    }

    public ArrayList<HashMap<String, Object>> selectPmsCoreDetail(String mbid) {
        ArrayList<HashMap<String, Object>> pmsCoreRiskDetailList = pmsMapper.selectPmsCoreRiskDetail(mbid);
        ArrayList<HashMap<String,Object>> resultList = new ArrayList<>();        

        for (int i = 0; i < pmsCoreRiskDetailList.size(); i++) {
            HashMap<String, Object> tempMap = new HashMap<>();
            String sba = cbcComponent.toEncryption(String.valueOf(pmsCoreRiskDetailList.get(i).get("SBA")));
            String mda = String.valueOf(pmsCoreRiskDetailList.get(i).get("MDAN"));
            if (sba.equals(mda)) {
                tempMap.put("BAD", "정상");
                tempMap.put("BAD_CLASS", "");
            } else {
                tempMap.put("BAD", "경고");
                tempMap.put("BAD_CLASS", "warn");
            }

            //데이터가 없어서 Null값을 0으로 처리
            int bra = 0;
            if (pmsCoreRiskDetailList.get(i).get("BRA") == null) {
                bra = 0;
            } else {
                bra = Integer.parseInt(String.valueOf(pmsCoreRiskDetailList.get(i).get("BRA")));
            }

            if (bra > 0) {
                tempMap.put("BRA", "정상");
                tempMap.put("BRA_CLASS", "");
            } else {
                tempMap.put("BRA", "주의");
                tempMap.put("BRA_CLASS", "care");
            }

            tempMap.put("INPUT_DATE", String.valueOf(pmsCoreRiskDetailList.get(i).get("INPUT_DATE")));
            resultList.add(tempMap);
        }
        return resultList;
    }

    public int selectPrePmsDate() {
        int result = pmsMapper.selectPmsDate();
        return result;
    }

    public int selectPrePmsCount() {
        int result = pmsMapper.selectPmsCount();
        return result;
    }

    public HashMap<String, Object> pmsFunction(HashMap<String, Object> params) {

        String pmsGrade = "";
        double pmsScore = 0;

        //1. 매출안정성
        double bsvc = 0.0; // 격주매출액변화
        double bsqc = 0.0; // 격주판매건수변화
        double baupc = 0.0; // 주간단위매출액변화
        double bdsr = 0.0; // 격주동일ID구매율

        //2. 운영안정성
        double bprc = 0.0; // 격주판촉비율
        double brrc = 0.0; // 격주구매거부율
        double bstsc = 0.0; // 주간매출대비정산율
        double bdltc = 0.0; // 주간배송준비시간

        // pms 계산 조건
        params.put("DIVISION", 2);
        ArrayList<HashMap<String, Object>> prizmRatioList = preferencesMapper.selectPrizmEvalList(params);
        for (int i = 0; i < prizmRatioList.size(); i++) {
            HashMap<String, Object> getData = prizmRatioList.get(i);

            int num = 0;
            double itemWeight = Double.parseDouble(getData.get("ITEM_WEIGHT").toString());

            // 매출지표
            // 격주매출액변화비율
            if (getData.get("SUBJECT_NO").toString().equals("2") && getData.get("ITEM_NO").toString().equals("1")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(String.valueOf(params.get("BSVC"))));
                if (num != 0) {
                    bsvc = num * itemWeight;
                }
            }
            // 격주판매건수변화
            else if (getData.get("SUBJECT_NO").toString().equals("2") && getData.get("ITEM_NO").toString().equals("2")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(String.valueOf(params.get("BSQC"))));
                if (num != 0) {
                    bsqc = num * itemWeight;
                }
            }
            // 주간단위매출액변화
            else if (getData.get("SUBJECT_NO").toString().equals("2") && getData.get("ITEM_NO").toString().equals("3")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(String.valueOf(params.get("BAUPC"))));
                if (num != 0) {
                    baupc = num * itemWeight;
                }
            }
            // 격주동일ID구매율
            else if (getData.get("SUBJECT_NO").toString().equals("2") && getData.get("ITEM_NO").toString().equals("4")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(String.valueOf(params.get("BDSR"))));
                if (num != 0) {
                    bdsr = num * itemWeight;
                }
            }



            // 월 정산액
            else if (getData.get("SUBJECT_NO").toString().equals("3") && getData.get("ITEM_NO").toString().equals("1")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(params.get("BPRC").toString()));
                if (num != 0) {
                    bprc = num * itemWeight;
                }
            }
            // 주문정산회수기간
            else if (getData.get("SUBJECT_NO").toString().equals("3") && getData.get("ITEM_NO").toString().equals("2")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(params.get("BRRC").toString()));
                if (num != 0) {
                    brrc = num * itemWeight;
                }
            }
            // 매출대비 정산율
            else if (getData.get("SUBJECT_NO").toString().equals("3") && getData.get("ITEM_NO").toString().equals("3")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(params.get("BSTSC").toString()));
                if (num != 0) {
                    bstsc = num * itemWeight;
                }
            }
            // 매출대비 정산율
            else if (getData.get("SUBJECT_NO").toString().equals("3") && getData.get("ITEM_NO").toString().equals("4")) {
                num = prizmService.operatorFunc(getData, Double.parseDouble(params.get("BDLTC").toString()));
                if (num != 0) {
                    bdltc = num * itemWeight;
                }
            }


        }

        pmsScore = Double.parseDouble(String.format("%.1f", bsvc))
                + Double.parseDouble(String.format("%.1f", bsqc))
                + Double.parseDouble(String.format("%.1f", baupc))
                + Double.parseDouble(String.format("%.1f", bdsr))
                + Double.parseDouble(String.format("%.1f", bprc))
                + Double.parseDouble(String.format("%.1f", brrc))
                + Double.parseDouble(String.format("%.1f", bstsc))
                + Double.parseDouble(String.format("%.1f", bdltc));

        pmsScore = Double.parseDouble(String.format("%.0f", pmsScore));

        double sales_total_score = Double.parseDouble(String.format("%.1f", bsvc))
                + Double.parseDouble(String.format("%.1f", bsqc))
                + Double.parseDouble(String.format("%.1f", baupc))
                + Double.parseDouble(String.format("%.1f", bdsr));

        double manage_total_score = Double.parseDouble(String.format("%.1f", bprc))
                + Double.parseDouble(String.format("%.1f", brrc))
                + Double.parseDouble(String.format("%.1f", bstsc))
                + Double.parseDouble(String.format("%.1f", bdltc));

        if (pmsScore > 40 && pmsScore <= 59) {
            pmsGrade = "A";
        } else if (pmsScore > 60 && pmsScore <= 90) {
            pmsGrade = "B";
        } else if (pmsScore > 91 && pmsScore <= 149) {
            pmsGrade = "C";
        } else if (pmsScore > 150 && pmsScore <= 179) {
            pmsGrade = "D";
        } else if (pmsScore > 180 && pmsScore <= 200) {
            pmsGrade = "E";
        } else {
            pmsGrade = "N";
        }

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("PMS_SCORE", pmsScore);
        resultMap.put("PMS_GRADE", pmsGrade);
        resultMap.put("SALES_TOTAL_SCORE", sales_total_score);
        resultMap.put("MANAGE_TOTAL_SCORE", manage_total_score);
        return resultMap;
    }

    public int selectPmsMBUserRequest(){
        ArrayList<HashMap<String, Object>> mbidList = pmsMapper.selectPmsMBUserRequest();
        int result =0;
        for(int i=0; i<mbidList.size();i++ ) {
            String mbid = (String) mbidList.get(i).get("mbid");
            String user_code = (String) mbidList.get(i).get("user_code");
            HashMap<String,Object> param = new HashMap<String,Object>();
            param.putAll(mbidList.get(i));

            ArrayList<HashMap<String,Object>> shopList = pmsMapper.selectPmsShopList(param);
            List<HashMap<String,Object>> shopDataList = new ArrayList<HashMap<String,Object>>();
            //SHOP_TYPE,SHOP_ID별 데이터 추출
            double sum_bsv_2w =0;
            double sum_bsv_1w =0;
            double sum_bsq_2w =0;
            double sum_bsq_1w =0;
            //쇼핑몰별 총합
            for(int j=0;j<shopList.size();j++) {
                HashMap<String,Object> shopDataMap = pmsMapper.selectPmsShopData(shopList.get(j));

                sum_bsv_2w += Double.parseDouble(String.valueOf(shopDataMap.get("BSV_2W")));
                sum_bsv_1w += Double.parseDouble(String.valueOf(shopDataMap.get("BSV_1W")));
                sum_bsq_2w += Double.parseDouble(String.valueOf(shopDataMap.get("BSQ_2W")));
                sum_bsq_1w += Double.parseDouble(String.valueOf(shopDataMap.get("BSQ_1W")));

                shopDataList.add(shopDataMap);
            }

            //데이터 비중 처리
            double total_bsvcr=0;//격주매출액변화
            double total_bsqcr=0;//격주판매건수변화
            double total_baupcr=0;//주간단위매출액변화
            double total_bdsrc=0;//격주동일ID구매율
            double total_bprcr=0;//격주 판촉비율
            double total_brrcr=0;//격주 구매거부율 최고점으로 고정12%이상
            double total_bstscr=0;//주간매출대비정산율
            double total_bdltcr=0;//주간배송준비시간
            for(int j=0;j<shopDataList.size();j++) {
                double bsv_2w = Double.parseDouble(String.valueOf(shopDataList.get(j).get("BSV_2W")));
                double bsv_1w = Double.parseDouble(String.valueOf(shopDataList.get(j).get("BSV_1W")));
                double bsq_2w = Double.parseDouble(String.valueOf(shopDataList.get(j).get("BSQ_2W")));
                double bsq_1w = Double.parseDouble(String.valueOf(shopDataList.get(j).get("BSQ_1W")));
                double bds_2w = Double.parseDouble(String.valueOf(shopDataList.get(j).get("BDS_2W")));
                double bds_1w= Double.parseDouble(String.valueOf(shopDataList.get(j).get("BDS_1W")));
                double bpr_2w= Double.parseDouble(String.valueOf(shopDataList.get(j).get("BPR_2W")));
                double bpr_1w= Double.parseDouble(String.valueOf(shopDataList.get(j).get("BPR_1W")));
                double bsts_2w= Double.parseDouble(String.valueOf(shopDataList.get(j).get("BSTS_2W")));
                double bsts_1w= Double.parseDouble(String.valueOf(shopDataList.get(j).get("BSTS_1W")));
                double bdlt_2w= Double.parseDouble(String.valueOf(shopDataList.get(j).get("BDLT_2W")));
                double bdlt_1w= Double.parseDouble(String.valueOf(shopDataList.get(j).get("BDLT_1W")));

				/*double bsvb_2w =  bsv_2w/sum_bsv_2w;
				if(Double.isNaN(bsvb_2w))bsvb_2w=0;
				if(Double.isInfinite(bsvb_2w))bsvb_2w=0;
				*/
                double bsvw =  bsv_1w/sum_bsv_1w;
                if(Double.isNaN(bsvw))bsvw=0;
                if(Double.isInfinite(bsvw))bsvw=0;

                double bsvc = (bsv_1w-bsv_2w)/bsv_2w;
                if(Double.isNaN(bsvc))bsvc=0;
                if(Double.isInfinite(bsvc))bsvc=0;

                total_bsvcr += bsvc*bsvw; //격주매출액변화

                double bsqb = bsq_1w/sum_bsq_1w;
                if(Double.isNaN(bsqb))bsqb=0;
                if(Double.isInfinite(bsqb))bsqb=0;

                double bsqc = (bsq_2w-bsq_1w) / bsqb;
                if(Double.isNaN(bsqc))bsqc=0;
                if(Double.isInfinite(bsqc))bsqc=0;

                total_bsqcr += bsqc*bsqb;//격주판매건수변화

                double baup_2w = bsv_2w / bsq_2w;
                if(Double.isNaN(baup_2w))baup_2w=0;
                if(Double.isInfinite(baup_2w))baup_2w=0;

                double baup_1w = bsv_1w / bsq_1w;
                if(Double.isNaN(baup_1w))baup_1w=0;
                if(Double.isInfinite(baup_1w))baup_1w=0;

                double baupc = (baup_1w - baup_2w) / baup_2w;
                if(Double.isNaN(baupc))baupc=0;
                if(Double.isInfinite(baupc))baupc=0;

                total_baupcr += baupc*bsvw;//주간단위매출액변화

                double bdsr_2w =bds_2w / bsq_2w;
                if(Double.isNaN(bdsr_2w))bdsr_2w=0;
                if(Double.isInfinite(bdsr_2w))bdsr_2w=0;

                double bdsr_1w =bds_1w / bsq_1w;
                if(Double.isNaN(bdsr_1w))bdsr_1w=0;
                if(Double.isInfinite(bdsr_1w))bdsr_1w=0;

                double bdsrc= bdsr_2w-bdsr_1w;
                total_bdsrc += bdsrc*bsvw;//격주동일ID구매율

                double bprc=bpr_1w-bpr_2w;
                total_bprcr += bprc*bsvw;//격주 판촉비율

                total_brrcr = 13;//격주 구매거부율 [ 최고점으로 12%이상 ]

                double v_bsts_2w = bsts_2w/bsv_2w;
                if(Double.isNaN(v_bsts_2w))v_bsts_2w=0;
                if(Double.isInfinite(v_bsts_2w))v_bsts_2w=0;

                double v_bsts_1w = bsts_1w/bsv_1w;
                if(Double.isNaN(v_bsts_1w))v_bsts_1w=0;
                if(Double.isInfinite(v_bsts_1w))v_bsts_1w=0;

                double bstsc = v_bsts_1w - v_bsts_2w;
                total_bstscr += bstsc*bsvw;//주간매출대비정산율

                double bdltc = (bdlt_1w-bdlt_2w) / bdlt_2w;
                if(Double.isNaN(bdltc))bdltc=0;
                if(Double.isInfinite(bdltc))bdltc=0;

                total_bdltcr = bdltc*bsvw;//주간배송준비시간

            }

            HashMap<String, Object> pmsFunctionParam = new HashMap<String,Object>();
            // 프리즘 계산 Param
            pmsFunctionParam.put("BSVC", total_bsvcr); //격주매출액변화
            pmsFunctionParam.put("BSQC", total_bsqcr); //격주판매건수변화
            pmsFunctionParam.put("BAUPC",total_baupcr);//주간단위매출액변화
            pmsFunctionParam.put("BDSR", total_bdsrc);//격주동일ID구매율
            pmsFunctionParam.put("BPRC", total_bprcr);//격주판촉비율
            pmsFunctionParam.put("BRRC", total_brrcr);//격주구매거부율 최고점으로 고정12%이상
            pmsFunctionParam.put("BSTSC", total_bstscr);//주간매출대비정산율
            pmsFunctionParam.put("BDLTC", total_bdltcr);//주간배송준비시간

            HashMap<String,Object> pmsFunctionResult = pmsFunction(pmsFunctionParam);

            pmsFunctionParam.putAll(pmsFunctionResult);
            pmsFunctionParam.put("mbid",mbid);
            pmsFunctionParam.put("user_code",user_code);

            //Insert PRIZM_PMS_RESULT
            int result_value = pmsMapper.insertPmsResult(pmsFunctionParam);
            if(result_value==0) {
                result++;
            }

        }

        return result;
    }

}
