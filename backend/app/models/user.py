import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar = Column(
        String(500),
        default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    )
    plan = Column(String(50), default="Celestial Pro")
    streak_days = Column(Integer, default=14)
    member_since = Column(String(50), default="October 2024")

    # Circadian & Environmental Targets
    target_sleep_minutes = Column(Integer, default=480)  # 8 hours
    target_bedtime = Column(String(10), default="23:00")
    target_wake_time = Column(String(10), default="07:00")
    chronotype = Column(String(20), default="bear")  # lion, bear, wolf, dolphin
    room_temp_preference = Column(Float, default=19.0)

    # Preferences & Sensory toggles
    smart_alarm_enabled = Column(Boolean, default=True)
    haptic_feedback = Column(Boolean, default=True)
    snore_detection = Column(Boolean, default=True)
    sound_volume_default = Column(Float, default=0.7)
    wind_down_reminder = Column(Boolean, default=True)
    morning_briefing = Column(Boolean, default=True)
    circadian_alerts = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    sleep_sessions = relationship(
        "SleepSession", back_populates="user", cascade="all, delete-orphan"
    )
    alarms = relationship("Alarm", back_populates="user", cascade="all, delete-orphan")
    sleep_goal = relationship(
        "SleepGoal", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
