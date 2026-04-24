import requests

BASE_URL = "https://api.pulkitworks.info:5000"


def test_get_attendance(tokens):
    res = requests.get(
        f"{BASE_URL}/api/attendance",
        headers={"Authorization": f"Bearer {tokens['worker']}"},
        verify=False
    )

    assert res.status_code == 200