from app.extensions import db
import uuid

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.Text)
    status = db.Column(db.Text, default="assigned")

    assigned_to = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"))
    assigned_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, server_default=db.func.now())