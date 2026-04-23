from app.extensions import db
from sqlalchemy import text
import uuid

def report_incident(reporter_id, data):
    incident_id = str(uuid.uuid4())
    location = data.get("location")
    severity = data.get("severity", "Medium")
    # Handle mobile's specific fields if sent to /incidents/smp/hazard
    description = data.get("hazard_description") or data.get("description")
    
    query = text("""
        INSERT INTO incidents (id, reported_by, location, severity, description, status)
        VALUES (:id, :reported_by, :location, :severity, :description, 'pending-verification')
        RETURNING id
    """)
    
    db.session.execute(query, {
        "id": incident_id,
        "reported_by": reporter_id,
        "location": location,
        "severity": severity,
        "description": description
    })
    db.session.commit()
    return incident_id

def get_all_incidents():
    query = text("""
        SELECT i.id, i.location, i.severity, i.description, i.status, i.created_at, u.name as reporter
        FROM incidents i
        LEFT JOIN users u ON i.reported_by = u.id
        ORDER BY i.created_at DESC
    """)
    result = db.session.execute(query).fetchall()
    return [dict(row._mapping) for row in result]

def get_incidents_by_user(user_id):
    query = text("""
        SELECT id, location, severity, description, status, created_at
        FROM incidents
        WHERE reported_by = :user_id
        ORDER BY created_at DESC
    """)
    result = db.session.execute(query, {"user_id": user_id}).fetchall()
    return [dict(row._mapping) for row in result]

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
