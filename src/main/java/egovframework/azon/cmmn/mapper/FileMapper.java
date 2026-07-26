package egovframework.azon.cmmn.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface FileMapper {
	public void fileUpload(HashMap<String, Object> paramMap);
	
	public void fileDelete(String param);
	
	public HashMap<String, Object> FilePath(String param);
	
	public ArrayList<HashMap<String, Object>> fileList(HashMap<String, Object> paramMap);
	
	public ArrayList<HashMap<String, Object>> fileDelList(HashMap<String, Object> paramMap);
	
	public boolean isFile(HashMap<String, Object> paramMap);
}
