from app.extensions import db
from sqlalchemy import text

OPEN_INCIDENT_STATUS = "active"


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
    
    query = text("""
        INSERT INTO incidents (id, reported_by, location, severity, description, status)
        VALUES (gen_random_uuid(), CAST(:reported_by AS uuid), :location, :severity, :description, :status)
        RETURNING id
    """)
    
    result = db.session.execute(query, {
        "reported_by": reporter_id,
        "location": location,
        "severity": severity,
        "description": description,
        "status": OPEN_INCIDENT_STATUS,
    }).fetchone()
    db.session.commit()
    return str(result[0])

def get_all_incidents():
    query = text("""
        SELECT i.id, i.location, i.severity, i.description, i.status, i.created_at, u.name as reporter
        FROM incidents i
        LEFT JOIN users u ON i.reported_by = u.id
        ORDER BY i.created_at DESC
    """)
    result = db.session.execute(query).fetchall()
    return [_normalize_incident_row(row) for row in result]

def get_incidents_by_user(user_id):
    query = text("""
        SELECT id, location, severity, description, status, created_at
        FROM incidents
        WHERE reported_by = :user_id
        ORDER BY created_at DESC
    """)
    result = db.session.execute(query, {"user_id": user_id}).fetchall()
    return [_normalize_incident_row(row) for row in result]

def update_incident_status(incident_id, status):
    query = text("""
        UPDATE incidents
        SET status = :status
        WHERE id = :id
        RETURNING id
    """)
    result = db.session.execute(query, {"id": incident_id, "status": status}).fetchone()
    db.session.commit()
    return result is not None
