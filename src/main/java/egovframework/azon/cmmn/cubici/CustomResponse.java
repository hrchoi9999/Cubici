package egovframework.azon.cmmn.cubici;

import java.util.HashMap;

public class CustomResponse extends HashMap<String, Object>{
	
private static final long serialVersionUID = -7319519746182403915L;
	
	//private boolean success = true;
	//private Map<String, Object> resultMap = null;  // Map을 wrap하는 형태에서 HashMap을 상속받는 형태로 수정함
	
	public CustomResponse(boolean success) {
		super();
		this.put("success", success);
	}
	
	public CustomResponse() {
		this(true);
	}
	
	
	public CustomResponse add(String key, Object value) {
		this.put(key, value);
		return this;
	}
	
	public CustomResponse addList(String key, Object value) {
		
		// List type 이면 count 추가
		// this.put(key + "Cnt", ((List)value).size());
		
		this.put(key, value);
		return this;
	}
	
	public CustomResponse addTree(Object value) {
		
		// treeStore 는 하나만 리턴할 수 있음
		// 이미 children을 key로 가지고 있는 경우는 exception 처리할 것  
		
		this.put("children", value);
		return this;
	}
	
	public CustomResponse error(String message) {
		this.put("success", false);
		this.put("msg", message);
		return this;
	}

}
