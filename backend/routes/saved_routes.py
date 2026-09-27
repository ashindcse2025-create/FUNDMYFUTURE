from flask import Blueprint, jsonify, request

from utils.database import saved_scholarships_collection


saved_bp = Blueprint(
    "saved_scholarships",
    __name__,
    url_prefix="/api/saved"
)


# Save a scholarship
@saved_bp.route("/", methods=["POST"])
def save_scholarship():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Save data is required"
        }), 400

    email = data.get("email", "").strip().lower()
    scholarship_name = data.get(
        "scholarship_name",
        ""
    ).strip()

    if not email or not scholarship_name:
        return jsonify({
            "success": False,
            "message": "Email and scholarship name are required"
        }), 400

    existing_saved = saved_scholarships_collection.find_one({
        "email": email,
        "scholarship_name": scholarship_name
    })

    if existing_saved:
        return jsonify({
            "success": False,
            "message": "Scholarship already saved"
        }), 409

    saved_scholarship = {
        "email": email,
        "scholarship_name": scholarship_name
    }

    result = saved_scholarships_collection.insert_one(
        saved_scholarship
    )

    return jsonify({
        "success": True,
        "message": "Scholarship saved successfully",
        "id": str(result.inserted_id)
    }), 201


# Get all saved scholarships for a user
@saved_bp.route("/<email>", methods=["GET"])
def get_saved_scholarships(email):

    email = email.strip().lower()

    saved_scholarships = list(
        saved_scholarships_collection.find(
            {
                "email": email
            },
            {
                "_id": 0
            }
        )
    )

    return jsonify({
        "success": True,
        "count": len(saved_scholarships),
        "saved_scholarships": saved_scholarships
    })
    # Remove a saved scholarship
@saved_bp.route("/", methods=["DELETE"])
def remove_saved_scholarship():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Remove data is required"
        }), 400

    email = data.get("email", "").strip().lower()
    scholarship_name = data.get(
        "scholarship_name",
        ""
    ).strip()

    if not email or not scholarship_name:
        return jsonify({
            "success": False,
            "message": "Email and scholarship name are required"
        }), 400

    result = saved_scholarships_collection.delete_one({
        "email": email,
        "scholarship_name": scholarship_name
    })

    if result.deleted_count == 0:
        return jsonify({
            "success": False,
            "message": "Saved scholarship not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Scholarship removed successfully"
    })