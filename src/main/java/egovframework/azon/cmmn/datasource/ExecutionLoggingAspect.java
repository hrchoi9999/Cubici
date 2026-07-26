package egovframework.azon.cmmn.datasource;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
@Order(value = 1)
public class ExecutionLoggingAspect implements InitializingBean {
	
	//private static final Logger	logger	= LoggerFactory.getLogger(ExecutionLoggingAspect.class);
	
	@Around("execution(* *..*Service.*(..))")
	public Object doServiceProfiling(ProceedingJoinPoint joinPoint) throws Throwable {
		
		//-- get method name
		final String methodName = joinPoint.getSignature().getName();
		final MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
		Method method = methodSignature.getMethod();			
		if (method.getDeclaringClass().isInterface()) {
			method = joinPoint.getTarget().getClass().getDeclaredMethod(methodName, method.getParameterTypes());
		}

		//-- get annotation name, set datasource
		DataSource dataSource = (DataSource) method.getAnnotation(DataSource.class);
//		logger.info("init dataSource : " + dataSource);
		if (dataSource == null) {
			// default LOADER
			ContextHolder.setDataSourceType(DataSourceType.CUBICI);
		} else {
			ContextHolder.setDataSourceType(dataSource.value());
		}
		//logger.debug("final dataSource : " + ContextHolder.getDataSourceType());
		Object returnValue = joinPoint.proceed();
		ContextHolder.clearDataSourceType();		

		return returnValue;
	}

	public void afterPropertiesSet() throws Exception { }

}
