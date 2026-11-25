from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SleepSessionBase(BaseModel):
    date: str = Field(..., description="YYYY-MM-DD")
    day_of_week: str = Field(..., description="Mon, Tue, Wed, Thu, Fri, Sat, Sun")
    bedtime: str = Field(..., description="HH:MM e.g. 23:15")
    wake_time: str = Field(..., description="HH:MM e.g. 07:15")
    duration_minutes: int = Field(..., ge=0, le=1440, description="Total duration in minutes")
    score: int = Field(..., ge=0, le=100, description="Sleep readiness score 0-100")
    efficiency: Optional[int] = Field(90, ge=0, le=100)
    deep_minutes: Optional[int] = Field(0, ge=0)
    rem_minutes: Optional[int] = Field(0, ge=0)
    light_minutes: Optional[int] = Field(0, ge=0)
    awake_minutes: Optional[int] = Field(0, ge=0)
    avg_heart_rate: Optional[int] = Field(55, ge=30, le=160)
    hrv: Optional[int] = Field(70, ge=10, le=250)
    respiratory_rate: Optional[float] = Field(14.2, ge=8.0, le=30.0)
    snore_minutes: Optional[int] = Field(0, ge=0)
    sleep_debt_minutes: Optional[int] = Field(0)
    notes: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)


class SleepSessionCreate(SleepSessionBase):
    pass


class SleepSessionUpdate(BaseModel):
    bedtime: Optional[str] = None
    wake_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    score: Optional[int] = None
    efficiency: Optional[int] = None
    deep_minutes: Optional[int] = None
    rem_minutes: Optional[int] = None
    light_minutes: Optional[int] = None
    awake_minutes: Optional[int] = None
    avg_heart_rate: Optional[int] = None
    hrv: Optional[int] = None
    respiratory_rate: Optional[float] = None
    snore_minutes: Optional[int] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class SleepSessionResponse(SleepSessionBase):
    id: str
    user_id: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class SleepSessionListResponse(BaseModel):
    total: int
    sessions: List[SleepSessionResponse]


class SleepStartRequest(BaseModel):
    tags: Optional[List[str]] = Field(default_factory=list)


class SleepFinishRequest(BaseModel):
    rating_score: int = Field(90, ge=50, le=100)
    notes: Optional[str] = None
