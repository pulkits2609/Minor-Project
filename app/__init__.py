from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, ma

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)

    # Basic route to verify server is running
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "service": "Coal Mine Management API"})

    # Register blueprints 
    from app.routes.auth import auth_bp
    from app.routes.shifts import shifts_bp
    from app.routes.incidents import incidents_bp
    from app.routes.tasks import tasks_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(shifts_bp, url_prefix='/shifts')
    app.register_blueprint(incidents_bp, url_prefix='/incidents')
    app.register_blueprint(tasks_bp, url_prefix='/tasks')

    return app
