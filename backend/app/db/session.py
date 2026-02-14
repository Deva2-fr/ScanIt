from sqlmodel import SQLModel, Session, create_engine
from typing import Generator
from app.core.config import get_settings

settings = get_settings()

DATABASE_URL = settings.database_url
if DATABASE_URL.startswith("postgresql+asyncpg"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql")

engine = create_engine(DATABASE_URL, echo=settings.debug)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)
