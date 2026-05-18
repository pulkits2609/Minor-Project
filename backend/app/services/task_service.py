from app.extensions import db
from app.models.task import Task
from app.models.user import User
import uuid


def _coerce_uuid(value):
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(str(value))


def _task_to_dict(task, assigned_to=None):
    return {
        "id": str(task.id),
        "task_name": task.task_name,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "assigned_to": assigned_to if assigned_to is not None else str(task.assigned_to),
        "assigned_by": str(task.assigned_by) if task.assigned_by else None,
        "created_at": task.created_at,
    }

#Get tasks for logged-in user
def get_tasks(user_id):
    worker_id = _coerce_uuid(user_id)
    tasks = (
        Task.query
        .filter(Task.assigned_to == worker_id)
        .order_by(Task.created_at.desc())
        .all()
    )

    return [_task_to_dict(task) for task in tasks]


#Supervisor assigns task
def create_task(task_name, description, priority, assigned_to, assigned_by):
    task = Task(
        task_name=task_name,
        description=description,
        priority=priority,
        status="assigned",
        assigned_to=_coerce_uuid(assigned_to),
        assigned_by=_coerce_uuid(assigned_by),
    )

    db.session.add(task)
    db.session.commit()

    return str(task.id)


#Update task status (worker)
def update_task_status(task_id, status, user_id):
    task = (
        Task.query
        .filter(Task.id == _coerce_uuid(task_id))
        .filter(Task.assigned_to == _coerce_uuid(user_id))
        .first()
    )

    if not task:
        return False

    task.status = status
    db.session.commit()

    return True


# Supervisor view all tasks (optional dashboard)
def get_all_tasks():
    rows = (
        db.session.query(Task, User.name)
        .outerjoin(User, Task.assigned_to == User.id)
        .order_by(Task.created_at.desc())
        .all()
    )

    return [_task_to_dict(task, assignee_name) for task, assignee_name in rows]
