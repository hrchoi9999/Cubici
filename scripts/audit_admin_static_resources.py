"""Audit legacy /resources static asset references for the admin web build."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ADMIN_WEB_ROOT = PROJECT_ROOT / "admin-web"
DIST_ROOT = ADMIN_WEB_ROOT / "dist"
PUBLIC_ROOT = ADMIN_WEB_ROOT / "public"

TEXT_SUFFIXES = {
    ".css",
    ".html",
    ".js",
    ".jsx",
    ".mjs",
}

RESOURCE_PATTERN = re.compile(r"/resources/[^\s'\"),;]+")


@dataclass(frozen=True)
class Reference:
    source: Path
    path: str


def iter_text_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    return [
        path
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in TEXT_SUFFIXES
    ]


def normalize_ref(value: str) -> str:
    return value.split("#", 1)[0].split("?", 1)[0].strip()


def collect_references() -> list[Reference]:
    references: list[Reference] = []
    for root in (ADMIN_WEB_ROOT / "src", ADMIN_WEB_ROOT / "index.html", PUBLIC_ROOT, DIST_ROOT):
        files = [root] if root.is_file() else iter_text_files(root)
        for file_path in files:
            try:
                text = file_path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for match in RESOURCE_PATTERN.finditer(text):
                path = normalize_ref(match.group(0))
                if path:
                    references.append(Reference(source=file_path, path=path))
    return references


def exists_in(root: Path, resource_path: str) -> bool:
    return (root / resource_path.removeprefix("/")).is_file()


def main() -> int:
    references = collect_references()
    unique_paths = sorted({reference.path for reference in references})
    dist_missing = [path for path in unique_paths if not exists_in(DIST_ROOT, path)]
    public_missing = [path for path in unique_paths if not exists_in(PUBLIC_ROOT, path)]
    both_missing = sorted(set(dist_missing) & set(public_missing))

    print("| 항목 | count |")
    print("|---|---:|")
    print(f"| references | {len(references)} |")
    print(f"| unique_paths | {len(unique_paths)} |")
    print(f"| dist_missing | {len(dist_missing)} |")
    print(f"| public_missing | {len(public_missing)} |")
    print(f"| both_missing | {len(both_missing)} |")

    if both_missing:
        print()
        print("| missing_path |")
        print("|---|")
        for path in both_missing[:80]:
            print(f"| {path} |")
        if len(both_missing) > 80:
            print(f"| ... {len(both_missing) - 80} more |")

    return 1 if both_missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
