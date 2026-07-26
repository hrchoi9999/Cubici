"""Contract document file API."""

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import FileResponse

from cubici_service.documents.repository import (
    DocumentConfirmRequest,
    DocumentConfirmResponse,
    DocumentCheckUpdateRequest,
    DocumentCheckUpdateResponse,
    DocumentFileListResponse,
    DocumentFileUploadResponse,
    confirm_contract_documents,
    get_contract_document_file_download,
    list_contract_document_files,
    save_contract_document_file,
    update_contract_document_checks,
)

router = APIRouter(prefix="/contracts/{mbid}/documents", tags=["documents"])


@router.get("/files", response_model=DocumentFileListResponse)
def contract_document_files(mbid: str) -> DocumentFileListResponse:
    return list_contract_document_files(mbid)


@router.post("/files", response_model=DocumentFileUploadResponse)
def upload_contract_document_file(
    mbid: str,
    document_type: str = Form(...),
    uploaded_by: str | None = Form(default=None),
    file: UploadFile = File(...),
) -> DocumentFileUploadResponse:
    return save_contract_document_file(
        mbid=mbid,
        document_type=document_type,
        upload_file=file,
        uploaded_by=uploaded_by,
    )


@router.get("/files/{uuid}/download")
def download_contract_document_file(mbid: str, uuid: str) -> FileResponse:
    download = get_contract_document_file_download(mbid, uuid)
    return FileResponse(
        path=download.path,
        filename=download.file_name,
        media_type="application/octet-stream",
    )


@router.post("/confirm", response_model=DocumentConfirmResponse)
def confirm_contract_document_status(
    mbid: str,
    payload: DocumentConfirmRequest,
) -> DocumentConfirmResponse:
    return confirm_contract_documents(mbid=mbid, confirmed_by=payload.confirmed_by)


@router.put("/checks", response_model=DocumentCheckUpdateResponse)
def update_contract_document_check_values(
    mbid: str,
    payload: DocumentCheckUpdateRequest,
) -> DocumentCheckUpdateResponse:
    return update_contract_document_checks(mbid=mbid, payload=payload)
