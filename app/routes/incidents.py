from flask import Blueprint, jsonify, request
from app.models.incident import SMPHazardRecord, Incident
from app.extensions import db

incidents_bp = Blueprint('incidents', __name__)

@incidents_bp.route('/smp/hazard', methods=['POST'])
def log_smp_hazard():
    """Logs a Hazard as per the Safety Management Plan (DGMS Guidelines)"""
    data = request.json
    
    # Probability and Consequence from 1 to 5 to calculate Risk Score
    probability = data.get('probability', 1)
    consequence = data.get('consequence', 1)
    risk_score = probability * consequence
    
    # Example logic using the new SMPHazardRecord model
    # new_hazard = SMPHazardRecord(
    #     location=data.get('location'),
    #     hazard_description=data.get('hazard_description'),
    #     probability=probability,
    #     consequence=consequence,
    #     risk_score=risk_score,
    #     control_mechanism=data.get('control_mechanism')
    # )
    # db.session.add(new_hazard)
    # db.session.commit()
    
    return jsonify({
        "message": "Hazard successfully recorded to SMP",
        "calculated_risk_score": risk_score,
        "requires_immediate_action": risk_score >= 15  # Simple alert thresholds
    }), 201

@incidents_bp.route('/smp/dashboard', methods=['GET'])
def get_smp_dashboard():
    """Retrieves all active SMP hazard checks for the dashboard."""
    # hazards = SMPHazardRecord.query.all()
    # Mock return for scaffolding
    return jsonify({
        "active_hazards": 2,
        "pending_reviews": 1,
        "critical_risks": 0
    }), 200
    
@incidents_bp.route('/', methods=['POST'])
def report_incident():
    # Placeholder for reporting an incident
    return jsonify({"message": "Incident reported"}), 201

@incidents_bp.route('/', methods=['GET'])
def get_incidents():
    return jsonify({"incidents": []}), 200

@incidents_bp.route('/<int:id>/review', methods=['PUT'])
def review_incident(id):
    return jsonify({"message": f"Incident {id} reviewed"}), 200

@incidents_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Fetches the notification audit log for recent incidents and warnings."""
    return jsonify({"alerts": [{"alert_id": 1, "message": "Highwall instability reported in Sector 4B", "target_role": "Safety Officer", "is_read": False}]}), 200


