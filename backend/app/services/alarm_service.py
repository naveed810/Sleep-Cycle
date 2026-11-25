import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.alarm import Alarm
from app.schemas.alarm import AlarmCreate, AlarmUpdate


def get_alarms(db: Session, user_id: str) -> List[Alarm]:
    return db.query(Alarm).filter(Alarm.user_id == user_id).all()


def get_alarm_by_id(db: Session, alarm_id: str, user_id: str) -> Optional[Alarm]:
    return db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == user_id).first()


def create_alarm(db: Session, user_id: str, req: AlarmCreate) -> Alarm:
    alarm = Alarm(
        id=str(uuid.uuid4()),
        user_id=user_id,
        label=req.label,
        time=req.time,
        period=req.period,
        days=req.days,
        enabled=req.enabled,
        smart_window_minutes=req.smart_window_minutes,
        sound_track=req.sound_track,
        vibration=req.vibration,
        snooze_count=req.snooze_count,
    )
    db.add(alarm)
    db.commit()
    db.refresh(alarm)
    return alarm


def update_alarm(db: Session, alarm_id: str, user_id: str, req: AlarmUpdate) -> Optional[Alarm]:
    alarm = get_alarm_by_id(db, alarm_id, user_id)
    if not alarm:
        return None

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alarm, field, value)

    db.commit()
    db.refresh(alarm)
    return alarm


def toggle_alarm(db: Session, alarm_id: str, user_id: str) -> Optional[Alarm]:
    alarm = get_alarm_by_id(db, alarm_id, user_id)
    if not alarm:
        return None

    alarm.enabled = not alarm.enabled
    db.commit()
    db.refresh(alarm)
    return alarm


def delete_alarm(db: Session, alarm_id: str, user_id: str) -> bool:
    alarm = get_alarm_by_id(db, alarm_id, user_id)
    if not alarm:
        return False

    db.delete(alarm)
    db.commit()
    return True
