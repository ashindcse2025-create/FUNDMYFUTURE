from utils.database import scholarships_collection


print("=" * 70)
print("FundMyFuture - Scholarship Database Verification")
print("=" * 70)

scholarships = list(
    scholarships_collection.find(
        {},
        {
            "_id": 0,
            "name": 1,
            "provider": 1,
            "application_start": 1,
            "application_end": 1
        }
    )
)

print("\nTotal scholarships:", len(scholarships))

print("\nScholarship names:")
print("-" * 70)

for index, scholarship in enumerate(scholarships, start=1):

    print(
        f"{index}. "
        f"{scholarship.get('name', 'NO NAME')}"
    )

print("\n" + "=" * 70)
print("Checking for suspicious names...")
print("=" * 70)

suspicious_words = [
    "scheme open from",
    "student application open till",
    "defective application verification",
    "specifications faq"
]

found = []

for scholarship in scholarships:

    name = scholarship.get("name", "").lower()

    for word in suspicious_words:

        if word in name:
            found.append(
                scholarship.get("name")
            )
            break


if found:

    print(
        "\nSuspicious records found:",
        len(found)
    )

    for name in found:
        print("-", name)

else:

    print(
        "\nNo suspicious scholarship names found."
    )


print("\n" + "=" * 70)
print("Verification completed.")
print("=" * 70)