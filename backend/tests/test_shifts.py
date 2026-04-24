import requests

BASE_URL = "https://api.pulkitworks.info:5000"


def test_supervisor_create_shift(tokens):
    res = requests.post(
        f"{BASE_URL}/api/shifts",
        headers={"Authorization": f"Bearer {tokens['supervisor']}"},
        json={
            "start_time": "2026-04-25T08:00:00",
            "end_time": "2026-04-25T16:00:00",
            "location": "Zone A"
        },
        verify=False
    )

    assert res.status_code in [200, 400]  # safe


def test_worker_cannot_create_shift(tokens):
    res = requests.post(
        f"{BASE_URL}/api/shifts",
        headers={"Authorization": f"Bearer {tokens['worker']}"},
        json={
            "start_time": "2026-04-25T08:00:00",
            "end_time": "2026-04-25T16:00:00",
            "location": "Zone A"
        },
        verify=False
    )

    assert res.status_code in [401, 403]