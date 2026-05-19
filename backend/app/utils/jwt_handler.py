from flask_jwt_extended import (
    create_access_token,
    verify_jwt_in_request,
    get_jwt_identity,
    get_jwt
)
from datetime import timedelta
from functools import wraps
from flask import request, jsonify

# JWT EXPIRATION
JWT_EXPIRES = timedelta(minutes=30)


# CREATE TOKEN
def generate_token(user):
    """
    Creates JWT token with:
    - user_id (identity)
    - username
    - role
    """

    additional_claims = {
        "role": user.role,
        "username": user.name
    }

    token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims,
        expires_delta=JWT_EXPIRES
    )

    return token


# VERIFY TOKEN (FIXED VERSION)
def verify_token(request):
    try:
        verify_jwt_in_request()

        return {
            "user_id": get_jwt_identity(),
            "role": get_jwt().get("role"),
            "username": get_jwt().get("username")
        }

    except Exception as e:
        error_msg = str(e)
        # Return more specific error messages
        if "Authorization" in error_msg or "header" in error_msg.lower():
            return {"error": "Missing or invalid Authorization header. Please send token in 'Authorization: Bearer <token>' format"}
        elif "expired" in error_msg.lower():
            return {"error": "Token has expired"}
        elif "invalid" in error_msg.lower():
            return {"error": "Invalid or malformed token"}
        else:
            return {"error": error_msg}


# CUSTOM DECORATOR (UPDATED)
def jwt_required_custom(roles=None):

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):

            try:
                verify_jwt_in_request()
            except Exception as e:
                return jsonify({"error": str(e)}), 401

            user_data = {
                "user_id": get_jwt_identity(),
                "role": get_jwt().get("role"),
                "username": get_jwt().get("username")
            }

            # Role check
            if roles and user_data["role"] not in roles:
                return jsonify({"error": "Unauthorized"}), 403

            # Attach user
            request.user = user_data

            return fn(*args, **kwargs)

        return wrapper

    return decorator
