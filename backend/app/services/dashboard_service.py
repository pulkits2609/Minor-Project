from app.models.user import User
from app.models.task import Task
from app.models.incident import Incident

import uuid


OPEN_INCIDENT_STATUSES = ("active", "pending-verification", "assigned")


def _coerce_uuid(value):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def _normalize_incident_status(status):
    if status == "active":
        return "pending-verification"
    return status

# WORKER DASHBOARD
def get_worker_dashboard(user_id):
    from app.models.attendance import Attendance
    from app.models.alert import Alert
    from datetime import date
    worker_id = _coerce_uuid(user_id)
    tasks = (
        Task.query
        .filter(Task.assigned_to == worker_id)
        .order_by(Task.created_at.desc())
        .all()
    )
    task_list = [
        {
            "id": str(t.id),
            "title": t.task_name,
            "status": t.status,
            "priority": t.priority
        }
        for t in tasks
    ]
    # Real attendance data
    today_attendance = (
        Attendance.query
        .filter(Attendance.user_id == worker_id, Attendance.date == date.today())
        .first()
    )
    if today_attendance and today_attendance.check_in:
        shift_status = "checked_out" if today_attendance.check_out else "on_shift"
        check_in_time = today_attendance.check_in.strftime("%I:%M %p")
    else:
        shift_status = "off_shift"
        check_in_time = None
    # Real alerts
    alerts_list = (
        Alert.query
        .filter(Alert.user_id == worker_id, Alert.is_read == False)
        .order_by(Alert.created_at.desc())
        .limit(10)
        .all()
    )
    return {
        "current_status": {
            "shift_status": shift_status,
            "check_in_time": check_in_time,
            "zone": today_attendance.shift_id if today_attendance else None  # TODO: get zone from shift
        },
        "tasks": task_list,
        "alerts": [
            {
                "id": str(a.id),
                "type": a.type,
                "message": a.message,
                "severity": a.severity,
                "created_at": a.created_at,
            }
            for a in alerts_list
        ]
    }

# SUPERVISOR DASHBOARD
def get_supervisor_dashboard():
    from app.models.attendance import Attendance
    from datetime import date
    total_workers = User.query.filter_by(role="worker").count()
    total_tasks = Task.query.count()
    open_incidents_list = Incident.query.filter(Incident.status.in_(OPEN_INCIDENT_STATUSES)).all()
    today_present = Attendance.query.filter(Attendance.date == date.today()).distinct(Attendance.user_id).count()
    return {
        "team_members": [],  # TODO: fetch workers
        "stats": {
            "total_team": total_workers,
            "active_tasks": total_tasks,
            "open_incidents": len(open_incidents_list),
            "attendance": f"{today_present}/{total_workers}"
        },
        "incidents": [
            {
                "id": str(i.id),
                "description": i.description,
                "status": _normalize_incident_status(i.status),
                "severity": i.severity
            }
            for i in open_incidents_list
        ],
        "tasks": []
    }

# SAFETY OFFICER
def get_safety_dashboard():
    incidents = Incident.query.order_by(Incident.created_at.desc()).limit(10).all()

    return {
        "pending_incidents": [
            {
                "id": str(i.id),
                "severity": i.severity,
                "status": _normalize_incident_status(i.status),
                "description": i.description,
                "location": i.location
            }
            for i in incidents
        ],
        "critical_hazards": [
            {
                "id": str(i.id),
                "description": i.description,
                "location": i.location
            }
            for i in incidents if i.severity.lower() == "critical"
        ],
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
