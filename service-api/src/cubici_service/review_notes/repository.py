"""Contract review note queries."""

from datetime import datetime

from fastapi import HTTPException
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

from cubici_service.db.connection import get_connection


class ReviewNoteItem(BaseModel):
    id: int
    mbid: str
    eval_subject: str
    reviewer: str
    title: str
    detail: str
    reg_date: datetime
    modified_date: datetime | None


class ReviewNoteListResponse(BaseModel):
    mbid: str
    total: int
    items: list[ReviewNoteItem]


class ReviewNoteCreateRequest(BaseModel):
    reviewer: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=100)
    detail: str = Field(min_length=1, max_length=2000)


class ReviewNoteCreateResponse(BaseModel):
    mbid: str
    item: ReviewNoteItem


def list_review_notes(mbid: str) -> ReviewNoteListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    id,
                    mbid,
                    eval_subject,
                    reviewer,
                    title,
                    detail,
                    reg_date,
                    modified_date
                from contract_review_note
                where mbid = %s
                order by reg_date desc, id desc
                """,
                (mbid,),
            )
            rows = cursor.fetchall()

    items = [ReviewNoteItem(**_normalize_note_row(row)) for row in rows]
    return ReviewNoteListResponse(mbid=mbid, total=len(items), items=items)


def create_review_note(mbid: str, payload: ReviewNoteCreateRequest) -> ReviewNoteCreateResponse:
    _ensure_contract_exists(mbid)

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into contract_review_note (
                    mbid,
                    eval_subject,
                    reviewer,
                    title,
                    detail,
                    reg_date
                ) values (
                    %s, '신청', %s, %s, %s, now()
                )
                returning
                    id,
                    mbid,
                    eval_subject,
                    reviewer,
                    title,
                    detail,
                    reg_date,
                    modified_date
                """,
                (mbid, payload.reviewer, payload.title, payload.detail),
            )
            row = cursor.fetchone()

    return ReviewNoteCreateResponse(
        mbid=mbid,
        item=ReviewNoteItem(**_normalize_note_row(row)),
    )


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


def _normalize_note_row(row: dict) -> dict:
    normalized = dict(row)
    if hasattr(normalized["mbid"], "strip"):
        normalized["mbid"] = normalized["mbid"].strip()
    return normalized
