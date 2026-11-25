import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class SleepSession(Base):
    __tablename__ = "sleep_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    day_of_week = Column(String(10), nullable=False)  # Mon, Tue, etc.
    bedtime = Column(String(10), nullable=False)  # "23:15"
    wake_time = Column(String(10), nullable=False)  # "07:15"
    duration_minutes = Column(Integer, nullable=False)  # Total sleep minutes
    score = Column(Integer, nullable=False)  # 0 - 100
    efficiency = Column(Integer, default=90)  # Percentage

    # Stage breakdowns (in minutes)
    deep_minutes = Column(Integer, default=0)
    rem_minutes = Column(Integer, default=0)
    light_minutes = Column(Integer, default=0)
    awake_minutes = Column(Integer, default=0)

    # Biometrics
    avg_heart_rate = Column(Integer, default=55)  # bpm
    hrv = Column(Integer, default=70)  # ms
    respiratory_rate = Column(Float, default=14.2)  # br/min
    snore_minutes = Column(Integer, default=5)
    sleep_debt_minutes = Column(Integer, default=0)  # vs 480m target

    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)  # ["Chamomile", "Dim lights", "Cool room"]
    is_active = Column(Boolean, default=False)  # True if session is currently being recorded

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="sleep_sessions")
