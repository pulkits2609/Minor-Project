from flask import Blueprint, jsonify, request
from app.utils.jwt_handler import jwt_required_custom

from app.services.dashboard_service import (
    get_worker_dashboard,
    get_supervisor_dashboard,
    get_safety_dashboard,
    get_admin_dashboard,
    get_authority_dashboard
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard", methods=["GET"])
@jwt_required_custom()
def dashboard():
    """
    GET /api/dashboard
    Returns role-based dashboard data
    """

    user = request.user  # injected from JWT decorator
    role = user["role"]
    user_id = user["user_id"]

    if role == "worker":
        data = get_worker_dashboard(user_id)

    elif role == "supervisor":
        data = get_supervisor_dashboard()

    elif role == "safety_officer":
        data = get_safety_dashboard()

    elif role == "admin":
        data = get_admin_dashboard()

    elif role == "authority":
        data = get_authority_dashboard()

    else:
        return jsonify({"error": "Invalid role"}), 403

    return jsonify({
        "status": "success",
        "role": role,
        "data": data
    }), 200