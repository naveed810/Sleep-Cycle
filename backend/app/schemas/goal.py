from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SleepGoalBase(BaseModel):
    target_duration_minutes: int = Field(480, ge=180, le=720)
    target_bedtime: str = Field("23:00", description="HH:MM")
    target_wake_time: str = Field("07:00", description="HH:MM")
    target_consistency_percent: int = Field(90, ge=50, le=100)


class SleepGoalCreate(SleepGoalBase):
    pass


class SleepGoalUpdate(BaseModel):
    target_duration_minutes: Optional[int] = Field(None, ge=180, le=720)
    target_bedtime: Optional[str] = None
    target_wake_time: Optional[str] = None
    target_consistency_percent: Optional[int] = Field(None, ge=50, le=100)


class SleepGoalResponse(SleepGoalBase):
    id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)
