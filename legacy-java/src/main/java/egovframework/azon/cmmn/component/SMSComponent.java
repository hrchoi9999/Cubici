package egovframework.azon.cmmn.component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.impl.client.HttpClients;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Component;

// SMS 발송
@Component
public class SMSComponent {
	
	Logger logger = LoggerFactory.getLogger(SMSComponent.class);
	
	private String SMS_URL; // 전송요청 URL
	private String SMS_ID; // 발신번호
	private String SMS_KEY; //인증키
	private String SMS_SENDER; // 발신번호
	private String isTest;	// 테스트 여부  Y 인경우 실제문자 전송X , 자동취소(환불) 처리
	
	public void callProperties() {
		Properties prop = new Properties();
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream is = classLoader.getResourceAsStream("/egovframework/mailsmsweb.properties");
		try {		
			prop.load(is);
		}catch(Exception e) {
			logger.error(e.getMessage());
		}
		this.SMS_URL = prop.getProperty("sms.url");
		this.SMS_ID = prop.getProperty("sms.id");
		this.SMS_KEY = prop.getProperty("sms.key");
		this.SMS_SENDER = prop.getProperty("sms.sender");
		this.isTest = prop.getProperty("isTest");
	}	

	public String send(String cellNo, String title, String context){
		
		callProperties();
		
		cellNo = cellNo.replaceAll("-", "");
		String nReturn = "fail";		

		try{
			final String encodingType = "UTF-8";
			final String boundary = "____boundary____";

			/**************** 문자전송하기 예제 *******************************
			* "result_code":결과코드,"message":결과문구,
			* "msg_id":메세지ID,"error_cnt":에러갯수,"success_cnt":성공갯수
			* 동일내용 > 전송용 입니다.
			*******************************************************************/

			/******************** 인증정보 ********************/
			Map<String, String> sms = new HashMap<String, String>();
			sms.put("user_id", this.SMS_ID); // SMS 아이디
			sms.put("key", this.SMS_KEY); //인증키
			/******************** 인증정보 ********************/

            /******************** 전송정보 ********************/
			sms.put("sender", this.SMS_SENDER); // 발신번호
			sms.put("receiver", cellNo); // 수신번호 [sms.put("receiver", "01111111111,01111111112");]
			sms.put("msg", context); // 메세지 내용
			sms.put("title", title); //  LMS, MMS 제목 (미입력시 본문중 44Byte 또는 엔터 구분자 첫라인)
			sms.put("destination", ""); // 수신인 %고객명% 치환 [sms.put("destination", "01111111111|담당자,01111111112|홍길동");]
			sms.put("rdate", ""); // 예약일자 - 20161004 : 2016-10-04일기준
			sms.put("rtime", ""); // 예약시간 - 1930 : 오후 7시30분
			sms.put("testmode_yn", this.isTest); // Y 인경우 실제문자 전송X , 자동취소(환불) 처리

			String image = ""; // image = "/tmp/pic_57f358af08cf7_sms_.jpg"; // MMS 이미지 파일 위치
			/******************** 전송정보 ********************/

			MultipartEntityBuilder builder = MultipartEntityBuilder.create();
			builder.setBoundary(boundary);
			builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
			builder.setCharset(Charset.forName(encodingType));

			for(Iterator<String> i = sms.keySet().iterator(); i.hasNext();){
				String key = i.next();
				builder.addTextBody(key, sms.get(key), ContentType.create("Multipart/related", encodingType));
            }

			File imageFile = new File(image);
			if (image!=null && image.length()>0 && imageFile.exists()) {
				builder.addPart("image", new FileBody(imageFile, ContentType.create("application/octet-stream"),URLEncoder.encode(imageFile.getName(), encodingType)));
			}

			org.apache.http.HttpEntity entity = builder.build();
			HttpClient client = HttpClients.createDefault();
			HttpPost post = new HttpPost(this.SMS_URL);
			post.setEntity(entity);
			HttpResponse res = client.execute(post); // 요금 부과로인해 주석처리.

			String result = "";
			if(res != null){
				BufferedReader in = new BufferedReader(new InputStreamReader(res.getEntity().getContent(), encodingType));
				String buffer = null;
				while((buffer = in.readLine())!=null){
					result += buffer;
				}
				in.close();
			}
			
			JSONParser jsonParser = new JSONParser();
			JSONObject jsonobj = (JSONObject) jsonParser.parse(result);
			
			logger.debug("################################ SMSResult ################################");
			logger.debug("Receiver :: " + cellNo);
			logger.debug("Msg :: " + context);
			logger.debug("ResultCode :: " + jsonobj.get("result_code").toString());
			logger.debug("ResultMsg :: " + jsonobj.get("message").toString());
			logger.debug("###########################################################################");
			
			nReturn = String.valueOf(jsonobj.get("message"));

		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		
		return nReturn;
	}

}
