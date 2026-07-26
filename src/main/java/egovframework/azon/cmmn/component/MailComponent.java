package egovframework.azon.cmmn.component;

import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Component;

@Component
public class MailComponent {
	
	Logger logger = LoggerFactory.getLogger(MailComponent.class);
	
	private String from;
	
    @Autowired
    private JavaMailSender javaMailSender;
    
    public void callProperties() {
		Properties prop = new Properties();
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream is = classLoader.getResourceAsStream("/egovframework/mailsmsweb.properties");
		try {		
			prop.load(is);
		}catch(Exception e) {
			logger.error(e.getMessage());
		}
		this.from = prop.getProperty("smtp.from"); // 보내는 사람
	}
    
    /* 메일발송
     * @param type     - 메일폼타입
     * @param setTxt   - 메일폼 입력 파라미터
     * @param fromMail - 발신 메일 주소
     * @param toMail   - 수신 메일 주소
     * @param title    - 제목 */
    
    public boolean send(Integer flag, String toMail, String title, String[] setTxt) {
        return true;
    }

	public boolean send(String toMail, String title, String content) {
		callProperties();
		
		MimeMessagePreparator messagePreparator = mimeMessage -> {
			final MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
			messageHelper.setFrom(this.from);
			messageHelper.setTo(toMail);
			messageHelper.setSubject(title);
			messageHelper.setText(content, true);
		};

		try {
			javaMailSender.send(messagePreparator);
		} catch (MailException ex) {
			logger.trace("[ ERROR ] [ MailComponent] "+ex.getLocalizedMessage());
			return false;
		}
		
		return true;
	}

//	public boolean send(String fromMail, String toMail, String title, String content, boolean isHTML,
//			List<MultipartFile> files) {
//		MimeMessagePreparator messagePreparator = mimeMessage -> {
//			final MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
//			messageHelper.setFrom(fromMail);
//			messageHelper.setTo(toMail);
//			messageHelper.setSubject(title);
//			messageHelper.setText(content, isHTML);
//
//			if (files != null && files.size() > 0) {
//				for (MultipartFile file : files) {
//					File f = new File(file.getOriginalFilename());
//					// CommonUtil.inputStreamToFile(file.getInputStream(), f);
//					messageHelper.addAttachment(f.getName(), f);
//				}
//			}
//		};
//
//		try {
//			javaMailSender.send(messagePreparator);
//		} catch (MailException e) {
//			e.printStackTrace();
//			return false;
//		}
//
//		return true;
//	}
}

   
