from flask import Flask
from flask_cors import CORS
from importlib import import_module
from app.config import Config
from app.extensions import db, jwt
from app.routes.dashboard import dashboard_bp
from app.routes.auth import auth_bp
from app.routes.alerts import alerts_bp
from app.routes.tasks import tasks_bp
from app.routes.shifts import shifts_bp
from app.routes.attendance import attendance_bp
from app.routes.users import users_bp
from app.routes.incidents import incidents_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    database_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if database_uri.startswith("sqlite"):
        with app.app_context():
            import_module("app.models")

            db.create_all()

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(alerts_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(shifts_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(incidents_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
