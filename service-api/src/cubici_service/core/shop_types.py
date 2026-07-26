"""Shop type normalization helpers for migrated Cubici data."""

from fastapi import HTTPException


LEGACY_SHOP_TYPE_TO_CODE = {
    "1": "INTERPARK",
    "2": "GMARKET",
    "3": "AUCTION",
    "4": "STREET11",
    "11": "COUPANG",
    "14": "NAVER",
}

SHOP_TYPE_ALIASES = {
    "11ST": "STREET11",
    "STREET11": "STREET11",
    "GMARKET": "GMARKET",
    "G_MARKET": "GMARKET",
    "AUCTION": "AUCTION",
    "COUPANG": "COUPANG",
    "NAVER": "NAVER",
    "NAVERSELLER": "NAVER",
    "NAVER_SELLER": "NAVER",
    "INTERPARK": "INTERPARK",
}


def normalize_shop_type(value: str | None) -> str:
    cleaned = (value or "").strip().upper()
    if not cleaned:
        raise HTTPException(status_code=422, detail="shop_type is required")
    return LEGACY_SHOP_TYPE_TO_CODE.get(cleaned, SHOP_TYPE_ALIASES.get(cleaned, cleaned))


def normalize_shop_types(values: list[str]) -> list[str]:
    normalized: list[str] = []
    for value in values:
        shop_type = normalize_shop_type(value)
        if shop_type not in normalized:
            normalized.append(shop_type)
    return normalized


def build_shop_pair_clause(
    shop_pairs: str,
    *,
    shop_type_column: str = "shop_type",
    shop_id_column: str = "shop_id",
) -> tuple[str, list[object]]:
    if shop_pairs == "__none__":
        return "1 = 0", []

    pair_clauses: list[str] = []
    params: list[object] = []
    for raw_pair in shop_pairs.split(","):
        cleaned = raw_pair.strip()
        if not cleaned:
            continue
        if ":" not in cleaned:
            raise HTTPException(status_code=422, detail="shop_pairs must be SHOP_TYPE:SHOP_ID")
        shop_type, shop_id = cleaned.split(":", 1)
        shop_type = normalize_shop_type(shop_type)
        shop_id = shop_id.strip()
        if not shop_id:
            raise HTTPException(status_code=422, detail="shop_pairs must be SHOP_TYPE:SHOP_ID")
        pair_clauses.append(f"(upper({shop_type_column}) = %s and {shop_id_column} = %s)")
        params.extend([shop_type, shop_id])

    if not pair_clauses:
        return "1 = 0", []
    return "(" + " or ".join(pair_clauses) + ")", params
