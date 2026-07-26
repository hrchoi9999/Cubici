from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
from decimal import Decimal, InvalidOperation
from pathlib import Path


KEYWORDS = ("amount", "price", "fee", "rate", "balance", "sales", "charge", "limit")
TOLERANCE = Decimal("0.000001")


def quote_ident(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def load_tables(path: Path) -> list[dict]:
    system_tables = {
        "column_stats",
        "columns_priv",
        "db",
        "event",
        "func",
        "global_priv",
        "gtid_slave_pos",
        "help_category",
        "help_keyword",
        "help_relation",
        "help_topic",
        "index_stats",
        "innodb_index_stats",
        "innodb_table_stats",
        "plugin",
        "proc",
        "procs_priv",
        "proxies_priv",
        "roles_mapping",
        "servers",
        "table_stats",
        "tables_priv",
        "time_zone",
        "time_zone_leap_second",
        "time_zone_name",
        "time_zone_transition",
        "time_zone_transition_type",
    }
    data = json.loads(path.read_text(encoding="utf-8"))
    return [item for item in data if item["table"] not in system_tables]


def is_amount_column(column: dict) -> bool:
    name = column["name"].lower()
    typ = column["mysql_type"].lower()
    if not any(keyword in name for keyword in KEYWORDS):
        return False
    return any(typ.startswith(prefix) for prefix in ["int", "bigint", "smallint", "tinyint", "mediumint", "decimal", "double", "float"])


def csv_sum(path: Path, column_index: int) -> Decimal:
    total = Decimal("0")
    if not path.exists():
        return total
    with path.open("r", encoding="utf-8", newline="") as source:
        reader = csv.reader(source)
        for row in reader:
            value = row[column_index]
            if value == r"\N" or value == "":
                continue
            try:
                total += Decimal(value)
            except InvalidOperation:
                continue
    return total


def pg_sum(psql: Path, table: str, column: str, env: dict[str, str]) -> Decimal:
    sql = f"select coalesce(sum({quote_ident(column)}), 0) from {quote_ident(table)};"
    command = [
        str(psql),
        "-h",
        env["CUBICI_DB_HOST"],
        "-p",
        env["CUBICI_DB_PORT"],
        "-U",
        env["CUBICI_DB_USER"],
        "-d",
        env["CUBICI_DB_NAME"],
        "-t",
        "-A",
        "-c",
        sql,
    ]
    pg_env = os.environ.copy()
    pg_env["PGPASSWORD"] = env["CUBICI_DB_PASSWORD"]
    result = subprocess.run(command, check=True, text=True, capture_output=True, env=pg_env)
    return Decimal(result.stdout.strip() or "0")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", required=True, type=Path)
    parser.add_argument("--csv-dir", required=True, type=Path)
    parser.add_argument("--psql", required=True, type=Path)
    parser.add_argument("--out-md", required=True, type=Path)
    args = parser.parse_args()

    required = ["CUBICI_DB_HOST", "CUBICI_DB_PORT", "CUBICI_DB_NAME", "CUBICI_DB_USER", "CUBICI_DB_PASSWORD"]
    env = {key: os.environ[key] for key in required}
    rows = []
    for table in load_tables(args.inventory):
        columns = table["columns"]
        for index, column in enumerate(columns):
            if not is_amount_column(column):
                continue
            expected = csv_sum(args.csv_dir / f"{table['table']}.csv", index)
            actual = pg_sum(args.psql, table["table"], column["name"], env)
            rows.append(
                {
                    "table": table["table"],
                    "column": column["name"],
                    "expected": expected,
                    "actual": actual,
                    "diff": actual - expected,
                }
            )

    mismatch = [row for row in rows if abs(row["diff"]) > TOLERANCE]
    lines = [
        "# Cubici PostgreSQL Amount Sum Verification",
        "",
        "작성일: 2026-06-30",
        "",
        "## 요약",
        "",
        f"- 검증 컬럼 수: {len(rows)}",
        f"- 불일치 컬럼 수: {len(mismatch)}",
        f"- tolerance: {TOLERANCE}",
        "",
        "## 컬럼별 검증",
        "",
        "| Table | Column | Expected Sum | Actual Sum | Diff |",
        "|---|---|---:|---:|---:|",
    ]
    for row in rows:
        lines.append(f"| `{row['table']}` | `{row['column']}` | {row['expected']} | {row['actual']} | {row['diff']} |")
    args.out_md.parent.mkdir(parents=True, exist_ok=True)
    args.out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"columns={len(rows)} mismatches={len(mismatch)}")


if __name__ == "__main__":
    main()
