import re

import requests

from bs4 import BeautifulSoup, Comment

from urllib.parse import urljoin

from utils.database import scholarships_collection


NSP_URL = "https://scholarships.gov.in/All-Scholarships"


def clean_text(text):
    if not text:
        return ""

    return " ".join(text.split()).strip()


def canonical_name(name):
    """
    Creates a consistent name for duplicate protection.
    """

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

    seen = set()

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

        if key in seen:
            continue

        seen.add(key)

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

            href = link.get(
                "href",
                ""
            ).strip()

            if not href:
                continue

            if href.lower() in ["null", "/null"]:
                continue

            link_url = urljoin(
                NSP_URL,
                href
            )

            if link_text == "specifications":
                specification_url = link_url

            elif link_text == "faq":
                faq_url = link_url

        scholarship = {
            "name": name,
            "canonical_name": key,
            "provider": extract_department(row),
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


def refresh_database(nsp_scholarships):

    existing_records = list(
        scholarships_collection.find({})
    )

    existing_map = {}

    for record in existing_records:

        key = record.get(
            "canonical_name"
        )

        if not key:
            key = canonical_name(
                record.get("name", "")
            )

        if key:
            existing_map[key] = record

    inserted = 0
    updated = 0
    unchanged = 0

    for scholarship in nsp_scholarships:

        key = scholarship["canonical_name"]

        if not key:
            continue

        existing = existing_map.get(key)

        if existing:

            update_fields = {
                "name": scholarship["name"],
                "canonical_name": key,
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

            for field, value in update_fields.items():

                if value and existing.get(field) != value:
                    changes[field] = value

            if changes:

                scholarships_collection.update_one(
                    {"_id": existing["_id"]},
                    {"$set": changes}
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
    print("FundMyFuture - NSP DATABASE REFRESH")
    print("=" * 70)

    print("\nFetching official NSP page...")

    try:

        html = fetch_nsp_page()

    except requests.RequestException as error:

        print("\nERROR: Unable to fetch NSP page.")
        print(error)
        print("\nMongoDB was NOT modified.")

        return

    print("NSP page fetched successfully.")

    print(
        "HTML length:",
        len(html)
    )

    print(
        "\nExtracting current NSP scholarships..."
    )

    scholarships = extract_scholarships(
        html
    )

    print(
        "Scholarships discovered:",
        len(scholarships)
    )

    if len(scholarships) == 0:

        print(
            "\nERROR: No scholarships discovered."
        )

        print(
            "MongoDB was NOT modified."
        )

        return

    print("\nRefreshing MongoDB...")

    inserted, updated, unchanged = refresh_database(
        scholarships
    )

    total = scholarships_collection.count_documents({})

    print("\n" + "=" * 70)
    print("NSP REFRESH COMPLETED")
    print("=" * 70)

    print(
        "\nNew scholarships inserted:",
        inserted
    )

    print(
        "Existing scholarships updated:",
        updated
    )

    print(
        "Already up-to-date:",
        unchanged
    )

    print(
        "Total scholarships in MongoDB:",
        total
    )

    print("\nOfficial source:")
    print(NSP_URL)


if __name__ == "__main__":
    main()