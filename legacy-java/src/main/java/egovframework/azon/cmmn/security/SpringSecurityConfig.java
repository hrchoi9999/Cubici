package egovframework.azon.cmmn.security;

import java.util.HashMap;
import java.util.List;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.session.SessionFixationProtectionStrategy;
import org.springframework.security.web.context.SecurityContextPersistenceFilter;



@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled=true, securedEnabled = true)
public class SpringSecurityConfig extends WebSecurityConfigurerAdapter {
	
	@Autowired
	AuthProvider authProvider;
	
	@Autowired
	AuthSuccessHandler authSuccessHandler;
	
	@Autowired
	AuthFailureHandler authFailureHandler;
	
	@Autowired
	CustomLogoutSuccessHandler customLogoutSuccessHandler;
	
	@Autowired
	CustomDeniedHandler customDeniedHandler;
	
	@Autowired
	CustomAuthenticationEntryPoint customauthenticationentrypoint;
	
	@Autowired
	SecurityService securityService;
	
	@Autowired
	SecurityBeforeFilter securityBeforeFilter;
	
	 @Bean
     public RoleHierarchy roleHierarchy() {
         RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();

         HashMap<String, List<String>> roleHierarchyMap = new HashMap<String, List<String>>();
         roleHierarchyMap.put("ROLE_USER_MB", Arrays.asList("ROLE_USER"));
         roleHierarchyMap.put("ROLE_USER_ADMIN", Arrays.asList("ROLE_MB_ADVANCE", "ROLE_MB_REQUEST", "ROLE_MB_EVALUATE", "ROLE_MB_CONTRACT", "ROLE_USER_MB"));

         String roles = RoleHierarchyUtils.roleHierarchyFromMap(roleHierarchyMap);
         
         roleHierarchy.setHierarchy(roles);

         return roleHierarchy;
     }
	
	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.authenticationProvider(authProvider);
	}
	
	@Override
	public void configure(WebSecurity web) throws Exception{
		web.ignoring()
		.antMatchers("/resources/**", "/favicon.ico");
	}
	
	@Override
	protected void configure(HttpSecurity http) throws Exception{
		http.addFilterBefore(securityBeforeFilter, SecurityContextPersistenceFilter.class);

		String[] roleUserUri = securityService.getUri("ROLE_USER");
		String[] roleMBUri = securityService.getUri("ROLE_USER_MB");
		String[] authenticated = securityService.getUri("Authenticated");
		String[] roleAdminCubiciUri = securityService.getUri("ROLE_ADMIN_CUBICI");
		String[] roleAdminHelloUri = securityService.getUri("ROLE_ADMIN_HELLO");
		String[] roleAdminTogetherUri = securityService.getUri("ROLE_ADMIN_TOGETHER");
		String[] roleAdminRootUri = securityService.getUri("ROLE_GRADE_ROOT");
	
		http.csrf().disable();
		
		http.authorizeRequests()
			.antMatchers("/moneybank/**/request/**").hasAnyRole("MB_ADVANCE", "MB_REQUEST", "MB_ERROR", "USER_ADMIN")
			.antMatchers("/moneybank/**/evaluate").hasAnyRole("MB_EVALUATE", "USER_ADMIN")
			.antMatchers("/moneybank/**/evaluate/**").hasAnyRole("MB_EVALUATE", "USER_ADMIN")
			.antMatchers("/moneybank/**/contract/**").hasAnyRole("MB_CONTRACT", "USER_ADMIN")
			.antMatchers(roleUserUri).hasAnyRole("USER", "USER_MB", "USER_ADMIN")
			.antMatchers(roleMBUri).hasAnyRole("USER_MB", "USER_ADMIN")
			.antMatchers(roleAdminCubiciUri).access("hasRole('ADMIN_CUBICI')")
			.antMatchers(roleAdminHelloUri).access("hasRole('ADMIN_CUBICI') or hasRole('ADMIN_HELLO')")
			.antMatchers(roleAdminTogetherUri).access("hasRole('ADMIN_CUBICI') or hasRole('ADMIN_TOGETHER')")
			.antMatchers(roleAdminRootUri).access("hasRole('ADMIN_CUBICI') and hasRole('GRADE_ROOT')")
			.antMatchers(authenticated).authenticated()
			.antMatchers("/**").permitAll();
		
		http.formLogin().disable();
		
		http.addFilterAt(getAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
		
		http.sessionManagement()
			.sessionFixation().changeSessionId();
			//.invalidSessionUrl("/login");
			//.maximumSessions() 동일 사용자 최대 세션
			//.maxSessionsPreventsLogin(boolean) // 최대 세션 개수 도달시 로그인 가능 여부
			//.and()
		
		http.logout()
			.logoutUrl("/logout")
			.logoutSuccessHandler(customLogoutSuccessHandler)
			.invalidateHttpSession(true)
			.deleteCookies("JSESSIONID");
		
		
		http.exceptionHandling()
			.accessDeniedHandler(customDeniedHandler)
			.authenticationEntryPoint(customauthenticationentrypoint);
	}
	
	@Bean
	protected CustomUsernamePasswordAuthenticationFilter getAuthenticationFilter() throws Exception {
		CustomUsernamePasswordAuthenticationFilter authFilter = new CustomUsernamePasswordAuthenticationFilter();

		authFilter.setFilterProcessesUrl("/loginAction");
		authFilter.setAuthenticationManager(this.authenticationManagerBean());
		authFilter.setAuthenticationSuccessHandler(authSuccessHandler);
		authFilter.setAuthenticationFailureHandler(authFailureHandler);
		authFilter.setSessionAuthenticationStrategy(new SessionFixationProtectionStrategy());

		return authFilter;
	}
	
	@Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
}