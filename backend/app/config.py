import os
from pathlib import Path
from urllib.parse import urlparse
from dotenv import dotenv_values
from sqlalchemy.pool import NullPool

BASE_DIR = Path(__file__).resolve().parent.parent

_file_env = {
    **dotenv_values(BASE_DIR / ".env.local"),
    **dotenv_values(BASE_DIR / ".env"),
}


def _env(name, default=None):
    return os.environ.get(name) or _file_env.get(name) or default


def _env_bool(name, default=False):
    value = _env(name)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _database_url():
    url = _env("DATABASE_URL")
    if not url:
        return url

    url = url.strip()
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


def _engine_options(database_uri):
    options = {"pool_pre_ping": True}
    if not database_uri:
        return options

    parsed = urlparse(database_uri)
    if parsed.scheme.startswith("postgresql"):
        sslmode = _env("DB_SSLMODE")
        host = parsed.hostname or ""
        has_sslmode = "sslmode=" in (parsed.query or "").lower()

        if sslmode and not has_sslmode:
            options["connect_args"] = {"sslmode": sslmode}
        elif ("supabase.co" in host or "supabase.com" in host) and not has_sslmode:
            options["connect_args"] = {"sslmode": "require"}

        if "pooler.supabase.com" in host and parsed.port == 6543:
            options["poolclass"] = NullPool
            options.pop("pool_pre_ping", None)

    return options

class Config:
    SECRET_KEY = _env("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_ENGINE_OPTIONS = _engine_options(SQLALCHEMY_DATABASE_URI)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = _env("JWT_SECRET_KEY")
    AUTO_CREATE_TABLES = _env_bool("AUTO_CREATE_TABLES", True)
