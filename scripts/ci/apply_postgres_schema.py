"""Apply Cubici PostgreSQL schema, migrations, and minimal CI seed data.

This script is intentionally CI-only. It does not read production secrets and it
uses only environment variables supplied by the workflow.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

import psycopg


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "service-api" / "src"))

from cubici_service.accounts.repository import _hash_password

SCHEMA_DIR = REPO_ROOT / "db" / "postgres" / "schema"
MIGRATION_DIR = REPO_ROOT / "db" / "postgres" / "migrations"


def main() -> None:
    connection_info = {
        "host": os.environ["CUBICI_DB_HOST"],
        "port": int(os.environ["CUBICI_DB_PORT"]),
        "dbname": os.environ["CUBICI_DB_NAME"],
        "user": os.environ["CUBICI_DB_USER"],
        "password": os.environ["CUBICI_DB_PASSWORD"],
    }
    with psycopg.connect(**connection_info) as connection:
        with connection.cursor() as cursor:
            apply_sql(cursor, _postgres_compatible_legacy_schema())
            apply_file(cursor, SCHEMA_DIR / "002_application_schema_draft.sql")
            for migration in sorted(MIGRATION_DIR.glob("*.sql")):
                apply_file(cursor, migration)
            seed_minimal_data(cursor)


def apply_file(cursor: psycopg.Cursor, path: Path) -> None:
    apply_sql(cursor, path.read_text(encoding="utf-8"))


def apply_sql(cursor: psycopg.Cursor, sql: str) -> None:
    cursor.execute(sql)


def _postgres_compatible_legacy_schema() -> str:
    sql = (SCHEMA_DIR / "001_legacy_schema_all_tables_draft.sql").read_text(encoding="utf-8")
    sql = re.sub(r"\bvarbinary\s*\(\s*\d+\s*\)", "bytea", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\benum\s*\([^)]*\)", "varchar(255)", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\bset\s*\([^)]*\)", "text", sql, flags=re.IGNORECASE)
    return sql


def seed_minimal_data(cursor: psycopg.Cursor) -> None:
    password_hash = _hash_password(os.environ["CUBICI_MASTER_ADMIN_PASSWORD"])
    cursor.execute(
        """
        insert into fintech (
            id,
            fintech_name,
            fintech_bank_code,
            fintech_prd_code,
            fintech_pay_code,
            fintech_account_number,
            fintech_account_holder,
            fintech_interest_rate,
            fintech_repayment_date,
            process_type,
            reg_date,
            modified_date
        ) values (
            1,
            'CI Fintech',
            '000',
            'CI',
            'CI',
            '0000000000',
            'CI',
            0.00,
            25,
            'CI',
            now(),
            now()
        )
        on conflict (id) do nothing
        """
    )
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
            biz_type,
            sectors,
            fintech_id,
            reg_date,
            modified_date
        ) values
            (1, 'master-admin@example.test', %s, 'ADMIN_USER', 'CI Master Admin', '', '', '', 'CORP', 'ETC', 1, now(), now()),
            (900000000, 'master-admin@example.test', %s, 'ADMIN_USER', 'CI Master Admin', '', '', '', 'CORP', 'ETC', 1, now(), now())
        on conflict (user_no) do update
        set
            email = excluded.email,
            password = excluded.password,
            user_type = excluded.user_type,
            name = excluded.name,
            fintech_id = excluded.fintech_id,
            modified_date = now()
        """,
        (password_hash, password_hash),
    )


if __name__ == "__main__":
    main()
