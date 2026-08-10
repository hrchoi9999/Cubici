import os
from uuid import uuid4

import pytest

from cubici_service.db.connection import get_connection
from cubici_service.fintech.repository import (
    FundingProviderWriteRequest,
    create_funding_provider,
    list_funding_summaries,
)


pytestmark = [
    pytest.mark.db_e2e,
    pytest.mark.skipif(
        os.environ.get("CUBICI_RUN_DB_E2E") != "1",
        reason="set CUBICI_RUN_DB_E2E=1 to run PostgreSQL write verification",
    ),
]


def test_funding_provider_create_duplicate_guard_and_cleanup() -> None:
    provider_name = f"ADM10TEST{uuid4().hex[:8]}"
    created_id = None

    try:
        result = create_funding_provider(
            FundingProviderWriteRequest(
                fintech_name=provider_name,
                repayment_period=45,
                interest_rate=11.5,
            )
        )
        created_id = result.fintech_id

        assert result.provider.fintech_name == provider_name
        assert result.provider.calculation_status == "NO_FUNDING"
        assert result.provider.configuration_status == "BASIC_REGISTERED"
        assert any(
            item.fintech_id == created_id
            for item in list_funding_summaries(limit=100).items
        )

        with pytest.raises(ValueError, match="already exists"):
            create_funding_provider(
                FundingProviderWriteRequest(
                    fintech_name=provider_name,
                    repayment_period=45,
                    interest_rate=11.5,
                )
            )
    finally:
        if created_id is not None:
            with get_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        delete from fintech
                        where id = %s
                          and fintech_name = %s
                          and process_type = 'BASIC_REGISTERED'
                        """,
                        (created_id, provider_name),
                    )
