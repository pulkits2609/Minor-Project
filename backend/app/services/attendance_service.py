from app.extensions import db
from app.models.attendance import Attendance
from app.models.shift import Shift, ShiftAssignment
from app.models.user import User
from datetime import date, datetime
import uuid


def _coerce_uuid(value):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def _attendance_to_dict(attendance, user_name=None):
    return {
        "id": str(attendance.id),
        "user_id": str(attendance.user_id),
        "shift_id": str(attendance.shift_id),
        "user_name": user_name,
        "date": attendance.date,
        "check_in": attendance.check_in,
        "check_out": attendance.check_out,
        "status": attendance.status,
    }


#Check if assigned
def is_assigned(user_id, shift_id):
    return ShiftAssignment.query.filter_by(
        user_id=_coerce_uuid(user_id),
        shift_id=_coerce_uuid(shift_id),
    ).first() is not None


# Check-in
def check_in(user_id, shift_id):
    if not is_assigned(user_id, shift_id):
        return False, "Not assigned to this shift"

    existing = Attendance.query.filter_by(
        user_id=_coerce_uuid(user_id),
        shift_id=_coerce_uuid(shift_id),
        date=date.today(),
    ).first()
    if existing:
        return False, "Already checked in for this shift today"

    record = Attendance(
        user_id=_coerce_uuid(user_id),
        shift_id=_coerce_uuid(shift_id),
        date=date.today(),
        check_in=datetime.utcnow(),
        status="present",
    )

    db.session.add(record)
    db.session.commit()
    return True, None


#Check-out
def check_out(user_id, shift_id):
    record = Attendance.query.filter_by(
        user_id=_coerce_uuid(user_id),
        shift_id=_coerce_uuid(shift_id),
        date=date.today(),
    ).first()

    if not record:
        return False

    now = datetime.utcnow()
    if record.check_in and now <= record.check_in:
        return False

    record.check_out = now

    db.session.commit()
    return True


# Get attendance
def get_attendance(user_id, role):
    current_user_id = _coerce_uuid(user_id)

    if role == "worker":
        rows = (
            db.session.query(Attendance, User.name)
            .join(User, Attendance.user_id == User.id)
            .filter(Attendance.user_id == current_user_id)
            .all()
        )

    else:
        rows = (
            db.session.query(Attendance, User.name)
            .join(User, Attendance.user_id == User.id)
            .join(Shift, Attendance.shift_id == Shift.id)
            .filter(Shift.created_by == current_user_id)
            .all()
        )

    return [_attendance_to_dict(attendance, user_name) for attendance, user_name in rows]
