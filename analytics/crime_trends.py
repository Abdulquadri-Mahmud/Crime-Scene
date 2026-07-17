"""
Crime trend analytics utility.

Runs independently of the main API so a slow report or a bug in the analytics
code can never affect the live report-submission/tracking flow used by the
public. Intended to be run on-demand or via a scheduled job (cron) to produce
a monthly summary for law-enforcement administrators.

Usage:
    pip install -r requirements.txt
    python crime_trends.py --mongo-uri "mongodb+srv://.../crime_reporting_db" --out trends.csv

If --mongo-uri is omitted, the MONGO_URI environment variable is used.
"""

import argparse
import csv
import os
import sys
from collections import Counter, defaultdict
from datetime import datetime

try:
    from pymongo import MongoClient
except ImportError:
    print("pymongo is not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser(description="Summarize crime report trends from MongoDB.")
    parser.add_argument(
        "--mongo-uri",
        default=os.environ.get("MONGO_URI"),
        help="MongoDB connection string (defaults to the MONGO_URI environment variable).",
    )
    parser.add_argument(
        "--db-name",
        default=os.environ.get("MONGO_DB_NAME", "crime_reporting_db"),
        help="Database name (default: crime_reporting_db).",
    )
    parser.add_argument(
        "--out",
        default="crime_trends_report.csv",
        help="Path to write the CSV summary (default: crime_trends_report.csv).",
    )
    return parser.parse_args()


def fetch_reports(mongo_uri: str, db_name: str):
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=8000)
    db = client[db_name]
    # Only pull the fields we actually need — avoids hauling full descriptions
    # and evidence file lists across the network for a numbers-only report.
    projection = {
        "incident.type": 1,
        "incident.location.area": 1,
        "status": 1,
        "createdAt": 1,
    }
    return list(db.reports.find({}, projection))


def summarize(reports):
    by_type = Counter()
    by_area = Counter()
    by_month = Counter()
    by_status = Counter()
    by_type_and_month = defaultdict(Counter)

    for r in reports:
        incident = r.get("incident", {})
        crime_type = incident.get("type", "Unknown")
        area = (incident.get("location") or {}).get("area") or "Unspecified"
        status = r.get("status", "unknown")
        created = r.get("createdAt")

        month_key = "Unknown"
        if isinstance(created, datetime):
            month_key = created.strftime("%Y-%m")

        by_type[crime_type] += 1
        by_area[area] += 1
        by_month[month_key] += 1
        by_status[status] += 1
        by_type_and_month[crime_type][month_key] += 1

    return {
        "by_type": by_type,
        "by_area": by_area,
        "by_month": by_month,
        "by_status": by_status,
        "by_type_and_month": by_type_and_month,
        "total": len(reports),
    }


def write_csv(summary, out_path):
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        writer.writerow(["Crime Reporting System — Trend Summary"])
        writer.writerow(["Generated at", datetime.utcnow().isoformat() + "Z"])
        writer.writerow(["Total reports", summary["total"]])
        writer.writerow([])

        writer.writerow(["Reports by incident type"])
        writer.writerow(["Type", "Count"])
        for crime_type, count in summary["by_type"].most_common():
            writer.writerow([crime_type, count])
        writer.writerow([])

        writer.writerow(["Reports by area"])
        writer.writerow(["Area", "Count"])
        for area, count in summary["by_area"].most_common():
            writer.writerow([area, count])
        writer.writerow([])

        writer.writerow(["Reports by month"])
        writer.writerow(["Month", "Count"])
        for month, count in sorted(summary["by_month"].items()):
            writer.writerow([month, count])
        writer.writerow([])

        writer.writerow(["Reports by status"])
        writer.writerow(["Status", "Count"])
        for status, count in summary["by_status"].most_common():
            writer.writerow([status, count])


def main():
    args = parse_args()

    if not args.mongo_uri:
        print(
            "No MongoDB connection string provided. Pass --mongo-uri or set MONGO_URI.",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        reports = fetch_reports(args.mongo_uri, args.db_name)
    except Exception as exc:  # noqa: BLE001 - surface any connection/auth error clearly
        print(f"Failed to read from MongoDB: {exc}", file=sys.stderr)
        sys.exit(1)

    summary = summarize(reports)
    write_csv(summary, args.out)

    print(f"Analyzed {summary['total']} reports.")
    print(f"Summary written to: {args.out}")


if __name__ == "__main__":
    main()
