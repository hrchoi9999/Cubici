package egovframework.azon.cmmn.errorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public enum MoneyBankErrorCode {
    MoneyBankServiceOverlap("M001", "머니뱅크 서비스는 중복 이용이 불가합니다. 현재 이용하고 계시는 서비스 만료이후 신청해주시기 바랍니다.", "Another service is in use."),
    UserTermination("M002", "큐빅아이 서비스를 가입후 신청이 가능합니다.", "apply after signing up for Cubici service."),
    AlreadyAdvanceRequestSuccess("M003", "이미 사전 신청을 완료했습니다. 하단에 신청 버튼을 눌러주세요.", "pre-application successfully."),
    AlreadyAdvanceRequestfailer("M004", "사전 신청은 하루에 한번만 신청 가능합니다. 내일 다시 신청해주세요.", "Pre-application failed."),
    RequestFileNotFind("M005", "관리자에게 문의해 주세요.", "file not found."),
    NotAdvanceRequest("M006", "사전신청 후 이용바랍니다.", "No prior application has been made."),
    AbnormalUserStatus("M007", "비정상적인 접근입니다. 관리자에게 문의해 주세요.", "an abnormal user status."),
    AbnormalApproach("M008", "비정상적인 접근입니다. 관리자에게 문의해 주세요.", "an abnormal approach."),
    NotMBProductSelection("M009", "신청하실 상품을 선택해주세요.", "No product selection."),
    NotSubmissionDocuments("M010", "제출서류를 확인해 주세요.", "Not Submission Documents."),
    AdvanceRequest("M011", "이미 사전신청이 완료되었습니다.", "No prior application has been made."),
    RejectApproach("M012", "머니뱅크 사용이 불가합니다. 관리자에게 문의해 주세요.", "Reject Approach."),
    AccountCertificationError("M013", "인증서 정보가 올바르지 않습니다.", "Account Certification Error"),
    CheckPassword("M014", "인증서 정보가 올바르지 않습니다. 비밀번호를 확인해주세요.", "Check Certificate Password"),
    CertificateExpiration("M015", "인증서가 만료되었습니다.", "Certificate Expiration"),
    NotRegisteredCertificate("M016", "등록되지 않은 인증서입니다. 인증서 등록 후 이용해주시기 바랍니다.", "Not Registered Certificate"),
    BankInformationError("M017", "입력하신 은행 정보가 올바르지 않습니다. 은행 정보를 확인해 주세요.", "Bank Information Error"),
    ProcessingError("M018", "처리중 오류가 발생하였습니다. 잠시후 시도해 주십시오.", "Processing Error"),
    NetworkError("M019", "네트워크 연결에 실패하였습니다. 잠시후 다시 이용하여 주십시오.", "Network Error"),
    DriverLicenseInvalid("M020", "입력하신 정보가 올바르지 않습니다. 가입하신 아이디의 대표자명과 입력하신 정보를 확인해주세요.", "Driver's license is not valid"),
    AdvanceRequestTypeError("M021", "올바르지 않은 값입니다.", "AdvanceRequest is type Error"),
    HyphenApiResError("M900", "관리자에게 문의해 주세요.", "Hyphen Response Value Error"),
    JsonRequestError("M901", "관리자에게 문의해 주세요.", "Error sending json value"),
    HyphenApiUserReqError("M902", "가입하신 대표자명과 입력하신 정보를 확인한 뒤 다시 시도해주세요.", "User input error"),
    DemandAccount("M903", "정산계좌를 확인해 주세요.", "check the settlement account"),
    MainAccount("M904", "주거래계좌를 확인해 주세요.", "check the main account"),
    BizNoNotMatch("M905", "사업자 번호가 일치하지 않습니다. 회원가입시 등록한 사업자 번호를 확인해 주세요.", "business number does not match"),
    NotCertRegistered("M906", "국세청 홈텍스에 등록된 인증서가 아닙니다. 국세청 홈텍스에 등록된 인증서를 사용해주세요.", "Unregistered Certificates"),
    AddressNotMatCh("M907", "주소검색 결과가 일치하지 않습니다.", "Address does not match"),
    HealthPaymentNotUser("M908", "등록된 사업자등록번호와 인증서를 확인해주세요.", "User information does not exist"),
    HealthPaymentUnidentified("M909", "관리자에게 문의해 주세요.", "Health Payment Unidentified Error"),
    DemandAccountCertError("M910", "당행에서 발급받거나 당행에 등록된 인증서를 사용해 주세요.(정산계좌)", "Demand Account Cert Error"),
    MainAccountCertError("M911", "당행에서 발급받거나 당행에 등록된 인증서를 사용해 주세요.(주거래계좌)", "Main Account Cert Error"),
    UnidentifiedError("M912", "관리자에게 문의해 주세요.", "Unidentified Error"),
    CertLoginError("M913", "인증서 정보가 올바르지 않습니다. 인증서 정보를 확인하여 주시기 바랍니다.", "Cert Login Error"),
    CompanyNameInconsistent("M914", "회원 가입시 등록한 회사명과 공인인증서 조회 결과가 일치하지 않습니다. 변경후 다시 시도해주세요", "Company name and public certificate inquiry result are inconsistent");

    private String code;
    private String description;
    private String message;
}
