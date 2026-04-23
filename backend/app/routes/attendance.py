from flask import Blueprint, request, jsonify
from app.utils.jwt_handler import verify_token
from app.services.attendance_service import *

attendance_bp = Blueprint("attendance", __name__, url_prefix="/api/attendance")


@attendance_bp.route("/checkin", methods=["POST"])
def checkin():
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401

    success, error = check_in(token["user_id"], request.json["shift_id"])

    if not success:
        return {"error": error}, 400

    return {"status": "success"}


@attendance_bp.route("/checkout", methods=["POST"])
def checkout():
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401

    check_out(token["user_id"], request.json["shift_id"])

    return {"status": "success"}


@attendance_bp.route("", methods=["GET"])
def get():
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401

    data = get_attendance(token["user_id"], token["role"])

    return {"status": "success", "data": data}