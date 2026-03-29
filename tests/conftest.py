import os
import pytest
from app import create_app
from app.extensions import db
from app.config import Config

class TestConfig(Config):
    TESTING = True
    # Use SQLite memory DB for temporary runtime testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    SECRET_KEY = 'test-secret'
    JWT_SECRET_KEY = 'test-jwt-secret'

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app(TestConfig)

    # Establish an application context before running the tests.
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()
