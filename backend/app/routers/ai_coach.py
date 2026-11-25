from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.models.user import User
from app.schemas.ai_coach import (
    CoachChatRequest,
    CoachChatResponse,
    ChronotypeSchedule,
    BedtimeCalculatorRequest,
    BedtimeCalculatorResponse,
)
from app.services import ai_coach_service
from app.routers.deps import get_current_user

router = APIRouter(prefix="/coach", tags=["AI Sleep Coach"])


@router.post("/chat", response_model=CoachChatResponse)
async def chat_with_coach(
    req: CoachChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Interact with Somna AI for personalized, neurobiologically grounded sleep guidance."""
    response = await ai_coach_service.generate_coach_response(
        user=current_user,
        message=req.message,
        context_tags=req.context_tags,
    )
    return response


@router.get("/chronotype-schedule", response_model=ChronotypeSchedule)
def get_chronotype_schedule(
    chronotype: Optional[str] = Query(None, description="lion, bear, wolf, dolphin"),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the ideal 24-hour circadian schedule based on the user's or requested chronotype."""
    target_chrono = chronotype or current_user.chronotype or "bear"
    schedule = ai_coach_service.get_chronotype_schedule(target_chrono)
    return schedule


@router.post("/calculate-bedtime", response_model=BedtimeCalculatorResponse)
def calculate_bedtime(
    req: BedtimeCalculatorRequest,
    current_user: User = Depends(get_current_user),
):
    """Calculate mathematically ideal lights-out bedtime options based on 90-minute ultradian sleep cycles."""
    return ai_coach_service.calculate_bedtimes(
        wake_time_str=req.wake_time,
        latency_minutes=req.sleep_latency_minutes or 15,
        desired_cycles=req.desired_cycles or 5,
    )
