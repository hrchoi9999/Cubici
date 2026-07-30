import os
from datetime import date, datetime

import pytest

from cubici_service.db.connection import get_connection
from cubici_service.preferences.repository import (
    MoneybankProductWriteRequest,
    create_moneybank_product,
    get_moneybank_product,
    list_moneybank_products,
    update_moneybank_product,
)


pytestmark = [
    pytest.mark.db_e2e,
    pytest.mark.skipif(
        os.getenv("CUBICI_RUN_DB_E2E") != "1",
        reason="set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL E2E tests",
    ),
]


def test_moneybank_product_create_update_list_with_real_db() -> None:
    suffix = datetime.now().strftime("%H%M%S%f")[:9]
    firm_id = f"T{suffix}"[:20]
    firm_name = f"테스트금융사{suffix}"
    firm_no: int | None = None

    try:
        created = create_moneybank_product(
            MoneybankProductWriteRequest(
                firm_id=firm_id,
                firm_name=firm_name,
                rep_name="테스트대표",
                firm_address="서울",
                manager_name="상품담당자",
                manager_phone="01000000000",
                division="PREPAY",
                product_name="선정산 테스트상품",
                product_status="00",
                min_sales_amount=1_000_000,
                min_calc_amount=100_000,
                amount_limit=50_000_000,
                service_amount_min=100_000,
                service_amount_max=5_000_000,
                execute_amount_min=100_000,
                execute_amount_max=3_000_000,
                service_fee_min=1.5,
                service_fee_max=3.0,
                annual_fee_rate=12.0,
                interest_min=0.1,
                interest_max=0.5,
                limit_change_yn="Y",
                service_repay_min=7,
                service_repay_max=30,
                extension_yn="N",
                launch_date=date(2026, 7, 1),
                expire_date=date(2026, 12, 31),
                repayment_count=1,
                repay_amount=1_000_000,
                mid_repay_yn="Y",
                product_type="STD",
            )
        )
        firm_no = created.firm_no

        assert created.action == "created"
        assert created.product is not None
        assert created.product.master_status_label == "상품조건 등록"

        updated = update_moneybank_product(
            firm_no,
            MoneybankProductWriteRequest(
                firm_id=firm_id,
                firm_name=firm_name,
                rep_name="테스트대표",
                firm_address="서울",
                manager_name="상품담당자",
                product_name="선정산 테스트상품 수정",
                product_status="02",
                execute_amount_min=200_000,
                execute_amount_max=4_000_000,
                service_fee_min=2.0,
                service_fee_max=4.0,
            ),
        )

        assert updated is not None
        assert updated.action == "updated"
        assert updated.product is not None
        assert updated.product.product_status_label == "중지"

        detail = get_moneybank_product(firm_no)
        assert detail is not None
        assert detail.product_name == "선정산 테스트상품 수정"

        response = list_moneybank_products(limit=20, offset=0, firm_name=firm_name)
        assert response.counts.total_count == 1
        assert response.items[0].firm_no == firm_no
    finally:
        if firm_no is not None:
            _cleanup_product(firm_no)


def _cleanup_product(firm_no: int) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("delete from moneybank_product_preference where firm_no = %s", (firm_no,))
            cursor.execute("delete from moneybank_partner where firm_no = %s", (firm_no,))
