from app.extensions import db
from datetime import datetime

class Incident(db.Model):
    __tablename__ = 'incidents'
    
    incident_id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(255))
    severity = db.Column(db.String(50))
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default='Open')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class SMPHazardRecord(db.Model):
    """Safety Management Plan (SMP) Hazard Identification as per DGMS guidelines."""
    __tablename__ = 'smp_hazard_records'
    
    hazard_id = db.Column(db.Integer, primary_key=True)
    identified_date = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(255), nullable=False)
    
    # Risk Assessment
    hazard_description = db.Column(db.Text, nullable=False)
    probability = db.Column(db.Integer)        # 1-5 Scale
    consequence = db.Column(db.Integer)        # 1-5 Scale
    risk_score = db.Column(db.Integer)         # probability * consequence
    
    # Mitigation and Responsibility
    control_mechanism = db.Column(db.Text)
    responsibility_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    review_status = db.Column(db.String(50), default='Pending Monitoring')

class AlertMessage(db.Model):
    """Audit log and broadcast mechanism for Incident/Safety Notifications."""
    __tablename__ = 'alert_messages'
    
    alert_id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.incident_id'), nullable=True)
    smp_hazard_id = db.Column(db.Integer, db.ForeignKey('smp_hazard_records.hazard_id'), nullable=True)
    
    message = db.Column(db.Text, nullable=False)
    target_role = db.Column(db.String(50), default='All') # e.g., 'Safety Officer', 'Supervisor', 'All'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
