package egovframework.azon.front.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface MemberMapper {
	
    // 회원가입 > 아이디 중복 검사
	HashMap<String, Object> selectIdOverlap(HashMap<String, Object> params);
 	
 	// 회원가입 > 휴대폰번호 중복 검사
 	HashMap<String, Object> selectMobileOverlap(HashMap<String, Object> params);
 	
 	// 회원가입 > 인증번호 저장
	void insertEmailSmSAuth(HashMap<String, Object> resultMap);	
	
	// 회원가입 > 인증번호 불러오기
	HashMap<String, Object> selectAuthNum(HashMap<String, Object> params);
	
    // 회원가입 > 회원번호 최대값
    int userNoMax();
    
    // 회원가입 > 큐빅아이 코드
 	ArrayList<HashMap<String, Object>> selectCubiciCodeCount(HashMap<String, Object> params);
 	
    // 회원등록
    int insertUser(HashMap<String, Object> params);
    
    // 회원쇼핑몰 등록/수정
	void insertShopAccount(HashMap<String, Object> paramMap);
    
    // 회원쇼핑몰 수정
    void updateAccount(HashMap<String, Object> params);
    
    // 회원 정보 수정
	void updateUserInfo(HashMap<String, Object> params);
    
    // 아이디 찾기
    HashMap<String, Object> checkUserInfo(HashMap<String, Object> params);
    
    // 비밀번호 초기화
    int resetMemberPwd(HashMap<String, Object> params);
    
    // 마이페이지 > 회원정보
    HashMap<String, Object> selectUserInfo(HashMap<String, Object> params);
    
    // 마이페이지 > 회원 쇼핑몰 목록
	List<HashMap<String, Object>> getShopList(HashMap<String,Object> params);
    
    // 회원탈퇴
    public void deleteUser(HashMap<String, Object> param);
    public void shopAccountLock(HashMap<String, Object> param);
	
	// 사업정보 추가
	void insertBusinessInfo(HashMap<String, Object> paramsMap);
	
	// 사업정보 삭제
	void deleteBussinessInfo(HashMap<String, Object> paramsMap);
	
	// 사업정보 조회
	ArrayList<HashMap<String, Object>> selectBusienssInfo(HashMap<String, Object> params);
	
	// 사업소재지수
	int businessnoMx(HashMap<String, Object> params);
	
	// 사업정보 수정/삭제
	void updateBussinessInfo(HashMap<String, Object> params);

	// 유효성 체크 값 select
	HashMap<String, Object> authCheckSelect(HashMap<String, Object> params);
	
	// 유효성 체크 값 insert
	void authCheckInsert(HashMap<String, Object> params);
	
	// 유효성 체크 값 update
	void authCheckUpdate(HashMap<String, Object> params);
}