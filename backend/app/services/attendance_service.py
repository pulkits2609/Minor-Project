from app.extensions import db
from sqlalchemy import text
from datetime import date


#Check if assigned
def is_assigned(user_id, shift_id):
    result = db.session.execute(text("""
        SELECT 1 FROM shift_assignments
        WHERE user_id = :user_id AND shift_id = :shift_id
    """), {"user_id": user_id, "shift_id": shift_id}).fetchone()

    return result is not None


# Check-in
def check_in(user_id, shift_id):
    if not is_assigned(user_id, shift_id):
        return False, "Not assigned to this shift"

    db.session.execute(text("""
        INSERT INTO attendance (id, user_id, shift_id, date, check_in, status)
        VALUES (gen_random_uuid(), :user_id, :shift_id, CURRENT_DATE, NOW(), 'present')
    """), {"user_id": user_id, "shift_id": shift_id})

    db.session.commit()
    return True, None


#Check-out
def check_out(user_id, shift_id):
    db.session.execute(text("""
        UPDATE attendance
        SET check_out = NOW()
        WHERE user_id = :user_id
        AND shift_id = :shift_id
        AND date = CURRENT_DATE
    """), {"user_id": user_id, "shift_id": shift_id})

    db.session.commit()
    return True


# Get attendance
def get_attendance(user_id, role):
    if role == "worker":
        query = text("""
            SELECT a.*, u.name as user_name
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = :user_id
        """)
        result = db.session.execute(query, {"user_id": user_id}).fetchall()

    else:
        query = text("""
            SELECT a.*, u.name as user_name
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            JOIN shifts s ON a.shift_id = s.id
            WHERE s.created_by = :user_id
        """)
        result = db.session.execute(query, {"user_id": user_id}).fetchall()

    return [dict(row._mapping) for row in result]