package egovframework.azon.cmmn.interceptor;

import org.springframework.util.AntPathMatcher;

import java.util.Map;

public class CaseInsensitiveAntPathMatcher extends AntPathMatcher {
	@Override
	protected boolean doMatch(String pattern, String path, boolean fullMatch, Map<String, String> uriTemplateVariables) {
		return super.doMatch(pattern.toLowerCase(), path.toLowerCase(), fullMatch, uriTemplateVariables);
	}
}