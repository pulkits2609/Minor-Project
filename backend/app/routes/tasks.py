from flask import Blueprint, request, jsonify
from app.utils.jwt_handler import verify_token
from app.services.task_service import (
    get_tasks,
    create_task,
    update_task_status,
    get_all_tasks
)

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


#GET TASKS (Worker / Supervisor)
@tasks_bp.route("", methods=["GET"])
def fetch_tasks():
    token_data = verify_token(request)

    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    role = token_data["role"]

    if role == "supervisor":
        tasks = get_all_tasks()
    else:
        tasks = get_tasks(token_data["user_id"])

    return jsonify({
        "status": "success",
        "data": tasks
    })


#CREATE TASK (Supervisor only)
@tasks_bp.route("", methods=["POST"])
def assign_task():
    token_data = verify_token(request)

    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    if token_data["role"] != "supervisor":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    task_name = data.get("task_name")
    description = data.get("description")
    priority = data.get("priority")
    assigned_to = data.get("assigned_to")

    if not all([task_name, priority, assigned_to]):
        return jsonify({"error": "Missing required fields"}), 400

    task_id = create_task(
        task_name,
        description,
        priority,
        assigned_to,
        token_data["user_id"]
    )

    return jsonify({
        "status": "success",
        "task_id": str(task_id)
    })


#UPDATE TASK STATUS (Worker)
@tasks_bp.route("/status", methods=["PATCH"])
def update_status():
    token_data = verify_token(request)

    if "error" in token_data:
        return jsonify({"error": token_data["error"]}), 401

    data = request.get_json()

    task_id = data.get("task_id")
    status = data.get("status")

    if not task_id or not status:
        return jsonify({"error": "task_id and status required"}), 400

    if status not in ["assigned", "in_progress", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    #NEW CHECK
    task = Task.query.filter_by(id=task_id).first()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    #Ownership check
    if task.assigned_to != token_data["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    #Update
    task.status = status
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Task updated successfully"
    })