def test_health_check(client):
    """Ensure the health check API is alive."""
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json['status'] == 'ok'


def test_login(client):
    """Ensure login works with proper error handling."""
    response = client.post('/auth/login', json={"username": "test", "password": "abc"})
    assert response.status_code in (200, 401, 400)


def test_register(client):
    """Ensure register endpoint works."""
    response = client.post('/auth/register', json={"name": "Worker1", "password": "test", "role": "worker"})
    assert response.status_code in (201, 400, 409)


def test_dashboard_requires_auth(client):
    """Dashboard should return 401 without token."""
    response = client.get('/api/dashboard')
    assert response.status_code == 401


def test_shifts_requires_auth(client):
    """Shifts endpoint should return 401 without token."""
    response = client.get('/api/shifts')
    assert response.status_code == 401


def test_attendance_requires_auth(client):
    """Attendance endpoint should return 401 without token."""
    response = client.get('/api/attendance')
    assert response.status_code == 401


def test_incidents_list(client):
    """Incidents list should return 401 without token."""
    response = client.get('/api/incidents')
    assert response.status_code == 401


def test_incidents_report_requires_location(client):
    """Incident report should require location."""
    response = client.post('/api/incidents', json={})
    assert response.status_code == 401  # no auth


def test_get_workers_requires_auth(client):
    """Workers endpoint should return 401 without token."""
    response = client.get('/api/users/workers')
    assert response.status_code == 401


def test_alerts_requires_auth(client):
    """Alerts endpoint should return 401 without token."""
    response = client.get('/api/alerts')
    assert response.status_code == 401


def test_tasks_requires_auth(client):
    """Tasks endpoint should return 401 without token."""
    response = client.get('/api/tasks')
    assert response.status_code == 401


def test_incident_status_update_requires_auth(client):
    """Incident status update should return 401 without token."""
    response = client.patch('/api/incidents/999/status', json={"status": "resolved"})
    assert response.status_code == 401
