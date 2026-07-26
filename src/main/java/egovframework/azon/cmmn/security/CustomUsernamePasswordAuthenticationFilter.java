package egovframework.azon.cmmn.security;

import java.io.IOException;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.util.MimeTypeUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import egovframework.azon.cmmn.security.dto.AuthFilterDto;

public class CustomUsernamePasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter{
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException{
		UsernamePasswordAuthenticationToken authenticationToken;

		if(request.getContentType().contains(MimeTypeUtils.APPLICATION_JSON_VALUE)) {
			try {
				AuthFilterDto authFilterDto = objectMapper.readValue(request.getReader().lines().collect(Collectors.joining()), AuthFilterDto.class);
				Object Credentials = authFilterDto.getUserPw();
				authFilterDto.setUserPw(null);

				authenticationToken = new UsernamePasswordAuthenticationToken(authFilterDto , Credentials);
			}catch (IOException e) {
				throw new AuthenticationServiceException("Request Content-Type(application/json) ParsingError");
			}
		} else {
			String username = obtainUsername(request);
			String password = obtainPassword(request);
			authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
		}
		this.setDetails(request, authenticationToken);

		return this.getAuthenticationManager().authenticate(authenticationToken);
	}
	
	
}
