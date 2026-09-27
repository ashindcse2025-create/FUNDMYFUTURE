from utils.database import scholarships_collection


print("=" * 70)
print("FundMyFuture - Scholarship Database Cleanup")
print("=" * 70)

scholarships = list(
    scholarships_collection.find({})
)

removed = 0

for scholarship in scholarships:

    name = scholarship.get("name", "")

    if "Scheme Open from" in name:

        print("\nRemoving malformed record:")
        print(name)

        scholarships_collection.delete_one(
            {
                "_id": scholarship["_id"]
            }
        )

        removed += 1


print("\n" + "=" * 70)
print("CLEANUP COMPLETED")
print("=" * 70)

print(
    "\nMalformed records removed:",
    removed
)

print(
    "Total scholarships remaining:",
    scholarships_collection.count_documents({})
)