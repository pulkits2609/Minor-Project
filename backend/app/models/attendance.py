from app.extensions import db
import uuid


class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)
    shift_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("shifts.id"), nullable=False)

    date = db.Column(db.Date, server_default=db.func.current_date())
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    status = db.Column(db.Text, default="present")
