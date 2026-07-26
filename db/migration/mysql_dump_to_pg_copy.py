from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SYSTEM_TABLES = {
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

INSERT_RE = re.compile(r"^INSERT INTO `(?P<table>[^`]+)` VALUES ", re.IGNORECASE)


@dataclass(frozen=True)
class Column:
    name: str
    mysql_type: str
    nullable: bool


def quote_ident(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def decode_escape(char: str) -> str:
    mapping = {
        "0": "\x00",
        "b": "\b",
        "n": "\n",
        "r": "\r",
        "t": "\t",
        "Z": "\x1a",
        "\\": "\\",
        "'": "'",
        '"': '"',
    }
    return mapping.get(char, char)


def parse_quoted(values: str, index: int) -> tuple[str, int]:
    assert values[index] == "'"
    index += 1
    chars: list[str] = []
    while index < len(values):
        char = values[index]
        if char == "\\" and index + 1 < len(values):
            chars.append(decode_escape(values[index + 1]))
            index += 2
            continue
        if char == "'":
            return "".join(chars), index + 1
        chars.append(char)
        index += 1
    raise ValueError("unterminated quoted value")


def parse_token(values: str, index: int) -> tuple[Any, int]:
    while index < len(values) and values[index].isspace():
        index += 1
    if values[index] == "'":
        return parse_quoted(values, index)
    start = index
    while index < len(values) and values[index] not in ",)":
        index += 1
    token = values[start:index].strip()
    if token.upper() == "NULL":
        return None, index
    return token, index


def parse_insert_values(line: str) -> list[list[Any]]:
    values = line.split(" VALUES ", 1)[1].strip()
    if values.endswith(";"):
        values = values[:-1]
    rows: list[list[Any]] = []
    index = 0
    while index < len(values):
        while index < len(values) and values[index] in " \r\n,":
            index += 1
        if index >= len(values):
            break
        if values[index] != "(":
            raise ValueError("expected tuple start")
        index += 1
        row: list[Any] = []
        while index < len(values):
            item, index = parse_token(values, index)
            row.append(item)
            if index >= len(values):
                raise ValueError("unexpected end in tuple")
            if values[index] == ",":
                index += 1
                continue
            if values[index] == ")":
                index += 1
                rows.append(row)
                break
            raise ValueError("unexpected tuple delimiter")
    return rows


def is_binary(column: Column) -> bool:
    return "blob" in column.mysql_type.lower()


def is_temporal(column: Column) -> bool:
    lower = column.mysql_type.lower()
    return lower.startswith("date") or lower.startswith("datetime") or lower.startswith("timestamp")


def is_numeric(column: Column) -> bool:
    lower = column.mysql_type.lower()
    return any(lower.startswith(prefix) for prefix in ["int", "bigint", "smallint", "tinyint", "mediumint", "decimal", "double", "float"])


def is_bit(column: Column) -> bool:
    return column.mysql_type.lower().startswith("bit")


def clean_value(value: Any, column: Column) -> Any:
    if value is None:
        return None
    if is_bit(column):
        if isinstance(value, str) and value:
            return "1" if ord(value[0]) != 0 else "0"
        return "0"
    if is_binary(column):
        if isinstance(value, str):
            raw = value.encode("utf-8", errors="surrogateescape")
        else:
            raw = str(value).encode("utf-8", errors="surrogateescape")
        return "\\x" + raw.hex()
    text = str(value)
    if is_temporal(column) and (text.startswith("0000-00-00") or text == ""):
        return None
    if is_numeric(column) and text == "":
        return None
    return text


def load_inventory(path: Path) -> dict[str, list[Column]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    tables: dict[str, list[Column]] = {}
    for table in data:
        name = table["table"]
        if name in SYSTEM_TABLES:
            continue
        tables[name] = [
            Column(name=column["name"], mysql_type=column["mysql_type"], nullable=column["nullable"])
            for column in table["columns"]
        ]
    return tables


def write_copy_script(tables: dict[str, list[Column]], out_dir: Path, script_path: Path) -> None:
    lines = [
        "\\set ON_ERROR_STOP on",
        "BEGIN;",
    ]
    for table, columns in sorted(tables.items(), key=lambda item: item[0].lower()):
        csv_path = (out_dir / f"{table}.csv").as_posix()
        col_list = ", ".join(quote_ident(column.name) for column in columns)
        lines.append(
            f"\\copy {quote_ident(table)} ({col_list}) FROM '{csv_path}' WITH (FORMAT csv, NULL '\\N')"
        )
    lines.append("COMMIT;")
    script_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def convert_dump(dump: Path, inventory: Path, out_dir: Path, script_path: Path, summary_path: Path) -> None:
    tables = load_inventory(inventory)
    out_dir.mkdir(parents=True, exist_ok=True)
    writers: dict[str, csv.writer] = {}
    handles: dict[str, Any] = {}
    counts = {table: 0 for table in tables}
    errors: list[str] = []

    try:
        for table, columns in tables.items():
            handle = (out_dir / f"{table}.csv").open("w", encoding="utf-8", newline="")
            handles[table] = handle
            writers[table] = csv.writer(handle, lineterminator="\n")

        with dump.open("r", encoding="utf-8", errors="surrogateescape") as source:
            for line_no, raw_line in enumerate(source, start=1):
                match = INSERT_RE.match(raw_line)
                if not match:
                    continue
                table = match.group("table")
                if table not in tables:
                    continue
                columns = tables[table]
                try:
                    for row in parse_insert_values(raw_line.rstrip("\n")):
                        if len(row) != len(columns):
                            errors.append(f"{table}: line {line_no}: value_count={len(row)} column_count={len(columns)}")
                            continue
                        writers[table].writerow([
                            "\\N" if (cleaned := clean_value(value, column)) is None else cleaned
                            for value, column in zip(row, columns)
                        ])
                        counts[table] += 1
                except Exception as exc:  # noqa: BLE001
                    errors.append(f"{table}: line {line_no}: {type(exc).__name__}")
    finally:
        for handle in handles.values():
            handle.close()

    write_copy_script(tables, out_dir, script_path)
    summary = {
        "table_count": len(tables),
        "row_count": sum(counts.values()),
        "counts": dict(sorted(counts.items())),
        "error_count": len(errors),
        "errors": errors[:100],
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"tables={len(tables)} rows={sum(counts.values())} errors={len(errors)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dump", required=True, type=Path)
    parser.add_argument("--inventory", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--copy-script", required=True, type=Path)
    parser.add_argument("--summary", required=True, type=Path)
    args = parser.parse_args()
    convert_dump(args.dump, args.inventory, args.out_dir, args.copy_script, args.summary)


if __name__ == "__main__":
    main()
