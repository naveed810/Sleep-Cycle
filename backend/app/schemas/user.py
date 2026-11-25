from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar: Optional[str] = None
    plan: Optional[str] = "Celestial Pro"
    streak_days: Optional[int] = 14
    member_since: Optional[str] = "October 2024"
    target_sleep_minutes: Optional[int] = 480
    target_bedtime: Optional[str] = "23:00"
    target_wake_time: Optional[str] = "07:00"
    chronotype: Optional[str] = "bear"
    room_temp_preference: Optional[float] = 19.0
    smart_alarm_enabled: Optional[bool] = True
    haptic_feedback: Optional[bool] = True
    snore_detection: Optional[bool] = True
    sound_volume_default: Optional[float] = 0.7
    wind_down_reminder: Optional[bool] = True
    morning_briefing: Optional[bool] = True
    circadian_alerts: Optional[bool] = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    target_sleep_minutes: Optional[int] = Field(None, ge=180, le=720)
    target_bedtime: Optional[str] = None
    target_wake_time: Optional[str] = None
    chronotype: Optional[str] = None
    room_temp_preference: Optional[float] = Field(None, ge=14.0, le=26.0)
    smart_alarm_enabled: Optional[bool] = None
    haptic_feedback: Optional[bool] = None
    snore_detection: Optional[bool] = None
    sound_volume_default: Optional[float] = Field(None, ge=0.0, le=1.0)
    wind_down_reminder: Optional[bool] = None
    morning_briefing: Optional[bool] = None
    circadian_alerts: Optional[bool] = None


class UserResponse(UserBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
