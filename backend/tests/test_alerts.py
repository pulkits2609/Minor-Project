import requests

BASE_URL = "https://api.pulkitworks.info:5000"


def test_get_alerts(tokens):
    res = requests.get(
        f"{BASE_URL}/api/alerts",
        headers={"Authorization": f"Bearer {tokens['worker']}"},
        verify=False
    )

    assert res.status_code == 200
    assert "data" in res.json()