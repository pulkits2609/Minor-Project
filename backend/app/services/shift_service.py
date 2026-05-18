from app.extensions import db
from app.models.shift import Shift, ShiftAssignment
import uuid


def _coerce_uuid(value):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def _shift_to_dict(shift):
    return {
        "id": str(shift.id),
        "start_time": shift.start_time,
        "end_time": shift.end_time,
        "location": shift.location,
        "created_by": str(shift.created_by),
    }

#Create Shift
def create_shift(start_time, end_time, location, supervisor_id):
    shift = Shift(
        start_time=start_time,
        end_time=end_time,
        location=location,
        created_by=_coerce_uuid(supervisor_id),
    )

    db.session.add(shift)
    db.session.commit()
    return str(shift.id)


#Get Shifts
def get_shifts(user_id, role):
    current_user_id = _coerce_uuid(user_id)

    if role == "supervisor":
        shifts = (
            Shift.query
            .filter(Shift.created_by == current_user_id)
            .all()
        )

    else:
        shifts = (
            db.session.query(Shift)
            .join(ShiftAssignment, Shift.id == ShiftAssignment.shift_id)
            .filter(ShiftAssignment.user_id == current_user_id)
            .all()
        )

    return [_shift_to_dict(shift) for shift in shifts]


# Assign Workers
def assign_workers(shift_id, user_ids):
    shift_uuid = _coerce_uuid(shift_id)
    for uid in user_ids:
        user_uuid = _coerce_uuid(uid)
        exists = ShiftAssignment.query.filter_by(shift_id=shift_uuid, user_id=user_uuid).first()
        if not exists:
            db.session.add(ShiftAssignment(shift_id=shift_uuid, user_id=user_uuid))

    db.session.commit()


#Remove Worker
def remove_worker(shift_id, user_id):
    assignment = ShiftAssignment.query.filter_by(
        shift_id=_coerce_uuid(shift_id),
        user_id=_coerce_uuid(user_id),
    ).first()

    if assignment:
        db.session.delete(assignment)

    db.session.commit()


#Update Shift
def update_shift(shift_id, start_time, end_time, location, supervisor_id):
    shift = Shift.query.filter_by(
        id=_coerce_uuid(shift_id),
        created_by=_coerce_uuid(supervisor_id),
    ).first()

    if not shift:
        return False

    shift.start_time = start_time
    shift.end_time = end_time
    shift.location = location

    db.session.commit()
    return True
