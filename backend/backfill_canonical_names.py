import re

from utils.database import scholarships_collection


def clean_text(text):
    if not text:
        return ""

    return " ".join(text.split()).strip()


def canonical_name(name):
    if not name:
        return ""

    name = clean_text(name).lower()

    name = re.sub(
        r"\s*\(?(merit based scheme|welfare based scheme)\)?\s*$",
        "",
        name,
        flags=re.IGNORECASE
    )

    name = re.sub(r"\s+", " ", name)

    return name.strip()


print("=" * 60)
print("FundMyFuture - BACKFILL CANONICAL NAMES")
print("=" * 60)

scholarships = list(
    scholarships_collection.find(
        {},
        {
            "_id": 1,
            "name": 1,
            "canonical_name": 1
        }
    )
)

print("Scholarships found:", len(scholarships))

updated = 0
skipped = 0

for scholarship in scholarships:

    name = scholarship.get("name", "")
    canonical = canonical_name(name)

    if not canonical:
        print(
            "WARNING: Empty canonical name:",
            name
        )
        skipped += 1
        continue

    if scholarship.get("canonical_name") == canonical:
        skipped += 1
        continue

    scholarships_collection.update_one(
        {"_id": scholarship["_id"]},
        {
            "$set": {
                "canonical_name": canonical
            }
        }
    )

    updated += 1


print()
print("Canonical names added:", updated)
print("Already correct/skipped:", skipped)

total = scholarships_collection.count_documents({})

with_canonical = scholarships_collection.count_documents(
    {
        "canonical_name": {
            "$exists": True
        }
    }
)

print()
print("Total scholarships:", total)
print("With canonical_name:", with_canonical)

print()
print("=" * 60)
print("BACKFILL COMPLETED")
print("=" * 60)