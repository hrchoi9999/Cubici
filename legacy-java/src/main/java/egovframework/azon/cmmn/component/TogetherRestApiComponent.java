package egovframework.azon.cmmn.component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 * 2021.02.04 ktkim
 * */
public class TogetherRestApiComponent {
	
	public static String sendRest(String sendUrl, String jsonValue)	throws IllegalStateException {
		
		String inputLine = null;
		StringBuffer outResult = new StringBuffer();
		
		/* Logger */
		Logger logger = LoggerFactory.getLogger(TogetherRestApiComponent.class);
		
		try {
			if (logger.isDebugEnabled()) System.out.println("RESTful API Start");			
			
			URL url = new URL(sendUrl);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setDoOutput(true);
			conn.setRequestMethod("POST");
			conn.setRequestProperty("Content-Type", "application/json");
			conn.setRequestProperty("Accept-Charset", "UTF-8");
			conn.setConnectTimeout(10000);
			conn.setReadTimeout(10000);
			
			OutputStream os = conn.getOutputStream();
			os.write(jsonValue.getBytes("UTF-8"));
			os.flush();
			
			// 결과 값.
			BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
			while((inputLine = br.readLine()) != null) {
				outResult.append(inputLine);
			}
			
			conn.disconnect();
			if (logger.isDebugEnabled()) System.out.println("RESTful API End");					
						
			
		} catch(Exception e) {
			logger.error(e.getMessage());
		}
		
		return outResult.toString();
		
	}
}
