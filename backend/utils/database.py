from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]

scholarships_collection = db["scholarships"]
users_collection = db["users"]
applications_collection = db["applications"]
reminders_collection = db["reminders"]
saved_scholarships_collection = db["saved_scholarships"]


def test_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False