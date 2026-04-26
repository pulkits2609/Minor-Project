from app.models.user import User
from app.extensions import db
from app.utils.jwt_handler import generate_token
from sqlalchemy import or_
import bcrypt

VALID_ROLES = ['worker','supervisor','safety_officer','admin','authority']


def register_user(data):
    name = data.get("name")
    email = data.get("email")
    employee_id = data.get("employee_id")
    password = data.get("password")
    role = data.get("role")

    # Validation
    if not all([name, email, password, role]):
        return {"error": "Missing required fields"}, 400

    if role not in VALID_ROLES:
        return {"error": "Invalid role"}, 400

    # Check existing user
    if User.query.filter_by(email=email).first():
        return {"error": "User already exists"}, 400

    # Hash password
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # Create user
    user = User(
        name=name,
        email=email,
        employee_id=employee_id,
        password_hash=hashed_pw,
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return {
        "message": "User registered successfully",
        "user_id": user.id
    }, 201


def login_user(data):
    email = data.get("email")
    password = data.get("password")

    # Validation
    if not email or not password:
        return {"error": "Email and password required"}, 400

    # Find user (by email or employee_id)
    try:
        user = User.query.filter(or_(User.email == email, User.employee_id == email)).first()
    except Exception:
        # Fallback for environments where migrations haven't run yet
        user = User.query.filter_by(email=email).first()

    # Generic error for security (prevents user enumeration)
    invalid_error = {"error": "Invalid email/ID or password"}, 401

    if not user:
        return invalid_error

    # Verify password
    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return invalid_error

    # Generate JWT
    token = generate_token(user)

    return {
        "message": "Login successful",
        "access_token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }, 200