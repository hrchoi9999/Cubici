"""Customer inquiry queries."""

from datetime import datetime
from typing import Literal

from psycopg.rows import dict_row
from fastapi import HTTPException
from pydantic import BaseModel, Field

from cubici_service.db.connection import get_connection


InquiryOrderBy = Literal["reg_date_desc", "reg_date_asc"]


class InquiryListItem(BaseModel):
    qna_id: int
    user_no: int
    type: str
    type_label: str
    title: str
    content: str
    visibility: str
    visibility_label: str
    created_by: str | None
    reg_date: datetime | None
    modified_date: datetime | None
    reply_count: int
    latest_reply_date: datetime | None
    answer_status: str
    follow_up_status_label: str = "답변 필요"
    notification_status_label: str = "알림 미연동"
    workflow_status_label: str = "운영 확인"


class InquiryListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    answered_count: int
    waiting_count: int
    notification_pending_count: int = 0
    workflow_status_label: str = "운영 확인"
    items: list[InquiryListItem]


class InquiryReplyItem(BaseModel):
    reply_id: int
    user_no: int
    content: str
    created_by: str | None
    last_modified_by: str | None
    reg_date: datetime | None
    modified_date: datetime | None


class InquiryDetailResponse(BaseModel):
    inquiry: InquiryListItem
    replies: list[InquiryReplyItem]


class InquiryUpsertRequest(BaseModel):
    user_no: int = Field(ge=1)
    type: str = Field(default="CUBICI", min_length=1, max_length=20)
    title: str = Field(min_length=1, max_length=50)
    content: str = Field(min_length=1, max_length=20000)
    visibility: Literal["public", "private"] = "private"
    operated_by: str = Field(min_length=1, max_length=50)


class InquiryWriteResponse(BaseModel):
    action: Literal["created", "updated", "deleted"]
    qna_id: int
    detail: InquiryDetailResponse | None = None


class InquiryReplyUpsertRequest(BaseModel):
    content: str = Field(min_length=1, max_length=20000)
    user_no: int = Field(default=99, ge=1)
    operated_by: str = Field(min_length=1, max_length=50)


class InquiryReplyWriteResponse(BaseModel):
    qna_id: int
    reply_id: int
    action: Literal["created", "updated"]
    detail: InquiryDetailResponse


MessageTemplateKey = Literal["00", "01"]
MessageTemplateOrderBy = Literal["reg_date_desc", "reg_date_asc", "menu_asc"]
BoardKind = Literal["notice", "faq"]
BoardOrderBy = Literal["reg_date_desc", "reg_date_asc"]


class MessageTemplateItem(BaseModel):
    message_no: int
    msg_key: str
    msg_key_label: str
    msg_code: str
    msg_menu: str
    msg_menu_label: str
    msg_division: str
    msg_division_label: str
    msg_item: str
    msg_title: str | None
    msg_content: str
    reg_user: str
    reg_date: datetime
    external_send_status_label: str = "실발송 미연동"
    variable_policy_status_label: str = "변수정책 확인"
    workflow_status_label: str = "템플릿 CRUD"


class MessageTemplateListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    sms_count: int
    email_count: int
    external_send_status_label: str = "실발송 미연동"
    variable_policy_status_label: str = "변수정책 확인"
    items: list[MessageTemplateItem]


class MessageTemplateUpsertRequest(BaseModel):
    msg_key: MessageTemplateKey
    msg_code: str = Field(min_length=2, max_length=2, pattern="^[0-9]{2}$")
    msg_menu: str = Field(min_length=1, max_length=10)
    msg_division: str = Field(min_length=1, max_length=10)
    msg_item: str = Field(min_length=1, max_length=30)
    msg_title: str | None = Field(default=None, max_length=50)
    msg_content: str = Field(min_length=1, max_length=50000)
    reg_user: str = Field(min_length=1, max_length=50)


class MessageTemplateWriteResponse(BaseModel):
    action: Literal["created", "updated", "deleted"]
    message_no: int
    template: MessageTemplateItem | None = None


class BoardPostItem(BaseModel):
    post_id: int
    board_kind: BoardKind
    user_id: int
    type: str
    type_label: str
    title: str
    content: str
    created_by: str | None
    last_modified_by: str | None
    reg_date: datetime | None
    modified_date: datetime | None
    exposure_status_label: str = "상시노출"
    attachment_status_label: str = "첨부 미연동"
    policy_status_label: str = "노출정책 확인"


class BoardPostListResponse(BaseModel):
    board_kind: BoardKind
    limit: int
    offset: int
    total: int
    attachment_status_label: str = "첨부 미연동"
    exposure_policy_status_label: str = "노출정책 확인"
    items: list[BoardPostItem]


class BoardPostUpsertRequest(BaseModel):
    type: str = Field(min_length=1, max_length=30)
    title: str = Field(min_length=1, max_length=50)
    content: str = Field(min_length=1, max_length=50000)
    user_id: int = Field(default=2, ge=1)
    operated_by: str = Field(min_length=1, max_length=50)


class BoardPostWriteResponse(BaseModel):
    action: Literal["created", "updated", "deleted"]
    board_kind: BoardKind
    post_id: int
    post: BoardPostItem | None = None


def list_inquiries(
    limit: int,
    offset: int,
    *,
    keyword: str | None = None,
    inquiry_type: str | None = None,
    answer_status: str | None = None,
    user_no: int | None = None,
    order_by: InquiryOrderBy = "reg_date_desc",
) -> InquiryListResponse:
    where_clause, filter_params = _build_inquiry_filters(
        keyword=keyword,
        inquiry_type=inquiry_type,
        answer_status=answer_status,
        user_no=user_no,
    )
    order_clause = "reg_date asc nulls last, qna_id asc" if order_by == "reg_date_asc" else "reg_date desc nulls last, qna_id desc"

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            query = _inquiry_base_query()
            cursor.execute(
                f"""
                with inquiry_base as (
                    {query}
                )
                select
                    count(*)::int as total,
                    count(*) filter (where reply_count > 0)::int as answered_count,
                    count(*) filter (where reply_count = 0)::int as waiting_count
                from inquiry_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with inquiry_base as (
                    {query}
                )
                select *
                from inquiry_base
                {where_clause}
                order by {order_clause}
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return InquiryListResponse(
        limit=limit,
        offset=offset,
        total=counts["total"],
        answered_count=counts["answered_count"],
        waiting_count=counts["waiting_count"],
        notification_pending_count=counts["waiting_count"],
        workflow_status_label="답변필요" if counts["waiting_count"] else "정상",
        items=[InquiryListItem(**row) for row in rows],
    )


def create_inquiry(payload: InquiryUpsertRequest) -> InquiryWriteResponse:
    visibility_value = "1" if payload.visibility == "public" else "0"
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            qna_id = _next_id(cursor, "qna", "qna_id")
            cursor.execute(
                """
                insert into qna (
                    qna_id,
                    user_no,
                    type,
                    title,
                    content,
                    visibility,
                    created_by,
                    last_modified_by,
                    reg_date,
                    modified_date
                )
                values (%s, %s, %s, %s, %s, %s::bit, %s, %s, now(), now())
                """,
                (
                    qna_id,
                    payload.user_no,
                    payload.type,
                    payload.title,
                    payload.content,
                    visibility_value,
                    payload.operated_by,
                    payload.operated_by,
                ),
            )

    detail = get_inquiry_detail(qna_id, user_no=payload.user_no)
    if detail is None:  # pragma: no cover - inserted above
        raise HTTPException(status_code=404, detail="inquiry not found")
    return InquiryWriteResponse(action="created", qna_id=qna_id, detail=detail)


def update_inquiry(qna_id: int, payload: InquiryUpsertRequest) -> InquiryWriteResponse:
    visibility_value = "1" if payload.visibility == "public" else "0"
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_inquiry_editable(cursor, qna_id=qna_id, user_no=payload.user_no)
            cursor.execute(
                """
                update qna
                set
                    type = %s,
                    title = %s,
                    content = %s,
                    visibility = %s::bit,
                    last_modified_by = %s,
                    modified_date = now()
                where qna_id = %s
                  and user_no = %s
                returning qna_id
                """,
                (
                    payload.type,
                    payload.title,
                    payload.content,
                    visibility_value,
                    payload.operated_by,
                    qna_id,
                    payload.user_no,
                ),
            )
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="inquiry not found")

    detail = get_inquiry_detail(qna_id, user_no=payload.user_no)
    if detail is None:  # pragma: no cover - guarded by update result
        raise HTTPException(status_code=404, detail="inquiry not found")
    return InquiryWriteResponse(action="updated", qna_id=qna_id, detail=detail)


def delete_inquiry(qna_id: int, *, user_no: int) -> InquiryWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_inquiry_editable(cursor, qna_id=qna_id, user_no=user_no)
            cursor.execute(
                """
                delete from qna
                where qna_id = %s
                  and user_no = %s
                returning qna_id
                """,
                (qna_id, user_no),
            )
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="inquiry not found")

    return InquiryWriteResponse(action="deleted", qna_id=qna_id)


def get_inquiry_detail(qna_id: int, *, user_no: int | None = None) -> InquiryDetailResponse | None:
    user_clause = "and user_no = %s" if user_no is not None else ""
    params: tuple[object, ...] = (qna_id, user_no) if user_no is not None else (qna_id,)
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with inquiry_base as (
                    {_inquiry_base_query()}
                )
                select *
                from inquiry_base
                where qna_id = %s
                  {user_clause}
                """,
                params,
            )
            inquiry = cursor.fetchone()
            if inquiry is None:
                return None

            cursor.execute(
                """
                select
                    reply_id,
                    user_no,
                    content,
                    created_by,
                    last_modified_by,
                    reg_date,
                    modified_date
                from qna_reply
                where qna_id = %s
                order by reg_date asc nulls last, reply_id asc
                """,
                (qna_id,),
            )
            replies = cursor.fetchall()

    return InquiryDetailResponse(
        inquiry=InquiryListItem(**inquiry),
        replies=[InquiryReplyItem(**row) for row in replies],
    )


def create_inquiry_reply(qna_id: int, payload: InquiryReplyUpsertRequest) -> InquiryReplyWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_inquiry_exists(cursor, qna_id)
            reply_id = _next_id(cursor, "qna_reply", "reply_id")
            cursor.execute(
                """
                insert into qna_reply (
                    reply_id,
                    user_no,
                    content,
                    qna_id,
                    created_by,
                    last_modified_by,
                    reg_date,
                    modified_date
                )
                values (%s, %s, %s, %s, %s, %s, now(), now())
                """,
                (
                    reply_id,
                    payload.user_no,
                    payload.content,
                    qna_id,
                    payload.operated_by,
                    payload.operated_by,
                ),
            )

    detail = get_inquiry_detail(qna_id)
    if detail is None:  # pragma: no cover - guarded by _ensure_inquiry_exists
        raise HTTPException(status_code=404, detail="inquiry not found")
    return InquiryReplyWriteResponse(qna_id=qna_id, reply_id=reply_id, action="created", detail=detail)


def update_inquiry_reply(
    qna_id: int,
    reply_id: int,
    payload: InquiryReplyUpsertRequest,
) -> InquiryReplyWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_inquiry_exists(cursor, qna_id)
            cursor.execute(
                """
                update qna_reply
                set
                    content = %s,
                    user_no = %s,
                    last_modified_by = %s,
                    modified_date = now()
                where qna_id = %s
                  and reply_id = %s
                returning reply_id
                """,
                (
                    payload.content,
                    payload.user_no,
                    payload.operated_by,
                    qna_id,
                    reply_id,
                ),
            )
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="reply not found")

    detail = get_inquiry_detail(qna_id)
    if detail is None:  # pragma: no cover - guarded by _ensure_inquiry_exists
        raise HTTPException(status_code=404, detail="inquiry not found")
    return InquiryReplyWriteResponse(qna_id=qna_id, reply_id=reply_id, action="updated", detail=detail)


def list_message_templates(
    limit: int,
    offset: int,
    *,
    msg_key: MessageTemplateKey | None = None,
    keyword: str | None = None,
    order_by: MessageTemplateOrderBy = "reg_date_desc",
) -> MessageTemplateListResponse:
    where_clause, filter_params = _build_message_template_filters(
        msg_key=msg_key,
        keyword=keyword,
    )
    if order_by == "reg_date_asc":
        order_clause = "reg_date asc, message_no asc"
    elif order_by == "menu_asc":
        order_clause = "msg_menu asc, msg_division asc, msg_code asc, message_no asc"
    else:
        order_clause = "reg_date desc, message_no desc"

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            query = _message_template_base_query()
            cursor.execute(
                f"""
                with template_base as (
                    {query}
                )
                select
                    count(*)::int as total,
                    count(*) filter (where msg_key = '00')::int as sms_count,
                    count(*) filter (where msg_key = '01')::int as email_count
                from template_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with template_base as (
                    {query}
                )
                select *
                from template_base
                {where_clause}
                order by {order_clause}
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return MessageTemplateListResponse(
        limit=limit,
        offset=offset,
        total=counts["total"],
        sms_count=counts["sms_count"],
        email_count=counts["email_count"],
        items=[MessageTemplateItem(**row) for row in rows],
    )


def get_message_template(message_no: int) -> MessageTemplateItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with template_base as (
                    {_message_template_base_query()}
                )
                select *
                from template_base
                where message_no = %s
                """,
                (message_no,),
            )
            row = cursor.fetchone()

    return MessageTemplateItem(**row) if row else None


def create_message_template(payload: MessageTemplateUpsertRequest) -> MessageTemplateWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_unique_message_code(cursor, msg_key=payload.msg_key, msg_code=payload.msg_code)
            message_no = _next_id(cursor, "message_template", "message_no")
            cursor.execute(
                """
                insert into message_template (
                    message_no,
                    msg_key,
                    msg_code,
                    msg_menu,
                    msg_division,
                    msg_item,
                    msg_title,
                    msg_content,
                    reg_user,
                    reg_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                """,
                (
                    message_no,
                    payload.msg_key,
                    payload.msg_code,
                    payload.msg_menu,
                    payload.msg_division,
                    payload.msg_item,
                    payload.msg_title,
                    payload.msg_content,
                    payload.reg_user,
                ),
            )

    template = get_message_template(message_no)
    return MessageTemplateWriteResponse(action="created", message_no=message_no, template=template)


def update_message_template(
    message_no: int,
    payload: MessageTemplateUpsertRequest,
) -> MessageTemplateWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_message_exists(cursor, message_no)
            _ensure_unique_message_code(
                cursor,
                msg_key=payload.msg_key,
                msg_code=payload.msg_code,
                exclude_message_no=message_no,
            )
            cursor.execute(
                """
                update message_template
                set
                    msg_key = %s,
                    msg_code = %s,
                    msg_menu = %s,
                    msg_division = %s,
                    msg_item = %s,
                    msg_title = %s,
                    msg_content = %s,
                    reg_user = %s
                where message_no = %s
                """,
                (
                    payload.msg_key,
                    payload.msg_code,
                    payload.msg_menu,
                    payload.msg_division,
                    payload.msg_item,
                    payload.msg_title,
                    payload.msg_content,
                    payload.reg_user,
                    message_no,
                ),
            )

    template = get_message_template(message_no)
    return MessageTemplateWriteResponse(action="updated", message_no=message_no, template=template)


def delete_message_template(message_no: int) -> MessageTemplateWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_message_exists(cursor, message_no)
            cursor.execute("delete from message_template where message_no = %s", (message_no,))

    return MessageTemplateWriteResponse(action="deleted", message_no=message_no, template=None)


def list_board_posts(
    board_kind: BoardKind,
    limit: int,
    offset: int,
    *,
    keyword: str | None = None,
    post_type: str | None = None,
    order_by: BoardOrderBy = "reg_date_desc",
) -> BoardPostListResponse:
    table_name, id_column = _board_table(board_kind)
    where_clause, params = _build_board_filters(keyword=keyword, post_type=post_type)
    order_clause = "reg_date asc nulls last, post_id asc" if order_by == "reg_date_asc" else "reg_date desc nulls last, post_id desc"

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            query = _board_base_query(board_kind=board_kind, table_name=table_name, id_column=id_column)
            cursor.execute(
                f"""
                with board_base as (
                    {query}
                )
                select count(*)::int as total
                from board_base
                {where_clause}
                """,
                params,
            )
            total = cursor.fetchone()["total"]
            cursor.execute(
                f"""
                with board_base as (
                    {query}
                )
                select *
                from board_base
                {where_clause}
                order by {order_clause}
                limit %s offset %s
                """,
                (*params, limit, offset),
            )
            rows = cursor.fetchall()

    return BoardPostListResponse(
        board_kind=board_kind,
        limit=limit,
        offset=offset,
        total=total,
        items=[BoardPostItem(**row) for row in rows],
    )


def get_board_post(board_kind: BoardKind, post_id: int) -> BoardPostItem | None:
    table_name, id_column = _board_table(board_kind)
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with board_base as (
                    {_board_base_query(board_kind=board_kind, table_name=table_name, id_column=id_column)}
                )
                select *
                from board_base
                where post_id = %s
                """,
                (post_id,),
            )
            row = cursor.fetchone()
    return BoardPostItem(**row) if row else None


def create_board_post(board_kind: BoardKind, payload: BoardPostUpsertRequest) -> BoardPostWriteResponse:
    table_name, id_column = _board_table(board_kind)
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            post_id = _next_id(cursor, table_name, id_column)
            cursor.execute(
                f"""
                insert into {table_name} (
                    {id_column},
                    user_id,
                    type,
                    title,
                    content,
                    created_by,
                    last_modified_by,
                    reg_date,
                    modified_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, now(), now())
                """,
                (
                    post_id,
                    payload.user_id,
                    payload.type,
                    payload.title,
                    payload.content,
                    payload.operated_by,
                    payload.operated_by,
                ),
            )

    post = get_board_post(board_kind, post_id)
    return BoardPostWriteResponse(action="created", board_kind=board_kind, post_id=post_id, post=post)


def update_board_post(
    board_kind: BoardKind,
    post_id: int,
    payload: BoardPostUpsertRequest,
) -> BoardPostWriteResponse:
    table_name, id_column = _board_table(board_kind)
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_board_post_exists(cursor, table_name=table_name, id_column=id_column, post_id=post_id)
            cursor.execute(
                f"""
                update {table_name}
                set
                    user_id = %s,
                    type = %s,
                    title = %s,
                    content = %s,
                    last_modified_by = %s,
                    modified_date = now()
                where {id_column} = %s
                """,
                (
                    payload.user_id,
                    payload.type,
                    payload.title,
                    payload.content,
                    payload.operated_by,
                    post_id,
                ),
            )

    post = get_board_post(board_kind, post_id)
    return BoardPostWriteResponse(action="updated", board_kind=board_kind, post_id=post_id, post=post)


def delete_board_post(board_kind: BoardKind, post_id: int) -> BoardPostWriteResponse:
    table_name, id_column = _board_table(board_kind)
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_board_post_exists(cursor, table_name=table_name, id_column=id_column, post_id=post_id)
            cursor.execute(f"delete from {table_name} where {id_column} = %s", (post_id,))

    return BoardPostWriteResponse(action="deleted", board_kind=board_kind, post_id=post_id, post=None)


def _build_inquiry_filters(
    *,
    keyword: str | None,
    inquiry_type: str | None,
    answer_status: str | None,
    user_no: int | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if keyword:
        clauses.append("(title ilike %s or content ilike %s or coalesce(created_by, '') ilike %s)")
        keyword_param = f"%{keyword}%"
        params.extend([keyword_param, keyword_param, keyword_param])
    if inquiry_type:
        clauses.append("type = %s")
        params.append(inquiry_type)
    if user_no is not None:
        clauses.append("user_no = %s")
        params.append(user_no)
    if answer_status == "answered":
        clauses.append("reply_count > 0")
    elif answer_status == "waiting":
        clauses.append("reply_count = 0")

    if not clauses:
        return "", params
    return "where " + " and ".join(clauses), params


def _ensure_inquiry_exists(cursor, qna_id: int) -> None:
    cursor.execute("select 1 from qna where qna_id = %s", (qna_id,))
    if cursor.fetchone() is None:
        raise HTTPException(status_code=404, detail="inquiry not found")


def _ensure_inquiry_editable(cursor, *, qna_id: int, user_no: int) -> None:
    cursor.execute(
        """
        select
            q.qna_id,
            count(r.reply_id)::int as reply_count
        from qna q
        left join qna_reply r on r.qna_id = q.qna_id
        where q.qna_id = %s
          and q.user_no = %s
        group by q.qna_id
        """,
        (qna_id, user_no),
    )
    row = cursor.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="inquiry not found")
    if row["reply_count"] > 0:
        raise HTTPException(status_code=409, detail="answered inquiry cannot be modified")


def _next_id(cursor, table_name: str, column_name: str) -> int:
    cursor.execute(f"select coalesce(max({column_name}), 0) + 1 as next_id from {table_name}")
    return int(cursor.fetchone()["next_id"])


def _ensure_message_exists(cursor, message_no: int) -> None:
    cursor.execute("select 1 from message_template where message_no = %s", (message_no,))
    if cursor.fetchone() is None:
        raise HTTPException(status_code=404, detail="message template not found")


def _ensure_unique_message_code(
    cursor,
    *,
    msg_key: str,
    msg_code: str,
    exclude_message_no: int | None = None,
) -> None:
    params: list[object] = [msg_key, msg_code]
    exclude_clause = ""
    if exclude_message_no is not None:
        exclude_clause = "and message_no <> %s"
        params.append(exclude_message_no)

    cursor.execute(
        f"""
        select 1
        from message_template
        where msg_key = %s
          and msg_code = %s
          {exclude_clause}
        """,
        params,
    )
    if cursor.fetchone() is not None:
        raise HTTPException(status_code=409, detail="msg_code already exists for msg_key")


def _ensure_board_post_exists(cursor, *, table_name: str, id_column: str, post_id: int) -> None:
    cursor.execute(f"select 1 from {table_name} where {id_column} = %s", (post_id,))
    if cursor.fetchone() is None:
        raise HTTPException(status_code=404, detail="board post not found")


def _inquiry_base_query() -> str:
    return """
        select
            q.qna_id,
            q.user_no,
            q.type,
            case
                when q.type = 'CUBICI' then '큐빅아이'
                when q.type = 'MONEYBANK' then '머니뱅크'
                else q.type
            end as type_label,
            q.title,
            q.content,
            q.visibility::text as visibility,
            case
                when q.visibility::text in ('1', 'Y', 'y', 'true') then '공개'
                else '비공개'
            end as visibility_label,
            q.created_by,
            q.reg_date,
            q.modified_date,
            coalesce(r.reply_count, 0)::int as reply_count,
            r.latest_reply_date,
            case when coalesce(r.reply_count, 0) > 0 then '답변완료' else '답변대기' end as answer_status,
            case when coalesce(r.reply_count, 0) > 0 then '후속완료' else '답변 필요' end as follow_up_status_label,
            '알림 미연동'::text as notification_status_label,
            case when coalesce(r.reply_count, 0) > 0 then '정상' else '운영 확인' end as workflow_status_label
        from qna q
        left join (
            select
                qna_id,
                count(*)::int as reply_count,
                max(coalesce(modified_date, reg_date)) as latest_reply_date
            from qna_reply
            group by qna_id
        ) r on r.qna_id = q.qna_id
    """


def _build_message_template_filters(
    *,
    msg_key: MessageTemplateKey | None,
    keyword: str | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if msg_key:
        clauses.append("msg_key = %s")
        params.append(msg_key)
    if keyword:
        keyword_param = f"%{keyword}%"
        clauses.append(
            """
            (
                msg_title ilike %s
                or msg_item ilike %s
                or msg_content ilike %s
                or msg_code ilike %s
            )
            """
        )
        params.extend([keyword_param, keyword_param, keyword_param, keyword_param])

    if not clauses:
        return "", params
    return "where " + " and ".join(clauses), params


def _message_template_base_query() -> str:
    return """
        select
            message_no,
            msg_key::text as msg_key,
            case when msg_key = '00' then '문자' when msg_key = '01' then '이메일' else msg_key::text end as msg_key_label,
            msg_code::text as msg_code,
            msg_menu,
            case
                when msg_menu = 'CB' then '큐빅아이'
                when msg_menu = 'MB' then '머니뱅크'
                when msg_menu = 'TH' then '기타'
                else msg_menu
            end as msg_menu_label,
            msg_division,
            case
                when msg_division = 'SU' then '회원가입'
                when msg_division = 'MP' then '머니플러스'
                when msg_division = 'ETC' then '기타'
                else msg_division
            end as msg_division_label,
            msg_item,
            msg_title,
            msg_content,
            reg_user,
            reg_date,
            '실발송 미연동'::text as external_send_status_label,
            '변수정책 확인'::text as variable_policy_status_label,
            '템플릿 CRUD'::text as workflow_status_label
        from message_template
    """


def _board_table(board_kind: BoardKind) -> tuple[str, str]:
    if board_kind == "notice":
        return "notice", "notice_id"
    return "faq", "faq_id"


def _build_board_filters(
    *,
    keyword: str | None,
    post_type: str | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if keyword:
        keyword_param = f"%{keyword}%"
        clauses.append("(title ilike %s or content ilike %s or coalesce(created_by, '') ilike %s)")
        params.extend([keyword_param, keyword_param, keyword_param])
    if post_type:
        clauses.append("type = %s")
        params.append(post_type)

    if not clauses:
        return "", params
    return "where " + " and ".join(clauses), params


def _board_base_query(*, board_kind: BoardKind, table_name: str, id_column: str) -> str:
    return f"""
        select
            {id_column} as post_id,
            '{board_kind}'::text as board_kind,
            user_id,
            type,
            case
                when type = 'CUBICI' then '큐빅아이'
                when type = 'MONEY_BANK' then '머니뱅크'
                when type = 'MONEYBANK' then '머니뱅크'
                when type = 'SERVICE_USE' then '서비스 이용'
                when type = 'OTHER' then '기타'
                else type
            end as type_label,
            title,
            content,
            created_by,
            last_modified_by,
            reg_date,
            modified_date,
            '상시노출'::text as exposure_status_label,
            '첨부 미연동'::text as attachment_status_label,
            '노출정책 확인'::text as policy_status_label
        from {table_name}
    """
