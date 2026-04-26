package egovframework.azon.admin.cubici.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import egovframework.azon.admin.cubici.mapper.AdminUserSupportMapper;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.dto.SearchDto;
import egovframework.azon.cmmn.exception.FileException;
import egovframework.azon.cmmn.service.FileService;

@Service
public class AdminUserSupportService {
	
	@Value("#{properties['NoticeFilePath']}")
	private String NoticeFilePath;
	
	@Autowired
	private AdminUserSupportMapper adminUserSupportMapper;
	
	@Autowired
	private FileService fileService;
	
	// 게시판 리스트 조회
	public ArrayList<HashMap<String, Object>> selectBoardList(HashMap<String, Object> param) {
		String[] boardSearchKey = SearchDto.BoardSearchKey.getSearchkey();
		param = CubiciUtils.QuotesReplace(boardSearchKey, param);
		return adminUserSupportMapper.selectBoardList(param);
	}
	
	// // 게시글 상세(BOARD_NO 조건에 맞는 게시글을 모두 가져옴) 서비스 공지, FAQ 조회
	public HashMap<String, Object> selectBoardDetail(HashMap<String, Object> param) {
		return adminUserSupportMapper.selectBoardDetail(param);
	}
	
	// 게시글 상세(QnA GROUP_NO, DIVISION 조건에 맞는게시글을 모두 가져옴) Q&A 조회
	public ArrayList<HashMap<String, Object>> selectBoardDetailList(HashMap<String, Object> param) {
		return adminUserSupportMapper.selectBoardDetailList(param);
	}
	
	// 답글 INSERT
	public void boardCommentInsert(HashMap<String, Object> params) {

		HashMap<String, Object> maxGroupNo = adminUserSupportMapper.selectMaxGroupOrder(params); // 게시글의 다음 순서를 가져옴
		params.put("GROUP_ORDER", (int) maxGroupNo.get("MAX_GROUP_ORDER") + 1);

		adminUserSupportMapper.boardCommentInsert(params);
	}
	
	// 답글 UPDATE
	public void boardCommentUpdate(HashMap<String, Object> param) {
		adminUserSupportMapper.boardCommentUpdate(param);
	}

	public void boardInsert(HashMap<String, Object> paramMap) {
		cmmBoardInsert(paramMap);
	}
	
	public void boardUpdate(HashMap<String, Object> paramMap) {
		adminUserSupportMapper.boardUpdate(paramMap);
	}
	
	public void boardInsert(HashMap<String, Object> paramMap, List<MultipartFile> fileList) throws FileException, IOException {
		cmmBoardInsert(paramMap);
		boardFileUpload(paramMap,fileList);
	}
	
	public void boardUpdate(HashMap<String, Object> paramMap, List<MultipartFile> fileList) throws FileException, IOException {
		adminUserSupportMapper.boardUpdate(paramMap);
		boardFileUpload(paramMap, fileList);
	}
	
	private void cmmBoardInsert(HashMap<String, Object> paramMap) {
		HashMap<String, Object> maxGroupNo = adminUserSupportMapper.selectMaxGroupNO(paramMap);
		paramMap.put("GROUP_NO", (int) maxGroupNo.get("MAX_GROUP_NO") + 1);
		adminUserSupportMapper.boardInsert(paramMap);
	}
	
	private void boardFileUpload(HashMap<String, Object> paramMap, List<MultipartFile> fileList) throws FileException, IOException {
		if(!fileList.isEmpty()) {
			String file_division_pk = String.valueOf(paramMap.get("BOARD_NO"));
			paramMap.put("enc_type", "N");
			paramMap.put("file_division", "notice");
			paramMap.put("file_division_pk", file_division_pk);
			fileService.fileUpload(paramMap, fileList, NoticeFilePath);
		}
	}
	
	public void boardDelete(HashMap<String, Object> paramMap) {
		adminUserSupportMapper.boardDelete(paramMap);
		
		HashMap<String, Object> fileMap = new HashMap<String, Object>();
		fileMap.put("file_division", "notice");
		fileMap.put("file_division_pk", String.valueOf(paramMap.get("BOARD_NO")));
		
		if(fileService.isFile(fileMap)){
			fileService.fileDelete(fileMap);
		}
	}
	
	public ArrayList<HashMap<String, Object>> SMSBoardList(HashMap<String, Object> param){
		return adminUserSupportMapper.SMSBoardList(param);
	}
	
	// SMS INSERT
	public void SMSInsert(HashMap<String, Object> params) {
		adminUserSupportMapper.SMSInsert(params);
	}
	
	// SMS UPDATE
	public void SMSUpdate(HashMap<String, Object> params) {
		adminUserSupportMapper.SMSUpdate(params);
	}
	
	// SMS DELETE
	public void SMSDelete(HashMap<String, Object> params) {
		adminUserSupportMapper.SMSDelete(params);
	}
	
	// SMS CodeCheck
	public HashMap<String, Object> SMSCodeCheck(HashMap<String, Object> params) {
		return adminUserSupportMapper.SMSCodeCheck(params);
	}
	
	// SMS 상세 조회
	public HashMap<String , Object> SMSBoardDetail(HashMap<String, Object> param){
		return adminUserSupportMapper.SMSBoardDetail(param);
	}
	/* SMS 리스트 끝 */
}
