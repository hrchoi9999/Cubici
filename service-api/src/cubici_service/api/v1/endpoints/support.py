"""Customer support API."""

from fastapi import APIRouter, HTTPException, Query

from cubici_service.support.repository import (
    BoardKind,
    BoardOrderBy,
    BoardPostItem,
    BoardPostListResponse,
    BoardPostUpsertRequest,
    BoardPostWriteResponse,
    InquiryDetailResponse,
    InquiryListResponse,
    InquiryOrderBy,
    InquiryReplyUpsertRequest,
    InquiryReplyWriteResponse,
    InquiryUpsertRequest,
    InquiryWriteResponse,
    MessageTemplateItem,
    MessageTemplateKey,
    MessageTemplateListResponse,
    MessageTemplateOrderBy,
    MessageTemplateUpsertRequest,
    MessageTemplateWriteResponse,
    create_board_post,
    create_inquiry,
    create_inquiry_reply,
    create_message_template,
    delete_board_post,
    delete_inquiry,
    delete_message_template,
    get_board_post,
    get_inquiry_detail,
    get_message_template,
    list_board_posts,
    list_inquiries,
    list_message_templates,
    update_board_post,
    update_inquiry,
    update_inquiry_reply,
    update_message_template,
)

router = APIRouter(prefix="/support", tags=["support"])


@router.get("/inquiries", response_model=InquiryListResponse)
def inquiry_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    keyword: str | None = Query(default=None, max_length=100),
    inquiry_type: str | None = Query(default=None, max_length=20),
    answer_status: str | None = Query(default=None, pattern="^(answered|waiting)$"),
    user_no: int | None = Query(default=None, ge=1),
    order_by: InquiryOrderBy = Query(default="reg_date_desc", pattern="^reg_date_(asc|desc)$"),
) -> InquiryListResponse:
    return list_inquiries(
        limit=limit,
        offset=offset,
        keyword=keyword,
        inquiry_type=inquiry_type,
        answer_status=answer_status,
        user_no=user_no,
        order_by=order_by,
    )


@router.post("/inquiries", response_model=InquiryWriteResponse)
def inquiry_create(payload: InquiryUpsertRequest) -> InquiryWriteResponse:
    return create_inquiry(payload)


@router.get("/inquiries/{qna_id}", response_model=InquiryDetailResponse)
def inquiry_detail(
    qna_id: int,
    user_no: int | None = Query(default=None, ge=1),
) -> InquiryDetailResponse:
    detail = get_inquiry_detail(qna_id, user_no=user_no)
    if detail is None:
        raise HTTPException(status_code=404, detail="inquiry not found")
    return detail


@router.put("/inquiries/{qna_id}", response_model=InquiryWriteResponse)
def inquiry_update(qna_id: int, payload: InquiryUpsertRequest) -> InquiryWriteResponse:
    return update_inquiry(qna_id=qna_id, payload=payload)


@router.delete("/inquiries/{qna_id}", response_model=InquiryWriteResponse)
def inquiry_delete(
    qna_id: int,
    user_no: int = Query(ge=1),
) -> InquiryWriteResponse:
    return delete_inquiry(qna_id=qna_id, user_no=user_no)


@router.post("/inquiries/{qna_id}/replies", response_model=InquiryReplyWriteResponse)
def inquiry_reply_create(
    qna_id: int,
    payload: InquiryReplyUpsertRequest,
) -> InquiryReplyWriteResponse:
    return create_inquiry_reply(qna_id=qna_id, payload=payload)


@router.put("/inquiries/{qna_id}/replies/{reply_id}", response_model=InquiryReplyWriteResponse)
def inquiry_reply_update(
    qna_id: int,
    reply_id: int,
    payload: InquiryReplyUpsertRequest,
) -> InquiryReplyWriteResponse:
    return update_inquiry_reply(qna_id=qna_id, reply_id=reply_id, payload=payload)


@router.get("/message-templates", response_model=MessageTemplateListResponse)
def message_template_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    msg_key: MessageTemplateKey | None = Query(default=None),
    keyword: str | None = Query(default=None, max_length=100),
    order_by: MessageTemplateOrderBy = Query(default="reg_date_desc", pattern="^(reg_date_(asc|desc)|menu_asc)$"),
) -> MessageTemplateListResponse:
    return list_message_templates(
        limit=limit,
        offset=offset,
        msg_key=msg_key,
        keyword=keyword,
        order_by=order_by,
    )


@router.get("/message-templates/{message_no}", response_model=MessageTemplateItem)
def message_template_detail(message_no: int) -> MessageTemplateItem:
    template = get_message_template(message_no)
    if template is None:
        raise HTTPException(status_code=404, detail="message template not found")
    return template


@router.post("/message-templates", response_model=MessageTemplateWriteResponse)
def message_template_create(payload: MessageTemplateUpsertRequest) -> MessageTemplateWriteResponse:
    return create_message_template(payload)


@router.put("/message-templates/{message_no}", response_model=MessageTemplateWriteResponse)
def message_template_update(
    message_no: int,
    payload: MessageTemplateUpsertRequest,
) -> MessageTemplateWriteResponse:
    return update_message_template(message_no=message_no, payload=payload)


@router.delete("/message-templates/{message_no}", response_model=MessageTemplateWriteResponse)
def message_template_delete(message_no: int) -> MessageTemplateWriteResponse:
    return delete_message_template(message_no)


@router.get("/boards/{board_kind}", response_model=BoardPostListResponse)
def board_post_list(
    board_kind: BoardKind,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    keyword: str | None = Query(default=None, max_length=100),
    post_type: str | None = Query(default=None, max_length=30),
    order_by: BoardOrderBy = Query(default="reg_date_desc", pattern="^reg_date_(asc|desc)$"),
) -> BoardPostListResponse:
    return list_board_posts(
        board_kind=board_kind,
        limit=limit,
        offset=offset,
        keyword=keyword,
        post_type=post_type,
        order_by=order_by,
    )


@router.get("/boards/{board_kind}/{post_id}", response_model=BoardPostItem)
def board_post_detail(board_kind: BoardKind, post_id: int) -> BoardPostItem:
    post = get_board_post(board_kind=board_kind, post_id=post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="board post not found")
    return post


@router.post("/boards/{board_kind}", response_model=BoardPostWriteResponse)
def board_post_create(
    board_kind: BoardKind,
    payload: BoardPostUpsertRequest,
) -> BoardPostWriteResponse:
    return create_board_post(board_kind=board_kind, payload=payload)


@router.put("/boards/{board_kind}/{post_id}", response_model=BoardPostWriteResponse)
def board_post_update(
    board_kind: BoardKind,
    post_id: int,
    payload: BoardPostUpsertRequest,
) -> BoardPostWriteResponse:
    return update_board_post(board_kind=board_kind, post_id=post_id, payload=payload)


@router.delete("/boards/{board_kind}/{post_id}", response_model=BoardPostWriteResponse)
def board_post_delete(board_kind: BoardKind, post_id: int) -> BoardPostWriteResponse:
    return delete_board_post(board_kind=board_kind, post_id=post_id)
