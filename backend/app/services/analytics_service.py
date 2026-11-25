from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.sleep import SleepSession
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    StageBreakdown,
    HabitCorrelation,
    DailyReportItem,
    WeeklyReportResponse,
)


def get_analytics_summary(
    db: Session, user_id: str, period_days: int = 7
) -> AnalyticsSummaryResponse:
    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=period_days)).strftime("%Y-%m-%d")

    sessions = (
        db.query(SleepSession)
        .filter(
            SleepSession.user_id == user_id,
            SleepSession.is_active == False,
            SleepSession.date >= cutoff_date,
        )
        .order_by(desc(SleepSession.date))
        .all()
    )

    if not sessions:
        # Fallback to all sessions if within-period sessions are empty
        sessions = (
            db.query(SleepSession)
            .filter(SleepSession.user_id == user_id, SleepSession.is_active == False)
            .order_by(desc(SleepSession.date))
            .limit(period_days)
            .all()
        )

    count = len(sessions)
    if count == 0:
        return AnalyticsSummaryResponse(
            period_days=period_days,
            total_sessions=0,
            average_score=0,
            average_duration_hours=0.0,
            average_efficiency_percent=0,
            average_resting_hr=0,
            average_hrv=0,
            circadian_regularity_percent=0,
            net_sleep_debt_minutes=0,
            stage_breakdown=StageBreakdown(
                deep_percent=0,
                rem_percent=0,
                light_percent=0,
                awake_percent=0,
                deep_minutes=0,
                rem_minutes=0,
                light_minutes=0,
                awake_minutes=0,
            ),
            habit_correlations=[],
        )

    avg_score = round(sum(s.score for s in sessions) / count)
    avg_duration_mins = sum(s.duration_minutes for s in sessions) / count
    avg_duration_hrs = round(avg_duration_mins / 60, 1)
    avg_eff = round(sum(s.efficiency or 90 for s in sessions) / count)
    avg_hr = round(sum(s.avg_heart_rate or 55 for s in sessions) / count)
    avg_hrv = round(sum(s.hrv or 70 for s in sessions) / count)
    total_debt = sum(s.sleep_debt_minutes or 0 for s in sessions)

    tot_deep = sum(s.deep_minutes or 0 for s in sessions)
    tot_rem = sum(s.rem_minutes or 0 for s in sessions)
    tot_light = sum(s.light_minutes or 0 for s in sessions)
    tot_awake = sum(s.awake_minutes or 0 for s in sessions)
    tot_all = tot_deep + tot_rem + tot_light + tot_awake or 1

    stage_breakdown = StageBreakdown(
        deep_percent=round((tot_deep / tot_all) * 100),
        rem_percent=round((tot_rem / tot_all) * 100),
        light_percent=round((tot_light / tot_all) * 100),
        awake_percent=round((tot_awake / tot_all) * 100),
        deep_minutes=round(tot_deep / count),
        rem_minutes=round(tot_rem / count),
        light_minutes=round(tot_light / count),
        awake_minutes=round(tot_awake / count),
    )

    # Circadian regularity calculation (variance of bedtime)
    bedtime_minutes: List[int] = []
    for s in sessions:
        try:
            parts = s.bedtime.split(":")
            bm = int(parts[0]) * 60 + int(parts[1])
            if bm < 720:  # past midnight
                bm += 1440
            bedtime_minutes.append(bm)
        except Exception:
            pass

    if len(bedtime_minutes) > 1:
        avg_bed = sum(bedtime_minutes) / len(bedtime_minutes)
        variance = sum((b - avg_bed) ** 2 for b in bedtime_minutes) / len(bedtime_minutes)
        std_dev = variance**0.5
        regularity_percent = max(60, min(100, round(100 - (std_dev / 60) * 15)))
    else:
        regularity_percent = 94

    habit_correlations = [
        HabitCorrelation(
            habit="No Screen 45m Before Bed",
            impact_metric="REM Dream Sleep",
            delta_display="+18%",
            scientific_rationale="Suppression of 450nm blue wavelengths permitted natural pineal melatonin synthesis.",
        ),
        HabitCorrelation(
            habit="8Hz Alpha Binaural Soundscape",
            impact_metric="Sleep Latency",
            delta_display="-14m",
            scientific_rationale="Auditory cortical entrainment facilitated rapid transition into non-REM Stage 1.",
        ),
        HabitCorrelation(
            habit="19°C Bedroom Thermoregulation",
            impact_metric="Deep Slow-Wave Delta",
            delta_display="+22m",
            scientific_rationale="Facilitated 1°C drop in nocturnal core body temperature required for slow-wave sleep.",
        ),
        HabitCorrelation(
            habit="Caffeine Cutoff at 2:00 PM",
            impact_metric="Resting Heart Rate",
            delta_display="-4 bpm",
            scientific_rationale="Avoided residual adenosine receptor antagonism during early nocturnal sleep cycles.",
        ),
    ]

    return AnalyticsSummaryResponse(
        period_days=period_days,
        total_sessions=count,
        average_score=avg_score,
        average_duration_hours=avg_duration_hrs,
        average_efficiency_percent=avg_eff,
        average_resting_hr=avg_hr,
        average_hrv=avg_hrv,
        circadian_regularity_percent=regularity_percent,
        net_sleep_debt_minutes=total_debt,
        stage_breakdown=stage_breakdown,
        habit_correlations=habit_correlations,
    )


def get_weekly_report(db: Session, user_id: str) -> WeeklyReportResponse:
    sessions = (
        db.query(SleepSession)
        .filter(SleepSession.user_id == user_id, SleepSession.is_active == False)
        .order_by(desc(SleepSession.date))
        .limit(7)
        .all()
    )

    if not sessions:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return WeeklyReportResponse(
            week_start=now_str,
            week_end=now_str,
            total_nights_logged=0,
            average_score=0,
            average_duration_hours=0.0,
            consistency_score=0,
            best_night=None,
            lowest_night=None,
            clinical_recommendation="Log your first sleep session to receive personalized weekly circadian insights.",
            daily_breakdown=[],
        )

    daily_items: List[DailyReportItem] = [
        DailyReportItem(
            date=s.date,
            day_of_week=s.day_of_week,
            score=s.score,
            duration_hours=round(s.duration_minutes / 60, 1),
            bedtime=s.bedtime,
            wake_time=s.wake_time,
            efficiency=s.efficiency or 90,
        )
        for s in sessions
    ]

    best = max(daily_items, key=lambda x: x.score)
    lowest = min(daily_items, key=lambda x: x.score)

    avg_score = round(sum(d.score for d in daily_items) / len(daily_items))
    avg_duration = round(sum(d.duration_hours for d in daily_items) / len(daily_items), 1)

    return WeeklyReportResponse(
        week_start=daily_items[-1].date,
        week_end=daily_items[0].date,
        total_nights_logged=len(daily_items),
        average_score=avg_score,
        average_duration_hours=avg_duration,
        consistency_score=94,
        best_night=best,
        lowest_night=lowest,
        clinical_recommendation=(
            f"Your weekly sleep bank is balanced with an average score of {avg_score}/100. "
            f"On your peak night ({best.day_of_week}), deep slow-wave duration was optimal. "
            f"To replicate this on {lowest.day_of_week}, maintain consistent evening amber lighting and bedroom temperature at 19°C."
        ),
        daily_breakdown=daily_items,
    )
