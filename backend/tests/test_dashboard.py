import requests

BASE_URL = "https://api.pulkitworks.info:5000"


def test_worker_dashboard(tokens):
    res = requests.get(
        f"{BASE_URL}/api/dashboard",
        headers={"Authorization": f"Bearer {tokens['worker']}"},
        verify=False
    )

    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "worker"
    assert "data" in data


def test_supervisor_dashboard(tokens):
    res = requests.get(
        f"{BASE_URL}/api/dashboard",
        headers={"Authorization": f"Bearer {tokens['supervisor']}"},
        verify=False
    )

    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "supervisor"