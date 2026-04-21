from flask import Blueprint, request, jsonify
from app.services.auth_service import register_user
from app.services.auth_service import login_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /auth/register

    Creates a new user
    """
    data = request.get_json()

    response, status = register_user(data)

    return jsonify(response), status

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /auth/login

    Authenticates user and returns JWT token
    """
    data = request.get_json()

    response, status = login_user(data)

    return jsonify(response), status