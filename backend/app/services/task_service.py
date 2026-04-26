from app.extensions import db
from sqlalchemy import text

#Get tasks for logged-in user
def get_tasks(user_id):
    query = text("""
        SELECT t.id, t.task_name, t.description, t.priority, t.status,
               u.name as assigned_to, t.created_at
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.assigned_to = :user_id
        ORDER BY t.created_at DESC
    """)

    result = db.session.execute(query, {"user_id": user_id}).fetchall()

    return [dict(row._mapping) for row in result]


#Supervisor assigns task
def create_task(task_name, description, priority, assigned_to, assigned_by):
    query = text("""
        INSERT INTO tasks (id, task_name, description, priority, status, assigned_to, assigned_by)
        VALUES (gen_random_uuid(), :task_name, :description, :priority, 'assigned', :assigned_to, :assigned_by)
        RETURNING id
    """)

    result = db.session.execute(query, {
        "task_name": task_name,
        "description": description,
        "priority": priority,
        "assigned_to": assigned_to,
        "assigned_by": assigned_by
    }).fetchone()

    db.session.commit()

    return result[0]


#Update task status (worker)
def update_task_status(task_id, status, user_id):
    query = text("""
        UPDATE tasks
        SET status = :status, updated_at = NOW()
        WHERE id = :task_id AND assigned_to = :user_id
        RETURNING id
    """)

    result = db.session.execute(query, {
        "task_id": task_id,
        "status": status,
        "user_id": user_id
    }).fetchone()

    db.session.commit()

    return result is not None


# Supervisor view all tasks (optional dashboard)
def get_all_tasks():
    query = text("""
        SELECT t.id, t.task_name, t.description, t.priority, t.status, 
               u.name as assigned_to, t.created_at
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.created_at DESC
    """)

    result = db.session.execute(query).fetchall()

    return [dict(row._mapping) for row in result]