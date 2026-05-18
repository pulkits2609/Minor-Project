from app.extensions import db
from app.models.incident import Incident
from app.models.user import User
import uuid

OPEN_INCIDENT_STATUS = "active"


def _coerce_uuid(value):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def _normalize_incident_status(status):
    if status == OPEN_INCIDENT_STATUS:
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
    if status == "pending-verification":
        return OPEN_INCIDENT_STATUS
    return status


def _normalize_incident_row(row):
    item = dict(row._mapping)
    if item.get("status") == OPEN_INCIDENT_STATUS:
        item["status"] = "pending-verification"
    return item


def report_incident(reporter_id, data):
    location = data.get("location")
    severity = data.get("severity", "Medium")
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
