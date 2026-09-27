from flask import Flask, jsonify
from flask_cors import CORS

from config import DATABASE_NAME
from utils.database import test_connection

from routes.scholarship_routes import scholarship_bp
from routes.recommendation_routes import recommendation_bp
from routes.user_routes import user_bp
from routes.saved_routes import saved_bp
from routes.application_routes import application_bp
from routes.reminder_routes import reminder_bp

app = Flask(__name__)

CORS(app)


app.register_blueprint(scholarship_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(user_bp)
app.register_blueprint(saved_bp)
app.register_blueprint(application_bp)
app.register_blueprint(reminder_bp)

@app.route("/")
def home():

    return jsonify({
        "message": "Welcome to FundMyFuture",
        "status": "Backend is running"
    })


@app.route("/api/health")
def health():

    mongo_status = test_connection()

    return jsonify({
        "success": True,
        "mongodb": "connected" if mongo_status else "disconnected",
        "database": DATABASE_NAME
    })


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )