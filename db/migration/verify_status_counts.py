from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
from collections import Counter
from pathlib import Path

csv.field_size_limit(1024 * 1024 * 1024)


STATUS_NAMES = {
    "status",
    "process_type",
    "product_type",
    "result",
    "success",
    "success_yn",
    "payer_status",
    "error_code",
    "reply_code",
    "cb_check",
    "cb_confirm_admin",
    "final_confirm_admin",
    "type",
}


def quote_ident(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def is_status_column(name: str) -> bool:
    lower = name.lower()
    return (
        lower in STATUS_NAMES
        or lower.endswith("_status")
        or lower.endswith("_type")
        or lower.endswith("_yn")
        or lower.endswith("_code")
    )


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


def csv_counts(path: Path, column_index: int) -> Counter[str]:
    counts: Counter[str] = Counter()
    if not path.exists():
        return counts
    with path.open("r", encoding="utf-8", newline="") as source:
        for row in csv.reader(source):
            value = row[column_index]
            counts["<NULL>" if value == r"\N" else value] += 1
    return counts


def pg_counts(psql: Path, table: str, column: str, env: dict[str, str]) -> Counter[str]:
    sql = (
        f"select coalesce({quote_ident(column)}::text, '<NULL>') as value, count(*) "
        f"from {quote_ident(table)} group by 1 order by 1;"
    )
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
        "-F",
        "\t",
        "-c",
        sql,
    ]
    pg_env = os.environ.copy()
    pg_env["PGPASSWORD"] = env["CUBICI_DB_PASSWORD"]
    result = subprocess.run(command, check=True, text=True, capture_output=True, env=pg_env)
    counts: Counter[str] = Counter()
    for line in result.stdout.splitlines():
        if not line:
            continue
        value, count = line.rsplit("\t", 1)
        counts[value] = int(count)
    return counts


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
        for index, column in enumerate(table["columns"]):
            if not is_status_column(column["name"]):
                continue
            expected = csv_counts(args.csv_dir / f"{table['table']}.csv", index)
            actual = pg_counts(args.psql, table["table"], column["name"], env)
            all_keys = set(expected) | set(actual)
            mismatch_count = sum(1 for key in all_keys if expected.get(key, 0) != actual.get(key, 0))
            rows.append(
                {
                    "table": table["table"],
                    "column": column["name"],
                    "expected_distinct": len(expected),
                    "actual_distinct": len(actual),
                    "mismatch_count": mismatch_count,
                }
            )

    mismatches = [row for row in rows if row["mismatch_count"]]
    lines = [
        "# Cubici PostgreSQL Status Count Verification",
        "",
        "작성일: 2026-06-30",
        "",
        "## 요약",
        "",
        f"- 검증 컬럼 수: {len(rows)}",
        f"- 불일치 컬럼 수: {len(mismatches)}",
        "- 코드 값 원문은 문서에 기록하지 않았다.",
        "",
        "## 컬럼별 검증",
        "",
        "| Table | Column | Expected Distinct | Actual Distinct | Mismatch Categories |",
        "|---|---|---:|---:|---:|",
    ]
    for row in rows:
        lines.append(
            f"| `{row['table']}` | `{row['column']}` | {row['expected_distinct']} | {row['actual_distinct']} | {row['mismatch_count']} |"
        )
    args.out_md.parent.mkdir(parents=True, exist_ok=True)
    args.out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"columns={len(rows)} mismatches={len(mismatches)}")


if __name__ == "__main__":
    main()
