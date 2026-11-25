from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.sleep import (
    SleepSessionCreate,
    SleepSessionUpdate,
    SleepSessionResponse,
    SleepSessionListResponse,
    SleepStartRequest,
    SleepFinishRequest,
)
from app.services import sleep_service
from app.routers.deps import get_current_user

router = APIRouter(prefix="/sleep", tags=["Sleep Tracking & History"])


@router.get("/sessions", response_model=SleepSessionListResponse)
def get_sleep_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    start_date: Optional[str] = Query(None, description="Filter from YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Filter to YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve historical sleep records for the authenticated user."""
    sessions = sleep_service.get_sessions(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
    )
    total = sleep_service.count_sessions(db, user_id=current_user.id)
    return SleepSessionListResponse(total=total, sessions=sessions)


@router.post("/sessions", response_model=SleepSessionResponse, status_code=status.HTTP_201_CREATED)
def create_sleep_session(
    req: SleepSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually log a completed night of sleep."""
    session = sleep_service.create_session(db, user_id=current_user.id, req=req)
    return session


@router.get("/today", response_model=Optional[SleepSessionResponse])
def get_today_sleep_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the most recent sleep session for today's readiness card."""
    session = sleep_service.get_today_session(db, user_id=current_user.id)
    return session


@router.get("/sessions/{session_id}", response_model=SleepSessionResponse)
def get_single_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details for a single sleep session."""
    session = sleep_service.get_session_by_id(db, session_id=session_id, user_id=current_user.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep session record not found.",
        )
    return session


@router.put("/sessions/{session_id}", response_model=SleepSessionResponse)
def update_sleep_session(
    session_id: str,
    req: SleepSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update biometric values or notes on a sleep session."""
    session = sleep_service.update_session(
        db, session_id=session_id, user_id=current_user.id, req=req
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep session record not found.",
        )
    return session


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sleep_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a sleep session record."""
    deleted = sleep_service.delete_session(db, session_id=session_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep session record not found.",
        )
    return None


@router.post("/start", response_model=SleepSessionResponse)
def start_active_tracking(
    req: SleepStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Initialize a real-time bedside acoustic tracking session."""
    session = sleep_service.start_tracking_session(db, user_id=current_user.id, tags=req.tags)
    return session


@router.post("/finish", response_model=SleepSessionResponse)
def finish_active_tracking(
    req: SleepFinishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Conclude the active tracking session, calculate sleep cycles, and commit to the sleep bank."""
    session = sleep_service.finish_tracking_session(
        db,
        user_id=current_user.id,
        rating_score=req.rating_score,
        notes=req.notes,
    )
    return session
