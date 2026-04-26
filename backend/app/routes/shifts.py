from flask import Blueprint, request, jsonify
from app.utils.jwt_handler import verify_token
from app.services.shift_service import *

shifts_bp = Blueprint("shifts", __name__, url_prefix="/api/shifts")


@shifts_bp.route("", methods=["POST"])
def create():
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401
    if token["role"] != "supervisor":
        return {"error": "Unauthorized"}, 403

    data = request.get_json()

    shift_id = create_shift(
        data["start_time"],
        data["end_time"],
        data.get("location"),
        token["user_id"]
    )

    return {"status": "success", "shift_id": str(shift_id)}


@shifts_bp.route("", methods=["GET"])
def get():
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401
    shifts = get_shifts(token["user_id"], token["role"])
    return {"status": "success", "data": shifts}


@shifts_bp.route("/<shift_id>", methods=["PATCH"])
def update(shift_id):
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401
    if token["role"] != "supervisor":
        return {"error": "Unauthorized"}, 403

    data = request.get_json()

    update_shift(
        shift_id,
        data["start_time"],
        data["end_time"],
        data.get("location"),
        token["user_id"]
    )

    return {"status": "success"}


@shifts_bp.route("/<shift_id>/assign", methods=["POST"])
def assign(shift_id):
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401
    if token["role"] != "supervisor":
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    assign_workers(shift_id, data["user_ids"])

    return {"status": "success"}


@shifts_bp.route("/<shift_id>/remove/<user_id>", methods=["DELETE"])
def remove(shift_id, user_id):
    token = verify_token(request)
    if "error" in token:
        return {"error": token["error"]}, 401
    if token["role"] != "supervisor":
        return {"error": "Unauthorized"}, 403

    remove_worker(shift_id, user_id)

    return {"status": "success"}