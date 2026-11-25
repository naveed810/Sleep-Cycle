from typing import List, Optional
from pydantic import BaseModel


class StageBreakdown(BaseModel):
    deep_percent: int
    rem_percent: int
    light_percent: int
    awake_percent: int
    deep_minutes: int
    rem_minutes: int
    light_minutes: int
    awake_minutes: int


class HabitCorrelation(BaseModel):
    habit: str
    impact_metric: str
    delta_display: str
    scientific_rationale: str


class AnalyticsSummaryResponse(BaseModel):
    period_days: int
    total_sessions: int
    average_score: int
    average_duration_hours: float
    average_efficiency_percent: int
    average_resting_hr: int
    average_hrv: int
    circadian_regularity_percent: int
    net_sleep_debt_minutes: int
    stage_breakdown: StageBreakdown
    habit_correlations: List[HabitCorrelation]


class DailyReportItem(BaseModel):
    date: str
    day_of_week: str
    score: int
    duration_hours: float
    bedtime: str
    wake_time: str
    efficiency: int


class WeeklyReportResponse(BaseModel):
    week_start: str
    week_end: str
    total_nights_logged: int
    average_score: int
    average_duration_hours: float
    consistency_score: int
    best_night: Optional[DailyReportItem] = None
    lowest_night: Optional[DailyReportItem] = None
    clinical_recommendation: str
    daily_breakdown: List[DailyReportItem]
