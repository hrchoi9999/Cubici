package egovframework.azon.cmmn.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import egovframework.azon.cmmn.mapper.CmmScheduledMapper;
import egovframework.azon.front.cubici.service.CubiciCmmService;

// 공통 스케줄링 서비스
@Service
public class CmmScheduledService {
	
	Logger logger = LoggerFactory.getLogger(CmmScheduledService.class);
	
	@Autowired
	CmmScheduledMapper cmmScheduledMapper;
	
	@Autowired
	CubiciCmmService cubiciCmmService;
	
	// 신규회원 데이터 조회 완료 알림
	//@Scheduled(cron = "0 50 8,11,14,17 * * *") // 8시50분, 11시50분, 14시50분, 17시50분
	public void newUserNotice() {

		ArrayList<HashMap<String, Object>> sendEmailList = cmmScheduledMapper.selectNewEmailList();
		HashMap<String, Object> sendReport = new HashMap<String, Object>();
		
		try {
			if (sendEmailList == null || sendEmailList.isEmpty()) {
				sendReport.put("CAUSE", "신규회원 없음");
				logger.trace("신규회원 없음");
			} else {

				String successUser = "";
				String failUser = "";
				String shopNmCompare = "";

				// SEND_MAIL 업데이트
				for (int i = 0; i < sendEmailList.size(); i++) {
					HashMap<String, Object> params = sendEmailList.get(i);
					ArrayList<HashMap<String, Object>> ShopList = cmmScheduledMapper
							.selectNewEmailListShopList(params.get("USER_NO").toString());
					
					StringBuilder ShopparamValue = new StringBuilder();
					int shopCnt = 1;
					
					params.put("TITLE", "[큐빅아이] 쇼핑몰 정보 확인 요청");
					params.put("contentSMS", "큐빅아이에서 사용 중이신 쇼핑몰 데이터 수집을 완료하였습니다.");
					params.put("USER_NM", params.get("USER_NM").toString());
					

					for (int j = 0; j < ShopList.size(); j++) {
						HashMap<String, Object> Shopparams = ShopList.get(j);
						String ShopNm = Shopparams.get("SHOP_NM").toString();
						String ShopId = Shopparams.get("SHOP_ID").toString();
						cmmScheduledMapper.updateSendMail(Shopparams);

						if (shopNmCompare.equals(ShopNm)) {
							ShopparamValue.append(" / " + ShopId);
						} else {
							if (j != 0) {
								ShopparamValue.append("<br>");
							}
							ShopparamValue.append(shopCnt + ". " + ShopNm + " : " + ShopId);
							shopCnt++;
						}
						shopNmCompare = ShopNm;
					}
					params.put("CONTENT", ShopparamValue);
					
					// 메일, 문자랑 나누고
					String[] mail = new String[1];
					String[] sms = new String[1];
					
					boolean mailFlag = cubiciCmmService.sendMail(params, mail);// 21: 사용준비 알림.
					String smsFlag = cubiciCmmService.sendSms(params, sms);// 21: 사용준비 알림.
					
					if (mailFlag == true && smsFlag.equals("success")) {
						if (successUser.equals("")) {
							successUser = params.get("USER_NO").toString();
						} else {
							successUser += ", " + params.get("USER_NO").toString();
						}
					} else {
						if (failUser.equals("")) {
							failUser = params.get("USER_NO").toString();
						} else {
							failUser += ", " + params.get("USER_NO").toString();
						}
					}
					sendReport.put("CAUSE", "신규회원 알림 전송 / 성공 [" + successUser + "] / 실패 [" + failUser + "]");
				}
			}

		} catch (Exception ex) {
			sendReport.put("CAUSE", "신규회원 알림 전송 실패");
			logger.trace(" !ERROR 신규회원 알림 전송 실패 " + ex.getMessage());
		} finally {
			sendReport.put("SCHEDULED_NAME", "신규회원 사용가능 알림");
			cmmScheduledMapper.insertScheduledReport(sendReport);
		}
	}

	// 로그인 실패 확인
	//@Scheduled(cron = "0 0 15 * * *")
	public void shopLoginFailCheck() {

		ArrayList<HashMap<String, Object>> shopLoginFailUserList = cmmScheduledMapper.selectShopLoginFailUser(); // 조건 < 3
		HashMap<String, Object> sendReport = new HashMap<String, Object>();
		
		HashMap<String, Object> selectNoticeOverUser = cmmScheduledMapper.selectNoticeOverList(); // 조건 >= 3
				
		// 3이상인 친구들 카운트 2개
		int noticeCountOver = Integer.parseUnsignedInt(selectNoticeOverUser.get("COUNT").toString());
		String failCheck = "";
		
		try {
			if (shopLoginFailUserList.isEmpty()) {
				sendReport.put("CAUSE","로그인 실패 회원 없음 / 로그인 알림 횟수 초과 ID : " + noticeCountOver + " 개" );
				logger.trace("로그인 실패 회원 없음");
			} else {
				
				String LoginValue = "";
				int count_compare = 0;
				
				// 메일, 문자 전송
				for (int i = 0; i < shopLoginFailUserList.size(); i++) {
					
					HashMap<String, Object> params = shopLoginFailUserList.get(i);

					String shopNAME = params.get("CODE_NM").toString();
					String shopID = params.get("SHOP_ID").toString();
					String userNo = params.get("USER_NO").toString();

					int countCnt = Integer.parseInt(params.get("COUNT_CNT").toString());
					
					failCheck = userNo + ", " + shopNAME + " : " + shopID;

					// LOGIN_LOCK_NOTICE에 +1
					int count = Integer.parseInt(params.get("LOGIN_LOCK_NOTICE").toString());
					count++;
					params.put("LOGIN_LOCK_NOTICE", count);

					params.put("TITLE", "[큐빅아이] 로그인 실패 알림");
					params.put("USER_NM", params.get("USER_ID").toString());
					
					if(count_compare == 0) {
						LoginValue += ("오류 발생 계정 : " + shopID + "(" + shopNAME + ") ");
					}else {	
						LoginValue += ("/ " + shopID + "(" + shopNAME + ") ");
					}
					count_compare++;
					
					if(count_compare == countCnt) {
						
						String contentSMS = "[큐빅아이]\n등록하신 '" + LoginValue
								+ "' 계정 로그인이 실패하였습니다. \n회원정보를 확인해 주시기 바랍니다.\n\n▶자세한 내용은 등록된 이메일로 전송되었습니다.";
						params.put("contentSMS", contentSMS);
						
						params.put("CONTENT", LoginValue);
						
//						cubiciCmmService.sendMail(22, params);
//						cubiciCmmService.sendSms(22, params);
						
						count_compare = 0;
						LoginValue = "";
					}		
					cmmScheduledMapper.updateNoticeCount(params);

				}
				sendReport.put("CAUSE","로그인 실패 알림 성공 / 로그인 알림 횟수 초과 ID : " + noticeCountOver + " 개" );
			}
		} catch (Exception ex) {
			sendReport.put("CAUSE","로그인 실패 알림 실패: "+failCheck); // 실패한 회원번호, CODE_NM, SHOP_ID
			logger.trace(" !ERROR 로그인 실패 알림 실패 "+ex.toString());
		} finally {
			sendReport.put("SCHEDULED_NAME","로그인 실패 알림");
			cmmScheduledMapper.insertScheduledReport(sendReport);
		}
	}
	
	// 자정마다 usertype update
	//@Scheduled(cron = "0 0 0 * * *")
	public void updateUserTypeByExpireDate() {
		HashMap<String, Object> sendReport = new HashMap<String, Object>();
		try {
			cmmScheduledMapper.updateUserTypeByExpireDate();
			cmmScheduledMapper.updateUserTypeByprePayment();
			sendReport.put("CAUSE","USER_TYPE UPDATE 성공");
		} catch (Exception e) {
			logger.trace(" [ ERROR ] USER_TYPE UPDATE 실패 : " + e.toString());
		} finally {
			sendReport.put("SCHEDULED_NAME","[ Billing ][ USER_TYPE UPDATE ]");
			cmmScheduledMapper.insertScheduledReport(sendReport);
		}
	}
}
