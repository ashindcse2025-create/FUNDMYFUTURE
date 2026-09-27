from flask import Blueprint, jsonify, request
from utils.database import scholarships_collection

scholarship_bp = Blueprint(
    "scholarships",
    __name__,
    url_prefix="/api/scholarships"
)


@scholarship_bp.route("/", methods=["GET"])
def get_scholarships():

    scholarships = list(
        scholarships_collection.find(
            {},
            {"_id": 0}
        )
    )

    return jsonify({
        "success": True,
        "count": len(scholarships),
        "scholarships": scholarships
    })


@scholarship_bp.route("/search", methods=["GET"])
def search_scholarships():

    query = request.args.get("q", "").strip()

    if not query:
        scholarships = list(
            scholarships_collection.find(
                {},
                {"_id": 0}
            )
        )
    else:
        scholarships = list(
            scholarships_collection.find(
                {
                    "$or": [
                        {
                            "name": {
                                "$regex": query,
                                "$options": "i"
                            }
                        },
                        {
                            "description": {
                                "$regex": query,
                                "$options": "i"
                            }
                        },
                        {
                            "provider": {
                                "$regex": query,
                                "$options": "i"
                            }
                        }
                    ]
                },
                {"_id": 0}
            )
        )

    return jsonify({
        "success": True,
        "count": len(scholarships),
        "scholarships": scholarships
    })


@scholarship_bp.route("/", methods=["POST"])
def add_scholarship():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No scholarship data provided"
        }), 400

    result = scholarships_collection.insert_one(data)

    return jsonify({
        "success": True,
        "message": "Scholarship added successfully",
        "id": str(result.inserted_id)
    }), 201