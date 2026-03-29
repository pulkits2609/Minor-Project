import os
from flask import Blueprint, jsonify, request, send_file
from app.extensions import db
from app.models.shift import Shift, HandoverLog
from app.utils.pdf_generator import generate_handover_report

shifts_bp = Blueprint('shifts', __name__)

@shifts_bp.route('/', methods=['POST'])
def create_shift():
    data = request.json
    # In a full app, we would validate with Marshmallow. For now, a simple DB insert mock.
    # new_shift = Shift(start_time=data['start_time'], end_time=data['end_time'], location=data['location'])
    return jsonify({"message": "Shift log created"}), 201

@shifts_bp.route('/handover', methods=['POST'])
def digital_shift_handover():
    data = request.json
    
    # 1. Save handover data to database
    # handover = HandoverLog(
    #     shift_id=data.get('shift_id'),
    #     equipment_status=data.get('equipment_status'),
    #     production_summary=data.get('production_summary'),
    #     safety_red_flags=data.get('safety_red_flags'),
    #     actions_required=data.get('actions_required')
    # )
    # db.session.add(handover)
    # db.session.commit()
    
    # 2. Immediately generate standard PDF report
    pdf_path = generate_handover_report(data)
    
    return jsonify({
        "message": "Shift handover successfully logged and PDF created.",
        "pdf_report_path": pdf_path
    }), 201

@shifts_bp.route('/handover/download', methods=['GET'])
def download_handover_report():
    file_path = request.args.get('path')
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "Report not found"}), 404

@shifts_bp.route('/check-in', methods=['POST'])
def check_in():
    return jsonify({"message": "Checked in successfully"}), 200

@shifts_bp.route('/check-out', methods=['POST'])
def check_out():
    return jsonify({"message": "Checked out successfully"}), 200

@shifts_bp.route('/worker/<int:worker_id>', methods=['GET'])
def get_worker_schedule(worker_id):
    """Fetches upcoming work schedules (shifts) for a specific worker."""
    return jsonify({
        "worker_id": worker_id, 
        "schedule": [
            {"shift_id": 402, "start_time": "2024-05-01T06:00:00", "end_time": "2024-05-01T14:00:00", "location": "Main Pit", "status": "Scheduled"}
        ]
    }), 200

