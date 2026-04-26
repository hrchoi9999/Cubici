package egovframework.azon.cmmn.cubici;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Scanner;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class URLConn {
	Logger logger = LoggerFactory.getLogger(URLConn.class);
	
	URLConnection conn;

    public URLConn(String urlpath,int port){
        try {
            URL url = new URL(urlpath+":"+port);
            conn = url.openConnection();
        } catch (MalformedURLException e) {
            logger.error(e.getMessage());
        } catch (IOException e) {
        	logger.error(e.getMessage());
        }
    }
    
    public void urlPost(JSONObject jsonObject) {
        conn.setDoOutput(true);
        conn.setUseCaches(false);
        conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        try {
            OutputStreamWriter wr= new OutputStreamWriter(conn.getOutputStream());
            wr.write(jsonObject.toString());
            wr.flush();

            InputStream is = conn.getInputStream();
            Scanner sc = new Scanner(is);
            int line =1;
            while (sc.hasNext()){
                String str = sc.nextLine() ;
                System.out.println((line++) + ":" + str);
            }
            sc.close();
        } catch (IOException e) {
        	logger.error(e.getMessage());
        }
    }
	
}
