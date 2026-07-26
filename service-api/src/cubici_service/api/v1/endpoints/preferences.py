"""Admin preference API."""

from fastapi import APIRouter, HTTPException, Query

from cubici_service.preferences.repository import (
    AdminAccountApproveRequest,
    AdminAccountIdCheckResponse,
    AdminAccountListItem,
    AdminAccountListResponse,
    AdminAccountOrderBy,
    AdminAccountRequest,
    AdminAccountStatus,
    AdminAccountUpdateRequest,
    AdminAccountWriteResponse,
    ChargeListItem,
    ChargeListResponse,
    ChargeOrderBy,
    ChargeStatus,
    ChargeWriteRequest,
    ChargeWriteResponse,
    MoneybankProductListItem,
    MoneybankProductListResponse,
    MoneybankProductOrderBy,
    MoneybankProductStatus,
    MoneybankProductWriteRequest,
    MoneybankProductWriteResponse,
    PartnerCheckResponse,
    PartnerDetailResponse,
    PartnerListResponse,
    PartnerOrderBy,
    PartnerStatus,
    PartnerWriteRequest,
    PartnerWriteResponse,
    PromotionListItem,
    PromotionListResponse,
    PromotionOptionsResponse,
    PromotionOrderBy,
    PromotionStatus,
    PromotionWriteRequest,
    PromotionWriteResponse,
    PrizmConfigDivision,
    PrizmConfigItem,
    PrizmConfigListResponse,
    PrizmConfigUpdateRecordResponse,
    PrizmConfigUpdateRequest,
    PrizmConfigUpdateResponse,
    RawDataColumnOption,
    RawDataFormulaItem,
    RawDataFormulaWriteRequest,
    RawDataFormulaWriteResponse,
    RawDataPreviewRequest,
    RawDataPreviewResponse,
    RawDataTableOption,
    admin_id_exists,
    approve_admin_account,
    create_charge,
    create_moneybank_product,
    create_partner,
    create_promotion,
    create_raw_data_formula,
    delete_admin_account,
    delete_charge,
    delete_partner,
    delete_promotion,
    delete_raw_data_formula,
    get_admin_account,
    get_charge,
    get_moneybank_product,
    get_partner,
    get_prizm_config_item,
    get_promotion,
    get_promotion_options,
    list_admin_accounts,
    list_charges,
    list_moneybank_products,
    list_partners,
    list_prizm_config_items,
    list_prizm_config_update_records,
    list_promotions,
    list_raw_data_columns,
    list_raw_data_formulas,
    list_raw_data_tables,
    partner_code_exists,
    partner_id_exists,
    request_admin_account,
    update_admin_account,
    update_charge,
    update_moneybank_product,
    update_partner,
    update_prizm_config_item,
    update_promotion,
    update_raw_data_formula,
    preview_raw_data,
)

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("/admin-accounts", response_model=AdminAccountListResponse)
def admin_account_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    admin_type: str | None = Query(default=None, max_length=2),
    admin_grade: str | None = Query(default=None, max_length=2),
    admin_name: str | None = Query(default=None, max_length=100),
    status: AdminAccountStatus = Query(default="all", pattern="^(all|pending|approved)$"),
    order_by: AdminAccountOrderBy = Query(
        default="reg_date_desc",
        pattern="^(reg_date_desc|approval_date_desc|name_asc|admin_id_asc)$",
    ),
) -> AdminAccountListResponse:
    return list_admin_accounts(
        limit=limit,
        offset=offset,
        admin_type=admin_type,
        admin_grade=admin_grade,
        admin_name=admin_name,
        status=status,
        order_by=order_by,
    )


@router.get("/admin-accounts/id-check", response_model=AdminAccountIdCheckResponse)
def admin_account_id_check(admin_id: str = Query(min_length=1, max_length=100)) -> AdminAccountIdCheckResponse:
    return admin_id_exists(admin_id)


@router.post("/admin-accounts/request", response_model=AdminAccountWriteResponse)
def admin_account_request(payload: AdminAccountRequest) -> AdminAccountWriteResponse:
    return request_admin_account(payload)


@router.get("/admin-accounts/{admin_id}", response_model=AdminAccountListItem)
def admin_account_detail(admin_id: str) -> AdminAccountListItem:
    detail = get_admin_account(admin_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="admin account not found")
    return detail


@router.post("/admin-accounts/{admin_id}/approve", response_model=AdminAccountWriteResponse)
def admin_account_approve(admin_id: str, payload: AdminAccountApproveRequest) -> AdminAccountWriteResponse:
    result = approve_admin_account(admin_id, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="admin account not found")
    return result


@router.put("/admin-accounts/{admin_id}", response_model=AdminAccountWriteResponse)
def admin_account_update(admin_id: str, payload: AdminAccountUpdateRequest) -> AdminAccountWriteResponse:
    result = update_admin_account(admin_id, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="admin account not found")
    return result


@router.delete("/admin-accounts/{admin_id}", response_model=AdminAccountWriteResponse)
def admin_account_delete(admin_id: str) -> AdminAccountWriteResponse:
    result = delete_admin_account(admin_id)
    if result is None:
        raise HTTPException(status_code=404, detail="admin account not found")
    return result


@router.get("/promotions", response_model=PromotionListResponse)
def promotion_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    promo_code: str | None = Query(default=None, max_length=255),
    status: PromotionStatus = Query(default="all", pattern="^(all|Y|N)$"),
    partner_name: str | None = Query(default=None, max_length=100),
    order_by: PromotionOrderBy = Query(
        default="start_date_desc",
        pattern="^(start_date_(asc|desc)|promo_code_asc|promo_name_asc)$",
    ),
) -> PromotionListResponse:
    return list_promotions(
        limit=limit,
        offset=offset,
        promo_code=promo_code,
        status=status,
        partner_name=partner_name,
        order_by=order_by,
    )


@router.get("/promotions/options", response_model=PromotionOptionsResponse)
def promotion_options(partner_division: str | None = Query(default=None, max_length=30)) -> PromotionOptionsResponse:
    return get_promotion_options(partner_division=partner_division)


@router.get("/promotions/{promo_code}", response_model=PromotionListItem)
def promotion_detail(promo_code: str) -> PromotionListItem:
    detail = get_promotion(promo_code)
    if detail is None:
        raise HTTPException(status_code=404, detail="promotion not found")
    return detail


@router.post("/promotions", response_model=PromotionWriteResponse)
def promotion_create(payload: PromotionWriteRequest) -> PromotionWriteResponse:
    return create_promotion(payload)


@router.put("/promotions/{promo_code}", response_model=PromotionWriteResponse)
def promotion_update(promo_code: str, payload: PromotionWriteRequest) -> PromotionWriteResponse:
    result = update_promotion(promo_code, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="promotion not found")
    return result


@router.delete("/promotions/{promo_code}", response_model=PromotionWriteResponse)
def promotion_delete(promo_code: str) -> PromotionWriteResponse:
    result = delete_promotion(promo_code)
    if result is None:
        raise HTTPException(status_code=404, detail="promotion not found")
    return result


@router.get("/partners", response_model=PartnerListResponse)
def partner_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    partner_name: str | None = Query(default=None, max_length=50),
    partner_status: PartnerStatus = Query(default="all", pattern="^(all|00|01)$"),
    rep_name: str | None = Query(default=None, max_length=50),
    partner_code: str | None = Query(default=None, max_length=5),
    order_by: PartnerOrderBy = Query(
        default="reg_date_desc",
        pattern="^(reg_date_desc|partner_name_asc|partner_code_asc|rep_name_asc)$",
    ),
) -> PartnerListResponse:
    return list_partners(
        limit=limit,
        offset=offset,
        partner_name=partner_name,
        partner_status=partner_status,
        rep_name=rep_name,
        partner_code=partner_code,
        order_by=order_by,
    )


@router.get("/partners/id-check", response_model=PartnerCheckResponse)
def partner_id_check(partner_id: str = Query(min_length=1, max_length=10)) -> PartnerCheckResponse:
    return partner_id_exists(partner_id)


@router.get("/partners/code-check", response_model=PartnerCheckResponse)
def partner_code_check(partner_code: str = Query(min_length=1, max_length=5)) -> PartnerCheckResponse:
    return partner_code_exists(partner_code)


@router.get("/partners/{partner_id}", response_model=PartnerDetailResponse)
def partner_detail(partner_id: str) -> PartnerDetailResponse:
    detail = get_partner(partner_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="partner not found")
    return detail


@router.post("/partners", response_model=PartnerWriteResponse)
def partner_create(payload: PartnerWriteRequest) -> PartnerWriteResponse:
    return create_partner(payload)


@router.put("/partners/{partner_id}", response_model=PartnerWriteResponse)
def partner_update(partner_id: str, payload: PartnerWriteRequest) -> PartnerWriteResponse:
    result = update_partner(partner_id, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="partner not found")
    return result


@router.delete("/partners/{partner_id}", response_model=PartnerWriteResponse)
def partner_delete(partner_id: str) -> PartnerWriteResponse:
    result = delete_partner(partner_id)
    if result is None:
        raise HTTPException(status_code=404, detail="partner not found")
    return result


@router.get("/moneybank-products", response_model=MoneybankProductListResponse)
def moneybank_product_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    product_status: MoneybankProductStatus = Query(default="all", pattern="^(all|00|01|02)$"),
    firm_name: str | None = Query(default=None, max_length=100),
    product_name: str | None = Query(default=None, max_length=100),
    manager_name: str | None = Query(default=None, max_length=100),
    order_by: MoneybankProductOrderBy = Query(
        default="reg_date_desc",
        pattern="^(reg_date_(asc|desc)|firm_name_asc|product_name_asc)$",
    ),
) -> MoneybankProductListResponse:
    return list_moneybank_products(
        limit=limit,
        offset=offset,
        product_status=product_status,
        firm_name=firm_name,
        product_name=product_name,
        manager_name=manager_name,
        order_by=order_by,
    )


@router.get("/moneybank-products/{firm_no}", response_model=MoneybankProductListItem)
def moneybank_product_detail(firm_no: int) -> MoneybankProductListItem:
    detail = get_moneybank_product(firm_no)
    if detail is None:
        raise HTTPException(status_code=404, detail="moneybank product not found")
    return detail


@router.post("/moneybank-products", response_model=MoneybankProductWriteResponse)
def moneybank_product_create(payload: MoneybankProductWriteRequest) -> MoneybankProductWriteResponse:
    return create_moneybank_product(payload)


@router.put("/moneybank-products/{firm_no}", response_model=MoneybankProductWriteResponse)
def moneybank_product_update(firm_no: int, payload: MoneybankProductWriteRequest) -> MoneybankProductWriteResponse:
    result = update_moneybank_product(firm_no, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="moneybank product not found")
    return result


@router.get("/prizm-config/items", response_model=PrizmConfigListResponse)
def prizm_config_item_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    division: PrizmConfigDivision = Query(default="all", pattern="^(all|1|2)$"),
    subject_no: int | None = Query(default=None, ge=1),
    item_name: str | None = Query(default=None, max_length=255),
) -> PrizmConfigListResponse:
    return list_prizm_config_items(
        limit=limit,
        offset=offset,
        division=division,
        subject_no=subject_no,
        item_name=item_name,
    )


@router.get("/prizm-config/update-records", response_model=PrizmConfigUpdateRecordResponse)
def prizm_config_update_record_list(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    division: PrizmConfigDivision = Query(default="all", pattern="^(all|1|2)$"),
) -> PrizmConfigUpdateRecordResponse:
    return list_prizm_config_update_records(limit=limit, offset=offset, division=division)


@router.get("/prizm-config/items/{division}/{subject_no}/{item_no}", response_model=PrizmConfigItem)
def prizm_config_item_detail(division: int, subject_no: int, item_no: int) -> PrizmConfigItem:
    detail = get_prizm_config_item(division, subject_no, item_no)
    if detail is None:
        raise HTTPException(status_code=404, detail="prizm config item not found")
    return detail


@router.put("/prizm-config/items/{division}/{subject_no}/{item_no}", response_model=PrizmConfigUpdateResponse)
def prizm_config_item_update(
    division: int,
    subject_no: int,
    item_no: int,
    payload: PrizmConfigUpdateRequest,
) -> PrizmConfigUpdateResponse:
    result = update_prizm_config_item(division, subject_no, item_no, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="prizm config item not found")
    return result


@router.get("/raw-data/tables", response_model=list[RawDataTableOption])
def raw_data_tables() -> list[RawDataTableOption]:
    return list_raw_data_tables()


@router.get("/raw-data/tables/{table_name}/columns", response_model=list[RawDataColumnOption])
def raw_data_columns(table_name: str) -> list[RawDataColumnOption]:
    try:
        return list_raw_data_columns(table_name)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/raw-data/formulas", response_model=list[RawDataFormulaItem])
def raw_data_formulas(
    raw_data_id: str | None = Query(default=None, max_length=100),
    raw_data_shop: str | None = Query(default=None, max_length=50),
) -> list[RawDataFormulaItem]:
    return list_raw_data_formulas(raw_data_id=raw_data_id, raw_data_shop=raw_data_shop)


@router.post("/raw-data/formulas", response_model=RawDataFormulaWriteResponse)
def raw_data_formula_create(payload: RawDataFormulaWriteRequest) -> RawDataFormulaWriteResponse:
    return create_raw_data_formula(payload)


@router.put("/raw-data/formulas/{raw_data_no}", response_model=RawDataFormulaWriteResponse)
def raw_data_formula_update(raw_data_no: int, payload: RawDataFormulaWriteRequest) -> RawDataFormulaWriteResponse:
    result = update_raw_data_formula(raw_data_no, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="raw data formula not found")
    return result


@router.delete("/raw-data/formulas/{raw_data_no}", response_model=RawDataFormulaWriteResponse)
def raw_data_formula_delete(raw_data_no: int) -> RawDataFormulaWriteResponse:
    result = delete_raw_data_formula(raw_data_no)
    if result is None:
        raise HTTPException(status_code=404, detail="raw data formula not found")
    return result


@router.post("/raw-data/preview", response_model=RawDataPreviewResponse)
def raw_data_preview(payload: RawDataPreviewRequest) -> RawDataPreviewResponse:
    try:
        return preview_raw_data(payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/charges", response_model=ChargeListResponse)
def charge_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: ChargeStatus = Query(default="all", pattern="^(all|operating|ended)$"),
    charge_code: str | None = Query(default=None, max_length=5),
    charge_name: str | None = Query(default=None, max_length=20),
    order_by: ChargeOrderBy = Query(
        default="reg_date_desc",
        pattern="^(reg_date_(asc|desc)|amount_desc|charge_name_asc|charge_code_asc)$",
    ),
) -> ChargeListResponse:
    return list_charges(
        limit=limit,
        offset=offset,
        status=status,
        charge_code=charge_code,
        charge_name=charge_name,
        order_by=order_by,
    )


@router.get("/charges/{charge_code}", response_model=ChargeListItem)
def charge_detail(charge_code: str) -> ChargeListItem:
    detail = get_charge(charge_code)
    if detail is None:
        raise HTTPException(status_code=404, detail="charge not found")
    return detail


@router.post("/charges", response_model=ChargeWriteResponse)
def charge_create(payload: ChargeWriteRequest) -> ChargeWriteResponse:
    return create_charge(payload)


@router.put("/charges/{charge_code}", response_model=ChargeWriteResponse)
def charge_update(charge_code: str, payload: ChargeWriteRequest) -> ChargeWriteResponse:
    result = update_charge(charge_code, payload)
    if result is None:
        raise HTTPException(status_code=404, detail="charge not found")
    return result


@router.delete("/charges/{charge_code}", response_model=ChargeWriteResponse)
def charge_delete(charge_code: str) -> ChargeWriteResponse:
    result = delete_charge(charge_code)
    if result is None:
        raise HTTPException(status_code=404, detail="charge not found")
    return result
    partner_code_exists,
    partner_id_exists,
