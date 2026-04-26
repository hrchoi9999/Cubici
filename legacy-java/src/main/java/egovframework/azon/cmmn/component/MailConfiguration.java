package egovframework.azon.cmmn.component;

import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfiguration {
	
	Logger logger = LoggerFactory.getLogger(MailConfiguration.class);
	
	private Properties prop;
	private String host;
	private String port;
	private String user;
	private String pass;

//	@Value("${cubici.mail.smtp.user}")
//	String user;
//	@Value("${cubici.mail.smtp.pass}")
//	String pass;
	
	@Bean
	public JavaMailSender getMailSender()
	{
		prop = new Properties();
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream is = classLoader.getResourceAsStream("/egovframework/mailsmsweb.properties");
		try {		
			prop.load(is);
		}catch(Exception e) {
			logger.error(e.getMessage());
		}
		this.host = prop.getProperty("smtp.host");
		this.port = prop.getProperty("smtp.port");
		this.user = prop.getProperty("smtp.user");
		this.pass = prop.getProperty("smtp.pass");
			
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
		mailSender.setUsername(user);
		mailSender.setPassword(pass);
		mailSender.setJavaMailProperties(getMailProperties());
		return mailSender;
	}
	
	private Properties getMailProperties()
	{
		Properties properties = new Properties();
		properties.setProperty("mail.transport.protocol", "smtp");
		properties.setProperty("mail.smtp.starttls.enable", "true");
		properties.setProperty("mail.smtp.ssl.trust", host);
		properties.setProperty("mail.smtp.host", host);
		properties.setProperty("mail.smtp.auth", "true");
		properties.setProperty("mail.smtp.port", port);
		properties.setProperty("mail.smtp.socketFactory.port", port);
		properties.setProperty("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
		return properties;
	}

}
