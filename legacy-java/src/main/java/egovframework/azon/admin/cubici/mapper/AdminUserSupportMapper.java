package egovframework.azon.admin.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface AdminUserSupportMapper {
	
	// 게시글 상세(BOARD_NO 조건에 맞는 게시글을 모두 가져옴) 조회
	HashMap<String , Object> selectBoardDetail(HashMap<String, Object> param);
	// 게시판 리스트 조회
	ArrayList<HashMap<String, Object>> selectBoardList(HashMap<String, Object> param);
	// 그룹번호 조회
	HashMap<String, Object> selectMaxGroupNO(HashMap<String, Object> param);
	// 게시글 상세(QnA GROUP_NO, DIVISION 조건에 맞는게시글을 모두 가져옴) 조회
	ArrayList<HashMap<String, Object>> selectBoardDetailList(HashMap<String, Object> param);
	// 답글 다음 순서 조회
	HashMap<String, Object> selectMaxGroupOrder(HashMap<String, Object> params);
	// 답글 INSERT
	void boardCommentInsert(HashMap<String, Object> params);
	// 답글 UPDATE
	void boardCommentUpdate(HashMap<String, Object> param);
	// 게시글 INSERT
	void boardInsert(HashMap<String, Object> params);
	// 게시글 수정
	void boardUpdate(HashMap<String, Object> params);
	// 게시글 삭제
	void boardDelete(HashMap<String, Object> param);
	/* SMS 리스트 시작 */
	
	// SMS 리스트 조회
	ArrayList<HashMap<String, Object>> SMSBoardList(HashMap<String, Object> param);
	// SMS INSERT
	void SMSInsert(HashMap<String, Object> params);
	// SMS 수정
	void SMSUpdate(HashMap<String, Object> params);
	// SMS 삭제
	void SMSDelete(HashMap<String, Object> params);
	// SMS CodeCheck
	HashMap<String, Object> SMSCodeCheck(HashMap<String, Object> params);
	// SMS 상세 조회
	HashMap<String , Object> SMSBoardDetail(HashMap<String, Object> param);
	// SMS 메일 발송 쿼리
	HashMap<String, Object> SMSSendMailContent(HashMap<String, Object> param);
	
	/* SMS 리스트 끝 */
	
}
