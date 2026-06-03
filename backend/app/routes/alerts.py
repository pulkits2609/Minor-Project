from flask import Blueprint, request, jsonify
from app.utils.jwt_handler import verify_token
from app.services.alert_service import (
    get_alerts,
    mark_alert_read,
    create_emergency_alert
)

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")


#GET ALERTS
@alerts_bp.route("", methods=["GET"])
def fetch_alerts():
    token_data = verify_token(request)

    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    user_id = token_data["user_id"]

    alerts = get_alerts(user_id)

    return jsonify({
        "status": "success",
        "data": alerts
    })


#MARK AS READ
@alerts_bp.route("/read", methods=["PATCH"])
def read_alert():
    token_data = verify_token(request)

    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    data = request.get_json()
    alert_id = data.get("alert_id")

    if not alert_id:
        return jsonify({"error": "alert_id required"}), 400

    success = mark_alert_read(alert_id, token_data["user_id"])

    return jsonify({
        "status": "success" if success else "failed"
    })


#EMERGENCY ALERT
@alerts_bp.route("/emergency", methods=["POST"])
def emergency_alert():
    token_data = verify_token(request)

    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    if token_data["role"] not in ["supervisor", "safety_officer", "admin", "authority"]:
        return jsonify({"error": "Unauthorized - Only supervisors and above can broadcast emergency alerts"}), 403

    data = request.get_json()
    message = data.get("message")

    if not message:
        return jsonify({"error": "message required"}), 400

    try:
        create_emergency_alert(message)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "status": "success",
        "message": "Emergency alert broadcasted"
    })
