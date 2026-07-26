"""Contract review note API."""

from fastapi import APIRouter

from cubici_service.review_notes.repository import (
    ReviewNoteCreateRequest,
    ReviewNoteCreateResponse,
    ReviewNoteListResponse,
    create_review_note,
    list_review_notes,
)

router = APIRouter(prefix="/contracts/{mbid}/review-notes", tags=["review-notes"])


@router.get("", response_model=ReviewNoteListResponse)
def contract_review_notes(mbid: str) -> ReviewNoteListResponse:
    return list_review_notes(mbid)


@router.post("", response_model=ReviewNoteCreateResponse)
def add_contract_review_note(
    mbid: str,
    payload: ReviewNoteCreateRequest,
) -> ReviewNoteCreateResponse:
    return create_review_note(mbid=mbid, payload=payload)
