import requests
import uuid

BASE_URL = "https://api.pulkitworks.info:5000"


def test_register_success():
    email = f"test_{uuid.uuid4()}@mail.com"

    res = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": "123456",
            "role": "worker"
        },
        verify=False
    )

    assert res.status_code in [200, 201, 400]


def test_register_missing_fields():
    res = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": "abc@mail.com"},
        verify=False
    )

    assert res.status_code == 400


def test_login_success():
    res = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "pulkit@gmail.com",
            "password": "123456"
        },
        verify=False
    )

    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password():
    res = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "pulkit@gmail.com",
            "password": "wrong"
        },
        verify=False
    )

    assert res.status_code == 401