from flask import Blueprint, jsonify, request

from utils.database import scholarships_collection
from services.recommendation_service import recommend_scholarships


recommendation_bp = Blueprint(
    "recommendations",
    __name__,
    url_prefix="/api/recommendations"
)


@recommendation_bp.route("/", methods=["POST"])
def get_recommendations():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Student profile is required"
        }), 400

    required_fields = [
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

    scholarships = list(
        scholarships_collection.find(
            {},
            {"_id": 0}
        )
    )

    recommendations = recommend_scholarships(
        data,
        scholarships
    )

    return jsonify({
        "success": True,
        "count": len(recommendations),
        "recommendations": recommendations
    })