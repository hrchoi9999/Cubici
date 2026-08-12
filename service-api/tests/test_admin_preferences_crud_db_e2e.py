from datetime import date
from uuid import uuid4

import pytest

from cubici_service.db.connection import get_connection
from cubici_service.preferences.repository import (
    ChargeWriteRequest,
    PartnerManagerPayload,
    PartnerWriteRequest,
    PromotionWriteRequest,
    create_charge,
    create_partner,
    create_promotion,
    delete_charge,
    delete_partner,
    delete_promotion,
    get_charge,
    get_partner,
    get_promotion,
    update_charge,
    update_partner,
    update_promotion,
)


pytestmark = pytest.mark.db_e2e


def test_charge_promotion_partner_crud_and_delete_policy() -> None:
    suffix = uuid4().hex[:8]
    charge_code = f"T{suffix[:4]}"
    promo_code = f"TEST-PROMO-{suffix}"
    partner_id = f"T{suffix}"
    partner_code = f"P{suffix[:4]}"

    charge = ChargeWriteRequest(
        charge_code=charge_code,
        charge_name=f"검증요금{suffix[:4]}",
        charge_type="B",
        start_date=date(2026, 1, 1),
        expire_date=date(2099, 12, 31),
        amount=29000,
        period=1,
        period_unit="M",
    )
    partner = PartnerWriteRequest(
        partner_id=partner_id,
        partner_code=partner_code,
        partner_name=f"검증협력사{suffix[:4]}",
        rep_name="검증대표",
        partner_zip="00000",
        partner_address="검증용 주소",
        partner_status="00",
        partner_type="BA",
        managers=[PartnerManagerPayload(manager_type="01", manager_name="검증담당자")],
    )
    promotion = PromotionWriteRequest(
        promo_code=promo_code,
        promo_name=f"검증연계{suffix[:4]}",
        promo_target="N",
        partner_code=partner_code,
        charge_codes=[charge_code],
        start_date=date(2026, 1, 1),
        expire_date=date(2099, 12, 31),
        discount_rate=10,
        period=1,
        period_unit="M",
    )

    try:
        assert create_charge(charge).action == "created"
        assert create_partner(partner).action == "created"
        assert create_promotion(promotion).action == "created"

        updated_charge = charge.model_copy(update={"charge_name": f"수정요금{suffix[:4]}", "amount": 31000})
        updated_partner = partner.model_copy(
            update={
                "partner_name": f"수정협력사{suffix[:4]}",
                "managers": [PartnerManagerPayload(manager_type="00", manager_name="수정책임자")],
            }
        )
        updated_promotion = promotion.model_copy(update={"promo_name": f"수정연계{suffix[:4]}", "discount_rate": 15})

        assert update_charge(charge_code, updated_charge).charge.amount == 31000
        assert update_partner(partner_id, updated_partner).partner.partner.partner_name.startswith("수정협력사")
        assert update_promotion(promo_code, updated_promotion).promotion.discount_rate == 15
        assert get_charge(charge_code) is not None
        assert get_partner(partner_id) is not None
        assert get_promotion(promo_code) is not None

        with pytest.raises(ValueError, match="charge is in use"):
            delete_charge(charge_code)
        with pytest.raises(ValueError, match="partner is in use"):
            delete_partner(partner_id)

        assert delete_promotion(promo_code).action == "deleted"
        assert delete_charge(charge_code).action == "deleted"
        assert delete_partner(partner_id).action == "deleted"

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select
                        (select count(*) from charge where charge_code = %s),
                        (select count(*) from promotion where promo_code = %s),
                        (select count(*) from promotion_charge where promo_code = %s),
                        (select count(*) from partner where partner_id = %s),
                        (select count(*) from partner_manager where partner_code = %s)
                    """,
                    (charge_code, promo_code, promo_code, partner_id, partner_code),
                )
                assert cursor.fetchone() == (0, 0, 0, 0, 0)
    finally:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("delete from promotion_charge where promo_code = %s or charge_code = %s", (promo_code, charge_code))
                cursor.execute("delete from promotion where promo_code = %s", (promo_code,))
                cursor.execute("delete from partner_manager where partner_code = %s", (partner_code,))
                cursor.execute("delete from partner where partner_id = %s", (partner_id,))
                cursor.execute("delete from charge where charge_code = %s", (charge_code,))
