from app.models.user import User
from app.extensions import db
from app.utils.jwt_handler import generate_token
# pyrefly: ignore [missing-import]
import bcrypt

VALID_ROLES = ['worker','supervisor','safety_officer','admin','authority']


def register_user(data):
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if password is not None and not isinstance(password, str):
        password = str(password)

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

    if password is not None and not isinstance(password, str):
        password = str(password)

    # Validation
    if not email or password == "":
        return {"error": "Email and password required"}, 400

    # Find user
    user = User.query.filter_by(email=email).first()

    if not user:
        return {"error": "User not found"}, 404

    # Verify password
    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return {"error": "Invalid credentials"}, 401

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