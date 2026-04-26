package egovframework.azon.cmmn;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.NoHandlerFoundException;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ControllerAdvice
public class ExceptionController {
	private final Logger logger = LoggerFactory.getLogger(ExceptionController.class);

	@ExceptionHandler(NoHandlerFoundException.class)
	protected ModelAndView handleNoHandlerFoundException(NoHandlerFoundException e) {
		ModelAndView mav = new ModelAndView();
		ErrorResponse vo = new ErrorResponse(HttpStatus.NOT_FOUND.value(), "Not Found Url", e.getMessage());
		String ErrorPage = "/error/404";
		
		mav.setViewName(ErrorPage);
		
		logger.debug(vo.toString());
		
		return mav;
	}
	 
	@ExceptionHandler(NullPointerException.class)
	protected ModelAndView handleNoHandlerFoundException(NullPointerException e) {
		ModelAndView mav = new ModelAndView();
		ErrorResponse vo = new ErrorResponse(HttpStatus.NOT_FOUND.value(), "Not Found Url", e.getMessage());
		String ErrorPage = "/error/404";
		
		mav.setViewName(ErrorPage);
		
		logger.debug(vo.toString());
		
		return mav;
	}
	
	@Setter
	@Getter
	@ToString
	@AllArgsConstructor
	static class ErrorResponse {
		private int errorCode;
		private String statusCode;
		private String description;
	}
}
