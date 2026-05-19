from app.extensions import db
import uuid


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)

    type = db.Column(db.Text, default="info")
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.Text, default="info")
    is_read = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
