"""Account queries and local user authentication."""

import base64
from datetime import datetime
import hashlib
import hmac
import json
import secrets
import time

from fastapi import HTTPException
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

from cubici_service.core.config import get_settings
from cubici_service.core.shop_types import normalize_shop_type
from cubici_service.db.connection import get_connection


AUTH_AUDIENCE_USER = "user"
AUTH_AUDIENCE_ADMIN = "admin"


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


class AccountAuthUser(BaseModel):
    user_no: int
    email: str
    user_type: str | None
    name: str | None
    phone: str | None
    biz_num: str | None
    biz_name: str | None
    biz_setup_date: str | None = None
    biz_type: str | None = None
    sectors: str | None = None
    partner_code: str | None = None
    last_login_date: datetime | None = None


class AccountSignupRequest(BaseModel):
    email: str = Field(min_length=5, max_length=50)
    password: str = Field(min_length=8, max_length=72)
    name: str = Field(min_length=1, max_length=50)
    phone: str | None = Field(default=None, max_length=20)
    biz_num: str = Field(min_length=10, max_length=20)
    biz_name: str = Field(min_length=1, max_length=50)
    biz_setup_date: str | None = Field(default=None, max_length=8)
    biz_type: str = Field(default="GENERAL", min_length=1, max_length=20)
    sectors: str = Field(default="OTHER", min_length=1, max_length=30)
    partner_code: str | None = Field(default=None, max_length=10)


class AccountLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=50)
    password: str = Field(min_length=1, max_length=72)


class AccountAuthResponse(BaseModel):
    token_type: str = "Bearer"
    access_token: str
    expires_in: int
    user: AccountAuthUser


class AccountCompanyUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    phone: str | None = Field(default=None, max_length=20)
    biz_num: str = Field(min_length=10, max_length=20)
    biz_name: str = Field(min_length=1, max_length=50)
    biz_setup_date: str | None = Field(default=None, max_length=8)
    biz_type: str = Field(default="GENERAL", min_length=1, max_length=20)
    sectors: str = Field(default="OTHER", min_length=1, max_length=30)
    partner_code: str | None = Field(default=None, max_length=10)


class AccountCompanyUpdateResponse(BaseModel):
    updated: bool
    user: AccountAuthUser


class AccountDashboardActivityItem(BaseModel):
    occurred_at: datetime
    operation_type: str
    amount: int
    outstanding_balance: int | None


class AccountDashboardSummaryResponse(BaseModel):
    sales_total_amount: int
    settlement_total_amount: int
    current_sales_amount: int = 0
    current_order_count: int = 0
    current_settlement_amount: int = 0
    current_product_count: int = 0
    previous_sales_amount: int = 0
    previous_order_count: int = 0
    previous_settlement_amount: int = 0
    previous_product_count: int = 0
    moneybank_available_balance: int
    total_principal_amount: int
    total_repayment_amount: int
    activities: list[AccountDashboardActivityItem]


class ShopAccountItem(BaseModel):
    id: int
    user_no: int | None
    shop_type: str | None
    shop_id: str | None
    shop_account_id: str | None
    vendor_id: str | None
    settlement: str | None
    status: str | None
    del_yn: str | None
    reg_date: datetime | None
    modified_date: datetime | None


class ShopAccountListResponse(BaseModel):
    total: int
    items: list[ShopAccountItem]


class ShopAccountCreateRequest(BaseModel):
    shop_type: str = Field(min_length=1, max_length=50)
    shop_id: str = Field(min_length=1, max_length=50)
    shop_account_id: str | None = Field(default=None, max_length=50)
    shop_account_password: str | None = Field(default=None, max_length=100)
    vendor_id: str | None = Field(default=None, max_length=20)
    api_key: str | None = Field(default=None, max_length=100)
    api_secret_key: str | None = Field(default=None, max_length=100)
    settlement: str | None = Field(default=None, max_length=100)


class ShopAccountCreateResponse(BaseModel):
    created: bool
    item: ShopAccountItem


class ShopAccountUpdateRequest(BaseModel):
    shop_type: str | None = Field(default=None, min_length=1, max_length=50)
    shop_id: str | None = Field(default=None, min_length=1, max_length=50)
    shop_account_id: str | None = Field(default=None, max_length=50)
    shop_account_password: str | None = Field(default=None, max_length=100)
    vendor_id: str | None = Field(default=None, max_length=20)
    api_key: str | None = Field(default=None, max_length=100)
    api_secret_key: str | None = Field(default=None, max_length=100)
    settlement: str | None = Field(default=None, max_length=100)
    status: str | None = Field(default=None, min_length=1, max_length=1)


class ShopAccountWriteResponse(BaseModel):
    action: str
    item: ShopAccountItem


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


def signup_user(payload: AccountSignupRequest) -> AccountAuthResponse:
    email = _normalize_email(payload.email)
    biz_num = _normalize_biz_num(payload.biz_num)
    if len(biz_num) != 10:
        raise HTTPException(status_code=422, detail="business number must be 10 digits")

    with get_connection() as connection:
        with connection.transaction():
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(
                    "select user_no from users where lower(email) = %s limit 1",
                    (email,),
                )
                if cursor.fetchone() is not None:
                    raise HTTPException(status_code=409, detail="email already exists")

                cursor.execute("lock table users in share row exclusive mode")
                cursor.execute("select coalesce(max(user_no), 0) + 1 as next_user_no from users")
                user_no = cursor.fetchone()["next_user_no"]

                cursor.execute(
                    """
                    insert into users (
                        user_no,
                        email,
                        password,
                        user_type,
                        name,
                        phone,
                        biz_num,
                        biz_name,
                        biz_setup_date,
                        biz_type,
                        sectors,
                        partner_code,
                        reg_date,
                        modified_date
                    ) values (
                        %s, %s, %s, 'USER', %s, %s, %s, %s, %s, %s, %s, %s, now(), now()
                    )
                    returning
                        user_no,
                        email,
                        user_type,
                        name,
                        phone,
                        biz_num,
                        biz_name,
                        biz_setup_date,
                        biz_type,
                        sectors,
                        partner_code,
                        last_login_date
                    """,
                    (
                        user_no,
                        email,
                        _hash_password(payload.password),
                        payload.name.strip(),
                        _clean_optional(payload.phone),
                        biz_num,
                        payload.biz_name.strip(),
                        _normalize_date(payload.biz_setup_date),
                        payload.biz_type.strip().upper(),
                        payload.sectors.strip().upper(),
                        _clean_optional(payload.partner_code),
                    ),
                )
                user = AccountAuthUser(**cursor.fetchone())

    return _build_auth_response(user)


def update_company_for_user(user_no: int, payload: AccountCompanyUpdateRequest) -> AccountCompanyUpdateResponse:
    biz_num = _normalize_biz_num(payload.biz_num)
    if len(biz_num) != 10:
        raise HTTPException(status_code=422, detail="business number must be 10 digits")

    with get_connection() as connection:
        with connection.transaction():
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(
                    """
                    update users
                    set
                        name = %s,
                        phone = %s,
                        biz_num = %s,
                        biz_name = %s,
                        biz_setup_date = %s,
                        biz_type = %s,
                        sectors = %s,
                        partner_code = %s,
                        modified_date = now()
                    where user_no = %s
                    returning
                        user_no,
                        email,
                        user_type,
                        name,
                        phone,
                        biz_num,
                        biz_name,
                        biz_setup_date,
                        biz_type,
                        sectors,
                        partner_code,
                        last_login_date
                    """,
                    (
                        payload.name.strip(),
                        _clean_optional(payload.phone),
                        biz_num,
                        payload.biz_name.strip(),
                        _normalize_date(payload.biz_setup_date),
                        payload.biz_type.strip().upper(),
                        payload.sectors.strip().upper(),
                        _clean_optional(payload.partner_code),
                        user_no,
                    ),
                )
                row = cursor.fetchone()
                if row is None:
                    raise HTTPException(status_code=404, detail="user not found")

    return AccountCompanyUpdateResponse(updated=True, user=AccountAuthUser(**row))


def login_user(payload: AccountLoginRequest) -> AccountAuthResponse:
    return _login_account(payload, audience=AUTH_AUDIENCE_USER)


def login_admin(payload: AccountLoginRequest) -> AccountAuthResponse:
    return _login_account(payload, audience=AUTH_AUDIENCE_ADMIN)


def _login_account(payload: AccountLoginRequest, *, audience: str) -> AccountAuthResponse:
    email = _normalize_email(payload.email)
    with get_connection() as connection:
        with connection.transaction():
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(
                    """
                    select
                        user_no,
                        email,
                        password,
                        user_type,
                        name,
                        phone,
                        biz_num,
                        biz_name,
                        biz_setup_date,
                        biz_type,
                        sectors,
                        partner_code,
                        last_login_date
                    from users
                    where lower(email) = %s
                    limit 1
                    """,
                    (email,),
                )
                row = cursor.fetchone()
                if row is None or not _verify_password(payload.password, row["password"]):
                    raise HTTPException(status_code=401, detail="invalid email or password")

                user_type = (row["user_type"] or "").strip().upper()
                if audience == AUTH_AUDIENCE_USER and user_type != "USER":
                    raise HTTPException(status_code=403, detail="user service account required")
                if audience == AUTH_AUDIENCE_ADMIN:
                    master_email = get_settings().master_admin_email.strip().lower()
                    if user_type != "ADMIN_USER" or email != master_email:
                        raise HTTPException(status_code=403, detail="master admin account required")

                cursor.execute(
                    """
                    update users
                    set last_login_date = now(), modified_date = now()
                    where user_no = %s
                    returning
                        user_no,
                        email,
                        user_type,
                        name,
                        phone,
                        biz_num,
                        biz_name,
                        biz_setup_date,
                        biz_type,
                        sectors,
                        partner_code,
                        last_login_date
                    """,
                    (row["user_no"],),
                )
                user = AccountAuthUser(**cursor.fetchone())

    return _build_auth_response(user, audience=audience)


def get_authenticated_user(token: str) -> AccountAuthUser:
    payload = _decode_token(token)
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    user_no,
                    email,
                    user_type,
                    name,
                    phone,
                    biz_num,
                    biz_name,
                    biz_setup_date,
                    biz_type,
                    sectors,
                    partner_code,
                    last_login_date
                from users
                where user_no = %s
                """,
                (payload["user_no"],),
            )
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(status_code=401, detail="invalid token user")
    user = AccountAuthUser(**row)
    if payload.get("aud") != _auth_audience_for_user(user):
        raise HTTPException(status_code=401, detail="invalid token audience")
    return user


def list_shop_accounts_for_user(user_no: int) -> ShopAccountListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    id,
                    user_no,
                    shop_type,
                    shop_id,
                    shop_account_id,
                    vendor_id,
                    settlement,
                    status,
                    del_yn,
                    reg_date,
                    modified_date
                from shop_accounts
                where user_no = %s
                  and coalesce(del_yn, 'N') <> 'Y'
                order by modified_date desc nulls last, reg_date desc nulls last, id desc
                """,
                (user_no,),
            )
            rows = cursor.fetchall()
    return ShopAccountListResponse(
        total=len(rows),
        items=[ShopAccountItem(**row) for row in rows],
    )


def get_dashboard_summary_for_user(user_no: int) -> AccountDashboardSummaryResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    coalesce((
                        select sum(coalesce(s.sales_amount, 0))
                        from sale s
                        where exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(s.shop_type)
                              and sa.shop_id = s.shop_id
                        )
                    ), 0)::bigint as sales_total_amount,
                    coalesce((
                        select sum(coalesce(st.settlement_amount, 0))
                        from settlement st
                        where exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(st.shop_type)
                              and sa.shop_id = st.shop_id
                        )
                    ), 0)::bigint as settlement_total_amount,
                    coalesce((
                        select sum(coalesce(s.payment_amount, 0))
                        from sale s
                        where s.paid_date::date >= date_trunc('month', current_date)::date
                          and s.paid_date::date <= current_date
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(s.shop_type)
                              and sa.shop_id = s.shop_id
                        )
                    ), 0)::bigint as current_sales_amount,
                    coalesce((
                        select count(distinct coalesce(s.order_no, s.sales_id::text))
                        from sale s
                        where s.paid_date::date >= date_trunc('month', current_date)::date
                          and s.paid_date::date <= current_date
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(s.shop_type)
                              and sa.shop_id = s.shop_id
                        )
                    ), 0)::bigint as current_order_count,
                    coalesce((
                        select sum(coalesce(st.settlement_amount, 0))
                        from settlement st
                        where st.settlement_date::date >= date_trunc('month', current_date)::date
                          and st.settlement_date::date <= current_date
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(st.shop_type)
                              and sa.shop_id = st.shop_id
                        )
                    ), 0)::bigint as current_settlement_amount,
                    coalesce((
                        select count(distinct coalesce(s.product_no, s.product_name, s.sales_id::text))
                        from sale s
                        where s.paid_date::date >= date_trunc('month', current_date)::date
                          and s.paid_date::date <= current_date
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(s.shop_type)
                              and sa.shop_id = s.shop_id
                        )
                    ), 0)::bigint as current_product_count,
                    coalesce((
                        select sum(coalesce(s.payment_amount, 0))
                        from sale s
                        where s.paid_date::date >= date_trunc('month', current_date - interval '1 month')::date
                          and s.paid_date::date <= least(
                            (date_trunc('month', current_date) - interval '1 day')::date,
                            (date_trunc('month', current_date - interval '1 month') + (extract(day from current_date)::int - 1) * interval '1 day')::date
                          )
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(s.shop_type)
                              and sa.shop_id = s.shop_id
                        )
                    ), 0)::bigint as previous_sales_amount,
                    coalesce((
                        select count(distinct coalesce(s.order_no, s.sales_id::text))
                        from sale s
                        where s.paid_date::date >= date_trunc('month', current_date - interval '1 month')::date
                          and s.paid_date::date <= least(
                            (date_trunc('month', current_date) - interval '1 day')::date,
                            (date_trunc('month', current_date - interval '1 month') + (extract(day from current_date)::int - 1) * interval '1 day')::date
                          )
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(s.shop_type)
                              and sa.shop_id = s.shop_id
                        )
                    ), 0)::bigint as previous_order_count,
                    coalesce((
                        select sum(coalesce(st.settlement_amount, 0))
                        from settlement st
                        where st.settlement_date::date >= date_trunc('month', current_date - interval '1 month')::date
                          and st.settlement_date::date <= least(
                            (date_trunc('month', current_date) - interval '1 day')::date,
                            (date_trunc('month', current_date - interval '1 month') + (extract(day from current_date)::int - 1) * interval '1 day')::date
                          )
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(st.shop_type)
                              and sa.shop_id = st.shop_id
                        )
                    ), 0)::bigint as previous_settlement_amount,
                    coalesce((
                        select count(distinct coalesce(s.product_no, s.product_name, s.sales_id::text))
                        from sale s
                        where s.paid_date::date >= date_trunc('month', current_date - interval '1 month')::date
                          and s.paid_date::date <= least(
                            (date_trunc('month', current_date) - interval '1 day')::date,
                            (date_trunc('month', current_date - interval '1 month') + (extract(day from current_date)::int - 1) * interval '1 day')::date
                          )
                          and exists (
                            select 1
                            from shop_accounts sa
                            where sa.user_no = %s
                              and coalesce(sa.del_yn, 'N') <> 'Y'
                              and upper(sa.shop_type) = upper(s.shop_type)
                              and sa.shop_id = s.shop_id
                        )
                    ), 0)::bigint as previous_product_count,
                    coalesce((
                        select sum(coalesce(p.total_provision_amount, 0))
                        from moneybank_redemption_provision p
                        join moneybank_contract c on c.mbid = p.mbid
                        where c.user_no = %s
                    ), 0)::bigint as total_principal_amount,
                    coalesce((
                        select sum(coalesce(r.repayment_amount, 0))
                        from moneybank_redemption_repayment r
                        join moneybank_contract c on c.mbid = r.mbid
                        where c.user_no = %s
                    ), 0)::bigint as total_repayment_amount,
                    coalesce((
                        select sum(coalesce(latest.outstanding_balance, 0))
                        from moneybank_contract c
                        left join lateral (
                            select h.outstanding_balance
                            from moneybank_redemption_history h
                            where h.mbid = c.mbid
                            order by h.reg_date desc nulls last, h.id desc
                            limit 1
                        ) latest on true
                        where c.user_no = %s
                    ), 0)::bigint as moneybank_available_balance
                """,
                (
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                    user_no,
                ),
            )
            summary = cursor.fetchone()

            cursor.execute(
                """
                with user_contracts as (
                    select mbid
                    from moneybank_contract
                    where user_no = %s
                ), events as (
                    select
                        p.mbid,
                        coalesce(p.provision_date, p.reg_date) as occurred_at,
                        p.reg_date as recorded_at,
                        'PROVISION'::varchar as operation_type,
                        coalesce(p.total_provision_amount, 0)::bigint as amount
                    from moneybank_redemption_provision p
                    join user_contracts c on c.mbid = p.mbid
                    union all
                    select
                        r.mbid,
                        coalesce(r.balance_provision_date, r.reg_date) as occurred_at,
                        r.reg_date as recorded_at,
                        'REPAYMENT'::varchar as operation_type,
                        coalesce(r.repayment_amount, 0)::bigint as amount
                    from moneybank_redemption_repayment r
                    join user_contracts c on c.mbid = r.mbid
                )
                select
                    e.occurred_at,
                    e.operation_type,
                    e.amount,
                    balance.outstanding_balance
                from events e
                left join lateral (
                    select h.outstanding_balance
                    from moneybank_redemption_history h
                    where h.mbid = e.mbid
                    order by
                        abs(extract(epoch from (h.reg_date - e.recorded_at))) asc,
                        h.id desc
                    limit 1
                ) balance on true
                where e.occurred_at is not null
                order by e.occurred_at desc, e.recorded_at desc nulls last
                limit 5
                """,
                (user_no,),
            )
            activities = cursor.fetchall()

    return AccountDashboardSummaryResponse(
        **summary,
        activities=[AccountDashboardActivityItem(**row) for row in activities],
    )


def create_shop_account_for_user(user_no: int, payload: ShopAccountCreateRequest) -> ShopAccountCreateResponse:
    shop_type = _normalize_shop_type(payload.shop_type)
    shop_id = payload.shop_id.strip()
    with get_connection() as connection:
        with connection.transaction():
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(
                    """
                    select id
                    from shop_accounts
                    where user_no = %s
                      and upper(shop_type) = %s
                      and shop_id = %s
                      and coalesce(del_yn, 'N') <> 'Y'
                    limit 1
                    """,
                    (user_no, shop_type, shop_id),
                )
                if cursor.fetchone() is not None:
                    raise HTTPException(status_code=409, detail="shop account already exists")

                cursor.execute("lock table shop_accounts in share row exclusive mode")
                cursor.execute("select coalesce(max(id), 0) + 1 as next_id from shop_accounts")
                next_id = cursor.fetchone()["next_id"]
                cursor.execute(
                    """
                    insert into shop_accounts (
                        id,
                        user_no,
                        shop_type,
                        shop_id,
                        shop_account_id,
                        shop_account_password,
                        vendor_id,
                        api_key,
                        api_secret_key,
                        settlement,
                        status,
                        del_yn,
                        reg_date,
                        modified_date
                    ) values (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Y', 'N', now(), now()
                    )
                    returning
                        id,
                        user_no,
                        shop_type,
                        shop_id,
                        shop_account_id,
                        vendor_id,
                        settlement,
                        status,
                        del_yn,
                        reg_date,
                        modified_date
                    """,
                    (
                        next_id,
                        user_no,
                        shop_type,
                        shop_id,
                        _clean_optional(payload.shop_account_id),
                        _clean_optional(payload.shop_account_password),
                        _clean_optional(payload.vendor_id),
                        _clean_optional(payload.api_key),
                        _clean_optional(payload.api_secret_key) or "NOT_PROVIDED",
                        _clean_optional(payload.settlement),
                    ),
                )
                item = ShopAccountItem(**cursor.fetchone())
    return ShopAccountCreateResponse(created=True, item=item)


def update_shop_account_for_user(
    user_no: int,
    account_id: int,
    payload: ShopAccountUpdateRequest,
) -> ShopAccountWriteResponse:
    changes = _shop_account_update_changes(payload)
    if not changes:
        raise HTTPException(status_code=422, detail="no shop account fields to update")

    with get_connection() as connection:
        with connection.transaction():
            with connection.cursor(row_factory=dict_row) as cursor:
                current = _get_active_shop_account(cursor, user_no, account_id)
                next_shop_type = changes.get("shop_type", current["shop_type"])
                next_shop_id = changes.get("shop_id", current["shop_id"])
                if next_shop_type and next_shop_id:
                    _ensure_shop_account_not_duplicated(
                        cursor,
                        user_no=user_no,
                        shop_type=next_shop_type,
                        shop_id=next_shop_id,
                        exclude_id=account_id,
                    )

                assignments = [f"{column} = %s" for column in changes]
                values = list(changes.values())
                values.extend([user_no, account_id])
                cursor.execute(
                    f"""
                    update shop_accounts
                    set {", ".join(assignments)}, modified_date = now()
                    where user_no = %s
                      and id = %s
                      and coalesce(del_yn, 'N') <> 'Y'
                    returning
                        id,
                        user_no,
                        shop_type,
                        shop_id,
                        shop_account_id,
                        vendor_id,
                        settlement,
                        status,
                        del_yn,
                        reg_date,
                        modified_date
                    """,
                    values,
                )
                row = cursor.fetchone()
                if row is None:
                    raise HTTPException(status_code=404, detail="shop account not found")

    return ShopAccountWriteResponse(action="updated", item=ShopAccountItem(**row))


def delete_shop_account_for_user(user_no: int, account_id: int) -> ShopAccountWriteResponse:
    with get_connection() as connection:
        with connection.transaction():
            with connection.cursor(row_factory=dict_row) as cursor:
                _get_active_shop_account(cursor, user_no, account_id)
                cursor.execute(
                    """
                    update shop_accounts
                    set del_yn = 'Y', status = 'N', modified_date = now()
                    where user_no = %s
                      and id = %s
                    returning
                        id,
                        user_no,
                        shop_type,
                        shop_id,
                        shop_account_id,
                        vendor_id,
                        settlement,
                        status,
                        del_yn,
                        reg_date,
                        modified_date
                    """,
                    (user_no, account_id),
                )
                row = cursor.fetchone()
                if row is None:
                    raise HTTPException(status_code=404, detail="shop account not found")

    return ShopAccountWriteResponse(action="deleted", item=ShopAccountItem(**row))


def _build_auth_response(user: AccountAuthUser, *, audience: str | None = None) -> AccountAuthResponse:
    expires_in = 60 * 60 * 8
    resolved_audience = audience or _auth_audience_for_user(user)
    if resolved_audience is None:
        raise HTTPException(status_code=403, detail="unsupported account service")
    token = _encode_token(
        {
            "user_no": user.user_no,
            "email": user.email,
            "aud": resolved_audience,
            "exp": int(time.time()) + expires_in,
        }
    )
    return AccountAuthResponse(access_token=token, expires_in=expires_in, user=user)


def _auth_audience_for_user(user: AccountAuthUser) -> str | None:
    user_type = (user.user_type or "").strip().upper()
    if user_type == "USER":
        return AUTH_AUDIENCE_USER
    if user_type == "ADMIN_USER":
        master_email = get_settings().master_admin_email.strip().lower()
        if user.email.strip().lower() == master_email:
            return AUTH_AUDIENCE_ADMIN
    return None


def _hash_password(password: str) -> str:
    iterations = 120_000
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations,
        _b64_encode(salt),
        _b64_encode(digest),
    )


def _verify_password(password: str, stored_password: str | None) -> bool:
    if not stored_password:
        return False
    parts = stored_password.split("$")
    if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
        return False
    try:
        iterations = int(parts[1])
        salt = _b64_decode(parts[2])
        expected = _b64_decode(parts[3])
    except (ValueError, TypeError):
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(digest, expected)


def _encode_token(payload: dict) -> str:
    payload_b64 = _b64_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = _token_signature(payload_b64)
    return f"{payload_b64}.{signature}"


def _decode_token(token: str) -> dict:
    try:
        payload_b64, signature = token.split(".", 1)
    except ValueError:
        raise HTTPException(status_code=401, detail="invalid token") from None
    if not hmac.compare_digest(signature, _token_signature(payload_b64)):
        raise HTTPException(status_code=401, detail="invalid token signature")
    try:
        payload = json.loads(_b64_decode(payload_b64))
    except (ValueError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="invalid token payload") from None
    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=401, detail="token expired")
    if "user_no" not in payload:
        raise HTTPException(status_code=401, detail="invalid token payload")
    return payload


def _token_signature(payload_b64: str) -> str:
    secret = get_settings().auth_secret.get_secret_value().encode("utf-8")
    return _b64_encode(hmac.new(secret, payload_b64.encode("utf-8"), hashlib.sha256).digest())


def _b64_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _normalize_email(value: str) -> str:
    cleaned = value.strip().lower()
    if "@" not in cleaned:
        raise HTTPException(status_code=422, detail="email format is invalid")
    return cleaned


def _normalize_shop_type(value: str) -> str:
    return normalize_shop_type(value)


def _normalize_biz_num(value: str) -> str:
    return "".join(ch for ch in value if ch.isdigit())


def _normalize_date(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = "".join(ch for ch in value if ch.isdigit())
    return cleaned[:8] if cleaned else None


def _clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _normalize_status(value: str | None) -> str | None:
    if value is None:
        return None
    status = value.strip().upper()
    if status not in {"Y", "N"}:
        raise HTTPException(status_code=422, detail="status must be Y or N")
    return status


def _shop_account_update_changes(payload: ShopAccountUpdateRequest) -> dict[str, str | None]:
    changes: dict[str, str | None] = {}
    fields_set = payload.model_fields_set
    if "shop_type" in fields_set and payload.shop_type is not None:
        changes["shop_type"] = _normalize_shop_type(payload.shop_type)
    if "shop_id" in fields_set and payload.shop_id is not None:
        changes["shop_id"] = payload.shop_id.strip()
    if "shop_account_id" in fields_set:
        changes["shop_account_id"] = _clean_optional(payload.shop_account_id)
    if "shop_account_password" in fields_set and _clean_optional(payload.shop_account_password) is not None:
        changes["shop_account_password"] = _clean_optional(payload.shop_account_password)
    if "vendor_id" in fields_set:
        changes["vendor_id"] = _clean_optional(payload.vendor_id)
    if "api_key" in fields_set:
        changes["api_key"] = _clean_optional(payload.api_key)
    if "api_secret_key" in fields_set and _clean_optional(payload.api_secret_key) is not None:
        changes["api_secret_key"] = _clean_optional(payload.api_secret_key)
    if "settlement" in fields_set:
        changes["settlement"] = _clean_optional(payload.settlement)
    if "status" in fields_set:
        changes["status"] = _normalize_status(payload.status)
    return changes


def _get_active_shop_account(cursor, user_no: int, account_id: int) -> dict:
    cursor.execute(
        """
        select id, user_no, shop_type, shop_id
        from shop_accounts
        where user_no = %s
          and id = %s
          and coalesce(del_yn, 'N') <> 'Y'
        limit 1
        """,
        (user_no, account_id),
    )
    row = cursor.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="shop account not found")
    return row


def _ensure_shop_account_not_duplicated(
    cursor,
    *,
    user_no: int,
    shop_type: str,
    shop_id: str,
    exclude_id: int | None = None,
) -> None:
    params: list[object] = [user_no, shop_type, shop_id]
    exclude_clause = ""
    if exclude_id is not None:
        exclude_clause = "and id <> %s"
        params.append(exclude_id)
    cursor.execute(
        f"""
        select id
        from shop_accounts
        where user_no = %s
          and upper(shop_type) = %s
          and shop_id = %s
          and coalesce(del_yn, 'N') <> 'Y'
          {exclude_clause}
        limit 1
        """,
        params,
    )
    if cursor.fetchone() is not None:
        raise HTTPException(status_code=409, detail="shop account already exists")
