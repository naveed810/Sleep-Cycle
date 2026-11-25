from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.alarm import (
    AlarmCreate,
    AlarmUpdate,
    AlarmResponse,
    AlarmListResponse,
)
from app.services import alarm_service
from app.routers.deps import get_current_user

router = APIRouter(prefix="/alarms", tags=["Smart Alarms"])


@router.get("", response_model=AlarmListResponse)
def list_alarms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all smart alarms configured for the authenticated user."""
    alarms = alarm_service.get_alarms(db, user_id=current_user.id)
    return AlarmListResponse(total=len(alarms), alarms=alarms)


@router.post("", response_model=AlarmResponse, status_code=status.HTTP_201_CREATED)
def create_alarm(
    req: AlarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new smart alarm with custom gentle light-phase window."""
    alarm = alarm_service.create_alarm(db, user_id=current_user.id, req=req)
    return alarm


@router.get("/{alarm_id}", response_model=AlarmResponse)
def get_alarm(
    alarm_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details of a single smart alarm."""
    alarm = alarm_service.get_alarm_by_id(db, alarm_id=alarm_id, user_id=current_user.id)
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found.",
        )
    return alarm


@router.put("/{alarm_id}", response_model=AlarmResponse)
def update_alarm(
    alarm_id: str,
    req: AlarmUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update settings on an existing alarm."""
    alarm = alarm_service.update_alarm(
        db, alarm_id=alarm_id, user_id=current_user.id, req=req
    )
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found.",
        )
    return alarm


@router.post("/{alarm_id}/toggle", response_model=AlarmResponse)
def toggle_alarm_state(
    alarm_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle an alarm on or off."""
    alarm = alarm_service.toggle_alarm(db, alarm_id=alarm_id, user_id=current_user.id)
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found.",
        )
    return alarm


@router.delete("/{alarm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alarm(
    alarm_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an alarm configuration."""
    deleted = alarm_service.delete_alarm(db, alarm_id=alarm_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found.",
        )
    return None
