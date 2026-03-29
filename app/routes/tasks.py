from flask import Blueprint, jsonify, request

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/', methods=['POST'])
def assign_task():
    return jsonify({"message": "Task assigned to worker successfully"}), 201

@tasks_bp.route('/worker/<int:worker_id>', methods=['GET'])
def get_worker_tasks(worker_id):
    return jsonify({"tasks": [{"task_name": "Equipment Check", "priority": "High", "status": "Pending"}]}), 200

@tasks_bp.route('/<int:task_id>/status', methods=['PUT'])
def update_task_status(task_id):
    data = request.json
    status = data.get('status', 'Completed')
    return jsonify({"message": f"Task {task_id} status updated to {status}"}), 200
