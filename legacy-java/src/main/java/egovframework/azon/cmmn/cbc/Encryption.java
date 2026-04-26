package egovframework.azon.cmmn.cbc;

import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.Base64.Encoder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Encryption {
	private static final Logger logger = LoggerFactory.getLogger(Encryption.class);
	
	String encryption(String param, byte pbUserKey[], byte bszIV[]) {
		String result = "";
		byte[] enc = null;
		
		try {
			enc = KISA_SEED_CBC.SEED_CBC_Encrypt(pbUserKey, bszIV, param.getBytes("utf-8"), 0, param.getBytes("utf-8").length);
		} catch (UnsupportedEncodingException e) {
			logger.error(e.getMessage());
		}
		Encoder encoder = Base64.getEncoder();
		byte[] encArray = encoder.encode(enc);
		
		result = new String(encArray);
		
		return result;
	}
	
	byte[] fileEncryption(byte data[], byte pbUserKey[], byte bszIV[]) {
		byte[] enc = null;
		
		try {
			enc = KISA_SEED_CBC.SEED_CBC_Encrypt(pbUserKey, bszIV, data, 0, data.length);
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		
		return enc;
	}
}
