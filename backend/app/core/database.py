from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Engine configuration depending on DB backend
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    # Supabase PostgreSQL configuration with robust connection pooling
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300,
        connect_args={"connect_timeout": 10},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """Create database tables only if absent on application startup."""
    # Ensure all models are imported before checking tables
    import app.models  # noqa: F401
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
    except Exception as e:
        print(f"[Database] Warning: Could not initialize tables on startup: {e}")
