from app.extensions import db
from app.models.incident import Incident
from app.models.user import User
from app.models.task import Task
import uuid

OPEN_INCIDENT_STATUS = "pending-verification"
LEGACY_OPEN_INCIDENT_STATUS = "active"


def _coerce_uuid(value):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def _normalize_incident_status(status):
    if status == LEGACY_OPEN_INCIDENT_STATUS:
        return "pending-verification"
    return status


def _incident_to_dict(incident, reporter=None):
    item = {
        "id": str(incident.id),
        "location": incident.location,
        "severity": incident.severity,
        "description": incident.description,
        "status": _normalize_incident_status(incident.status),
        "created_at": incident.created_at,
    }
    if reporter is not None:
        item["reporter"] = reporter
    return item


def _status_for_db(status):
    if status == LEGACY_OPEN_INCIDENT_STATUS:
        return OPEN_INCIDENT_STATUS
    return status


def report_incident(reporter_id, data):
    location = data.get("location")
    severity = str(data.get("severity", "medium")).strip().lower()
    # Handle mobile's specific fields if sent to /incidents/smp/hazard
    description = data.get("hazard_description") or data.get("description")

    incident = Incident(
        reported_by=_coerce_uuid(reporter_id),
        location=location,
        severity=severity,
        description=description,
        status=OPEN_INCIDENT_STATUS,
    )
    db.session.add(incident)
    db.session.commit()
    # Auto-alert for critical/high severity incidents
    if severity in ("critical", "high"):
        from app.services.alert_service import create_emergency_alert
        alert_msg = f"{'🚨 CRITICAL' if severity == 'critical' else '⚠️ HIGH'} incident reported at {location}: {description}"
        try:
            create_emergency_alert(alert_msg, severity=severity)
        except Exception:
            pass  # Don't fail the incident report if alert creation fails
    return str(incident.id)

def get_all_incidents():
    rows = (
        db.session.query(Incident, User.name)
        .outerjoin(User, Incident.reported_by == User.id)
        .order_by(Incident.created_at.desc())
        .all()
    )
    return [_incident_to_dict(incident, reporter) for incident, reporter in rows]

def get_incidents_by_user(user_id):
    incidents = (
        Incident.query.filter(Incident.reported_by == _coerce_uuid(user_id))
        .order_by(Incident.created_at.desc())
        .all()
    )
    return [_incident_to_dict(incident) for incident in incidents]

def update_incident_status(incident_id, status):
    incident = Incident.query.filter_by(id=_coerce_uuid(incident_id)).first()
    if not incident:
        return False

    incident.status = _status_for_db(status)
    db.session.commit()
    return True

def _task_to_dict(task):
    return {
        "id": str(task.id),
        "task_name": task.task_name,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "assigned_to": str(task.assigned_to) if task.assigned_to else None,
        "assigned_by": str(task.assigned_by) if task.assigned_by else None,
        "incident_id": str(task.incident_id) if getattr(task, "incident_id", None) else None,
        "created_at": task.created_at,
    }


def review_incident(incident_id, approved):
    incident = Incident.query.filter_by(id=_coerce_uuid(incident_id)).first()
    if not incident:
        return None, "Incident not found"

    current_status = _normalize_incident_status(incident.status)
    if current_status not in {"pending-verification", "active"}:
        return None, f"Incident cannot be reviewed in '{current_status}' state"

    incident.status = "reviewed" if approved else "rejected"
    db.session.commit()

    reporter = User.query.filter_by(id=incident.reported_by).first()
    return _incident_to_dict(incident, reporter.name if reporter else None), None


def assign_task_from_incident(
    incident_id,
    worker_id,
    assigned_by,
    task_name=None,
    description=None,
    priority="medium",
):
    incident = Incident.query.filter_by(id=_coerce_uuid(incident_id)).first()
    if not incident:
        return None, "Incident not found"

    if _normalize_incident_status(incident.status) != "reviewed":
        return None, "Incident must be reviewed before assignment"

    worker = User.query.filter_by(id=_coerce_uuid(worker_id)).first()
    if not worker:
        return None, "Worker not found"

    if worker.role != "worker":
        return None, "Assigned user must be a worker"

    task = Task(
        task_name=task_name or f"Incident response: {incident.location or 'Unknown location'}",
        description=description or incident.description,
        priority=priority or "medium",
        status="assigned",
        assigned_to=worker.id,
        assigned_by=_coerce_uuid(assigned_by),
        incident_id=incident.id,
    )

    incident.status = "assigned"
    db.session.add(task)
    db.session.commit()

    return {
        "task_id": str(task.id),
        "incident_id": str(incident.id),
    }, None


def get_incident_details(incident_id):
    incident = Incident.query.filter_by(id=_coerce_uuid(incident_id)).first()
    if not incident:
        return None

    reporter = User.query.filter_by(id=incident.reported_by).first()
    tasks = (
        Task.query
        .filter(Task.incident_id == incident.id)
        .order_by(Task.created_at.desc())
        .all()
    )

    return {
        **_incident_to_dict(incident, reporter.name if reporter else None),
        "tasks": [_task_to_dict(task) for task in tasks],
    }