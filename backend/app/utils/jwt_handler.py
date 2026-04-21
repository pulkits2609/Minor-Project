from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, decode_token
from flask_jwt_extended.exceptions import JWTExtendedException
from functools import wraps
from flask import request, jsonify

# JWT EXPIRATION (30 minutes)
JWT_EXPIRES = timedelta(minutes=30)

# CREATE JWT TOKEN

def generate_token(user):
    """
    Creates JWT token with:
    - user_id
    - username
    - role
    - issued_at
    - expiry
    """

    additional_claims = {
        "user_id": user.id,
        "username": user.name,
        "role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    token = create_access_token(
        identity=user.id,
        additional_claims=additional_claims,
        expires_delta=JWT_EXPIRES
    )

    return token

# VERIFY JWT TOKEN

def verify_token(token):
    """
    Verifies JWT token:
    - checks validity
    - checks expiration
    - returns decoded data
    """

    try:
        decoded = decode_token(token)

        return {
            "valid": True,
            "data": {
                "user_id": decoded.get("sub"),
                "username": decoded.get("username"),
                "role": decoded.get("role"),
                "created_at": decoded.get("created_at"),
                "expires_at": decoded.get("exp")
            }
        }

    except JWTExtendedException as e:
        return {
            "valid": False,
            "error": str(e)
        }

    except Exception:
        return {
            "valid": False,
            "error": "Invalid token"
        }

def jwt_required_custom(roles=None):
    """
    Custom JWT decorator
    - Verifies token
    - Optionally checks roles
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):

            auth_header = request.headers.get("Authorization")

            if not auth_header:
                return jsonify({"error": "Missing token"}), 401

            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except:
                return jsonify({"error": "Invalid token format"}), 401

            result = verify_token(token)

            if not result["valid"]:
                return jsonify({"error": result["error"]}), 401

            user_data = result["data"]

            # Role check
            if roles and user_data["role"] not in roles:
                return jsonify({"error": "Unauthorized"}), 403

            # attach user to request (VERY IMPORTANT)
            request.user = user_data

            return fn(*args, **kwargs)

        return wrapper
    return decorator