var nxDownloadUrl = "https://www.infotech.co.kr/ExAdapter_Web_Setup_20220105.exe";
var menu = 'setupCheck';

function fnNxDownload(url) { // url : 파일 경로
    if(!$('#ifrFile').length) $("body").append($("<iframe/>",{id:"ifrFile",style:"display:none;"}));
    $('#ifrFile').attr('src', url ? url : nxDownloadUrl);
}

function fnNxSetupCheck(){
    $.ajax({
        type: "POST",
        url: "https://127.0.0.1:16566/?op=setup",
        data: {},
        dataType: "json",
        contentType: "application/json; charset=UTF-8",
        crossDomain: true,
        crossOrigin: true,
        success: function(data) {
        },
        error: function(xhr, status, error) {
            fnNxDownload("https://www.infotech.co.kr/ExAdapter_Web_Setup_20220105.exe");
        }
    });
}

function popup(){
    $.ajax({
        type: "POST",
        url: 'https://127.0.0.1:16566/?op=certList',
        data: {},
        dataType: "json",
        contentType: "application/json; charset=UTF-8",
        crossDomain: true,
        crossOrigin: true,
        success: function(data) {
        	layer_popup("#layer2");
            document.querySelector('#pop_table_tbody').innerHTML = '';
            data.list.forEach(function(item) {

                var tr = document.createElement("tr")
                tr.setAttribute("onclick", "selectNode(this)")
                tr.setAttribute("class", "cert_cont")
                
                var td = document.createElement("td")
                td.setAttribute("class", "td1")
                var gubun = "";
                gubun = distingCert(item.oid);

                if(gubun !== '개인'){
                	return false;
                }
                
                td.innerText = gubun 
                tr.appendChild(td);
                
                td = document.createElement("td")
                // td.setAttribute("style", "width:230px;text-overflow:ellipsis;")
                td.setAttribute("class", "td2")
                td.innerText = item.certName
                tr.appendChild(td);

                // 만료일
                td = document.createElement("td")
                td.setAttribute("class", "td3")
                td.innerText = item.toDt
                tr.appendChild(td);

                //발급자
                td = document.createElement("td")
                td.setAttribute("class", "td4")
                td.innerText = item.pub
                tr.appendChild(td);
                
                //위치
                td = document.createElement("td")
                td.setAttribute("class", "td5")
                td.innerText = item.drive
                tr.appendChild(td);

                //Path (숨김처리)
                td = document.createElement("td")
                td.setAttribute("style", "display:none")
                td.innerText = item.path;
                tr.appendChild(td);

                document.getElementById("pop_table_tbody").appendChild(tr);       
            })
        },
        error: function(xhr, status, error) {
       		modalInfo('프로그램 설치가 필요합니다.');
            fnNxSetupCheck()
        }
    });
    
    function layer_popup(el){
        var $el = $(el);        //레이어의 id를 $el 변수에 저장
        $('.dim-layer').fadeIn("fast");

        var $elWidth = ~~($el.outerWidth()),
            $elHeight = ~~($el.outerHeight()),
            docWidth = $(document).width(),
            docHeight = $(document).height();

        // 화면의 중앙에 레이어를 띄운다.
        if ($elHeight < docHeight || $elWidth < docWidth) {
            $el.css({
                marginTop: -$elHeight /2,
                marginLeft: -$elWidth/2
            })
        } else {
            $el.css({top: 0, left: 0});
        }
    }
}

function getCertResult(){
	let signPw = $('#certSignPw').val();
    $.ajax({
        type: "POST",
        url: 'https://127.0.0.1:16566/?op=execute',
        data: JSON.stringify(selectedCert),
        dataType: "json",
        contentType: "application/json; charset=UTF-8",
        crossDomain: true,
        crossOrigin: true,
        success: function(data) {
            requestAccept(data.DER2PEM, data.KEY2PEM, signPw);
        },
        error: function(xhr, status, error) {
        }
    });
}

var selectedCert = new Object();
var s_gubun = "";
var s_certName = "";
var s_toDt = "";
var s_pub = "";
var s_path = "";
var s_drive = "";
var signCert = "";
var signPri = "";

function selectNode(el){
    $("#pop_table_tbody tr").css("border", "solid 1px #dfdfdf");
    $("#pop_table_tbody tr").css("background-color", "#dfdfdf");
    $(el).css("border", "solid 1px #E9493C");
    $(el).css("background-color", "#EE776D");
    s_gubun = el.children[0].innerText;
    s_certName = el.children[1].innerText;
    s_toDt = el.children[2].innerText;
    s_pub = el.children[3].innerText;
    s_drive = el.children[4].innerText;
    s_path = el.children[5].innerText;

    selectedCert.orgCd = "common";
    selectedCert.svcCd = "getCertInfo";
    selectedCert.appCd = "InfotechApiDemo";
    selectedCert.signCert = s_path + "\\signCert.der";
    selectedCert.signPri = s_path + "\\signPri.key";
}

function distingCert(oid){
   var divNm = "기타";
   var perArr = ['1.2.410.200005.1.1.1'        
                ,'1.2.410.200004.5.1.1.5'     
                ,'1.2.410.200004.5.2.1.2'    
                ,'1.2.410.200004.5.4.1.1'    
                ,'1.2.410.200012.1.1.1'      
                ,'1.2.410.200005.1.1.4'      
                ,'1.2.410.200012.1.1.101'    
                ,'1.2.410.200004.5.2.1.7.1'  
                ,'1.2.410.200004.5.4.1.101'  
                ,'1.2.410.200004.5.1.1.9.2'  
                ,'1.2.410.200004.5.2.1.7.3'  
                ,'1.2.410.200004.5.4.1.103'  
                ,'1.2.410.200012.1.1.105'    
                ,'1.2.410.200012.1.1.103'    
                ,'1.2.410.200004.5.1.1.9'    
                ,'1.2.410.200004.5.2.1.7.1'  
                ,'1.2.410.200004.5.4.1.101'  
                ,'1.2.410.200012.1.1.101'    
                ,'1.2.410.200004.5.1.1.9'    
                ,'1.2.410.200004.5.2.1.7.2'  
                ,'1.2.410.200004.5.4.1.102'  
                ,'1.2.410.200012.1.1.103'    
                ,'1.2.410.200004.5.4.1.104'  
                ,'1.2.410.200004.5.5.1.3.1'  
                ,'1.2.410.200004.5.5.1.4.1'  
                ,'1.2.410.200004.5.5.1.4.2'];
   var bizArr = ['1.2.410.200005.1.1.5'        
                ,'1.2.410.200004.5.1.1.7'      
                ,'1.2.410.200004.5.2.1.1'      
                ,'1.2.410.200004.5.4.1.2'      
                ,'1.2.410.200012.1.1.3'        
                ,'1.2.410.200005.1.1.2'        
                ,'1.2.410.200005.1.1.6.1'      
                ,'1.2.410.200004.5.1.1.12.908' 
                ,'1.2.410.200004.5.2.1.5001'   
                ,'1.2.410.200004.5.2.1.6.257'  
                ,'1.2.410.200005.1.1.6.8'      
                ,'1.2.410.200005.1.1.6.3'      
                ,'1.2.410.200005.1.1.6.5'      
                ,'1.2.410.200005.1.1.6.4'      
                ,'1.2.410.200005.1.1.7.1'      
                ,'1.2.410.200004.5.5.1.2']; 
   
   if($.inArray(oid , perArr) != -1){
                 divNm = "개인";
   }else if($.inArray(oid , bizArr) != -1){
                 divNm = "법인";
   }

   return divNm;
}

$(function () {
    $("input[id=certSignPw]").keydown(function(key){
        if(key.keyCode == 13){ // 레이어 창에서 Enter 키 입력시
            selectedCert.signPw = $('#certSignPw').val();
            if (selectedCert.signCert === undefined ||selectedCert.signCert === null){
                modalInfo("인증서를 선택해주세요");
                return false;
            } else if(selectedCert.signPw === undefined || selectedCert.signPw === null || selectedCert.signPw === ''){
                modalInfo("인증서 비밀번호를 입력해주세요")
                return false;
            } else {                        
                getCertResult();
                initCertTbody();
                return false;
            }
        }
    });
	
    $('button#certCancel, .certCancel').click(function(){
        initCertTbody()
		return false;
    });

    $('button#certConfirm').click(function(){
        selectedCert.signPw = $('#certSignPw').val();
        if (selectedCert.signCert === undefined ||selectedCert.signCert === null){
            modalInfo("인증서를 선택해주세요");
            return false;
        } else if(selectedCert.signPw === undefined || selectedCert.signPw === null || selectedCert.signPw === ''){
            modalInfo("인증서 비밀번호를 입력해주세요")
            return false;
        } else {                        
            getCertResult();
            initCertTbody();
            return false;
        }
    });
})

function initCertTbody(){
	$("#pop_table_tbody").empty();
    $('#certSignPw').val('');
    $('.dim-layer').fadeOut("fast");
    var emptyObj = new Object();
    selectedCert = emptyObj;
}