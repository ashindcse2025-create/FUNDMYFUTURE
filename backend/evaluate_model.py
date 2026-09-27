import random

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score

from services.recommendation_service import (
    extract_features,
    baseline_score
)

from utils.database import scholarships_collection


# ---------------------------------------------------------
# Load scholarships
# ---------------------------------------------------------

scholarships = list(
    scholarships_collection.find(
        {},
        {"_id": 0}
    )
)

print("FundMyFuture - Random Forest Evaluation")
print("----------------------------------------")
print("Scholarships loaded:", len(scholarships))


if not scholarships:
    print("No scholarships found in MongoDB.")
    exit()


# ---------------------------------------------------------
# Generate evaluation dataset
# ---------------------------------------------------------

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


random.seed(42)

X = []
y = []


# ---------------------------------------------------------
# Create synthetic evaluation samples
# ---------------------------------------------------------

for scholarship in scholarships:

    for _ in range(40):

        student = {
            "course": random.choice(courses),

            "year": random.choice(years),

            "gender": random.choice(genders),

            "category": random.choice(categories),

            "income": random.randint(
                50000,
                800000
            ),

            "state": random.choice(states),

            "disability": random.choice(disabilities)
        }

        features = extract_features(
            student,
            scholarship
        )

        label = baseline_score(
            features
        )

        X.append(features)
        y.append(label)


print("Evaluation samples:", len(X))


# ---------------------------------------------------------
# Train / Test split
# ---------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# ---------------------------------------------------------
# Train Random Forest
# ---------------------------------------------------------

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    max_depth=8
)

model.fit(
    X_train,
    y_train
)


# ---------------------------------------------------------
# Generate predictions
# ---------------------------------------------------------

y_pred = model.predict(
    X_test
)


# ---------------------------------------------------------
# Calculate evaluation metrics
# ---------------------------------------------------------

mae = mean_absolute_error(
    y_test,
    y_pred
)

mse = mean_squared_error(
    y_test,
    y_pred
)

r2 = r2_score(
    y_test,
    y_pred
)


# ---------------------------------------------------------
# Display results
# ---------------------------------------------------------

print()
print("MODEL EVALUATION")
print("----------------")
print(f"MAE : {mae:.4f}")
print(f"MSE : {mse:.4f}")
print(f"R²  : {r2:.4f}")

print()
print("Evaluation completed successfully.")