from app.extensions import db
import uuid

class Incident(db.Model):
    __tablename__ = "incidents"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reported_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"))

    location = db.Column(db.Text)
    severity = db.Column(db.Text)
    description = db.Column(db.Text)

    status = db.Column(db.Text, default="active")

    created_at = db.Column(db.DateTime, server_default=db.func.now())