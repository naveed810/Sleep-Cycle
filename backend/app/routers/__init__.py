from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.sleep import router as sleep_router
from app.routers.alarms import router as alarms_router
from app.routers.analytics import router as analytics_router
from app.routers.ai_coach import router as ai_coach_router

__all__ = [
    "auth_router",
    "users_router",
    "sleep_router",
    "alarms_router",
    "analytics_router",
    "ai_coach_router",
]
