"""Shared API v1 response schemas."""

from pydantic import BaseModel


class DomainStatus(BaseModel):
    domain: str
    mode: str
    source_tables: list[str]
    next_action: str
