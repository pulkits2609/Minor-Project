from app.models.user import User

def get_all_workers():
    workers = User.query.filter_by(role="worker").all()

    return [
        {
            "id": str(w.id),
            "name": w.name,
            "email": w.email
        }
        for w in workers
    ]