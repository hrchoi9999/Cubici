"""Read-only account queries."""

from datetime import datetime

from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.db.connection import get_connection


class AccountListItem(BaseModel):
    user_no: int
    user_type: str | None
    partner_code: str | None
    fintech_id: int | None
    shop_account_count: int
    last_login_date: datetime | None
    reg_date: datetime | None
    modified_date: datetime | None


class AccountListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[AccountListItem]


def list_user_accounts(limit: int, offset: int) -> AccountListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("select count(*) as total from users")
            total = cursor.fetchone()["total"]

            cursor.execute(
                """
                select
                    u.user_no,
                    u.user_type,
                    u.partner_code,
                    u.fintech_id,
                    count(sa.id)::int as shop_account_count,
                    u.last_login_date,
                    u.reg_date,
                    u.modified_date
                from users u
                left join shop_accounts sa on sa.user_no = u.user_no
                group by
                    u.user_no,
                    u.user_type,
                    u.partner_code,
                    u.fintech_id,
                    u.last_login_date,
                    u.reg_date,
                    u.modified_date
                order by u.user_no desc
                limit %s offset %s
                """,
                (limit, offset),
            )
            rows = cursor.fetchall()

    return AccountListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[AccountListItem(**row) for row in rows],
    )
