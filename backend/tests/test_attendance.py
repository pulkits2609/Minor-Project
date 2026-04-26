import os
import requests

BASE_URL = os.getenv("BASE_URL", "https://api.pulkitworks.info:5000").rstrip("/")
VERIFY_SSL = os.getenv("TEST_VERIFY_SSL", "false").lower() == "true"


def test_get_attendance(tokens):
    res = requests.get(
        f"{BASE_URL}/api/attendance",
        headers={"Authorization": f"Bearer {tokens['worker']}"},
        verify=VERIFY_SSL
    )

    assert res.status_code == 200