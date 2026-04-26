from __future__ import annotations

import csv
import random
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data_sample"
random.seed(20260426)


@dataclass(frozen=True)
class Company:
    company_id: str
    name: str
    channel: str
    risk_grade: str


COMPANIES = [
    Company("C001", "A 커머스", "자사몰", "A"),
    Company("C002", "B 리테일", "오픈마켓", "B"),
    Company("C003", "C 스토어", "라이브", "C"),
    Company("C004", "D 마켓", "오픈마켓", "B"),
    Company("C005", "E 셀렉트", "자사몰", "A"),
]

PRODUCTS = ["생활용품", "패션잡화", "식품", "디지털", "뷰티"]
START = date(2026, 1, 1)


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def generate_companies() -> list[dict[str, object]]:
    return [
        {
            "company_id": company.company_id,
            "company_name": company.name,
            "primary_channel": company.channel,
            "risk_grade": company.risk_grade,
            "settlement_cycle_days": {"A": 2, "B": 5, "C": 7}[company.risk_grade],
        }
        for company in COMPANIES
    ]


def generate_orders() -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    order_no = 10000
    for day_offset in range(180):
        order_date = START + timedelta(days=day_offset)
        for company in COMPANIES:
            daily_orders = random.randint(4, 16)
            for _ in range(daily_orders):
                gross_amount = random.randint(32_000, 420_000)
                cancel_flag = random.random() < 0.045
                return_flag = (not cancel_flag) and random.random() < 0.065
                fee_amount = int(gross_amount * random.uniform(0.025, 0.075))
                net_amount = 0 if cancel_flag else gross_amount - fee_amount
                rows.append(
                    {
                        "order_id": f"O{order_no}",
                        "company_id": company.company_id,
                        "order_date": order_date.isoformat(),
                        "channel": company.channel,
                        "product_category": random.choice(PRODUCTS),
                        "gross_amount": gross_amount,
                        "fee_amount": fee_amount,
                        "net_amount": net_amount,
                        "is_cancelled": cancel_flag,
                        "is_returned": return_flag,
                    }
                )
                order_no += 1
    return rows


def generate_settlements(orders: list[dict[str, object]]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    grouped: dict[tuple[str, str], int] = {}
    for order in orders:
        if order["is_cancelled"]:
            continue
        key = (str(order["company_id"]), str(order["order_date"])[:7])
        grouped[key] = grouped.get(key, 0) + int(order["net_amount"])

    for index, ((company_id, month), amount) in enumerate(sorted(grouped.items()), start=1):
        company = next(item for item in COMPANIES if item.company_id == company_id)
        scheduled_date = date.fromisoformat(f"{month}-25") + timedelta(
            days={"A": 2, "B": 5, "C": 7}[company.risk_grade]
        )
        delay_days = random.choice([0, 0, 0, 1, 2, 5 if company.risk_grade == "C" else 0])
        rows.append(
            {
                "settlement_id": f"S{index:05d}",
                "company_id": company_id,
                "settlement_month": month,
                "scheduled_date": scheduled_date.isoformat(),
                "expected_amount": amount,
                "delay_days": delay_days,
                "status": "지연" if delay_days >= 2 else "예정",
            }
        )
    return rows


def generate_risk_scores(settlements: list[dict[str, object]]) -> list[dict[str, object]]:
    rows = []
    for company in COMPANIES:
        company_settlements = [row for row in settlements if row["company_id"] == company.company_id]
        delayed = sum(1 for row in company_settlements if int(row["delay_days"]) >= 2)
        base_score = {"A": 88, "B": 74, "C": 62}[company.risk_grade]
        rows.append(
            {
                "company_id": company.company_id,
                "company_name": company.name,
                "risk_score": max(30, base_score - delayed * 3 + random.randint(-4, 4)),
                "delayed_settlement_count": delayed,
                "recommended_limit": random.randint(30, 140) * 1_000_000,
            }
        )
    return rows


def main() -> None:
    companies = generate_companies()
    orders = generate_orders()
    settlements = generate_settlements(orders)
    risk_scores = generate_risk_scores(settlements)

    write_csv(OUT_DIR / "companies.csv", companies)
    write_csv(OUT_DIR / "orders.csv", orders)
    write_csv(OUT_DIR / "settlements.csv", settlements)
    write_csv(OUT_DIR / "risk_scores.csv", risk_scores)
    print(f"Wrote sample data to {OUT_DIR}")


if __name__ == "__main__":
    main()
