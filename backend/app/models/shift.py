from app.extensions import db
import uuid


class Shift(db.Model):
    __tablename__ = "shifts"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    start_time = db.Column(db.Text, nullable=False)
    end_time = db.Column(db.Text, nullable=False)
    location = db.Column(db.Text)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)


class ShiftAssignment(db.Model):
    __tablename__ = "shift_assignments"

    shift_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("shifts.id"), primary_key=True)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), primary_key=True)
