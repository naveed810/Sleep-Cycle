import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    label = Column(String(100), default="Gentle Rise")
    time = Column(String(10), nullable=False)  # "07:00"
    period = Column(String(5), default="AM")  # "AM" or "PM"
    days = Column(JSON, default=list)  # ["Mon", "Tue", "Wed", "Thu", "Fri"]
    enabled = Column(Boolean, default=True)
    smart_window_minutes = Column(Integer, default=20)  # 10, 20, 30
    sound_track = Column(String(50), default="forest_dawn")
    vibration = Column(Boolean, default=True)
    snooze_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="alarms")
