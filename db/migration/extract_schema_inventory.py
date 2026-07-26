from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, field
from pathlib import Path


CREATE_RE = re.compile(r"^CREATE TABLE `(?P<name>[^`]+)`", re.IGNORECASE)
INSERT_RE = re.compile(r"^INSERT INTO `(?P<name>[^`]+)` VALUES ", re.IGNORECASE)
COL_RE = re.compile(r"^\s*`(?P<name>[^`]+)`\s+(?P<type>[A-Za-z]+(?:\([^)]*\))?)(?P<rest>.*?)(?:,)?$")
PRIMARY_RE = re.compile(r"^\s*PRIMARY KEY\s+\((?P<cols>[^)]+)\)", re.IGNORECASE)
KEY_RE = re.compile(r"^\s*(?:UNIQUE\s+)?KEY\s+`(?P<name>[^`]+)`\s+\((?P<cols>[^)]+)\)", re.IGNORECASE)

MYSQL_SYSTEM_TABLES = {
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


@dataclass
class Column:
    name: str
    mysql_type: str
    nullable: bool
    default: str | None
    extra: str


@dataclass
class Table:
    name: str
    ddl: list[str] = field(default_factory=list)
    columns: list[Column] = field(default_factory=list)
    primary_key: list[str] = field(default_factory=list)
    keys: list[dict[str, object]] = field(default_factory=list)
    insert_rows: int = 0


def count_insert_rows(line: str) -> int:
    # MySQL dump emits one INSERT statement per table in this dump style.
    # Counting tuple separators avoids logging or parsing raw values.
    if " VALUES " not in line:
        return 0
    values = line.split(" VALUES ", 1)[1].strip()
    if not values or values == ";":
        return 0
    return values.count("),(") + 1


def parse_default(rest: str) -> str | None:
    match = re.search(r"\bDEFAULT\s+((?:'[^']*')|(?:[^\s,]+))", rest, re.IGNORECASE)
    if not match:
        return None
    return match.group(1)


def strip_ticks(value: str) -> str:
    return value.replace("`", "").strip()


def parse_table_ddl(table: Table) -> None:
    for line in table.ddl:
        col_match = COL_RE.match(line)
        if col_match:
            rest = col_match.group("rest")
            table.columns.append(
                Column(
                    name=col_match.group("name"),
                    mysql_type=col_match.group("type"),
                    nullable="NOT NULL" not in rest.upper(),
                    default=parse_default(rest),
                    extra=rest.strip().rstrip(","),
                )
            )
            continue

        primary_match = PRIMARY_RE.match(line)
        if primary_match:
            table.primary_key = [strip_ticks(col) for col in primary_match.group("cols").split(",")]
            continue

        key_match = KEY_RE.match(line)
        if key_match:
            table.keys.append(
                {
                    "name": key_match.group("name"),
                    "columns": [strip_ticks(col) for col in key_match.group("cols").split(",")],
                }
            )


def read_dump(path: Path) -> dict[str, Table]:
    tables: dict[str, Table] = {}
    current: Table | None = None

    with path.open("r", encoding="utf-8", errors="replace") as source:
        for raw_line in source:
            line = raw_line.rstrip("\n")
            create_match = CREATE_RE.match(line)
            if create_match:
                current = Table(name=create_match.group("name"), ddl=[line])
                tables[current.name] = current
                continue

            if current is not None:
                current.ddl.append(line)
                if line.startswith(")") and ";" in line:
                    parse_table_ddl(current)
                    current = None
                continue

            insert_match = INSERT_RE.match(line)
            if insert_match:
                name = insert_match.group("name")
                table = tables.setdefault(name, Table(name=name))
                table.insert_rows += count_insert_rows(line)

    return tables


def write_schema_only(tables: dict[str, Table], path: Path) -> None:
    lines: list[str] = [
        "-- Schema-only extract generated from backup_20240508.sql.",
        "-- INSERT data is intentionally excluded.",
        "",
    ]
    for table in tables.values():
        if not table.ddl:
            continue
        lines.extend(table.ddl)
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_json(tables: dict[str, Table], path: Path) -> None:
    payload = [
        {
            "table": table.name,
            "column_count": len(table.columns),
            "insert_rows": table.insert_rows,
            "primary_key": table.primary_key,
            "key_count": len(table.keys),
            "columns": [
                {
                    "name": column.name,
                    "mysql_type": column.mysql_type,
                    "nullable": column.nullable,
                    "default": column.default,
                    "extra": column.extra,
                }
                for column in table.columns
            ],
            "keys": table.keys,
        }
        for table in sorted(tables.values(), key=lambda item: item.name.lower())
    ]
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_markdown(tables: dict[str, Table], path: Path) -> None:
    lines = [
        "# Cubici MySQL Schema Inventory",
        "",
        "작성일: 2026-06-30",
        "",
        "## 검증 원칙",
        "",
        "- 원본 INSERT 값은 출력하지 않았다.",
        "- 테이블, 컬럼, PK, index, dump 내 INSERT row count만 기록했다.",
        "- row count는 dump INSERT tuple separator 기준 산출값이므로 PostgreSQL 적재 후 재검증한다.",
        "",
        "## 요약",
        "",
        f"- 테이블 수: {len(tables)}",
        f"- dump INSERT row count 합계: {sum(table.insert_rows for table in tables.values())}",
        "",
        "## 테이블 목록",
        "",
        "| Table | Columns | PK | Keys | Dump Rows |",
        "|---|---:|---|---:|---:|",
    ]
    for table in sorted(tables.values(), key=lambda item: item.name.lower()):
        pk = ", ".join(table.primary_key) if table.primary_key else ""
        lines.append(f"| `{table.name}` | {len(table.columns)} | `{pk}` | {len(table.keys)} | {table.insert_rows} |")

    lines.extend(["", "## 다음 액션", "", "- MySQL type을 PostgreSQL type으로 매핑한다.", "- PostgreSQL DDL 초안을 생성하고 수작업 검토한다.", "- 실제 적재 후 row count, 금액 합계, 상태별 건수를 재검증한다.", ""])
    path.write_text("\n".join(lines), encoding="utf-8")


def quote_identifier(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def convert_type(mysql_type: str) -> str:
    lower = mysql_type.lower()
    lower = re.sub(r"\bint\(\d+\)", "integer", lower)
    lower = re.sub(r"\bbigint\(\d+\)", "bigint", lower)
    lower = re.sub(r"\bsmallint\(\d+\)", "smallint", lower)
    lower = re.sub(r"\btinyint\(\d+\)", "smallint", lower)
    lower = re.sub(r"\bmediumint\(\d+\)", "integer", lower)
    lower = re.sub(r"\bdouble(?:\([^)]*\))?", "double precision", lower)
    lower = re.sub(r"\bfloat(?:\([^)]*\))?", "real", lower)
    lower = re.sub(r"\bdatetime\b", "timestamp", lower)
    lower = re.sub(r"\blongtext\b", "text", lower)
    lower = re.sub(r"\bmediumtext\b", "text", lower)
    lower = re.sub(r"\btinytext\b", "text", lower)
    lower = re.sub(r"\blongblob\b", "bytea", lower)
    lower = re.sub(r"\bmediumblob\b", "bytea", lower)
    lower = re.sub(r"\bblob\b", "bytea", lower)
    return lower


def write_postgres_draft(tables: dict[str, Table], path: Path) -> None:
    lines = [
        "-- PostgreSQL DDL draft generated from MySQL schema inventory.",
        "-- Review required before applying to a real database.",
        "",
    ]
    for table in sorted(tables.values(), key=lambda item: item.name.lower()):
        lines.append(f"CREATE TABLE IF NOT EXISTS {quote_identifier(table.name)} (")
        column_lines: list[str] = []
        for column in table.columns:
            col_type = convert_type(column.mysql_type)
            pieces = [f"  {quote_identifier(column.name)} {col_type}"]
            if not column.nullable:
                pieces.append("NOT NULL")
            column_lines.append(" ".join(pieces))
        if table.primary_key:
            pk = ", ".join(quote_identifier(col) for col in table.primary_key)
            column_lines.append(f"  PRIMARY KEY ({pk})")
        lines.append(",\n".join(column_lines))
        lines.append(");")
        for key in table.keys:
            cols = ", ".join(quote_identifier(str(col)) for col in key["columns"])
            index_name = f"idx_{table.name}_{key['name']}"[:63]
            lines.append(f"CREATE INDEX IF NOT EXISTS {quote_identifier(index_name)} ON {quote_identifier(table.name)} ({cols});")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_app_inventory(tables: dict[str, Table], path: Path) -> None:
    app_tables = [table for table in tables.values() if table.name not in MYSQL_SYSTEM_TABLES]
    system_tables = [table for table in tables.values() if table.name in MYSQL_SYSTEM_TABLES]
    lines = [
        "# Cubici Application Table Classification",
        "",
        "작성일: 2026-06-30",
        "",
        "## 요약",
        "",
        f"- 전체 테이블 수: {len(tables)}",
        f"- 애플리케이션 테이블 후보: {len(app_tables)}",
        f"- MySQL 시스템 테이블 제외 후보: {len(system_tables)}",
        f"- 애플리케이션 dump row count: {sum(table.insert_rows for table in app_tables)}",
        "",
        "## 애플리케이션 테이블 후보",
        "",
        "| Table | Columns | PK | Dump Rows |",
        "|---|---:|---|---:|",
    ]
    for table in sorted(app_tables, key=lambda item: item.name.lower()):
        pk = ", ".join(table.primary_key) if table.primary_key else ""
        lines.append(f"| `{table.name}` | {len(table.columns)} | `{pk}` | {table.insert_rows} |")
    lines.extend(["", "## 제외 후보: MySQL 시스템 테이블", "", "| Table | Columns | Dump Rows |", "|---|---:|---:|"])
    for table in sorted(system_tables, key=lambda item: item.name.lower()):
        lines.append(f"| `{table.name}` | {len(table.columns)} | {table.insert_rows} |")
    lines.extend(["", "## 판단", "", "- PostgreSQL 1차 전환 대상은 애플리케이션 테이블 후보로 제한한다.", "- MySQL 권한/시스템 테이블은 서비스 DB 재현 대상에서 제외한다.", "- 제외 여부는 기존 Java/MyBatis 참조 여부 점검 후 최종 확정한다.", ""])
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dump", required=True, type=Path)
    parser.add_argument("--schema-only", required=True, type=Path)
    parser.add_argument("--inventory-json", required=True, type=Path)
    parser.add_argument("--inventory-md", required=True, type=Path)
    parser.add_argument("--postgres-draft", required=True, type=Path)
    parser.add_argument("--postgres-app-draft", type=Path)
    parser.add_argument("--app-inventory-md", type=Path)
    args = parser.parse_args()

    tables = read_dump(args.dump)
    for output in [args.schema_only, args.inventory_json, args.inventory_md, args.postgres_draft]:
        output.parent.mkdir(parents=True, exist_ok=True)

    write_schema_only(tables, args.schema_only)
    write_json(tables, args.inventory_json)
    write_markdown(tables, args.inventory_md)
    write_postgres_draft(tables, args.postgres_draft)
    if args.postgres_app_draft:
        app_tables = {name: table for name, table in tables.items() if name not in MYSQL_SYSTEM_TABLES}
        args.postgres_app_draft.parent.mkdir(parents=True, exist_ok=True)
        write_postgres_draft(app_tables, args.postgres_app_draft)
    if args.app_inventory_md:
        args.app_inventory_md.parent.mkdir(parents=True, exist_ok=True)
        write_app_inventory(tables, args.app_inventory_md)
    print(f"tables={len(tables)} rows={sum(table.insert_rows for table in tables.values())}")


if __name__ == "__main__":
    main()
