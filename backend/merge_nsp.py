import os
import re
import json
import requests
from bs4 import BeautifulSoup, Comment
from urllib.parse import urljoin

from utils.database import scholarships_collection


NSP_URL = "https://scholarships.gov.in/All-Scholarships"
BACKUP_FILE = "scholarship_backup_before_nsp_merge.json"


def clean_text(text):
    if not text:
        return ""

    return " ".join(text.split()).strip()


def canonical_name(name):
    """
    Create a comparison name so small NSP naming differences
    do not create duplicate scholarships.
    """

    if not name:
        return ""

    name = clean_text(name).lower()

    # Remove only the NSP classification suffixes.
    name = re.sub(
        r"\s*\((merit based scheme|welfare based scheme)\)\s*$",
        "",
        name,
        flags=re.IGNORECASE
    )

    # Normalize spaces around brackets.
    name = re.sub(r"\s+", " ", name)

    return name.strip()


def fetch_nsp_page():

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/140.0 Safari/537.36"
        )
    }

    response = requests.get(
        NSP_URL,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    return response.text


def extract_date(text):

    match = re.search(
        r"\d{2}-\d{2}-\d{4}",
        text
    )

    if match:
        return match.group()

    return ""


def extract_department(row):

    comments = row.find_all(
        string=lambda text: isinstance(text, Comment)
    )

    for comment in comments:

        comment_text = str(comment)

        match = re.search(
            r"<h6>\s*by\s+(.*?)</h6>",
            comment_text,
            re.IGNORECASE | re.DOTALL
        )

        if match:
            return clean_text(match.group(1))

    return ""


def determine_scheme_type(name):

    lower_name = name.lower()

    if "junior research fellowship" in lower_name:
        return "Fellowship"

    if "senior research fellowship" in lower_name:
        return "Fellowship"

    if "fellowship" in lower_name:
        return "Fellowship"

    if "stipend" in lower_name:
        return "Stipend"

    if "financial assistance" in lower_name:
        return "Financial Assistance"

    if "financial support" in lower_name:
        return "Financial Support"

    return "Scholarship"


def is_scheme_heading(name):

    lower_name = name.lower()

    keywords = [
        "scholarship",
        "fellowship",
        "stipend",
        "financial assistance",
        "financial support",
        "pragati",
        "saksham",
        "swanath",
        "yasasvi",
        "ishan uday",
        "pm-usp",
        "talent",
        "coaching",
        "education",
        "merit"
    ]

    return any(
        keyword in lower_name
        for keyword in keywords
    )


def extract_scholarships(html):

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    scholarships = []
    seen_names = set()

    for heading in soup.find_all("h6"):

        name = clean_text(
            heading.get_text(
                " ",
                strip=True
            )
        )

        if not name:
            continue

        if not is_scheme_heading(name):
            continue

        row = heading.find_parent(
            "div",
            class_=lambda classes: (
                classes
                and "row" in classes
                and "mb-4" in classes
            )
        )

        if row is None:
            continue

        key = canonical_name(name)

        if key in seen_names:
            continue

        seen_names.add(key)

        application_start = ""
        application_end = ""

        for span in row.find_all("span"):

            span_text = clean_text(
                span.get_text(
                    " ",
                    strip=True
                )
            )

            lower_span = span_text.lower()

            if (
                "scheme open from" in lower_span
                and "student application" not in lower_span
            ):
                application_start = extract_date(
                    span_text
                )

            elif "student application" in lower_span:
                application_end = extract_date(
                    span_text
                )

        specification_url = ""
        faq_url = ""

        for link in row.find_all(
            "a",
            href=True
        ):

            link_text = clean_text(
                link.get_text(
                    " ",
                    strip=True
                )
            ).lower()

            href = link.get("href", "").strip()

            if not href:
                continue

            if href.lower() in [
                "null",
                "/null"
            ]:
                continue

            link_url = urljoin(
                NSP_URL,
                href
            )

            if link_text == "specifications":
                specification_url = link_url

            elif link_text == "faq":
                faq_url = link_url

        department = extract_department(row)

        scholarship = {
            "name": name,
            "provider": department,
            "type": determine_scheme_type(name),
            "source": "National Scholarship Portal (NSP)",
            "source_url": NSP_URL,
            "official_url": specification_url,
            "faq_url": faq_url,
            "application_start": application_start,
            "application_end": application_end
        }

        scholarships.append(scholarship)

    return scholarships


def create_backup():

    existing = list(
        scholarships_collection.find(
            {},
            {"_id": 0}
        )
    )

    with open(
        BACKUP_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            existing,
            file,
            indent=2,
            ensure_ascii=False
        )

    return len(existing)


def merge_scholarships(nsp_scholarships):

    existing_records = list(
        scholarships_collection.find({})
    )

    existing_map = {}

    for record in existing_records:

        key = canonical_name(
            record.get("name", "")
        )

        if key:
            existing_map[key] = record

    inserted = 0
    updated = 0
    unchanged = 0

    for scholarship in nsp_scholarships:

        key = canonical_name(
            scholarship["name"]
        )

        if not key:
            continue

        existing = existing_map.get(key)

        if existing:

            update_data = {
                "name": scholarship["name"],
                "provider": scholarship["provider"],
                "type": scholarship["type"],
                "source": scholarship["source"],
                "source_url": scholarship["source_url"],
                "official_url": scholarship["official_url"],
                "faq_url": scholarship["faq_url"],
                "application_start": scholarship["application_start"],
                "application_end": scholarship["application_end"]
            }

            changes = {}

            for field, value in update_data.items():

                if value and existing.get(field) != value:
                    changes[field] = value

            if changes:

                scholarships_collection.update_one(
                    {
                        "_id": existing["_id"]
                    },
                    {
                        "$set": changes
                    }
                )

                updated += 1

            else:
                unchanged += 1

        else:

            scholarships_collection.insert_one(
                scholarship
            )

            existing_map[key] = scholarship

            inserted += 1

    return inserted, updated, unchanged


def main():

    print("=" * 70)
    print("FundMyFuture - SAFE NSP DATABASE MERGE")
    print("=" * 70)

    print("\nStep 1: Creating backup...")

    backup_count = create_backup()

    print(
        f"Backup created successfully: "
        f"{backup_count} existing scholarships"
    )

    print(
        f"Backup file: {BACKUP_FILE}"
    )

    print("\nStep 2: Fetching official NSP page...")

    try:

        html = fetch_nsp_page()

    except requests.RequestException as error:

        print("\nERROR: Unable to fetch NSP page.")
        print(error)

        print(
            "\nMongoDB was NOT modified."
        )

        return

    print(
        "NSP page fetched successfully."
    )

    print(
        "HTML length:",
        len(html)
    )

    print("\nStep 3: Extracting scholarships...")

    nsp_scholarships = extract_scholarships(
        html
    )

    print(
        "NSP scholarships discovered:",
        len(nsp_scholarships)
    )

    print("\nStep 4: Merging with MongoDB...")

    inserted, updated, unchanged = merge_scholarships(
        nsp_scholarships
    )

    total = scholarships_collection.count_documents({})

    print("\n" + "=" * 70)
    print("MERGE COMPLETED")
    print("=" * 70)

    print(
        f"\nNew scholarships inserted : {inserted}"
    )

    print(
        f"Existing scholarships updated : {updated}"
    )

    print(
        f"Already up-to-date : {unchanged}"
    )

    print(
        f"Total scholarships in MongoDB : {total}"
    )

    print(
        f"\nBackup available at:"
        f"\n{os.path.abspath(BACKUP_FILE)}"
    )

    print(
        "\nExisting scholarships were preserved."
    )


if __name__ == "__main__":
    main()