from flask import Flask
from app.config import Config
from app.extensions import db, jwt
from app.routes.dashboard import dashboard_bp
from app.routes.auth import auth_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api")

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app