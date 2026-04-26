package egovframework.azon.cmmn;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.SimpleMappingExceptionResolver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class EgovAzonMappingExceptionResolver extends SimpleMappingExceptionResolver{

	//private static final Logger LOGGER = LoggerFactory.getLogger(EgovAzonMappingExceptionResolver.class);

	@Override
    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
	    ModelAndView mav = new ModelAndView("jsonView");
		//LOGGER.error("ExceptionURI : {}", request.getRequestURI());
        if (request.getParameterMap().get("fileRename")!=null) {
            return mav;
        }
        return super.resolveException(request, response, handler, ex);
    }
}