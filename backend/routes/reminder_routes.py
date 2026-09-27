from flask import Blueprint, jsonify, request
from datetime import datetime

from utils.database import (
    scholarships_collection,
    reminders_collection
)


reminder_bp = Blueprint(
    "reminders",
    __name__,
    url_prefix="/api/reminders"
)


# =========================================================
# GET UPCOMING SCHOLARSHIP DEADLINES
# =========================================================

@reminder_bp.route("/<email>", methods=["GET"])
def get_reminders(email):

    try:
        email = email.strip().lower()

        today = datetime.now().date()

        scholarships = list(
            scholarships_collection.find(
                {},
                {"_id": 0}
            )
        )

        reminders = []

        for scholarship in scholarships:

            deadline = scholarship.get(
                "application_end"
            )

            if not deadline:
                continue

            try:
                deadline_date = datetime.strptime(
                    deadline,
                    "%d-%m-%Y"
                ).date()

            except ValueError:
                continue

            days_remaining = (
                deadline_date - today
            ).days

            if 0 <= days_remaining <= 30:

                saved_reminder = reminders_collection.find_one({
                    "email": email,
                    "scholarship_name":
                        scholarship.get("name")
                })

                reminders.append({
                    "name": scholarship.get(
                        "name",
                        "Unknown Scholarship"
                    ),

                    "application_end": deadline,

                    "days_remaining":
                        days_remaining,

                    "source": scholarship.get(
                        "source",
                        "NSP"
                    ),

                    "specification_url":
                        scholarship.get(
                            "specification_url",
                            ""
                        ),

                    "reminder_set":
                        saved_reminder is not None
                })

        reminders.sort(
            key=lambda x:
                x["days_remaining"]
        )

        return jsonify({
            "success": True,
            "count": len(reminders),
            "reminders": reminders
        })

    except Exception as error:

        print(
            "Reminder loading error:",
            error
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to load reminders"
        }), 500


# =========================================================
# SET REMINDER
# =========================================================

@reminder_bp.route("/", methods=["POST"])
def set_reminder():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message":
                    "Reminder data is required"
            }), 400

        email = data.get(
            "email",
            ""
        ).strip().lower()

        scholarship_name = data.get(
            "scholarship_name",
            ""
        ).strip()

        deadline = data.get(
            "application_end",
            ""
        ).strip()

        if not email or not scholarship_name:

            return jsonify({
                "success": False,
                "message":
                    "Email and scholarship name are required"
            }), 400

        existing_reminder = (
            reminders_collection.find_one({
                "email": email,
                "scholarship_name":
                    scholarship_name
            })
        )

        if existing_reminder:

            return jsonify({
                "success": False,
                "message":
                    "Reminder already set"
            }), 409

        reminder = {
            "email": email,
            "scholarship_name":
                scholarship_name,
            "application_end":
                deadline,
            "created_at":
                datetime.now().isoformat()
        }

        result = reminders_collection.insert_one(
            reminder
        )

        return jsonify({
            "success": True,
            "message":
                "Reminder set successfully",
            "id":
                str(result.inserted_id)
        }), 201

    except Exception as error:

        print(
            "Set reminder error:",
            error
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to set reminder"
        }), 500


# =========================================================
# REMOVE REMINDER
# =========================================================

@reminder_bp.route("/", methods=["DELETE"])
def remove_reminder():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message":
                    "Reminder data is required"
            }), 400

        email = data.get(
            "email",
            ""
        ).strip().lower()

        scholarship_name = data.get(
            "scholarship_name",
            ""
        ).strip()

        if not email or not scholarship_name:

            return jsonify({
                "success": False,
                "message":
                    "Email and scholarship name are required"
            }), 400

        result = reminders_collection.delete_one({
            "email": email,
            "scholarship_name":
                scholarship_name
        })

        if result.deleted_count == 0:

            return jsonify({
                "success": False,
                "message":
                    "Reminder not found"
            }), 404

        return jsonify({
            "success": True,
            "message":
                "Reminder removed successfully"
        })

    except Exception as error:

        print(
            "Remove reminder error:",
            error
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to remove reminder"
        }), 500