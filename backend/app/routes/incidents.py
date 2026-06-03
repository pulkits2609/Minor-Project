from flask import Blueprint, current_app, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.utils.jwt_handler import verify_token
from app.services.incident_service import (
    report_incident,
    get_all_incidents,
    get_incidents_by_user,
    update_incident_status
)

incidents_bp = Blueprint("incidents", __name__)

@incidents_bp.route("/api/incidents", methods=["GET"])
def fetch_incidents():
    token_data = verify_token(request)
    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    role = token_data["role"]
    if role in ["supervisor", "safety_officer", "admin", "authority"]:
        incidents = get_all_incidents()
    else:
        incidents = get_incidents_by_user(token_data["user_id"])

    return jsonify({
        "status": "success",
        "data": incidents
    })


@incidents_bp.route("/api/incidents", methods=["POST"])
@incidents_bp.route("/incidents/smp/hazard", methods=["POST"])
def submit_incident():
    token_data = verify_token(request)
    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    data = request.get_json(silent=True) or {}
    if not data.get("location"):
        return jsonify({"error": "location is required"}), 400
    if not (data.get("hazard_description") or data.get("description")):
        return jsonify({"error": "description is required"}), 400

    try:
        incident_id = report_incident(token_data["user_id"], data)
    except SQLAlchemyError as exc:
        db.session.rollback()
        current_app.logger.exception("Incident insert failed")
        response = {
            "status": "failed",
            "error": "Incident could not be saved. Check the cloud incidents table schema and status constraints.",
        }
        if current_app.debug:
            response["details"] = str(getattr(exc, "orig", exc))
        return jsonify(response), 500

    return jsonify({
        "status": "success",
        "reference": f"INC-{incident_id[:8].upper()}",
        "id": incident_id
    })


@incidents_bp.route("/api/incidents/<id>/status", methods=["PATCH"])
def change_status(id):
    token_data = verify_token(request)
    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    if token_data["role"] not in ["supervisor", "safety_officer", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status required"}), 400

    success = update_incident_status(id, status)
    return jsonify({
        "status": "success" if success else "failed"
    })
