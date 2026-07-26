package egovframework.azon.cmmn.moneybank.api;

import java.io.IOException;
import java.util.HashMap;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
public class MoneybankDocumentAPI {
	
	Logger logger = LoggerFactory.getLogger(MoneybankDocumentAPI.class);
	
	@Value("#{properties['user-id']}")
	private String userId;
	@Value("#{properties['Hkey']}")
	private String Hkey;
	@Value("#{properties['Ekey']}")
	private String Ekey;
	
	private final String SCHEMA = "https";
	private final int PORT = 443;
	private final String HOST = "api.hyphen.im";
	
	public String hyphenAPI(String path, HashMap<String, Object> paramMap) {
		String result = "";
		
		CloseableHttpClient client = null;
		CloseableHttpResponse response = null;
		
		JSONObject jObject = new JSONObject(paramMap);
		URIBuilder uriBuilder = new URIBuilder().setPath(path);
		
		try {
			client = HttpClients.createDefault();
			
			uriBuilder.setScheme(SCHEMA).setHost(HOST).setPort(PORT);
			HttpPost post = new HttpPost(uriBuilder.build().toString());
			
			post.addHeader("Content-Type", "application/json");
			post.addHeader("user-id", userId);
			post.addHeader("Hkey", Hkey);
			
			StringEntity params = new StringEntity(jObject.toString(), "UTF-8");
			post.setEntity(params);
			try {
				response = client.execute(post);
				HttpEntity entity = response.getEntity();
				result = EntityUtils.toString(entity);
			} catch (Exception e) {
				logger.error("Hyphen Api Exception ::: " + e.getMessage());
			} finally {
				if(response != null) {
					try {
						response.close();
					} catch (IOException e) {
						logger.error("Hyphen Api Exception ::: " + e.getMessage());
					}
				}
			}
		} catch (Exception e) {
			logger.error("Hyphen Api Exception ::: " + e.getMessage());
		} finally {
			if(client != null) {
				try {
					client.close();
				} catch (IOException e) {
					logger.error("Hyphen Api Exception ::: " + e.getMessage());
				}
			}
		}
		
		return result;
	}
}
