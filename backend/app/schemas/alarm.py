from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AlarmBase(BaseModel):
    label: str = Field("Gentle Rise", max_length=100)
    time: str = Field(..., description="e.g. 07:00")
    period: str = Field("AM", description="AM or PM")
    days: List[str] = Field(default_factory=lambda: ["Mon", "Tue", "Wed", "Thu", "Fri"])
    enabled: bool = True
    smart_window_minutes: int = Field(20, ge=0, le=60)
    sound_track: str = "forest_dawn"
    vibration: bool = True
    snooze_count: int = 0


class AlarmCreate(AlarmBase):
    pass


class AlarmUpdate(BaseModel):
    label: Optional[str] = None
    time: Optional[str] = None
    period: Optional[str] = None
    days: Optional[List[str]] = None
    enabled: Optional[bool] = None
    smart_window_minutes: Optional[int] = None
    sound_track: Optional[str] = None
    vibration: Optional[bool] = None
    snooze_count: Optional[int] = None


class AlarmResponse(AlarmBase):
    id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)


class AlarmListResponse(BaseModel):
    total: int
    alarms: List[AlarmResponse]
