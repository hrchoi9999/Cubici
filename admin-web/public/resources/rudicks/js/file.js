function fileList(file_division, file_division_pk, callBack){
	let objParam = {
			file_division : file_division,
			file_division_pk : file_division_pk
		}
	let callBackFunc = callBack;
	let callUrl = "/file/list";
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function fileVaildator(files){
	const reg = /(.*?)\.(jpg|jpeg|png|hwp|pdf)$/;

	for(const file of files){
		if(parseInt(file.size) > 5242880){
			modalInfo("5MB 이하의 파일만 업로드 가능합니다.");
			return false;
		}
		if(!reg.test((file.name).toLowerCase())){
			modalInfo("지정된 확장자만 업로드가 가능합니다.");
			return false;
		}
	}
	return true;
}

function byteWord(className){
	let bwordHtml =  '총 ' + byteSize(filesize) + '(' + fileCount + '개) / 2GB';
	$(className).html(bwordHtml);
}