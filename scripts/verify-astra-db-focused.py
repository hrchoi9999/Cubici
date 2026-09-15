"""Synthetic PostgreSQL scope checks; no application imports or environment files.

Run with the approved Alt_CSM Python. SQL uses only cubici-postgres-dev and
pg_temp tables. Connection-helper cases use a driver double, not live libpq.
"""

from __future__ import annotations

import ast
from contextlib import contextmanager
from datetime import date
import hashlib
from pathlib import Path
import subprocess
import sys
from types import SimpleNamespace
from unittest.mock import Mock

import psycopg
from psycopg import sql


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "service-api" / "src" / "cubici_service"
HASHES: dict[Path, str] = {}
PSQL = [
    "docker", "exec", "-i", "cubici-postgres-dev", "sh", "-c",
    'exec psql -X -q -U "$POSTGRES_USER" -d cubici_local '
    '-v ON_ERROR_STOP=1 -At -f -',
]


def require(condition: bool, label: str) -> None:
    if not condition:
        raise RuntimeError(label)


def run_sql(statement: str) -> str:
    result = subprocess.run(
        PSQL, input=statement, text=True, encoding="utf-8",
        capture_output=True, timeout=90, check=False,
    )
    if result.returncode:
        # Suppress raw connection errors and process environment values.
        raise RuntimeError(f"PostgreSQL check failed (exit={result.returncode})")
    return result.stdout.strip()


def load_definitions(relative: str, names: set[str], namespace: dict) -> dict:
    path = (SOURCE / relative).resolve()
    require(path.is_relative_to(SOURCE.resolve()), "source path escaped repository")
    raw = path.read_bytes()
    HASHES[path] = hashlib.sha256(raw).hexdigest()
    parsed = ast.parse(raw, filename=str(path))
    selected = []
    for node in parsed.body:
        if isinstance(node, ast.FunctionDef) and node.name in names:
            selected.append(node)
        elif isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id in names for target in node.targets
        ):
            selected.append(node)
    # Load only source definitions: never execute module imports, app startup,
    # Settings construction, get_settings(), or the .env loader.
    module = ast.Module(body=[
        ast.ImportFrom(module="__future__", names=[ast.alias(name="annotations")], level=0),
        *selected,
    ], type_ignores=[])
    exec(compile(ast.fix_missing_locations(module), str(path), "exec"), namespace)
    require(names <= namespace.keys(), f"source definitions missing: {relative}")
    return namespace


def forbidden_settings():
    raise RuntimeError("implicit application settings are forbidden")


def check_connection_helper() -> int:
    driver = SimpleNamespace(connect=Mock(), OperationalError=psycopg.OperationalError)
    sleep = Mock()
    ns = load_definitions("db/connection.py", {"get_connection"}, {
        "contextmanager": contextmanager, "psycopg": driver,
        "time": SimpleNamespace(sleep=sleep), "get_settings": forbidden_settings,
    })
    get_connection = ns["get_connection"]
    settings = SimpleNamespace(db_conninfo="synthetic-connection-only")

    class Connection:
        def __init__(self):
            self.enters = 0
            self.exits = []

        def __enter__(self):
            self.enters += 1
            return self

        def __exit__(self, kind, value, traceback):
            self.exits.append(value)

    connection = Connection()
    driver.connect.return_value = connection
    with get_connection(settings) as actual:
        require(actual is connection, "connection identity")
    driver.connect.assert_called_once_with(
        settings.db_conninfo, autocommit=True, connect_timeout=5,
    )
    require(connection.enters == 1 and connection.exits == [None], "success cleanup")

    driver.connect.reset_mock()
    connection = Connection()
    driver.connect.side_effect = [psycopg.OperationalError("synthetic initial failure"), connection]
    with get_connection(settings) as actual:
        require(actual is connection, "retry connection identity")
    require(driver.connect.call_count == 2 and connection.exits == [None], "initial retry")

    driver.connect.reset_mock()
    error = psycopg.OperationalError("synthetic connection unavailable")
    driver.connect.side_effect = error
    try:
        with get_connection(settings):
            raise AssertionError("unavailable connection entered body")
    except psycopg.OperationalError as caught:
        require(caught is error, "connection exception identity")
    else:
        raise RuntimeError("connection failure swallowed")
    require(driver.connect.call_count == 3, "connection retry limit")

    for error in (psycopg.OperationalError("synthetic SQL failure"), ValueError("synthetic body failure")):
        driver.connect.reset_mock()
        connection = Connection()
        driver.connect.side_effect = None
        driver.connect.return_value = connection
        bodies = 0
        try:
            with get_connection(settings):
                bodies += 1
                raise error
        except type(error) as caught:
            require(caught is error, "body exception identity")
        else:
            raise RuntimeError("body failure swallowed")
        require(bodies == 1 and driver.connect.call_count == 1, "SQL body replayed")
        require(connection.exits == [error], "failure cleanup")
    return 5


def bind_synthetic(clause: str, parameters: list) -> str:
    fragments = clause.split("%s")
    require(len(fragments) == len(parameters) + 1, "SQL parameter count")
    return "".join(
        part + (sql.Literal(parameters[index]).as_string() if index < len(parameters) else "")
        for index, part in enumerate(fragments)
    )


def check_scope_sql() -> int:
    ns = load_definitions("core/shop_types.py", {
        "LEGACY_SHOP_TYPE_TO_CODE", "SHOP_TYPE_ALIASES",
        "normalize_shop_type", "build_shop_pair_clause",
    }, {})
    load_definitions("settlements/repository.py", {"_build_settlement_filters"}, ns)
    builder = ns["_build_settlement_filters"]
    common = dict(shop_pairs=None, shop_type=None, shop_id=None, status=None,
                  keyword=None, from_date=None, to_date=None)
    cases = []

    def add(name, expected, total, **options):
        clause, params = builder(**(common | options))
        cases.append((name, clause, params, expected, total))

    add("owner_exact_prefix", [1], 100, owner_shop_pairs=[("NAVER", "seller01")])
    add("owner_empty_denied", [], 0, owner_shop_pairs=[])
    add("owner_wildcards_literal", [4], 400, owner_shop_pairs=[("NAVER", "seller_%")])
    add("owner_quote_literal", [6], 600, owner_shop_pairs=[("NAVER", "seller'quote")])
    add("owner_injection_literal", [], 0, owner_shop_pairs=[("NAVER", "x' OR TRUE --")])
    add("owner_intersects_request", [1], 100, owner_shop_pairs=[("NAVER", "seller01")],
        shop_pairs="NAVER:seller01,NAVER:seller010")
    add("owner_none_sentinel", [], 0, owner_shop_pairs=[("NAVER", "seller01")], shop_pairs="__none__")
    add("legacy_shop_type", [1], 100, owner_shop_pairs=[("NAVER", "seller01")],
        shop_type="14", shop_id="seller01")
    add("admin_partial_search", [1, 2], 300, shop_type="NAVER", shop_id="seller01")
    add("owner_multiple_pairs", [1, 3], 400,
        owner_shop_pairs=[("NAVER", "seller01"), ("COUPANG", "seller01")])
    for name, pair, ids, total in [
        ("shop_no_exact_prefix", "14:mall01", [7], 700),
        ("shop_no_wildcards_literal", "NAVER:seller_%", [4], 400),
    ]:
        clause, params = ns["build_shop_pair_clause"](pair, shop_id_column="shop_no")
        cases.append((name, " where " + clause, params, ids, total))

    statements = ["""
BEGIN;
SET LOCAL search_path = pg_temp, pg_catalog;
SET LOCAL statement_timeout = '10s';
SET LOCAL lock_timeout = '2s';
CREATE TEMP TABLE astra_rollback_guard (id integer PRIMARY KEY, value integer);
INSERT INTO pg_temp.astra_rollback_guard VALUES (1, 7);
SAVEPOINT astra_synthetic;
UPDATE pg_temp.astra_rollback_guard SET value = 99 WHERE id = 1;
CREATE TEMP TABLE astra_scope_probe (
    id integer PRIMARY KEY, shop_type text, shop_id text, shop_no text, amount integer
);
INSERT INTO pg_temp.astra_scope_probe VALUES
    (1, 'naver', 'seller01', 'other01', 100),
    (2, 'NAVER', 'seller010', 'other010', 200),
    (3, 'COUPANG', 'seller01', 'mall01', 300),
    (4, 'NAVER', 'seller_%', 'seller_%', 400),
    (5, 'NAVER', 'seller_X', 'seller_X', 500),
    (6, 'NAVER', 'seller''quote', 'quote', 600),
    (7, 'NAVER', 'unrelated', 'mall01', 700),
    (8, 'NAVER', 'unrelated2', 'mall010', 800);
"""]
    for name, clause, params, ids, total in cases:
        where = bind_synthetic(clause, params)
        expected_ids = sql.Literal(",".join(map(str, ids))).as_string()
        statements.append(f"""
DO $astra$
BEGIN
    IF (SELECT coalesce(string_agg(id::text, ',' ORDER BY id), '')
        FROM pg_temp.astra_scope_probe {where}) IS DISTINCT FROM {expected_ids}
       OR (SELECT count(*) FROM pg_temp.astra_scope_probe {where}) <> {len(ids)}
       OR (SELECT coalesce(sum(amount), 0) FROM pg_temp.astra_scope_probe {where}) <> {total}
    THEN RAISE EXCEPTION 'scope case failed: {name}'; END IF;
END $astra$;
SELECT 'PASS {name}';
""")
    page_clause, page_params = builder(**common, owner_shop_pairs=[("NAVER", "seller01"), ("NAVER", "seller010")])
    page_where = bind_synthetic(page_clause, page_params)
    statements.append(f"""
DO $astra$
BEGIN
    IF (SELECT id FROM pg_temp.astra_scope_probe {page_where} ORDER BY id LIMIT 1 OFFSET 1) <> 2
    THEN RAISE EXCEPTION 'pagination failed'; END IF;
END $astra$;
SELECT 'PASS exact_scope_pagination';
ROLLBACK TO SAVEPOINT astra_synthetic;
DO $astra$
BEGIN
    IF (SELECT value FROM pg_temp.astra_rollback_guard WHERE id = 1) IS DISTINCT FROM 7
       OR (SELECT count(*) FROM pg_temp.astra_rollback_guard) <> 1
       OR to_regclass('pg_temp.astra_scope_probe') IS NOT NULL
    THEN RAISE EXCEPTION 'savepoint rollback invariant failed'; END IF;
END $astra$;
SELECT 'PASS savepoint_rollback_invariant';
ROLLBACK;
DO $astra$
BEGIN
    IF to_regclass('pg_temp.astra_rollback_guard') IS NOT NULL
       OR to_regclass('pg_temp.astra_scope_probe') IS NOT NULL
    THEN RAISE EXCEPTION 'outer rollback left temporary tables'; END IF;
END $astra$;
SELECT 'PASS outer_rollback_no_temp_tables';
""")
    output = run_sql("\n".join(statements)).splitlines()
    expected = [f"PASS {case[0]}" for case in cases] + [
        "PASS exact_scope_pagination", "PASS savepoint_rollback_invariant",
        "PASS outer_rollback_no_temp_tables",
    ]
    require(output == expected, "SQL verification result mismatch")
    for line in output:
        print(line)
    return len(expected)


def main() -> int:
    require(run_sql("SELECT 1;") == "1", "development DB preflight failed")
    print("PASS dev_db_select_1")
    connection_cases = check_connection_helper()
    print(f"PASS connection_helper_driver_double cases={connection_cases}")
    sql_cases = check_scope_sql()
    for path, digest in HASHES.items():
        require(hashlib.sha256(path.read_bytes()).hexdigest() == digest, "source changed during verification")
        print(f"SOURCE {path.relative_to(ROOT).as_posix()} sha256={digest}")
    print(f"SUMMARY connection_unit={connection_cases} postgres_checks={sql_cases} business_sql=0 env_file_reads=0")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"FAIL {type(error).__name__}: {error}", file=sys.stderr)
        raise SystemExit(1)
