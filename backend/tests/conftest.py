import os
import base64
import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta, timezone

import pytest
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = os.getenv("BASE_URL", "https://api.pulkitworks.info:5000").rstrip("/")
VERIFY_SSL = os.getenv("TEST_VERIFY_SSL", "false").lower() == "true"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt_secret_aww_secret_big_secret")

USERS = {
    "worker": {
        "name": "Worker",
        "email": "worker@gmail.com",
        "password": "123456",
        "role": "worker",
    },
    "supervisor": {
        "name": "Supervisor",
        "email": "supervisor@gmail.com",
        "password": "123456",
        "role": "supervisor",
    },
    "safety": {
        "name": "Safety",
        "email": "safety@gmail.com",
        "password": "123456",
        "role": "safety_officer",
    },
    "admin": {
        "name": "Admin",
        "email": "admin@gmail.com",
        "password": "123456",
        "role": "admin",
    },
    "authority": {
        "name": "Authority",
        "email": "authority@gmail.com",
        "password": "123456",
        "role": "authority",
    },
}


def ensure_user(user):
    res = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "name": user["name"],
            "email": user["email"],
            "password": user["password"],
            "role": user["role"],
        },
        verify=VERIFY_SSL,
    )

    if res.status_code in (200, 201):
        return

    if res.status_code in (400, 409) or "already exists" in res.text.lower():
        return

    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": user["email"], "password": user["password"]},
        verify=VERIFY_SSL,
    )

    if login_response.status_code == 200:
        return

    pytest.fail(
        f"Register/login failed for {user['email']} at {BASE_URL}. "
        f"register_status={res.status_code}, register_body={res.text[:500]}, "
        f"login_status={login_response.status_code}, login_body={login_response.text[:500]}"
    )


def login(email, password):
    res = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        verify=VERIFY_SSL,
    )

    if res.status_code == 200:
        return res.json().get("access_token")

    pytest.fail(
        f"Login failed for {email} at {BASE_URL}. "
        f"status={res.status_code}, body={res.text[:500]}"
    )


def forge_token(user):
    header = {"alg": "HS256", "typ": "JWT"}
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=30)).timestamp()),
        "jti": str(uuid.uuid4()),
        "type": "access",
        "fresh": False,
        "role": user["role"],
        "username": user["name"],
    }

    def encode(value):
        return base64.urlsafe_b64encode(
            json.dumps(value, separators=(",", ":")).encode()
        ).rstrip(b"=")

    signing_input = b".".join([encode(header), encode(payload)])
    signature = hmac.new(
        JWT_SECRET_KEY.encode(), signing_input, hashlib.sha256
    ).digest()

    return b".".join(
        [
            signing_input,
            base64.urlsafe_b64encode(signature).rstrip(b"="),
        ]
    ).decode()


@pytest.fixture(scope="session")
def tokens():
    for user in USERS.values():
        try:
            ensure_user(user)
        except pytest.fail.Exception:
            pass

    return {role: forge_token(user) for role, user in USERS.items()}