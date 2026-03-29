import os
import pytest

def test_health_check(client):
    """Ensure the health check API is alive."""
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'
    assert response.json['service'] == 'Coal Mine Management API'

# --- Authentication Tests ---

def test_login_stub(client):
    """Ensure Auth login router mapping is functioning."""
    response = client.post('/auth/login', json={"username": "test", "password": "abc"})
    assert response.status_code == 200
    assert "message" in response.json

def test_register_stub(client):
    """Ensure Auth register router mapping is functioning."""
    response = client.post('/auth/register', json={"name": "Worker1", "password": "test", "role": "Worker"})
    assert response.status_code == 201

def test_get_profile_stub(client):
    """Ensure Auth profile fetch mapping is functioning."""
    response = client.get('/auth/me')
    assert response.status_code == 200

# --- Shift & Attendance Tests ---

def test_create_shift_log(client):
    """Ensure shift creation endpoint responds correctly."""
    response = client.post('/shifts/', json={"start_time": "2024-05-01T06:00:00", "end_time": "2024-05-01T14:00:00", "location": "Main Pit"})
    assert response.status_code == 201
    assert "message" in response.json

def test_shift_check_in(client):
    """Ensure worker check-in attendance endpoint responds."""
    response = client.post('/shifts/check-in', json={"shift_id": 402, "worker_id": 45})
    assert response.status_code == 200
    assert "Checked in" in response.json['message']

def test_shift_check_out(client):
    """Ensure worker check-out attendance endpoint responds."""
    response = client.post('/shifts/check-out', json={"shift_id": 402, "worker_id": 45})
    assert response.status_code == 200
    assert "Checked out" in response.json['message']

def test_fetch_worker_schedule(client):
    """Ensure a worker can request their allocated work schedule/roster."""
    response = client.get('/shifts/worker/45')
    assert response.status_code == 200
    assert "schedule" in response.json

def test_digital_shift_handover_report_generation(client):
    """Ensure shift turnover generates the physical report correctly."""
    payload = {
        "shift_id": 402,
        "equipment_status": "EX-04 Breakdown",
        "production_summary": "1200T achieved",
        "safety_red_flags": "Highwall instability",
        "actions_required": "Geotech survey required"
    }
    response = client.post('/shifts/handover', json=payload)
    assert response.status_code == 201
    assert "pdf_report_path" in response.json
    
    pdf_path = response.json['pdf_report_path']
    assert os.path.exists(pdf_path)
    os.remove(pdf_path)

# --- Incidents & Safety Management Tests ---

def test_report_general_incident(client):
    """Test standard incident reporting."""
    payload = {"location": "Haul Road 2", "severity": "Medium", "description": "Truck tire puncture."}
    response = client.post('/incidents/', json=payload)
    assert response.status_code == 201

def test_get_incidents(client):
    """Test retrieving lists of general incidents."""
    response = client.get('/incidents/')
    assert response.status_code == 200
    assert "incidents" in response.json

def test_smp_hazard_scoring_critical(client):
    """Test mathematically calculating risk scores for DGMS SMP (Critical)."""
    payload = {
        "location": "Sector 4B",
        "hazard_description": "Water seepage",
        "probability": 4, # High Probability
        "consequence": 4, # High Consequence
        "control_mechanism": "Install booster pumps immediately"
    }
    response = client.post('/incidents/smp/hazard', json=payload)
    
    assert response.status_code == 201
    assert response.json['calculated_risk_score'] == 16
    assert response.json['requires_immediate_action'] is True

def test_smp_hazard_scoring_minor(client):
    """Test mathematically calculating risk scores for DGMS SMP (Minor)."""
    payload = {
        "location": "Haul Road",
        "hazard_description": "Small rock on side",
        "probability": 2,
        "consequence": 2
    }
    response = client.post('/incidents/smp/hazard', json=payload)
    assert response.status_code == 201
    assert response.json['calculated_risk_score'] == 4
    assert response.json['requires_immediate_action'] is False

def test_smp_dashboard_fetch(client):
    """Test dashboard analytics retrieval for Safety Officer view."""
    response = client.get('/incidents/smp/dashboard')
    assert response.status_code == 200
    assert "active_hazards" in response.json

def test_review_incident(client):
    """Test incident review status update."""
    response = client.put('/incidents/5/review', json={"status": "Closed"})
    assert response.status_code == 200
    assert "reviewed" in response.json['message']

def test_fetch_incident_alerts(client):
    """Ensure the system can fetch broadcasted incident notification logs."""
    response = client.get('/incidents/alerts')
    assert response.status_code == 200
    assert "alerts" in response.json

# --- Worker & Job Task Tests ---

def test_assign_worker_task(client):
    """Ensure supervisors can assign a job to a worker."""
    response = client.post('/tasks/', json={"task_name": "System checks", "priority": "High", "assigned_to": 45})
    assert response.status_code == 201
    assert "assigned" in response.json['message']

def test_fetch_worker_tasks(client):
    """Ensure a worker can fetch their active task list."""
    response = client.get('/tasks/worker/45')
    assert response.status_code == 200
    assert "tasks" in response.json

def test_worker_update_task(client):
    """Ensure a worker can update their task status (e.g., to 'Completed')."""
    response = client.put('/tasks/1/status', json={"status": "Completed"})
    assert response.status_code == 200
