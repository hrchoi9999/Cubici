"""PostgreSQL connection helpers."""

from contextlib import contextmanager
import time
from typing import Iterator

import psycopg
from psycopg import Connection
from pydantic import BaseModel

from cubici_service.core.config import Settings, get_settings


class DatabaseCheck(BaseModel):
    status: str
    database: str
    schema_name: str
    application_table_count: int


@contextmanager
def get_connection(settings: Settings | None = None) -> Iterator[Connection]:
    resolved_settings = settings or get_settings()
    last_error = None
    for attempt in range(3):
        try:
            with psycopg.connect(
                resolved_settings.db_conninfo,
                autocommit=True,
                connect_timeout=5,
            ) as connection:
                yield connection
                return
        except psycopg.OperationalError as error:
            last_error = error
            if attempt == 2:
                break
            time.sleep(0.25 * (attempt + 1))
    raise last_error


def check_database_connection(settings: Settings | None = None) -> DatabaseCheck:
    resolved_settings = settings or get_settings()
    with get_connection(resolved_settings) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select current_database(), current_schema(), count(*)
                from information_schema.tables
                where table_schema = %s
                  and table_type = 'BASE TABLE'
                """,
                (resolved_settings.db_schema,),
            )
            database, schema_name, table_count = cursor.fetchone()

    return DatabaseCheck(
        status="ok",
        database=database,
        schema_name=schema_name,
        application_table_count=table_count,
    )
