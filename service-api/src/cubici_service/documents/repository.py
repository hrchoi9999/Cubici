"""Contract document file metadata and storage."""

from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.core.config import get_settings
from cubici_service.db.connection import get_connection


ALLOWED_DOCUMENT_TYPES = {"CBInfo", "regNo", "demand", "main"}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "hwp", "pdf"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024


class DocumentFileItem(BaseModel):
    uuid: str
    file_division: str
    file_division_pk: str
    origin_file_name: str
    store_file_name: str
    file_ext: str
    file_size: int
    file_path: str
    enc_type: str
    input_date: str | None

    @property
    def file_name(self) -> str:
        return f"{self.origin_file_name}.{self.file_ext}"


class DocumentFileListResponse(BaseModel):
    mbid: str
    total: int
    items: list[DocumentFileItem]


class DocumentFileUploadResponse(BaseModel):
    mbid: str
    item: DocumentFileItem


class DocumentFileDownload(BaseModel):
    path: Path
    file_name: str


class DocumentConfirmRequest(BaseModel):
    confirmed_by: str


class DocumentConfirmResponse(BaseModel):
    mbid: str
    sub_complete: str
    final_confirm_admin: str
    document_file_count: int


BitFlag = Literal["0", "1"]


class DocumentCheckUpdateRequest(BaseModel):
    updated_by: str
    cb_score_current: int | None = None
    cb_score_rank: int | None = None
    cb_score_past: int | None = None
    debt_status: BitFlag | None = None
    financial_disorder_status: BitFlag | None = None
    public_information_status: BitFlag | None = None
    overdue_status: BitFlag | None = None
    national_tax_full_payment: BitFlag | None = None
    local_tax_full_payment: BitFlag | None = None
    health_insurance_full_payment: BitFlag | None = None
    health_insurance_paid_amount: int | None = None


class DocumentCheckUpdateResponse(BaseModel):
    mbid: str
    cb_check: str
    cb_confirm_admin: str
    national_tax_full_payment: str | None
    local_tax_full_payment: str | None
    health_insurance_full_payment: str | None
    health_insurance_paid_amount: int | None


def list_contract_document_files(mbid: str) -> DocumentFileListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    uuid,
                    file_division,
                    file_division_pk,
                    origin_file_name,
                    store_file_name,
                    file_ext,
                    file_size::bigint as file_size,
                    file_path,
                    enc_type,
                    input_date::text as input_date
                from "CBCI_FILE"
                where file_division_pk = %s
                order by input_date desc nulls last, uuid
                """,
                (mbid,),
            )
            rows = cursor.fetchall()

    items = [DocumentFileItem(**row) for row in rows]
    return DocumentFileListResponse(mbid=mbid, total=len(items), items=items)


def save_contract_document_file(
    mbid: str,
    document_type: str,
    upload_file: UploadFile,
    uploaded_by: str | None,
) -> DocumentFileUploadResponse:
    _ensure_contract_exists(mbid)

    if document_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail="unsupported document type")

    original_name = Path(upload_file.filename or "").name
    if "." not in original_name:
        raise HTTPException(status_code=400, detail="file extension is required")

    origin_file_name = Path(original_name).stem
    file_ext = Path(original_name).suffix.removeprefix(".").lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="unsupported file extension")

    file_id = str(uuid4())
    store_file_name = f"{file_id}_{original_name}"
    storage_dir = _document_storage_root() / mbid / document_type
    storage_dir.mkdir(parents=True, exist_ok=True)
    storage_path = (storage_dir / store_file_name).resolve()
    _ensure_inside_storage(storage_path)

    size = 0
    with storage_path.open("wb") as output:
        while chunk := upload_file.file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_FILE_SIZE_BYTES:
                output.close()
                storage_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="file size exceeds 5MB")
            output.write(chunk)

    if size == 0:
        storage_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="empty file is not allowed")

    item = _insert_file_metadata(
        uuid=file_id,
        document_type=document_type,
        mbid=mbid,
        origin_file_name=origin_file_name,
        store_file_name=store_file_name,
        file_ext=file_ext,
        file_size=size,
        file_path=str(storage_path),
        uploaded_by=uploaded_by,
    )
    return DocumentFileUploadResponse(mbid=mbid, item=item)


def get_contract_document_file_download(mbid: str, uuid: str) -> DocumentFileDownload:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    file_path,
                    concat(origin_file_name, '.', file_ext) as file_name
                from "CBCI_FILE"
                where uuid = %s
                  and file_division_pk = %s
                """,
                (uuid, mbid),
            )
            row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="file metadata not found")

    path = Path(row["file_path"]).resolve()
    _ensure_inside_storage(path)
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="file content not found")

    return DocumentFileDownload(path=path, file_name=row["file_name"])


def confirm_contract_documents(mbid: str, confirmed_by: str) -> DocumentConfirmResponse:
    _ensure_contract_exists(mbid)
    document_file_count = _count_contract_document_files(mbid)
    if document_file_count < 1:
        raise HTTPException(status_code=400, detail="document file is required before confirmation")

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into moneybank_contract_document (
                    mbid,
                    final_confirm_admin,
                    reg_date,
                    modified_date
                ) values (
                    %s, %s, now(), now()
                )
                on conflict (mbid) do update set
                    final_confirm_admin = excluded.final_confirm_admin,
                    modified_date = now()
                returning mbid, final_confirm_admin
                """,
                (mbid, confirmed_by),
            )
            row = cursor.fetchone()

    return DocumentConfirmResponse(
        mbid=row["mbid"].strip() if hasattr(row["mbid"], "strip") else row["mbid"],
        sub_complete="Y",
        final_confirm_admin=row["final_confirm_admin"],
        document_file_count=document_file_count,
    )


def update_contract_document_checks(
    mbid: str,
    payload: DocumentCheckUpdateRequest,
) -> DocumentCheckUpdateResponse:
    _ensure_contract_exists(mbid)

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into moneybank_contract_document (
                    mbid,
                    cb_score_current,
                    cb_score_rank,
                    cb_score_past,
                    debt_status,
                    financial_disorder_status,
                    public_information_status,
                    overdue_status,
                    cb_check,
                    national_tax_full_payment,
                    local_tax_full_payment,
                    health_insurance_full_payment,
                    health_insurance_paid_amount,
                    cb_confirm_admin,
                    reg_date,
                    modified_date
                ) values (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s::bit(1),
                    %s::bit(1),
                    %s::bit(1),
                    %s::bit(1),
                    B'1',
                    %s::bit(1),
                    %s::bit(1),
                    %s::bit(1),
                    %s,
                    %s,
                    now(),
                    now()
                )
                on conflict (mbid) do update set
                    cb_score_current = excluded.cb_score_current,
                    cb_score_rank = excluded.cb_score_rank,
                    cb_score_past = excluded.cb_score_past,
                    debt_status = excluded.debt_status,
                    financial_disorder_status = excluded.financial_disorder_status,
                    public_information_status = excluded.public_information_status,
                    overdue_status = excluded.overdue_status,
                    cb_check = B'1',
                    national_tax_full_payment = excluded.national_tax_full_payment,
                    local_tax_full_payment = excluded.local_tax_full_payment,
                    health_insurance_full_payment = excluded.health_insurance_full_payment,
                    health_insurance_paid_amount = excluded.health_insurance_paid_amount,
                    cb_confirm_admin = excluded.cb_confirm_admin,
                    modified_date = now()
                returning
                    mbid,
                    cb_check::text as cb_check,
                    cb_confirm_admin,
                    national_tax_full_payment::text as national_tax_full_payment,
                    local_tax_full_payment::text as local_tax_full_payment,
                    health_insurance_full_payment::text as health_insurance_full_payment,
                    health_insurance_paid_amount
                """,
                (
                    mbid,
                    payload.cb_score_current,
                    payload.cb_score_rank,
                    payload.cb_score_past,
                    payload.debt_status,
                    payload.financial_disorder_status,
                    payload.public_information_status,
                    payload.overdue_status,
                    payload.national_tax_full_payment,
                    payload.local_tax_full_payment,
                    payload.health_insurance_full_payment,
                    payload.health_insurance_paid_amount,
                    payload.updated_by,
                ),
            )
            row = cursor.fetchone()

    return DocumentCheckUpdateResponse(
        mbid=row["mbid"].strip() if hasattr(row["mbid"], "strip") else row["mbid"],
        cb_check=row["cb_check"],
        cb_confirm_admin=row["cb_confirm_admin"],
        national_tax_full_payment=row["national_tax_full_payment"],
        local_tax_full_payment=row["local_tax_full_payment"],
        health_insurance_full_payment=row["health_insurance_full_payment"],
        health_insurance_paid_amount=row["health_insurance_paid_amount"],
    )


def _insert_file_metadata(
    *,
    uuid: str,
    document_type: str,
    mbid: str,
    origin_file_name: str,
    store_file_name: str,
    file_ext: str,
    file_size: int,
    file_path: str,
    uploaded_by: str | None,
) -> DocumentFileItem:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into "CBCI_FILE" (
                    uuid,
                    file_division,
                    file_division_pk,
                    origin_file_name,
                    store_file_name,
                    file_ext,
                    file_size,
                    file_path,
                    enc_type,
                    input_date
                ) values (
                    %s, %s, %s, %s, %s, %s, %s, %s, 'N', now()
                )
                returning
                    uuid,
                    file_division,
                    file_division_pk,
                    origin_file_name,
                    store_file_name,
                    file_ext,
                    file_size::bigint as file_size,
                    file_path,
                    enc_type,
                    input_date::text as input_date
                """,
                (
                    uuid,
                    document_type,
                    mbid,
                    origin_file_name,
                    store_file_name,
                    file_ext,
                    str(file_size),
                    file_path,
                ),
            )
            row = cursor.fetchone()

    return DocumentFileItem(**row)


def _count_contract_document_files(mbid: str) -> int:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                'select count(*) from "CBCI_FILE" where file_division_pk = %s',
                (mbid,),
            )
            return int(cursor.fetchone()[0])


def _ensure_contract_exists(mbid: str) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "select exists(select 1 from moneybank_contract where mbid = %s)",
                (mbid,),
            )
            exists = cursor.fetchone()[0]

    if not exists:
        raise HTTPException(status_code=404, detail="contract not found")


def _document_storage_root() -> Path:
    settings = get_settings()
    root = Path(settings.document_storage_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def _ensure_inside_storage(path: Path) -> None:
    root = _document_storage_root()
    try:
        path.resolve().relative_to(root)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="file path is outside storage") from exc
