from collections import Counter

from utils.database import scholarships_collection


def canonical_name(name):
    """
    Creates a stable name used to prevent duplicate scholarships.
    Only removes NSP display suffixes that we already handle
    in the refresh process.
    """
    name = str(name or "").strip()

    suffixes = [
        "(Merit Based Scheme)",
        "(Welfare Based Scheme)",
    ]

    changed = True

    while changed:
        changed = False

        for suffix in suffixes:
            if name.endswith(suffix):
                name = name[:-len(suffix)].strip()
                changed = True

    return name.lower()


print("=" * 60)
print("FundMyFuture - SCHOLARSHIP DUPLICATE PROTECTION")
print("=" * 60)

scholarships = list(
    scholarships_collection.find(
        {},
        {
            "_id": 1,
            "name": 1
        }
    )
)

print(f"Scholarships found: {len(scholarships)}")

# ---------------------------------------------------------
# STEP 1: Calculate canonical names
# ---------------------------------------------------------

canonical_names = []

for scholarship in scholarships:
    name = scholarship.get("name", "")
    canonical = canonical_name(name)

    canonical_names.append(canonical)

# ---------------------------------------------------------
# STEP 2: Check for duplicates BEFORE changing anything
# ---------------------------------------------------------

counter = Counter(canonical_names)

duplicates = {
    name: count
    for name, count in counter.items()
    if count > 1
}

if duplicates:
    print()
    print("WARNING: Duplicate canonical scholarship names found!")
    print()

    for name, count in duplicates.items():
        print(f"{count} copies -> {name}")

    print()
    print("NO DATABASE CHANGES WERE MADE.")
    print("Resolve these duplicates before creating the unique index.")

    raise SystemExit(1)

print("Canonical duplicate check: PASSED")

# ---------------------------------------------------------
# STEP 3: Add canonical_name to existing documents
# ---------------------------------------------------------

updated = 0

for scholarship in scholarships:
    scholarship_id = scholarship["_id"]
    name = scholarship.get("name", "")
    canonical = canonical_name(name)

    result = scholarships_collection.update_one(
        {"_id": scholarship_id},
        {
            "$set": {
                "canonical_name": canonical
            }
        }
    )

    if result.modified_count > 0:
        updated += 1

print(f"Canonical names added/updated: {updated}")

# ---------------------------------------------------------
# STEP 4: Create database-level unique index
# ---------------------------------------------------------

index_name = scholarships_collection.create_index(
    [("canonical_name", 1)],
    unique=True,
    name="scholarship_canonical_name_unique"
)

print()
print("Unique index created successfully.")
print(f"Index name: {index_name}")

# ---------------------------------------------------------
# FINAL CHECK
# ---------------------------------------------------------

indexes = scholarships_collection.index_information()

print()
print("Database indexes:")

for name in indexes:
    print(f"- {name}")

print()
print("=" * 60)
print("DUPLICATE PROTECTION ENABLED")
print("=" * 60)