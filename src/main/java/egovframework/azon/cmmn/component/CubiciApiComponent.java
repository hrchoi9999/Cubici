package egovframework.azon.cmmn.component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.stereotype.Component;

@Component
public class CubiciApiComponent {
	//String jsonMessage
	public String bizNumAuth(String jsonValue) throws Exception {
		
		//return 값
		String returnValue = "";
		
		String urlText = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=9TmCD61d%2Fk858w6KVAFuf6Y66ixOraslQVsAlht6N49SsN0JPcoMXV%2BoZATC3Yd9OMg%2F%2BKe8pfG4DqVh7OH2HA%3D%3D";
		URL url = new URL(urlText);
		HttpURLConnection con = (HttpURLConnection) url.openConnection();
		
		con.setConnectTimeout(5000); //서버에 연결되는 Timeout 시간 설정
		con.setReadTimeout(5000); // InputStream 읽어 오는 Timeout 시간 설정
		
		con.setRequestMethod("POST");
		
		con.setRequestProperty("Content-Type", "application/json");
		
		con.setDoInput(true);// InputStream으로 서버로부터 응답을 받음
		con.setDoOutput(true); // POST데이터를 outputStream으로 넘겨주겠다는 설정
		con.setUseCaches(false); // 캐시에 저장된 값이아닌 동적으로 그 순간에 생성된 결과를 읽는다, 파라미터 전송의경우 페이지 결과에 따라서 순간순간 파라미터 값이 바뀔수 있기 때문
		//con.setDefaultUseCaches(false);
		
		//문자 출력 스트림인 Writer로 변환시켜준다
		OutputStreamWriter wr = new OutputStreamWriter(con.getOutputStream());//Request Body에 Data를 담기 위해서 OutputStream 객체를 생성
		wr.write(jsonValue); //json 메세지 전달 
		wr.flush(); // 데이터 입력
		
		StringBuilder sb = new StringBuilder();
		if (con.getResponseCode() == HttpURLConnection.HTTP_OK) {
			//Stream 처리
			//입력 데이터를 바이트 단위로 데이터를 입력받기 때문에 입력데이터를 char 형태로 처리하기 위해서 중개자 역할인 문자스트림 InputStreamReader 로 감싸준다.
			BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"));// 입력받은 문자를 쌓고 한 번에 문자열처럼 보낸다.
			String line;
			while((line=br.readLine()) != null) {
				sb.append(line).append("\n");
			}
			br.close();
		} else {
			System.out.println(con.getResponseMessage());
		}
		
		//Json파싱 후 JSONObject로 변환
		JSONParser jsonParse = new JSONParser();
		JSONObject jsonObj = (JSONObject) jsonParse.parse(sb.toString());
		
		//JSONObject에서 data부분을 저장
		JSONArray dataArray = (JSONArray) jsonObj.get("data");
		
		// 하나만 불러오므로 for문 사용 x
		JSONObject dataObject = (JSONObject) dataArray.get(0);
		
		String bizStatus = dataObject.get("b_stt_cd").toString();
		// 01: 계속사업자 02: 휴업자 03: 폐업자
		returnValue = bizStatus;
		
		// 04: 등록되지않은 사업자
		if (returnValue.equals("")) {
			returnValue = "04";
		}
		
		return returnValue;
	}
}
