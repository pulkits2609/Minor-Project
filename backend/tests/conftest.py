import pytest
import requests
import urllib3

import os
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = os.getenv("API_URL", "http://127.0.0.1:5000")

USERS = {
    "worker": {"email": "pulkit@gmail.com", "password": "123456"},
    "supervisor": {"email": "supervisor@gmail.com", "password": "123456"},
    "safety": {"email": "safety@gmail.com", "password": "123456"},
    "admin": {"email": "admin@gmail.com", "password": "123456"},
    "authority": {"email": "authority@gmail.com", "password": "123456"},
}

def login(email, password):
    res = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        verify=False
    )
    if res.status_code == 200:
        return res.json().get("access_token")
    return None


@pytest.fixture(scope="session")
def tokens():
    return {
        role: login(user["email"], user["password"])
        for role, user in USERS.items()
    }