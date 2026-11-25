from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.goal import SleepGoal
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.goal import SleepGoalResponse, SleepGoalUpdate
from app.services import auth_service
from app.routers.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Profile"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Retrieve the current user's profile and circadian target settings."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    req: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update profile parameters, chronotype, and circadian targets."""
    updated = auth_service.update_user_profile(db, user=current_user, req=req)
    return updated


@router.get("/goals", response_model=SleepGoalResponse)
def get_sleep_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the current user's sleep goals."""
    goal = db.query(SleepGoal).filter(SleepGoal.user_id == current_user.id).first()
    if not goal:
        # Create default goal if missing
        goal = SleepGoal(
            user_id=current_user.id,
            target_duration_minutes=current_user.target_sleep_minutes or 480,
            target_bedtime=current_user.target_bedtime or "23:00",
            target_wake_time=current_user.target_wake_time or "07:00",
            target_consistency_percent=90,
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)
    return goal


@router.put("/goals", response_model=SleepGoalResponse)
def update_sleep_goals(
    req: SleepGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the user's sleep duration and bedtime goals."""
    goal = db.query(SleepGoal).filter(SleepGoal.user_id == current_user.id).first()
    if not goal:
        goal = SleepGoal(user_id=current_user.id)
        db.add(goal)

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    # Sync back to user table
    if req.target_duration_minutes is not None:
        current_user.target_sleep_minutes = req.target_duration_minutes
    if req.target_bedtime is not None:
        current_user.target_bedtime = req.target_bedtime
    if req.target_wake_time is not None:
        current_user.target_wake_time = req.target_wake_time

    db.commit()
    db.refresh(goal)
    return goal
