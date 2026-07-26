from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path


def load_expected(path: Path) -> dict[str, int]:
    data = json.loads(path.read_text(encoding="utf-8"))
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
    return {
        item["table"]: int(item["insert_rows"])
        for item in data
        if item["table"] not in system_tables
    }


def quote_ident(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def pg_count(psql: Path, table: str, env: dict[str, str]) -> int:
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
        f"select count(*) from {quote_ident(table)};",
    ]
    pg_env = os.environ.copy()
    pg_env["PGPASSWORD"] = env["CUBICI_DB_PASSWORD"]
    result = subprocess.run(command, check=True, text=True, capture_output=True, env=pg_env)
    return int(result.stdout.strip())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", required=True, type=Path)
    parser.add_argument("--psql", required=True, type=Path)
    parser.add_argument("--out-json", required=True, type=Path)
    parser.add_argument("--out-md", required=True, type=Path)
    args = parser.parse_args()

    required = ["CUBICI_DB_HOST", "CUBICI_DB_PORT", "CUBICI_DB_NAME", "CUBICI_DB_USER", "CUBICI_DB_PASSWORD"]
    env = {key: os.environ[key] for key in required}
    expected = load_expected(args.inventory)
    rows = []
    for table, expected_count in sorted(expected.items(), key=lambda item: item[0].lower()):
        actual_count = pg_count(args.psql, table, env)
        rows.append(
            {
                "table": table,
                "expected": expected_count,
                "actual": actual_count,
                "diff": actual_count - expected_count,
                "matched": actual_count == expected_count,
            }
        )

    args.out_json.parent.mkdir(parents=True, exist_ok=True)
    args.out_md.parent.mkdir(parents=True, exist_ok=True)
    args.out_json.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    total_expected = sum(row["expected"] for row in rows)
    total_actual = sum(row["actual"] for row in rows)
    mismatch = [row for row in rows if not row["matched"]]
    lines = [
        "# Cubici PostgreSQL Row Count Verification",
        "",
        "작성일: 2026-06-30",
        "",
        "## 요약",
        "",
        f"- 검증 테이블 수: {len(rows)}",
        f"- 예상 row count: {total_expected}",
        f"- 실제 row count: {total_actual}",
        f"- 불일치 테이블 수: {len(mismatch)}",
        "",
        "## 테이블별 검증",
        "",
        "| Table | Expected | Actual | Diff |",
        "|---|---:|---:|---:|",
    ]
    for row in rows:
        lines.append(f"| `{row['table']}` | {row['expected']} | {row['actual']} | {row['diff']} |")
    args.out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"tables={len(rows)} expected={total_expected} actual={total_actual} mismatches={len(mismatch)}")


if __name__ == "__main__":
    main()
