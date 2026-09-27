import re


def normalize_text(text):
    """
    Convert text into a normalized lowercase string.
    """

    if text is None:
        return ""

    return str(text).lower().strip()


def contains_any(text, keywords):
    """
    Check whether any keyword exists in the text.
    """

    text = normalize_text(text)

    for keyword in keywords:

        if normalize_text(keyword) in text:
            return True

    return False


def extract_income_limit(text):
    """
    Try to extract an annual income limit from eligibility text.

    This handles common formats such as:
    2.5 lakh
    2 lakh
    Rs. 250000
    ₹2,50,000
    250000
    """

    text = normalize_text(text)

    patterns = [

        r"(?:rs\.?|₹)\s*([\d,]+)\s*(?:per year|annually|annual)?",

        r"([\d.]+)\s*lakh",

        r"([\d.]+)\s*lakhs",

        r"income.*?([\d,]+)"
    ]

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text
        )

        if not matches:
            continue

        value = matches[0]

        try:

            value = value.replace(
                ",",
                ""
            )

            # Handle lakh format
            if "lakh" in pattern:

                return float(value) * 100000

            return float(value)

        except ValueError:

            continue

    return None


def check_course(student, scholarship_text):
    """
    Check whether the student's course appears compatible.
    """

    course = normalize_text(
        student.get("course", "")
    )

    if not course:
        return True, "Course information provided"

    technical_courses = [
        "engineering",
        "computer science",
        "technology",
        "diploma"
    ]

    if course in technical_courses:

        if contains_any(
            scholarship_text,
            [
                "technical",
                "engineering",
                "technology",
                "degree",
                "diploma"
            ]
        ):

            return True, "Course appears compatible"

    if contains_any(
        scholarship_text,
        [
            course
        ]
    ):

        return True, "Course appears compatible"

    # General scholarships may apply to many courses
    if contains_any(
        scholarship_text,
        [
            "all students",
            "students",
            "undergraduate",
            "degree"
        ]
    ):

        return True, "Scholarship appears open to students"

    return False, "Course eligibility could not be confirmed"


def check_gender(student, scholarship_text):
    """
    Check gender-specific eligibility.
    """

    gender = normalize_text(
        student.get("gender", "")
    )

    female_keywords = [
        "girl students",
        "female students",
        "women",
        "woman",
        "girls"
    ]

    if gender == "female":

        if contains_any(
            scholarship_text,
            female_keywords
        ):

            return True, "Female-specific eligibility found"

        return True, "No conflicting gender restriction found"

    # Male / Other
    if contains_any(
        scholarship_text,
        female_keywords
    ):

        return False, "Scholarship appears to have a female-specific requirement"

    return True, "No conflicting gender restriction found"


def check_category(student, scholarship_text):
    """
    Check social/economic category requirements.
    """

    category = normalize_text(
        student.get("category", "")
    )

    if not category:

        return True, "Category information provided"

    category_keywords = {

        "sc": [
            "scheduled caste",
            "sc students"
        ],

        "st": [
            "scheduled tribe",
            "st students"
        ],

        "obc": [
            "obc",
            "other backward"
        ],

        "ews": [
            "ews",
            "economically weaker"
        ],

        "minority": [
            "minority"
        ],

        "general": [
            "general",
            "all students"
        ]
    }

    keywords = category_keywords.get(
        category,
        [category]
    )

    # If scholarship explicitly mentions another restricted category
    restricted_categories = [
        "scheduled caste",
        "scheduled tribe",
        "obc",
        "minority",
        "ews"
    ]

    if category == "general":

        if contains_any(
            scholarship_text,
            restricted_categories
        ):

            return False, "Scholarship may have category-specific eligibility"

        return True, "No conflicting category restriction found"

    if contains_any(
        scholarship_text,
        keywords
    ):

        return True, "Category requirement appears compatible"

    # Don't automatically reject when category is not mentioned
    return True, "Category requirement needs verification"


def check_income(student, scholarship_text):
    """
    Compare student income with an income limit when one
    can be extracted from the scholarship text.
    """

    try:

        income = float(
            student.get(
                "income",
                0
            )
        )

    except (
        ValueError,
        TypeError
    ):

        return True, "Income could not be evaluated"

    income_limit = extract_income_limit(
        scholarship_text
    )

    if income_limit is None:

        return True, "No clear income limit found"

    if income <= income_limit:

        return True, "Family income appears within the stated limit"

    return False, "Family income appears above the stated limit"


def check_state(student, scholarship_text):
    """
    Check whether scholarship appears applicable
    to the student's state.
    """

    state = normalize_text(
        student.get("state", "")
    )

    if not state:

        return True, "State information provided"

    if contains_any(
        scholarship_text,
        [
            "all india",
            "across india",
            "india",
            "any state"
        ]
    ):

        return True, "Scholarship appears applicable across India"

    if state in scholarship_text:

        return True, "State appears eligible"

    # If no state restriction is found, don't reject
    return True, "State eligibility needs verification"


def check_disability(student, scholarship_text):
    """
    Check disability-specific eligibility.
    """

    disability = normalize_text(
        student.get("disability", "")
    )

    disability_keywords = [
        "disability",
        "disabled",
        "specially abled",
        "pwd",
        "persons with disabilities"
    ]

    if disability == "yes":

        if contains_any(
            scholarship_text,
            disability_keywords
        ):

            return True, "Disability-specific eligibility found"

        return True, "No conflicting disability restriction found"

    if contains_any(
        scholarship_text,
        [
            "only for persons with disabilities",
            "only for disabled",
            "specially abled students only"
        ]
    ):

        return False, "Scholarship appears restricted to students with disabilities"

    return True, "No conflicting disability restriction found"


def analyze_eligibility(student, scholarship):
    """
    Analyze a student's eligibility against one scholarship.

    Returns:
        eligibility_status
        eligibility_score
        reasons
        warnings
    """

    scholarship_text = " ".join(
        [
            str(scholarship.get("name", "")),
            str(scholarship.get("description", "")),
            str(scholarship.get("eligibility_text", "")),
            str(scholarship.get("type", ""))
        ]
    )

    checks = [

        check_course(
            student,
            scholarship_text
        ),

        check_gender(
            student,
            scholarship_text
        ),

        check_category(
            student,
            scholarship_text
        ),

        check_income(
            student,
            scholarship_text
        ),

        check_state(
            student,
            scholarship_text
        ),

        check_disability(
            student,
            scholarship_text
        )
    ]

    passed = 0
    reasons = []
    warnings = []

    for result, message in checks:

        if result:

            passed += 1
            reasons.append(message)

        else:

            warnings.append(message)

    total_checks = len(checks)

    eligibility_score = round(
        (passed / total_checks) * 100
    )

    # Status
    if eligibility_score >= 85 and not warnings:

        status = "Highly Recommended"

    elif eligibility_score >= 65:

        status = "Good Match"

    else:

        status = "Needs Verification"

    return {
        "eligibility_status": status,
        "eligibility_score": eligibility_score,
        "reasons": reasons,
        "warnings": warnings
    }