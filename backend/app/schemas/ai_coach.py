from typing import List, Optional
from pydantic import BaseModel, Field


class CoachChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    context_tags: Optional[List[str]] = Field(default_factory=list)


class CoachChatResponse(BaseModel):
    reply: str
    citation: Optional[str] = None
    action_items: List[str] = Field(default_factory=list)
    provider: str


class ChronotypeSchedule(BaseModel):
    chronotype: str
    title: str
    description: str
    wake_time: str
    morning_sunlight: str
    peak_focus_window: str
    caffeine_cutoff: str
    wind_down_start: str
    optimal_bedtime: str


class BedtimeCalculatorRequest(BaseModel):
    wake_time: str = Field("07:00", description="HH:MM e.g. 07:00")
    sleep_latency_minutes: Optional[int] = Field(15, ge=5, le=60)
    desired_cycles: Optional[int] = Field(5, ge=3, le=7, description="90-minute sleep cycles")


class BedtimeOption(BaseModel):
    cycles: int
    duration_hours: float
    lights_out_time: str
    wind_down_time: str
    feel_profile: str


class BedtimeCalculatorResponse(BaseModel):
    wake_time: str
    options: List[BedtimeOption]
    circadian_note: str
