from flask import Blueprint, jsonify, request

from utils.database import applications_collection


application_bp = Blueprint(
    "applications",
    __name__,
    url_prefix="/api/applications"
)


# Add a scholarship application
@application_bp.route("/", methods=["POST"])
def add_application():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Application data is required"
        }), 400

    email = data.get("email", "").strip().lower()
    scholarship_name = data.get("scholarship_name", "").strip()
    status = data.get("status", "Interested").strip()

    if not email or not scholarship_name:
        return jsonify({
            "success": False,
            "message": "Email and scholarship name are required"
        }), 400

    allowed_statuses = [
        "Interested",
        "Applying",
        "Applied",
        "Selected",
        "Rejected"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid application status"
        }), 400

    existing_application = applications_collection.find_one({
        "email": email,
        "scholarship_name": scholarship_name
    })

    if existing_application:
        return jsonify({
            "success": False,
            "message": "Application already exists"
        }), 409

    application = {
        "email": email,
        "scholarship_name": scholarship_name,
        "status": status
    }

    result = applications_collection.insert_one(application)

    return jsonify({
        "success": True,
        "message": "Application added successfully",
        "id": str(result.inserted_id)
    }), 201


# Get all applications for a user
@application_bp.route("/<email>", methods=["GET"])
def get_applications(email):

    email = email.strip().lower()

    applications = list(
        applications_collection.find(
            {"email": email},
            {"_id": 0}
        )
    )

    return jsonify({
        "success": True,
        "count": len(applications),
        "applications": applications
    })


# Update application status
@application_bp.route("/", methods=["PUT"])
def update_application():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Update data is required"
        }), 400

    email = data.get("email", "").strip().lower()
    scholarship_name = data.get("scholarship_name", "").strip()
    status = data.get("status", "").strip()

    if not email or not scholarship_name or not status:
        return jsonify({
            "success": False,
            "message": "Email, scholarship name and status are required"
        }), 400

    allowed_statuses = [
        "Interested",
        "Applying",
        "Applied",
        "Selected",
        "Rejected"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid application status"
        }), 400

    result = applications_collection.update_one(
        {
            "email": email,
            "scholarship_name": scholarship_name
        },
        {
            "$set": {
                "status": status
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({
            "success": False,
            "message": "Application not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Application status updated successfully"
    })


# Delete an application
@application_bp.route("/", methods=["DELETE"])
def delete_application():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Delete data is required"
        }), 400

    email = data.get("email", "").strip().lower()
    scholarship_name = data.get("scholarship_name", "").strip()

    if not email or not scholarship_name:
        return jsonify({
            "success": False,
        "message": "Email and scholarship name are required"
        }), 400

    result = applications_collection.delete_one({
        "email": email,
        "scholarship_name": scholarship_name
    })

    if result.deleted_count == 0:
        return jsonify({
            "success": False,
            "message": "Application not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Application deleted successfully"
    })