from __future__ import annotations

import importlib.util
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = ROOT / "scripts" / "replay_legacy_financial_formulas.py"
SPEC = importlib.util.spec_from_file_location("legacy_financial_replay", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
replay = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(replay)


def test_pms_band_boundaries_follow_legacy_half_open_ranges() -> None:
    bands = [
        (Decimal("10"), None),
        (Decimal("3"), Decimal("10")),
        (Decimal("-3"), Decimal("3")),
        (Decimal("-15"), Decimal("-3")),
        (None, Decimal("-15")),
    ]

    assert replay._band_score(Decimal("10"), bands) == 1
    assert replay._band_score(Decimal("3"), bands) == 2
    assert replay._band_score(Decimal("-3"), bands) == 3
    assert replay._band_score(Decimal("-15"), bands) == 4
    assert replay._band_score(Decimal("-15.01"), bands) == 5


def test_pms_grade_preserves_legacy_boundary_gaps() -> None:
    assert replay._legacy_pms_grade(Decimal("59")) == "A"
    assert replay._legacy_pms_grade(Decimal("60")) == "N"
    assert replay._legacy_pms_grade(Decimal("61")) == "B"
    assert replay._legacy_pms_grade(Decimal("91")) == "N"
    assert replay._legacy_pms_grade(Decimal("92")) == "C"
    assert replay._legacy_pms_grade(Decimal("180")) == "N"
    assert replay._legacy_pms_grade(Decimal("181")) == "E"


def test_java_style_rounding_is_half_up() -> None:
    assert replay._round_decimal(Decimal("84.5"), 0) == Decimal("85")
    assert replay._round_decimal(Decimal("84.44"), 1) == Decimal("84.4")
    assert replay._round_decimal(Decimal("84.45"), 1) == Decimal("84.5")
