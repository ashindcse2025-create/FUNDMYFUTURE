from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash

from utils.database import users_collection


user_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users"
)


@user_bp.route("/", methods=["POST"])
def create_user():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "User data is required"
        }), 400

    required_fields = [
        "name",
        "email",
        "password",
        "course",
        "year",
        "gender",
        "category",
        "income",
        "state",
        "disability"
    ]

    missing_fields = [
        field
        for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:
        return jsonify({
            "success": False,
            "message": "Missing required fields",
            "missing_fields": missing_fields
        }), 400

    email = data["email"].strip().lower()

    existing_user = users_collection.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "success": False,
            "message": "User with this email already exists"
        }), 409

    password_hash = generate_password_hash(
        data["password"]
    )

    user = {
        "name": data["name"].strip(),
        "email": email,
        "password_hash": password_hash,
        "course": data["course"],
        "year": data["year"],
        "gender": data["gender"],
        "category": data["category"],
        "income": data["income"],
        "state": data["state"],
        "disability": data["disability"]
    }

    result = users_collection.insert_one(user)

    return jsonify({
        "success": True,
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }), 201


@user_bp.route("/login", methods=["POST"])
def login_user():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Login data is required"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    password_hash = user.get("password_hash")

    if not password_hash:
        return jsonify({
            "success": False,
            "message": "This account needs to be registered again with a password"
        }), 400

    if not check_password_hash(
        password_hash,
        password
    ):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    user.pop("password_hash", None)
    user.pop("_id", None)

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": user
    })


@user_bp.route("/<email>", methods=["GET"])
def get_user(email):

    user = users_collection.find_one(
        {
            "email": email.strip().lower()
        },
        {
            "_id": 0,
            "password_hash": 0
        }
    )

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": user
    })


@user_bp.route("/update/<email>", methods=["PUT"])
def update_user(email):

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Update data is required"
        }), 400

    email = email.strip().lower()

    existing_user = users_collection.find_one({
        "email": email
    })

    if not existing_user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    allowed_fields = [
        "name",
        "course",
        "year",
        "gender",
        "category",
        "income",
        "state",
        "disability"
    ]

    update_data = {}

    for field in allowed_fields:

        if field in data:
            value = data[field]

            if isinstance(value, str):
                value = value.strip()

            update_data[field] = value

    if not update_data:
        return jsonify({
            "success": False,
            "message": "No profile information provided"
        }), 400

    users_collection.update_one(
        {
            "email": email
        },
        {
            "$set": update_data
        }
    )

    updated_user = users_collection.find_one(
        {
            "email": email
        },
        {
            "_id": 0,
            "password_hash": 0
        }
    )

    return jsonify({
        "success": True,
        "message": "Profile updated successfully",
        "user": updated_user
    })