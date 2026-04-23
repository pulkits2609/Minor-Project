from flask import Blueprint, jsonify
from app.utils.jwt_handler import verify_token
from app.services.user_service import get_all_workers

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/workers", methods=["GET"])
def get_workers():
    token = verify_token(request)

    if "error" in token:
        return {"error": token["error"]}, 401

    if token["role"] not in ["supervisor", "safety_officer", "admin"]:
        return {"error": "Unauthorized"}, 403

    workers = get_all_workers()

    return {
        "status": "success",
        "data": workers
    }