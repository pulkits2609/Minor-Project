from app.extensions import db
from app.models.alert import Alert
from app.models.user import User
import uuid


def _coerce_uuid(value):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def _alert_to_dict(alert):
    return {
        "id": str(alert.id),
        "type": alert.type,
        "message": alert.message,
        "severity": alert.severity,
        "is_read": alert.is_read,
        "created_at": alert.created_at,
    }

#Get alerts for user
def get_alerts(user_id):
    alerts = (
        Alert.query
        .filter(Alert.user_id == _coerce_uuid(user_id))
        .order_by(Alert.created_at.desc())
        .all()
    )

    return [_alert_to_dict(alert) for alert in alerts]


#Mark alert as read
def mark_alert_read(alert_id, user_id):
    alert = (
        Alert.query
        .filter(Alert.id == _coerce_uuid(alert_id))
        .filter(Alert.user_id == _coerce_uuid(user_id))
        .first()
    )

    if not alert:
        return False

    alert.is_read = True
    db.session.commit()

    return True


#Emergency alert (broadcast)
def create_emergency_alert(message, severity="high"):
    users = User.query.all()
    for user in users:
        db.session.add(Alert(
            user_id=user.id,
            type="emergency",
            message=message,
            severity=severity,
            is_read=False,
        ))

    db.session.commit()

    return True
