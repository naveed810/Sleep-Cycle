from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsSummaryResponse, WeeklyReportResponse
from app.services import analytics_service
from app.routers.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Sleep Analytics & Reports"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    period_days: int = Query(7, ge=1, le=365, description="Number of days to aggregate (e.g. 7, 30, 90)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculate aggregated sleep biometrics, stage breakdown, and habit correlations."""
    summary = analytics_service.get_analytics_summary(
        db, user_id=current_user.id, period_days=period_days
    )
    return summary


@router.get("/weekly-report", response_model=WeeklyReportResponse)
def get_weekly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a structured weekly circadian report with best night, lowest night, and clinical guidance."""
    report = analytics_service.get_weekly_report(db, user_id=current_user.id)
    return report
