package egovframework.azon.front.cubici.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.stereotype.Service;

import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.dto.SearchDto;
import egovframework.azon.front.cubici.mapper.UserSupportMapper;

@Service
public class UserSupportService {

	@Autowired
	private UserSupportMapper userSupportMapper;
	
	/* ********** 공통 Service ********* */
	// 게시판 리스트 조회
	public ArrayList<HashMap<String, Object>> selectBoardList(HashMap<String, Object> param) {
		String[] boardSearchKey = SearchDto.BoardSearchKey.getSearchkey();
		param = CubiciUtils.QuotesReplace(boardSearchKey, param);
		return userSupportMapper.selectBoardList(param);
	}
	
	// // 게시글 상세(BOARD_NO 조건에 맞는 게시글을 모두 가져옴) 서비스 공지, FAQ 조회
	public HashMap<String, Object> selectBoardDetail(HashMap<String, Object> param) {
		return userSupportMapper.selectBoardDetail(param);
	}
	
	// 게시글 상세(QnA GROUP_NO, DIVISION 조건에 맞는게시글을 모두 가져옴) Q&A 조회
	public ArrayList<HashMap<String, Object>> selectBoardDetailList(HashMap<String, Object> param) {
		HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
		ArrayList<HashMap<String, Object>> resultList = userSupportMapper.selectBoardDetailList(param);
		
		String userNo = String.valueOf(principal.get("user_no"));
		String userType = String.valueOf(principal.get("user_type"));
		String qaUserNo = String.valueOf(resultList.get(0).get("USER_NO"));
		
		
		String selfFlag = (principal != null && userNo.equals(qaUserNo)) ? "Y" : "N";
		String openYN = resultList.get(0).get("OPEN_YN").toString();
		
		if(selfFlag.equals("Y")) {
			selfFlag = "self";
		}else if(!openYN.equals("N") || userType.equals("00")){
			selfFlag = "N";
		}else if(openYN.equals("N")) {
			selfFlag = "Y";
		}
			 
		resultList.get(0).put("selfFlag", selfFlag);

		return resultList;
	}
	
	// 게시글 INSERT
	public void boardInsert(HashMap<String, Object> params) {
		HashMap<String, Object> maxGroupNo = userSupportMapper.selectMaxGroupNO(params); // 게시판 다음 그룹 번호를 가져옴
		params.put("GROUP_NO", (int) maxGroupNo.get("MAX_GROUP_NO") + 1);
		userSupportMapper.boardInsert(params);
	}
	
	// 게시글 삭제
	public void boardDelete(HashMap<String, Object> param) {
		userSupportMapper.boardDelete(param);
	}
	
	// 게시글 수정
	public void boardUpdate(HashMap<String, Object> params) {
		userSupportMapper.boardUpdate(params);
	}
	
	/* ********** 공통 Service 끝 ********* */
}
