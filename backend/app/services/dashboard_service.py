from app.models.user import User
from app.models.task import Task
from app.models.incident import Incident
from app.extensions import db

# WORKER DASHBOARD
def get_worker_dashboard(user_id):
    tasks = Task.query.filter_by(assigned_to=user_id).all()

    task_list = [
        {
            "id": t.id,
            "title": t.task_name,
            "status": t.status,
            "priority": t.priority
        }
        for t in tasks
    ]

    return {
        "current_status": {
            "shift_status": "on_shift",  # TODO: from attendance
            "check_in_time": "08:15 AM",
            "zone": "Zone C"
        },
        "tasks": task_list,
        "alerts": []  # TODO: connect alerts table
    }

# SUPERVISOR DASHBOARD
def get_supervisor_dashboard():
    total_workers = User.query.filter_by(role="worker").count()
    total_tasks = Task.query.count()
    open_incidents = Incident.query.filter_by(status="active").count()

    return {
        "team_members": [],  # TODO: fetch workers
        "stats": {
            "total_team": total_workers,
            "active_tasks": total_tasks,
            "open_incidents": open_incidents,
            "attendance": "0/0"
        },
        "incidents": [],
        "tasks": []
    }

# SAFETY OFFICER
def get_safety_dashboard():
    incidents = Incident.query.all()

    return {
        "pending_incidents": [
            {
                "id": i.id,
                "severity": i.severity,
                "status": i.status
            }
            for i in incidents
        ],
        "critical_hazards": [],
        "risk_analysis": []
    }


# ADMIN DASHBOARD
def get_admin_dashboard():
    return {
        "total_users": User.query.count(),
        "total_incidents": Incident.query.count(),
        "system_alerts": [],
        "reports": []
    }

# AUTHORITY DASHBOARD
def get_authority_dashboard():
    return {
        "analytics": {
            "incident_frequency": Incident.query.count(),
            "risk_levels": "medium",
            "efficiency": "80%"
        },
        "reports": []
    }