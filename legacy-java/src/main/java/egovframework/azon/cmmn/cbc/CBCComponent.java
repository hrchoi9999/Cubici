package egovframework.azon.cmmn.cbc;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CBCComponent {
	
	@Value("#{properties['PBUserKey']}")
	private byte pbUserKey[];
	@Value("#{properties['DEFAULT_IV']}")
	private byte bszIV[];
	@Value("#{properties['FilePBUserKey']}")
	private byte filepbUserKey[];
	@Value("#{properties['FileDEFAULT_IV']}")
	private byte filebszIV[];
	
	public String toEncryption(String param) {
		Encryption encryption = new Encryption();
		return encryption.encryption(param, pbUserKey, bszIV);
	}
	
	public String toDecryption(String param) {
		Decryption decryption = new Decryption();
		return decryption.decryption(param, pbUserKey, bszIV);
	}
	
	public byte[] toFileEncryption(byte data[]) throws IOException {
		Encryption encryption = new Encryption();
		return encryption.fileEncryption(data, filepbUserKey, filebszIV);
	}
	
	public byte[] toFileDecryption(byte data[]) throws IOException {
		Decryption decrytion = new Decryption();
		return decrytion.fileDecrytion(data, filepbUserKey, filebszIV);
	}
	
	public boolean isFilePBUserKey(String param) {
		return param.equals(new String(filepbUserKey));
	}
}
