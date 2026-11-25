from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import oauth2_scheme, decode_access_token
from app.models.user import User
from app.services import auth_service


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    # Synchronize transaction-scoped identity to PostgreSQL Row Level Security (RLS)
    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(
            text("SELECT set_config('app.current_user_id', :user_id, true)"),
            {"user_id": user_id},
        )

    user = auth_service.get_user_by_id(db, user_id=user_id)
    if not user:
        raise credentials_exception

    return user
