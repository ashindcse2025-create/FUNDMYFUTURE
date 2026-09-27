import requests
from bs4 import BeautifulSoup, Comment
from urllib.parse import urljoin
import re


NSP_URL = "https://scholarships.gov.in/All-Scholarships"


def clean_text(text):
    """Clean unnecessary spaces and line breaks."""
    if not text:
        return ""

    return " ".join(text.split()).strip()


def fetch_nsp_page():
    """Fetch the official NSP scholarship page."""

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
    """Extract DD-MM-YYYY date."""

    match = re.search(
        r"\d{2}-\d{2}-\d{4}",
        text
    )

    if match:
        return match.group()

    return ""


def extract_department(row):
    """Extract department from NSP commented department heading."""

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
    """Determine broad scheme type."""

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
    """
    Check whether an h6 heading looks like an actual NSP scheme.
    """

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
    """
    Extract actual scholarship schemes from NSP.

    MongoDB is NOT modified here.
    """

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

        # Find the actual scholarship row
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

        name_key = name.lower()

        if name_key in seen_names:
            continue

        seen_names.add(name_key)

        # ---------------------------------------------
        # Application start / end
        # ---------------------------------------------

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

        # ---------------------------------------------
        # Official specification / FAQ
        # ---------------------------------------------

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

            # Ignore invalid "null" links
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

        # ---------------------------------------------
        # Department
        # ---------------------------------------------

        department = extract_department(row)

        # ---------------------------------------------
        # Type
        # ---------------------------------------------

        scheme_type = determine_scheme_type(
            name
        )

        # ---------------------------------------------
        # Final record
        # ---------------------------------------------

        scholarship = {
            "name": name,
            "provider": department,
            "type": scheme_type,
            "source": "National Scholarship Portal (NSP)",
            "source_url": NSP_URL,
            "official_url": specification_url,
            "faq_url": faq_url,
            "application_start": application_start,
            "application_end": application_end
        }

        scholarships.append(
            scholarship
        )

    return scholarships


def discover_scholarships():
    """
    Discover scholarships from official NSP.

    Discovery-only mode.
    MongoDB is NOT modified.
    """

    print("=" * 70)
    print("FundMyFuture - NSP Scholarship Discovery")
    print("=" * 70)

    print("\nFetching official NSP page...")

    try:
        html = fetch_nsp_page()

    except requests.RequestException as error:

        print("\nERROR: Unable to fetch NSP page.")
        print(error)

        return []

    print("NSP page fetched successfully.")
    print("HTML length:", len(html))

    scholarships = extract_scholarships(
        html
    )

    print(
        "\nActual scholarship entries discovered:",
        len(scholarships)
    )

    print("\n" + "-" * 70)

    for index, scholarship in enumerate(
        scholarships,
        start=1
    ):

        print(
            f"\n{index}. "
            f"{scholarship['name']}"
        )

        print(
            f"   Provider: "
            f"{scholarship['provider'] or 'Not available'}"
        )

        print(
            f"   Type: "
            f"{scholarship['type']}"
        )

        print(
            f"   Application Start: "
            f"{scholarship['application_start'] or 'Not available'}"
        )

        print(
            f"   Application End: "
            f"{scholarship['application_end'] or 'Not available'}"
        )

        print(
            f"   Specifications: "
            f"{scholarship['official_url'] or 'Not available'}"
        )

        print(
            f"   FAQ: "
            f"{scholarship['faq_url'] or 'Not available'}"
        )

    print("\n" + "-" * 70)

    print(
        "\nDISCOVERY MODE ONLY."
        "\nMongoDB was NOT modified."
    )

    return scholarships


if __name__ == "__main__":
    discover_scholarships()