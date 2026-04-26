package egovframework.azon.cmmn.cbc;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.Base64.Decoder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Decryption {
	private static final Logger logger = LoggerFactory.getLogger(Decryption.class);
	
	String decryption(String param, byte pbUserKey[], byte bszIV[]) {
		Decoder decoder = Base64.getDecoder();
		byte[] enc = decoder.decode(param);
    	
		String result = "";
		byte[] dec = null;
    	
		try {
			dec = KISA_SEED_CBC.SEED_CBC_Decrypt(pbUserKey, bszIV, enc, 0, enc.length);
			result = new String(dec, "utf-8");
		} catch (UnsupportedEncodingException e) {
			logger.error(e.getMessage());
		}
		
		return result;
	}
	
	byte[] fileDecrytion(byte data[], byte pbUserKey[], byte bszIV[]) throws IOException {
		byte[] dec = null;
		
		try {
			dec = KISA_SEED_CBC.SEED_CBC_Decrypt(pbUserKey, bszIV, data, 0, data.length);
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		
		return dec;
	}
}
