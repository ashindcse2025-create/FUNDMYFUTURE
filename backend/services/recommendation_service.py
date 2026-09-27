import random

from sklearn.ensemble import RandomForestRegressor

from services.eligibility_engine import analyze_eligibility
# ---------------------------------------------------------
# Helper function
# ---------------------------------------------------------

def contains_any(text, keywords):
    """
    Check whether any keyword exists in the given text.
    """
    text = str(text).lower()

    return any(
        keyword.lower() in text
        for keyword in keywords
    )


# ---------------------------------------------------------
# Feature Extraction
# ---------------------------------------------------------

def extract_features(student, scholarship):
    """
    Convert student profile + scholarship information
    into numerical features for the ML model.
    """

    name = scholarship.get("name", "")
    description = scholarship.get("description", "")
    eligibility = scholarship.get("eligibility_text", "")
    scholarship_type = scholarship.get("type", "")

    scholarship_text = (
        f"{name} "
        f"{description} "
        f"{eligibility} "
        f"{scholarship_type}"
    ).lower()

    features = []

    # -----------------------------------------------------
    # 1. Course match
    # -----------------------------------------------------

    course = student.get("course", "").lower()

    course_match = contains_any(
        scholarship_text,
        [course]
    )

    features.append(
        1 if course_match else 0
    )

    # -----------------------------------------------------
    # 2. Technical / Engineering match
    # -----------------------------------------------------

    technical_match = (
        course in [
            "engineering",
            "computer science",
            "technology"
        ]
        and contains_any(
            scholarship_text,
            [
                "technical",
                "engineering",
                "degree",
                "technology"
            ]
        )
    )

    features.append(
        1 if technical_match else 0
    )

    # -----------------------------------------------------
    # 3. Year match
    # -----------------------------------------------------

    year = student.get("year", "").lower()

    year_match = contains_any(
        scholarship_text,
        [year]
    )

    features.append(
        1 if year_match else 0
    )

    # -----------------------------------------------------
    # 4. Undergraduate / Degree match
    # -----------------------------------------------------

    undergraduate_match = contains_any(
        scholarship_text,
        [
            "undergraduate",
            "degree",
            "bachelor",
            "graduation"
        ]
    )

    features.append(
        1 if undergraduate_match else 0
    )

    # -----------------------------------------------------
    # 5. Gender match
    # -----------------------------------------------------

    gender = student.get("gender", "").lower()

    if gender == "female":

        gender_match = contains_any(
            scholarship_text,
            [
                "girl",
                "female",
                "women",
                "woman"
            ]
        )

    else:

        gender_match = not contains_any(
            scholarship_text,
            [
                "girl students",
                "female students",
                "women only"
            ]
        )

    features.append(
        1 if gender_match else 0
    )

    # -----------------------------------------------------
    # 6. Category match
    # -----------------------------------------------------

    category = student.get(
        "category",
        ""
    ).lower()

    category_keywords = {

        "sc": [
            "sc",
            "scheduled caste"
        ],

        "st": [
            "st",
            "scheduled tribe"
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

    category_match = contains_any(
        scholarship_text,
        keywords
    )

    features.append(
        1 if category_match else 0
    )

    # -----------------------------------------------------
    # 7. Income feature
    # -----------------------------------------------------

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

        income = 0

    # Normalize income between 0 and 1
    income_normalized = min(
        income / 1000000,
        1
    )

    features.append(
        income_normalized
    )

    # -----------------------------------------------------
    # 8. Income eligibility mention
    # -----------------------------------------------------

    income_requirement = contains_any(
        scholarship_text,
        [
            "income",
            "family income",
            "annual income"
        ]
    )

    features.append(
        1 if income_requirement else 0
    )

    # -----------------------------------------------------
    # 9. State match
    # -----------------------------------------------------

    state = student.get(
        "state",
        ""
    ).lower()

    state_match = contains_any(
        scholarship_text,
        [
            state,
            "all india",
            "india",
            "any state"
        ]
    )

    features.append(
        1 if state_match else 0
    )

    # -----------------------------------------------------
    # 10. Disability match
    # -----------------------------------------------------

    disability = student.get(
        "disability",
        ""
    ).lower()

    if disability == "yes":

        disability_match = contains_any(
            scholarship_text,
            [
                "disab",
                "specially abled",
                "pwd",
                "persons with disabilities"
            ]
        )

    else:

        disability_match = True

    features.append(
        1 if disability_match else 0
    )

    return features


# ---------------------------------------------------------
# Baseline Scoring
# ---------------------------------------------------------

def baseline_score(features):
    """
    Generate a baseline score used as a weak training label.

    This is not a real eligibility probability.
    """

    weights = [
        20,  # Course
        15,  # Technical
        15,  # Year
        10,  # Undergraduate
        15,  # Gender
        15,  # Category
        5,   # Income
        3,   # Income requirement
        5,   # State
        2    # Disability
    ]

    score = 0

    for feature, weight in zip(
        features,
        weights
    ):

        if feature == 1:

            score += weight

        elif feature > 0:

            score += feature * weight

    return min(
        score,
        100
    )


# ---------------------------------------------------------
# Train Random Forest Model
# ---------------------------------------------------------

def train_model(scholarships):
    """
    Train a Random Forest regression model.

    Synthetic student profiles are generated from the
    available scholarship records and baseline scores
    are used as weak training labels.
    """

    if not scholarships:
        return None

    courses = [
        "Engineering",
        "Computer Science",
        "Technology",
        "Medical",
        "Arts",
        "Science",
        "Commerce",
        "Diploma"
    ]

    years = [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ]

    genders = [
        "Female",
        "Male",
        "Other"
    ]

    categories = [
        "General",
        "OBC",
        "SC",
        "ST",
        "EWS",
        "Minority"
    ]

    states = [
        "Tamil Nadu",
        "Kerala",
        "Karnataka",
        "Andhra Pradesh",
        "Telangana",
        "Maharashtra"
    ]

    disabilities = [
        "Yes",
        "No"
    ]

    # Make training reproducible
    random.seed(42)

    X = []
    y = []

    # -----------------------------------------------------
    # Generate training data
    # -----------------------------------------------------

    for scholarship in scholarships:

        for _ in range(40):

            student = {

                "course": random.choice(
                    courses
                ),

                "year": random.choice(
                    years
                ),

                "gender": random.choice(
                    genders
                ),

                "category": random.choice(
                    categories
                ),

                "income": random.randint(
                    50000,
                    800000
                ),

                "state": random.choice(
                    states
                ),

                "disability": random.choice(
                    disabilities
                )
            }

            features = extract_features(
                student,
                scholarship
            )

            label = baseline_score(
                features
            )

            X.append(
                features
            )

            y.append(
                label
            )

    # -----------------------------------------------------
    # Random Forest
    # -----------------------------------------------------

    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        max_depth=8
    )

    model.fit(
        X,
        y
    )

    return model


# ---------------------------------------------------------
# Recommendation Function
# ---------------------------------------------------------

def recommend_scholarships(
    student,
    scholarships
):
    """
    Generate scholarship recommendations using:

    1. Eligibility analysis
    2. Random Forest ranking

    The eligibility engine explains why a scholarship
    matches the student's profile.
    """

    if not scholarships:
        return []

    # Train the existing Random Forest model
    model = train_model(scholarships)

    if model is None:
        return []

    recommendations = []

    for scholarship in scholarships:

        # -------------------------------------------------
        # Step 1: Analyze actual scholarship eligibility
        # -------------------------------------------------

        eligibility = analyze_eligibility(
            student,
            scholarship
        )

        # -------------------------------------------------
        # Step 2: Extract ML features
        # -------------------------------------------------

        features = extract_features(
            student,
            scholarship
        )

        # -------------------------------------------------
        # Step 3: Get Random Forest prediction
        # -------------------------------------------------

        prediction = model.predict(
            [features]
        )[0]

        ml_score = max(
            0,
            min(
                100,
                round(prediction)
            )
        )

        # -------------------------------------------------
        # Step 4: Combine ML score + eligibility score
        # -------------------------------------------------

        final_score = round(
            (ml_score * 0.60)
            +
            (eligibility["eligibility_score"] * 0.40)
        )

        final_score = max(
            0,
            min(
                100,
                final_score
            )
        )

        # -------------------------------------------------
        # Step 5: Create recommendation result
        # -------------------------------------------------

        recommendations.append({

            **scholarship,

            "match_score": final_score,

            "eligibility_status":
                eligibility["eligibility_status"],

            "eligibility_score":
                eligibility["eligibility_score"],

            "match_reasons":
                eligibility["reasons"],

            "eligibility_warnings":
                eligibility["warnings"]
        })

    # -----------------------------------------------------
    # Sort highest match first
    # -----------------------------------------------------

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return recommendations