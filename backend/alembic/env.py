"""
Alembic Environment Configuration
Configured to use SQLModel metadata and read DATABASE_URL from .env
"""
import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Ensure app package is importable ──
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Import settings to get DATABASE_URL from .env ──
from app.core.config import get_settings

# ── Import ALL models so SQLModel.metadata knows about them ──
from sqlmodel import SQLModel
from app.models.user import User          # noqa: F401
from app.models.audit import Audit        # noqa: F401
from app.models.monitor import Monitor    # noqa: F401
from app.models.task import ScanTask      # noqa: F401

# Try optional models (may not exist yet)
try:
    from app.models.lead import Lead      # noqa: F401
except ImportError:
    pass
try:
    from app.models.api_key import ApiKey  # noqa: F401
except ImportError:
    pass

# ── Alembic Config ──
config = context.config

# Override sqlalchemy.url from .env (never hardcode in alembic.ini)
settings = get_settings()
db_url = settings.database_url
if db_url.startswith("postgresql+asyncpg"):
    db_url = db_url.replace("postgresql+asyncpg", "postgresql")
config.set_main_option("sqlalchemy.url", db_url)

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is the MetaData object that Alembic uses for autogenerate
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (SQL script generation)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (direct DB connection)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
