from flask import Blueprint, request, jsonify
from app.utils.jwt_handler import verify_token
from app.services.incident_service import (
    report_incident,
    get_all_incidents,
    get_incidents_by_user,
    update_incident_status,
    get_incident_by_id
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
    
    data = request.get_json()
    incident_id = report_incident(token_data["user_id"], data)
    
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
    
    if token_data["role"] not in ["supervisor", "safety_officer", "admin", "authority"]:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status required"}), 400
    
    success = update_incident_status(id, status)
    return jsonify({
        "status": "success" if success else "failed"
    })

@incidents_bp.route("/api/incidents/<id>", methods=["GET"])
def get_incident(id):
    token_data = verify_token(request)
    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401
    
    incident = get_incident_by_id(id)
    if not incident:
        return jsonify({"error": "Incident not found"}), 404
        
    return jsonify({
        "status": "success",
        "data": incident
    })
