import requests

BASE_URL = "https://api.pulkitworks.info:5000"


def test_get_tasks_worker(tokens):
    res = requests.get(
        f"{BASE_URL}/api/tasks",
        headers={"Authorization": f"Bearer {tokens['worker']}"},
        verify=False
    )

    assert res.status_code == 200


def test_worker_cannot_create_task(tokens):
    res = requests.post(
        f"{BASE_URL}/api/tasks",
        headers={"Authorization": f"Bearer {tokens['worker']}"},
        json={
            "task_name": "Test",
            "description": "Test",
            "priority": "low",
            "assigned_to": "random"
        },
        verify=False
    )

    assert res.status_code in [401, 403]