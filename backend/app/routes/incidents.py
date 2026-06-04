from flask import Blueprint, current_app, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.utils.jwt_handler import verify_token
from app.services.incident_service import (
    report_incident,
    get_all_incidents,
    get_incidents_by_user,
    update_incident_status,
    review_incident,
    assign_task_from_incident,
    get_incident_details,
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

@incidents_bp.route("/api/incidents/<id>", methods=["GET"])
def incident_detail(id):
    token_data = verify_token(request)
    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    incident = get_incident_details(id)
    if not incident:
        return jsonify({"error": "Incident not found"}), 404

    return jsonify({
        "status": "success",
        "data": incident
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

    ALLOWED_INCIDENT_STATUSES = {
    "active",
    "pending-verification",
    "reviewed",
    "assigned",
    "in-progress",
    "resolved",
    "rejected",
    }
    if status not in ALLOWED_INCIDENT_STATUSES:
        return jsonify({"error": f"Invalid status. Allowed: {', '.join(sorted(ALLOWED_INCIDENT_STATUSES))}"}), 400

    success = update_incident_status(id, status)
    return jsonify({
        "status": "success" if success else "failed"
    })

@incidents_bp.route("/api/incidents/<id>/review", methods=["PATCH"])
def review_incident_route(id):
    token_data = verify_token(request)
    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    if token_data["role"] not in ["supervisor", "safety_officer", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json(silent=True) or {}
    approved = data.get("approved")

    if approved is None:
        return jsonify({"error": "approved is required"}), 400

    if isinstance(approved, str):
        approved = approved.strip().lower() in {"true", "1", "yes", "approved"}

    incident, error = review_incident(id, approved)
    if error:
        return jsonify({"error": error}), 404 if error == "Incident not found" else 400

    return jsonify({
        "status": "success",
        "data": incident
    })
    
@incidents_bp.route("/api/incidents/<id>/assign", methods=["POST"])
def assign_from_incident(id):
    token_data = verify_token(request)
    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    if token_data["role"] not in ["supervisor", "safety_officer", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json(silent=True) or {}
    worker_id = data.get("worker_id") or data.get("assigned_to")
    task_name = data.get("task_name")
    description = data.get("description")
    priority = data.get("priority", "medium")

    if not worker_id:
        return jsonify({"error": "worker_id is required"}), 400

    result, error = assign_task_from_incident(
        incident_id=id,
        worker_id=worker_id,
        assigned_by=token_data["user_id"],
        task_name=task_name,
        description=description,
        priority=priority,
    )

    if error:
        return jsonify({"error": error}), 404 if error == "Incident not found" else 400

    return jsonify({
        "status": "success",
        "data": result
    })
